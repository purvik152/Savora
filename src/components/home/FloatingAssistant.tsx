
'use client';

import Link from 'next/link';

export function FloatingAssistant() {
  return (
    <div className="absolute -bottom-8 left-0 hidden lg:block z-20 group">
      <Link href="/cooking-assistant" title="Meet your AI Cooking Assistant!">
        <div className="relative w-48 h-48 animate-chef-wobble group-hover:scale-110 transition-transform duration-300">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-black/10 rounded-full blur-md" />
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* Body */}
            <path
              d="M 50,150 C 50,80 150,80 150,150 Z"
              fill="hsl(var(--secondary))"
              stroke="hsl(var(--border))"
              strokeWidth="4"
            />
            {/* Head */}
            <circle cx="100" cy="80" r="40" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="4" />
            <circle cx="100" cy="80" r="42" fill="transparent" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow"/>

            {/* Eyes */}
            <circle cx="88" cy="80" r="6" fill="hsl(var(--primary))" />
            <circle cx="112" cy="80" r="6" fill="hsl(var(--primary))" />
            <circle cx="86" cy="78" r="2" fill="white" />
            <circle cx="110" cy="78" r="2" fill="white" />

            {/* Mouth */}
            <path d="M 92 95 Q 100 105 108 95" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round"/>

            {/* Apron */}
            <path
                d="M 70,120 L 70,140 Q 100,160 130,140 L 130,120 Z"
                fill="white"
                stroke="hsl(var(--border))"
                strokeWidth="2"
            />
            <path
                d="M 80,120 L 80,110 C 80,100 120,100 120,110 L 120,120"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                fill="none"
            />
             <path d="M 95,130 L 105,130" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
             <path d="M 100,125 L 100,135" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
