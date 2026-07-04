import { create } from 'zustand';
import type { Exam } from '@/types/exam';

interface ExamState {
  exam: Exam | null;
  mode: 'practice' | 'test' | null;
  answers: Record<string | number, number>; // Maps question_id to selected choice (1-indexed)
  timeRemainingSeconds: number;
  isSubmitted: boolean;
  
  // Actions
  initExam: (exam: Exam, mode: 'practice' | 'test', initialTime?: number) => void;
  setAnswer: (questionId: string | number, choiceIndex: number) => void;
  tickTime: () => void;
  submitExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  exam: null,
  mode: null,
  answers: {},
  timeRemainingSeconds: 0,
  isSubmitted: false,

  initExam: (exam, mode, initialTime = 0) => set({
    exam,
    mode,
    answers: {},
    timeRemainingSeconds: initialTime,
    isSubmitted: false,
  }),

  setAnswer: (questionId, choiceIndex) => set((state) => {
    // In practice mode or before submit in test mode
    if (state.isSubmitted) return state;
    
    return {
      answers: {
        ...state.answers,
        [questionId]: choiceIndex
      }
    };
  }),

  tickTime: () => set((state) => {
    if (state.timeRemainingSeconds <= 0 || state.isSubmitted) return state;
    return { timeRemainingSeconds: state.timeRemainingSeconds - 1 };
  }),

  submitExam: () => set({ isSubmitted: true }),

  resetExam: () => set({
    exam: null,
    mode: null,
    answers: {},
    timeRemainingSeconds: 0,
    isSubmitted: false,
  })
}));
