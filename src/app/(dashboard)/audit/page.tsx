export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail (Aktivitas Sistem)</h1>
          <p className="text-sm text-gray-500">Log riwayat aktivitas pengguna untuk keamanan dan kepatuhan.</p>
        </div>
      </div>
      <div className="p-8 text-center bg-gray-50 border rounded-lg border-dashed">
        <p className="text-gray-500">Fitur audit viewer sedang dalam tahap pengembangan (WIP).</p>
      </div>
    </div>
  );
}
