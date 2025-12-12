import { useApp } from '../../context/AppContext';

export function CompetenciesView() {
  const { 
    competencyDefinitions, 
    currentDiscipline,
    setCurrentView,
    setSelectedCompetency,
    setSelectedStage,
    rubricData
  } = useApp();

  const definitions = Object.entries(competencyDefinitions);
  
  // Filter out duplicates
  const uniqueDefinitions: [string, { focusArea: string; description: string }][] = [];
  const seenDescriptions = new Set<string>();
  
  definitions.forEach(([name, data]) => {
    if (data.description && !seenDescriptions.has(data.description)) {
      seenDescriptions.add(data.description);
      uniqueDefinitions.push([name, data]);
    }
  });

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

  if (uniqueDefinitions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No competency definitions found</h3>
        <p>
          Add a Competencies.csv file in the disciplines/{currentDiscipline} folder 
          with Focus Area, Competency, and Description columns.
        </p>
      </div>
    );
  }

  return (
    <div className="competencies-grid">
      {uniqueDefinitions.map(([name, data]) => {
        const isClickable = hasRubricData(name);
        return (
          <div 
            key={name} 
            className={`competency-definition-card ${isClickable ? 'clickable' : ''}`}
            onClick={() => isClickable && handleCompetencyClick(name)}
          >
            <div className="competency-definition-header">
              <div className="competency-name">{name}</div>
              {isClickable && (
                <span className="view-rubric-link">View in Rubrics →</span>
              )}
            </div>
            <div className="competency-definition-body">
              {data.focusArea && (
                <div className="focus-area-badge">{data.focusArea}</div>
              )}
              <div className="competency-definition-text">{data.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

