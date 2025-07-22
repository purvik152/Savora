
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, BellRing } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface InstructionStepProps {
  step: string;
  index: number;
}

// Regex to find time mentions like "10 mins", "1 hour", "5-7 minutes"
const timeRegex = /(\d+)(?:-(\d+))?\s*(min|minute|minutes|hr|hour|hours)/i;

export function InstructionStep({ step, index }: InstructionStepProps) {
  const { toast } = useToast();
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const speak = useCallback((text: string) => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = navigator.language || 'en-US';
      utterance.onerror = (event) => {
        console.error("SpeechSynthesis Error", event);
        toast({
            variant: "destructive",
            title: "Voice Error",
            description: "Sorry, could not play the voice reminder.",
        });
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [toast]);
  
  useEffect(() => {
    const match = step.match(timeRegex);
    if (match) {
      // For a range like "25-30 mins", we'll take the higher value.
      const timeValue = parseInt(match[2] || match[1], 10);
      const unit = match[3].toLowerCase();
      let seconds = 0;
      if (unit.startsWith('min')) {
        seconds = timeValue * 60;
      } else if (unit.startsWith('hr')) {
        seconds = timeValue * 3600;
      }
      setDuration(seconds);
      setTimeLeft(seconds);
    }
     // Cleanup function to cancel speech synthesis when the component unmounts
     return () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };
  }, [step]);

  useEffect(() => {
    if (isActive && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            setIsFinished(true);
            playNotificationSound();
            speak(`Timer for step ${index + 1} is complete.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isActive, isFinished, index, speak, playNotificationSound]);

  const toggleTimer = () => {
    if (isFinished) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    if (duration) {
      setTimeLeft(duration);
    }
    // Stop any speech if reset is hit
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  };

  // If no time is found in the instruction, render a simple list item
  if (!duration) {
    return (
      <li className="flex items-start gap-4">
        <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
        <p className="flex-1 text-base text-foreground/90">{step}</p>
      </li>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <li className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-transparent has-[:focus]:border-primary has-[:focus-within]:border-primary transition-colors">
      <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
      <div className="flex-1 space-y-3">
        <p className="text-base text-foreground/90">{step}</p>
        <div className={cn("rounded-lg p-3 transition-all", isFinished ? "bg-green-100 dark:bg-green-900/30" : "bg-background/50")}>
            <div className="flex items-center gap-4">
                <Button onClick={toggleTimer} size="icon" variant={isActive ? "secondary" : "default"} disabled={isFinished} className="w-12 h-12">
                    {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-2xl font-bold">{formatTime(timeLeft)}</span>
                        {isFinished && <BellRing className="h-5 w-5 text-green-600 animate-pulse" />}
                    </div>
                    <Progress value={progress} />
                </div>
                <Button onClick={resetTimer} size="icon" variant="ghost" className="w-12 h-12">
                    <RotateCcw className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </li>
  );
}
