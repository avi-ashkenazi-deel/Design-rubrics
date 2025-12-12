import { useLadders } from '../../context/LaddersContext';
import { getLaddersTextDiff, formatCellText } from '../../utils/textDiff';
import type { LadderData } from '../../types';

export function LaddersView() {
  const { 
    laddersData, 
    selectedRoles, 
    selectedFocusArea,
    isLoading 
  } = useLadders();

  if (isLoading) {
    return (
      <div className="empty-state">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (laddersData.length === 0) {
    return (
      <div className="empty-state">
        <h3>No ladder data loaded</h3>
        <p>Select a discipline and ladder track to view career progression.</p>
      </div>
    );
  }

  if (selectedRoles.length === 0) {
    return (
      <div className="empty-state">
        <h3>Select roles to compare</h3>
        <p>Check the roles you want to compare in the sidebar.</p>
      </div>
    );
  }

  // Filter by focus area
  const filteredData = selectedFocusArea
    ? laddersData.filter(d => d.focusArea === selectedFocusArea)
    : laddersData;

  // Group by focus area
  const groupedByFocusArea = filteredData.reduce((acc, item) => {
    if (!acc[item.focusArea]) {
      acc[item.focusArea] = [];
    }
    acc[item.focusArea].push(item);
    return acc;
  }, {} as Record<string, LadderData[]>);

  // Render a competency row
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
                <div key={idx} className="ladders-compare-table-cell">
                  <div 
                    className="ladders-cell-text"
                    dangerouslySetInnerHTML={{ __html: formatCellText(value) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ladders-comparison-grid">
      {Object.entries(groupedByFocusArea).map(([focusArea, items]) => (
        <div key={focusArea} className="ladders-focus-area-group">
          <div className="ladders-focus-area-header">{focusArea}</div>
          {items.map(item => renderCompetencyRow(item))}
        </div>
      ))}
    </div>
  );
}

