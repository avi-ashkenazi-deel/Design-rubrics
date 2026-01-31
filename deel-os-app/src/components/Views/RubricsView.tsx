import { useState } from 'react';
import { useApp, type RubricDataWithId } from '../../context/AppContext';
import { getTextDiff, formatCellText } from '../../utils/textDiff';
import { EditCellModal } from '../shared/EditCellModal';

interface EditState {
  rubricId: number;
  field: string;
  value: string;
  level: string;
  competency: string;
  score: number;
}

export function RubricsView() {
  const { 
    rubricData, 
    competencyDefinitions,
    questionsData,
    selectedLevels,
    selectedScores,
    selectedStage,
    selectedCompetency,
    useApi,
    updateCell
  } = useApp();

  const [showQuestionsState, setShowQuestionsState] = useState<Record<string, boolean>>({});
  const [modalCompetency, setModalCompetency] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  if (selectedLevels.filter(Boolean).length === 0) {
    return (
      <div className="empty-state">
        <h3>Compare designer levels</h3>
        <p>Add levels to compare their requirements side-by-side.</p>
      </div>
    );
  }

  const levels = selectedLevels.filter(Boolean);

  // Helper to normalize stage names (empty becomes "General")
  const normalizeStage = (stage: string) => stage || 'General';
  
  // Helper to match stage (handles "General" matching empty string)
  const stageMatches = (rubricStage: string, targetStage: string) => {
    const normalizedRubric = normalizeStage(rubricStage);
    return normalizedRubric === targetStage;
  };

  // Get all stages and competencies (include empty stages as "General")
  const stages = selectedStage 
    ? [selectedStage]
    : [...new Set(rubricData.map(r => normalizeStage(r.interview_stage)))];

  // Toggle questions visibility
  const toggleQuestions = (stage: string, competency: string) => {
    const key = `${stage}_${competency}`;
    setShowQuestionsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get questions for a stage/competency
  const getQuestions = (stage: string, competency: string): string | null => {
    const key = `${stage}_${competency}`;
    const data = questionsData[key];
    if (data) {
      return typeof data === 'string' ? data : data.text;
    }
    
    const keyNoColon = `${stage}_${competency.replace(/:\s*$/, '')}`;
    const dataNoColon = questionsData[keyNoColon];
    if (dataNoColon) {
      return typeof dataNoColon === 'string' ? dataNoColon : dataNoColon.text;
    }
    
    return null;
  };

  // Format questions as HTML
  const formatQuestionsAsHtml = (questions: string): string => {
    const lines = questions.split(/\n|(?=•)/).filter(line => line.trim());
    const listItems = lines.map(line => {
      const text = line.replace(/^[•\-\*]\s*/, '').trim();
      return text ? `<li>${text}</li>` : '';
    }).filter(item => item);
    return `<ul>${listItems.join('')}</ul>`;
  };

  // Handle opening edit modal
  const handleEditClick = (
    rubric: RubricDataWithId,
    field: string,
    value: string,
    level: string,
    competency: string,
    score: number
  ) => {
    if (!useApi || !rubric.id) return;
    
    setEditState({
      rubricId: rubric.id,
      field,
      value,
      level,
      competency,
      score
    });
  };

  // Handle save
  const handleSave = async (newValue: string) => {
    if (!editState) return;
    await updateCell(editState.rubricId, editState.field, newValue);
  };

  // Render a competency row
  const renderCompetencyRow = (stage: string, competency: string, showStageOnly = false) => {
    const hasDefinition = competencyDefinitions[competency] || 
                         competencyDefinitions[competency.replace(':', '')];
    
    const questions = getQuestions(stage, competency);
    const questionsKey = `${stage}_${competency}`;
    const showQuestions = showQuestionsState[questionsKey] || false;

    // Get data for each level
    const levelData = levels.map(level => 
      rubricData.find(r => 
        stageMatches(r.interview_stage, stage) && 
        r.competency === competency && 
        r.designer_level === level
      )
    );

    // Display name: just stage when grouped by competency, otherwise competency or competency + stage
    let displayName = competency;
    if (showStageOnly) {
      displayName = stage;
    } else if (!selectedStage) {
      displayName = `${competency} — ${stage}`;
    }

    return (
      <div key={`${stage}_${competency}`} className="competency-row">
        <div className="competency-header">
          <div className="competency-title-wrapper">
            <div className="competency-name">
              {displayName}
            </div>
            {hasDefinition && !showStageOnly && (
              <button 
                className="info-icon" 
                onClick={() => setModalCompetency(competency)}
              >
                i
              </button>
            )}
          </div>
          {questions && (
            <button 
              className={`questions-toggle ${showQuestions ? 'active' : ''}`}
              onClick={() => toggleQuestions(stage, competency)}
            >
              <span>{showQuestions ? 'Hide questions' : 'See questions'}</span>
            </button>
          )}
        </div>
        <div className="compare-table-wrapper">
          {showQuestions && questions && (
            <div className="questions-panel">
              <div className="questions-panel-header">Interview Questions</div>
              <div 
                className="questions-panel-content"
                dangerouslySetInnerHTML={{ __html: formatQuestionsAsHtml(questions) }}
              />
            </div>
          )}
          <div className="compare-table-main">
            <div className="compare-table">
              <div className="compare-table-header">
                <div className="compare-table-cell score-label-cell">Score</div>
                {levels.map(level => (
                  <div key={level} className="compare-table-cell level-header-cell">
                    {level}
                  </div>
                ))}
              </div>
              {selectedScores.map(score => {
                const textsForScore = levelData.map(data => 
                  data?.[`score_${score}` as keyof typeof data] as string || ''
                );
                const highlightedTexts = levels.length > 1 
                  ? getTextDiff(textsForScore) 
                  : textsForScore.map(t => t || '—');

                return (
                  <div 
                    key={score} 
                    className={`compare-table-row ${score <= 2 ? 'fail-row' : 'pass-row'} score-row-${score}`}
                  >
                    <div className="compare-table-cell score-label-cell">
                      <span className={`score-badge score-${score}`}>{score}</span>
                    </div>
                    {highlightedTexts.map((text, idx) => {
                      const rubric = levelData[idx];
                      const level = levels[idx];
                      const field = `score_${score}`;
                      const originalValue = rubric?.[field as keyof typeof rubric] as string || '';
                      const canEdit = useApi && rubric?.id;

                      return (
                        <div 
                          key={idx} 
                          className={`compare-table-cell ${canEdit ? 'editable-cell' : ''}`}
                        >
                          <div 
                            className="compare-cell-text"
                            dangerouslySetInnerHTML={{ __html: formatCellText(text) }}
                          />
                          {canEdit && (
                            <button
                              className="edit-pencil-btn"
                              onClick={() => handleEditClick(
                                rubric,
                                field,
                                originalValue,
                                level,
                                competency,
                                score
                              )}
                              title="Edit cell"
                              aria-label="Edit cell"
                            >
                              <svg 
                                viewBox="0 0 24 24" 
                                width="16" 
                                height="16" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get competencies for each stage
  const getCompetenciesForStage = (stage: string): string[] => {
    let comps = [...new Set(
      rubricData
        .filter(r => stageMatches(r.interview_stage, stage))
        .map(r => r.competency)
    )];
    
    if (selectedCompetency) {
      comps = comps.filter(c => c === selectedCompetency);
    }
    
    return comps;
  };

  // Modal for competency definition
  const renderModal = () => {
    if (!modalCompetency) return null;
    
    const definition = competencyDefinitions[modalCompetency] || 
                       competencyDefinitions[modalCompetency.replace(':', '')];
    
    if (!definition) return null;

    return (
      <div 
        className="modal-overlay active" 
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalCompetency(null);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">{modalCompetency}</div>
            <button className="modal-close" onClick={() => setModalCompetency(null)}>×</button>
          </div>
          <div className="modal-body">
            {definition.focusArea && (
              <div className="modal-focus-area">{definition.focusArea}</div>
            )}
            <div className="modal-description">{definition.description}</div>
          </div>
        </div>
      </div>
    );
  };

  // Get all unique competencies when showing all stages
  const allCompetencies = [...new Set(rubricData.map(r => r.competency))];
  const filteredCompetencies = selectedCompetency 
    ? allCompetencies.filter(c => c === selectedCompetency)
    : allCompetencies;

  // When no stage is selected, group by competency
  if (!selectedStage) {
    return (
      <>
        <div className="comparison-grid competency-grouped">
          {filteredCompetencies.map(comp => {
            // Find which stages have this competency
            const stagesWithComp = stages.filter(s => 
              rubricData.some(r => stageMatches(r.interview_stage, s) && r.competency === comp)
            );
            
            if (stagesWithComp.length === 0) return null;

            const hasDefinition = competencyDefinitions[comp] || 
                                 competencyDefinitions[comp.replace(':', '')];

            return (
              <div key={comp} className="competency-group">
                <div className="competency-group-header">
                  {comp}
                  {hasDefinition && (
                    <button 
                      className="info-icon" 
                      onClick={() => setModalCompetency(comp)}
                      style={{ marginLeft: '8px' }}
                    >
                      i
                    </button>
                  )}
                </div>
                {stagesWithComp.map(stage => renderCompetencyRow(stage, comp, true))}
              </div>
            );
          })}
        </div>
        {renderModal()}
        
        {/* Edit Cell Modal */}
        <EditCellModal
          isOpen={editState !== null}
          onClose={() => setEditState(null)}
          onSave={handleSave}
          initialValue={editState?.value || ''}
          title={`Score ${editState?.score}`}
          subtitle={`${editState?.level} • ${editState?.competency}`}
        />
      </>
    );
  }

  return (
    <>
      <div className="comparison-grid">
        {stages.map(stage => 
          getCompetenciesForStage(stage).map(comp => 
            renderCompetencyRow(stage, comp)
          )
        )}
      </div>
      {renderModal()}
      
      {/* Edit Cell Modal */}
      <EditCellModal
        isOpen={editState !== null}
        onClose={() => setEditState(null)}
        onSave={handleSave}
        initialValue={editState?.value || ''}
        title={`Score ${editState?.score}`}
        subtitle={`${editState?.level} • ${editState?.competency}`}
      />
    </>
  );
}
