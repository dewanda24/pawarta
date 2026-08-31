import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/surat-5-hari-kerja',
        destination: '/surat-siswa/persetujuan-5-hari-kerja',
        permanent: false,
      },
      {
        source: '/persetujuan-5-hari-kerja',
        destination: '/surat-siswa/persetujuan-5-hari-kerja',
        permanent: false,
      },
      {
        source: '/surat-siswa/5-hari-kerja',
        destination: '/surat-siswa/persetujuan-5-hari-kerja',
        permanent: false,
      },
      {
        source: '/5-hari-kerja',
        destination: '/surat-siswa/persetujuan-5-hari-kerja',
        permanent: false,
      },
      {
        source: '/surat-persetujuan-5-hari-kerja',
        destination: '/surat-siswa/persetujuan-5-hari-kerja',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
