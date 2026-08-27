import { getDocumentTemplatesList } from '@/features/master-data/actions/template-surat';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Sliders, Sparkles, Printer } from 'lucide-react';
import { TemplateListClient } from './TemplateListClient';

export const metadata = {
  title: 'Template & Layout Surat | PAWARTA',
  description: 'Kelola format, margin kertas, tipografi, dan template naskah dinas sekolah',
};

export default async function MasterTemplateSuratPage() {
  const res = await getDocumentTemplatesList();
  const templates = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Tata Naskah & Margin
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Standar Perbup No. 9/2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Template & Layout Margin Surat
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Atur margin kertas fisik (cm), ukuran kertas (A4/F4), jenis huruf, serta pratinjau live
            simulasi cetak untuk semua jenis naskah dinas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/master/template-surat/designer">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs h-10 px-4">
              <Plus className="w-4 h-4" /> Desain Template Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Feature Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 rounded-2xl border border-blue-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Presisi Margin Kertas</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Pengaturan batas atas, kiri (lubang jilid min. 3cm), kanan, dan bawah dengan satuan cm
            presisi.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-5 rounded-2xl border border-emerald-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Live Realistic Canvas</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Simulasi lembar kertas nyata A4/F4 dengan panduan garis margin visual dan kontrol zoom.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-5 rounded-2xl border border-amber-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Akurasi Cetak & PDF</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Injeksi aturan CSS @page otomatis saat cetak browser untuk hasil bebas terpotong.
          </p>
        </div>
      </div>

      {/* Template Table & Management Client Component */}
      <TemplateListClient initialTemplates={templates} />
    </div>
  );
}
