
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
        <div className="flex flex-col justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-left">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                        Sign in here
                    </Link>
                </p>
            </div>
            <div className="grid gap-6">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" type="text" placeholder="Enter your full name" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="Enter email address" />
                  </div>
                  <div className="grid gap-2 relative">
                     <Label htmlFor="password">Password</Label>
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
             <p className="px-0 text-center text-xs text-muted-foreground">
                By creating an account, you are agreeing to our{' '}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms & Conditions
                </Link>{' '}
                and our{' '}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    </AuthLayout>
  );
}
