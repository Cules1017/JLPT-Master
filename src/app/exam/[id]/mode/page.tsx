"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Exam } from "@/types/exam";
import { BookOpen, Clock, ChevronLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useExamStore } from "@/store/examStore";

export default function ModeSelection() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const initExam = useExamStore(state => state.initExam);

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/exams/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Không thể tải đề thi");
        }
        setExam(data);
      } catch (err: any) {
        setErrorMsg(err.message);
        setExam(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleStart = (mode: 'practice' | 'test') => {
    if (!exam) return;
    
    // Tính tổng thời gian nếu là test mode
    let totalTime = 0;
    if (mode === 'test') {
      if (exam.metadata.time_limit_minutes) {
        if (typeof exam.metadata.time_limit_minutes === 'number') {
          totalTime = exam.metadata.time_limit_minutes * 60;
        } else if (typeof exam.metadata.time_limit_minutes === 'object') {
          totalTime = Object.values(exam.metadata.time_limit_minutes).reduce((a: any, b: any) => a + b, 0) * 60;
        }
      }
      
      if (totalTime === 0) {
        totalTime = 120 * 60; // Default 120 minutes fallback
      }
    }
    
    initExam(exam, mode, totalTime);
    router.push(`/exam/${id}/${mode}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0A0A0B] text-foreground">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">{errorMsg || "Không tìm thấy đề thi"}</h1>
        <Link href="/">
          <button className="px-6 py-3 mt-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
            Quay lại trang chủ
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col gap-8">
      <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors w-fit">
        <ChevronLeft className="w-5 h-5" />
        <span>Quay lại</span>
      </Link>
      
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold">{exam.metadata.exam} {exam.metadata.level}</h1>
        <p className="text-lg text-foreground/70">{exam.metadata.year} • {exam.metadata.session}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <button 
          onClick={() => handleStart('practice')}
          className="glass group rounded-3xl p-8 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          <div className="p-4 bg-accent/10 rounded-full group-hover:scale-110 transition-transform">
            <BookOpen className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold">Luyện tập</h2>
          <p className="text-foreground/70">
            Làm bài không giới hạn thời gian. Xem ngay đáp án, giải thích, từ vựng và ngữ pháp sau mỗi câu.
          </p>
        </button>

        <button 
          onClick={() => handleStart('test')}
          className="glass group rounded-3xl p-8 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          <div className="p-4 bg-destructive/10 rounded-full group-hover:scale-110 transition-transform">
            <Clock className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Thi thật</h2>
          <p className="text-foreground/70">
            Đồng hồ đếm ngược. Không xem được đáp án cho đến khi nộp bài. Áp lực như thi thật.
          </p>
        </button>
      </div>
    </main>
  );
}
