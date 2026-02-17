/**
 * Supabase API client for the Rubric Editor.
 * Provides full CRUD operations using Supabase as the backend.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Types for API responses (compatible with existing frontend)
export interface RubricRow {
  id: number;
  interview_stage: string;
  competency: string;
  designer_level: string;
  score_1: string;
  score_2: string;
  score_3: string;
  score_4: string;
}

export interface CompetencyDefinitionWithId {
  id: number;
  focusArea: string;
  description: string;
}

export interface CompetencyDefinitionsResponse {
  [competency: string]: CompetencyDefinitionWithId;
}

export interface QuestionWithId {
  id: number;
  text: string;
}

export interface QuestionsResponse {
  [stageCompetency: string]: QuestionWithId;
}

export interface DisciplineConfig {
  files: { file: string; level: string }[];
}

export interface ChangeLogEntry {
  id: number;
  table_name: string;
  record_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by?: string;
}

export interface RevertResponse {
  success: boolean;
  reverted_to: string;
  message: string;
}

// Helper to cast Supabase response data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

// ============ Disciplines ============

export async function fetchDisciplines(): Promise<string[]> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('rubric_data')
    .select('discipline')
    .order('discipline');
  
  if (error) throw error;
  
  const rows = (data || []) as AnyData[];
  const disciplines = [...new Set(rows.map((d: AnyData) => d.discipline as string))];
  return disciplines;
}

export async function fetchDisciplineConfig(discipline: string): Promise<DisciplineConfig> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('rubric_data')
    .select('level')
    .eq('discipline', discipline)
    .order('level');
  
  if (error) throw error;
  
  const rows = (data || []) as AnyData[];
  const levels = [...new Set(rows.map((d: AnyData) => d.level as string))];
  const files = levels.map(level => ({ file: `${level}.csv`, level }));
  
  return { files };
}

export async function createDiscipline(
  name: string,
  initialRoles?: string[]
): Promise<{ success: boolean }> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const roles = initialRoles?.length ? initialRoles : ['Default Role'];
  
  const entries = roles.map(role => ({
    discipline: name,
    level: role,
    stage: 'General',
    competency: 'General',
    score_1: '',
    score_2: '',
    score_3: '',
    score_4: ''
  }));
  
  const { error } = await supabase
    .from('rubric_data')
    .insert(entries as AnyData[]);
  
  if (error) throw error;
  return { success: true };
}

export async function deleteDiscipline(discipline: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error: rubricError } = await supabase
    .from('rubric_data')
    .delete()
    .eq('discipline', discipline);
  
  if (rubricError) throw rubricError;
  
  await supabase.from('competency_definitions').delete().eq('discipline', discipline);
  await supabase.from('questions').delete().eq('discipline', discipline);
  await supabase.from('ladder_data').delete().eq('discipline', discipline);
  await supabase.from('competency_mappings').delete().eq('discipline', discipline);
}

// ============ Rubrics ============

export async function fetchRubrics(discipline: string, level?: string): Promise<RubricRow[]> {
  if (!supabase) throw new Error('Supabase not configured');
  
  let query = supabase
    .from('rubric_data')
    .select('*')
    .eq('discipline', discipline)
    .order('stage')
    .order('competency');
  
  if (level) {
    query = query.eq('level', level);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return ((data || []) as AnyData[]).map((r: AnyData) => ({
    id: r.id,
    interview_stage: r.stage,
    competency: r.competency,
    designer_level: r.level,
    score_1: r.score_1 || '',
    score_2: r.score_2 || '',
    score_3: r.score_3 || '',
    score_4: r.score_4 || ''
  }));
}

export async function updateRubric(
  id: number, 
  field: string, 
  value: string,
  changedBy?: string
): Promise<RubricRow> {
  if (!supabase) throw new Error('Supabase not configured');
  
  // Get current value for history
  const { data: currentData } = await supabase
    .from('rubric_data')
    .select('*')
    .eq('id', id)
    .single();
  
  const current = currentData as AnyData;
  if (!current) throw new Error('Rubric not found');
  
  // Map field names
  const dbField = field === 'interview_stage' ? 'stage' : 
                  field === 'designer_level' ? 'level' : field;
  
  const oldValue = current[dbField];
  
  // Update the rubric
  const { data: updatedData, error } = await supabase
    .from('rubric_data')
    .update({ [dbField]: value } as AnyData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  const data = updatedData as AnyData;
  
  // Record in history
  if (changedBy) {
    await supabase.from('change_history').insert({
      rubric_id: id,
      field: dbField,
      old_value: String(oldValue || ''),
      new_value: value,
      changed_by: changedBy
    } as AnyData);
  }
  
  return {
    id: data.id,
    interview_stage: data.stage,
    competency: data.competency,
    designer_level: data.level,
    score_1: data.score_1 || '',
    score_2: data.score_2 || '',
    score_3: data.score_3 || '',
    score_4: data.score_4 || ''
  };
}

// ============ Competency Definitions ============

export async function fetchCompetencies(discipline: string): Promise<CompetencyDefinitionsResponse> {
  if (!supabase) throw new Error('Supabase not configured');
  
  // Fetch discipline-specific competencies
  const { data, error } = await supabase
    .from('competency_definitions')
    .select('*')
    .eq('discipline', discipline)
    .order('competency');
  
  if (error) throw error;
  
  const result: CompetencyDefinitionsResponse = {};
  
  // Determine focus area label for discipline-specific competencies
  const craftLabel = discipline === 'Deel' 
    ? '' 
    : `Craft-specific Competencies: ${discipline.toLowerCase()} skills`;
  
  for (const d of ((data || []) as AnyData[])) {
    result[d.competency] = {
      id: d.id,
      focusArea: craftLabel,
      description: d.definition || ''
    };
  }
  
  // For non-Deel disciplines, also fetch Deel competencies (IC + Manager)
  if (discipline !== 'Deel') {
    const { data: deelData, error: deelError } = await supabase
      .from('competency_definitions')
      .select('*')
      .eq('discipline', 'Deel')
      .order('competency');
    
    if (!deelError && deelData) {
      // Known Deel Manager competencies
      const managerCompetencies = ['Drives High Performance', 'Develops Talent', 'Execution & Impact'];
      
      for (const d of (deelData as AnyData[])) {
        const compName = d.competency as string;
        // Don't overwrite discipline-specific definitions
        if (!result[compName]) {
          const isManager = managerCompetencies.includes(compName);
          result[compName] = {
            id: d.id,
            focusArea: isManager 
              ? 'Deel Manager Competencies: company-wide competencies for people managers'
              : 'Deel IC Competencies: company-wide competencies for all individual contributors',
            description: d.definition || ''
          };
        }
      }
    }
  }
  
  return result;
}

export async function createCompetencyDefinition(
  discipline: string,
  competency: string,
  _focusArea: string,
  description: string
): Promise<{ id: number }> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('competency_definitions')
    .insert({
      discipline,
      competency,
      definition: description
    } as AnyData)
    .select()
    .single();
  
  if (error) throw error;
  return { id: (data as AnyData).id };
}

export async function updateCompetencyDefinition(
  id: number,
  competency: string,
  _focusArea: string,
  description: string
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('competency_definitions')
    .update({
      competency,
      definition: description
    } as AnyData)
    .eq('id', id);
  
  if (error) throw error;
}

export async function updateCompetency(id: number, field: string, value: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const dbField = field === 'description' ? 'definition' : field;
  
  const { error } = await supabase
    .from('competency_definitions')
    .update({ [dbField]: value } as AnyData)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteCompetencyDefinition(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('competency_definitions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============ Questions ============

export async function fetchQuestions(discipline: string): Promise<QuestionsResponse> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('discipline', discipline)
    .order('stage')
    .order('competency');
  
  if (error) throw error;
  
  const result: QuestionsResponse = {};
  for (const q of ((data || []) as AnyData[])) {
    const key = `${q.stage}_${q.competency}`;
    result[key] = {
      id: q.id,
      text: q.question
    };
  }
  
  return result;
}

export async function updateQuestions(id: number, questions: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('questions')
    .update({ question: questions } as AnyData)
    .eq('id', id);
  
  if (error) throw error;
}

// ============ Stages ============

export async function getStages(discipline: string): Promise<string[]> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('rubric_data')
    .select('stage')
    .eq('discipline', discipline)
    .order('stage');
  
  if (error) throw error;
  
  return [...new Set(((data || []) as AnyData[]).map((d: AnyData) => d.stage as string))];
}

export async function createStage(
  discipline: string,
  stageName: string,
  competencies: string[]
): Promise<{ success: boolean; created: number }> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data: levels } = await supabase
    .from('rubric_data')
    .select('level')
    .eq('discipline', discipline);
  
  const uniqueLevels = [...new Set(((levels || []) as AnyData[]).map((l: AnyData) => l.level as string))];
  
  if (!uniqueLevels.length) {
    throw new Error('No levels found for this discipline');
  }
  
  const entries = [];
  for (const level of uniqueLevels) {
    for (const competency of competencies) {
      entries.push({
        discipline,
        level,
        stage: stageName,
        competency,
        score_1: '',
        score_2: '',
        score_3: '',
        score_4: ''
      });
    }
  }
  
  const { error } = await supabase
    .from('rubric_data')
    .insert(entries as AnyData[]);
  
  if (error) throw error;
  
  return { success: true, created: entries.length };
}

export async function deleteStage(discipline: string, stage: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('rubric_data')
    .delete()
    .eq('discipline', discipline)
    .eq('stage', stage);
  
  if (error) throw error;
}

// ============ Roles ============

export async function createRole(
  discipline: string,
  roleName: string,
  copyFrom?: string
): Promise<{ success: boolean }> {
  if (!supabase) throw new Error('Supabase not configured');
  
  let entries: AnyData[] = [];
  
  if (copyFrom) {
    const { data } = await supabase
      .from('rubric_data')
      .select('stage, competency')
      .eq('discipline', discipline)
      .eq('level', copyFrom);
    
    entries = ((data || []) as AnyData[]).map((row: AnyData) => ({
      discipline,
      level: roleName,
      stage: row.stage,
      competency: row.competency,
      score_1: '',
      score_2: '',
      score_3: '',
      score_4: ''
    }));
  } else {
    const { data } = await supabase
      .from('rubric_data')
      .select('stage, competency')
      .eq('discipline', discipline);
    
    const unique = new Map<string, { stage: string; competency: string }>();
    for (const row of ((data || []) as AnyData[])) {
      const key = `${row.stage}_${row.competency}`;
      if (!unique.has(key)) {
        unique.set(key, { stage: row.stage, competency: row.competency });
      }
    }
    
    entries = Array.from(unique.values()).map(row => ({
      discipline,
      level: roleName,
      stage: row.stage,
      competency: row.competency,
      score_1: '',
      score_2: '',
      score_3: '',
      score_4: ''
    }));
  }
  
  if (entries.length) {
    const { error } = await supabase
      .from('rubric_data')
      .insert(entries);
    
    if (error) throw error;
  }
  
  return { success: true };
}

export async function deleteRole(discipline: string, role: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('rubric_data')
    .delete()
    .eq('discipline', discipline)
    .eq('level', role);
  
  if (error) throw error;
}

// ============ Change Log / History ============

export async function fetchChangelog(limit = 50): Promise<ChangeLogEntry[]> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('change_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return ((data || []) as AnyData[]).map((h: AnyData) => ({
    id: h.id,
    table_name: 'rubrics',
    record_id: h.rubric_id,
    field_name: h.field,
    old_value: h.old_value,
    new_value: h.new_value,
    changed_at: h.changed_at,
    changed_by: h.changed_by
  }));
}

export async function revertChange(historyId: number): Promise<RevertResponse> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data: historyData } = await supabase
    .from('change_history')
    .select('*')
    .eq('id', historyId)
    .single();
  
  const history = historyData as AnyData;
  if (!history) throw new Error('History entry not found');
  
  const { data: rubricData } = await supabase
    .from('rubric_data')
    .select('*')
    .eq('id', history.rubric_id)
    .single();
  
  const rubric = rubricData as AnyData;
  if (!rubric) throw new Error('Rubric not found');
  
  const currentValue = rubric[history.field];
  
  const { error } = await supabase
    .from('rubric_data')
    .update({ [history.field]: history.old_value } as AnyData)
    .eq('id', history.rubric_id);
  
  if (error) throw error;
  
  await supabase.from('change_history').insert({
    rubric_id: history.rubric_id,
    field: history.field,
    old_value: String(currentValue || ''),
    new_value: history.old_value || '',
    changed_by: 'system (revert)'
  } as AnyData);
  
  return {
    success: true,
    reverted_to: history.old_value || '',
    message: 'Change reverted successfully'
  };
}

// ============ Health Check ============

export async function checkHealth(): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from('rubric_data').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ============ User Role ============

export async function getUserRole(userId: string): Promise<string> {
  if (!supabase) return 'viewer';
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return (data as AnyData)?.role || 'viewer';
}

export async function setUserRole(email: string, role: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('profiles')
    .update({ role } as AnyData)
    .eq('email', email);
  
  if (error) throw error;
}

// Export flag for checking if Supabase is available
export { isSupabaseConfigured };
