export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-rule)]">
      <div className="max-w-5xl mx-auto px-6 py-8 text-xs tracking-wider text-ink/55 flex flex-col sm:flex-row sm:justify-between gap-2">
        <span>© Hanzi Atlas · 开源汉字图志</span>
        <a href="https://github.com/Huhtutu/hanzi_atlas" className="link-cinnabar">GitHub</a>
      </div>
    </footer>
  );
}
