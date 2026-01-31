import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { 
  ViewType, 
  RubricData,
  DisciplineConfig
} from '../types';
import { 
  loadDisciplinesIndex,
  loadDisciplineConfig,
  loadRubricData,
  loadCompetencyDefinitions,
  loadQuestions
} from '../utils/csvParser';
import {
  fetchDisciplines,
  fetchDisciplineConfig,
  fetchRubrics,
  fetchCompetencies,
  fetchQuestions,
  updateRubric,
  checkHealth,
  type RubricRow
} from '../utils/api';

// Extended rubric data with database ID
export interface RubricDataWithId extends RubricData {
  id?: number;
}

// Extended competency definitions with IDs
export interface CompetencyDefinitionWithId {
  id?: number;
  focusArea: string;
  description: string;
}

export interface CompetencyDefinitionsWithId {
  [competency: string]: CompetencyDefinitionWithId;
}

// Extended questions with IDs
export interface QuestionsDataWithId {
  [stageCompetency: string]: string | { id: number; text: string };
}

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
  rubricData: RubricDataWithId[];
  competencyDefinitions: CompetencyDefinitionsWithId;
  questionsData: QuestionsDataWithId;
  
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
  
  // Data source
  useApi: boolean;
  
  // Actions
  reloadData: () => Promise<void>;
  updateCell: (id: number, field: string, value: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// URL parameter helpers
function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function updateUrl(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === '' || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
}

export function AppProvider({ children }: AppProviderProps) {
  // Track if we've initialized from URL
  const initializedFromUrl = useRef(false);
  const urlInitialValues = useRef<{
    view?: ViewType;
    discipline?: string;
    stage?: string;
    competency?: string;
    levels?: string[];
    scores?: number[];
  }>({});

  // Parse URL params on mount
  useEffect(() => {
    const params = getUrlParams();
    const view = params.get('view') as ViewType;
    const discipline = params.get('discipline');
    const stage = params.get('stage');
    const competency = params.get('competency');
    const levels = params.get('levels');
    const scores = params.get('scores');
    
    urlInitialValues.current = {
      view: view || undefined,
      discipline: discipline || undefined,
      stage: stage || undefined,
      competency: competency || undefined,
      levels: levels ? levels.split(',') : undefined,
      scores: scores ? scores.split(',').map(Number) : undefined
    };
  }, []);

  // View state
  const [currentView, setCurrentViewState] = useState<ViewType>(null);
  
  // Discipline state
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [currentDiscipline, setCurrentDisciplineState] = useState<string>('');
  const [disciplineConfig, setDisciplineConfig] = useState<DisciplineConfig | null>(null);
  
  // Data state
  const [rubricData, setRubricData] = useState<RubricDataWithId[]>([]);
  const [competencyDefinitions, setCompetencyDefinitions] = useState<CompetencyDefinitionsWithId>({});
  const [questionsData, setQuestionsData] = useState<QuestionsDataWithId>({});
  
  // Filters
  const [selectedScores, setSelectedScoresState] = useState<number[]>([1, 2, 3, 4]);
  const [selectedLevels, setSelectedLevelsState] = useState<string[]>([]);
  const [selectedStage, setSelectedStageState] = useState<string>('');
  const [selectedCompetency, setSelectedCompetencyState] = useState<string>('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('Loading...');
  
  // API availability
  const [useApi, setUseApi] = useState(false);

  // Wrapped setters that also update URL
  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    updateUrl({ view: view });
  }, []);

  const setSelectedScores = useCallback((scores: number[]) => {
    setSelectedScoresState(scores);
    updateUrl({ scores: scores.join(',') });
  }, []);

  const setSelectedLevels = useCallback((levels: string[]) => {
    setSelectedLevelsState(levels);
    updateUrl({ levels: levels.length > 0 ? levels.join(',') : null });
  }, []);

  const setSelectedStage = useCallback((stage: string) => {
    setSelectedStageState(stage);
    updateUrl({ stage: stage || null });
  }, []);

  const setSelectedCompetency = useCallback((competency: string) => {
    setSelectedCompetencyState(competency);
    updateUrl({ competency: competency || null });
  }, []);

  // Check API availability and load disciplines
  useEffect(() => {
    async function init() {
      // Check if API is available
      const apiAvailable = await checkHealth();
      
      let loadedDisciplines: string[] = [];
      let useApiForData = apiAvailable;
      
      if (apiAvailable) {
        console.log('✅ Supabase connection available');
        try {
          loadedDisciplines = await fetchDisciplines();
          // If Supabase is empty, fall back to CSV
          if (loadedDisciplines.length === 0) {
            console.log('📁 Supabase is empty, falling back to CSV files');
            loadedDisciplines = await loadDisciplinesIndex();
            useApiForData = false;
          }
        } catch (error) {
          console.error('API fetch failed, falling back to CSV:', error);
          useApiForData = false;
          loadedDisciplines = await loadDisciplinesIndex();
        }
      } else {
        console.log('📁 Using CSV files (Supabase not configured)');
        loadedDisciplines = await loadDisciplinesIndex();
        useApiForData = false;
      }
      
      setUseApi(useApiForData);
      
      setDisciplines(loadedDisciplines);
      
      // Apply URL params or defaults
      const urlValues = urlInitialValues.current;
      
      // Set discipline from URL or default to first
      const disciplineToSet = urlValues.discipline && loadedDisciplines.includes(urlValues.discipline)
        ? urlValues.discipline
        : loadedDisciplines[0] || '';
      
      if (disciplineToSet) {
        setCurrentDisciplineState(disciplineToSet);
        updateUrl({ discipline: disciplineToSet });
      }
      
      // Set view from URL
      if (urlValues.view) {
        setCurrentViewState(urlValues.view);
      }
      
      // Set stage from URL
      if (urlValues.stage) {
        setSelectedStageState(urlValues.stage);
      }
      
      // Set competency from URL
      if (urlValues.competency) {
        setSelectedCompetencyState(urlValues.competency);
      }
      
      // Set scores from URL
      if (urlValues.scores) {
        setSelectedScoresState(urlValues.scores);
      }
      
      initializedFromUrl.current = true;
    }
    init();
  }, []);

  // Load data from API
  const loadDataFromApi = useCallback(async (discipline: string) => {
    const config = await fetchDisciplineConfig(discipline);
    setDisciplineConfig(config);

    const [rubrics, definitions, questions] = await Promise.all([
      fetchRubrics(discipline),
      fetchCompetencies(discipline),
      fetchQuestions(discipline)
    ]);

    // Transform rubrics to match existing format
    const transformedRubrics: RubricDataWithId[] = rubrics.map((r: RubricRow) => ({
      id: r.id,
      interview_stage: r.interview_stage,
      competency: r.competency,
      designer_level: r.designer_level,
      score_1: r.score_1,
      score_2: r.score_2,
      score_3: r.score_3,
      score_4: r.score_4
    }));

    setRubricData(transformedRubrics);
    setCompetencyDefinitions(definitions);
    setQuestionsData(questions);

    return transformedRubrics;
  }, []);

  // Load data from CSV files
  const loadDataFromCsv = useCallback(async (discipline: string) => {
    const config = await loadDisciplineConfig(discipline);
    setDisciplineConfig(config);

    if (!config) {
      throw new Error('No configuration found');
    }

    const [rubric, definitions, questions] = await Promise.all([
      loadRubricData(discipline, config),
      loadCompetencyDefinitions(discipline),
      loadQuestions(discipline)
    ]);

    setRubricData(rubric);
    setCompetencyDefinitions(definitions);
    setQuestionsData(questions);

    return rubric;
  }, []);

  // Load data when discipline changes
  const loadData = useCallback(async (discipline: string) => {
    if (!discipline) return;
    
    setIsLoading(true);
    setDataStatus('loading');
    setStatusMessage(useApi ? 'Loading from database...' : 'Loading CSV files...');

    try {
      const rubric = useApi 
        ? await loadDataFromApi(discipline)
        : await loadDataFromCsv(discipline);

      // Get available levels
      const levels = [...new Set(rubric.map(r => r.designer_level))];
      
      // Set levels from URL if available and valid, otherwise use defaults
      const urlLevels = urlInitialValues.current.levels;
      if (urlLevels && urlLevels.length > 0 && initializedFromUrl.current === false) {
        // Filter to only valid levels
        const validUrlLevels = urlLevels.filter(l => levels.includes(l));
        if (validUrlLevels.length > 0) {
          setSelectedLevelsState(validUrlLevels);
          updateUrl({ levels: validUrlLevels.join(',') });
        } else if (levels.length > 0) {
          setSelectedLevelsState(levels.slice(0, 2));
          updateUrl({ levels: levels.slice(0, 2).join(',') });
        }
      } else if (selectedLevels.length === 0 && levels.length > 0) {
        setSelectedLevelsState(levels.slice(0, 2));
        updateUrl({ levels: levels.slice(0, 2).join(',') });
      }

      setDataStatus('loaded');
      setStatusMessage(`${rubric.length} entries loaded${useApi ? ' from database' : ''}`);
    } catch (error) {
      console.error('Failed to load data:', error);
      setDataStatus('error');
      setStatusMessage('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [useApi, selectedLevels.length, loadDataFromApi, loadDataFromCsv]);

  // Reload data when discipline changes
  useEffect(() => {
    if (currentDiscipline) {
      loadData(currentDiscipline);
    }
  }, [currentDiscipline, loadData]);

  const setCurrentDiscipline = useCallback((discipline: string) => {
    setCurrentDisciplineState(discipline);
    setSelectedLevelsState([]);
    setSelectedStageState('');
    setSelectedCompetencyState('');
    updateUrl({ 
      discipline, 
      levels: null, 
      stage: null, 
      competency: null 
    });
  }, []);

  const reloadData = useCallback(async () => {
    await loadData(currentDiscipline);
  }, [currentDiscipline, loadData]);

  // Update a rubric cell (API only)
  const updateCell = useCallback(async (id: number, field: string, value: string) => {
    if (!useApi) {
      throw new Error('Editing requires the API server to be running');
    }

    // Optimistic update
    setRubricData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));

    try {
      await updateRubric(id, field, value);
    } catch (error) {
      // Revert on error
      await reloadData();
      throw error;
    }
  }, [useApi, reloadData]);

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
      useApi,
      reloadData,
      updateCell
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
