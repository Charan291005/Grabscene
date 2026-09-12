import Link from "next/link";
import { Ticket } from "lucide-react";
import { memo } from "react";

type BrandLogoProps = {
  compact?: boolean;
  href?: string;
  dark?: boolean;
};

export const BrandLogo = memo(function BrandLogo({ compact = false, href = "/", dark = false }: BrandLogoProps) {
  const logo = (
    <div className={`flex items-center gap-2 ${compact ? 'scale-90 origin-left' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-bms-red flex items-center justify-center shrink-0 group-hover:shadow-[0_0_16px_rgba(248,68,100,0.5)] transition-shadow duration-500">
        <Ticket className="w-6 h-6 text-white -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      </div>
      <div className="flex flex-col">
        <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-bms-navy-dark'} tracking-tight leading-none`}>
          Grab<span className="text-bms-red group-hover:bg-gradient-to-r group-hover:from-bms-red group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">Scene</span>
        </span>
        <span className={`text-[10px] font-bold ${dark ? 'text-zinc-400' : 'text-slate-500'} tracking-widest uppercase mt-1 leading-none`}>
          Tickets & Experiences
        </span>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bms-red transition-transform duration-300 hover:scale-[1.02]"
      aria-label="GrabScene home"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
});