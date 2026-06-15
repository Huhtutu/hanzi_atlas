import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <div className="text-7xl font-serif text-[var(--color-vermilion)]/30 mb-4">阙</div>
      <h1 className="font-serif text-2xl text-ink tracking-wider mb-3">此字未收</h1>
      <p className="text-ink/60 mb-10 leading-relaxed">该字暂未收录,欢迎在 GitHub 提交贡献。</p>
      <div className="mb-8"><SearchBox /></div>
      <Link href="/" className="link-cinnabar text-sm tracking-wider">返回首页</Link>
    </div>
  );
}
