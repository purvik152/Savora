
import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { Github, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <SavoraLogo className="h-7 w-7 text-primary" />
              <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your AI-powered culinary companion to discover, create, and master recipes.
            </p>
             <div className="flex mt-4 space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="col-span-1 lg:col-start-2">
            <h3 className="font-semibold text-foreground tracking-wider">Recipes</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/recipes?q=breakfast" className="text-sm text-muted-foreground hover:text-primary">Breakfast</Link></li>
              <li><Link href="/recipes?q=lunch" className="text-sm text-muted-foreground hover:text-primary">Lunch</Link></li>
              <li><Link href="/recipes?q=dinner" className="text-sm text-muted-foreground hover:text-primary">Dinner</Link></li>
              <li><Link href="/recipes?country=Italy" className="text-sm text-muted-foreground hover:text-primary">Italian Cuisine</Link></li>
               <li><Link href="/recipes?country=India" className="text-sm text-muted-foreground hover:text-primary">Indian Cuisine</Link></li>
              <li><Link href="/recipes?country=Mexico" className="text-sm text-muted-foreground hover:text-primary">Mexican Cuisine</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground tracking-wider">Features</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/community" className="text-sm text-muted-foreground hover:text-primary">Community Kitchen</Link></li>
              <li><Link href="/submit-recipe" className="text-sm text-muted-foreground hover:text-primary">Submit a Recipe</Link></li>
              <li><Link href="/mood-kitchen" className="text-sm text-muted-foreground hover:text-primary">Mood Kitchen</Link></li>
              <li><Link href="/chef-challenge" className="text-sm text-muted-foreground hover:text-primary">Chef's Challenge</Link></li>
              <li><Link href="/meal-planner" className="text-sm text-muted-foreground hover:text-primary">Meal Planner</Link></li>
              <li><Link href="/cooking-assistant" className="text-sm text-muted-foreground hover:text-primary">AI Assistant</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold text-foreground tracking-wider">Savora</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary">News & Blog</Link></li>
               <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                 <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Savora. All rights reserved. Built with passion for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
