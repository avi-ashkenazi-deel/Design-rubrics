import Papa from 'papaparse';
import type { 
  RubricData, 
  CompetencyDefinitions, 
  QuestionsData, 
  LaddersDataResult,
  LadderData,
  DisciplineConfig,
  LaddersConfig,
  DisciplinesIndex,
  LaddersIndex,
  ProficiencyDataResult,
  ProficiencyLevel,
  RoleMappingResult,
  RoleMappingEntry
} from '../types';

// Get base URL from Vite
const BASE_URL = import.meta.env.BASE_URL || '/';

// Load disciplines index
export async function loadDisciplinesIndex(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}disciplines/index.json`);
    if (!response.ok) return [];
    const data: DisciplinesIndex = await response.json();
    return data.disciplines || [];
  } catch (error) {
    console.error('Failed to load disciplines index:', error);
    return [];
  }
}

// Load discipline config
export async function loadDisciplineConfig(discipline: string): Promise<DisciplineConfig | null> {
  try {
    const response = await fetch(`${BASE_URL}disciplines/${discipline}/files.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to load discipline config:', error);
    return null;
  }
}

// Load rubric data from CSV files
export async function loadRubricData(discipline: string, config: DisciplineConfig): Promise<RubricData[]> {
  const rubricData: RubricData[] = [];

  for (const fileConfig of config.files) {
    try {
      const response = await fetch(`${BASE_URL}disciplines/${discipline}/${fileConfig.file}`);
      if (!response.ok) continue;
      
      const csvText = await response.text();
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true
      });

      let currentStage = '';
      
      for (const row of parsed.data) {
        // Support multiple column name formats: Assessment Stage, Interview Stage, Focus Area
        const stage = row['Assessment Stage']?.trim() || 
                     row['Interview Stage']?.trim() || 
                     row['interview_stage']?.trim() || 
                     row['Focus Area']?.trim() || 
                     '';
        let competency = row['Competency']?.trim() || row['competency']?.trim() || '';
        
        if (stage) currentStage = stage;
        
        // Skip header rows
        if (competency.toLowerCase() === 'competency') continue;
        
        // Normalize competency name
        competency = competency.replace(/:\s*$/, '').trim();
        if (!competency) continue;

        // Support multiple column name formats (including multi-line headers like "Level 1:\nBasic...")
        const getScoreValue = (row: Record<string, string>, level: number): string => {
          // Try exact matches first
          if (row[`Level ${level}`]) return row[`Level ${level}`];
          if (row[String(level)]) return row[String(level)];
          if (row[`score_${level}`]) return row[`score_${level}`];
          
          // Try to find column that starts with "Level X"
          const keys = Object.keys(row);
          const levelKey = keys.find(k => k.startsWith(`Level ${level}`));
          if (levelKey) return row[levelKey];
          
          return '';
        };

        const score_1 = getScoreValue(row, 1);
        const score_2 = getScoreValue(row, 2);
        const score_3 = getScoreValue(row, 3);
        const score_4 = getScoreValue(row, 4);

        if (score_1 || score_2 || score_3 || score_4) {
          rubricData.push({
            interview_stage: currentStage,
            competency,
            designer_level: fileConfig.level,
            score_1,
            score_2,
            score_3,
            score_4
          });
        }
      }
    } catch (error) {
      console.error(`Failed to load ${fileConfig.file}:`, error);
    }
  }

  return rubricData;
}

// Load competency definitions
export async function loadCompetencyDefinitions(discipline: string): Promise<CompetencyDefinitions> {
  const definitions: CompetencyDefinitions = {};
  
  try {
    const response = await fetch(`${BASE_URL}disciplines/${discipline}/Competencies.csv`);
    if (!response.ok) return definitions;
    
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true
    });

    let currentFocusArea = '';

    for (const row of parsed.data) {
      const focusArea = row['Focus Area']?.trim() || '';
      let competency = row['Competency']?.trim() || '';
      const description = row['Description']?.trim() || '';
      const subCompetenciesRaw = row['Sub-competencies']?.trim() || '';

      // Parse sub-competencies from comma-separated string
      const subCompetencies = subCompetenciesRaw
        ? subCompetenciesRaw.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

      // Track current focus area for rows that don't repeat it
      if (focusArea) currentFocusArea = focusArea;

      competency = competency.replace(/:\s*$/, '').replace(/:$/, '').trim();
      
      if (competency) {
        // If there's a Description column, use it
        if (description) {
          definitions[competency] = { focusArea: currentFocusArea, description, subCompetencies };
        } else {
          // Otherwise, try to extract description from Level 1 column or create a placeholder
          const level1 = row['Level 1'] || row['Level 1:'] || 
                        Object.entries(row).find(([k]) => k.startsWith('Level 1'))?.[1] || '';
          
          // Use focus area as description if no other description available
          definitions[competency] = { 
            focusArea: currentFocusArea, 
            description: level1 ? `Level 1 criteria: ${level1.substring(0, 200)}...` : currentFocusArea || 'No description available'
          };
        }
      }
    }
  } catch (error) {
    console.error('Failed to load competency definitions:', error);
  }

  return definitions;
}

// Load questions
export async function loadQuestions(discipline: string): Promise<QuestionsData> {
  const questionsData: QuestionsData = {};
  
  try {
    const response = await fetch(`${BASE_URL}disciplines/${discipline}/Questions.csv`);
    if (!response.ok) return questionsData;
    
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true
    });

    for (const row of parsed.data) {
      const stage = row['Stage']?.trim() || '';
      let competency = row['Competency']?.trim() || '';
      const questions = row['Questions']?.trim() || '';

      competency = competency.replace(/:\s*$/, '').replace(/:$/, '').trim();

      if (stage && competency && questions) {
        const key = `${stage}_${competency}`;
        questionsData[key] = questions;
      }
    }
  } catch (error) {
    console.error('Failed to load questions:', error);
  }

  return questionsData;
}

// Load ladders disciplines
export async function loadLaddersDisciplines(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}Ladders/index.json`);
    if (!response.ok) return [];
    const data: LaddersIndex = await response.json();
    return data.disciplines || [];
  } catch (error) {
    console.error('Failed to load ladders disciplines:', error);
    return [];
  }
}

// Load ladders config
export async function loadLaddersConfig(discipline: string): Promise<LaddersConfig | null> {
  try {
    const response = await fetch(`${BASE_URL}Ladders/${discipline}/files.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to load ladders config:', error);
    return null;
  }
}

// Load ladders data
export async function loadLaddersData(filePath: string): Promise<LaddersDataResult> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) return { data: [], roles: [] };
    
    const csvText = await response.text();
    const parsed = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true
    });

    const headers = parsed.data[0] || [];
    const roleHeaders = headers.slice(2).filter(h => h && h.trim() && h !== '-');

    const data: LadderData[] = [];
    let currentFocusArea = '';

    for (let i = 1; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      if (!row || row.length < 2) continue;

      const focusArea = row[0]?.trim() || '';
      const competency = row[1]?.trim() || '';

      if (focusArea) currentFocusArea = focusArea;
      if (!competency) continue;

      const roles: Record<string, string> = {};
      roleHeaders.forEach((role, idx) => {
        const value = row[idx + 2]?.trim() || '-';
        roles[role] = value;
      });

      data.push({
        focusArea: currentFocusArea,
        competency,
        roles
      });
    }

    return { data, roles: roleHeaders };
  } catch (error) {
    console.error('Failed to load ladders data:', error);
    return { data: [], roles: [] };
  }
}

// Load proficiency-based ladder data (4 levels per competency)
export async function loadProficiencyData(filePath: string): Promise<ProficiencyDataResult> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) return { data: [], levelNames: [] };
    
    const csvText = await response.text();
    const parsed = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true
    });

    const headers = parsed.data[0] || [];
    const levelNames = headers.slice(2).filter(h => h && h.trim());

    const data: ProficiencyLevel[] = [];
    let currentFocusArea = '';

    for (let i = 1; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      if (!row || row.length < 2) continue;

      const focusArea = row[0]?.trim() || '';
      const competency = row[1]?.trim() || '';

      if (focusArea) currentFocusArea = focusArea;
      if (!competency) continue;

      const levels: Record<string, string> = {};
      levelNames.forEach((level, idx) => {
        levels[level] = row[idx + 2]?.trim() || '-';
      });

      data.push({
        focusArea: currentFocusArea,
        competency,
        levels
      });
    }

    return { data, levelNames };
  } catch (error) {
    console.error('Failed to load proficiency data:', error);
    return { data: [], levelNames: [] };
  }
}

// Load role-to-level mapping CSV
export async function loadRoleMapping(filePath: string): Promise<RoleMappingResult> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) return { mappings: [], roles: [], competencies: [] };
    
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const competencies = Object.keys(parsed.data[0] || {}).filter(k => k !== 'Role');
    const mappings: RoleMappingEntry[] = [];
    const roles: string[] = [];

    for (const row of parsed.data) {
      const role = row['Role']?.trim();
      if (!role) continue;

      roles.push(role);
      const competencyLevels: Record<string, number> = {};
      for (const comp of competencies) {
        competencyLevels[comp] = parseInt(row[comp] || '1', 10);
      }
      mappings.push({ role, competencyLevels });
    }

    return { mappings, roles, competencies };
  } catch (error) {
    console.error('Failed to load role mapping:', error);
    return { mappings: [], roles: [], competencies: [] };
  }
}

