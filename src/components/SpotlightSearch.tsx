"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Command, BookOpen, ChevronRight, X, Lock, Unlock, Crown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Exam } from "@/types/exam";

export function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch exams and subscriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
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
          console.error(err);
        }
      }
    };
    fetchUserSubs();
  }, [session]);

  // Keyboard shortcuts and events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-spotlight", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-spotlight", handleOpenEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter logic
  const filteredExams = query.trim() === "" 
    ? [] 
    : exams.filter((exam) => {
        const title = exam.title?.toLowerCase() || "";
        const level = exam.level?.toLowerCase() || "";
        const search = query.toLowerCase();
        return title.includes(search) || level.includes(search) || `${exam.metadata?.exam} ${level}`.toLowerCase().includes(search);
      }).slice(0, 8); // Giới hạn 8 kết quả

  // Navigate results with keyboard
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredExams.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredExams.length > 0) {
        e.preventDefault();
        const selected = filteredExams[selectedIndex];
        if (selected) {
          setIsOpen(false);
          router.push(`/exam/${selected.id}/mode`);
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredExams, selectedIndex, router]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-md animate-in fade-in duration-200 flex items-start justify-center pt-[15vh] px-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="relative flex items-center px-4 py-4 border-b border-border bg-background">
          <Search className="w-6 h-6 text-indigo-500 shrink-0 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm đề thi (Ví dụ: N3, JLPT tháng 7...)"
            className="w-full bg-transparent border-none outline-none text-xl lg:text-2xl font-medium px-4 text-foreground placeholder:text-foreground/30"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors hidden sm:block"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-12 flex flex-col items-center justify-center text-foreground/40 gap-4">
              <Command className="w-12 h-12 opacity-20" />
              <p className="font-medium text-center">Gõ từ khóa để bắt đầu tìm kiếm<br/><span className="text-sm opacity-60">Bạn có thể dùng phím mũi tên Lên/Xuống để điều hướng</span></p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center text-foreground/50 font-medium">
              Không tìm thấy đề thi nào khớp với "{query}"
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              <div className="px-3 py-2 text-xs font-bold text-foreground/40 uppercase tracking-wider">
                Kết quả tìm kiếm
              </div>
              {filteredExams.map((exam, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={exam.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/exam/${exam.id}/mode`);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-500/10" : "hover:bg-foreground/5"
                    }`}
                  >
                    <div className={`p-3 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-foreground/5 text-foreground/50'}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate ${isSelected ? 'text-indigo-500' : 'text-foreground'}`}>
                        {exam.title || `${exam.metadata?.exam} ${exam.metadata?.level}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-foreground/50 font-medium truncate">
                          Cấp độ: {exam.level} • {exam.metadata?.year || ''} {exam.metadata?.session || ''}
                        </p>
                        
                        {/* Access Badge */}
                        {session?.user?.role === "ADMIN" ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                            <Sparkles className="w-3 h-3" /> Admin
                          </span>
                        ) : exam.accessLevel === "FREE" ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                            Free
                          </span>
                        ) : exam.accessLevel === "LOGIN" && !session ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20">
                            <Lock className="w-3 h-3" /> Login
                          </span>
                        ) : exam.accessLevel === "LOGIN" && session ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20">
                            Free (User)
                          </span>
                        ) : (
                          (() => {
                            const requiredPlanIds = exam.accessLevel === "PREMIUM" ? (exam.planIds || []) : [exam.accessLevel];
                            const hasAccess = userSubs.some(sub => requiredPlanIds.includes(sub.planId));
                            
                            if (hasAccess) {
                              return (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                                  <Unlock className="w-3 h-3" /> Đã mở
                                </span>
                              );
                            }
                            
                            return (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded border border-amber-500/20">
                                <Crown className="w-3 h-3" /> Premium
                              </span>
                            );
                          })()
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <ChevronRight className="w-5 h-5 text-indigo-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer hints */}
        <div className="px-4 py-3 border-t border-border bg-foreground/[0.02] flex items-center justify-between text-xs font-medium text-foreground/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-background border border-border shadow-sm">↑</kbd><kbd className="px-1.5 py-0.5 rounded bg-background border border-border shadow-sm">↓</kbd> để di chuyển</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-background border border-border shadow-sm">↵</kbd> để chọn</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-background border border-border shadow-sm">esc</kbd> để đóng</span>
        </div>
      </div>
    </div>
  );
}
