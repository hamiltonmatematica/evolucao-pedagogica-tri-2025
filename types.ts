export enum Area {
  NATUREZA = 'Ciências da Natureza',
  MATEMATICA = 'Matemática',
  LINGUAGENS = 'Linguagens e Códigos',
  HUMANAS = 'Ciências Humanas'
}

export interface SkillData {
  id: string; // e.g., "H01"
  probability: number; // 0-100
  description?: string;
}

export interface ExamResult {
  examId: string;
  examName: string; // e.g., "Simulado Fevereiro"
  date: string;
  areas: {
    [key in Area]?: {
      rawScore: number; // Acertos
      triScore: number; // Nota TRI
      skills: SkillData[];
    }
  }
}

export interface Student {
  id: string;
  name: string;
  results: ExamResult[];
}

export interface GlobalStats {
  examName: string;
  date: string;
  averageTri: number;
  averageRaw: number;
  proficiencyDistribution: {
    below500: number;
    range500to600: number;
    range600to700: number;
    range700to800: number;
    above800: number;
  };
}

export interface DashboardContextState {
  selectedStudentId: string;
  selectedArea: Area;
}