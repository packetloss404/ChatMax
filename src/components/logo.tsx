export default function Logo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect width="512" height="512" rx="112" fill="url(#bg-gradient)" />

      {/* Chat bubble */}
      <path
        d="M128 160c0-17.7 14.3-32 32-32h192c17.7 0 32 14.3 32 32v160c0 17.7-14.3 32-32 32H248l-64 56v-56h-24c-17.7 0-32-14.3-32-32V160z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Lightning bolt inside bubble */}
      <path
        d="M272 172h-40l-16 72h32l-20 84 68-96h-40l20-60z"
        fill="url(#bolt-gradient)"
      />

      <defs>
        <linearGradient id="bg-gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="bolt-gradient" x1="248" y1="172" x2="296" y2="328" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
    </svg>
  );
}
