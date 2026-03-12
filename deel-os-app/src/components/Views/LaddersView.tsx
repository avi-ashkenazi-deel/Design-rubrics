import { useState, useRef, useEffect, useCallback } from 'react';
import { useLadders } from '../../context/LaddersContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { getLaddersTextDiff, formatCellText } from '../../utils/textDiff';
import { EditCellModal } from '../shared/EditCellModal';
import { ExamplesModal } from '../shared/ExamplesModal';
import { MultiSelect } from '../shared/MultiSelect';
import { getExampleKey, getDefaultExamples, type TrafficLightExamples } from '../../data/ladderExampleTemplates';
import type { LadderData, ProficiencyLevel } from '../../types';

function useCardGlow() {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    el.style.setProperty('--glow-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--glow-opacity', '0');
  }, []);

  return { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

interface EditingCell {
  focusArea: string;
  competency: string;
  role: string;
  value: string;
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'TBD',
  1: 'Foundational',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert'
};

const ROLE_SUMMARIES: Record<string, string> = {
  // IC roles
  'Product Designer': 'Executes well-scoped work with guidance. Impact is on their own deliverables.',
  'Senior Designer': 'Operates independently, owns end-to-end projects, and elevates their team\'s quality.',
  'Staff Designer': 'Leads a vertical\'s design direction and systems. Guides teams without formal authority.',
  'Senior Staff Designer': 'Works cross-vertically, drives impact through others, and aligns teams at scale.',
  'Principal Designer': 'Sells and executes a company-wide design vision. Runs small teams, gains resources, and shapes culture.',
  // Manager roles
  'Lead Product Designer': 'Responsible for one vertical and 5–7 people. Balances hands-on craft with people leadership.',
  'Group Design Manager': 'Responsible for two verticals. Leads report to them. Scales design impact and builds capability.',
  'Director': 'Responsible for 2–3 verticals depending on size, managing leads and senior ICs. Drives cross-functional alignment.',
  'Senior Director': 'Manages multiple Group Design Managers, leads, and senior ICs. Sets strategic direction across a wide area.',
  'VP Design': 'Executive role. Manages across a wider range of designers (QA, front-end, marketing). Influences beyond verticals and beyond the R&D org.',
};

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(0, 0, 0, 0.03)',
  1: 'rgba(37, 99, 235, 0.1)',
  2: 'rgba(22, 163, 74, 0.1)',
  3: 'rgba(124, 58, 237, 0.1)',
  4: 'rgba(219, 39, 119, 0.1)'
};

const LEVEL_TEXT_COLORS: Record<number, string> = {
  0: '#9CA3AF',
  1: '#2563EB',
  2: '#16A34A',
  3: '#7C3AED',
  4: '#DB2777'
};

export function LaddersView() {
  const glow = useCardGlow();
  const { permissions } = useSupabaseAuth();
  const canEdit = permissions.canEdit;
  const { 
    disciplines,
    currentDiscipline,
    setCurrentDiscipline,
    config,
    selectedFile,
    setSelectedFile,
    laddersData, 
    selectedRoles: unsortedSelectedRoles, 
    selectedFocusArea,
    setSelectedFocusArea,
    isLoading,
    updateLadderCell,
    updateRoleMapping,
    proficiencyData,
    levelNames,
    roleMappings,
    mappedRoles,
    availableRoles,
    hasProficiencyData,
    focusAreas,
    toggleRole
  } = useLadders();

  const visibleDisciplines = permissions.allowedDisciplines
    ? disciplines.filter((discipline) => permissions.allowedDisciplines?.includes(discipline))
    : disciplines;
  const visibleTrackFiles = config?.files?.filter((file) => {
    const lower = file.name.toLowerCase();
    return permissions.visibleTracks.some((track) => lower.includes(track.toLowerCase()));
  }) ?? [];
  const filterRoleOptions = hasProficiencyData ? mappedRoles : availableRoles;
  const roleOrder = hasProficiencyData ? mappedRoles : availableRoles;
  const selectedRoles = [...unsortedSelectedRoles].sort(
    (a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b)
  );

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [roleSummaryOverrides, setRoleSummaryOverrides] = useState<Record<string, string>>({});
  const [editingRoleSummary, setEditingRoleSummary] = useState<{ role: string; value: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{ role: string; competency: string } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [allExamples, setAllExamples] = useState<Record<string, TrafficLightExamples>>({});
  const [examplesModal, setExamplesModal] = useState<{ focusArea: string; role: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    if (visibleTrackFiles.length === 1 && selectedFile !== visibleTrackFiles[0].file) {
      setSelectedFile(visibleTrackFiles[0].file);
    }
  }, [visibleTrackFiles, selectedFile, setSelectedFile]);

  const getRoleSummary = (role: string): string => {
    return roleSummaryOverrides[role] ?? ROLE_SUMMARIES[role] ?? '';
  };

  const handleSaveRoleSummary = async (newValue: string) => {
    if (!editingRoleSummary) return;
    setRoleSummaryOverrides(prev => ({ ...prev, [editingRoleSummary.role]: newValue }));
  };

  const getExamplesForCell = (focusArea: string, role: string): TrafficLightExamples => {
    const key = getExampleKey(focusArea, role);
    return allExamples[key] || getDefaultExamples(focusArea, role);
  };

  const handleOpenExamples = (focusArea: string, role: string) => {
    setExamplesModal({ focusArea, role });
  };

  const handleSaveExamples = (examples: TrafficLightExamples) => {
    if (!examplesModal) return;
    const key = getExampleKey(examplesModal.focusArea, examplesModal.role);
    setAllExamples(prev => ({ ...prev, [key]: examples }));
  };

  const hasExamples = (focusArea: string, role: string): boolean => {
    const key = getExampleKey(focusArea, role);
    return key in allExamples;
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <h3>Loading...</h3>
      </div>
    );
  }

  const dataAvailable = hasProficiencyData ? proficiencyData.length > 0 : laddersData.length > 0;

  const renderFilters = () => (
    <div className="ladders-filter-bar">
      {visibleDisciplines.length > 1 && (
        <div className="ladders-filter-control select-wrapper">
          <select value={currentDiscipline} onChange={(e) => setCurrentDiscipline(e.target.value)}>
            {visibleDisciplines.map((discipline) => (
              <option key={discipline} value={discipline}>{discipline}</option>
            ))}
          </select>
        </div>
      )}

      {visibleTrackFiles.length > 1 && (
        <div className="ladders-filter-control select-wrapper">
          <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
            <option value="">Track</option>
            {visibleTrackFiles.map((file) => (
              <option key={file.file} value={file.file}>{file.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="ladders-filter-control select-wrapper">
        <select value={selectedFocusArea} onChange={(e) => setSelectedFocusArea(e.target.value)}>
          <option value="">All focus areas</option>
          {focusAreas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div className="ladders-filter-control ladders-filter-multiselect">
        <MultiSelect
          options={filterRoleOptions.map((role) => ({ value: role, label: role }))}
          selected={selectedRoles}
          onChange={toggleRole}
          placeholder="Select roles..."
          getLabel={(selected) => {
            if (selected.length === 0) return 'Select roles...';
            if (selected.length === filterRoleOptions.length) return 'All roles';
            if (selected.length === 1) return selected[0];
            return `${selected.length} roles selected`;
          }}
        />
      </div>
    </div>
  );

  if (!dataAvailable) {
    return (
      <>
        {renderFilters()}
        <div className="empty-state">
          <h3>No ladder data loaded</h3>
          <p>Choose a discipline and ladder track in the filters above to view career progression.</p>
        </div>
      </>
    );
  }

  if (selectedRoles.length === 0) {
    return (
      <>
        {renderFilters()}
        <div className="empty-state">
          <h3>Select roles to compare</h3>
          <p>Use the roles filter above to choose which roles you want to compare.</p>
        </div>
      </>
    );
  }

  // Helper: get the proficiency level number for a role + competency
  // The mapping CSV uses the focus area name (e.g. "Problem Solving") as column headers,
  // while proficiency data items have both focusArea and competency (sub-label).
  // We try focusArea first, then competency as fallback.
  const getRoleLevel = (role: string, competency: string, focusArea?: string): number => {
    const mapping = roleMappings.find(m => m.role === role);
    if (!mapping) return 1;
    if (focusArea && mapping.competencyLevels[focusArea] !== undefined) {
      return mapping.competencyLevels[focusArea];
    }
    return mapping.competencyLevels[competency] ?? 1;
  };

  // Helper: get level name from number (e.g. 3 -> "3-Advanced")
  const getLevelNameFromNumber = (num: number): string => {
    return levelNames.find(ln => ln.startsWith(`${num}-`)) || levelNames[num - 1] || '';
  };

  // Helper: get proficiency content for a competency at a given level
  const getProficiencyContent = (competency: string, levelNum: number): string => {
    if (levelNum === 0) return 'To be defined individually for this executive role.';
    const levelName = getLevelNameFromNumber(levelNum);
    const item = proficiencyData.find(d => d.competency === competency);
    if (!item) return '-';
    return item.levels[levelName] || '-';
  };

  // PROFICIENCY MODE
  if (hasProficiencyData) {
    const filteredData = selectedFocusArea
      ? proficiencyData.filter(d => d.focusArea === selectedFocusArea)
      : proficiencyData;

    const groupedByFocusArea = filteredData.reduce((acc, item) => {
      if (!acc[item.focusArea]) {
        acc[item.focusArea] = [];
      }
      acc[item.focusArea].push(item);
      return acc;
    }, {} as Record<string, ProficiencyLevel[]>);

    const handleProficiencyCellClick = (item: ProficiencyLevel, role: string) => {
      const levelNum = getRoleLevel(role, item.competency, item.focusArea);
      const content = getProficiencyContent(item.competency, levelNum);
      setEditingCell({
        focusArea: item.focusArea,
        competency: item.competency,
        role: getLevelNameFromNumber(levelNum),
        value: content
      });
    };

    const handleSave = async (newValue: string) => {
      if (!editingCell) return;
      updateLadderCell(editingCell.focusArea, editingCell.competency, editingCell.role, newValue);
    };

    const renderProficiencyRow = (item: ProficiencyLevel) => {
      // For each selected role, get their level and the content at that level
      const roleContents = selectedRoles.map(role => {
        const levelNum = getRoleLevel(role, item.competency, item.focusArea);
        const content = getProficiencyContent(item.competency, levelNum);
        return { role, levelNum, content };
      });

      // Get raw values for diff highlighting
      const rawValues = roleContents.map(rc => rc.content);
      const highlightedValues = selectedRoles.length > 1
        ? getLaddersTextDiff(rawValues)
        : rawValues.map(v => v === '-' ? '<span class="empty-value">—</span>' : v);

      return (
        <div key={`${item.focusArea}_${item.competency}`} className="ladders-competency-row">
          <div className="ladders-compare-table-wrapper">
            <div className="ladders-compare-table">
              <div className="ladders-compare-table-header">
                {roleContents.map(({ role, levelNum }) => (
                  <div key={role} className="ladders-compare-table-cell ladders-role-header-cell">
                    <span className="ladders-role-name">{role}</span>
                    <span 
                      className="proficiency-badge"
                      style={{ 
                        backgroundColor: LEVEL_COLORS[levelNum],
                        color: LEVEL_TEXT_COLORS[levelNum]
                      }}
                    >
                      {LEVEL_LABELS[levelNum]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="ladders-compare-table-row">
                {highlightedValues.map((value, idx) => (
                  <div 
                    key={idx} 
                    className="ladders-compare-table-cell ladders-cell-editable"
                  >
                    <div 
                      className="ladders-cell-text glow-card"
                      {...glow}
                      style={{ '--level-color': LEVEL_TEXT_COLORS[roleContents[idx].levelNum] + '40' } as React.CSSProperties}
                    >
                      <div dangerouslySetInnerHTML={{ __html: formatCellText(value) }} />
                      <div
                        className={`ladders-cell-examples-link ${hasExamples(item.focusArea, selectedRoles[idx]) ? 'has-examples' : ''}`}
                        onClick={() => handleOpenExamples(item.focusArea, selectedRoles[idx])}
                      >
                        Examples →
                      </div>
                    </div>
                    {canEdit && (
                      <div 
                        className="ladders-cell-edit-icon"
                        onClick={() => handleProficiencyCellClick(item, selectedRoles[idx])}
                        title="Click to edit"
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const handleLevelChange = (role: string, competency: string, newLevel: number) => {
      updateRoleMapping(role, competency, newLevel);
      setOpenDropdown(null);
    };

    const COMPETENCY_GROUPS: { label: string; competencies: string[] }[] = (() => {
      const allComps = [...new Set(proficiencyData.map(d => d.focusArea))].filter(Boolean);
      const deelCore = ['Problem Solving', 'Adaptability', 'Customer Focus', 'Ownership'];
      const deelIC = ['Craft Excellence', 'Communication', 'Collaboration'];
      const deelMgr = ['Drives High Performance', 'Develops Talent', 'Execution & Impact'];

      const groups: { label: string; competencies: string[] }[] = [];
      const coreFiltered = deelCore.filter(c => allComps.includes(c));
      const icFiltered = deelIC.filter(c => allComps.includes(c));
      const mgrFiltered = deelMgr.filter(c => allComps.includes(c));
      const rest = allComps.filter(c => !deelCore.includes(c) && !deelIC.includes(c) && !deelMgr.includes(c));

      if (coreFiltered.length > 0) groups.push({ label: 'Deel Competencies', competencies: coreFiltered });
      if (icFiltered.length > 0) groups.push({ label: 'Deel IC Competencies', competencies: icFiltered });
      if (mgrFiltered.length > 0) groups.push({ label: 'Deel Manager Competencies', competencies: mgrFiltered });
      if (rest.length > 0) groups.push({ label: 'Other', competencies: rest });
      return groups;
    })();

    const renderMappingRow = (comp: string) => {
      return (
        <tr key={comp}>
          <td className="mapping-competency-name">{comp}</td>
          {selectedRoles.map(role => {
            const levelNum = getRoleLevel(role, '', comp);
            const label = LEVEL_LABELS[levelNum] || '';
            const isOpen = openDropdown?.role === role && openDropdown?.competency === comp;
            return (
              <td key={role} className="mapping-level-cell-wrapper">
                <div
                  className={`mapping-level-cell${canEdit ? '' : ' readonly'}`}
                  style={{
                    backgroundColor: LEVEL_COLORS[levelNum],
                    color: LEVEL_TEXT_COLORS[levelNum],
                    cursor: canEdit ? 'pointer' : 'default'
                  }}
                  onClick={canEdit ? () => setOpenDropdown(isOpen ? null : { role, competency: comp }) : undefined}
                >
                  {label}
                  {canEdit && (
                    <svg className="mapping-dropdown-arrow" viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                      <path d="M3 5l3 3 3-3z" />
                    </svg>
                  )}
                </div>
                {canEdit && isOpen && (
                  <div className="mapping-dropdown" ref={dropdownRef}>
                    {[0, 1, 2, 3, 4].map(lvl => (
                      <div
                        key={lvl}
                        className={`mapping-dropdown-option ${lvl === levelNum ? 'active' : ''}`}
                        style={{ color: LEVEL_TEXT_COLORS[lvl] }}
                        onClick={() => handleLevelChange(role, comp, lvl)}
                      >
                        <span className="mapping-dropdown-dot" style={{ backgroundColor: LEVEL_TEXT_COLORS[lvl] }} />
                        {LEVEL_LABELS[lvl]}
                      </div>
                    ))}
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    };

    const renderOverviewPanel = () => {
      if (selectedRoles.length === 0) return null;
      const showGrid = roleMappings.length > 0;
      const colSpan = selectedRoles.length + 1;

      return (
        <div className="ladders-overview-panel">
          <table className="overview-table">
            <thead>
              <tr>
                <th className="overview-label-cell">Key Differentiator</th>
                {selectedRoles.map(role => {
                  const summary = getRoleSummary(role);
                  return (
                    <th key={role} className="overview-role-cell">
                      <div className="ladders-role-summary-card ladders-cell-editable glow-card" {...glow}>
                        <div className="ladders-role-summary-name">{role}</div>
                        {summary && (
                          <div className="ladders-role-summary-text">{summary}</div>
                        )}
                        {canEdit && <div 
                          className="ladders-cell-edit-icon"
                          onClick={() => setEditingRoleSummary({ role, value: summary })}
                          title="Click to edit"
                        >
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </div>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            {showGrid && (
              <tbody>
                {COMPETENCY_GROUPS.map(group => {
                  const isCollapsed = collapsedSections[group.label] ?? false;
                  return [
                    <tr key={`header-${group.label}`}>
                      <td 
                        colSpan={colSpan} 
                        className="mapping-section-header"
                        onClick={() => toggleSection(group.label)}
                      >
                        {group.label}
                        <svg className={`mapping-chevron ${isCollapsed ? 'collapsed' : ''}`} viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                          <path d="M3 4.5l3 3 3-3z" />
                        </svg>
                      </td>
                    </tr>,
                    ...(!isCollapsed ? group.competencies.map(comp => renderMappingRow(comp)) : [])
                  ];
                })}
              </tbody>
            )}
          </table>
        </div>
      );
    };

    return (
      <>
        {renderFilters()}
        {renderOverviewPanel()}
        <div className="ladders-comparison-grid">
          {Object.entries(groupedByFocusArea).map(([focusArea, items]) => {
            const key = `ladder-${focusArea}`;
            const isCollapsed = collapsedSections[key] ?? false;
            return (
              <div key={focusArea} className="ladders-focus-area-group">
                <div className="ladders-focus-area-header" onClick={() => toggleSection(key)}>
                  {focusArea}
                  <svg className={`mapping-chevron ${isCollapsed ? 'collapsed' : ''}`} viewBox="0 0 12 12" width="14" height="14" fill="currentColor">
                    <path d="M3 4.5l3 3 3-3z" />
                  </svg>
                </div>
                {!isCollapsed && items.map(item => renderProficiencyRow(item))}
              </div>
            );
          })}
        </div>

        <EditCellModal
          isOpen={editingCell !== null}
          onClose={() => setEditingCell(null)}
          onSave={handleSave}
          initialValue={editingCell?.value || ''}
          title={`Edit: ${editingCell?.competency || ''}`}
          subtitle={editingCell?.role || ''}
        />

        <EditCellModal
          isOpen={editingRoleSummary !== null}
          onClose={() => setEditingRoleSummary(null)}
          onSave={handleSaveRoleSummary}
          initialValue={editingRoleSummary?.value || ''}
          title={`Edit Role Summary`}
          subtitle={editingRoleSummary?.role || ''}
        />

        <ExamplesModal
          isOpen={examplesModal !== null}
          onClose={() => setExamplesModal(null)}
          onSave={handleSaveExamples}
          initialExamples={examplesModal ? getExamplesForCell(examplesModal.focusArea, examplesModal.role) : { expectations: [], red: [''], yellow: [''], green: [''] }}
          focusArea={examplesModal?.focusArea || ''}
          role={examplesModal?.role || ''}
          readOnly={!canEdit}
        />
      </>
    );
  }

  // LEGACY MODE (role-based)
  const filteredData = selectedFocusArea
    ? laddersData.filter(d => d.focusArea === selectedFocusArea)
    : laddersData;

  const groupedByFocusArea = filteredData.reduce((acc, item) => {
    if (!acc[item.focusArea]) {
      acc[item.focusArea] = [];
    }
    acc[item.focusArea].push(item);
    return acc;
  }, {} as Record<string, LadderData[]>);

  const handleCellClick = (item: LadderData, role: string) => {
    const value = item.roles[role] || '';
    setEditingCell({
      focusArea: item.focusArea,
      competency: item.competency,
      role,
      value
    });
  };

  const handleSave = async (newValue: string) => {
    if (!editingCell) return;
    updateLadderCell(editingCell.focusArea, editingCell.competency, editingCell.role, newValue);
  };

  const renderCompetencyRow = (item: LadderData) => {
    const roleValues = selectedRoles.map(role => item.roles[role] || '-');
    const highlightedValues = selectedRoles.length > 1 
      ? getLaddersTextDiff(roleValues) 
      : roleValues.map(v => v === '-' ? '<span class="empty-value">—</span>' : v);

    return (
      <div key={`${item.focusArea}_${item.competency}`} className="ladders-competency-row">
        <div className="ladders-competency-header">
          <div className="ladders-competency-name">{item.competency}</div>
        </div>
        <div className="ladders-compare-table-wrapper">
          <div className="ladders-compare-table">
            <div className="ladders-compare-table-header">
              {selectedRoles.map(role => (
                <div key={role} className="ladders-compare-table-cell ladders-role-header-cell">
                  {role}
                </div>
              ))}
            </div>
            <div className="ladders-compare-table-row">
              {highlightedValues.map((value, idx) => (
                <div 
                  key={idx} 
                  className="ladders-compare-table-cell ladders-cell-editable"
                >
                  <div 
                    className="ladders-cell-text glow-card"
                    {...glow}
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatCellText(value) }} />
                    <div
                      className={`ladders-cell-examples-link ${hasExamples(item.focusArea, selectedRoles[idx]) ? 'has-examples' : ''}`}
                      onClick={() => handleOpenExamples(item.focusArea, selectedRoles[idx])}
                    >
                      Examples →
                    </div>
                  </div>
                  {canEdit && (
                    <div 
                      className="ladders-cell-edit-icon"
                      onClick={() => handleCellClick(item, selectedRoles[idx])}
                      title="Click to edit"
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderFilters()}
      <div className="ladders-comparison-grid">
        {Object.entries(groupedByFocusArea).map(([focusArea, items]) => (
          <div key={focusArea} className="ladders-focus-area-group">
            <div className="ladders-focus-area-header">{focusArea}</div>
            {items.map(item => renderCompetencyRow(item))}
          </div>
        ))}
      </div>

      <EditCellModal
        isOpen={editingCell !== null}
        onClose={() => setEditingCell(null)}
        onSave={handleSave}
        initialValue={editingCell?.value || ''}
        title={`Edit: ${editingCell?.competency || ''}`}
        subtitle={editingCell?.role || ''}
      />

      <ExamplesModal
        isOpen={examplesModal !== null}
        onClose={() => setExamplesModal(null)}
        onSave={handleSaveExamples}
        initialExamples={examplesModal ? getExamplesForCell(examplesModal.focusArea, examplesModal.role) : { expectations: [], red: [''], yellow: [''], green: [''] }}
        focusArea={examplesModal?.focusArea || ''}
        role={examplesModal?.role || ''}
        readOnly={!canEdit}
      />
    </>
  );
}
