
"use client";

import { useState, useEffect } from 'react';
import { useFlow, type Message } from 'genkit/react';
import { cookingAssistantFlow } from '@/ai/flows/cooking-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { run: runAssistant, loading } = useFlow(cookingAssistantFlow);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await runAssistant({
        history: messages,
        message: input,
      });

      if (response?.response) {
        const modelMessage: Message = { role: 'model', content: response.response };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error) {
      console.error('Error calling cooking assistant flow:', error);
      const errorMessage: Message = { role: 'model', content: 'Sorry, I ran into an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <Card className="h-[75vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <Bot className="text-primary h-8 w-8" />
              Savora AI Cooking Assistant
            </CardTitle>
            <CardDescription>Ask me anything about cooking, recipes, or substitutions!</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-6">
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
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., How can I substitute eggs in this recipe?"
                className="flex-grow"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
