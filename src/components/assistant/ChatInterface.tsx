
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { cookingAssistant } from '@/ai/flows/cooking-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Sparkles, Mic, MessageSquare, Power, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  audioDataUri?: string | null;
}

interface PromptHistoryMessage {
    isUser?: boolean;
    isModel?: boolean;
    content: string;
}

interface ChatInterfaceProps {
    isDialog?: boolean;
}

let messageIdCounter = 0;

const TypingEffect = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
  
    useEffect(() => {
      setDisplayedText('');
      let index = 0;
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        if (index >= text.length) {
          clearInterval(intervalId);
          onComplete();
        }
      }, 20);
  
      return () => clearInterval(intervalId);
    }, [text, onComplete]);
  
    return <p className="text-sm whitespace-pre-wrap">{displayedText}</p>;
};

const examplePrompts = [
    "How do I substitute eggs in a recipe?",
    "What's a good recipe for a quick dinner?",
    "Tell me about the Mood Kitchen feature.",
];

export function ChatInterface({ isDialog = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);


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
      handleSendMessage(event, transcript);
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
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, loading, isTyping]);


  const handleSendMessage = useCallback(async (e: React.FormEvent | Event, messageOverride?: string) => {
    e.preventDefault();
    
    const messageContent = messageOverride ?? input;
    if (!messageContent.trim() || loading) return;

    const userMessage: Message = { id: `user-${messageIdCounter++}`, role: 'user', content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const history: PromptHistoryMessage[] = newMessages.slice(0, -1).map(msg => ({
          isUser: msg.role === 'user',
          isModel: msg.role === 'model',
          content: msg.content,
      }));

      const result = await cookingAssistant({
        history,
        message: messageContent,
      });
      
      if (result?.response) {
          const modelMessage: Message = { id: `model-${messageIdCounter++}`, role: 'model', content: result.response, audioDataUri: result.audioDataUri };
          setMessages(prev => [...prev, modelMessage]);
          if(voiceOutputEnabled && result.audioDataUri) {
              if(audioRef.current) {
                setCurrentlyPlaying(modelMessage.id);
                audioRef.current.src = result.audioDataUri;
                audioRef.current.play();
              }
          }
      } else {
          throw new Error("The AI flow did not return a valid response.");
      }

    } catch (error: any) {
        console.error('Error calling cooking assistant flow:', error);
        let errorMessageContent = "Sorry, I encountered an error. Please try again.";
        const errorMessage: Message = { id: `model-${messageIdCounter++}`, role: 'model', content: errorMessageContent };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, input, loading, voiceOutputEnabled]);
  
  const handlePlayAudio = (message: Message) => {
    if (!audioRef.current || !message.audioDataUri) return;

    if (currentlyPlaying === message.id) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentlyPlaying(null);
    } else {
        setCurrentlyPlaying(message.id);
        audioRef.current.src = message.audioDataUri;
        audioRef.current.play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => setCurrentlyPlaying(null);
    audio?.addEventListener('ended', onEnded);
    return () => {
        audio?.removeEventListener('ended', onEnded);
    }
  }, []);

  const ChatContainer = isDialog ? 'div' : Card;
  const chatContainerProps = isDialog ? { className: "h-full flex flex-col flex-1 bg-background" } : { className: "h-[85vh] flex flex-col shadow-2xl rounded-lg" };

  return (
    <div className={cn(!isDialog && "container mx-auto px-4 py-8", isDialog && "h-full flex-1 flex flex-col")}>
      <div className={cn(!isDialog && "max-w-4xl mx-auto", isDialog && "h-full flex flex-col")}>
        <ChatContainer {...chatContainerProps}>
          <CardHeader className="border-b-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-primary/50">
                            <AvatarImage src="/images/ai-logo.png" alt="AI Assistant" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                     </div>
                     <div>
                        <CardTitle className="text-xl">Savvy - AI Cooking Assistant</CardTitle>
                        <CardDescription className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 inline-block"/>Online</CardDescription>
                     </div>
                </div>
                <Button 
                    variant={voiceOutputEnabled ? "outline" : "secondary"}
                    size="icon"
                    onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                    className="rounded-full"
                    title={voiceOutputEnabled ? "Disable voice output" : "Enable voice output"}
                    >
                    {voiceOutputEnabled ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5"/>}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground pt-10 animate-fade-in-up">
                        <MessageSquare className="h-16 w-16 mx-auto mb-6 text-primary/80" />
                        <h2 className="text-2xl font-bold text-foreground">Hi, I'm Savvy!</h2>
                        <p className="mt-2 mb-8">How can I help you in the kitchen today?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            {examplePrompts.map(prompt => (
                                <button 
                                  key={prompt} 
                                  onClick={() => handleSendMessage(new Event('click'), prompt)}
                                  className="p-4 border rounded-lg hover:bg-secondary text-sm font-medium transition-colors"
                                >
                                  {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-2 animate-fade-in-up",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                       <div className="flex items-end gap-2">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src="/images/ai-logo.png" alt="AI Assistant" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div
                        className={cn(
                            "max-w-md rounded-xl px-4 py-3 shadow-md",
                            'bg-secondary text-secondary-foreground rounded-bl-none'
                        )}
                        >
                            {index === messages.length - 1 && loading ? (
                                <TypingEffect text={message.content} onComplete={() => setIsTyping(false)} />
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                        </div>
                        {message.audioDataUri && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handlePlayAudio(message)}
                            >
                                {currentlyPlaying === message.id ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4" />}
                            </Button>
                        )}
                      </div>
                    )}
                    {message.role === 'user' && (
                       <div className="flex items-end gap-2">
                         <div
                            className={cn(
                                "max-w-md rounded-xl px-4 py-3 shadow-md",
                                'bg-primary text-primary-foreground rounded-br-none'
                            )}
                         >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                         </div>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/128x128.png" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                       </div>
                    )}
                  </div>
                ))}
                {(loading && !isTyping) && (
                  <div className="flex items-start gap-4 justify-start animate-fade-in-up">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src="/images/ai-logo.png" alt="AI Assistant" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-sm rounded-xl px-4 py-3 shadow-md bg-secondary text-secondary-foreground rounded-bl-none">
                      <div className="flex items-center gap-2">
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}}/>
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}/>
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t-2 bg-background/80">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Savvy anything about cooking..."
                  className="pr-20 h-12 text-base rounded-full"
                  disabled={loading || isTyping}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     {isBrowserSupported && (
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleVoiceSearch}
                        className={cn(
                            "rounded-full h-9 w-9",
                            isListening && 'text-destructive bg-destructive/10 animate-pulse'
                        )}
                        >
                        <Mic className="h-5 w-5" />
                        <span className="sr-only">Search with voice</span>
                        </Button>
                    )}
                    <Button type="submit" disabled={loading || isTyping || !input.trim()} size="icon" className="rounded-full h-9 w-9">
                        <Sparkles className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
              </div>
            </form>
          </div>
        </ChatContainer>
      </div>
      <audio ref={audioRef} className="hidden"/>
    </div>
  );
}
