'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Heart, Utensils, Star, Loader2 } from "lucide-react";
import Image from "next/image";

const pastRecipes = [
    { id: 1, name: "Spaghetti Carbonara", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&h=200&fit=crop", rating: 4 },
    { id: 2, name: "Chicken Tikka Masala", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&h=200&fit=crop", rating: 5 },
    { id: 3, name: "Classic Beef Tacos", image: "https://images.unsplash.com/photo-1599423300042-4c89e578a934?q=80&w=300&h=200&fit=crop", rating: 4 },
  ];
  
  const favoriteRecipes = [
    { id: 1, name: "Avocado Toast", image: "https://images.unsplash.com/photo-1584308666744-8480436158ae?q=80&w=300&h=200&fit=crop", cuisine: "American" },
    { id: 2, name: "Vegan Pad Thai", image: "https://images.unsplash.com/photo-1629896599245-75b51079315d?q=80&w=300&h=200&fit=crop", cuisine: "Thai" },
  ];


export default function DashboardPage() {
  const { user, loading, firebaseEnabled } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && firebaseEnabled) {
      router.push('/');
    }
  }, [user, loading, router, firebaseEnabled]);

  const getAvatarFallback = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Please log in to view your dashboard.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{getAvatarFallback(user.displayName)}</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{user.displayName || 'Anonymous User'}</h1>
          <p className="text-muted-foreground mt-1">Lover of all things pasta.</p>
          <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm">Recipes Tried</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-sm">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils /> Past Recipes</CardTitle>
              <CardDescription>A log of all the delicious meals you've cooked.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastRecipes.map(recipe => (
                  <div key={recipe.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50">
                    <Image src={recipe.image} alt={recipe.name} width={80} height={60} className="rounded-md object-cover" />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{recipe.name}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`h-4 w-4 ${i < recipe.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} />
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Cook Again</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart /> Favorites</CardTitle>
              <CardDescription>Your all-time favorite recipes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favoriteRecipes.map(recipe => (
                  <div key={recipe.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-secondary/50">
                     <Image src={recipe.image} alt={recipe.name} width={64} height={64} className="rounded-full object-cover" />
                     <div>
                       <h3 className="font-semibold">{recipe.name}</h3>
                       <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
