import { useState, useEffect } from 'react';
// import { UserProfile } from '../Auth/GoogleAuth';
import { useApp } from '../../context/AppContext';
import { useLadders } from '../../context/LaddersContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { HistoryPanel } from '../shared/HistoryPanel';
import type { ViewType } from '../../types';

function NavIcon({ view }: { view: ViewType | 'admin' }) {
  if (view === 'definitions') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6.75H19.25" />
        <path d="M9 12H19.25" />
        <path d="M9 17.25H14.5" />
        <path d="M4.75 7.25h.01" />
        <path d="M4.75 12h.01" />
        <path d="M4.75 16.75h.01" />
      </svg>
    );
  }

  if (view === 'rubric') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2.5" />
        <path d="M9 5v14" />
        <path d="M15 9.5h2.5" />
        <path d="M15 13h2.5" />
      </svg>
    );
  }

  if (view === 'ladders') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 5v14" />
        <path d="M16 5v14" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19.5a1.8 1.8 0 1 1-3.6 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4.5a1.8 1.8 0 1 1 0-3.6h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4.5a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.2a1.8 1.8 0 1 1 0 3.6h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

export function Sidebar() {
  const [showHistory, setShowHistory] = useState(false);
  const { 
    currentView, 
    setCurrentView,
    disciplines,
    currentDiscipline,
    setCurrentDiscipline,
    competencyDefinitions,
    dataStatus,
    useApi,
    reloadData
  } = useApp();

  const {
    disciplines: laddersDisciplines,
    currentDiscipline: laddersCurrentDiscipline,
    setCurrentDiscipline: setLaddersCurrentDiscipline
  } = useLadders();

  const {
    allowedDisciplines,
    permissions,
    realPermissions,
    impersonatingEmail,
    impersonate,
    stopImpersonating,
    allUsers,
    loadAllUsers,
  } = useSupabaseAuth();

  // Filter disciplines based on user access
  const visibleDisciplines = allowedDisciplines
    ? disciplines.filter(d => allowedDisciplines.includes(d))
    : disciplines;
  const visibleLaddersDisciplines = allowedDisciplines
    ? laddersDisciplines.filter(d => allowedDisciplines.includes(d))
    : laddersDisciplines;

  // Auto-switch discipline if current selection is outside the user's allowed list
  useEffect(() => {
    if (allowedDisciplines) {
      if (currentDiscipline && !allowedDisciplines.includes(currentDiscipline) && visibleDisciplines.length > 0) {
        setCurrentDiscipline(visibleDisciplines[0]);
      }
      if (laddersCurrentDiscipline && !allowedDisciplines.includes(laddersCurrentDiscipline) && visibleLaddersDisciplines.length > 0) {
        setLaddersCurrentDiscipline(visibleLaddersDisciplines[0]);
      }
    }
  }, [allowedDisciplines, currentDiscipline, laddersCurrentDiscipline, visibleDisciplines, visibleLaddersDisciplines, setCurrentDiscipline, setLaddersCurrentDiscipline]);

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
        return `Rubric data loaded ${source}`;
      default:
        return `Data loaded ${source}`;
    }
  };

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
  };

  const isInView = currentView !== null;
  const isLaddersView = currentView === 'ladders';
  const showNavSections = permissions.canEdit;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {(permissions.visibleViews.includes('competencies') || permissions.visibleViews.includes('rubrics')) && (
          <>
            {showNavSections && (
              <div className="nav-section-header">
                <div className="nav-section-title">Hiring</div>
                <div className="nav-divider" />
              </div>
            )}
            <div className={`nav-menu${showNavSections ? '' : ' nav-menu-group'}`}>
              {permissions.visibleViews.includes('competencies') && (
                <div
                  className={`nav-item${currentView === 'definitions' ? ' active' : ''}`}
                  onClick={() => handleNavClick('definitions')}
                >
                  <span className="nav-item-icon"><NavIcon view="definitions" /></span>
                  <span className="nav-item-text">Competencies</span>
                </div>
              )}
              {permissions.visibleViews.includes('rubrics') && (
                <div
                  className={`nav-item${currentView === 'rubric' ? ' active' : ''}`}
                  onClick={() => handleNavClick('rubric')}
                >
                  <span className="nav-item-icon"><NavIcon view="rubric" /></span>
                  <span className="nav-item-text">Rubrics</span>
                </div>
              )}
            </div>
          </>
        )}

        {permissions.visibleViews.includes('ladders') && (
          <>
            {showNavSections && (
              <div className="nav-section-header" style={{ marginTop: '8px' }}>
                <div className="nav-section-title">Ladders</div>
                <div className="nav-divider" />
              </div>
            )}
            <div className={`nav-menu${showNavSections ? '' : ' nav-menu-group'}`}>
              <div
                className={`nav-item${currentView === 'ladders' ? ' active' : ''}`}
                onClick={() => handleNavClick('ladders')}
              >
                <span className="nav-item-icon"><NavIcon view="ladders" /></span>
                <span className="nav-item-text">Ladders</span>
              </div>
            </div>
          </>
        )}

        {permissions.role === 'admin' && (
          <>
            {showNavSections && (
              <div className="nav-section-header" style={{ marginTop: '12px' }}>
                <div className="nav-section-title">Settings</div>
                <div className="nav-divider" />
              </div>
            )}
            <div className={`nav-menu${showNavSections ? '' : ' nav-menu-group'}`}>
              <div
                className={`nav-item${currentView === 'admin' ? ' active' : ''}`}
                onClick={() => handleNavClick('admin')}
              >
                <span className="nav-item-icon"><NavIcon view="admin" /></span>
                <span className="nav-item-text">Permissions</span>
              </div>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-bottom-sections">
        {/* Data status - shown when in a view, editors/admins only */}
        {isInView && !isLaddersView && permissions.canEdit && (
          <div className="section sidebar-data-section">
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

        {/* Admin: View as another user */}
        {realPermissions.role === 'admin' && (
          <div className="section admin-viewas-section">
            <div className="section-title">View as</div>
            <div className="filter-group">
              <div className="select-wrapper">
                <select
                  value={impersonatingEmail ?? ''}
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (!val) { stopImpersonating(); return; }
                    await impersonate(val);
                  }}
                  onFocus={() => { if (allUsers.length === 0) loadAllUsers(); }}
                >
                  <option value="">Myself (admin)</option>
                  {allUsers
                    .filter(u => u.email !== realPermissions.email)
                    .map(u => (
                      <option key={u.email} value={u.email}>
                        {u.email.split('@')[0]} ({u.role})
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        onRevert={reloadData}
      />
    </aside>
  );
}

