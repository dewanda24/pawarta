import { Settings2, Paintbrush, Globe, Shield } from 'lucide-react';

export default function UserPreferencesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Workspace</h1>
          <p className="text-sm text-gray-500">Atur preferensi tampilan dan pengalaman pengguna Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg">
            <Paintbrush className="w-4 h-4" /> Tampilan
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
            <Globe className="w-4 h-4" /> Bahasa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
            <Shield className="w-4 h-4" /> Privasi
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tema Tampilan</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-blue-50/20">
                <div className="w-full h-16 bg-gray-100 rounded-md mb-2 border border-gray-200 shadow-sm" />
                <span className="text-sm font-medium text-blue-700">Terang</span>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 transition-colors">
                <div className="w-full h-16 bg-gray-900 rounded-md mb-2" />
                <span className="text-sm font-medium text-gray-600">Gelap</span>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 transition-colors">
                <div className="w-full h-16 bg-gradient-to-r from-gray-100 to-gray-900 rounded-md mb-2" />
                <span className="text-sm font-medium text-gray-600">Otomatis (Sistem)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tata Letak</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Perkecil Sidebar secara default</p>
                <p className="text-sm text-gray-500">Sidebar akan selalu dalam mode ringkas saat Anda membuka aplikasi.</p>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
