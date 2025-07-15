
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { cookingAssistant } from '@/ai/flows/cooking-assistant-flow';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const welcomeMessage: Message = {
    role: 'model',
    content: "Hello! I'm Savora, your AI cooking assistant. Ask me anything about recipes, ingredients, or cooking techniques!"
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(1); // Exclude the initial welcome message
      const result = await cookingAssistant({
        history,
        message: input,
      });

      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I'm having a little trouble right now. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto h-[calc(100vh-8rem)] flex flex-col py-8">
      <div className="text-center mb-8">
        <Bot className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-4xl font-extrabold tracking-tight mt-2">AI Cooking Assistant</h1>
        <p className="text-muted-foreground mt-2">Your culinary questions, answered instantly.</p>
      </div>
      <div className="flex-grow flex flex-col bg-card border rounded-lg shadow-lg overflow-hidden">
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef as any}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md p-3 rounded-lg',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {loading && (
                <div className="flex items-start gap-4 justify-start">
                    <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-md p-3 rounded-lg bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recipe or cooking advice..."
              className="h-12 text-base"
              disabled={loading}
            />
            <Button type="submit" size="lg" disabled={loading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
