"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import { Clock, Send, AlertTriangle } from "lucide-react";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ExamAudioPlayer } from "@/components/ExamAudioPlayer";

export default function TestMode() {
  const router = useRouter();
  const { exam, mode, timeRemainingSeconds, tickTime, submitExam, isSubmitted } = useExamStore();
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!exam || mode !== 'test') {
      router.replace("/");
    } else if (exam.sections?.length > 0 && !activeSectionId) {
      setActiveSectionId(exam.sections[0].section_id || exam.sections[0].name);
    }
  }, [exam, mode, router, activeSectionId]);

  // Timer logic
  useEffect(() => {
    if (isSubmitted || !exam) return;
    const interval = setInterval(() => {
      tickTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, exam, tickTime]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeRemainingSeconds === 0 && !isSubmitted && exam) {
      handleSubmit();
    }
  }, [timeRemainingSeconds, isSubmitted, exam]);

  if (!exam || mode !== 'test') return null;

  const activeSection = exam.sections?.find(s => (s.section_id || s.name) === activeSectionId);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds < 300; // Less than 5 minutes

  const handleSubmit = () => {
    if (!isSubmitted) {
      submitExam();
    }
    router.push(`/exam/${exam.id}/results`);
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg md:text-xl text-primary">
            {exam.metadata.exam} {exam.metadata.level}
          </h1>
          <p className="text-xs text-foreground/60">Chế độ Thi thật</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl transition-colors ${
            isLowTime ? "bg-destructive/10 text-destructive animate-pulse" : "bg-card text-foreground"
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemainingSeconds)}
          </div>

          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-md shadow-primary/25"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Nộp bài</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sections Sidebar/Tabs */}
        <div className="w-full md:w-64 shrink-0 p-4 md:p-6 md:border-r border-border/50 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {exam.sections?.map(section => {
            const secId = section.section_id || section.name;
            return (
              <button
                key={secId}
                onClick={() => setActiveSectionId(secId)}
                className={`px-4 py-3 text-left rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeSectionId === secId 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "hover:bg-secondary text-foreground/70"
                }`}
              >
                {section.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 max-w-3xl overflow-y-auto">
          {(() => {
            const mondais = activeSection?.mondai || (activeSection as any)?.parts || [];
            return mondais.map((mondai: any) => (
              <div key={mondai.mondai_id || mondai.name} className="mb-12 flex flex-col gap-6">
                <div className="pb-4 border-b border-border/50">
                  <h2 className="text-2xl font-bold text-primary mb-2">{mondai.title || mondai.name}</h2>
                  <p className="text-foreground/80 text-lg mb-4">{mondai.instruction || mondai.description}</p>
                  {typeof mondai.audio === 'string' && <AudioPlayer filename={mondai.audio} />}
                </div>

                {mondai.passage && (
                  <div className="p-6 bg-card border border-border shadow-sm rounded-2xl">
                    <p className="leading-loose text-lg whitespace-pre-wrap">{mondai.passage.content || mondai.passage}</p>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {(mondai.questions || []).map((q: any) => {
                    const normalizedQ = {
                      ...q,
                      question_id: q.question_id || q.id,
                      question: q.question || q.question_text,
                      correct_answer: q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index,
                      answer_explanation: q.answer_explanation || q.explanation
                    };
                    return <QuestionCard key={normalizedQ.question_id} question={normalizedQ} />;
                  })}
                </div>
              </div>
            ));
          })()}
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Hoàn thành & Nộp bài
            </button>
          </div>
        </div>
      </main>

      {/* Global Exam Audio Player for Test Mode */}
      {exam.metadata?.audioUrl && (activeSection?.name?.toLowerCase().includes("nghe") || activeSection?.name?.toLowerCase().includes("choukai") || activeSection?.name?.toLowerCase().includes("listen")) && (
        <div className="sticky bottom-0 left-0 w-full z-20 p-4 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <ExamAudioPlayer src={exam.metadata.audioUrl} mode="test" />
        </div>
      )}
    </div>
  );
}
