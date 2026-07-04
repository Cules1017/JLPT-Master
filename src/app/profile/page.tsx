"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Shield, Crown, Key, LogOut, ChevronLeft, LayoutDashboard, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [pwdStatus, setPwdStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/subscriptions")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSubscriptions(data);
        })
        .catch(console.error)
        .finally(() => setLoadingSubs(false));
    }
  }, [status]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const user = session.user;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: 'error', msg: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    
    setPwdStatus({ type: 'loading', msg: 'Đang xử lý...' });

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đổi mật khẩu thất bại");

      setPwdStatus({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => setPwdStatus({ type: 'idle', msg: '' }), 3000);
    } catch (err: any) {
      setPwdStatus({ type: 'error', msg: err.message });
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-foreground transition-colors duration-300 pb-32">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 lg:p-24 max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors border border-foreground/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-3xl font-black">Tài khoản của tôi</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột trái: Thông tin & Gói cước */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* Thẻ User */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-xl backdrop-blur-xl">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 shrink-0">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1 line-clamp-1 break-all">{user.name || "Người dùng ẩn danh"}</h2>
              <p className="text-sm text-foreground/60 mb-4 line-clamp-1 break-all">{user.email}</p>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-foreground/10 rounded-full border border-foreground/10">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">{user.role}</span>
              </div>
            </div>

            {/* Thẻ Gói cước */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-[2rem] p-6 flex flex-col shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight">Gói cước hiện tại</h3>
              </div>
              
              {loadingSubs ? (
                <div className="flex justify-center mb-6">
                  <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="flex flex-col gap-3 mb-6">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="p-3 bg-foreground/5 border border-foreground/10 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-lg text-amber-500">{sub.plan.name}</span>
                      </div>
                      <p className="text-xs text-foreground/60 font-medium">
                        Hạn sử dụng: {new Date(sub.endDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-amber-500">Miễn phí</span>
                  </div>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Bạn đang sử dụng gói cơ bản, một số tính năng có thể bị giới hạn.</p>
                </>
              )}
              
              <Link href="/premium" className="mt-auto">
                <button className="w-full py-3.5 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 shrink-0" />
                  <span className="text-sm">Nâng cấp Premium</span>
                </button>
              </Link>
            </div>

            {/* Admin & Logout Buttons */}
            <div className="flex flex-col gap-3">
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <button className="w-full flex items-center justify-between p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl transition-colors text-indigo-500 font-bold">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Trang Quản trị</span>
                    </div>
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </Link>
              )}

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-between p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl transition-colors text-rose-500 font-bold"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </div>
              </button>
            </div>
          </div>

          {/* Cột phải: Form đổi mật khẩu */}
          <div className="md:col-span-2">
            <div className="bg-foreground/5 border border-foreground/10 rounded-[2rem] p-6 md:p-8 shadow-xl backdrop-blur-xl h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-foreground/10 pb-6">
                <div className="p-3 bg-foreground/10 text-foreground rounded-xl">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Đổi mật khẩu</h3>
                  <p className="text-sm text-foreground/60">Bảo mật tài khoản của bạn</p>
                </div>
              </div>

              {pwdStatus.type === 'success' && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{pwdStatus.msg}</span>
                </div>
              )}
              
              {pwdStatus.type === 'error' && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{pwdStatus.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Nhập mật khẩu cũ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={pwdStatus.type === 'loading'}
                  className="mt-4 w-full py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {pwdStatus.type === 'loading' ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
