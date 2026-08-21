import { NextRequest, NextResponse } from 'next/server';
import { getServerConfigStatus, setServerConfig } from '@/lib/serverConfig';

export async function GET() {
  try {
    const status = getServerConfigStatus();
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '설정 상태를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const model = typeof body.model === 'string' ? body.model.trim() : 'z-ai/glm-5.2';

    // Update server-side persistent config
    const updated = setServerConfig(apiKey, model);
    const status = getServerConfigStatus();

    return NextResponse.json({
      success: true,
      message: apiKey ? '서버에 NVIDIA API 키 및 GLM 5.2 엔진 설정이 저장되었습니다.' : '서버 API 키가 초기화되었습니다.',
      data: status
    });
  } catch (error: any) {
    console.error('Error saving admin server config:', error);
    return NextResponse.json(
      { error: error?.message || '서버 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
