
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

  useEffect(() => {
    // On initial load, check localStorage for a saved preference
    const savedDiet = localStorage.getItem('savora-diet') as Diet | null;
    if (savedDiet) {
      setDietState(savedDiet);
      document.documentElement.className = savedDiet === 'veg' ? 'theme-veg' : '';
    }
  }, []);

  const setDiet = useCallback((newDiet: Diet) => {
    setDietState(newDiet);
    localStorage.setItem('savora-diet', newDiet);
    document.documentElement.className = newDiet === 'veg' ? 'theme-veg' : '';
  }, []);
  
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
