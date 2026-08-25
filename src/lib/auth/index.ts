import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
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

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
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
    ...authConfig.callbacks,
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
  },
});
