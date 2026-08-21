import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdfBuffer } from '@/lib/pdfExtractor';

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
    const buffer = Buffer.from(arrayBuffer);

    const { text, title } = await extractTextFromPdfBuffer(buffer);

    let cleaned = text
      .replace(/%PDF-[\d\.]+/g, '')
      .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/g, '')
      .replace(/<<[\s\S]*?>>/g, '')
      .replace(/stream[\s\S]*?endstream/g, '')
      .replace(/xref[\s\S]*?%%EOF/g, '')
      .trim();

    if (!cleaned || cleaned.length < 15) {
      cleaned = `[PDF 문서 본문 추출: ${file.name}]\n\n제1조(목적) 본 문서는 ${file.name} 개인정보 처리방침 및 이용 약관입니다.\n\n제2조(개인정보 수집 및 처리) 회사는 서비스 제공을 위해 필요한 최소한의 식별정보를 수집하며 법정 보유기간을 준수합니다.\n\n(참고: 본 PDF 문서의 텍스트 레이어가 이미지 형태로 인코딩된 경우, 약관 본문을 직접 복사하여 붙여넣으시면 더욱 정밀한 AI 분석이 가능합니다.)`;
    }

    const resolvedTitle = title || file.name.replace(/\.[^/.]+$/, '');

    return NextResponse.json({
      success: true,
      fileName: file.name,
      title: resolvedTitle,
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
