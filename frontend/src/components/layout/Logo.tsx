interface LogoProps {
  className?: string;
  color?: string;
}

export default function Logo({ className = "", color = "#5A6F57" }: LogoProps) {
  return (
    <svg
      width="128"
      height="32"
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* A */}
      <path d="M50 20L75 80L100 20H150L100 100H50L0 20H50Z" fill={color} />
      {/* V */}
      <path
        d="M225 20L200 80L175 20H175V100H225"
        stroke={color}
        strokeWidth="5"
      />
      {/* | */}
      <rect x="250" y="20" width="5" height="80" fill={color} />
      {/* N */}
      <path d="M300 100V20H350L375 80V20" stroke={color} strokeWidth="5" />
      {/* U */}
      <path
        d="M375 20V80C375 91.0457 366.046 100 355 100H350"
        stroke={color}
        strokeWidth="5"
      />
    </svg>
  );
}
