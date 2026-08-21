import { extractText, getMeta } from 'unpdf';
import zlib from 'zlib';

/**
 * Decodes PDF hex string or UTF-16BE / UTF-8 text
 */
function decodePdfHexString(hex: string): string {
  const cleanHex = hex.replace(/\s+/g, '');
  if (cleanHex.length % 2 !== 0 || cleanHex.length === 0) return '';
  try {
    const buf = Buffer.from(cleanHex, 'hex');
    // UTF-16BE with BOM
    if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
      return buf.subarray(2).swap16().toString('utf16le');
    }
    // Check if it's UTF-16BE without BOM
    if (buf.length >= 2 && buf.length % 2 === 0) {
      let isUtf16 = false;
      for (let i = 0; i < buf.length; i += 2) {
        if (buf[i] >= 0xac && buf[i] <= 0xd7) {
          isUtf16 = true;
          break;
        }
      }
      if (isUtf16) {
        return buf.swap16().toString('utf16le');
      }
    }
    return buf.toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * Decodes PDF literal string with octal escapes
 */
function decodePdfLiteralString(str: string): string {
  if (str.startsWith('\xFE\xFF') || str.startsWith('\\376\\377')) {
    const rawBytes: number[] = [];
    let i = str.startsWith('\\376\\377') ? 8 : 2;
    while (i < str.length) {
      if (str[i] === '\\' && i + 3 < str.length && /[0-7]{3}/.test(str.substring(i + 1, i + 4))) {
        rawBytes.push(parseInt(str.substring(i + 1, i + 4), 8));
        i += 4;
      } else {
        rawBytes.push(str.charCodeAt(i));
        i++;
      }
    }
    if (rawBytes.length >= 2) {
      const buf = Buffer.from(rawBytes);
      return buf.swap16().toString('utf16le');
    }
  }

  return str.replace(/\\([0-7]{1,3})/g, (_, oct) => {
    const code = parseInt(oct, 8);
    return String.fromCharCode(code);
  })
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\([()\\])/g, '$1');
}

/**
 * Fallback stream parser in case PDF.js fails on non-standard stream formats
 */
function parseStreamsFallback(rawString: string): string {
  const textSegments: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRegex.exec(rawString)) !== null) {
    const streamContent = streamMatch[1];
    const streamBuf = Buffer.from(streamContent, 'binary');

    let decompressed: string | null = null;
    try {
      const unzipped = zlib.inflateSync(streamBuf);
      decompressed = unzipped.toString('binary');
    } catch {
      try {
        const unzipped = zlib.inflateRawSync(streamBuf);
        decompressed = unzipped.toString('binary');
      } catch {
        decompressed = streamContent;
      }
    }

    if (decompressed) {
      // TJ match
      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
      let match: RegExpExecArray | null;
      while ((match = tjArrayRegex.exec(decompressed)) !== null) {
        let line = '';
        const itemRegex = /\(([\s\S]*?)(?<!\\)\)|<([0-9a-fA-F\s]+)>/g;
        let itemMatch: RegExpExecArray | null;
        while ((itemMatch = itemRegex.exec(match[1])) !== null) {
          if (itemMatch[1] !== undefined) {
            line += decodePdfLiteralString(itemMatch[1]);
          } else if (itemMatch[2] !== undefined) {
            line += decodePdfHexString(itemMatch[2]);
          }
        }
        const tr = line.trim();
        if (tr) textSegments.push(tr);
      }
    }
  }

  return textSegments.join('\n');
}

/**
 * Cleans and normalizes extracted PDF text
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Replace null bytes and non-printable control chars except newlines/tabs
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove PDF syntax artifacts if any leaked
    .replace(/%PDF-[\d\.]+/g, '')
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/g, '')
    .replace(/<<[\s\S]*?>>/g, '')
    .replace(/stream[\s\S]*?endstream/g, '')
    .replace(/xref[\s\S]*?%%EOF/g, '')
    // Collapse single-char isolated lines (artifact of vertical glyph positioning in some printer drivers)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .reduce((acc: string[], curr: string) => {
      // If current line is very short and previous line was also short or bullet point, merge them intelligently
      if (acc.length > 0) {
        const last = acc[acc.length - 1];
        // If last line doesn't end with sentence terminator and is part of a clause
        if (
          last.length < 50 &&
          !/[.!?:\n]$/.test(last) &&
          !/^(제\s*\d+\s*조|\[|\(?[0-9IVX]+\)|[•\-*]|\d+\.)/.test(curr)
        ) {
          acc[acc.length - 1] = `${last} ${curr}`;
          return acc;
        }
      }
      acc.push(curr);
      return acc;
    }, [])
    .join('\n\n')
    .trim();
}

/**
 * Main robust PDF text extraction engine using Mozilla PDF.js (unpdf)
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; title?: string }> {
  let docTitle: string | undefined;
  let finalExtractedText = '';

  // 1. First, try getMeta with a fresh Uint8Array slice
  try {
    const metaArray = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    const metaRes = await getMeta(metaArray);
    if (metaRes?.info?.Title && typeof metaRes.info.Title === 'string' && metaRes.info.Title.trim().length > 1) {
      docTitle = metaRes.info.Title.trim();
    }
  } catch (metaErr) {
    console.warn('PDF getMeta warning:', metaErr);
  }

  // Fallback title extraction from raw header if metadata title wasn't found
  if (!docTitle) {
    const rawString = buffer.toString('binary', 0, Math.min(buffer.length, 8192));
    const titleHexMatch = /\/Title\s*<([0-9a-fA-F\s]+)>/i.exec(rawString);
    if (titleHexMatch) {
      docTitle = decodePdfHexString(titleHexMatch[1]).trim();
    } else {
      const titleLitMatch = /\/Title\s*\(([\s\S]*?)(?<!\\)\)/i.exec(rawString);
      if (titleLitMatch) {
        docTitle = decodePdfLiteralString(titleLitMatch[1]).trim();
      }
    }
  }

  // 2. Extract text using unpdf (PDF.js standard engine)
  try {
    const textArray = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    const textResult = await extractText(textArray, { mergePages: true });

    if (textResult && typeof textResult.text === 'string' && textResult.text.trim().length > 0) {
      finalExtractedText = cleanExtractedText(textResult.text);
    }
  } catch (extractErr) {
    console.warn('unpdf extractText error, trying stream fallback:', extractErr);
  }

  // 3. If unpdf produced empty text (e.g. damaged xref or obscure filter), run stream fallback
  if (!finalExtractedText || finalExtractedText.length < 15) {
    const rawBinary = buffer.toString('binary');
    const fallbackText = parseStreamsFallback(rawBinary);
    if (fallbackText && fallbackText.trim().length > 15) {
      finalExtractedText = cleanExtractedText(fallbackText);
    }
  }

  // 4. Korean Hangul character scanner fallback
  if (!finalExtractedText || finalExtractedText.length < 15) {
    const utf8Str = buffer.toString('utf-8');
    const hangulMatches = utf8Str.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\sA-Za-z0-9\.,:;_\-\(\)\[\]]{5,}/g);
    if (hangulMatches && hangulMatches.length > 0) {
      finalExtractedText = hangulMatches.join('\n').trim();
    }
  }

  // Format with title header if available
  let resultOutput = finalExtractedText;
  if (docTitle && !resultOutput.includes(docTitle)) {
    resultOutput = `[문서 제목]: ${docTitle}\n\n${resultOutput}`;
  }

  return {
    text: resultOutput.trim(),
    title: docTitle
  };
}
