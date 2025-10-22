
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  dates: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  dates: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export enum ResumeStyle {
  MinimalistTech = 'Minimalist Tech',
  ExecutiveElegance = 'Executive Elegance',
  CreativePortfolio = 'Creative Portfolio',
  ModernHybrid = 'Modern Hybrid',
}

export interface AtsScore {
  score: number;
  keywordMatch: number;
  formattingCompliance: number;
  sectionClarity: number;
}

export interface AtsAnalysis {
  before: AtsScore;
  after: AtsScore;
  improvements: string[];
}

export enum PageSize {
  Letter = 'letter',
  A4 = 'a4',
}

export enum AppView {
  UPLOAD,
  RESULTS,
}
