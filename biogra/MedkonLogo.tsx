interface MedkonLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function MedkonLogo({ className = "h-9 w-auto", showWordmark = true }: MedkonLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 80 32"
        fill="none"
        className="h-8 w-auto shrink-0"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 32V8l12 12 12-12v24h-8V16L16 28 8 16v16H0z"
        />
        <path
          fill="currentColor"
          d="M28 32V0h8l10 14L56 0h8v32h-8V18l-6 10-6-10v14h-8z"
        />
        <path
          fill="currentColor"
          d="M72 32V8l12 12 12-12v24h-8V16l-8 12-8-12v16h-8z"
        />
      </svg>
      {showWordmark && (
        <span className="font-bold text-xl font-serif tracking-tight hidden sm:inline">Medkon</span>
      )}
    </span>
  );
}
