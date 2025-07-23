
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { DietProvider } from '@/contexts/DietContext';
import { useDiet } from '@/contexts/DietContext';
import { FloatingDoodles } from '@/components/common/FloatingDoodles';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

// Metadata can't be in a client component, so we export it separately if needed.
// For the root layout, we'll keep it simple and define it in a wrapper if this becomes an issue.
// export const metadata: Metadata = {
//   title: 'Savora: Your AI Recipe Assistant',
//   description: 'Discover, create, and master recipes with Savora, your intelligent AI-powered culinary companion.',
// };

function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { diet } = useDiet();
  const borderClass = diet === 'veg' ? 'border-green-500' : 'border-primary';

  return (
      <div className={cn("flex min-h-screen flex-col", borderClass)}>
          <FloatingDoodles />
          <Header />
          <main className="flex-grow flex flex-col sticky-content">
            <div className="flex-grow flex flex-col">
              {children}
            </div>
          </main>
          <Footer />
      </div>
  )
}

function Root({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
          <title>Savora: Your AI Recipe Assistant</title>
          <meta name="description" content="Discover, create, and master recipes with Savora, your intelligent AI-powered culinary companion." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-body antialiased',
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
              <ThemedLayout>{children}</ThemedLayout>
              <Toaster />
            </DietProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default Root;
