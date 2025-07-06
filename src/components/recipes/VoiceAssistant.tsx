
'use client';

import { recipeAssistant } from '@/ai/flows/recipe-assistant-flow';
import { recipeToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Bot, Play, Pause, Power } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Conversation State
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('Press the mic and say "start cooking" to begin.');
  
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

    // Start session on initial command
    if (!sessionActive) {
      if (query.toLowerCase().includes('start')) {
        setSessionActive(true);
      } else {
        // Don't process other commands if session hasn't started
        return;
      }
    }

    setIsProcessing(true);
    setAssistantResponse('');
    stopAudio(); // Stop any current speech

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

      // End session
      if (assistantResult.nextStep === -1) {
        setSessionActive(false);
        setCurrentStep(0);
      } else {
        setCurrentStep(assistantResult.nextStep);
      }
      
      const ttsResult = await recipeToSpeech(assistantResult.responseText);
      if (audioRef.current) {
        audioRef.current.src = ttsResult.audioDataUri;
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      toast({
        variant: "destructive",
        title: "Assistant Error",
        description: "Sorry, I couldn't process that. Please try again."
      });
      setAssistantResponse('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [currentStep, instructions, recipeTitle, toast, stopAudio, sessionActive]);

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
      setIsListening(true);
    }
    
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscriptRef.current && !isProcessing) {
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
    
    // Cleanup on unmount
    return () => {
      recognition.abort();
    }
  }, [handleUserQuery, toast, isProcessing]);

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
  const toggleListening = () => {
    if (isProcessing) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopAudio(); // Interrupt any speech to start listening
      try {
        recognitionRef.current?.start();
      } catch(e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  const endSession = () => {
    stopAudio();
    if(isListening) recognitionRef.current?.abort();
    setSessionActive(false);
    setIsListening(false);
    setCurrentStep(0);
    setAssistantResponse('Press the mic and say "start cooking" to begin.');
  };

  // --- UI ---
  if (!isBrowserSupported) {
    return (
      <Card className="bg-destructive/10 text-destructive text-center">
        <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-6 w-6"/> Voice Assistant Not Available</CardTitle></CardHeader>
        <CardContent><p>Your browser does not support the Web Speech API.</p></CardContent>
      </Card>
    );
  }

  const getStatusText = () => {
    if (!sessionActive && !isProcessing) return 'Ready to start.';
    if (isProcessing) return 'Thinking...';
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (isPaused) return 'Paused.';
    return 'Ready.';
  };

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Voice Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-4 bg-background/50 rounded-lg min-h-[120px] flex flex-col justify-center items-center">
          <p className="text-sm text-muted-foreground mb-1">{getStatusText()}</p>
          <p className="font-medium text-lg text-foreground italic">
            {isListening ? transcript : assistantResponse}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleListening} size="icon" className={cn("rounded-full h-20 w-20 transition-all", isListening && "bg-red-500 hover:bg-red-600 scale-110")} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
            </Button>
        </div>

        {sessionActive && (
            <>
            <div className="flex items-center justify-center gap-4">
              {isSpeaking && !isPaused && (
                <Button onClick={pauseAudio} size="lg" variant="outline" title="Pause"><Pause className="mr-2"/> Pause</Button>
              )}
              {isPaused && (
                <Button onClick={resumeAudio} size="lg" variant="outline" title="Resume"><Play className="mr-2"/> Resume</Button>
              )}
               <Button onClick={endSession} size="lg" variant="destructive" title="End Session"><Power className="mr-2"/> End</Button>
            </div>

            <div>
              <p className="font-bold">Current Step: {currentStep + 1} / {instructions.length}</p>
              <p className="text-muted-foreground text-sm px-4">{instructions[currentStep]}</p>
            </div>
            </>
        )}
        
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
