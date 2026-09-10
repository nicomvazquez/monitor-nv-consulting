export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`flex-none text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l5-5 4 4 8-9M15 7h5v5" />
    </svg>
  );
}
