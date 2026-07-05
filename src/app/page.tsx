"use client";

import { useEffect, useState } from "react";
import type { Exam } from "@/types/exam";
import { BookOpen, PlayCircle, BarChart2, Crown, Lock, Unlock, Sparkles, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/UserMenu";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [exams, setExams] = useState<Exam[] | undefined>(undefined);
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Popup state
  const [popup, setPopup] = useState<{ show: boolean; type: 'login' | 'premium'; planIds?: string[] }>({ show: false, type: 'login' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, plansRes] = await Promise.all([
          fetch("/api/exams"),
          fetch("/api/plans")
        ]);
        if (!examsRes.ok) throw new Error("Failed to fetch exams");
        const data = await examsRes.json();
        setExams(data);

        if (plansRes.ok) {
          const pData = await plansRes.json();
          setPlans(pData);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
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

  // Organize exams by level
  const groupedExams = exams?.reduce((acc, exam) => {
    const lvl = exam.level || exam.metadata?.level || "Unknown";
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(exam);
    return acc;
  }, {} as Record<string, Exam[]>) || {};

  const levelsOrder = ["N5", "N4", "N3", "N2", "N1"];

  const handleExamClick = (exam: Exam) => {
    if (session?.user?.role === "ADMIN") {
      router.push(`/exam/${exam.id}/mode`);
      return;
    }

    if (exam.accessLevel === "FREE") {
      router.push(`/exam/${exam.id}/mode`);
      return;
    }

    if (!session) {
      setPopup({ show: true, type: 'login' });
      return;
    }

    if (exam.accessLevel === "LOGIN") {
      router.push(`/exam/${exam.id}/mode`);
      return;
    }

    const requiredPlanIds = exam.accessLevel === "PREMIUM" ? (exam.planIds || []) : [exam.accessLevel];
    const hasAccess = userSubs.some(sub => requiredPlanIds.includes(sub.planId));

    if (hasAccess) {
      router.push(`/exam/${exam.id}/mode`);
      return;
    }

    // Nếu accessLevel là PREMIUM hoặc là 1 UUID (bản cũ) và chưa có gói, yêu cầu mua gói (hiện popup)
    setPopup({ 
      show: true, 
      type: 'premium', 
      planIds: requiredPlanIds
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Background GenZ Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 lg:p-24 max-w-7xl mx-auto flex flex-col gap-16">
        
        <header className="flex flex-col gap-6 text-center items-center mt-4">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl border border-white/10 shadow-xl shadow-indigo-500/10 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <BookOpen className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 drop-shadow-sm">
            Nihongo Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400">JLPT</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl font-medium leading-relaxed">
            Hệ thống luyện thi JLPT cá nhân hóa. Chinh phục tiếng Nhật với giao diện cực slay, đánh bay mọi đề thi! ✨
          </p>

          <div className="flex gap-4 mt-4">
            <Link href="/statistics">
              <button className="flex items-center gap-2 px-8 py-4 bg-foreground/5 border border-foreground/10 text-foreground rounded-full font-bold hover:bg-foreground/10 transition-all active:scale-95 shadow-lg backdrop-blur-md">
                <BarChart2 className="w-5 h-5" />
                Thống kê học tập
              </button>
            </Link>
            
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin">
                <button className="flex items-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-full font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/25">
                  <Sparkles className="w-5 h-5" />
                  Quản trị viên
                </button>
              </Link>
            )}
          </div>
        </header>

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <section className="flex flex-col gap-12">
          {exams === undefined ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            levelsOrder.map((lvl) => {
              const levelExams = groupedExams[lvl];
              if (!levelExams || levelExams.length === 0) return null;

              return (
                <div key={lvl} className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-lg">
                      {lvl}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {levelExams.map((exam) => (
                      <div 
                        key={exam.id} 
                        onClick={() => handleExamClick(exam)}
                        className="group relative bg-foreground/5 border border-foreground/10 rounded-[2rem] p-6 flex flex-col gap-5 backdrop-blur-xl hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl"
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <h3 className="font-bold text-2xl text-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                              {exam.title || `${exam.metadata?.exam} ${exam.metadata?.level}`}
                            </h3>
                            <p className="text-sm font-medium text-foreground/50 mt-1">
                              {exam.metadata?.year} • {exam.metadata?.session}
                            </p>
                          </div>
                          
                          {/* Access Badge */}
                          {session?.user?.role === "ADMIN" ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
                              <Sparkles className="w-3.5 h-3.5" />
                              Admin
                            </div>
                          ) : exam.accessLevel === "FREE" ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                              Free
                            </div>
                          ) : exam.accessLevel === "LOGIN" && !session ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider rounded-full border border-blue-500/20">
                              <Lock className="w-3.5 h-3.5" />
                              Login
                            </div>
                          ) : exam.accessLevel === "LOGIN" && session ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                              Free (User)
                            </div>
                          ) : (
                            (() => {
                              const requiredPlanIds = exam.accessLevel === "PREMIUM" ? (exam.planIds || []) : [exam.accessLevel];
                              const hasAccess = userSubs.some(sub => requiredPlanIds.includes(sub.planId));

                              if (hasAccess) {
                                return (
                                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <Unlock className="w-4 h-4" />
                                  </div>
                                );
                              }

                              return (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                  <Crown className="w-3.5 h-3.5" />
                                  {requiredPlanIds.length === 1 
                                    ? plans.find(p => p.id === requiredPlanIds[0])?.name || "Premium"
                                    : "Premium"}
                                </div>
                              );
                            })()
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm font-medium text-foreground/40 mt-auto relative z-10">
                          <span className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/5">
                            <BookOpen className="w-4 h-4" />
                            {exam.metadata?.total_questions} câu
                          </span>
                        </div>

                        <div className="relative z-10 w-full mt-2">
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground/10 text-foreground rounded-xl font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-md">
                            <PlayCircle className="w-5 h-5" />
                            Bắt đầu ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* Popups */}
      {popup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-background border border-border p-8 rounded-[2rem] max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setPopup({ show: false, type: 'login' })}
              className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {popup.type === 'login' ? (
              <>
                <div className="w-20 h-20 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Yêu cầu Đăng nhập</h3>
                <p className="text-foreground/60 mb-8 font-medium">Bạn cần đăng nhập để làm đề thi này. Chờ gì nữa, tham gia ngay thôi!</p>
                <button 
                  onClick={() => {
                    setPopup({ show: false, type: 'login' });
                    router.push('/login');
                  }}
                  className="w-full py-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Đăng nhập ngay
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-500/20 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
                  <Crown className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Tính năng Premium</h3>
                <p className="text-foreground/60 mb-8 font-medium">
                  Đề thi này dành riêng cho tài khoản sở hữu 
                  <b>
                    {popup.planIds && popup.planIds.length > 0
                      ? ` 1 trong các gói: ${popup.planIds.map(id => plans.find(p => p.id === id)?.name || "Gói Premium").join(", ")}`
                      : " Gói Premium"}
                  </b>. 
                  Hãy nâng cấp để truy cập!
                </p>
                <button 
                  onClick={() => {
                    setPopup({ show: false, type: 'login' });
                    router.push('/premium');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg shadow-amber-500/25"
                >
                  Nâng cấp Premium
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
