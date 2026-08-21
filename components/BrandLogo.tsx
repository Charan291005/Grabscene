import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  compact?: boolean;
  href?: string;
};

export function BrandLogo({ compact = false, href = "/" }: BrandLogoProps) {
  const logo = (
    <Image
      src="/grabscene-logo.png"
      alt="GrabScene"
      width={compact ? 112 : 176}
      height={compact ? 58 : 84}
      priority
      className={compact ? "h-12 w-auto object-contain" : "h-[4.5rem] w-auto object-contain"}
    />
  );

  return href ? (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
      aria-label="GrabScene home"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
}