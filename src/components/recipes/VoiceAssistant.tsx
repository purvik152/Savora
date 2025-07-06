
'use client';

import { recipeAssistant } from '@/ai/flows/recipe-assistant-flow';
import { recipeToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Bot, Play, Pause, Power, Square } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

// Check for browser support
const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

interface VoiceAssistantProps {
  recipeTitle: string;
  instructions: string[];
}

export function VoiceAssistant({ recipeTitle, instructions }: VoiceAssistantProps) {
  const { toast } = useToast();
  
  // Component State
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef('');

  // --- Audio Controls ---
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current?.played && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsSpeaking(false);
      setIsPaused(true);
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play().catch(e => console.error("Audio play failed on resume", e));
      setIsSpeaking(true);
      setIsPaused(false);
    }
  }, []);
  
  // --- Core AI Interaction ---
  const handleUserQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setAssistantResponse('Thinking...');
    stopAudio(); // Stop any current speech before processing a new query

    try {
      const lang = navigator.language || 'en-US';
      const assistantInput = {
        recipeTitle,
        instructions,
        currentStep,
        currentInstruction: instructions[currentStep] || "You are at the start.",
        userQuery: query,
        language: lang,
      };

      const assistantResult = await recipeAssistant(assistantInput);
      setAssistantResponse(assistantResult.responseText);
      
      if (assistantResult.nextStep === -1) {
        setSessionActive(false);
        setCurrentStep(0);
      } else {
        setCurrentStep(assistantResult.nextStep);
      }

      const ttsResult = await recipeToSpeech(assistantResult.responseText);
      
      setIsProcessing(false);

      if (audioRef.current && ttsResult.audioDataUri) {
        audioRef.current.src = ttsResult.audioDataUri;
        audioRef.current.play().catch(e => {
            console.error("Audio play failed", e);
            setIsSpeaking(false);
        });
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }
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
  }, [currentStep, instructions, recipeTitle, toast, stopAudio]);

  // --- Speech Recognition Setup & Handlers ---
  useEffect(() => {
    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      return;
    }
    setIsBrowserSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    
    recognition.onstart = () => {
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
      recognition.abort();
    }
  }, [handleUserQuery, toast]);

  // --- Audio Player Event Listeners ---
  useEffect(() => {
    const audioEl = audioRef.current;
    const onAudioEnd = () => {
        setIsSpeaking(false);
        setIsPaused(false);
    };
    if (audioEl) {
      audioEl.addEventListener('ended', onAudioEnd);
    }
    return () => {
      if (audioEl) audioEl.removeEventListener('ended', onAudioEnd);
    };
  }, []);
  
  // --- User Actions ---
  const startSession = () => {
    setSessionActive(true);
    setAssistantResponse('Starting session...');
    handleUserQuery("start cooking");
  };
  
  const endSession = () => {
    stopAudio();
    if(isListening) recognitionRef.current?.abort();
    setSessionActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setCurrentStep(0);
    setAssistantResponse('Press Start to begin your guided recipe.');
  };
  
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopAudio(); 
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  // --- UI ---
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
                    <Button onClick={handleMicClick} size="icon" className={cn("rounded-full h-20 w-20 transition-all", isListening && "bg-red-500 hover:bg-red-600 scale-110")} disabled={isProcessing}>
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
        
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
