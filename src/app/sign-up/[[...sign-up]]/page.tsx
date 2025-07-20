
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
            </div>
             <Button className="w-full">Create Account</Button>
             <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                    Sign In
                </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
