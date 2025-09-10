'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Sprout, 
  Scissors, 
  BarChart3,
  Leaf
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Siembras',
    href: '/siembras',
    icon: Sprout,
  },
  {
    name: 'Cosechas',
    href: '/cosechas',
    icon: Scissors,
  },
  {
    name: 'Estadísticas',
    href: '/estadisticas',
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">MicroGreens</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon 
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-green-600' : 'text-gray-400'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          MicroGreens v1.0
        </div>
      </div>
    </div>
  );
}