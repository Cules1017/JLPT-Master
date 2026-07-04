"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, BarChart2, Target, Clock, Activity } from "lucide-react";
import Link from "next/link";

export default function StatisticsPage() {
  const [history, setHistory] = useState<any[] | undefined>(undefined);
  const [exams, setExams] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, examsRes] = await Promise.all([
          fetch('/api/history'),
          fetch('/api/exams')
        ]);
        if (historyRes.ok) setHistory(await historyRes.json());
        if (examsRes.ok) setExams(await examsRes.json());
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      }
    };
    fetchData();
  }, []);

  if (history === undefined || exams === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  const getExamName = (id: string) => {
    const exam = exams.find(e => e.id === id);
    if (!exam) return "Đề thi đã bị xóa";
    return `${exam.metadata.exam} ${exam.metadata.level} (${exam.metadata.year || ''})`;
  };

  const totalTests = history.length;
  let avgScore = 0;
  let totalTimeSpent = 0;

  if (totalTests > 0) {
    const sumScore = history.reduce((acc, curr) => acc + ((curr.score || 0) / curr.totalQuestions), 0);
    avgScore = Math.round((sumScore / totalTests) * 100);
    totalTimeSpent = history.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
  }

  const formatTimeSpent = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} phút`;
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-8">
      <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors w-fit">
        <ChevronLeft className="w-5 h-5" />
        <span>Quay lại Trang chủ</span>
      </Link>

      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="p-4 bg-primary/10 rounded-2xl">
          <BarChart2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Thống kê học tập</h1>
          <p className="text-lg text-foreground/60">Theo dõi tiến độ và lịch sử làm bài của bạn</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-accent/10 rounded-full text-accent">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-foreground/60 font-medium uppercase tracking-wider text-sm">Số bài đã làm</p>
            <p className="text-3xl font-extrabold">{totalTests}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-success/10 rounded-full text-success">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-foreground/60 font-medium uppercase tracking-wider text-sm">Tỷ lệ đúng TB</p>
            <p className="text-3xl font-extrabold">{avgScore}%</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-foreground/60 font-medium uppercase tracking-wider text-sm">Tổng thời gian</p>
            <p className="text-3xl font-extrabold">{formatTimeSpent(totalTimeSpent)}</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Lịch sử chi tiết</h2>
        
        {history.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-2xl bg-card/50 text-foreground/50">
            <p>Chưa có dữ liệu lịch sử.</p>
            <p className="text-sm mt-1">Bạn cần làm ít nhất 1 bài để xem thống kê.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map(record => {
              const percentage = Math.round(((record.score || 0) / record.totalQuestions) * 100);
              
              return (
                <div key={record.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg">{getExamName(record.examId)}</h3>
                    <p className="text-sm text-foreground/60 flex items-center gap-2">
                      <span>{new Date(record.date).toLocaleString('vi-VN')}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.mode === 'test' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                      }`}>
                        {record.mode === 'test' ? 'Thi Thật' : 'Luyện Tập'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 self-end md:self-auto">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-foreground/60 uppercase">Đúng</span>
                      <span className="font-bold text-lg">{record.score} / {record.totalQuestions}</span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex flex-col items-end w-16">
                      <span className="text-xs text-foreground/60 uppercase">Tỷ lệ</span>
                      <span className={`font-bold text-lg ${percentage >= 60 ? 'text-success' : 'text-destructive'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
