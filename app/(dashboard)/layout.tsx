import AuthGuard from '@/components/auth/AuthGuard';
import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-600">🌱 MicroGreens</h1>
            <LogoutButton />
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}