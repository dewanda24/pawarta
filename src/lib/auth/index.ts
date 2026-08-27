import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users, loginLogs } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username atau Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          const identifier = (credentials.username as string).trim();
          const password = credentials.password as string;

          // Cari pengguna berdasarkan username ATAU email
          const user = await db.query.users.findFirst({
            where: or(eq(users.username, identifier), eq(users.email, identifier)),
          });

          if (!user) {
            try {
              await db.insert(loginLogs).values({
                aktivitas: 'Failed Login',
                status: 'Failed',
                keterangan: `Percobaan login gagal untuk identitas: ${identifier} (Pengguna tidak ditemukan)`,
              });
            } catch {
              // ignore audit error
            }
            return null;
          }

          if (user.status !== 'Aktif') {
            try {
              await db.insert(loginLogs).values({
                userId: user.id,
                aktivitas: 'Failed Login',
                status: 'Failed',
                keterangan: `Percobaan login gagal: Akun berstatus ${user.status}`,
              });
            } catch {
              // ignore audit error
            }
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            try {
              await db.insert(loginLogs).values({
                userId: user.id,
                aktivitas: 'Failed Login',
                status: 'Failed',
                keterangan: 'Percobaan login gagal: Password tidak sesuai',
              });
            } catch {
              // ignore audit error
            }
            return null;
          }

          // Catat login berhasil
          try {
            await db.insert(loginLogs).values({
              userId: user.id,
              aktivitas: 'Login',
              status: 'Success',
              keterangan: 'Login berhasil ke sistem PAWARTA',
            });
          } catch {
            // ignore audit error
          }

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
