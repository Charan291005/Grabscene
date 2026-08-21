import Link from "next/link";
import { Ticket } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
  href?: string;
};

export function BrandLogo({ compact = false, href = "/" }: BrandLogoProps) {
  const logo = (
    <div className={`flex items-center gap-2 ${compact ? 'scale-90 origin-left' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] shrink-0">
        <Ticket className="w-6 h-6 text-black -rotate-12" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black text-white tracking-tight leading-none">
          Grab<span className="text-cyan-400">Scene</span>
        </span>
        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mt-1 leading-none">
          Tickets & Experiences
        </span>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition-transform hover:scale-[1.02]"
      aria-label="GrabScene home"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
}