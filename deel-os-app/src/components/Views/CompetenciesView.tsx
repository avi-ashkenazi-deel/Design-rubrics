import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EditCompetencyModal } from '../shared/EditCompetencyModal';
import { subCompetencyDescriptions } from '../../data/subCompetencyDescriptions';

interface EditingCompetency {
  id?: number;
  name: string;
  focusArea: string;
  description: string;
  isNew: boolean;
}

export function CompetenciesView() {
  const [editingCompetency, setEditingCompetency] = useState<EditingCompetency | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const toggleSubCompetency = (sub: string) => {
    setExpandedSub(prev => prev === sub ? null : sub);
  };
  
  const { 
    competencyDefinitions, 
    currentDiscipline,
    setCurrentView,
    setSelectedCompetency,
    setSelectedStage,
    rubricData,
    useApi,
    reloadData
  } = useApp();

  const openAddModal = () => {
    setEditingCompetency({
      name: '',
      focusArea: '',
      description: '',
      isNew: true
    });
  };

  const definitions = Object.entries(competencyDefinitions);
  
  // Filter out duplicates
  const uniqueDefinitions: [string, { id?: number; focusArea: string; description: string; subCompetencies?: string[] }][] = [];
  const seenDescriptions = new Set<string>();
  
  definitions.forEach(([name, data]) => {
    if (data.description && !seenDescriptions.has(data.description)) {
      seenDescriptions.add(data.description);
      uniqueDefinitions.push([name, data]);
    }
  });

  // Group by focus area for sectioned display
  const groupedByFocusArea: Record<string, typeof uniqueDefinitions> = {};
  uniqueDefinitions.forEach(([name, data]) => {
    const area = data.focusArea || 'Other';
    if (!groupedByFocusArea[area]) {
      groupedByFocusArea[area] = [];
    }
    groupedByFocusArea[area].push([name, data]);
  });

  // Sort sections: Deel Competencies first, then IC, then Manager, then Other
  const getSectionOrder = (area: string): number => {
    const lower = area.toLowerCase();
    if (lower === 'deel competencies') return 0;
    if (lower.includes('deel ic') || lower.includes('craft')) return 1;
    if (lower.includes('manager')) return 2;
    return 3;
  };

  const sortedSections = Object.entries(groupedByFocusArea).sort(
    ([a], [b]) => getSectionOrder(a) - getSectionOrder(b)
  );

  // Short label for focus area headers
  const getFocusAreaLabel = (area: string): string => {
    const lower = area.toLowerCase();
    if (lower === 'deel competencies') return 'Deel Competencies';
    if (lower.includes('deel ic') || lower.includes('craft')) return 'Deel IC Competencies';
    if (lower.includes('manager')) return 'Deel Manager Competencies';
    return area;
  };

  const getFocusAreaDescription = (area: string): string | null => {
    const lower = area.toLowerCase();
    if (lower === 'deel competencies') return 'Company-wide competencies that apply to all individual contributors';
    if (lower.includes('deel ic') || lower.includes('craft')) return 'Craft-specific competencies for design';
    if (lower.includes('manager')) return 'Company-wide competencies that apply to all people managers';
    return null;
  };

  // Check if a competency has rubric data
  const hasRubricData = (competencyName: string) => {
    return rubricData.some(r => 
      r.competency === competencyName || 
      r.competency === competencyName + ':' ||
      r.competency.replace(/:\s*$/, '') === competencyName.replace(/:\s*$/, '')
    );
  };

  // Navigate to rubric view filtered by competency
  const handleCompetencyClick = (competencyName: string) => {
    if (hasRubricData(competencyName)) {
      setSelectedStage(''); // Show all stages
      setSelectedCompetency(competencyName);
      setCurrentView('rubric');
    }
  };

  // Open edit modal
  const handleEditCompetency = (e: React.MouseEvent, name: string, data: { id?: number; focusArea: string; description: string }) => {
    e.stopPropagation(); // Prevent card click
    setEditingCompetency({
      id: data.id,
      name,
      focusArea: data.focusArea,
      description: data.description,
      isNew: false
    });
  };

  // Handle save from modal
  const handleSave = async () => {
    await reloadData();
    setEditingCompetency(null);
  };

  // Add button component
  const AddButton = () => {
    if (!useApi) return null;
    return (
      <div className="competencies-actions">
        <button className="add-competency-btn" onClick={openAddModal}>
          Add new competency
        </button>
      </div>
    );
  };

  if (uniqueDefinitions.length === 0) {
    return (
      <>
        <AddButton />
        <div className="empty-state">
          <h3>No competency definitions found</h3>
          <p>
            {useApi 
              ? 'Click "Add new competency" to create the first competency definition.'
              : `Add a Competencies.csv file in the disciplines/${currentDiscipline} folder with Focus Area, Competency, and Description columns.`
            }
          </p>
        </div>

        {/* Edit/Add Modal */}
        <EditCompetencyModal
          isOpen={editingCompetency !== null}
          onClose={() => setEditingCompetency(null)}
          onSave={handleSave}
          competency={editingCompetency}
          discipline={currentDiscipline}
        />
      </>
    );
  }

  const renderCompetencyCard = ([name, data]: [string, { id?: number; focusArea: string; description: string; subCompetencies?: string[] }]) => {
    const hasRubric = hasRubricData(name);
    return (
      <div 
        key={name} 
        className="competency-definition-card"
      >
        <div className="competency-definition-header">
          <div className="competency-name-row">
            <div className="competency-name">{name}</div>
            {useApi && (
              <button 
                className="edit-competency-btn"
                onClick={(e) => handleEditCompetency(e, name, data)}
                title="Edit competency"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            )}
          </div>
          {hasRubric && (
            <span 
              className="view-rubric-link clickable"
              onClick={() => handleCompetencyClick(name)}
            >
              View in Rubrics →
            </span>
          )}
        </div>
        <div className="competency-definition-body">
          <div className="competency-definition-text">{data.description}</div>
          {data.subCompetencies && data.subCompetencies.length > 0 && (
            <div className="sub-competencies">
              <span className="sub-competencies-label">Factored:</span>
              <div className="sub-competencies-tags">
                {data.subCompetencies.map((sub: string) => {
                  const description = subCompetencyDescriptions[sub];
                  const isExpanded = expandedSub === `${name}:${sub}`;
                  return (
                    <div key={sub} className="sub-competency-wrapper">
                      <span 
                        className={`sub-competency-tag ${description ? 'clickable' : ''} ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => description && toggleSubCompetency(`${name}:${sub}`)}
                        title={description ? 'Click to expand' : ''}
                      >
                        {sub}
                        {description && (
                          <svg className="sub-competency-chevron" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )}
                      </span>
                      {isExpanded && description && (
                        <div className="sub-competency-description">
                          {description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <AddButton />
      <div className="competencies-sections">
        {sortedSections.map(([area, items]) => (
          <div key={area} className="competencies-section">
            <div className="competencies-section-header">
              <h3 className="competencies-section-title">{getFocusAreaLabel(area)}</h3>
              {getFocusAreaDescription(area) && (
                <p className="competencies-section-subtitle">{getFocusAreaDescription(area)}</p>
              )}
            </div>
            <div className="competencies-grid">
              {items.map(item => renderCompetencyCard(item))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <EditCompetencyModal
        isOpen={editingCompetency !== null}
        onClose={() => setEditingCompetency(null)}
        onSave={handleSave}
        competency={editingCompetency}
        discipline={currentDiscipline}
      />
    </>
  );
}
