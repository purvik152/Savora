
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
                <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
                <p className="text-sm text-muted-foreground">
                Don&apos;t have an account yet?{' '}
                <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                    Sign up here
                </Link>
                </p>
            </div>
            <div className="grid gap-6">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="Enter email address" />
                  </div>
                  <div className="grid gap-2 relative">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                            Forgot password?
                        </Link>
                    </div>
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Sign In
                  </Button>
                </div>
              </form>
            </div>
             <p className="px-0 text-center text-xs text-muted-foreground">
                By signing in or creating an account, you are agreeing to our{' '}
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
