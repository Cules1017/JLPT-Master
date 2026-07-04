export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Vocabulary {
  word: string;
  reading?: string;
  meaning_vi: string;
  meaning_en?: string;
}

export interface Grammar {
  pattern: string;
  meaning: string;
}

export interface Translation {
  question?: string;
  choices?: string[];
}

export interface Question {
  question_id: number | string;
  number: number;
  question: string;
  blank?: string | null;
  passage_ref?: string | null;
  choices: string[];
  correct_answer: number; // 1-indexed based on choices array
  answer_explanation?: string;
  choices_explanation?: string[];
  translation?: Translation;
  vocabulary?: Vocabulary[];
  grammar?: Grammar[];
  difficulty?: Difficulty;
  tags?: string[];
}

export interface AudioInfo {
  url: string | null;
  duration_seconds: number | null;
  transcript: string | null;
}

export interface Passage {
  id: string;
  content: string;
}

export interface Mondai {
  mondai_id: number | string;
  title: string;
  instruction: string;
  audio?: AudioInfo | null;
  passage?: Passage | null;
  questions: Question[];
}

export interface Section {
  section_id: number | string;
  name: string;
  mondai: Mondai[];
}

export interface ExamMetadata {
  exam: string; // e.g., "JLPT"
  level: string; // e.g., "N3"
  year?: number;
  session?: string; // e.g., "July"
  source?: string;
  total_questions: number;
  time_limit_minutes: Record<string, number>; // e.g., { "section_1": 25, "section_2": 50 }
}

export interface Exam {
  id: string; // Unique ID for the exam (not in original schema, but good for DB)
  metadata: ExamMetadata;
  sections: Section[];
}
