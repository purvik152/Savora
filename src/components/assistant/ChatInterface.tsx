
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { cookingAssistant } from '@/ai/flows/cooking-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, User, Sparkles, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';


interface Message {
  role: 'user' | 'model';
  content: string;
  audioDataUri?: string | null;
}

// The new format that the prompt expects
interface PromptHistoryMessage {
    isUser?: boolean;
    isModel?: boolean;
    content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          variant: 'destructive',
          title: 'Voice Search Error',
          description: "Sorry, I couldn't hear you. Please try again.",
        });
      }
    };
    
    recognitionRef.current = recognition;
  }, [toast]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };


  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Convert the message history to the format the prompt now expects
      const history: PromptHistoryMessage[] = newMessages.slice(0, -1).map(msg => ({
          isUser: msg.role === 'user',
          isModel: msg.role === 'model',
          content: msg.content,
      }));

      const result = await cookingAssistant({
        history,
        message: input,
      });
      
      if (result?.response) {
          const modelMessage: Message = { role: 'model', content: result.response, audioDataUri: result.audioDataUri };
          setMessages(prev => [...prev, modelMessage]);
          if (result.audioDataUri && audioRef.current) {
            audioRef.current.src = result.audioDataUri;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
          }
      } else {
          throw new Error("AI did not return a response.");
      }

    } catch (error) {
      console.error('Error calling cooking assistant flow:', error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, input, loading]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <Card className="h-[75vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <Image src="https://placehold.co/40x40.png" alt="Savora AI Assistant" width={40} height={40} className="rounded-full" data-ai-hint="robot logo" />
              Savora AI Cooking Assistant
            </CardTitle>
            <CardDescription>Ask me anything about cooking, recipes, or substitutions!</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                      <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarImage src="https://placehold.co/32x32.png" alt="AI Assistant" data-ai-hint="robot logo" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-sm sm:max-w-md md:max-w-lg rounded-xl px-4 py-3 shadow-md",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/128x128.png" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-4 justify-start">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarImage src="https://placehold.co/32x32.png" alt="AI Assistant" data-ai-hint="robot logo" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-sm rounded-xl px-4 py-3 shadow-md bg-secondary text-secondary-foreground">
                      <div className="flex items-center gap-2">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         <span>Savora is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., How can I substitute eggs in this recipe?"
                  className="pr-10"
                  disabled={loading}
                />
                 {isBrowserSupported && (
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceSearch}
                    className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                        isListening && 'text-destructive animate-pulse'
                    )}
                    >
                    <Mic className="h-4 w-4" />
                    <span className="sr-only">Search with voice</span>
                    </Button>
                )}
              </div>
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </Card>
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}
