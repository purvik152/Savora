
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChatInterface } from '../assistant/ChatInterface';
import { Button } from '../ui/button';
import { SavoraLogo } from '../icons/SavoraLogo';
import { MessageSquare } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
                <Button className="fixed bottom-8 right-8 hidden lg:flex h-16 w-16 rounded-full shadow-2xl z-20 animate-pulse-slow hover:animate-none group" size="icon">
                    <SavoraLogo className="h-9 w-9 text-primary-foreground transition-transform duration-300 ease-in-out group-hover:scale-110" />
                    <span className="sr-only">Open AI Assistant</span>
                </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" className="mb-2">
            <p>Chat with Savvy!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-2xl md:max-w-4xl p-0 h-[85vh] flex flex-col rounded-sm shadow-xl">
          <DialogHeader className="sr-only">
              <DialogTitle>Savvy - AI Cooking Assistant</DialogTitle>
          </DialogHeader>
          <ChatInterface isDialog={true} />
      </DialogContent>
    </Dialog>
  );
}
