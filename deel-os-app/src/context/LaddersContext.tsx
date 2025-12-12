import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LadderData, LaddersConfig } from '../types';
import { loadLaddersDisciplines, loadLaddersConfig, loadLaddersData } from '../utils/csvParser';

interface LaddersContextType {
  // Discipline state
  disciplines: string[];
  currentDiscipline: string;
  setCurrentDiscipline: (discipline: string) => void;
  
  // Config
  config: LaddersConfig | null;
  
  // Data
  laddersData: LadderData[];
  availableRoles: string[];
  
  // Selection
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
  toggleRole: (role: string) => void;
  selectedFocusArea: string;
  setSelectedFocusArea: (area: string) => void;
  
  // File selection
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  
  // Loading
  isLoading: boolean;
  
  // Focus areas
  focusAreas: string[];
}

const LaddersContext = createContext<LaddersContextType | undefined>(undefined);

interface LaddersProviderProps {
  children: ReactNode;
}

export function LaddersProvider({ children }: LaddersProviderProps) {
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [currentDiscipline, setCurrentDisciplineState] = useState<string>('');
  const [config, setConfig] = useState<LaddersConfig | null>(null);
  const [laddersData, setLaddersData] = useState<LadderData[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('');
  const [selectedFile, setSelectedFileState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load disciplines on mount
  useEffect(() => {
    async function init() {
      const loaded = await loadLaddersDisciplines();
      setDisciplines(loaded);
      if (loaded.length > 0) {
        setCurrentDisciplineState(loaded[0]);
      }
    }
    init();
  }, []);

  // Load config when discipline changes
  useEffect(() => {
    async function loadConfig() {
      if (!currentDiscipline) return;
      
      const loadedConfig = await loadLaddersConfig(currentDiscipline);
      setConfig(loadedConfig);
      
      // Auto-select first file
      if (loadedConfig?.files?.length) {
        setSelectedFileState(loadedConfig.files[0].file);
      }
    }
    loadConfig();
  }, [currentDiscipline]);

  // Load data when file changes
  useEffect(() => {
    async function loadData() {
      if (!currentDiscipline || !selectedFile) return;
      
      setIsLoading(true);
      const basePath = import.meta.env.BASE_URL || '/';
      const filePath = `${basePath}Ladders/${currentDiscipline}/${selectedFile}`;
      const result = await loadLaddersData(filePath);
      
      setLaddersData(result.data);
      setAvailableRoles(result.roles);
      setSelectedRoles(result.roles.slice(0, 2));
      setIsLoading(false);
    }
    loadData();
  }, [currentDiscipline, selectedFile]);

  const setCurrentDiscipline = useCallback((discipline: string) => {
    setCurrentDisciplineState(discipline);
    setLaddersData([]);
    setAvailableRoles([]);
    setSelectedRoles([]);
    setSelectedFocusArea('');
    setSelectedFileState('');
  }, []);

  const setSelectedFile = useCallback((file: string) => {
    setSelectedFileState(file);
    setSelectedFocusArea('');
  }, []);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }, []);

  const focusAreas = [...new Set(laddersData.map(d => d.focusArea))].filter(Boolean);

  return (
    <LaddersContext.Provider value={{
      disciplines,
      currentDiscipline,
      setCurrentDiscipline,
      config,
      laddersData,
      availableRoles,
      selectedRoles,
      setSelectedRoles,
      toggleRole,
      selectedFocusArea,
      setSelectedFocusArea,
      selectedFile,
      setSelectedFile,
      isLoading,
      focusAreas
    }}>
      {children}
    </LaddersContext.Provider>
  );
}

export function useLadders() {
  const context = useContext(LaddersContext);
  if (context === undefined) {
    throw new Error('useLadders must be used within a LaddersProvider');
  }
  return context;
}

