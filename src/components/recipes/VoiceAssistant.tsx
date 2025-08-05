
'use client';

import { recipeAssistant } from '@/ai/flows/recipe-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Bot, Power, Play } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

interface VoiceAssistantProps {
  recipeTitle: string;
  instructions: string[];
  language: string;
  onStartCooking?: () => void;
  onStepChange?: (step: number | null) => void;
}

const languageToCode: { [key: string]: string } = {
    english: 'en-US',
    spanish: 'es-ES',
    french: 'fr-FR',
    german: 'de-DE',
    hindi: 'hi-IN',
    bengali: 'bn-IN',
};

export function VoiceAssistant({ recipeTitle, instructions, language, onStartCooking, onStepChange }: VoiceAssistantProps) {
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // When calling AI
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Conversation state
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('Press Start to begin your guided recipe.');
  
  const recognitionRef = useRef<any>(null);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoNextTimeout = useCallback(() => {
    if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
    }
  }, []);

  const handleUserQuery = useCallback(async (query: string) => {
    if (!query.trim() || isProcessing || isSpeaking) return;
    
    setIsProcessing(true);
    setTranscript('');
    clearAutoNextTimeout();
    
    try {
      const langCode = languageToCode[language] || 'en-US';
      const assistantResult = await recipeAssistant({
        recipeTitle,
        instructions,
        currentStep,
        currentInstruction: instructions[currentStep] || "You are at the start.",
        userQuery: query,
        language: langCode,
      });
      
      const responseText = assistantResult.responseText;
      const nextStep = assistantResult.nextStep;
      
      setAssistantResponse(responseText);
      
      if (nextStep === -1) {
        setSessionActive(false);
        setCurrentStep(0);
        onStepChange?.(null);
      } else {
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
      }
      
      if ('speechSynthesis' in window && assistantResult.audioDataUri) {
        const audio = new Audio(assistantResult.audioDataUri);
        audio.play();
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (nextStep !== -1) {
            try {
              recognitionRef.current.start();
            } catch(e) {
              console.error("Could not start recognition", e);
            }
          }
        };
      } else {
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error("Error processing voice command:", error);
      toast({
        variant: "destructive",
        title: "Assistant Error",
        description: "Sorry, I couldn't process that. Please try again."
      });
      setIsProcessing(false);
    }
  }, [currentStep, instructions, isProcessing, isSpeaking, recipeTitle, toast, language, onStepChange, clearAutoNextTimeout]);

  // Effect to handle auto-advancing
  useEffect(() => {
    if (sessionActive && !isSpeaking && !isListening && !isProcessing) {
        clearAutoNextTimeout();
        autoNextTimeoutRef.current = setTimeout(() => {
            handleUserQuery("next");
        }, 7000);
    }
    // Cleanup timeout if component unmounts or state changes
    return () => clearAutoNextTimeout();
  }, [sessionActive, isSpeaking, isListening, isProcessing, handleUserQuery, clearAutoNextTimeout]);


  useEffect(() => {
    setHasMounted(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen for a single command
    recognition.interimResults = true;
    recognition.lang = languageToCode[language] || 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      clearAutoNextTimeout();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      clearAutoNextTimeout();

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if(finalTranscript) {
        handleUserQuery(finalTranscript);
      }
    };
    
    recognitionRef.current = recognition;

  }, [language, handleUserQuery, clearAutoNextTimeout]);

  const startSession = () => {
    if (onStartCooking) onStartCooking();
    setSessionActive(true);
    handleUserQuery("start cooking");
  };

  const endSession = () => {
    setSessionActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    clearAutoNextTimeout();
    if(recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    setCurrentStep(0);
    setAssistantResponse('Press Start to begin your guided recipe.');
    onStepChange?.(null);
  };
  
  if (!hasMounted) {
    return (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2"><Bot /> Voice Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
             <div className="p-4 bg-background/50 rounded-lg min-h-[120px] flex flex-col justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Assistant...</p>
             </div>
             <Button size="lg" disabled>
                <Play className="mr-2"/>
                Start Cooking
            </Button>
          </CardContent>
        </Card>
      );
  }

  if (!isBrowserSupported) {
    return (
      <Card className="bg-destructive/10 text-destructive-foreground">
        <CardHeader><CardTitle className="flex items-center justify-center gap-2"><Mic className="h-6 w-6"/> Voice Assistant Not Available</CardTitle></CardHeader>
        <CardContent><p>Your browser does not support the Web Speech API. Please try Google Chrome.</p></CardContent>
      </Card>
    );
  }

  const isIdle = !isListening && !isProcessing && !isSpeaking;

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2"><Bot /> Voice Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-4 bg-background/50 rounded-lg min-h-[120px] flex flex-col justify-center items-center">
            {isListening ? (
                <p className="font-semibold text-lg text-primary italic">"{transcript || "Listening..."}"</p>
            ) : isProcessing ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                    <p className="font-semibold">Savvy is thinking...</p>
                </div>
            ) : isSpeaking ? (
                 <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                    <p className="font-semibold">Savvy is speaking...</p>
                </div>
            ) : (
                <p className="font-medium text-lg text-foreground italic">"{assistantResponse}"</p>
            )}
        </div>

        {!sessionActive ? (
            <Button onClick={startSession} size="lg" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2"/>}
                Start Cooking
            </Button>
        ) : (
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    {isListening ? "Listening for your command..." : isSpeaking ? "..." : "Tap the microphone to speak"}
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={() => recognitionRef.current?.start()} size="icon" className={cn("rounded-full h-20 w-20 transition-all", isListening && "bg-red-500 hover:bg-red-600 animate-pulse")} disabled={!isIdle}>
                        <Mic className="h-8 w-8" />
                    </Button>
                    <Button onClick={endSession} size="icon" variant="destructive" className="rounded-full h-16 w-16"><Power className="h-6 w-6"/></Button>
                </div>

                {instructions[currentStep] && (
                    <div className="mt-2">
                        <p className="font-bold">Step: {currentStep + 1} / {instructions.length}</p>
                        <p className="text-muted-foreground text-sm px-4">{instructions[currentStep]}</p>
                    </div>
                )}
            </div>
        )}
        
      </CardContent>
    </Card>
  );
}
