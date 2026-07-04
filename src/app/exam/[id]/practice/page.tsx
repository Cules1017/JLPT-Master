"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import { ChevronLeft, ListChecks } from "lucide-react";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ExamAudioPlayer } from "@/components/ExamAudioPlayer";

export default function PracticeMode() {
  const router = useRouter();
  const { exam, mode, isSubmitted, answers } = useExamStore();
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!exam || mode !== 'practice') {
      router.replace("/");
    } else if (exam.sections?.length > 0 && !activeSectionId) {
      setActiveSectionId(exam.sections[0].section_id || exam.sections[0].name);
    }
  }, [exam, mode, router, activeSectionId]);

  if (!exam || mode !== 'practice') return null;

  const activeSection = exam.sections?.find(s => (s.section_id || s.name) === activeSectionId);

  // Calculate Progress
  let correctCount = 0;
  let wrongCount = 0;
  let answeredCount = 0;
  let totalQuestions = exam.metadata.total_questions || 0;

  exam.sections?.forEach(s => {
    const mondais = s.mondai || (s as any).parts || [];
    mondais.forEach((m: any) => {
      const questions = m.questions || [];
      questions.forEach((q: any) => {
        const userAnswer = answers[q.question_id || q.id];
        if (userAnswer !== undefined) {
          answeredCount++;
          const correct = q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index;
          if (userAnswer === correct) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      });
    });
  });

  const remainingCount = totalQuestions - answeredCount;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const correctPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const wrongPercent = totalQuestions > 0 ? (wrongCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => router.push(`/exam/${exam.id}/mode`)}
            className="p-2 hover:bg-secondary rounded-full transition-colors shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base md:text-xl line-clamp-1">
              {exam.metadata.exam} {exam.metadata.level}
            </h1>
            <p className="text-xs text-foreground/60">Chế độ Luyện tập</p>
          </div>
        </div>

        {/* Progress Bar UI */}
        <div className="w-full md:w-[320px] lg:w-[400px] flex flex-col gap-1.5 bg-card/50 p-2 md:p-3 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-widest text-foreground/70">
            <span>Tiến độ</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="h-full bg-success transition-all duration-500 ease-out" 
              style={{ width: `${correctPercent}%` }}
              title={`Đúng: ${correctCount}`}
            />
            <div 
              className="h-full bg-destructive transition-all duration-500 ease-out" 
              style={{ width: `${wrongPercent}%` }}
              title={`Sai: ${wrongCount}`}
            />
          </div>
          <div className="flex justify-between text-[10px] md:text-xs font-bold mt-0.5 px-1">
            <span className="text-success">{correctCount} Đúng</span>
            <span className="text-destructive">{wrongCount} Sai</span>
            <span className="text-foreground/50">{remainingCount} Chưa làm</span>
          </div>
        </div>
        
        <button 
          onClick={() => router.push(`/exam/${exam.id}/results`)}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <ListChecks className="w-5 h-5" />
          <span className="hidden lg:inline">Kết thúc & Xem kết quả</span>
          <span className="inline lg:hidden">Kết thúc</span>
        </button>
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
                  {mondai.audio && <AudioPlayer filename={mondai.audio} />}
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
        </div>
      </main>

      {/* Global Exam Audio Player */}
      {exam.metadata?.audioUrl && (activeSection?.name?.toLowerCase().includes("nghe") || activeSection?.name?.toLowerCase().includes("choukai") || activeSection?.name?.toLowerCase().includes("listen")) && (
        <div className="sticky bottom-0 left-0 w-full z-20 p-4 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <ExamAudioPlayer src={exam.metadata.audioUrl} mode="practice" />
        </div>
      )}
    </div>
  );
}
