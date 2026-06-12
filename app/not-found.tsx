import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="font-serif text-3xl mb-3">未找到</h1>
      <p className="text-ink/70 mb-8">该字暂未收录,欢迎在 GitHub 提交贡献。</p>
      <div className="max-w-md mx-auto mb-6"><SearchBox /></div>
      <Link href="/" className="text-sm underline">返回首页</Link>
    </div>
  );
}
