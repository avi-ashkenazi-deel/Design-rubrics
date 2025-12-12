import { useState } from 'react';
import { useApp } from '../../context/AppContext';

// OpenAI API Key placeholder
const OPENAI_API_KEY = '';

interface AnalysisResult {
  question: string;
  covered: boolean;
  confidence: number;
}

interface CompetencyResults {
  [competency: string]: AnalysisResult[];
}

interface TranscriptAnalysis {
  interviewer: string;
  interviewee: string;
  stage: string;
  results: CompetencyResults;
}

export function TranscriptView() {
  const { rubricData, questionsData } = useApp();
  
  const [interviewer, setInterviewer] = useState('');
  const [interviewee, setInterviewee] = useState('');
  const [stage, setStage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<TranscriptAnalysis | null>(null);

  const stages = [...new Set(rubricData.map(r => r.interview_stage))].filter(Boolean);

  // Get questions for a stage
  const getQuestionsForStage = (selectedStage: string): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    
    for (const [key, questions] of Object.entries(questionsData)) {
      const [qStage, ...competencyParts] = key.split('_');
      const competency = competencyParts.join('_');
      
      if (qStage === selectedStage && competency) {
        result[competency] = questions
          .split(/\n|(?=•)/)
          .map(q => q.replace(/^[•\-\*]\s*/, '').trim())
          .filter(q => q.length > 0);
      }
    }
    
    return result;
  };

  const analyzeTranscript = async () => {
    if (!interviewer || !interviewee) {
      alert('Please enter both interviewer and candidate names.');
      return;
    }
    if (!stage) {
      alert('Please select an interview stage.');
      return;
    }
    if (!transcript) {
      alert('Please paste the interview transcript.');
      return;
    }
    if (!OPENAI_API_KEY) {
      alert('OpenAI API key is not configured.');
      return;
    }

    const stageQuestions = getQuestionsForStage(stage);
    if (Object.keys(stageQuestions).length === 0) {
      alert('No questions found for this interview stage.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Build questions list
      const questionsList: { index: number; competency: string; question: string }[] = [];
      let index = 0;
      
      for (const [competency, questions] of Object.entries(stageQuestions)) {
        questions.forEach(q => {
          questionsList.push({ index: index++, competency, question: q });
        });
      }

      const prompt = `You are an interview analysis assistant. Analyze the following interview transcript and determine which of the predefined interview questions were asked or addressed during the conversation.

For each question, respond with whether it was "covered" (the topic was discussed, even if not asked verbatim) or "not_covered".

Return your response as a JSON array with objects containing:
- "index": the question index
- "covered": boolean (true if the question topic was addressed)
- "confidence": number 0-100 (how confident you are in this assessment)

PREDEFINED QUESTIONS:
${questionsList.map(q => `[${q.index}] (${q.competency}): ${q.question}`).join('\n')}

INTERVIEW TRANSCRIPT:
${transcript}

Respond ONLY with the JSON array, no other text.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const analysisResults = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

      // Map results back to competencies
      const competencyResults: CompetencyResults = {};
      
      for (const [competency, questions] of Object.entries(stageQuestions)) {
        competencyResults[competency] = questions.map(q => {
          const questionIndex = questionsList.findIndex(
            ql => ql.competency === competency && ql.question === q
          );
          const result = analysisResults.find((r: { index: number; covered: boolean; confidence: number }) => r.index === questionIndex);
          return {
            question: q,
            covered: result?.covered || false,
            confidence: result?.confidence || 0
          };
        });
      }

      setResults({
        interviewer,
        interviewee,
        stage,
        results: competencyResults
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate overall coverage
  const calculateOverallCoverage = (): { percentage: number; total: number; covered: number } => {
    if (!results) return { percentage: 0, total: 0, covered: 0 };
    
    let total = 0;
    let covered = 0;
    
    for (const questions of Object.values(results.results)) {
      total += questions.length;
      covered += questions.filter(q => q.covered).length;
    }
    
    return { 
      percentage: total > 0 ? Math.round((covered / total) * 100) : 0,
      total,
      covered
    };
  };

  const getStageDisplayName = (s: string) => {
    if (s === 'Portfolio') return 'Portfolio (Async)';
    return s;
  };

  return (
    <div className="transcript-container">
      <div className="transcript-input-section">
        <h3>Interview Details</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Interviewer Name</label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="Enter interviewer name..."
            />
          </div>
          <div className="input-group">
            <label>Candidate Name</label>
            <input
              type="text"
              value={interviewee}
              onChange={(e) => setInterviewee(e.target.value)}
              placeholder="Enter candidate name..."
            />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>Interview Stage</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">Select stage...</option>
              {stages.map(s => (
                <option key={s} value={s}>{getStageDisplayName(s)}</option>
              ))}
            </select>
          </div>
        </div>
        <label>Interview Transcript</label>
        <textarea
          className="transcript-textarea"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your Metaview transcript here..."
        />
        <button 
          className={`analyze-btn ${isAnalyzing ? 'loading' : ''}`}
          onClick={analyzeTranscript}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '' : 'Analyze Transcript'}
        </button>
      </div>

      {results && (
        <div className="transcript-results visible">
          <div className="results-header">
            <div className="results-info">
              <div className="results-info-item">
                <span className="results-info-label">Interviewer</span>
                <span className="results-info-value">{results.interviewer}</span>
              </div>
              <div className="results-info-item">
                <span className="results-info-label">Candidate</span>
                <span className="results-info-value">{results.interviewee}</span>
              </div>
              <div className="results-info-item">
                <span className="results-info-label">Stage</span>
                <span className="results-info-value">{getStageDisplayName(results.stage)}</span>
              </div>
            </div>
            <div className="overall-score">
              <div className="overall-score-label">Overall Coverage</div>
              <div className={`overall-score-value ${
                calculateOverallCoverage().percentage >= 70 ? 'high' : 
                calculateOverallCoverage().percentage >= 40 ? 'medium' : 'low'
              }`}>
                {calculateOverallCoverage().percentage}%
              </div>
            </div>
          </div>

          <div className="competency-results-grid">
            {Object.entries(results.results).map(([competency, questions]) => {
              const coveredCount = questions.filter(q => q.covered).length;
              const percentage = Math.round((coveredCount / questions.length) * 100);
              const scoreClass = percentage >= 70 ? 'high' : percentage >= 40 ? 'medium' : 'low';

              return (
                <div key={competency} className="competency-result-card">
                  <div className="competency-result-header">
                    <div className="competency-result-title">{competency}</div>
                    <span className={`competency-score-badge ${scoreClass}`}>
                      {coveredCount}/{questions.length} ({percentage}%)
                    </span>
                  </div>
                  <div className="competency-result-body">
                    {questions.map((q, idx) => (
                      <div 
                        key={idx} 
                        className={`question-item ${q.covered ? 'covered' : 'not-covered'}`}
                      >
                        {q.question}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

