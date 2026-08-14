import { Activity, LogIn, Edit, CheckCircle } from 'lucide-react';

export default function ActivityTimelinePage() {
  const activities = [
    { id: 1, type: 'login', text: 'Anda berhasil masuk ke sistem.', time: 'Baru saja', icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 2, type: 'update', text: 'Admin memperbarui profil instansi.', time: '2 jam yang lalu', icon: Edit, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { id: 3, type: 'approval', text: 'Draft surat permohonan telah disetujui.', time: '1 hari yang lalu', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="text-sm text-gray-500">Log aktivitas akun Anda dan sistem terkait.</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative">
              <span className={`absolute -left-[35px] top-1 flex h-8 w-8 items-center justify-center rounded-full ${item.bg} ring-4 ring-white`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </span>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-gray-900">{item.text}</p>
                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
