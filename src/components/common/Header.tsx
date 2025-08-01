
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Leaf, Drumstick, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { useDiet } from '@/contexts/DietContext';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { AnimatedHamburgerIcon } from './AnimatedHamburgerIcon';
import { PageLoader } from './PageLoader';
import { recipes as allRecipes } from '@/lib/recipes';
import { Flag } from '../icons/Flag';
import { useUser } from '@/contexts/UserContext';


const mainNavLinks = [
  { href: '/community', label: 'Community' },
  { href: '/meal-planner', label: 'Meal Planner' },
  { href: '/news', label: 'News' },
  { href: '/dashboard', label: 'Dashboard' },
];

const menuLinks = [
    { href: '/cookbook', label: 'Cookbook' },
    { href: '/mood-kitchen', label: 'Mood Kitchen' },
    { href: '/chef-challenge', label: 'Chef\'s Challenge' },
]

function DietToggle() {
    const { diet, toggleDiet } = useDiet();
    const isVeg = diet === 'veg';

    return (
        <div 
            onClick={toggleDiet}
            className="flex items-center space-x-2 cursor-pointer p-1 rounded-full bg-secondary transition-colors"
            role="button"
            aria-label={`Switch to ${isVeg ? 'non-vegetarian' : 'vegetarian'} view`}
        >
            <div className={cn(
                "px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out",
                !isVeg ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
            )}>
                Non-Veg
            </div>
            <div className={cn(
                "px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out",
                isVeg ? 'bg-background shadow-sm border border-green-500 text-green-600 dark:text-green-500' : 'text-muted-foreground'
            )}>
                Veg
            </div>
        </div>
    );
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { diet } = useDiet();
  const { user, setUser, loading: userLoading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  }

  const availableCountries = useMemo(() => {
    const recipesToFilter = diet === 'veg' 
      ? allRecipes.filter(r => r.diet === 'veg') 
      : allRecipes;
    
    return [...new Set(recipesToFilter.map(r => r.country))].sort();
  }, [diet]);

  return (
    <>
      <header className="w-full border-b bg-background/95 sticky top-0 z-50">
        <PageLoader />
        {/* Top Tier: Logo, Search, Actions */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative grid grid-cols-3 h-24 items-center">

                {/* Left side items (Mobile Menu) */}
                 <div className="flex items-center justify-start md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <AnimatedHamburgerIcon open={isMobileMenuOpen} />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader className="p-6">
                                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                            </SheetHeader>
                            <div className="p-6 pt-0">
                                <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                                    <SavoraLogo className="h-7 w-7 text-primary" />
                                    <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
                                </Link>
                                <nav className="flex flex-col space-y-4">
                                     <Link
                                        href="/recipes"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "text-lg font-semibold transition-colors hover:text-primary",
                                            (pathname === '/recipes') ? "text-primary" : "text-foreground/70"
                                        )}
                                        >
                                        Recipes
                                    </Link>
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
                <div className="hidden md:block"></div>


                {/* Centered Logo */}
                <div className="flex justify-center items-center">
                     <Link href="/" className="flex flex-col items-center gap-1 group">
                        <div className="flex items-center gap-2">
                             <SavoraLogo className="h-10 w-10 text-primary animate-flame-flicker" />
                        </div>
                        <span className="font-extrabold text-3xl -tracking-wider text-primary hidden sm:inline animate-flame-flicker" style={{animationDelay: '0.1s'}}>Savora</span>
                    </Link>
                </div>

                {/* Right side items */}
                <div className="flex items-center justify-end space-x-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search recipes</span>
                    </Button>
                    <ThemeToggle />
                    {userLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : user ? (
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            <LogOut className="mr-2 h-4 w-4"/>
                            Logout
                        </Button>
                    ) : (
                        <Button asChild>
                          <Link href="/sign-in">Login</Link>
                        </Button>
                    )}
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className={cn("text-sm font-semibold uppercase tracking-wider hover:text-primary hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:text-primary data-[state=open]:bg-transparent", pathname.startsWith('/recipes') ? "text-primary" : "text-foreground/70")}>
                      Recipes
                      <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                         <Link href="/recipes">All Recipes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>By Country</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {availableCountries.map(country => (
                            <DropdownMenuItem key={country} asChild>
                                <Link href={`/recipes?country=${encodeURIComponent(country)}`} className="flex items-center gap-3">
                                   <Flag country={country} />
                                   <span>{country}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
                    <Button variant="ghost" className="text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-primary hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-transparent">
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
