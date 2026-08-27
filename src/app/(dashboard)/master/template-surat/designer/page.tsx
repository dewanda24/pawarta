import { getTemplateDesignerMeta } from '@/features/master-data/actions/template-surat';
import { TemplateLayoutEditor } from '@/components/features/template-designer/TemplateLayoutEditor';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Desain Template & Margin Surat | PAWARTA',
  description: 'Studio interaktif pengaturan margin, ukuran kertas, dan tipografi naskah dinas',
};

export default async function NewTemplateDesignerPage() {
  const metaRes = await getTemplateDesignerMeta();

  if (!metaRes.success || !metaRes.data) {
    notFound();
  }

  const { headersList, jenisSuratList, kategoriList, sekolah, kepsek } = metaRes.data;

  return (
    <TemplateLayoutEditor
      headersList={headersList}
      jenisSuratList={jenisSuratList}
      kategoriList={kategoriList}
      sekolah={sekolah}
      kepsek={kepsek}
    />
  );
}
