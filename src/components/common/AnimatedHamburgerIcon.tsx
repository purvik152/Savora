
'use client';

import { cn } from '@/lib/utils';

interface AnimatedHamburgerIconProps {
  open: boolean;
}

export function AnimatedHamburgerIcon({ open }: AnimatedHamburgerIconProps) {
  const barClasses = 'h-0.5 w-6 bg-current transition-all duration-300 ease-in-out';

  return (
    <div className="relative h-6 w-6">
      <span
        className={cn(
          barClasses,
          'absolute top-[6px] left-0',
          open && 'top-1/2 -translate-y-1/2 rotate-45'
        )}
      />
      <span
        className={cn(
          barClasses,
          'absolute top-1/2 left-0 -translate-y-1/2',
          open && 'opacity-0'
        )}
      />
      <span
        className={cn(
          barClasses,
          'absolute bottom-[6px] left-0',
          open && 'bottom-1/2 translate-y-1/2 -rotate-45'
        )}
      />
    </div>
  );
}
