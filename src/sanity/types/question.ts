export type QuestionType = 'multipleChoice' | 'boolean' | 'text';

export interface BaseQuestion {
  _type: 'question';
  question: string;
  type: QuestionType;
  category: string;
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