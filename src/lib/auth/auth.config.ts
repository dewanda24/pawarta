import type { NextAuthConfig } from 'next-auth';

// Pondasi konfigurasi Auth.js
// Providers dan Callbacks akan ditambahkan pada sprint berikutnya.
export const authConfig = {
  pages: {
    signIn: '/login', // Route login kustom
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect ke login
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Tambahkan Credentials atau OAuth di sini
} satisfies NextAuthConfig;
