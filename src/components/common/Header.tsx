
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Leaf, Drumstick } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { useDiet } from '@/contexts/DietContext';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/community', label: 'Community' },
  { href: '/mood-kitchen', label: 'Mood Kitchen' },
  { href: '/meal-planner', label: 'Meal Planner' },
  { href: '/news', label: 'News' },
];

function DietToggle() {
    const { diet, toggleDiet } = useDiet();
    const isVeg = diet === 'veg';

    return (
        <div className="flex items-center space-x-2">
            <Drumstick className={cn("h-5 w-5 transition-colors", !isVeg ? 'text-primary' : 'text-muted-foreground')} />
            <Switch
                id="diet-mode"
                checked={isVeg}
                onCheckedChange={toggleDiet}
                aria-label="Toggle dietary preference"
            />
            <Leaf className={cn("h-5 w-5 transition-colors", isVeg ? 'text-primary' : 'text-muted-foreground')} />
        </div>
    );
}


export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

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

  const finalNavLinks = user ? [...navLinks, { href: '/dashboard', label: 'Dashboard' }] : navLinks;

  return (
    <>
      <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent")}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("flex items-center justify-between transition-all duration-300", isScrolled ? "h-16" : "h-20")}>
            <Link href="/" className="flex items-center gap-2">
              <SavoraLogo className="h-7 w-7 text-primary" />
              <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              {finalNavLinks.map((link) => (
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
               <div className="hidden md:flex">
                 <DietToggle />
               </div>
               <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search recipes</span>
              </Button>
              <ThemeToggle />
              {!loading && !user && (
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
                      <nav className="flex flex-col space-y-4 mt-4">
                        {finalNavLinks.map((link) => (
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
                        <div className="pt-4 border-t">
                            <DietToggle />
                        </div>
                        {!loading && !user && (
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
