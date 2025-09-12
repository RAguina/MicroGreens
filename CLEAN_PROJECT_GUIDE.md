# 🔥 Guía Definitiva: Next.js + JWT Auth Real (Sin Mocks)

> **Lección aprendida:** Los mocks son el enemigo. Auth real desde el primer día.

## 🎯 **Objetivo**
Crear un proyecto Next.js completamente limpio con autenticación JWT real usando cookies HttpOnly, sin sistemas mock que complican todo.

---

## 📊 **Auditoría del Proyecto Actual**

### ❌ **Problemas Identificados**

1. **Sistema Mock Corrupto**
   - Mezcla de `mockAuth` y `realAuth` 
   - Imports confusos y referencias cruzadas
   - JavaScript que no se ejecuta (posiblemente por imports circulares)

2. **Complejidad Innecesaria**
   - AuthProvider con lógica híbrida
   - Timeouts, fallbacks, y manejo de errores excesivo
   - Sistema de "failure counting" que añade estado innecesario

3. **Arquitectura Inconsistente**
   - Múltiples archivos de auth (`lib/auth.ts`, providers, components)
   - Adaptadores que no se necesitan
   - Hooks que wrappean otros hooks sin valor añadido

4. **Build/Runtime Issues**
   - Console.logs que no aparecen (indicativo de errores de compilación)
   - Posibles imports circulares o dependencias rotas
   - SSR/hydration issues

### ✅ **Lo Que Sí Funcionó**

1. **Backend Integration Ready**
   - Endpoint definido: `https://micro-greens-backend.vercel.app`
   - Credenciales demo: `demo@microgreens.com` / `demo123`
   - API endpoints documentados: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`

2. **UI Components**
   - LoginForm bien estructurado (HTML/CSS)
   - Button components funcionales
   - Card layouts apropiados

3. **Type Definitions**
   - `User`, `LoginCredentials` interfaces correctas
   - TypeScript setup funcional

---

## 🚀 **Guía del Proyecto Limpio**

### **1. Inicialización**

```bash
# Crear proyecto nuevo
npx create-next-app@latest microgreens-clean \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --use-npm

cd microgreens-clean

# Instalar dependencias esenciales
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-alert-dialog
```

### **2. Estructura de Archivos Limpia**

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Página de login simple
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard principal
│   │   └── layout.tsx            # Layout con auth check
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/redirect
├── components/
│   ├── ui/                       # Shadcn components básicos
│   └── auth/
│       └── LoginForm.tsx         # Formulario simple
├── lib/
│   ├── auth.ts                   # Auth client SOLO para backend real
│   ├── types.ts                  # Types básicos
│   └── utils.ts                  # Utilities
└── contexts/
    └── AuthContext.tsx           # Context simple, sin providers complejos
```

### **3. Auth Real (NO MOCKS)**

#### **`lib/auth.ts`** - Cliente HTTP Simple

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const API_BASE = 'https://micro-greens-backend.vercel.app';

// NO MOCKS - SOLO REAL API
export const authAPI = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // CRÍTICO para JWT cookies
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.user;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
};
```

#### **`contexts/AuthContext.tsx`** - Context Minimalista

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, authAPI } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    authAPI.getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const user = await authAPI.login(credentials);
    setUser(user);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### **`components/auth/LoginForm.tsx`** - Formulario Simple

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setCredentials({ email: 'demo@microgreens.com', password: 'demo123' });
    
    try {
      setLoading(true);
      await login({ email: 'demo@microgreens.com', password: 'demo123' });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
          className="w-full p-3 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
          className="w-full p-3 border rounded"
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full p-3 bg-green-600 text-white rounded"
          disabled={loading}
        >
          Demo Login
        </button>
      </form>
    </div>
  );
}
```

#### **`app/(dashboard)/layout.tsx`** - Layout con Auth Check

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">MicroGreens</h1>
              <LogoutButton />
            </div>
          </nav>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
```

#### **`components/auth/AuthGuard.tsx`** - Protección Simple

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### **4. Setup del Proyecto**

#### **`app/layout.tsx`** - Root Layout

```typescript
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

#### **`app/page.tsx`** - Home/Redirect

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return <div>Redirecting...</div>;
}
```

---

## 🔍 **Testing Checklist**

### **Verificaciones Básicas:**

1. **✅ JavaScript se ejecuta**
   ```typescript
   // En LoginForm, primer log que debe aparecer:
   console.log('LoginForm mounted');
   ```

2. **✅ Clicks funcionan**
   ```typescript
   onClick={() => console.log('Button clicked')}
   ```

3. **✅ API calls se hacen**
   ```typescript
   // En authAPI.login, log antes del fetch:
   console.log('Making API call to:', url);
   ```

4. **✅ Network requests aparecen**
   - Abrir DevTools > Network
   - Debería verse request a `/api/auth/login`

5. **✅ Cookies se setean**
   - DevTools > Application > Cookies
   - Buscar JWT cookie del dominio backend

### **Test de Flujo Completo:**

1. Página inicial → Redirect a `/login` ✅
2. Login form se renderiza ✅  
3. Demo button funciona ✅
4. API call se hace con credenciales ✅
5. JWT cookie se recibe ✅
6. Redirect a `/dashboard` ✅
7. AuthGuard permite acceso ✅

---

## 🚨 **Anti-Patterns a Evitar**

### ❌ **NO hacer:**

1. **No usar mocks**
   ```typescript
   // NUNCA
   const mockAuth = { ... }
   ```

2. **No sobrecomplicar el context**
   ```typescript
   // MALO
   useEffect(() => {
     const initAuth = async () => {
       try { /* 50 lines of code */ }
       catch { /* error handling hell */ }
       finally { /* cleanup complexity */ }
     }
   }, []);
   ```

3. **No crear adaptadores innecesarios**
   ```typescript
   // MALO  
   export const hybridAdapter = {
     transformLegacyToV2: ...
   }
   ```

4. **No usar localStorage para tokens JWT**
   ```typescript
   // MALO - JWT debe estar en cookies HttpOnly
   localStorage.setItem('token', jwt);
   ```

### ✅ **SÍ hacer:**

1. **Fetch directo al backend**
2. **Context simple con 4-5 métodos máximo**
3. **Manejo de errores básico**
4. **Cookies HttpOnly automáticas**

---

## 🎯 **Resultado Esperado**

- ⚡ **Setup en 30 minutos máximo**
- 🔐 **Auth JWT real funcionando**  
- 📱 **Login, dashboard, logout completo**
- 🚫 **Zero mocks, zero complejidad innecesaria**
- ✅ **Console.logs que SÍ aparecen**
- 🌐 **Network requests visibles**

---

## 📝 **Comandos Quick Start**

```bash
# 1. Crear proyecto
npx create-next-app@latest microgreens-clean --typescript --tailwind --app

# 2. Instalar deps
npm install lucide-react

# 3. Copiar código de esta guía

# 4. Test inmediato
npm run dev
```

**En 30 minutos deberías tener un sistema de auth completamente funcional, sin mocks, sin complejidad, y que realmente funcione.**

---

*Esta guía nace de los errores cometidos en el proyecto actual. La lección: simplicidad y auth real desde el primer día.*