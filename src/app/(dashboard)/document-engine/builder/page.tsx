'use client';

import { useState } from 'react';
import { BuilderToolbar } from '@/features/document-engine/components/builder-toolbar';
import { EditorPane } from '@/features/document-engine/components/editor-pane';
import { PreviewPane } from '@/features/document-engine/components/preview-pane';

export default function DocumentBuilderPage() {
  const [content, setContent] = useState(`Yth. {{nama_pegawai}}
NIP: {{nip_pegawai}}

Dengan hormat,
Sehubungan dengan kegiatan rapat tahunan, kami mengharap kehadiran Bapak/Ibu pada:

Hari/Tanggal: {{tanggal_rapat}}
Waktu: {{waktu_rapat}}
Tempat: {{lokasi_rapat}}

Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya diucapkan terima kasih.

Mengetahui,
Kepala Sekolah

{{ttd_kepala_sekolah}}
`);

  const [previewMode, setPreviewMode] = useState(false);
  const [validationResult, setValidationResult] = useState<{ html: string; missing: string[] } | null>(null);

  // Fungsi Test Render sederhana di Client-side
  const handleTestRender = () => {
    // Simulasi dummy data
    const dummy = {
      nama_pegawai: 'Budi Santoso, S.Pd',
      nip_pegawai: '198012122005011001',
      tanggal_rapat: 'Senin, 20 Agustus 2026',
      waktu_rapat: '09:00 WIB',
      lokasi_rapat: 'Ruang Rapat Utama',
      ttd_kepala_sekolah: '[TTD_QR_CODE]',
    };

    let rendered = content;
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;

    // Validasi missing
    const extracted = [...content.matchAll(regex)].map((m) => m[1]);
    const missing = extracted.filter((k) => !(k in dummy));

    rendered = rendered.replace(regex, (match, key) => {
      return (
        (dummy as Record<string, string>)[key] ||
        `<span class="bg-red-100 text-red-600 font-bold px-1 rounded">[KOSONG: ${key}]</span>`
      );
    });

    setValidationResult({
      html: rendered.replace(/\n/g, '<br/>'),
      missing,
    });
    setPreviewMode(true);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col -m-6 bg-gray-50">
      <BuilderToolbar onTestRender={handleTestRender} />

      {/* Editor & Preview Pane */}
      <div className="flex-1 flex overflow-hidden">
        <EditorPane content={content} onChange={setContent} previewMode={previewMode} />
        <PreviewPane
          previewMode={previewMode}
          onClosePreview={() => setPreviewMode(false)}
          validationResult={validationResult}
        />
      </div>
    </div>
  );
}
