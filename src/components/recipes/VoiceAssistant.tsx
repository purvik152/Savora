
'use client';

import { recipeAssistant, RecipeAssistantInput } from '@/ai/flows/recipe-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Bot, Play, Pause, Power, Square } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

interface VoiceAssistantProps {
  recipeTitle: string;
  instructions: string[];
  language: string;
  onStartCooking?: () => void;
}

const languageToCode: { [key: string]: string } = {
    english: 'en-US',
    spanish: 'es-ES',
    french: 'fr-FR',
    german: 'de-DE',
    hindi: 'hi-IN',
    bengali: 'bn-IN',
};

export function VoiceAssistant({ recipeTitle, instructions, language, onStartCooking }: VoiceAssistantProps) {
  const { toast } = useToast();
  
  const [hasMounted, setHasMounted] = useState(false);
  
  // Component State
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // When AI is thinking
  const [isListening, setIsListening] = useState(false);  // When mic is on
  const [isSpeaking, setIsSpeaking] = useState(false);  // When audio is playing
  const [isPaused, setIsPaused] = useState(false);      // When audio is paused
  const [sessionActive, setSessionActive] = useState(false);
  
  // Conversation State
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('Press Start to begin your guided recipe.');
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sessionActiveRef = useRef(sessionActive);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    setHasMounted(true);
    // Cleanup synthesis on component unmount
    return () => {
        window.speechSynthesis.cancel();
    }
  }, []);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // Always stop any lingering speech before listening.
        stopAudio();
        // The start() method will throw an error if recognition is already active.
        // The catch block will handle this gracefully.
        recognitionRef.current.start();
      } catch (e) {
        // This error is expected if the mic is already on (e.g., user clicks button twice).
        // It's safe to ignore in this context.
        console.log("Recognition could not be started, likely already active.", e);
      }
    }
  }, [stopAudio]);

  // --- Audio Controls using Web Speech API ---
  const playAudio = useCallback((text: string, options: { isFinal?: boolean; autoListen?: boolean } = {}) => {
    const { isFinal = false, autoListen = true } = options;
    const langCode = languageToCode[language] || 'en-US';

    if (!('speechSynthesis' in window)) {
        console.error("Speech Synthesis not supported.");
        setAssistantResponse("Sorry, your browser doesn't support voice output.");
        return;
    }
    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setIsProcessing(false);
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        // Automatically start listening for the next command if the session is active
        if (sessionActiveRef.current && !isFinal && autoListen) {
            startListening();
        }
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        setIsSpeaking(false);
        setIsPaused(false);
        // Only show a toast for actual errors, not for cancellations.
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
            console.error("SpeechSynthesis Error", event);
            toast({
                variant: "destructive",
                title: "Voice Error",
                description: `Could not play audio. Error: ${event.error}`,
            });
        }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [toast, startListening, language]);

  const pauseAudio = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
      setIsPaused(true);
      setAssistantResponse('Paused.');
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      setAssistantResponse('Resuming...');
    }
  }, []);
  
  // --- Core AI Interaction ---
  const handleUserQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setAssistantResponse('Thinking...');
    stopAudio();

    try {
      const langCode = languageToCode[language] || 'en-US';
      const assistantInput: RecipeAssistantInput = {
        recipeTitle,
        instructions,
        currentStep,
        currentInstruction: instructions[currentStep] || "You are at the start.",
        userQuery: query,
        language: langCode,
      };

      const assistantResult = await recipeAssistant(assistantInput);
      const isFinal = assistantResult.nextStep === -1;
      
      setAssistantResponse(assistantResult.responseText);
      
      if (isFinal) {
        setSessionActive(false);
        setCurrentStep(0);
      } else {
        setCurrentStep(assistantResult.nextStep);
      }
      
      const lowerResponse = assistantResult.responseText.toLowerCase();
      // Don't play audio for 'Paused.' as it's just a state confirmation.
      if (lowerResponse === 'paused.') {
        setIsProcessing(false);
        setIsPaused(true);
        return;
      }

      // For 'wait' commands, speak the response but don't auto-listen afterwards.
      const shouldAutoListen = !lowerResponse.includes("i'll wait");

      playAudio(assistantResult.responseText, { isFinal, autoListen: shouldAutoListen });

    } catch (error) {
      console.error("Error processing voice command:", error);
      toast({
        variant: "destructive",
        title: "Assistant Error",
        description: "Sorry, I couldn't process that. Please try again."
      });
      setAssistantResponse('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  }, [currentStep, instructions, recipeTitle, toast, stopAudio, playAudio, language]);

  // --- Speech Recognition Setup & Handlers ---
  useEffect(() => {
    if (!hasMounted) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageToCode[language] || 'en-US';
    
    recognition.onstart = () => {
      finalTranscriptRef.current = '';
      setTranscript('');
      setIsListening(true);
    }
    
    recognition.onend = () => {
      setIsListening(false);
      // We only want to process the query if there's a final transcript.
      // Otherwise, the mic just turned off.
      if (finalTranscriptRef.current) {
        handleUserQuery(finalTranscriptRef.current);
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if (finalTranscript) {
          finalTranscriptRef.current = finalTranscript;
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (!['no-speech', 'aborted', 'not-allowed'].includes(event.error)) {
        toast({
          variant: 'destructive',
          title: 'Voice Error',
          description: `Could not understand audio. Error: ${event.error}`,
        });
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
      if(recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  }, [hasMounted, handleUserQuery, toast, language]);
  
  // --- User Actions ---
  const startSession = () => {
    onStartCooking?.();
    setSessionActive(true);
    handleUserQuery("start cooking");
  };
  
  const endSession = useCallback(() => {
    stopAudio();
    if(recognitionRef.current && isListening) recognitionRef.current.abort();
    setSessionActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setCurrentStep(0);
    setAssistantResponse('Press Start to begin your guided recipe.');
  }, [stopAudio, isListening]);
  
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startListening();
    }
  };

  // --- UI ---

  // Loading state for server-render and initial client render
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

  const getStatusText = () => {
    if (isProcessing) return 'Thinking...';
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (isPaused) return 'Paused';
    if (sessionActive) return 'Ready for your command.';
    return 'Ready to start.';
  };

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2"><Bot /> Voice Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-4 bg-background/50 rounded-lg min-h-[120px] flex flex-col justify-center items-center">
          <p className="text-sm text-muted-foreground mb-1">{getStatusText()}</p>
          <p className="font-medium text-lg text-foreground italic">
            {isListening ? transcript : assistantResponse}
          </p>
        </div>

        {!sessionActive ? (
            <Button onClick={startSession} size="lg" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2"/>}
                Start Cooking
            </Button>
        ) : (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={handleMicClick} size="icon" className={cn("rounded-full h-20 w-20 transition-all", isListening && "bg-red-500 hover:bg-red-600 scale-110")} disabled={isProcessing || isSpeaking}>
                        {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : (isListening ? <Square className="h-8 w-8" /> :<Mic className="h-8 w-8" />)}
                    </Button>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={isPaused ? resumeAudio : pauseAudio} size="lg" variant="outline" title={isPaused ? "Resume" : "Pause"} disabled={!isSpeaking && !isPaused}>
                        {isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>}
                        {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button onClick={endSession} size="lg" variant="destructive" title="End Session"><Power className="mr-2"/> End</Button>
                </div>

                {instructions[currentStep] && (
                    <div>
                        <p className="font-bold">Current Step: {currentStep + 1} / {instructions.length}</p>
                        <p className="text-muted-foreground text-sm px-4">{instructions[currentStep]}</p>
                    </div>
                )}
            </div>
        )}
        
      </CardContent>
    </Card>
  );
}
