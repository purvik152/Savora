
'use client';

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Utensils, Loader2, Heart, Download, LogOut } from "lucide-react";
import Image from "next/image";
import { getPastRecipes, getFavoriteRecipes, isRecipeAvailableOffline, saveRecipeForOffline } from '@/lib/user-data';
import { type Recipe } from "@/lib/recipes";
import { useToast } from "@/hooks/use-toast";
import { useDiet } from "@/contexts/DietContext";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from 'next/navigation';


function FavoritesList() {
    const { user } = useUser();
    const { toast } = useToast();
    const { diet } = useDiet();
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [offlineStatus, setOfflineStatus] = useState<Record<string, boolean>>({});
    const [downloading, setDownloading] = useState<Record<string, boolean>>({});
    
    useEffect(() => {
        if (!user) return;
        const favs = getFavoriteRecipes(user.id);
        setFavoriteRecipes(favs);
        const status: Record<string, boolean> = {};
        favs.forEach(recipe => {
            status[recipe.slug] = isRecipeAvailableOffline(recipe.slug, user.id);
        });
        setOfflineStatus(status);
    }, [user]);

    const handleDownload = async (recipe: Recipe) => {
        if (!user) return;
        setDownloading(prev => ({ ...prev, [recipe.slug]: true }));
        try {
            await saveRecipeForOffline(recipe, user.id);
            setOfflineStatus(prev => ({ ...prev, [recipe.slug]: true }));
            toast({
                title: "Recipe Saved Offline",
                description: `"${recipe.title}" is now available for offline use.`
            });
        } catch (error) {
            console.error("Failed to save recipe for offline:", error);
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'Could not save the recipe for offline use. Please try again.'
            });
        } finally {
            setDownloading(prev => ({ ...prev, [recipe.slug]: false }));
        }
    };
    
    const filteredFavoriteRecipes = useMemo(() => {
        if (diet === 'veg') {
            return favoriteRecipes.filter(r => r.diet === 'veg');
        }
        return favoriteRecipes.filter(r => r.diet === 'non-veg' || r.diet === 'all');
    }, [diet, favoriteRecipes]);

    if (!user) return null;

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart /> Favorites</CardTitle>
              <CardDescription>Your all-time favorite recipes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFavoriteRecipes.length > 0 ? (
                  filteredFavoriteRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50">
                      <Link href={`/recipes/${recipe.slug}`} className="block flex-shrink-0">
                        <Image src={recipe.image} alt={recipe.title} width={64} height={64} className="rounded-lg object-cover" data-ai-hint={recipe.imageHint} />
                      </Link>
                       <div className="flex-grow">
                         <Link href={offlineStatus[recipe.slug] ? `/dashboard/offline/${recipe.slug}` : `/recipes/${recipe.slug}`}>
                           <h3 className="font-semibold hover:underline">{recipe.title}</h3>
                         </Link>
                         <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
                       </div>
                       <Button 
                           variant="outline" 
                           size="icon"
                           onClick={() => handleDownload(recipe)}
                           disabled={offlineStatus[recipe.slug] || downloading[recipe.slug]}
                           className={cn(offlineStatus[recipe.slug] && "border-green-500 text-green-500")}
                           title={offlineStatus[recipe.slug] ? 'Available Offline' : 'Download for Offline Use'}
                       >
                           {downloading[recipe.slug] ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                               <Download className="h-4 w-4" />
                           )}
                       </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">You haven't favorited any recipes in this view yet.</p>
                )}
              </div>
            </CardContent>
        </Card>
    );
}


export default function DashboardPage() {
  const { diet } = useDiet();
  const { user, setUser } = useUser();
  const router = useRouter();
  
  const [pastRecipes, setPastRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (user) {
        setPastRecipes(getPastRecipes(user.id));
        setFavoriteRecipes(getFavoriteRecipes(user.id));
    } else {
        // If no user, redirect to sign-in page
        router.push('/sign-in');
    }
  }, [user, router]);


  const filteredPastRecipes = useMemo(() => {
    if (diet === 'veg') {
        return pastRecipes.filter(r => r.diet === 'veg');
    }
    return pastRecipes.filter(r => r.diet === 'non-veg' || r.diet === 'all');
  }, [diet, pastRecipes]);

  const filteredFavoriteRecipes = useMemo(() => {
    if (diet === 'veg') {
        return favoriteRecipes.filter(r => r.diet === 'veg');
    }
    return favoriteRecipes.filter(r => r.diet === 'non-veg' || r.diet === 'all');
  }, [diet, favoriteRecipes]);

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  }

  if (!user) {
    return (
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-8 md:py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to sign-in...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 animate-fade-in-up">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={user.avatar || "https://placehold.co/128x128.png"} alt={user.name} data-ai-hint="avatar user" />
            <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{filteredPastRecipes.length}</p>
              <p className="text-sm">Recipes Tried</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{filteredFavoriteRecipes.length}</p>
              <p className="text-sm">Favorites</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
             <Button asChild variant="outline">
                <Link href="/user-profile"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
             </Button>
             <Button onClick={handleLogout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils /> Past Recipes</CardTitle>
              <CardDescription>A log of all the delicious meals you've cooked.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPastRecipes.length > 0 ? (
                  filteredPastRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50">
                      <Image src={recipe.image} alt={recipe.title} width={80} height={60} className="rounded-lg object-cover" data-ai-hint={recipe.imageHint} />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{recipe.title}</h3>
                        <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/recipes/${recipe.slug}`}>Cook Again</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">You haven't cooked any recipes in this view yet. Go explore!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <FavoritesList />
        </div>
      </div>
    </div>
  );
}
