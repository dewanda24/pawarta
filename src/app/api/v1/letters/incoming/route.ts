import { NextResponse } from 'next/server';
import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { authenticateApiRequest } from '@/lib/api-auth';
import { desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const auth = await authenticateApiRequest(req, '/api/v1/letters/incoming');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const letters = await db
      .select({
        id: incomingLetters.id,
        nomorSurat: incomingLetters.nomorSurat,
        perihal: incomingLetters.perihal,
        pengirim: incomingLetters.pengirim,
        tanggalSurat: incomingLetters.tanggalSurat,
        status: incomingLetters.status,
      })
      .from(incomingLetters)
      .orderBy(desc(incomingLetters.createdAt))
      .limit(50); // Default limit for API

    return NextResponse.json({
      success: true,
      count: letters.length,
      data: letters,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await authenticateApiRequest(req, '/api/v1/letters/incoming');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Cek Permission (simulasi)
  const permissions = (auth.apiKey?.permissions as string[]) || [];
  if (!permissions.includes('write:letters')) {
    return NextResponse.json({ error: 'Forbidden: Missing write:letters permission' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Validasi basic manual untuk API (idealnya pakai Zod sama seperti Server Action)
    if (!body.perihal || !body.pengirim) {
      return NextResponse.json({ error: 'Field perihal and pengirim are required' }, { status: 400 });
    }

    const [newLetter] = await db.insert(incomingLetters).values({
      perihal: body.perihal,
      pengirim: body.pengirim,
      nomorSurat: body.nomorSurat || 'TBA',
      tanggalSurat: new Date(body.tanggalSurat || Date.now()),
      tanggalDiterima: new Date(),
      status: 'DRAFT',
      prioritasId: body.prioritasId || null,
      jenisSuratId: body.jenisSuratId || null,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Surat Masuk berhasil diregistrasi via API',
      data: newLetter,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
