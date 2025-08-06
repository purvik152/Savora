
import { ChatInterface } from '@/components/assistant/ChatInterface';
import { Bot } from 'lucide-react';

export default function CookingAssistantPage() {
  return (
    <div className="flex flex-col h-full">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
            <div className="max-w-4xl mx-auto text-center mb-8 animate-fade-in-up">
                <Bot className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI Cooking Assistant</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Chat with Savvy for cooking tips, recipe substitutions, or any food-related questions you have.
                </p>
            </div>
        </div>
        <ChatInterface isDialog={false} />
    </div>
  );
}
