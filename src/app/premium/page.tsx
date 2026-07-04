"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Star, Zap, Crown, Shield, ArrowRight, X, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorMap: Record<string, { border: string, glow: string, ribbon: string, shadow: string }> = {
    indigo: { border: "border-indigo-500", glow: "from-indigo-500/10", ribbon: "from-indigo-500 to-indigo-400", shadow: "shadow-indigo-500/30" },
    rose: { border: "border-rose-500", glow: "from-rose-500/10", ribbon: "from-rose-500 to-rose-400", shadow: "shadow-rose-500/30" },
    amber: { border: "border-amber-500", glow: "from-amber-500/10", ribbon: "from-amber-500 to-amber-400", shadow: "shadow-amber-500/30" },
    emerald: { border: "border-emerald-500", glow: "from-emerald-500/10", ribbon: "from-emerald-500 to-emerald-400", shadow: "shadow-emerald-500/30" },
    cyan: { border: "border-cyan-500", glow: "from-cyan-500/10", ribbon: "from-cyan-500 to-cyan-400", shadow: "shadow-cyan-500/30" },
    violet: { border: "border-violet-500", glow: "from-violet-500/10", ribbon: "from-violet-500 to-violet-400", shadow: "shadow-violet-500/30" }
  };

  // State để lưu chu kỳ đang chọn của mỗi gói (planId -> cycleIndex)
  const [selectedCycles, setSelectedCycles] = useState<Record<string, number>>({});
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; plan?: any; cycle?: any }>({ show: false });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data);
        
        // Khởi tạo cycle mặc định (cycle 0) cho tất cả các gói
        const initialCycles: Record<string, number> = {};
        data.forEach((p: any) => {
          initialCycles[p.id] = 0;
        });
        setSelectedCycles(initialCycles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUserSubs = async () => {
      if (session && session.user) {
        try {
          const subRes = await fetch("/api/user/subscriptions");
          if (subRes.ok) {
            const sData = await subRes.json();
            setUserSubs(sData);
          }
        } catch (err) {
          console.error("Failed to fetch user subscriptions:", err);
        }
      }
    };
    fetchUserSubs();
  }, [session]);

  const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleBuyClick = (plan: any) => {
    if (!session) {
      router.push("/login?callbackUrl=/premium");
      return;
    }
    const cycle = plan.cycles[selectedCycles[plan.id]];
    setPaymentModal({ show: true, plan, cycle });
  };

  const simulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentModal({ show: false });
      alert(`Đã mô phỏng thanh toán thành công gói ${paymentModal.plan?.name} (${paymentModal.cycle?.name})!\\n(Trong thực tế, bạn sẽ được cấp quyền ở đây)`);
    }, 2000);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-foreground transition-colors duration-300 pb-32">
      {/* Background GenZ Glow Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-[30%] left-[40%] w-[30%] h-[30%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 lg:p-24 max-w-7xl mx-auto flex flex-col gap-16">
        
        <header className="flex flex-col gap-6 text-center items-center mt-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl border border-white/10 shadow-xl shadow-amber-500/10 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Crown className="w-12 h-12 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 drop-shadow-sm">
            Nâng cấp <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Premium</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl font-medium leading-relaxed">
            Mở khóa toàn bộ sức mạnh của Nihongo Master. Luyện thi thả ga, không giới hạn. Đầu tư cho bản thân là khoản đầu tư hời nhất! ✨
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-rose-500 p-8 bg-rose-500/10 rounded-2xl border border-rose-500/20 backdrop-blur-sm">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-foreground/50 p-8 bg-card/50 rounded-2xl border border-border backdrop-blur-sm">
            Hiện tại chưa có gói cước nào được mở bán. Quay lại sau nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
            {plans.map((plan, index) => {
              const metadata = plan.metadata || {};
              const isPopular = metadata.isPopular;
              const colorKey = metadata.themeColor || "indigo";
              const currentCycleIndex = selectedCycles[plan.id] ?? 0;
              const currentCycle = plan.cycles[currentCycleIndex];
              const theme = colorMap[colorKey] || colorMap["indigo"];
              const isOwned = userSubs.some(sub => sub.planId === plan.id);

              return (
                <div 
                  key={plan.id}
                  className={`relative group bg-card/50 backdrop-blur-2xl border ${isPopular ? `${theme.border} shadow-lg ${theme.shadow}` : 'border-border/50'} rounded-[2.5rem] p-8 flex flex-col h-full gap-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-8`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Glow Behind */}
                  {isPopular && (
                    <div className={`absolute inset-0 bg-gradient-to-b ${theme.glow} to-transparent opacity-50 rounded-[2.5rem] pointer-events-none`} />
                  )}

                  {/* Popular Ribbon */}
                  {isPopular && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r ${theme.ribbon} text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap`}>
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Best Seller
                    </div>
                  )}

                  <div className="relative z-10">
                    <h3 className={`text-2xl font-black mb-2`} style={{ color: `var(--${colorKey}-500, currentColor)` }}>{plan.name}</h3>
                    {metadata.tagline && (
                      <p className="text-foreground/60 text-sm font-medium">{metadata.tagline}</p>
                    )}
                  </div>

                  {/* Cycles Selector Tabs */}
                  {plan.cycles.length > 1 && (
                    <div className="relative z-10 flex p-1 bg-foreground/5 rounded-2xl border border-foreground/5">
                      {plan.cycles.map((c: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedCycles({ ...selectedCycles, [plan.id]: i })}
                          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                            currentCycleIndex === i 
                              ? `bg-background shadow-sm text-foreground border border-border` 
                              : `text-foreground/50 hover:text-foreground/80 border border-transparent`
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Price Display */}
                  <div className="relative z-10 flex flex-col items-start min-h-[80px]">
                    {currentCycle && (
                      <>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-black tracking-tighter">{formatMoney(currentCycle.price).replace(' ₫', '')}</span>
                          <span className="text-foreground/50 font-bold mb-2">VNĐ</span>
                        </div>
                        {currentCycle.originalPrice && currentCycle.originalPrice > currentCycle.price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-foreground/40 font-medium line-through decoration-rose-500/50">{formatMoney(currentCycle.originalPrice)}</span>
                            <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              Giảm {Math.round((1 - currentCycle.price / currentCycle.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                        <p className="text-sm font-medium text-foreground/50 mt-1">Chu kỳ sử dụng: {currentCycle.durationDays} ngày</p>
                      </>
                    )}
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent relative z-10" />

                  {/* Features */}
                  <ul className="relative z-10 flex flex-col gap-4 flex-1">
                    {plan.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1 rounded-full bg-foreground/5`}>
                          <Check className={`w-4 h-4`} style={{ color: `var(--${colorKey}-500, currentColor)` }} strokeWidth={3} />
                        </div>
                        <span className="font-medium text-foreground/80 leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Buy Button */}
                  {isOwned ? (
                    <div className="relative z-10 w-full mt-auto px-6 py-4 flex items-center justify-center gap-2 text-foreground/50 font-bold text-lg bg-foreground/5 rounded-2xl border border-foreground/10 cursor-not-allowed">
                      <Check className="w-5 h-5" /> Đang sử dụng
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBuyClick(plan)}
                      className="relative z-10 w-full mt-auto group/btn overflow-hidden rounded-2xl"
                    >
                      <div className={`absolute inset-0 transition-transform duration-300 group-hover/btn:scale-105`} style={{ backgroundColor: `var(--${colorKey}-500, currentColor)` }} />
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300 bg-white" />
                      <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white font-black text-lg">
                        Mua ngay <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal (Mock) */}
      {paymentModal.show && paymentModal.plan && paymentModal.cycle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-background border border-border p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => !processing && setPaymentModal({ show: false })}
              className="absolute top-6 right-6 p-2 text-foreground/50 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors disabled:opacity-50"
              disabled={processing}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-black mb-2">Thanh toán Gói cước</h3>
              <p className="text-foreground/60 mb-6 font-medium">Bạn đang mua <b className="text-foreground">{paymentModal.plan.name}</b><br/>Chu kỳ: {paymentModal.cycle.name} ({paymentModal.cycle.durationDays} ngày)</p>

              <div className="w-full bg-card border border-border rounded-2xl p-6 mb-8 shadow-inner">
                <p className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-2">Số tiền cần thanh toán</p>
                <div className="text-4xl font-black text-indigo-500 mb-6">{formatMoney(paymentModal.cycle.price)}</div>
                
                <div className="w-full h-48 bg-foreground/5 rounded-xl border border-dashed border-border flex items-center justify-center mb-4 relative overflow-hidden">
                  {processing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="font-bold text-indigo-500 animate-pulse">Đang xử lý giao dịch...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-foreground/20 mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground/40">QR Code chuyển khoản<br/>(Minh họa)</p>
                    </div>
                  )}
                </div>
              </div>

              {!processing && (
                <button 
                  onClick={simulatePayment}
                  className="w-full py-4 bg-indigo-500 text-white font-black text-lg rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Đã chuyển khoản
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
