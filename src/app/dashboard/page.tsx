
'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Heart, Utensils, Star, Loader2 } from "lucide-react";
import Image from "next/image";

const pastRecipes = [
    { id: 1, name: "Spaghetti Carbonara", image: "https://spoonacular.com/recipeImages/660261-636x393.jpg", rating: 4 },
    { id: 2, name: "Chicken Tikka Masala", image: "https://spoonacular.com/recipeImages/638329-636x393.jpg", rating: 5 },
    { id: 3, name: "Classic Beef Tacos", image: "https://spoonacular.com/recipeImages/634458-636x393.jpg", rating: 4 },
  ];
  
  const favoriteRecipes = [
    { id: 1, name: "Avocado Toast", image: "https://spoonacular.com/recipeImages/633221-636x393.jpg", cuisine: "American" },
    { id: 2, name: "Vegan Pad Thai", image: "https://spoonacular.com/recipeImages/664547-636x393.jpg", cuisine: "Thai" },
  ];

interface User {
  username: string;
  email: string;
}

function LoadingDashboard() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8 md:py-12">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatarSrc, setAvatarSrc] = useState('https://placehold.co/128x128.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This code runs only on the client
    const storedUser = localStorage.getItem('savora-user');
    const storedAvatar = localStorage.getItem('savora-avatar');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user, redirect to login
      router.push('/login');
    }

    if (storedAvatar) {
      setAvatarSrc(storedAvatar);
    }
  }, [router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setAvatarSrc(result);
          localStorage.setItem('savora-avatar', result); // Save avatar to localStorage
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };
  
  if (!user) {
    return <LoadingDashboard />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={avatarSrc} alt={user.username} data-ai-hint="avatar user" />
            <AvatarFallback>{user.username ? user.username.substring(0, 2).toUpperCase() : 'SU'}</AvatarFallback>
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
          <h1 className="text-4xl font-bold">{user.username}</h1>
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
