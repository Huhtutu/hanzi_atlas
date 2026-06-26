import Link from "next/link";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-[var(--color-rule)] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.18em] text-ink hover:text-[var(--color-vermilion)] transition-colors"
        >
          汉字图志
        </Link>
        <span className="hidden md:inline-block h-4 w-px bg-[var(--color-rule-strong)]" aria-hidden />
        <div className="flex-1 max-w-sm">
          <SearchBox compact />
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm tracking-wider text-ink/75">
          <Link href="/poems" className="hover:text-[var(--color-vermilion)] transition-colors">诗词拾萃</Link>
          <Link href="/idioms" className="hover:text-[var(--color-vermilion)] transition-colors">成语典故</Link>
          <Link href="/about" className="hover:text-[var(--color-vermilion)] transition-colors">关于</Link>
        </nav>
      </div>
    </header>
  );
}
