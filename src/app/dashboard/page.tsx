
'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Utensils, Loader2, Heart, LogOut, Shield, HeartPulse, Sparkles, Download } from "lucide-react";
import Image from "next/image";
import { getPastRecipes, getFavoriteRecipes, isRecipeAvailableOffline, saveRecipeForOffline } from "@/lib/user-data";
import { recipes as allRecipes, type Recipe } from "@/lib/recipes";
import { useToast } from "@/hooks/use-toast";
import { useDiet } from "@/contexts/DietContext";
import { getActivityBasedSuggestions, ActivityBasedSuggestionsOutput } from "@/ai/flows/activity-based-suggestions-flow";
import { SuggestionCard } from "@/components/mood-kitchen/SuggestionCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";


function LoadingDashboard() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8 md:py-12">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
    </div>
  );
}

function ActivityTracker() {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [suggestions, setSuggestions] = useState<ActivityBasedSuggestionsOutput['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { diet } = useDiet();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data from a health tracker
    setSteps(Math.floor(Math.random() * 15000) + 500);
    setCalories(Math.floor(Math.random() * 800) + 100);
  }, []);

  const activeRecipes = useMemo(() => {
    const baseRecipes = diet === 'veg' ? allRecipes.filter(r => r.diet === 'veg') : allRecipes.filter(r => r.diet !== 'veg');
    return baseRecipes.map(({ slug, title, description, nutrition }) => ({ 
      slug, 
      title, 
      description, 
      calories: nutrition.calories 
    }));
  }, [diet]);

  const getActivityLevel = (): "low" | "moderate" | "high" => {
    if (steps < 5000) return "low";
    if (steps < 10000) return "moderate";
    return "high";
  }

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    try {
      const result = await getActivityBasedSuggestions({
        activityLevel: getActivityLevel(),
        caloriesBurned: calories,
        recipes: activeRecipes,
      });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        toast({ title: "Here are some great ways to refuel!" });
      } else {
        setError("Couldn't find any specific suggestions for your activity level right now.");
      }
    } catch (e) {
      console.error(e);
      setError("An AI error occurred. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><HeartPulse /> Today&apos;s Activity</CardTitle>
        <CardDescription>Suggestions based on your (simulated) health data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center p-4 bg-secondary rounded-lg">
          <div>
            <p className="text-2xl font-bold text-foreground">{steps.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Steps</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{calories.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Calories Burned</p>
          </div>
        </div>
        <Button onClick={handleGetSuggestions} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
            Suggest a Recipe
        </Button>
        <div className="mt-4 space-y-4">
          {error && (
              <Alert variant="destructive">
                  <AlertTitle>Suggestion Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          {suggestions.map(({ slug, reason }) => {
            const recipe = allRecipes.find(r => r.slug === slug);
            if (!recipe) return null;
            return <SuggestionCard key={slug} recipe={recipe} reason={reason} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function FavoritesList() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { diet } = useDiet();
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [offlineStatus, setOfflineStatus] = useState<Record<number, boolean>>({});
    const [downloading, setDownloading] = useState<Record<number, boolean>>({});
    
    useEffect(() => {
        if (user) {
            const favs = getFavoriteRecipes(user.uid);
            setFavoriteRecipes(favs);
            const status: Record<number, boolean> = {};
            favs.forEach(recipe => {
                status[recipe.id] = isRecipeAvailableOffline(recipe.id, user.uid);
            });
            setOfflineStatus(status);
        }
    }, [user]);

    const handleDownload = async (recipe: Recipe) => {
        if (!user) return;
        setDownloading(prev => ({ ...prev, [recipe.id]: true }));
        try {
            await saveRecipeForOffline(recipe, user.uid);
            setOfflineStatus(prev => ({ ...prev, [recipe.id]: true }));
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
            setDownloading(prev => ({ ...prev, [recipe.id]: false }));
        }
    };
    
    const filteredFavoriteRecipes = useMemo(() => {
        if (diet === 'veg') {
            return favoriteRecipes.filter(r => r.diet === 'veg');
        }
        return favoriteRecipes.filter(r => r.diet === 'non-veg');
    }, [diet, favoriteRecipes]);

    return (
        <Card>
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
                         <Link href={offlineStatus[recipe.id] ? `/dashboard/offline/${recipe.slug}` : `/recipes/${recipe.slug}`}>
                           <h3 className="font-semibold hover:underline">{recipe.title}</h3>
                         </Link>
                         <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
                       </div>
                       <Button 
                           variant="outline" 
                           size="icon"
                           onClick={() => handleDownload(recipe)}
                           disabled={offlineStatus[recipe.id] || downloading[recipe.id]}
                           className={cn(offlineStatus[recipe.id] && "border-green-500 text-green-500")}
                           title={offlineStatus[recipe.id] ? 'Available Offline' : 'Download for Offline Use'}
                       >
                           {downloading[recipe.id] ? (
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
  const { user, userRole, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { diet } = useDiet();

  const [avatarSrc, setAvatarSrc] = useState('https://placehold.co/128x128.png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pastRecipes, setPastRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // User is logged in, fetch their data
        const storedAvatar = localStorage.getItem(`savora-avatar_${user.email}`);
        if (storedAvatar) {
          setAvatarSrc(storedAvatar);
        }
        setPastRecipes(getPastRecipes(user.uid));
        setFavoriteRecipes(getFavoriteRecipes(user.uid));
      }
    }
  }, [user, loading, router]);


  const filteredPastRecipes = useMemo(() => {
    if (diet === 'veg') {
        return pastRecipes.filter(r => r.diet === 'veg');
    }
    return pastRecipes.filter(r => r.diet === 'non-veg');
  }, [diet, pastRecipes]);

  const filteredFavoriteRecipes = useMemo(() => {
    if (diet === 'veg') {
        return favoriteRecipes.filter(r => r.diet === 'veg');
    }
    return favoriteRecipes.filter(r => r.diet === 'non-veg');
  }, [diet, favoriteRecipes]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type, 0.9); // Use file's mime type, jpeg with quality 0.9
          setAvatarSrc(dataUrl);
          try {
            localStorage.setItem(`savora-avatar_${user.email}`, dataUrl);
          } catch (error) {
            console.error(error);
            toast({
              variant: 'destructive',
              title: 'Could not save avatar',
              description: 'The image might still be too large. Please try a smaller one.',
            });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };
  
  if (loading || !user) {
    return <LoadingDashboard />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={avatarSrc} alt={user.displayName || 'User'} data-ai-hint="avatar user" />
            <AvatarFallback>{user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'SU'}</AvatarFallback>
          </Avatar>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={handleEditClick}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{user.displayName || 'Savora User'}</h1>
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
             <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              {userRole === 'admin' && (
                <Button asChild>
                    <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                    </Link>
                </Button>
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <ActivityTracker />
          <Card>
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
