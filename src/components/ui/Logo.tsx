import { Link } from "react-router";

/**
 * Vendor-GPT brand mark — a hexagonal node network (the "ecosystem") with a
 * market-stall storefront nested inside it, rendered in the blue→teal brand
 * gradient. `LogoIcon` is the standalone symbol (used for the favicon and small
 * instances); `Logo` pairs it with the wordmark for the nav and footer.
 */

// Pointy-top hexagon vertices (center 32,32 · r 23), clockwise from the top.
const V = {
  top: [32, 9],
  ur: [52, 20.5],
  lr: [52, 43.5],
  bot: [32, 55],
  ll: [12, 43.5],
  ul: [12, 20.5],
} as const;

const node = (p: readonly [number, number], r = 3.2) => (
  <circle cx={p[0]} cy={p[1]} r={r} fill="url(#vg-grad)" />
);

export function LogoIcon({
  className = "",
  size = 32,
  title = "Vendor-GPT",
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vg-grad" x1="8" y1="52" x2="56" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a5fb4" />
          <stop offset="0.5" stopColor="#1f8fb0" />
          <stop offset="1" stopColor="#1fc7a4" />
        </linearGradient>
        <radialGradient id="vg-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8ff5df" />
          <stop offset="0.6" stopColor="#1fc7a4" />
          <stop offset="1" stopColor="#1fc7a4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Network mesh: outer hexagon ring + internal diagonals */}
      <g
        stroke="url(#vg-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      >
        <path
          d={`M${V.top} L${V.ur} L${V.lr} L${V.bot} L${V.ll} L${V.ul} Z`}
        />
        <path d={`M${V.top} L${V.bot} M${V.ul} L${V.lr} M${V.ll} L${V.ur}`} />
        <path d={`M${V.ul} L${V.lr} M${V.top} L${V.ll} M${V.ur} L${V.bot}`} />
      </g>

      {/* Storefront: striped awning + shop body nested at the mark's heart */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Awning */}
        <path
          d="M22 30 L22 26.5 Q32 22 42 26.5 L42 30 Z"
          fill="url(#vg-grad)"
        />
        {/* Scalloped awning edge */}
        <path
          d="M22 30 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 L42 30 Z"
          fill="url(#vg-grad)"
        />
        {/* Awning stripe seams */}
        <g stroke="#eafffb" strokeWidth="1" opacity="0.85">
          <path d="M27 24.4 L27 30" />
          <path d="M32 23.4 L32 30" />
          <path d="M37 24.4 L37 30" />
        </g>
        {/* Shop body / open front */}
        <path
          d="M24 33 L24 44 L40 44 L40 33"
          fill="none"
          stroke="url(#vg-grad)"
          strokeWidth="2.2"
        />
      </g>

      {/* Glowing core node */}
      <circle cx="32" cy="38.5" r="7" fill="url(#vg-core)" />
      <circle cx="32" cy="38.5" r="2.6" fill="#eafffb" />

      {/* Hexagon corner nodes (drawn last to sit above the lines) */}
      {node(V.top)}
      {node(V.ur)}
      {node(V.lr)}
      {node(V.bot)}
      {node(V.ll)}
      {node(V.ul)}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Vendor-GPT — home"
    >
      <LogoIcon
        size={30}
        className="transition-transform duration-500 group-hover:scale-105"
      />
      <span className="text-[16px] font-medium tracking-tight">
        <span className="text-[#2a6fd6]">Vendor</span>
        <span className="text-[#3fb8ad]">-GPT</span>
      </span>
    </Link>
  );
}
