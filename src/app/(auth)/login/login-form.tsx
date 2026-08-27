'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallback && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        username: identifier.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        const message = 'Username/email atau kata sandi tidak sesuai.';
        setErrorMsg(message);
        toast.error(message);
        setLoading(false);
      } else {
        toast.success('Login berhasil! Mengalihkan ke dashboard...');
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = 'Terjadi gangguan koneksi ke server. Silakan coba lagi.';
      setErrorMsg(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-tight">{errorMsg}</p>
        </div>
      )}

      {/* Identifier: Username atau Email */}
      <div className="space-y-1">
        <Label htmlFor="identifier" className="text-xs font-semibold text-gray-700">
          Username atau Email
        </Label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            id="identifier"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="Contoh: admin atau user@sekolah.sch.id"
            autoComplete="username"
            className="pl-9 h-10 text-xs sm:text-sm bg-gray-50/60 border-gray-200 focus:bg-white transition-all rounded-xl"
            disabled={loading}
          />
        </div>
      </div>

      {/* Password Field with Show/Hide Toggle */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
          Kata Sandi / Password
        </Label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan kata sandi akun"
            autoComplete="current-password"
            className="pl-9 pr-10 h-10 text-xs sm:text-sm bg-gray-50/60 border-gray-200 focus:bg-white transition-all rounded-xl"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-600" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 transition-all mt-1 cursor-pointer"
        disabled={loading || !identifier.trim() || !password}
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa Kredensial...
          </span>
        ) : (
          'Masuk ke Sistem'
        )}
      </Button>
    </form>
  );
}
