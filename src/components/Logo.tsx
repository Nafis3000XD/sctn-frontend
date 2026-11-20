
const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Outer Shield Hexagon */}
      <path d="M50 5 L85 22 L85 62 L50 90 L15 62 L15 22 Z" fill="url(#logoGrad)" opacity="0.15" />
      <path d="M50 5 L85 22 L85 62 L50 90 L15 62 L15 22 Z" stroke="url(#logoGrad)" strokeWidth="4.5" />
      {/* Core Lock / Network Node */}
      <circle cx="50" cy="50" r="16" stroke="url(#logoGrad)" strokeWidth="3" fill="#111827" fillOpacity="0.8" />
      <path d="M42 42 L30 30" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58 42 L70 30" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 58 L30 70" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58 58 L70 70" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="30" r="4" fill="url(#logoGrad)" />
      <circle cx="70" cy="30" r="4" fill="url(#logoGrad)" />
      <circle cx="30" cy="70" r="4" fill="url(#logoGrad)" />
      <circle cx="70" cy="70" r="4" fill="url(#logoGrad)" />
      {/* Inner checkmark / core */}
      <path d="M45 50 L48 53 L55 46" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Logo;
