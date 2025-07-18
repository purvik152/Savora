
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Leaf, Drumstick, X } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { useDiet } from '@/contexts/DietContext';
import { Switch } from '@/components/ui/switch';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/community', label: 'Community' },
  { href: '/mood-kitchen', label: 'Mood Kitchen' },
  { href: '/chef-challenge', label: 'Chef\'s Challenge' },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const finalNavLinks = isSignedIn ? [...navLinks, { href: '/dashboard', label: 'Dashboard' }] : navLinks;

  return (
    <>
      <header className="w-full border-b bg-background/95">
        {/* Top Tier: Logo, Search, Actions */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-24 items-center justify-between">
                <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
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
                                <nav className="flex flex-col space-y-4">
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
                                </nav>
                                <div className="pt-6 mt-6 border-t">
                                    <DietToggle />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="flex flex-col items-center gap-1">
                        <SavoraLogo className="h-10 w-10 text-primary" />
                        <span className="font-extrabold text-3xl -tracking-wider text-primary">Savora</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search recipes</span>
                    </Button>
                    <div className="hidden md:flex">
                        <DietToggle />
                    </div>
                    <ThemeToggle />
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <Button asChild>
                        <Link href="/sign-in">Login</Link>
                        </Button>
                    </SignedOut>
                </div>
            </div>
        </div>

        {/* Bottom Tier: Main Navigation */}
        <div className="hidden md:flex h-12 items-center justify-center border-t bg-secondary/50">
            <nav className="flex items-center space-x-8">
                {finalNavLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary",
                        (pathname === link.href || (link.href.startsWith('/#') && pathname === '/')) ? "text-primary" : "text-foreground/70"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
