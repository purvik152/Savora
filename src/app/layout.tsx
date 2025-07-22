
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
            <DietProvider>
              <div className="relative flex flex-col min-h-screen border-t-4 border-primary">
                <FloatingDoodles />
                <Header />
                <main className="flex-grow flex-1 flex flex-col">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </DietProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
