
'use client';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SavoraLogo } from '../icons/SavoraLogo';
import { CheckCircle, LogIn, User } from 'lucide-react';
import Link from 'next/link';

interface LoginSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

const benefits = [
    "Personalized Recipe Dashboard",
    "Save Your Cooking History",
    "Favorite Recipes for Quick Access",
    "Voice-guided Cooking Assistant",
    "Personalized Health Tips & Food News"
];

export function LoginSuggestionDialog({ open, onOpenChange, onContinue }: LoginSuggestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
            <SavoraLogo className="h-12 w-12 text-primary" />
            <DialogTitle className="text-2xl">Enjoy More with Savora!</DialogTitle>
            <DialogDescription>
                Sign in to unlock all personalized features.
            </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-col sm:space-x-0 gap-3">
            <Button asChild size="lg">
                <Link href="/sign-in">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login or Create Account
                </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={onContinue}>
                 <User className="mr-2 h-4 w-4" />
                 Continue without Login
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
