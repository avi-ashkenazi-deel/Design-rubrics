import { useApp } from '../../context/AppContext';

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  definitions: {
    title: 'Competencies Definition',
    subtitle: 'Understand what each competency means and how it contributes to success'
  },
  rubric: {
    title: 'Hiring Rubric',
    subtitle: 'Compare competency requirements side-by-side across different designer levels'
  },
  transcript: {
    title: 'Transcript Analysis',
    subtitle: 'Analyze interview transcripts to evaluate question coverage per competency'
  },
  ladders: {
    title: 'Career Ladders',
    subtitle: 'Compare role expectations across competencies and career levels'
  }
};

export function Header() {
  const { currentView } = useApp();

  if (!currentView) return null;

  const viewInfo = VIEW_TITLES[currentView] || { title: '', subtitle: '' };

  return (
    <div className="header">
      <h1>{viewInfo.title}</h1>
      <p>{viewInfo.subtitle}</p>
    </div>
  );
}

