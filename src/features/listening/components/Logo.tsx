interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VinaListen Logo"
    >
      {/* Headphone icon */}
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <path
        d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="6"
        y="15"
        width="4"
        height="8"
        rx="2"
        fill="white"
      />
      <rect
        x="22"
        y="15"
        width="4"
        height="8"
        rx="2"
        fill="white"
      />
      {/* Sound waves */}
      <path
        d="M12 13V19M15 11V21M18 13V19"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
