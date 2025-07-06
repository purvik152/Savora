
'use client';

import { recipeAssistant } from '@/ai/flows/recipe-assistant-flow';
import { recipeToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, MicOff, Square, Bot } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

// Check for SpeechRecognition API
const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

interface VoiceAssistantProps {
  recipeTitle: string;
  instructions: string[];
}

export function VoiceAssistant({ recipeTitle, instructions }: VoiceAssistantProps) {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      setIsAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      try {
        const lang = navigator.language || 'en-US';
        recognition.lang = lang;
      } catch(e) {
        console.warn('Browser does not support setting language for SpeechRecognition.');
      }
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript && !isProcessing) {
          handleUserQuery(transcript)
        }
      };

      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
            toast({
                variant: 'destructive',
                title: 'Voice Error',
                description: `Could not understand audio. Please try again. Error: ${event.error}`,
            });
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsAvailable(false);
    }
  }, [toast, transcript, isProcessing]);
  
  const handleUserQuery = useCallback(async (query: string) => {
    if(!query.trim()) return;
    
    setIsProcessing(true);
    setAssistantResponse('');
    
    try {
      const lang = navigator.language || 'en-US';
      const assistantInput = {
        recipeTitle,
        instructions,
        currentStep,
        userQuery: query,
        language: lang,
      };

      const assistantResult = await recipeAssistant(assistantInput);
      setAssistantResponse(assistantResult.responseText);
      setCurrentStep(assistantResult.nextStep);

      const ttsResult = await recipeToSpeech(assistantResult.responseText);
      
      if (audioRef.current) {
        audioRef.current.src = ttsResult.audioDataUri;
        audioRef.current.play();
        setIsSpeaking(true);
      }

    } catch (error) {
      console.error("Error processing voice command:", error);
      toast({
        variant: "destructive",
        title: "Assistant Error",
        description: "Sorry, I couldn't process that. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentStep, instructions, recipeTitle, toast]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };
  
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }

  if (!isAvailable) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive text-center">
        <MicOff className="mx-auto h-8 w-8 mb-2" />
        <p className="font-bold">Voice Assistant Not Available</p>
        <p className="text-sm">Your browser does not support the Web Speech API.</p>
      </div>
    );
  }

  const isLoading = isProcessing || isListening;

  return (
    <Card className="mt-6 bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="p-4 bg-background/50 rounded-lg min-h-[120px] flex flex-col justify-center items-center">
          <p className="text-sm text-muted-foreground mb-1">
            {isListening ? "Listening..." : (isProcessing ? "Thinking..." : (isSpeaking ? "Speaking..." : "Ready. Press the mic to start."))}
          </p>
          <p className="font-medium text-lg text-foreground italic">
            {isListening ? transcript : assistantResponse}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={handleMicClick} size="icon" className={cn("rounded-full h-16 w-16", isListening && "bg-red-500 hover:bg-red-600")} disabled={isSpeaking || isProcessing}>
            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
          </Button>
          
          {isSpeaking && (
             <Button onClick={stopAudio} size="icon" variant="destructive" className="rounded-full h-12 w-12">
               <Square className="h-6 w-6" />
             </Button>
          )}

        </div>
        
        <div className="mt-4">
          <p className="font-bold">Current Step: {currentStep + 1} / {instructions.length}</p>
          <p className="text-muted-foreground text-sm px-4">{instructions[currentStep]}</p>
        </div>

        <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} className="hidden" />
      </CardContent>
    </Card>
  );
}
