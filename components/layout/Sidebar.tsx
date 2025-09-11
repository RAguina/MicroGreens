'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Sprout, 
  Scissors, 
  BarChart3,
  Leaf,
  X
} from 'lucide-react';
import { useSidebar } from '@/providers/SidebarProvider';
import { useEffect } from 'react';

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
  const { isOpen, close, isMobile } = useSidebar();

  // Cerrar sidebar en móvil cuando se navega
  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [pathname, isMobile, close]);

  // Overlay para móvil
  const Overlay = () => {
    if (!isMobile || !isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={close}
        aria-hidden="true"
      />
    );
  };

  return (
    <>
      <Overlay />
      
      {/* Sidebar */}
      <div className={cn(
        // Posicionamiento
        "fixed lg:static inset-y-0 left-0 z-50",
        
        // Dimensiones
        "w-64 lg:w-64",
        
        // Fondo y border
        "bg-white border-r border-gray-200",
        
        // Flexbox
        "flex flex-col",
        
        // Transiciones
        "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        
        // Estado de visibilidad
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Header con logo y botón cerrar (móvil) */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">MicroGreens</span>
          </div>
          
          {/* Botón cerrar solo en móvil */}
          {isMobile && (
            <button
              onClick={close}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'w-full', // Asegurar ancho completo
                  isActive
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => {
                  // Cerrar sidebar en móvil al hacer clic en un enlace
                  if (isMobile) {
                    close();
                  }
                }}
              >
                <Icon 
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-green-600' : 'text-gray-400'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            MicroGreens v2.0
          </div>
        </div>
      </div>
    </>
  );
}