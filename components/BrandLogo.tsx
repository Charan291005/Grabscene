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
      <div className="w-10 h-10 rounded-xl bg-bms-red flex items-center justify-center shrink-0">
        <Ticket className="w-6 h-6 text-white -rotate-12" />
      </div>
      <div className="flex flex-col">
        <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-bms-navy-dark'} tracking-tight leading-none`}>
          Grab<span className="text-bms-red">Scene</span>
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
      className="inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bms-red transition-transform hover:scale-[1.02]"
      aria-label="GrabScene home"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
});