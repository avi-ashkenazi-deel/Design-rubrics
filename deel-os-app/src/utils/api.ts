// API client for backend
// Supports: Supabase (production), Node.js, or Flask (development)

import { isSupabaseConfigured } from '../lib/supabase';
import * as supabaseApi from './supabaseApi';

// Legacy API endpoints for local development
const API_BASES = ['http://localhost:3001/api', 'http://localhost:5000/api'];
let API_BASE = API_BASES[0];

// Auto-detect which backend is available (legacy mode only)
async function detectBackend(): Promise<string> {
  if (isSupabaseConfigured) {
    console.log('Using Supabase backend');
    return '';
  }
  
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/health`, { method: 'GET' });
      if (response.ok) {
        console.log(`Using API backend: ${base}`);
        return base;
      }
    } catch {
      // Try next backend
    }
  }
  console.log('No backend available, using CSV fallback mode');
  return API_BASES[0];
}

// Initialize backend detection
detectBackend().then(base => { API_BASE = base; });

// Types for API responses
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
  id?: number;
  focusArea: string;
  description: string;
  subCompetencies?: string[];
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

// API Functions

export async function fetchDisciplines(): Promise<string[]> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchDisciplines();
  }
  const response = await fetch(`${API_BASE}/disciplines`);
  if (!response.ok) throw new Error('Failed to fetch disciplines');
  return response.json();
}

export async function fetchDisciplineConfig(discipline: string): Promise<DisciplineConfig> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchDisciplineConfig(discipline);
  }
  const response = await fetch(`${API_BASE}/disciplines/${encodeURIComponent(discipline)}/config`);
  if (!response.ok) throw new Error('Failed to fetch discipline config');
  return response.json();
}

export async function fetchRubrics(discipline: string, level?: string): Promise<RubricRow[]> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchRubrics(discipline, level);
  }
  let url = `${API_BASE}/rubrics/${encodeURIComponent(discipline)}`;
  if (level) {
    url += `?level=${encodeURIComponent(level)}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch rubrics');
  return response.json();
}

export async function fetchCompetencies(discipline: string): Promise<CompetencyDefinitionsResponse> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchCompetencies(discipline);
  }
  const response = await fetch(`${API_BASE}/competencies/${encodeURIComponent(discipline)}`);
  if (!response.ok) throw new Error('Failed to fetch competencies');
  return response.json();
}

export async function fetchQuestions(discipline: string): Promise<QuestionsResponse> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchQuestions(discipline);
  }
  const response = await fetch(`${API_BASE}/questions/${encodeURIComponent(discipline)}`);
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
}

export async function updateRubric(id: number, field: string, value: string, changedBy?: string): Promise<RubricRow> {
  if (isSupabaseConfigured) {
    return supabaseApi.updateRubric(id, field, value, changedBy);
  }
  const response = await fetch(`${API_BASE}/rubrics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });
  if (!response.ok) throw new Error('Failed to update rubric');
  return response.json();
}

export async function updateCompetency(id: number, field: string, value: string): Promise<void> {
  const response = await fetch(`${API_BASE}/competencies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });
  if (!response.ok) throw new Error('Failed to update competency');
}

export async function updateQuestions(id: number, questions: string): Promise<void> {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions }),
  });
  if (!response.ok) throw new Error('Failed to update questions');
}

export async function fetchChangelog(limit = 50): Promise<ChangeLogEntry[]> {
  if (isSupabaseConfigured) {
    return supabaseApi.fetchChangelog(limit);
  }
  const response = await fetch(`${API_BASE}/changelog?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch changelog');
  return response.json();
}

export interface RevertResponse {
  success: boolean;
  reverted_to: string;
  message: string;
}

export async function revertChange(historyId: number): Promise<RevertResponse> {
  if (isSupabaseConfigured) {
    return supabaseApi.revertChange(historyId);
  }
  const response = await fetch(`${API_BASE}/changelog/${historyId}/revert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revert change');
  }
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  if (isSupabaseConfigured) {
    return supabaseApi.checkHealth();
  }
  // Try all backends to check health
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/health`);
      const data = await response.json();
      if (data.status === 'ok') {
        API_BASE = base; // Update API_BASE to the working one
        return true;
      }
    } catch {
      // Try next backend
    }
  }
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ============ Competency Definition CRUD ============

export async function createCompetencyDefinition(
  discipline: string, 
  competency: string, 
  focusArea: string, 
  description: string
): Promise<{ id: number }> {
  if (isSupabaseConfigured) {
    return supabaseApi.createCompetencyDefinition(discipline, competency, focusArea, description);
  }
  const response = await fetch(`${API_BASE}/competencies/${encodeURIComponent(discipline)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competency, focus_area: focusArea, description }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create competency');
  }
  return response.json();
}

export async function updateCompetencyDefinition(
  id: number,
  competency: string,
  focusArea: string,
  description: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/competencies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competency, focus_area: focusArea, description }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update competency');
  }
}

export async function deleteCompetencyDefinition(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/competencies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete competency');
  }
}

// ============ Stage CRUD ============

export async function getStages(discipline: string): Promise<string[]> {
  if (isSupabaseConfigured) {
    return supabaseApi.getStages(discipline);
  }
  const response = await fetch(`${API_BASE}/stages/${encodeURIComponent(discipline)}`);
  if (!response.ok) throw new Error('Failed to fetch stages');
  const data = await response.json();
  return data.stages;
}

export async function createStage(
  discipline: string,
  stageName: string,
  competencies: string[]
): Promise<{ success: boolean; created: number }> {
  if (isSupabaseConfigured) {
    return supabaseApi.createStage(discipline, stageName, competencies);
  }
  const response = await fetch(`${API_BASE}/stages/${encodeURIComponent(discipline)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: stageName, competencies }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create stage');
  }
  return response.json();
}

export async function deleteStage(discipline: string, stage: string): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseApi.deleteStage(discipline, stage);
  }
  const response = await fetch(
    `${API_BASE}/stages/${encodeURIComponent(discipline)}/${encodeURIComponent(stage)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete stage');
  }
}

// ============ Role CRUD ============

export async function createRole(
  discipline: string,
  roleName: string,
  copyFrom?: string
): Promise<{ success: boolean }> {
  if (isSupabaseConfigured) {
    return supabaseApi.createRole(discipline, roleName, copyFrom);
  }
  const response = await fetch(`${API_BASE}/roles/${encodeURIComponent(discipline)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: roleName, copy_from: copyFrom }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create role');
  }
  return response.json();
}

export async function deleteRole(discipline: string, role: string): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseApi.deleteRole(discipline, role);
  }
  const response = await fetch(
    `${API_BASE}/roles/${encodeURIComponent(discipline)}/${encodeURIComponent(role)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete role');
  }
}

// ============ Discipline CRUD ============

export async function createDiscipline(
  name: string,
  initialRoles?: string[]
): Promise<{ success: boolean }> {
  if (isSupabaseConfigured) {
    return supabaseApi.createDiscipline(name, initialRoles);
  }
  const response = await fetch(`${API_BASE}/disciplines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, roles: initialRoles }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create discipline');
  }
  return response.json();
}

export async function deleteDiscipline(discipline: string): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseApi.deleteDiscipline(discipline);
  }
  const response = await fetch(`${API_BASE}/disciplines/${encodeURIComponent(discipline)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete discipline');
  }
}

