'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Logo y título */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-green-500 rounded-full">
              <Leaf className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-green-800">
              MicroGreens
            </h1>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Sistema de gestión completo para tu producción de microgreens. 
              Registra siembras, controla cosechas y analiza tu rendimiento.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/login">
                Iniciar Sesión
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Ver Demo
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Siembras</h3>
              <p className="text-gray-600">
                Registra y monitorea todas tus siembras con fechas, ubicaciones y estados.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Control de Cosechas</h3>
              <p className="text-gray-600">
                Registra pesos, calidad y notas de cada cosecha para optimizar tu producción.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
              <p className="text-gray-600">
                Analiza tu rendimiento con gráficos y métricas que te ayudan a mejorar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

