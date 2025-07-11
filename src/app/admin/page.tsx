
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Users, BarChart, FilePlus, LogOut } from 'lucide-react';
import Link from 'next/link';

function AdminDashboard() {
  const { user, userRole, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole !== 'admin') {
        router.push('/dashboard'); // Redirect non-admins to the user dashboard
      }
    }
  }, [user, userRole, loading, router]);

  if (loading || !user || userRole !== 'admin') {
    return (
      <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-8 md:py-12">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div className='text-center md:text-left'>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome, {user.displayName || user.email}.</p>
            </div>
            <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Users /> User Management</CardTitle>
                    <CardDescription>View and manage all users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="#">Manage Users</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><FilePlus /> Recipe Management</CardTitle>
                    <CardDescription>Add, edit, or delete site-wide recipes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/recipes">Manage Recipes</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><BarChart /> Site Analytics</CardTitle>
                    <CardDescription>Monitor recipe popularity and user activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                       <Link href="#">View Analytics</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><ShieldCheck /> Admin Actions</CardTitle>
                    <CardDescription>Perform administrative tasks and manage site settings.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button variant="secondary">Approve Community Submissions</Button>
                    <Button variant="secondary">Manage Content Categories</Button>
                    <Button variant="destructive">System Health Check</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


export default function AdminPage() {
    return <AdminDashboard />;
}
