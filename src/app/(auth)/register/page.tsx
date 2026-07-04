"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
        <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border/50 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-2">
            <MailCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
          <p className="text-foreground/70 mb-4">
            Chúng tôi đã gửi một email xác thực đến địa chỉ <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) để kích hoạt tài khoản.
          </p>
          <Link href="/login" className="w-full">
            <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Đi đến trang Đăng nhập
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border/50">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
        <p className="text-foreground/70 mb-8">Bắt đầu hành trình chinh phục JLPT cùng chúng tôi.</p>

        {error && (
          <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Họ và Tên</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Nguyễn Văn A"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="text-center mt-8 text-foreground/70">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
