'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ThemeToggle({
  showLabel = true,
  size = 'md',
  className = ''
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `${sizeClasses[size]} rounded transition-all duration-200 font-medium`;

  const buttonClasses = theme === 'dark'
    ? `${baseClasses} bg-yellow-500 text-yellow-900 hover:bg-yellow-400`
    : `${baseClasses} bg-gray-700 text-gray-100 hover:bg-gray-600`;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Modo Oscuro
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cambiar tema de la aplicación
          </p>
        </div>
      )}
      <button
        onClick={toggleTheme}
        className={buttonClasses}
        title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      >
        <span className="flex items-center space-x-1">
          <span className="text-base">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          <span>
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </span>
        </span>
      </button>
    </div>
  );
}

// Alternative compact version for navbar/header
export function ThemeToggleCompact({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <span className="text-xl">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

// Alternative switch-style toggle
export function ThemeSwitch({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Claro
      </span>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-green-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Oscuro
      </span>
    </div>
  );
}