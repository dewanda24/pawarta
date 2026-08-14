import LoginForm from './login-form';

export const metadata = {
  title: 'Login - Pawarta',
};

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-gray-100 dark:border-zinc-800">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login Pawarta</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Silakan masukkan username dan password Anda
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
