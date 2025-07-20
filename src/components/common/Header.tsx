
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Leaf, Drumstick } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { useDiet } from '@/contexts/DietContext';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const mainNavLinks = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/community', label: 'Community' },
  { href: '/meal-planner', label: 'Meal Planner' },
  { href: '/news', label: 'News' },
  { href: '/dashboard', label: 'Dashboard' },
];

const menuLinks = [
    { href: '/mood-kitchen', label: 'Mood Kitchen' },
    { href: '/chef-challenge', label: 'Chef\'s Challenge' },
]


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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="w-full border-b bg-background/95 sticky top-0 z-50">
        {/* Top Tier: Logo, Search, Actions */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-24 items-center">

                {/* Left side items (Mobile Menu) */}
                 <div className="flex items-center md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className="p-6">
                                <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                                    <SavoraLogo className="h-7 w-7 text-primary" />
                                    <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
                                </Link>
                                <nav className="flex flex-col space-y-4">
                                    {[...mainNavLinks, ...menuLinks].map((link) => (
                                        <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "text-lg font-semibold transition-colors hover:text-primary",
                                            (pathname === link.href) ? "text-primary" : "text-foreground/70"
                                        )}
                                        >
                                        {link.label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-8 pt-6 border-t">
                                    <DietToggle />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>


                {/* Centered Logo */}
                <div className="flex-1 flex justify-center items-center">
                     <Link href="/" className="flex flex-col items-center gap-1">
                        <SavoraLogo className="h-10 w-10 text-primary animate-pulse-slow" />
                        <span className="font-extrabold text-3xl -tracking-wider text-primary hidden sm:inline animate-pulse-slow">Savora</span>
                    </Link>
                </div>

                {/* Right side items */}
                <div className="flex items-center space-x-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search recipes</span>
                    </Button>
                    <ThemeToggle />
                    <Button asChild>
                      <Link href="/sign-in">Login</Link>
                    </Button>
                </div>
            </div>
        </div>

        {/* Bottom Tier: Main Navigation */}
        <div className="hidden md:flex h-12 items-center justify-center border-t bg-secondary/50">
            <nav className="flex items-center space-x-8">
                <Link
                href="/"
                className={cn(
                    "text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary",
                    (pathname === "/") ? "text-primary" : "text-foreground/70"
                )}
                >
                Home
                </Link>
                {mainNavLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary",
                        (pathname.startsWith(link.href) && link.href !== '/') ? "text-primary" : "text-foreground/70"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-primary hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {menuLinks.map(link => (
                        <DropdownMenuItem key={link.href} asChild>
                            <Link href={link.href}>{link.label}</Link>
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                 <DietToggle />
            </nav>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
