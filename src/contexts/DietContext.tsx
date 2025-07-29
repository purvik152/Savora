
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
    try {
        const savedDiet = localStorage.getItem('savora-diet') as Diet | null;
        if (savedDiet) {
            setDietState(savedDiet);
        }
    } catch (error) {
        console.error('Failed to parse diet from localStorage', error);
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
  
  // Render children only after the initial state has been determined from localStorage
  if (!hasMounted) {
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
