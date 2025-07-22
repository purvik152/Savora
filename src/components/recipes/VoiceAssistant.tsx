
'use client';

import { recipeAssistant, RecipeAssistantInput } from '@/ai/flows/recipe-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Bot, Play, Pause, Power, Square, RotateCcw } from 'lucide-react';
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

const AUTO_ADVANCE_DELAY = 7000; // 7 seconds

export function VoiceAssistant({ recipeTitle, instructions, language, onStartCooking, onStepChange }: VoiceAssistantProps) {
  const { toast } = useToast();
  
  const [hasMounted, setHasMounted] = useState(false);
  
  // Component State
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // When AI is thinking
  const [isListening, setIsListening] = useState(false);  // When mic is on
  const [isSpeaking, setIsSpeaking] = useState(false);  // When audio is playing
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
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    setHasMounted(true);
    // Cleanup synthesis on component unmount
    return () => {
        window.speechSynthesis.cancel();
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
    }
  }, []);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    clearAutoAdvance();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [clearAutoAdvance]);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        stopAudio();
        recognitionRef.current.start();
      } catch (e) {
        console.log("Recognition could not be started, likely already active.", e);
      }
    }
  }, [stopAudio, isListening]);

  // This is defined before handleUserQuery because it's a dependency.
  const advanceToNextStep = useCallback(() => {
      // Use a function that can be called by the timeout
      if (sessionActiveRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        handleUserQuery("next");
      }
  }, []);

  // --- Audio Controls using Web Speech API ---
  const playAudio = useCallback((text: string, options: { isFinal?: boolean; isInstruction?: boolean } = {}) => {
    const { isFinal = false, isInstruction = false } = options;
    const langCode = languageToCode[language] || 'en-US';

    if (!('speechSynthesis' in window)) {
        console.error("Speech Synthesis not supported.");
        setAssistantResponse("Sorry, your browser doesn't support voice output.");
        return;
    }
    stopAudio(); // Stop any previous speech and clear timers

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsProcessing(false);
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        if (sessionActiveRef.current && !isFinal && isInstruction) {
            // If it was an instruction, set a timer to auto-advance
            autoAdvanceTimeoutRef.current = setTimeout(advanceToNextStep, AUTO_ADVANCE_DELAY);
        }
        if (sessionActiveRef.current && !isFinal) {
            startListening();
        }
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        setIsSpeaking(false);
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
  }, [toast, startListening, language, stopAudio, advanceToNextStep]);
  
  // --- Core AI Interaction ---
  const handleUserQuery = useCallback(async (query: string) => {
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setAssistantResponse('Thinking...');
    stopAudio();

    // First, check for simple, local commands to avoid unnecessary API calls
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('pause')) {
        setAssistantResponse("Paused. Say 'resume' when you're ready.");
        setIsProcessing(false);
        return;
    }
    if (lowerQuery.includes('resume')) {
        playAudio(instructions[currentStep], { isInstruction: true });
        return;
    }

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
      const responseText = assistantResult.responseText;
      
      setAssistantResponse(responseText);
      
      if (isFinal) {
        setSessionActive(false);
        setCurrentStep(0);
        onStepChange?.(null);
      } else {
        setCurrentStep(assistantResult.nextStep);
        onStepChange?.(assistantResult.nextStep);
      }
      
      const isInstructionResponse = instructions.includes(responseText);
      playAudio(responseText, { isFinal, isInstruction: isInstructionResponse });

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
  }, [currentStep, instructions, isProcessing, recipeTitle, toast, stopAudio, playAudio, language, onStepChange]);

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
      clearAutoAdvance();
      finalTranscriptRef.current = '';
      setTranscript('');
      setIsListening(true);
    }
    
    recognition.onend = () => {
      setIsListening(false);
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
  }, [hasMounted, handleUserQuery, toast, language, clearAutoAdvance]);
  
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
    onStepChange?.(null);
  }, [stopAudio, isListening, onStepChange]);
  
  const handleMicClick = () => {
    clearAutoAdvance();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startListening();
    }
  };

  const handleRepeatClick = () => {
    if (sessionActive) {
        handleUserQuery('repeat');
    }
  }

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
                     <Button onClick={handleRepeatClick} size="icon" variant="outline" className="rounded-full h-16 w-16" title="Repeat" disabled={isProcessing || isSpeaking || isListening}>
                        <RotateCcw className="h-6 w-6" />
                    </Button>
                    <Button onClick={handleMicClick} size="icon" className={cn("rounded-full h-20 w-20 transition-all", isListening && "bg-red-500 hover:bg-red-600 scale-110")} disabled={isProcessing || isSpeaking}>
                        {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : (isListening ? <Square className="h-8 w-8" /> :<Mic className="h-8 w-8" />)}
                    </Button>
                    <Button onClick={endSession} size="icon" variant="destructive" className="rounded-full h-16 w-16" title="End Session"><Power className="h-6 w-6"/></Button>
                </div>

                {instructions[currentStep] && (
                    <div className="mt-2">
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
