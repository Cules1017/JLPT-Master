"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border/50">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
        <p className="text-foreground/70 mb-8">Chào mừng bạn quay lại hệ thống luyện thi JLPT.</p>

        {error && (
          <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center mt-8 text-foreground/70">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
