import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { incomingLetterAttachments, incomingTimelines } from '@/db/schema/incoming-letter';
import { letterAttachments } from '@/db/schema/outgoing-letter';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const suratId = formData.get('suratId') as string | null;
    const tipeSurat = (formData.get('tipeSurat') as string | null) || 'INCOMING';
    const deskripsi = formData.get('deskripsi') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File wajib disediakan' }, { status: 400 });
    }

    if (tipeSurat !== 'LOGO' && !suratId) {
      return NextResponse.json({ error: 'suratId wajib disediakan' }, { status: 400 });
    }

    // Validate size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal 20MB' }, { status: 400 });
    }

    // Validate allowed file extensions
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: `Format file ${fileExt} tidak diizinkan. Silakan unggah PDF, Dokumen Word/Excel, atau Gambar.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare upload directory
    const uploadSubdir = tipeSurat === 'LOGO' ? 'logos' : 'attachments';
    const uploadDir = join(process.cwd(), 'public', 'uploads', uploadSubdir);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedName}`;
    const filePath = join(uploadDir, uniqueFileName);
    const fileUrl = `/uploads/${uploadSubdir}/${uniqueFileName}`;

    await writeFile(filePath, buffer);

    if (tipeSurat === 'LOGO') {
      return NextResponse.json({ success: true, url: fileUrl, fileUrl });
    }

    if (!suratId) {
      return NextResponse.json({ error: 'suratId wajib disediakan' }, { status: 400 });
    }

    if (tipeSurat === 'OUTGOING') {
      const [attachment] = await db
        .insert(letterAttachments)
        .values({
          suratId,
          namaFile: file.name,
          tipeMime: file.type || 'application/octet-stream',
          ukuranBytes: file.size,
          fileUrl,
          deskripsi: deskripsi || null,
        })
        .returning();

      return NextResponse.json({ success: true, data: attachment });
    } else {
      const [attachment] = await db
        .insert(incomingLetterAttachments)
        .values({
          suratId,
          namaFile: file.name,
          tipeMime: file.type || 'application/octet-stream',
          ukuranBytes: file.size,
          fileUrl,
          deskripsi: deskripsi || null,
        })
        .returning();

      await db.insert(incomingTimelines).values({
        suratId,
        aktorId: session.user.id,
        aktivitas: 'Upload Lampiran',
        deskripsi: `Mengunggah lampiran berkas: ${file.name}`,
      });

      return NextResponse.json({ success: true, data: attachment });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengunggah file' }, { status: 500 });
  }
}
