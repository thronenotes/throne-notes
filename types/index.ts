export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: 'draft' | 'editing' | 'published' | 'archived';
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content: string;
  order_index: number;
  status: 'draft' | 'editing' | 'published';
  source_dream_id?: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  entry_type: 'dream' | 'revelation' | 'battle' | 'decree' | 'teaching';
  tags: string[];
  spiritual_state?: 'aligned' | 'drained' | 'anointed' | 'warring' | 'resting' | 'interceding';
  audio_url?: string;
  transcription?: string;
  is_transcribed: boolean;
  date_occurred: string;
  personal_year?: number;
  personal_month?: number;
  personal_day?: number;
  is_private: boolean;
  created_at: string;
}

export interface NumerologyProfile {
  life_path: number;
  expression_num: number;
  soul_urge_num: number;
  birthday_num?: number;
  personal_year: number;
  personal_month: number;
  personal_day: number;
}

export type SpiritualState = 'aligned' | 'drained' | 'anointed' | 'warring' | 'resting' | 'interceding';

export const SPIRITUAL_STATES: { value: SpiritualState; label: string; color: string }[] = [
  { value: 'aligned', label: 'Aligned', color: '#4ade80' },
  { value: 'anointed', label: 'Anointed', color: '#fbbf24' },
  { value: 'warring', label: 'Warring', color: '#f87171' },
  { value: 'interceding', label: 'Interceding', color: '#a78bfa' },
  { value: 'resting', label: 'Resting', color: '#60a5fa' },
  { value: 'drained', label: 'Drained', color: '#9ca3af' },
];

export const PROPHETIC_TAGS = [
  '#warning', '#financial', '#relational', '#ancestral', '#kingdom-building',
  '#soul-tie', '#financial-breakthrough', '#ancestral-cleansing', '#deliverance',
  '#prophecy', '#vision', '#dream', '#decree', '#fasting', '#consecration'
];
