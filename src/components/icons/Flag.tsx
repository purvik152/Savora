
import { cn } from '@/lib/utils';

interface FlagProps extends React.SVGProps<SVGSVGElement> {
  country: string;
}

export function Flag({ country, className, ...props }: FlagProps) {
  const flags: Record<string, React.ReactNode> = {
    USA: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" {...props}>
            <path fill="#b22234" d="M0 0h7410v3900H0z" />
            <path
                d="M0 0h7410v300H0zm0 600h7410v300H0zm0 1200h7410v300H0zm0 1800h7410v300H0zm0 2400h7410v300H0zm0 3000h7410v300H0zm0 3600h7410v300H0z"
                fill="#fff"
            />
            <path fill="#3c3b6e" d="M0 0h2964v2100H0z" />
            <path
                fill="#fff"
                d="m247 175 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm-2223 350 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm-2717 350 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm-2223 350 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm-2717 350 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143zm494 0 76 232-200-143h247l-200 143z"
            />
        </svg>
    ),
    Italy: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" {...props}><path fill="#009246" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ce2b37" d="M2 0h1v2H2z"/></svg>
    ),
    France: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" {...props}><path fill="#0055A4" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#EF4135" d="M2 0h1v2H2z"/></svg>
    ),
    Mexico: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 571.43" {...props}><path fill="#006847" d="M0 0h1000v571.43H0z"/><path fill="#fff" d="M333.33 0h333.33v571.43H333.33z"/><g transform="translate(500 285.7) scale(15.2)"><g fill="none" strokeWidth=".71" strokeMiterlimit="2.61"><path d="M-1.74-12.78c.84 2.1-1.25 3.3-3.07 3.3-2.14 0-3.32-1.57-3.32-3.3s1.18-3.32 3.32-3.32c1.82 0 3.9 1.2 3.07 3.32z" stroke="#907747"/><path stroke="#907747" d="M-3.3-9.58c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32zM-1.74-9.58c.84 2.1-1.25 3.3-3.07 3.3-2.14 0-3.32-1.57-3.32-3.3s1.18-3.32 3.32-3.32c1.82 0 3.9 1.2 3.07 3.32zM-6.53-9.58c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32z"/><path d="M-3.3-6.28c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32z" stroke="#907747"/><path stroke="#907747" d="M-9.76-6.28c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32zM-6.53-2.98c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32z"/><path d="M-12.99-2.98c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32z" stroke="#907747"/><g stroke="#006847"><path d="M-15.08.32c-.84-2.1 1.25-3.3 3.07-3.3 2.14 0 3.32 1.57 3.32 3.3s-1.18 3.32-3.32 3.32c-1.82 0-3.9-1.2-3.07-3.32zM-8.2-1.13c-.15-2.27 2.05-3.1 3.52-3.1 2.22 0 3.52 1.48 3.52 3.1 0 1.63-1.3 3.1-3.52 3.1-1.47 0-3.67-1-3.52-3.1zM-1.86.32c.84 2.1-1.25 3.3-3.07 3.3-2.14 0-3.32-1.57-3.32-3.3s1.18-3.32 3.32-3.32c1.82 0 3.9 1.2 3.07 3.32zM-12.01-1.13c.15 2.27-2.05 3.1-3.52 3.1-2.22 0-3.52-1.48-3.52-3.1 0-1.63 1.3-3.1 3.52-3.1 1.47 0 3.67 1 3.52 3.1z"/></g><path d="M-4.7-4.23c-1-2.45-3.5-3.55-3.5-3.55s-2.5 1.1-3.5 3.55c-1 2.45.52 6.13.52 6.13l3-1.18 3 1.18s1.5-3.68.5-6.13z" fill="#fff" stroke="#907747"/></g><path d="M0 0L-8.1 4.3v-26h16.2v26z" fill="#fff" stroke="#907747" strokeWidth=".7" transform="translate(0 -1.5)"/><path d="M-4.75 4.3v-26h9.5v26z" stroke="#907747" strokeWidth=".7" transform="rotate(-90) translate(0 -1.5)"/><path d="M-.5-2.2l-3-1.2-3 1.2v-2h6zM-6.5-4.2v-1.7h-1.5l3.2-1.3 3.3 1.3h-1.8v1.7h-3.2z" fill="#907747"/><path d="M-11.75-23.4v6.5h-1v-4.5h-1.1v4.5h-1v-4.5h-1v4.5h-1v-6.5h5.1z" fill="#fff" stroke="#907747" strokeWidth=".7"/><path d="M-2.7-22.1c1.55 3.5 1.5 8.12-6.4 7.62-5.45-.34-5.6-2.5-5.6-2.5l1.6-1s.8 1 3.2 1.1c2.4.1 4.07-.48 4.3-3.62s-2.6-3.8-5.3-3.5c-2.7.3-3.8 2.6-3.8 2.6l-1.5-1s.3-2.6 4.3-3.1c4-.5 5.55 2.4 5.55 2.4l1.85-1.1z" fill="#cf102d"/><path d="M-20-15.55s-1.88 5.68-6.1 2.2c-4.22-3.48-.2-9.08-.2-9.08l1.4 1.1s-2.82 4.1 1.2 5.8c4.02 1.7 4.1-3 4.1-3l1.8-.1zM-13.8-21.7s-5.6-1.5-3 5.4c2.6 6.9 8.2 3.1 8.2 3.1l-1.3-1.4s-3.9 1.7-4.4-2.8c-.5-4.5 3.3-3.7 3.3-3.7l-1-1.9z" fill="#006847"/><g transform="translate(1.4 1.4)"><path d="M-1.74-12.78c.84 2.1-1.25 3.3-3.07 3.3-2.14 0-3.32-1.57-3.32-3.3s1.18-3.32 3.32-3.32c1.82 0 3.9 1.2 3.07 3.32z" stroke="#907747" strokeWidth=".71"/><path stroke="#907747" strokeWidth=".71" d="M-3.3-9.58c0 2.4-1.25 3.3-3.23 3.3-2.26 0-3.32-1.45-3.32-3.3s1.06-3.32 3.32-3.32c1.98 0 3.23.9 3.23 3.32zM-1.74-9.58c.84 2.1-1.25 3.3-3.07 3.3-2.14 0-3.32-1.57-3.32-3.3s1.18-3.32 3.32-3.32c1.82 0 3.9 1.2 3.07 3.32z"/><path d="M-4.7-4.23c-1-2.45-3.5-3.55-3.5-3.55s-2.5 1.1-3.5 3.55c-1 2.45.52 6.13.52 6.13l3-1.18 3 1.18s1.5-3.68.5-6.13z" fill="#fff" stroke="#907747" strokeWidth=".71"/></g></g></svg>
    ),
    India: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
            <path fill="#f93" d="M0 0h900v200H0z" />
            <path fill="#fff" d="M0 200h900v200H0z" />
            <path fill="#128807" d="M0 400h900v200H0z" />
            <g transform="translate(450 300)">
                <circle r="90" fill="#fff" />
                <circle r="80" fill="#000080" />
                <circle r="70" fill="#fff" />
                <circle r="20" fill="#000080" />
                <g id="d" fill="#000080">
                    <g id="c">
                        <g id="b">
                            <g id="a">
                                <path d="M0-80v-10h2.5L0-80z" />
                                <path d="M0-80v-10h-2.5L0-80z" transform="scale(-1 1)" />
                            </g>
                            <use href="#a" transform="rotate(15)" />
                            <use href="#a" transform="rotate(30)" />
                        </g>
                        <use href="#b" transform="rotate(45)" />
                    </g>
                    <use href="#c" transform="rotate(90)" />
                </g>
                <use href="#d" transform="scale(-1 -1)" />
            </g>
        </svg>
    ),
    Greece: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 18" {...props}>
            <path fill="#0d5eaf" d="M0 0h27v18H0z" />
            <path
                stroke="#fff"
                strokeWidth="2"
                d="M5 0v11M0 5h10m-5-5v11h17M0 9h27m0 4H0M0 17h27"
            />
        </svg>
    ),
    Thailand: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" {...props}>
            <path d="M0 0h5v3H0z" fill="#A51931" />
            <path d="M0 0.5h5v2H0z" fill="#fff" />
            <path d="M0 1h5v1H0z" fill="#2D2A4A" />
        </svg>
    ),
    Spain: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" {...props}>
            <path fill="#c60b1e" d="M0 0h750v500H0z" />
            <path fill="#ffc400" d="M0 125h750v250H0z" />
        </svg>
    ),
    China: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 192" {...props}>
            <path fill="#de2910" d="M0 0h288v192H0z" />
            <path
                fill="#ffde00"
                d="M57.6 38.4l-18.7 13.56 7.14-22L32.2 18.2l23.1.2 7.3-22 7.3 22 23.1-.2-13.84 11.76 7.14 22z"
            />
            <path
                fill="#ffde00"
                d="M96 19.2l-6.23 4.52 2.38-7.33-4.62-3.92 7.7.07L96 5l2.45 7.34 7.7-.07-4.62 3.92 2.38 7.33zM115.2 48l-6.23-4.52 2.38 7.33-4.62-3.92 7.7.07 2.45-7.34 2.45 7.34 7.7-.07-4.62-3.92 2.38-7.33zM115.2 76.8l-6.23-4.52 2.38 7.33-4.62-3.92 7.7.07 2.45-7.34 2.45 7.34 7.7-.07-4.62-3.92 2.38-7.33zM96 96l-6.23-4.52 2.38 7.33-4.62-3.92 7.7.07 2.45-7.34 2.45 7.34 7.7-.07-4.62-3.92 2.38-7.33z"
            />
        </svg>
    ),
    UK: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" {...props}>
            <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
            <path d="M0 0v30h60V0z" fill="#012169"/>
            <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
            <path d="M0 0l60 30m0-30L0 30" clipPath="url(#a)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
    ),
    Turkey: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 480" {...props}>
            <path fill="#e30a17" d="M0 0h720v480H0z" />
            <path
                fill="#fff"
                d="M285.8 240a120 120 0 100-1 120 120 0 100 1zM300 240a96 96 0 100-1 96 96 0 100 1z"
            />
            <path
                fill="#fff"
                d="M331.3 240l-36.2-26.2 13.8 42.4v-52.4l-13.8 42.4z"
            />
        </svg>
    ),
    Japan: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}><path fill="#fff" d="M0 0h900v600H0z"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>
    ),
    Lebanon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}><path fill="#ed1c24" d="M0 0h900v150H0zM0 450h900v150H0z"/><path fill="#fff" d="M0 150h900v300H0z"/><path fill="#00a651" d="M450 180l-175 300h350zm0 30v210l87.5-150-175 0L362.5 420z"/></svg>
    ),
    Egypt: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
            <path d="M0 0h900v200H0z" fill="#ce1126" />
            <path d="M0 200h900v200H0z" fill="#fff" />
            <path d="M0 400h900v200H0z" />
            <path
                d="M450 342.1c-17.2 0-31.2-14-31.2-31.2 0-8.6 3.5-16.4 9.1-22-5.7-5.6-9.1-13.4-9.1-22 0-17.2 14-31.2 31.2-31.2s31.2 14 31.2 31.2c0 8.6-3.5 16.4-9.1 22 5.7 5.6 9.1 13.4 9.1 22 0 17.2-14 31.2-31.2 31.2z"
                fill="#cfa400"
            />
        </svg>
    ),
    Vietnam: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" {...props}><path fill="#DA251D" d="M0 0h3v2H0z"/><path fill="#FFFF00" d="M1.5 1.25L1.2 1.5l.47-.9-.47-.9 1.2 1.2-.95-.08z"/></svg>
    ),
    // Add other flags here
  };

  const FlagComponent = flags[country] || <div className="h-4 w-6 rounded-sm bg-muted border" />;

  return (
    <div className={cn("h-4 w-6 rounded-sm overflow-hidden", className)}>
        {FlagComponent}
    </div>
  );
}
