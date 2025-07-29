
'use client';

import { SavoraLogo } from '@/components/icons/SavoraLogo';
import { ChefHat, Utensils, WandSparkles } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: <WandSparkles className="h-8 w-8 text-primary" />,
        title: "AI-Powered Meal Planning",
        description: "Generate weekly meal plans or discover recipes based on your mood and the ingredients you already have.",
    },
    {
        icon: <Utensils className="h-8 w-8 text-primary" />,
        title: "Hands-Free Cooking Assistant",
        description: "Navigate recipes with voice commands. Start, stop, and get step-by-step guidance without touching your screen.",
    },
    {
        icon: <ChefHat className="h-8 w-8 text-primary" />,
        title: "Community Kitchen",
        description: "Join a vibrant community of home cooks. Share your own creations and get inspired by others.",
    },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-10rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-0">
        <div className="mx-auto grid w-[350px] gap-6">{children}</div>
      </div>
      <div className="hidden bg-secondary lg:flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 w-full h-1.5 bg-accent" />
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-foreground">
            <SavoraLogo className="h-8 w-8 text-primary" />
            <span className="font-extrabold text-2xl -tracking-wider text-primary">Savora</span>
        </Link>
        <div className="max-w-md w-full space-y-8 z-10">
            <div>
                 <h2 className="text-3xl font-bold">Welcome to Savora</h2>
                 <p className="text-muted-foreground mt-2">Your AI-powered culinary companion.</p>
            </div>
            <div className="space-y-6">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-14 w-14 rounded-lg bg-background flex items-center justify-center">
                            {feature.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
