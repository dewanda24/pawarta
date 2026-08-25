'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
      username,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Username atau password salah.';
        default:
          return 'Terjadi kendala saat verifikasi login.';
      }
    }
    // Wajib melempar kembali error agar Next.js Server Action redirect berjalan
    throw error;
  }
}
