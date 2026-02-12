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
  isExplaining?: boolean; // Loading state for PT explanation
  metadata?: {
    correction?: string | null;
    explanation?: string | null;
    naturalVersion?: string | null;
    explanationPt?: string | null; // New field for Portuguese explanation
  };
}