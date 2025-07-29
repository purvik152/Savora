
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
    const savedDiet = localStorage.getItem('savora-diet') as Diet | null;
    if (savedDiet) {
        setDietState(savedDiet);
    }
  }, []);

  const setDiet = useCallback((newDiet: Diet) => {
    setDietState(newDiet);
    if (typeof window !== 'undefined') {
        localStorage.setItem('savora-diet', newDiet);
    }
  }, []);
  
  const toggleDiet = useCallback(() => {
    setDiet(diet === 'veg' ? 'non-veg' : 'veg');
  }, [diet, setDiet]);

  const value = { diet, toggleDiet, setDiet };

  if (!hasMounted) {
    // Return null or a loading state on the server and initial client render
    // to avoid hydration mismatches with localStorage.
    return null;
  }

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
