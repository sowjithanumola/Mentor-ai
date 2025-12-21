
export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  level: StudentLevel;
  subject?: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export enum Subject {
  Mathematics = 'Mathematics',
  Science = 'Science',
  English = 'English',
  ComputerScience = 'Computer Science',
  History = 'History',
  Geography = 'Geography'
}
