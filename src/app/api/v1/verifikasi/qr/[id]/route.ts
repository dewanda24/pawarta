import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID surat wajib disertakan' }, { status: 400 });
    }

    // Tentukan Host / Domain untuk tautan verifikasi publik
    const host = request.headers.get('host') || 'pawarta.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verifikasi/${encodeURIComponent(id)}`;

    // Generate SVG QR Code
    const svgString = await QRCode.toString(verificationUrl, {
      type: 'svg',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error generating TTE QR Code:', error);
    return NextResponse.json({ error: 'Gagal membuat QR Code TTE' }, { status: 500 });
  }
}
