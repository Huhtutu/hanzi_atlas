import Link from "next/link";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
        <Link href="/" className="font-serif text-lg tracking-wide">汉字图志</Link>
        <div className="flex-1 max-w-sm"><SearchBox compact /></div>
        <nav className="text-sm text-ink/70 flex gap-4">
          <Link href="/topic/water">水</Link>
          <Link href="/topic/human">人</Link>
          <Link href="/about">关于</Link>
        </nav>
      </div>
    </header>
  );
}
