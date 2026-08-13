export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
