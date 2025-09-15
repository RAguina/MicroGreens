import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/calendar.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationContainer from '@/components/ui/NotificationToast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "MicroGreens",
  description: "Sistema de gestión de microverdes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <NotificationContainer />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
