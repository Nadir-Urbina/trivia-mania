export type QuestionType = 'multipleChoice' | 'boolean' | 'text';

export interface Category {
  _id: string;
  title: string;
  description?: string;
}

export interface BaseQuestion {
  _type: 'question';
  question: string;
  type: QuestionType;
  // Legacy field
  category?: string;
  // New field
  categories?: Category[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  answers: string[];
  correctAnswer: string;
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  correctAnswer: boolean;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  correctAnswer: string;
  acceptableAnswers?: string[];
}

export type Question = MultipleChoiceQuestion | BooleanQuestion | TextQuestion; 