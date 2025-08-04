
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { cookingAssistant } from '@/ai/flows/cooking-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, User, Sparkles, Mic, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';


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

interface ChatInterfaceProps {
    isDialog?: boolean;
}

export function ChatInterface({ isDialog = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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
        isAudioEnabled,
      });
      
      if (result?.response) {
          const modelMessage: Message = { role: 'model', content: result.response, audioDataUri: result.audioDataUri };
          setMessages(prev => [...prev, modelMessage]);
          if (isAudioEnabled && result.audioDataUri && audioRef.current) {
            audioRef.current.src = result.audioDataUri;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
          }
      } else {
          throw new Error("The AI flow did not return a valid response, so no audio could be generated.");
      }

    } catch (error: any) {
        console.error('Error calling cooking assistant flow:', error);
        let errorMessageContent = "Sorry, I encountered an error. Please try again.";
        // Check if the error message from the flow should be displayed
        if (error.message && error.message.includes("The AI flow did not return a valid response")) {
            errorMessageContent = error.message;
        }
        const errorMessage: Message = { role: 'model', content: errorMessageContent };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, input, loading, isAudioEnabled]);
  
  const ChatContainer = isDialog ? 'div' : Card;
  const chatContainerProps = isDialog ? { className: "h-full flex flex-col" } : { className: "h-[75vh] flex flex-col" };


  return (
    <div className={cn(!isDialog && "container mx-auto px-4 py-8 md:py-16")}>
      <div className={cn(!isDialog && "max-w-3xl mx-auto")}>
        <ChatContainer {...chatContainerProps}>
          <CardHeader className="border-b flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Image src="/images/ai-logo.png" alt="Savora AI Assistant" width={40} height={40} className="rounded-full" />
                Savora AI Cooking Assistant
              </CardTitle>
              <CardDescription>Ask me anything about cooking, recipes, or substitutions!</CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                <Switch 
                    id="audio-responses" 
                    checked={isAudioEnabled}
                    onCheckedChange={setIsAudioEnabled}
                />
                <Label htmlFor="audio-responses" className="flex items-center gap-1">
                    {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground"/>}
                    <span className="sr-only">Spoken Responses</span>
                </Label>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground pt-16">
                        <Bot className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-semibold">Hello there!</p>
                        <p className="text-sm">How can I help you in the kitchen today?</p>
                    </div>
                )}
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
                        <AvatarImage src="/images/ai-logo.png" alt="AI Assistant" />
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
                      <AvatarImage src="/images/ai-logo.png" alt="AI Assistant" />
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
        </ChatContainer>
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}
