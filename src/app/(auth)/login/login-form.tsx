'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('Username atau password tidak sesuai.');
        toast.error('Gagal masuk: Username atau password salah.');
        setLoading(false);
      } else {
        toast.success('Login berhasil! Mengalihkan ke dashboard...');
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi sistem.');
      toast.error('Terjadi kesalahan saat menghubungkan ke server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Masukkan username"
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Masukkan password"
          autoComplete="current-password"
        />
      </div>
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
        </div>
      )}
      <Button type="submit" className="w-full font-semibold" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa Akun...
          </span>
        ) : (
          'Masuk ke Sistem'
        )}
      </Button>
    </form>
  );
}
