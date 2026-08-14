import { BarChart3, Users, Mail, Activity, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas dan metrik sistem utama.</p>
        </div>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          Super Admin Workspace
        </div>
      </div>

      {/* Widget Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Widget 1: Statistic */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">1,248</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> +12 minggu ini
          </div>
        </div>

        {/* Widget 2: Mail (Placeholder for Surat Masuk) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Surat Masuk Baru</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">56</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-gray-400">Menunggu disposisi</div>
        </div>

        {/* Widget 3: Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow xl:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Aktivitas Sistem</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Stabil</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Uptime: 99.9%</span>
            <span>Error Rate: 0.01%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[99%]" />
          </div>
        </div>

        {/* Full width Chart Widget Mockup */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 xl:col-span-4 min-h-[300px] flex items-center justify-center flex-col">
          <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm text-gray-500 font-medium">Data Chart Analytics (Tersedia setelah modul Arsip)</p>
        </div>

      </div>
    </div>
  );
}
