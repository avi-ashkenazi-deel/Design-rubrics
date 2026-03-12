import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { MultiSelect } from '../shared/MultiSelect';
import { AddDisciplineModal } from '../shared/AddDisciplineModal';
import { AddStageModal } from '../shared/AddStageModal';
import { AddRoleModal } from '../shared/AddRoleModal';

export function ContentFilters() {
  const [showAddDiscipline, setShowAddDiscipline] = useState(false);
  const [showAddStage, setShowAddStage] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);

  const {
    currentView,
    disciplines,
    currentDiscipline,
    setCurrentDiscipline,
    rubricData,
    selectedScores,
    setSelectedScores,
    selectedLevels,
    setSelectedLevels,
    selectedStage,
    setSelectedStage,
    selectedCompetency,
    setSelectedCompetency,
    reloadData,
  } = useApp();

  const { allowedDisciplines } = useSupabaseAuth();

  const visibleDisciplines = allowedDisciplines
    ? disciplines.filter((discipline) => allowedDisciplines.includes(discipline))
    : disciplines;

  const stages = [...new Set(rubricData.map((r) => r.interview_stage))].filter(Boolean);
  const competencies = [...new Set(rubricData.map((r) => r.competency))].filter(Boolean);
  const levels = [...new Set(rubricData.map((r) => r.designer_level))].filter(Boolean);

  const showDisciplineFilter = currentView !== null && currentView !== 'ladders' && visibleDisciplines.length > 1;
  const showRubricFilters = currentView === 'rubric';

  if (!showDisciplineFilter && !showRubricFilters) {
    return null;
  }

  return (
    <>
      <div className="content-filters">
        {showDisciplineFilter && (
          <div className="content-filter-control select-wrapper">
            <select
              aria-label="Discipline"
              value={currentDiscipline}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setShowAddDiscipline(true);
                  e.target.value = currentDiscipline;
                } else {
                  setCurrentDiscipline(e.target.value);
                }
              }}
            >
              {visibleDisciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
              {!allowedDisciplines && (
                <>
                  <option disabled>────────────</option>
                  <option value="__add_new__" className="add-option">
                    Add new discipline
                  </option>
                </>
              )}
            </select>
          </div>
        )}

        {showRubricFilters && (
          <>
            <div className="content-filter-control select-wrapper">
              <select
                aria-label="Interview stage"
                value={selectedStage}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowAddStage(true);
                    e.target.value = selectedStage;
                  } else {
                    setSelectedStage(e.target.value);
                  }
                }}
              >
                <option value="">All stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
                <option disabled>────────────</option>
                <option value="__add_new__" className="add-option">
                  Add new stage
                </option>
              </select>
            </div>

            <div className="content-filter-control select-wrapper">
              <select
                aria-label="Competency"
                value={selectedCompetency}
                onChange={(e) => setSelectedCompetency(e.target.value)}
              >
                <option value="">All competencies</option>
                {competencies.map((competency) => (
                  <option key={competency} value={competency}>
                    {competency}
                  </option>
                ))}
              </select>
            </div>

            <div className="content-filter-control content-filter-multiselect">
              <MultiSelect
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                ]}
                selected={selectedScores.map(String)}
                onChange={(value) => {
                  const num = parseInt(value, 10);
                  setSelectedScores(
                    selectedScores.includes(num)
                      ? selectedScores.filter((score) => score !== num)
                      : [...selectedScores, num].sort()
                  );
                }}
                placeholder="All scores"
                getLabel={(selected) => {
                  if (selected.length === 4) return 'All scores';
                  return selected.sort().join(', ');
                }}
              />
            </div>

            <div className="content-filter-control content-filter-multiselect">
              <MultiSelect
                options={levels.map((level) => ({ value: level, label: level }))}
                selected={selectedLevels}
                onChange={(level) => {
                  if (selectedLevels.includes(level)) {
                    setSelectedLevels(selectedLevels.filter((item) => item !== level));
                  } else {
                    setSelectedLevels([...selectedLevels, level]);
                  }
                }}
                placeholder="Select roles..."
                getLabel={(selected) => {
                  if (selected.length === 0) return 'Select roles...';
                  if (selected.length === levels.length) return 'All roles';
                  if (selected.length === 1) return selected[0];
                  return `${selected.length} roles selected`;
                }}
                addAction={{
                  label: 'Add new role',
                  onClick: () => setShowAddRole(true),
                }}
              />
            </div>
          </>
        )}
      </div>

      <AddDisciplineModal
        isOpen={showAddDiscipline}
        onClose={() => setShowAddDiscipline(false)}
        onSuccess={() => {
          setShowAddDiscipline(false);
          reloadData();
        }}
        existingDisciplines={disciplines}
      />

      <AddStageModal
        isOpen={showAddStage}
        onClose={() => setShowAddStage(false)}
        onSuccess={() => {
          setShowAddStage(false);
          reloadData();
        }}
        discipline={currentDiscipline}
        existingCompetencies={competencies}
      />

      <AddRoleModal
        isOpen={showAddRole}
        onClose={() => setShowAddRole(false)}
        onSuccess={() => {
          setShowAddRole(false);
          reloadData();
        }}
        discipline={currentDiscipline}
        existingRoles={levels}
      />
    </>
  );
}
