import { getDocumentTemplateById } from '@/features/master-data/actions/template-surat';
import { TemplateLayoutEditor } from '@/components/features/template-designer/TemplateLayoutEditor';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Template & Layout Surat | PAWARTA',
};

export default async function EditTemplateSuratPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) return notFound();

  const res = await getDocumentTemplateById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const template = res.data;
  const { headersList, jenisSuratList, kategoriList, sekolah, kepsek } = res;

  return (
    <TemplateLayoutEditor
      initialData={{
        id: template.id,
        kode: template.kode,
        nama: template.nama,
        kategoriId: template.kategoriId,
        jenisSuratId: template.jenisSuratId,
        deskripsi: template.deskripsi,
        isAktif: template.isAktif,
        headerId: template.versiAktif?.headerId,
        kontenHtml: template.versiAktif?.kontenHtml,
        pengaturanKertas: template.versiAktif?.pengaturanKertas,
      }}
      headersList={headersList || []}
      jenisSuratList={jenisSuratList || []}
      kategoriList={kategoriList || []}
      sekolah={sekolah}
      kepsek={kepsek}
    />
  );
}
