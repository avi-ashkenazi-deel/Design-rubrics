// User and Auth types
export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// View types
export type ViewType = 'definitions' | 'rubric' | 'ladders' | null;

// Discipline types
export interface DisciplineFile {
  file: string;
  level: string;
}

export interface DisciplineConfig {
  files: DisciplineFile[];
}

export interface DisciplinesIndex {
  disciplines: string[];
}

// Rubric types
export interface RubricData {
  interview_stage: string;
  competency: string;
  designer_level: string;
  score_1: string;
  score_2: string;
  score_3: string;
  score_4: string;
}

// Competency types
export interface CompetencyDefinition {
  focusArea: string;
  description: string;
}

export interface CompetencyDefinitions {
  [competency: string]: CompetencyDefinition;
}

// Questions types
export interface QuestionsData {
  [stageCompetency: string]: string;
}

// Ladders types
export interface LadderFile {
  file: string;
  name: string;
}

export interface LaddersConfig {
  files: LadderFile[];
}

export interface LaddersIndex {
  disciplines: string[];
}

export interface LadderRoles {
  [roleName: string]: string;
}

export interface LadderData {
  focusArea: string;
  competency: string;
  roles: LadderRoles;
}

export interface LaddersDataResult {
  data: LadderData[];
  roles: string[];
}

// Transcript Analysis types
export interface TranscriptAnalysisResult {
  question: string;
  covered: boolean;
  confidence: number;
}

export interface TranscriptResults {
  [competency: string]: TranscriptAnalysisResult[];
}

export interface TranscriptAnalysis {
  interviewer: string;
  interviewee: string;
  stage: string;
  results: TranscriptResults;
}

// App State
export interface AppState {
  currentView: ViewType;
  currentDiscipline: string;
  rubricData: RubricData[];
  competencyDefinitions: CompetencyDefinitions;
  questionsData: QuestionsData;
  selectedScores: number[];
  selectedLevels: string[];
}

// Ladders State
export interface LaddersState {
  currentDiscipline: string;
  laddersData: LadderData[];
  availableRoles: string[];
  selectedRoles: string[];
  config: LaddersConfig | null;
}

