import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LadderData, LaddersConfig, ProficiencyLevel, RoleMappingEntry } from '../types';
import { loadLaddersDisciplines, loadLaddersConfig, loadLaddersData, loadProficiencyData, loadRoleMapping } from '../utils/csvParser';

interface LaddersContextType {
  // Discipline state
  disciplines: string[];
  currentDiscipline: string;
  setCurrentDiscipline: (discipline: string) => void;
  
  // Config
  config: LaddersConfig | null;
  
  // Legacy data (role-based)
  laddersData: LadderData[];
  availableRoles: string[];
  
  // Proficiency data (level-based)
  proficiencyData: ProficiencyLevel[];
  levelNames: string[];
  roleMappings: RoleMappingEntry[];
  mappedRoles: string[];
  hasProficiencyData: boolean;
  
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
  
  // Editing
  updateLadderCell: (focusArea: string, competency: string, role: string, value: string) => void;
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

  // Proficiency state
  const [proficiencyData, setProficiencyData] = useState<ProficiencyLevel[]>([]);
  const [levelNames, setLevelNames] = useState<string[]>([]);
  const [roleMappings, setRoleMappings] = useState<RoleMappingEntry[]>([]);
  const [mappedRoles, setMappedRoles] = useState<string[]>([]);
  const [hasProficiencyData, setHasProficiencyData] = useState(false);

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
      
      // Load legacy data
      const result = await loadLaddersData(filePath);
      setLaddersData(result.data);
      setAvailableRoles(result.roles);

      // Check for proficiency + mapping files
      const currentFileConfig = config?.files?.find(f => f.file === selectedFile);
      
      if (currentFileConfig?.proficiencyFile && currentFileConfig?.mappingFile) {
        const profPath = `${basePath}Ladders/${currentDiscipline}/${currentFileConfig.proficiencyFile}`;
        const mapPath = `${basePath}Ladders/${currentDiscipline}/${currentFileConfig.mappingFile}`;
        
        const [profResult, mapResult] = await Promise.all([
          loadProficiencyData(profPath),
          loadRoleMapping(mapPath)
        ]);

        if (profResult.data.length > 0 && mapResult.mappings.length > 0) {
          setProficiencyData(profResult.data);
          setLevelNames(profResult.levelNames);
          setRoleMappings(mapResult.mappings);
          setMappedRoles(mapResult.roles);
          setHasProficiencyData(true);
          // Use mapped roles for selection
          setSelectedRoles(mapResult.roles.slice(0, 2));
          setIsLoading(false);
          return;
        }
      }

      // Fallback: no proficiency data, use legacy
      setProficiencyData([]);
      setLevelNames([]);
      setRoleMappings([]);
      setMappedRoles([]);
      setHasProficiencyData(false);
      setSelectedRoles(result.roles.slice(0, 2));
      setIsLoading(false);
    }
    loadData();
  }, [currentDiscipline, selectedFile, config]);

  const setCurrentDiscipline = useCallback((discipline: string) => {
    setCurrentDisciplineState(discipline);
    setLaddersData([]);
    setAvailableRoles([]);
    setSelectedRoles([]);
    setSelectedFocusArea('');
    setSelectedFileState('');
    setProficiencyData([]);
    setLevelNames([]);
    setRoleMappings([]);
    setMappedRoles([]);
    setHasProficiencyData(false);
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

  const updateLadderCell = useCallback((focusArea: string, competency: string, role: string, value: string) => {
    if (hasProficiencyData) {
      // In proficiency mode, the "role" is actually a level name
      setProficiencyData(prev => prev.map(item => {
        if (item.focusArea === focusArea && item.competency === competency) {
          return {
            ...item,
            levels: { ...item.levels, [role]: value }
          };
        }
        return item;
      }));
    } else {
      setLaddersData(prev => prev.map(item => {
        if (item.focusArea === focusArea && item.competency === competency) {
          return {
            ...item,
            roles: { ...item.roles, [role]: value }
          };
        }
        return item;
      }));
    }
  }, [hasProficiencyData]);

  const focusAreas = hasProficiencyData 
    ? [...new Set(proficiencyData.map(d => d.focusArea))].filter(Boolean)
    : [...new Set(laddersData.map(d => d.focusArea))].filter(Boolean);

  return (
    <LaddersContext.Provider value={{
      disciplines,
      currentDiscipline,
      setCurrentDiscipline,
      config,
      laddersData,
      availableRoles,
      proficiencyData,
      levelNames,
      roleMappings,
      mappedRoles,
      hasProficiencyData,
      selectedRoles,
      setSelectedRoles,
      toggleRole,
      selectedFocusArea,
      setSelectedFocusArea,
      selectedFile,
      setSelectedFile,
      isLoading,
      focusAreas,
      updateLadderCell
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
