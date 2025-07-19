
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Diet = 'veg' | 'non-veg';

interface DietContextType {
  diet: Diet;
  toggleDiet: () => void;
  setDiet: (diet: Diet) => void;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export function DietProvider({ children }: { children: ReactNode }) {
  const [diet, setDietState] = useState<Diet>('non-veg');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const applyTheme = useCallback((theme: Diet) => {
    if (typeof window !== 'undefined') {
      if (theme === 'veg') {
        document.documentElement.classList.add('theme-veg');
      } else {
        document.documentElement.classList.remove('theme-veg');
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const savedDiet = localStorage.getItem('savora-diet') as Diet | null;
      if (savedDiet) {
        setDietState(savedDiet);
        applyTheme(savedDiet);
      } else {
        applyTheme('non-veg');
      }
    }
  }, [hasMounted, applyTheme]);

  const setDiet = useCallback((newDiet: Diet) => {
    if (hasMounted) {
      setDietState(newDiet);
      localStorage.setItem('savora-diet', newDiet);
      applyTheme(newDiet);
    }
  }, [hasMounted, applyTheme]);
  
  const toggleDiet = useCallback(() => {
    setDiet(diet === 'veg' ? 'non-veg' : 'veg');
  }, [diet, setDiet]);

  const value = { diet, toggleDiet, setDiet };

  return (
    <DietContext.Provider value={value}>
      {children}
    </DietContext.Provider>
  );
}

export function useDiet() {
  const context = useContext(DietContext);
  if (context === undefined) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}
