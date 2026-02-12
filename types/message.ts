export interface AIResponseSchema {
  reply: string;
  correction: string | null;
  explanation: string | null;
  natural_version: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  metadata?: {
    correction?: string | null;
    explanation?: string | null;
    naturalVersion?: string | null;
  };
}