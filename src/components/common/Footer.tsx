import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Github, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <SavoraLogo className="h-7 w-7 text-primary" />
              <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Discover and share amazing recipes from around the world.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Recipes</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Breakfast</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Lunch</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Dinner</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Desserts</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Community</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/community" className="text-sm text-muted-foreground hover:text-primary">Community Kitchen</Link></li>
              <li><Link href="/submit-recipe" className="text-sm text-muted-foreground hover:text-primary">Submit a Recipe</Link></li>
              <li><Link href="/mood-kitchen" className="text-sm text-muted-foreground hover:text-primary">Mood Kitchen</Link></li>
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary">News & Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex mt-4 space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Savora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
