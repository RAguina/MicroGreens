'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  console.log('LoginForm mounted');
  
  const { login } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with credentials:', credentials);
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      console.log('Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Error de login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    console.log('Demo button clicked');
    setCredentials({ email: 'demo@microgreens.com', password: 'demo123' });
    
    try {
      setLoading(true);
      await login({ email: 'demo@microgreens.com', password: 'demo123' });
      console.log('Demo login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err instanceof Error ? err.message : 'Error de login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">MicroGreens</h1>
          <p className="mt-2 text-center text-gray-600">Inicia sesión en tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => console.log('Login button clicked')}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('Demo button clicked');
                handleDemoLogin();
              }}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Demo Login
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Demo: demo@microgreens.com / demo123
          </div>
        </form>
      </div>
    </div>
  );
}