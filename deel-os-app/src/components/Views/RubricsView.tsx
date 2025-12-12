import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTextDiff, formatCellText } from '../../utils/textDiff';

export function RubricsView() {
  const { 
    rubricData, 
    competencyDefinitions,
    questionsData,
    selectedLevels,
    selectedScores,
    selectedStage,
    selectedCompetency
  } = useApp();

  const [showQuestionsState, setShowQuestionsState] = useState<Record<string, boolean>>({});
  const [modalCompetency, setModalCompetency] = useState<string | null>(null);

  if (selectedLevels.filter(Boolean).length === 0) {
    return (
      <div className="empty-state">
        <h3>Compare designer levels</h3>
        <p>Add levels to compare their requirements side-by-side.</p>
      </div>
    );
  }

  const levels = selectedLevels.filter(Boolean);

  // Get all stages and competencies
  const stages = selectedStage 
    ? [selectedStage]
    : [...new Set(rubricData.map(r => r.interview_stage))].filter(Boolean);

  // Toggle questions visibility
  const toggleQuestions = (stage: string, competency: string) => {
    const key = `${stage}_${competency}`;
    setShowQuestionsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get questions for a stage/competency
  const getQuestions = (stage: string, competency: string): string | null => {
    const key = `${stage}_${competency}`;
    if (questionsData[key]) return questionsData[key];
    
    const keyNoColon = `${stage}_${competency.replace(/:\s*$/, '')}`;
    if (questionsData[keyNoColon]) return questionsData[keyNoColon];
    
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

  // Render a competency row
  const renderCompetencyRow = (stage: string, competency: string) => {
    const hasDefinition = competencyDefinitions[competency] || 
                         competencyDefinitions[competency.replace(':', '')];
    
    const questions = getQuestions(stage, competency);
    const questionsKey = `${stage}_${competency}`;
    const showQuestions = showQuestionsState[questionsKey] || false;

    // Get data for each level
    const levelData = levels.map(level => 
      rubricData.find(r => 
        r.interview_stage === stage && 
        r.competency === competency && 
        r.designer_level === level
      )
    );

    return (
      <div key={`${stage}_${competency}`} className="competency-row">
        <div className="competency-header">
          <div className="competency-title-wrapper">
            <div className="competency-name">
              {selectedStage ? competency : `${competency} — ${stage}`}
            </div>
            {hasDefinition && (
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
                    {highlightedTexts.map((text, idx) => (
                      <div key={idx} className="compare-table-cell">
                        <div 
                          className="compare-cell-text"
                          dangerouslySetInnerHTML={{ __html: formatCellText(text) }}
                        />
                      </div>
                    ))}
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
        .filter(r => r.interview_stage === stage)
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
    </>
  );
}

