import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [], // Kosong untuk kompatibilitas Edge Middleware
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/surat-') ||
        nextUrl.pathname.startsWith('/disposisi-') ||
        nextUrl.pathname.startsWith('/agenda-') ||
        nextUrl.pathname.startsWith('/master') ||
        nextUrl.pathname.startsWith('/settings') ||
        nextUrl.pathname.startsWith('/iam') ||
        nextUrl.pathname.startsWith('/bantuan');

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect ke /login
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
