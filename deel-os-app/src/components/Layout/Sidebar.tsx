import { useState } from 'react';
// import { UserProfile } from '../Auth/GoogleAuth';
import { useApp } from '../../context/AppContext';
import { useLadders } from '../../context/LaddersContext';
import { MultiSelect } from '../shared/MultiSelect';
import { HistoryPanel } from '../shared/HistoryPanel';
import { AddDisciplineModal } from '../shared/AddDisciplineModal';
import { AddStageModal } from '../shared/AddStageModal';
import { AddRoleModal } from '../shared/AddRoleModal';
import type { ViewType } from '../../types';

export function Sidebar() {
  const [showHistory, setShowHistory] = useState(false);
  const [showAddDiscipline, setShowAddDiscipline] = useState(false);
  const [showAddStage, setShowAddStage] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const { 
    currentView, 
    setCurrentView,
    disciplines,
    currentDiscipline,
    setCurrentDiscipline,
    rubricData,
    competencyDefinitions,
    selectedScores,
    setSelectedScores,
    selectedLevels,
    setSelectedLevels,
    selectedStage,
    setSelectedStage,
    selectedCompetency,
    setSelectedCompetency,
    dataStatus,
    useApi,
    reloadData
  } = useApp();

  const {
    disciplines: laddersDisciplines,
    currentDiscipline: laddersCurrentDiscipline,
    setCurrentDiscipline: setLaddersCurrentDiscipline,
    config: laddersConfig,
    selectedFile: laddersSelectedFile,
    setSelectedFile: setLaddersSelectedFile,
    availableRoles,
    selectedRoles,
    toggleRole,
    focusAreas,
    selectedFocusArea,
    setSelectedFocusArea
  } = useLadders();

  // Get unique values from rubric data
  const stages = [...new Set(rubricData.map(r => r.interview_stage))].filter(Boolean);
  const competencies = [...new Set(rubricData.map(r => r.competency))].filter(Boolean);
  const levels = [...new Set(rubricData.map(r => r.designer_level))].filter(Boolean);

  // Get unique competency definitions count (filter duplicates like in CompetenciesView)
  const uniqueCompetencyCount = (() => {
    const seenDescriptions = new Set<string>();
    let count = 0;
    Object.values(competencyDefinitions).forEach(data => {
      if (data.description && !seenDescriptions.has(data.description)) {
        seenDescriptions.add(data.description);
        count++;
      }
    });
    return count;
  })();

  // Get contextual status message based on current view
  const getStatusMessage = () => {
    const source = useApi ? 'from database' : 'from CSV';
    switch (currentView) {
      case 'definitions':
        return `${uniqueCompetencyCount} competencies loaded ${source}`;
      case 'rubric':
        return `${rubricData.length} entries loaded ${source}`;
      default:
        return `Data loaded ${source}`;
    }
  };

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView(null);
  };

  const isInView = currentView !== null;
  const isLaddersView = currentView === 'ladders';

  return (
    <aside className="sidebar">
      <div className="logo">
        <span>Deel OS</span>
      </div>

      {/* <UserProfile /> */}

      <nav className="sidebar-nav">
        {/* Main Menu - shown when not in a view */}
        {!isInView && (
          <>
            <div className="nav-section-header">
              <div className="nav-section-title">Hiring</div>
              <div className="nav-divider" />
            </div>
            <div className="nav-menu">
              <div className="nav-item" onClick={() => handleNavClick('definitions')}>
                <span className="nav-item-text">Competencies</span>
                <span className="nav-chevron">›</span>
              </div>
              <div className="nav-item" onClick={() => handleNavClick('rubric')}>
                <span className="nav-item-text">Rubrics</span>
                <span className="nav-chevron">›</span>
              </div>
            </div>

            <div className="nav-section-header" style={{ marginTop: '24px' }}>
              <div className="nav-section-title">Ladders</div>
              <div className="nav-divider" />
            </div>
            <div className="nav-menu">
              <div className="nav-item" onClick={() => handleNavClick('ladders')}>
                <span className="nav-item-text">Ladders</span>
                <span className="nav-chevron">›</span>
              </div>
            </div>
          </>
        )}

        {/* Back button and view controls */}
        {isInView && (
          <div className="nav-view-controls">
            <button className="nav-back-btn" onClick={handleBack}>
              <span className="nav-back-arrow">‹</span>
              <span>Back</span>
            </button>
          </div>
        )}
      </nav>

      {/* Discipline selector - for non-ladders views */}
      {isInView && !isLaddersView && (
        <div className="section">
          <div className="section-title">Discipline</div>
          <div className="filter-group">
            <div className="select-wrapper">
                <select 
                  value={currentDiscipline} 
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddDiscipline(true);
                      e.target.value = currentDiscipline; // Reset selection
                    } else {
                      setCurrentDiscipline(e.target.value);
                    }
                  }}
                >
                  {disciplines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option disabled>────────────</option>
                  <option value="__add_new__" className="add-option">Add new discipline</option>
                </select>
            </div>
          </div>
        </div>
      )}

      {/* Ladders-specific controls */}
      {isLaddersView && (
        <>
          <div className="section">
            <div className="section-title">Discipline</div>
            <div className="filter-group">
              <div className="select-wrapper">
                <select 
                  value={laddersCurrentDiscipline} 
                  onChange={(e) => setLaddersCurrentDiscipline(e.target.value)}
                >
                  {laddersDisciplines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Ladder Track</div>
            <div className="filter-group">
              <div className="select-wrapper">
                <select 
                  value={laddersSelectedFile} 
                  onChange={(e) => setLaddersSelectedFile(e.target.value)}
                >
                  <option value="">Select a track...</option>
                  {laddersConfig?.files?.map(f => (
                    <option key={f.file} value={f.file}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="filter-group">
              <label>Focus Area</label>
              <div className="select-wrapper">
                <select 
                  value={selectedFocusArea} 
                  onChange={(e) => setSelectedFocusArea(e.target.value)}
                >
                  <option value="">All focus areas</option>
                  {focusAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="filter-group">
              <label>Compare Roles</label>
              <MultiSelect
                options={availableRoles.map(r => ({ value: r, label: r }))}
                selected={selectedRoles}
                onChange={toggleRole}
                placeholder="Select roles..."
                getLabel={(selected) => {
                  if (selected.length === 0) return 'Select roles...';
                  if (selected.length === availableRoles.length) return 'All roles';
                  if (selected.length === 1) return selected[0];
                  return `${selected.length} roles selected`;
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Rubric-specific filters */}
      {currentView === 'rubric' && (
        <>
          <div className="section">
            <div className="filter-group">
              <label>Interview Stage</label>
              <div className="select-wrapper">
                <select 
                  value={selectedStage} 
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddStage(true);
                      e.target.value = selectedStage; // Reset selection
                    } else {
                      setSelectedStage(e.target.value);
                    }
                  }}
                >
                  <option value="">All stages</option>
                  {stages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option disabled>────────────</option>
                  <option value="__add_new__" className="add-option">Add new stage</option>
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label>Competency</label>
              <div className="select-wrapper">
                <select 
                  value={selectedCompetency} 
                  onChange={(e) => setSelectedCompetency(e.target.value)}
                >
                  <option value="">All competencies</option>
                  {competencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label>Score Level</label>
              <MultiSelect
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' }
                ]}
                selected={selectedScores.map(String)}
                onChange={(val) => {
                  const num = parseInt(val);
                  setSelectedScores(
                    selectedScores.includes(num)
                      ? selectedScores.filter(s => s !== num)
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
          </div>

          <div className="section">
            <div className="section-title">Roles</div>
            <div className="filter-group">
              <MultiSelect
                options={levels.map(l => ({ value: l, label: l }))}
                selected={selectedLevels}
                onChange={(level) => {
                  if (selectedLevels.includes(level)) {
                    setSelectedLevels(selectedLevels.filter(l => l !== level));
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
                  onClick: () => setShowAddRole(true)
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Data status - shown when in a view */}
      {isInView && !isLaddersView && (
        <div className="section" style={{ marginTop: 'auto' }}>
          <div className="section-title">Data</div>
          <div className="data-status-sidebar">
            <span className={`status-badge ${dataStatus}`}>
              <span className="status-dot" />
              {dataStatus === 'loading' ? 'Loading...' : dataStatus === 'loaded' ? 'Loaded' : 'Error'}
            </span>
            <span className="data-info">{getStatusMessage()}</span>
          </div>
          <button className="btn" onClick={reloadData}>
            Reload Data
          </button>
          
          {/* History Button */}
          <button className="history-btn" onClick={() => setShowHistory(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Version History</span>
          </button>
        </div>
      )}

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        onRevert={reloadData}
      />
      
      {/* Add Discipline Modal */}
      <AddDisciplineModal
        isOpen={showAddDiscipline}
        onClose={() => setShowAddDiscipline(false)}
        onSuccess={() => {
          setShowAddDiscipline(false);
          reloadData();
        }}
        existingDisciplines={disciplines}
      />
      
      {/* Add Stage Modal */}
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
      
      {/* Add Role Modal */}
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
    </aside>
  );
}

