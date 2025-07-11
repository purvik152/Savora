
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { FloatingDoodles } from '@/components/common/FloatingDoodles';
import { DietProvider } from '@/contexts/DietContext';
import { AuthProvider } from '@/contexts/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Savora: Your AI Recipe Assistant',
  description: 'Discover, create, and master recipes with Savora, your intelligent AI-powered culinary companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-body antialiased flex flex-col',
          poppins.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DietProvider>
              <FloatingDoodles />
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </DietProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
