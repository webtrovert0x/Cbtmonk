export interface Question {
  id: number;
  question: string;
  option: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  section: string;
  image: string;
  answer: string;
  solution: string;
  examtype: string;
  examyear: string;
}

export interface Subject {
  id: string;
  name: string;
  questionCount: number;
}

export interface ExamState {
  status: 'idle' | 'loading' | 'active' | 'finished';
  selectedSubjects: string[];
  questions: Record<string, Question[]>; // Map subject name to questions
  answers: Record<string, Record<number, string>>; // Map subject -> question index -> selected option (a,b,c,d)
  submittedAnswers: Record<string, Set<number>>; // Map subject -> set of submitted question indices
  currentSubject: string;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  loadingProgress: string;
}

export const AVAILABLE_SUBJECTS: Subject[] = [
  { id: 'english', name: 'English Language', questionCount: 60 },
  { id: 'mathematics', name: 'Mathematics', questionCount: 40 },
  { id: 'commerce', name: 'Commerce', questionCount: 40 },
  { id: 'accounting', name: 'Accounting', questionCount: 40 },
  { id: 'biology', name: 'Biology', questionCount: 40 },
  { id: 'physics', name: 'Physics', questionCount: 40 },
  { id: 'chemistry', name: 'Chemistry', questionCount: 40 },
  { id: 'englishlit', name: 'Literature in English', questionCount: 40 },
  { id: 'government', name: 'Government', questionCount: 40 },
  { id: 'crk', name: 'CRK', questionCount: 40 },
  { id: 'geography', name: 'Geography', questionCount: 40 },
  { id: 'economics', name: 'Economics', questionCount: 40 },
  { id: 'irk', name: 'IRK', questionCount: 40 },
  { id: 'civiledu', name: 'Civic Education', questionCount: 40 },
  { id: 'insurance', name: 'Insurance', questionCount: 40 },
  { id: 'currentaffairs', name: 'Current Affairs', questionCount: 40 },
  { id: 'history', name: 'History', questionCount: 40 },
];
