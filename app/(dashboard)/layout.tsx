import AuthGuard from '@/components/auth/AuthGuard';
import LogoutButton from '@/components/auth/LogoutButton';
import Link from 'next/link';

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
            <Link href="/inicio" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
              🌱 MicroGreens
            </Link>
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