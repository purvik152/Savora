
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Input } from '@/components/ui/input';
import { Recipe, recipes } from '@/lib/recipes';

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
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check login status from localStorage
    const user = localStorage.getItem('savora-user');
    setIsLoggedIn(!!user);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Close suggestions on outside click
    const handleClickOutside = (event: MouseEvent) => {
        if (
            (!desktopSearchRef.current || !desktopSearchRef.current.contains(event.target as Node)) &&
            (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target as Node))
        ) {
            setIsSuggestionsVisible(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]); // Re-check on route change
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      if (isMobileMenuOpen) {
        closeMobileMenu();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 1) {
      const queryLower = query.toLowerCase();
      const filteredSuggestions = recipes
        .filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(queryLower) ||
            recipe.description.toLowerCase().includes(queryLower) ||
            recipe.cuisine.toLowerCase().includes(queryLower) ||
            recipe.category.toLowerCase().includes(queryLower)
        )
        .slice(0, 5); // Limit suggestions
      setSuggestions(filteredSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    if(isMobileMenuOpen) {
        closeMobileMenu();
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const suggestionList = (
    <ul className="absolute top-full mt-2 w-full bg-background border border-border rounded-md shadow-lg z-50 py-1">
      {suggestions.map(recipe => (
        <li key={recipe.id}>
          <Link
            href={`/recipes/${recipe.slug}`}
            className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
            onClick={handleSuggestionClick}
          >
            {recipe.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
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
            <div ref={desktopSearchRef} className="hidden md:block relative">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search recipes..."
                    className="pl-10 h-9 w-40 lg:w-64"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (suggestions.length > 0) setIsSuggestionsVisible(true); }}
                    autoComplete="off"
                />
              </form>
              {isSuggestionsVisible && suggestions.length > 0 && suggestionList}
            </div>
            <ThemeToggle />
            {!isLoggedIn && (
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

                    <div ref={mobileSearchRef} className="relative">
                      <form onSubmit={handleSearchSubmit} className="mt-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search for recipes..."
                            className="w-full pl-10"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => { if (suggestions.length > 0) setIsSuggestionsVisible(true); }}
                            autoComplete="off"
                          />
                        </div>
                        <Button type="submit" className="w-full mt-2">Search</Button>
                      </form>
                      {isSuggestionsVisible && suggestions.length > 0 && suggestionList}
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
                      {!isLoggedIn && (
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
  );
}
