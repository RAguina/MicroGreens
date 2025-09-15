import AuthGuard from '@/components/auth/AuthGuard';
import LogoutButton from '@/components/auth/LogoutButton';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationToast';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/inicio" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
              🌱 MicroGreens
            </Link>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <ThemeToggleCompact />
              <LogoutButton />
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}