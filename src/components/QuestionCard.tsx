"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";
import { CheckCircle2, XCircle, Info, BookOpen } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { mode, answers, setAnswer, isSubmitted } = useExamStore();
  const [showExplanation, setShowExplanation] = useState(false);
  
  const selectedChoice = answers[question.question_id];
  const isPractice = mode === 'practice';
  // Show results if it's practice mode and user has answered, OR if test mode is submitted
  const showResult = (isPractice && selectedChoice !== undefined) || (mode === 'test' && isSubmitted);

  const handleSelect = (index: number) => {
    if (showResult && isPractice) return; // In practice, lock answer after selection
    if (mode === 'test' && isSubmitted) return;
    setAnswer(question.question_id, index);
  };

  const renderQuestionText = (text: string, highlight?: string) => {
    if (!highlight) return text;
    
    const parts = text.split(highlight);
    if (parts.length === 1) return text;

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index !== parts.length - 1 && (
              <strong className="underline decoration-primary decoration-2 underline-offset-4 text-primary font-bold px-0.5">
                {highlight}
              </strong>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="glass rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
      <div className="flex gap-4 items-start">
        <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
          {question.number}
        </span>
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-lg font-medium leading-relaxed">
            {renderQuestionText(question.question, question.blank ?? undefined)}
          </p>
          {question.translation?.question && (
            <p className="text-sm text-foreground/60 italic">{question.translation.question}</p>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {question.choices.map((choice, idx) => {
          const choiceNumber = idx + 1; // 1-indexed
          const isSelected = selectedChoice === choiceNumber;
          const isCorrect = showResult && choiceNumber === question.correct_answer;
          const isWrong = showResult && isSelected && choiceNumber !== question.correct_answer;

          let buttonClass = "relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ";
          
          if (showResult) {
            if (isCorrect) {
              buttonClass += "bg-success/10 border-success text-success shadow-sm shadow-success/20 font-medium";
            } else if (isWrong) {
              buttonClass += "bg-destructive/10 border-destructive text-destructive opacity-80 font-medium";
            } else {
              buttonClass += "border-transparent bg-secondary/50 opacity-50";
            }
          } else {
            if (isSelected) {
              buttonClass += "bg-primary/10 border-primary text-primary shadow-sm";
            } else {
              buttonClass += "border-transparent bg-secondary hover:bg-secondary/80 hover:border-border";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(choiceNumber)}
              disabled={showResult && isPractice}
              className={buttonClass}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-background/50 text-sm font-bold shadow-sm">
                  {choiceNumber}
                </span>
                <span className="flex-1">{choice}</span>
                {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                {showResult && isWrong && <XCircle className="w-5 h-5 text-destructive" />}
              </div>
              {showResult && question.translation?.choices?.[idx] && (
                <p className="mt-2 ml-9 text-sm opacity-70 italic">
                  {question.translation.choices[idx]}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && isPractice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="font-bold flex items-center gap-2 text-primary mb-2">
                  <Info className="w-5 h-5" />
                  Giải thích
                </h4>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {question.answer_explanation || "Không có giải thích chi tiết."}
                </p>
                {question.choices_explanation && (
                  <ul className="mt-3 space-y-1 text-sm text-foreground/70">
                    {question.choices_explanation.map((exp, i) => (
                      <li key={i}><span className="font-bold">{i+1}.</span> {exp}</li>
                    ))}
                  </ul>
                )}
              </div>

              {question.vocabulary && question.vocabulary.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-bold flex items-center gap-2 text-accent mb-3">
                    <BookOpen className="w-5 h-5" />
                    Từ vựng
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {question.vocabulary.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl bg-secondary/50 flex flex-col">
                        <div className="flex items-end gap-2">
                          <span className="font-bold text-lg">{v.word}</span>
                          {v.reading && <span className="text-sm text-foreground/60 mb-0.5">【{v.reading}】</span>}
                        </div>
                        <span className="text-sm text-foreground/80 mt-1">{v.meaning_vi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
