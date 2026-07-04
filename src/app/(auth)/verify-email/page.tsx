"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch (err) {
        setStatus("error");
        setMessage("Lỗi kết nối máy chủ.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border/50 text-center flex flex-col items-center gap-4">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-2" />
          <h1 className="text-2xl font-bold">Đang xác thực...</h1>
          <p className="text-foreground/70 mb-4">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Xác thực thành công!</h1>
          <p className="text-foreground/70 mb-4">{message}</p>
          <Link href="/login" className="w-full">
            <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Đăng nhập ngay
            </button>
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mb-2">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
          <p className="text-foreground/70 mb-4">{message}</p>
          <Link href="/login" className="w-full">
            <button className="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-colors">
              Quay lại trang Đăng nhập
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
