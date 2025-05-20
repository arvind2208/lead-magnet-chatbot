export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN_ENDED = 'open_ended',
}

export enum OpenEndedInputType {
  TEXT = 'text',
  EMAIL = 'email',
  NUMBER = 'number',
  CURRENCY = 'currency',
}

export interface QuestionNode {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  next: (response?: string, allResponses?: Responses) => string;
  dataKey: string | null;
  inputType?: OpenEndedInputType; // For OPEN_ENDED questions
  isEndPoint?: boolean;
  placeholder?: string;
  validate?: (value: string) => string | null; // Returns error message string or null if valid
}

export interface QuestionTree {
  [key: string]: QuestionNode;
}

export interface Responses {
  [key: string]: any;
}

export interface ChatMessage {
  id: string; // Unique ID for each message, e.g., timestamp or uuid
  sender: 'user' | 'bot';
  text: string | React.ReactNode; // Allow ReactNode for rendering options as part of bot message
  questionId?: string; // The ID of the question this message relates to
}