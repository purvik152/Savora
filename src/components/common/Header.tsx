"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/news', label: 'News' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const user = localStorage.getItem('savora-user');
      setIsLoggedIn(!!user);
    }
  }, [pathname, hasMounted]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', down);
    };
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent")}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <SavoraLogo className="h-7 w-7 text-primary" />
              <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    (pathname === link.href || (link.href.startsWith('/#') && pathname === '/')) ? "text-primary" : "text-foreground/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <Button
                  variant="outline"
                  className="h-9 w-40 lg:w-64 justify-start text-muted-foreground"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search recipes...
                  <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
              <ThemeToggle />
              {hasMounted && !isLoggedIn && (
                  <Button asChild>
                      <Link href="/login">Login</Link>
                  </Button>
              )}
              
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-8">
                         <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                           <SavoraLogo className="h-7 w-7 text-primary" />
                           <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
                         </Link>
                         <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                           <X className="h-6 w-6"/>
                         </Button>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-start text-muted-foreground"
                          onClick={() => {
                            setIsSearchOpen(true);
                            closeMobileMenu();
                          }}
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Search recipes...
                        </Button>
                      </div>

                      <nav className="flex flex-col space-y-4 mt-4">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMobileMenu}
                            className={cn(
                              "text-lg font-medium transition-colors hover:text-primary",
                              pathname === link.href ? "text-primary" : "text-foreground"
                            )}
                          >
                            {link.label}
                          </Link>
                        ))}
                        {hasMounted && !isLoggedIn && (
                           <Button asChild onClick={closeMobileMenu}>
                              <Link href="/login">Login</Link>
                           </Button>
                        )}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
