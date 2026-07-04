"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import { ChevronLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function ResultsMode() {
  const router = useRouter();
  const { exam, mode, answers, timeRemainingSeconds, isSubmitted, submitExam, resetExam } = useExamStore();
  const [hasSaved, setHasSaved] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null);

  // Auto submit if somehow they navigated here without submitting
  useEffect(() => {
    if (!isSubmitted) {
      submitExam();
    }
  }, [isSubmitted, submitExam]);

  // Save history
  useEffect(() => {
    const saveHistory = async () => {
      if (!exam || !mode || hasSaved) return;

      const totalQuestions = exam.metadata.total_questions;
      let score = 0;
      
      exam.sections?.forEach(s => {
        const mondais = s.mondai || (s as any).parts || [];
        mondais.forEach((m: any) => {
          const questions = m.questions || [];
          questions.forEach((q: any) => {
            const correct = q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index;
            if (answers[q.question_id || q.id] === correct) {
              score++;
            }
          });
        });
      });

      let totalTimeLimit = 0;
      if (exam.metadata.time_limit_minutes) {
        if (typeof exam.metadata.time_limit_minutes === 'number') {
          totalTimeLimit = exam.metadata.time_limit_minutes * 60;
        } else if (typeof exam.metadata.time_limit_minutes === 'object') {
          totalTimeLimit = Object.values(exam.metadata.time_limit_minutes).reduce((a: any, b: any) => a + b, 0) * 60;
        }
      }
      if (totalTimeLimit === 0) totalTimeLimit = 120 * 60; // fallback

      const timeSpent = mode === 'test' ? totalTimeLimit - timeRemainingSeconds : 0;

      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            examId: exam.id,
            mode,
            score,
            totalQuestions,
            answers,
            timeSpentSeconds: timeSpent
          })
        });
      } catch (err) {
        console.error("Failed to save history", err);
      }

      setHasSaved(true);
    };

    saveHistory();
  }, [exam, mode, answers, timeRemainingSeconds, hasSaved]);

  useEffect(() => {
    if (exam && exam.sections?.length > 0 && !activeSectionId) {
      setActiveSectionId(exam.sections[0].section_id || exam.sections[0].name);
    }
  }, [exam, activeSectionId]);

  if (!exam) return null;

  // Calculate score
  let correctCount = 0;
  let totalCount = 0;
  
  exam.sections?.forEach(s => {
    const mondais = s.mondai || (s as any).parts || [];
    mondais.forEach((m: any) => {
      const questions = m.questions || [];
      questions.forEach((q: any) => {
        totalCount++;
        const correct = q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index;
        if (answers[q.question_id || q.id] === correct) {
          correctCount++;
        }
      });
    });
  });

  const percentage = Math.round((correctCount / totalCount) * 100) || 0;
  const activeSection = exam.sections?.find(s => (s.section_id || s.name) === activeSectionId);

  const handleRetry = () => {
    resetExam();
    router.push(`/exam/${exam.id}/mode`);
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col pb-12">
      <header className="glass border-b border-border/50 px-6 py-6 flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold text-2xl md:text-3xl text-primary">Kết quả {mode === 'test' ? 'Thi Thật' : 'Luyện Tập'}</h1>
        <p className="text-foreground/70 text-lg">{exam.metadata.exam} {exam.metadata.level}</p>
        
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-success">{correctCount}</span>
            <span className="text-sm font-medium text-foreground/60 uppercase tracking-wider">Số câu đúng</span>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-foreground">{totalCount}</span>
            <span className="text-sm font-medium text-foreground/60 uppercase tracking-wider">Tổng số câu</span>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-extrabold ${percentage >= 60 ? 'text-success' : 'text-destructive'}`}>
              {percentage}%
            </span>
            <span className="text-sm font-medium text-foreground/60 uppercase tracking-wider">Tỷ lệ đúng</span>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Làm lại
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
              Về trang chủ
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full mt-8 gap-8 px-4 md:px-8">
        {/* Sections Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {exam.sections?.map(section => {
            // Count correct for this section
            let secTotal = 0;
            let secCorrect = 0;
            const mondais = section.mondai || (section as any).parts || [];
            mondais.forEach((m: any) => (m.questions || []).forEach((q: any) => {
              secTotal++;
              const correct = q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index;
              if (answers[q.question_id || q.id] === correct) secCorrect++;
            }));

            const secId = section.section_id || section.name;

            return (
              <button
                key={secId}
                onClick={() => setActiveSectionId(secId)}
                className={`px-4 py-3 text-left rounded-xl font-medium whitespace-nowrap transition-colors flex justify-between items-center ${
                  activeSectionId === secId 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "bg-card hover:bg-secondary text-foreground/80 border border-border/50"
                }`}
              >
                <span>{section.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeSectionId === secId ? "bg-primary-foreground/20" : "bg-secondary-foreground/10"
                }`}>
                  {secCorrect}/{secTotal}
                </span>
              </button>
            )
          })}
        </div>

        {/* Review Questions */}
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Xem lại chi tiết
          </h2>
          {(() => {
            const mondais = activeSection?.mondai || (activeSection as any)?.parts || [];
            return mondais.map((mondai: any) => (
              <div key={mondai.mondai_id || mondai.name} className="mb-12 flex flex-col gap-6">
                <div className="pb-4 border-b border-border/50">
                  <h3 className="text-xl font-bold text-primary mb-2">{mondai.title || mondai.name}</h3>
                  <p className="text-foreground/80 mb-4">{mondai.instruction || mondai.description}</p>
                  {typeof mondai.audio === 'string' && <AudioPlayer filename={mondai.audio} />}
                </div>

                {mondai.passage && (
                  <div className="p-6 bg-card border border-border shadow-sm rounded-2xl">
                    <p className="leading-loose text-lg whitespace-pre-wrap">{mondai.passage.content || mondai.passage}</p>
                  </div>
                )}

                <div className="flex flex-col gap-8">
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
    </div>
  );
}
