'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Leaf } from 'lucide-react';

export default function LoginForm() {
  console.log('🚀 [LoginForm] Component initialized');
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 [LoginForm] handleSubmit called');
    e.preventDefault();
    setError('');
    
    try {
      console.log('🚀 [LoginForm] About to call login with:', credentials);
      await login(credentials);
    } catch (err) {
      console.error('🚀 [LoginForm] Login error:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  const handleDemoLogin = async () => {
    console.log('🚀 [LoginForm] Demo login clicked!');
    const demoCredentials = {
      email: 'demo@microgreens.com',
      password: 'demo123'
    };
    
    setCredentials(demoCredentials);
    setError('');
    
    try {
      console.log('🚀 [LoginForm] About to call demo login');
      await login(demoCredentials);
    } catch (err) {
      console.error('🚀 [LoginForm] Demo login error:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            MicroGreens
          </CardTitle>
          <CardDescription className="text-green-600">
            Sistema de Gestión de Microgreens
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@microgreens.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ 
                  ...prev, 
                  email: e.target.value 
                }))}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ 
                  ...prev, 
                  password: e.target.value 
                }))}
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
              onClick={() => console.log('🚀🚀🚀 [LoginForm] INICIAR SESIÓN BUTTON CLICKED!!!')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-center text-gray-600 mb-3">
              Credenciales de demostración:
            </div>
            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={() => {
                console.log('🚀🚀🚀 [LoginForm] VER DEMO BUTTON CLICKED!!!');
                handleDemoLogin();
              }}
              disabled={isLoading}
            >
              Usar credenciales demo
            </Button>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Email: admin@microgreens.com<br />
              Contraseña: admin123
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}