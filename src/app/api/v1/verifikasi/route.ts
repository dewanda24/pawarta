import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { outgoingLetters, studentLetters, parentConsents, masterPegawai, masterSekolah } from '@/db/schema';
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
      const snap = (outgoing.documentSnapshot as any) || null;
      const signerSnap = snap?.signer || (outgoing.signerSnapshot as any) || null;
      const sekolahSnap = snap?.sekolah || null;

      let sekolahNama = sekolahSnap?.nama;
      if (!sekolahNama) {
        const sekolah = await db.query.masterSekolah.findFirst({
          where: eq(masterSekolah.isAktif, true),
        });
        sekolahNama = sekolah?.nama || 'SMP NEGERI 1 UJUNGJAYA';
      }

      const isValid = outgoing.status === 'APPROVED' || outgoing.status === 'PUBLISHED';
      const statusKeabsahan = outgoing.status === 'BATAL' || outgoing.status === 'DIBATALKAN'
        ? 'DIBATALKAN'
        : isValid
        ? 'SAH_TERVERIFIKASI'
        : 'DRAFT_BELUM_TERBIT';

      return NextResponse.json({
        success: true,
        data: {
          tipe: 'SURAT_KELUAR',
          nomorSurat: outgoing.nomorSurat || 'DRAFT',
          perihal: outgoing.perihal,
          tanggalSurat: outgoing.tanggalSurat,
          tanggalTerbit: outgoing.tanggalTerbit || snap?.tanggalTerbit || null,
          tujuanSurat: outgoing.tujuanSurat,
          status: outgoing.status,
          statusKeabsahan,
          isValid,
          sekolah: sekolahNama,
          penandatangan: signerSnap?.nama || outgoing.penandatangan?.nama || 'Kepala Sekolah',
          nip: signerSnap?.nip || (outgoing.penandatangan?.nip ? `NIP. ${outgoing.penandatangan.nip}` : '-'),
          jabatanPenandatangan: signerSnap?.jabatanDokumen || 'Kepala Sekolah',
          jenisTtd: signerSnap?.jenisTtd || 'DIGITAL_LOCAL',
          signedAt: outgoing.signedAt || snap?.approvedAt || outgoing.createdAt,
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
      const snap = (student.documentSnapshot as any) || null;
      const snapSekolah = snap?.sekolah || null;
      const snapSigner = snap?.penandatangan || null;
      const snapSiswa = snap?.siswa || null;

      let sekolahNama = snapSekolah?.nama;
      let kepsekNama = snapSigner?.nama;
      let kepsekNip = snapSigner?.nip;

      if (!sekolahNama || !kepsekNama) {
        const [sekolah, kepsek] = await Promise.all([
          db.query.masterSekolah.findFirst({ where: eq(masterSekolah.isAktif, true) }),
          db.query.masterPegawai.findFirst({ where: eq(masterPegawai.isAktif, true) }),
        ]);
        if (!sekolahNama) sekolahNama = sekolah?.nama || 'SMP NEGERI 1 UJUNGJAYA';
        if (!kepsekNama) kepsekNama = kepsek?.nama || 'Kepala Sekolah';
        if (!kepsekNip) kepsekNip = kepsek?.nip ? `NIP. ${kepsek.nip}` : '-';
      }

      const isValid = student.status === 'APPROVED';
      const statusKeabsahan = isValid ? 'SAH_TERVERIFIKASI' : 'DRAFT_BELUM_TERBIT';

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
          statusKeabsahan,
          isValid,
          sekolah: sekolahNama,
          siswa: snapSiswa
            ? { nama: snapSiswa.nama, nisn: snapSiswa.nisn || '-' }
            : student.siswa
            ? { nama: student.siswa.nama, nisn: student.siswa.nisn || '-' }
            : null,
          penandatangan: kepsekNama,
          nip: kepsekNip || '-',
          jabatanPenandatangan: 'Kepala Sekolah',
          signedAt: student.signedAt || student.createdAt,
          createdAt: student.createdAt,
        },
      });
    }

    // 3. Check Parent Consents (Surat Persetujuan Orang Tua)
    const consentWhere = and(
      isNull(parentConsents.deletedAt),
      isUuid
        ? or(eq(parentConsents.id, trimmed), ilike(parentConsents.nomorSurat, trimmed))
        : ilike(parentConsents.nomorSurat, trimmed)
    );

    const consent = await db.query.parentConsents.findFirst({
      where: consentWhere,
      with: {
        siswa: { with: { kelas: true } },
      },
    });

    if (consent) {
      const snap = (consent.documentSnapshot as any) || null;
      const snapSekolah = snap?.sekolah || null;
      const snapSigner = snap?.kepsek || null;
      const snapSiswa = snap?.siswa || null;

      let sekolahNama = snapSekolah?.nama;
      let kepsekNama = snapSigner?.nama;
      let kepsekNip = snapSigner?.nip;

      if (!sekolahNama || !kepsekNama) {
        const [sekolah, kepsek] = await Promise.all([
          db.query.masterSekolah.findFirst({ where: eq(masterSekolah.isAktif, true) }),
          db.query.masterPegawai.findFirst({ where: eq(masterPegawai.isAktif, true) }),
        ]);
        if (!sekolahNama) sekolahNama = sekolah?.nama || 'SMP NEGERI 1 UJUNGJAYA';
        if (!kepsekNama) kepsekNama = kepsek?.nama || 'Kepala Sekolah';
        if (!kepsekNip) kepsekNip = kepsek?.nip ? `NIP. ${kepsek.nip}` : '-';
      }

      return NextResponse.json({
        success: true,
        data: {
          tipe: 'SURAT_PERSETUJUAN_ORTU',
          tipeSurat: 'PERSETUJUAN_5_HARI_KERJA',
          nomorSurat: consent.nomorSurat,
          perihal: `Persetujuan Program 5 Hari Sekolah - ${consent.siswa?.nama || 'Siswa'}`,
          status: consent.statusPersetujuan,
          statusKeabsahan: 'SAH_TERVERIFIKASI',
          isValid: true,
          sekolah: sekolahNama,
          siswa: snapSiswa
            ? { nama: snapSiswa.nama, nisn: snapSiswa.nisn || '-', kelas: snapSiswa.kelas }
            : consent.siswa
            ? { nama: consent.siswa.nama, nisn: consent.siswa.nisn || '-', kelas: consent.siswa.kelas?.namaKelas }
            : null,
          orangTua: {
            nama: consent.namaOrtu,
            hubungan: consent.hubungan,
            statusPersetujuan: consent.statusPersetujuan,
          },
          penandatangan: consent.namaOrtu,
          nip: '-',
          jabatanPenandatangan: `Orang Tua / Wali (${consent.hubungan})`,
          kepalaSekolah: kepsekNama,
          nipKepalaSekolah: kepsekNip,
          signedAt: consent.signedAt || consent.createdAt,
          createdAt: consent.createdAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Dokumen tidak ditemukan dalam pangkalan data resmi PAWARTA.' },
      { status: 404 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan pada verifikasi';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
