export interface FeedbackInput {
  feedbacks: string[];
  productName: string;
  analysisType: 'quick' | 'detailed';
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
}

export interface Problem {
  title: string;
  description: string;
  frequency: 'high' | 'medium' | 'low';
  affectedArea: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  impact: string;
}

export interface AnalysisResult {
  productName: string;
  totalFeedbacks: number;
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: SentimentScore;
  summary: string;
  keyThemes: string[];
  problems: Problem[];
  recommendations: Recommendation[];
  npsScore: number;
  analyzedAt: string;
}

export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: AnalysisResult | null;
  error: string | null;
}
