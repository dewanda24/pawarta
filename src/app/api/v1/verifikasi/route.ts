import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { outgoingLetters, studentLetters, masterPegawai, masterSekolah } from '@/db/schema';
import { eq, or, ilike, and, isNull } from 'drizzle-orm';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || searchParams.get('id') || searchParams.get('nomor') || '';

    if (!q.trim()) {
      return NextResponse.json({ error: 'Query pencarian diperlukan' }, { status: 400 });
    }

    const trimmed = q.trim();
    const isUuid = UUID_REGEX.test(trimmed);

    // 1. Check Outgoing Letters
    const outgoingWhere = and(
      isNull(outgoingLetters.deletedAt),
      isUuid
        ? or(eq(outgoingLetters.id, trimmed), ilike(outgoingLetters.nomorSurat, trimmed))
        : ilike(outgoingLetters.nomorSurat, trimmed)
    );

    const outgoing = await db.query.outgoingLetters.findFirst({
      where: outgoingWhere,
      with: {
        penandatangan: true,
        pembuat: true,
        jenisSurat: true,
      },
    });

    if (outgoing) {
      const sekolah = await db.query.masterSekolah.findFirst({
        where: eq(masterSekolah.isAktif, true),
      });

      return NextResponse.json({
        success: true,
        data: {
          tipe: 'SURAT_KELUAR',
          nomorSurat: outgoing.nomorSurat || 'DRAFT',
          perihal: outgoing.perihal,
          tanggalSurat: outgoing.tanggalSurat,
          tujuanSurat: outgoing.tujuanSurat,
          status: outgoing.status,
          sekolah: sekolah?.nama || 'SMA NEGERI CONTOH UTAMA',
          penandatangan: outgoing.penandatangan?.nama || 'Kepala Sekolah',
          nip: outgoing.penandatangan?.nip || '-',
          createdAt: outgoing.createdAt,
        },
      });
    }

    // 2. Check Student Letters
    const studentWhere = and(
      isNull(studentLetters.deletedAt),
      isUuid
        ? or(eq(studentLetters.id, trimmed), ilike(studentLetters.nomorSurat, trimmed))
        : ilike(studentLetters.nomorSurat, trimmed)
    );

    const student = await db.query.studentLetters.findFirst({
      where: studentWhere,
      with: {
        siswa: { with: { kelas: true } },
        guruPendamping: true,
      },
    });

    if (student) {
      const [sekolah, kepsek] = await Promise.all([
        db.query.masterSekolah.findFirst({ where: eq(masterSekolah.isAktif, true) }),
        db.query.masterPegawai.findFirst({ where: eq(masterPegawai.isAktif, true) }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          tipe: 'SURAT_SISWA',
          tipeSurat: student.tipeSurat,
          nomorSurat: student.nomorSurat,
          perihal: student.keperluan || student.namaKegiatan || 'Surat Kesiswaan',
          namaKegiatan: student.namaKegiatan,
          tanggalSurat: student.createdAt,
          status: student.status,
          sekolah: sekolah?.nama || 'SMA NEGERI CONTOH UTAMA',
          siswa: student.siswa ? { nama: student.siswa.nama, nisn: student.siswa.nisn } : null,
          penandatangan: kepsek?.nama || 'Kepala Sekolah',
          nip: kepsek?.nip || '-',
          createdAt: student.createdAt,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan atau telah dihapus' }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan pada verifikasi';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

