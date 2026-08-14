import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

// Menggunakan konfigurasi dasar tanpa Node.js dependencies untuk Middleware Edge
export default NextAuth(authConfig).auth;

export const config = {
  // Hanya jalankan middleware pada rute yang relevan
  // Abaikan file statis, API route tertentu, dan gambar
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
