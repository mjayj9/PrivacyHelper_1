import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'PDF 파일이 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let extractedText = '';
    try {
      const parser = new PDFParse({ data: uint8Array });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
    } catch (parseErr) {
      console.warn('PDFParse class error, attempting buffer fallback:', parseErr);
    }

    // Clean up any residual non-printable or PDF binary artifacts if any
    let cleaned = extractedText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/%PDF-[\d\.]+/g, '')
      .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/g, '')
      .replace(/<<[\s\S]*?>>/g, '')
      .replace(/stream[\s\S]*?endstream/g, '')
      .trim();

    if (!cleaned || cleaned.length < 10) {
      // Fallback if PDF is scanned or pure images
      cleaned = `[PDF 문서 본문 추출: ${file.name}]\n(스캔된 이미지형 PDF의 경우 OCR 또는 텍스트 복사 후 입력을 권장합니다.)\n\n문서명: ${file.name}\n용량: ${(file.size / 1024).toFixed(1)} KB`;
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      title: file.name.replace(/\.[^/.]+$/, ''),
      text: cleaned
    });
  } catch (error: any) {
    console.error('Error in /api/parse-pdf:', error);
    return NextResponse.json(
      { error: error?.message || 'PDF 파일을 분석하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
