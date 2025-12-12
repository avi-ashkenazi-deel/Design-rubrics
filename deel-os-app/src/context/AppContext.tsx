import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  ViewType, 
  RubricData, 
  CompetencyDefinitions, 
  QuestionsData,
  DisciplineConfig
} from '../types';
import { 
  loadDisciplinesIndex,
  loadDisciplineConfig,
  loadRubricData,
  loadCompetencyDefinitions,
  loadQuestions
} from '../utils/csvParser';

interface AppContextType {
  // View state
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Discipline state
  disciplines: string[];
  currentDiscipline: string;
  setCurrentDiscipline: (discipline: string) => void;
  disciplineConfig: DisciplineConfig | null;
  
  // Rubric data
  rubricData: RubricData[];
  competencyDefinitions: CompetencyDefinitions;
  questionsData: QuestionsData;
  
  // Filters
  selectedScores: number[];
  setSelectedScores: (scores: number[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  selectedCompetency: string;
  setSelectedCompetency: (competency: string) => void;
  
  // Loading state
  isLoading: boolean;
  dataStatus: 'loading' | 'loaded' | 'error';
  statusMessage: string;
  
  // Actions
  reloadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // View state
  const [currentView, setCurrentView] = useState<ViewType>(null);
  
  // Discipline state
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [currentDiscipline, setCurrentDisciplineState] = useState<string>('');
  const [disciplineConfig, setDisciplineConfig] = useState<DisciplineConfig | null>(null);
  
  // Data state
  const [rubricData, setRubricData] = useState<RubricData[]>([]);
  const [competencyDefinitions, setCompetencyDefinitions] = useState<CompetencyDefinitions>({});
  const [questionsData, setQuestionsData] = useState<QuestionsData>({});
  
  // Filters
  const [selectedScores, setSelectedScores] = useState<number[]>([1, 2, 3, 4]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('Loading...');

  // Load initial disciplines
  useEffect(() => {
    async function init() {
      const loadedDisciplines = await loadDisciplinesIndex();
      setDisciplines(loadedDisciplines);
      
      if (loadedDisciplines.length > 0) {
        setCurrentDisciplineState(loadedDisciplines[0]);
      }
    }
    init();
  }, []);

  // Load data when discipline changes
  const loadData = useCallback(async (discipline: string) => {
    if (!discipline) return;
    
    setIsLoading(true);
    setDataStatus('loading');
    setStatusMessage('Loading CSV files...');

    try {
      const config = await loadDisciplineConfig(discipline);
      setDisciplineConfig(config);

      if (config) {
        const [rubric, definitions, questions] = await Promise.all([
          loadRubricData(discipline, config),
          loadCompetencyDefinitions(discipline),
          loadQuestions(discipline)
        ]);

        setRubricData(rubric);
        setCompetencyDefinitions(definitions);
        setQuestionsData(questions);

        // Set default levels
        const levels = [...new Set(rubric.map(r => r.designer_level))];
        if (levels.length > 0 && selectedLevels.length === 0) {
          setSelectedLevels(levels.slice(0, 2));
        }

        setDataStatus('loaded');
        setStatusMessage(`${rubric.length} entries loaded`);
      } else {
        setDataStatus('error');
        setStatusMessage('No configuration found');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setDataStatus('error');
      setStatusMessage('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevels.length]);

  // Reload data when discipline changes
  useEffect(() => {
    if (currentDiscipline) {
      loadData(currentDiscipline);
    }
  }, [currentDiscipline, loadData]);

  const setCurrentDiscipline = useCallback((discipline: string) => {
    setCurrentDisciplineState(discipline);
    setSelectedLevels([]);
    setSelectedStage('');
    setSelectedCompetency('');
  }, []);

  const reloadData = useCallback(async () => {
    await loadData(currentDiscipline);
  }, [currentDiscipline, loadData]);

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      disciplines,
      currentDiscipline,
      setCurrentDiscipline,
      disciplineConfig,
      rubricData,
      competencyDefinitions,
      questionsData,
      selectedScores,
      setSelectedScores,
      selectedLevels,
      setSelectedLevels,
      selectedStage,
      setSelectedStage,
      selectedCompetency,
      setSelectedCompetency,
      isLoading,
      dataStatus,
      statusMessage,
      reloadData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

