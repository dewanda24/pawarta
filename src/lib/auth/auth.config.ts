import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authConfig = {
  trustHost: true, // Wajib untuk deployment Vercel / reverse proxy
  pages: {
    signIn: '/login', // Route login kustom
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          const user = await db.query.users.findFirst({
            where: eq(users.username, credentials.username as string),
          });

          if (!user || user.status !== 'Aktif') return null;

          const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.nama,
            email: user.email,
            image: user.avatar,
          };
        } catch (err) {
          console.error('Error during authorize():', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token?.id && !token.role) {
        try {
          const userRolesData = await db.query.userRoles.findFirst({
            where: (ur, { eq }) => eq(ur.userId, token.id as string),
            with: { role: true },
          });
          token.role = userRolesData?.role?.namaRole || 'Pengguna';
        } catch (e) {
          console.error('Error fetching role in jwt callback:', e);
          token.role = 'Pengguna';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        // @ts-expect-error custom role property
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect ke login
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
