import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo checkeamos cookies ya que el middleware se ejecuta en el servidor
  const token = request.cookies.get('microgreens-auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/'];
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/siembras', '/cosechas', '/estadisticas'];

  // Si está en una ruta protegida sin token, redirigir al login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si está en login con token válido, redirigir al dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Para todas las demás rutas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)  
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};