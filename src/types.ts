export interface PracticeSession {
  id: string;
  date: string;
  durationSeconds: number;
  notes: string;
  type: 'livre' | 'sombra';
  completed: boolean;
}

export interface ErrorLog {
  id: string;
  date: string;
  category: string; // e.g., 'Redes Sociais', 'Mensagens', 'Ansiedade', 'Notícias', 'Vídeos', 'Outros'
  description: string;
  intensity: number; // 1-5 scale (severity of distraction or urge)
}

export interface AppSettings {
  dailyGoalMinutes: number;
  enableAudioSynthesizer: boolean;
  enablePaperGrain: boolean;
  activeLanguage: 'pt-br';
  enableDarkMode?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  isLoggedIn: boolean;
}
