import { SupabaseAuthProvider, useSupabaseAuth, isLocalhost } from './context/SupabaseAuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LaddersProvider } from './context/LaddersContext';
import { PasswordLogin } from './components/Auth/PasswordLogin';
import { LocalhostNamePrompt } from './components/Auth/LocalhostNamePrompt';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { CompetenciesView } from './components/Views/CompetenciesView';
import { RubricsView } from './components/Views/RubricsView';
import { LaddersView } from './components/Views/LaddersView';
import { WelcomeView } from './components/Views/WelcomeView';
import { AdminView } from './components/Views/AdminView';
import './styles/globals.css';

function ImpersonationBanner() {
  const { isImpersonating, impersonatingEmail, stopImpersonating } = useSupabaseAuth();
  if (!isImpersonating) return null;

  return (
    <div className="impersonation-banner">
      <span>Viewing as <strong>{impersonatingEmail}</strong></span>
      <button onClick={stopImpersonating}>Exit</button>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, permissions, realPermissions } = useSupabaseAuth();
  const { currentView, setCurrentView } = useApp();

  const renderView = () => {
    const visibleViews = permissions.visibleViews;

    switch (currentView) {
      case 'definitions':
        if (!visibleViews.includes('competencies')) { setCurrentView(null); return <WelcomeView />; }
        return <CompetenciesView />;
      case 'rubric':
        if (!visibleViews.includes('rubrics')) { setCurrentView(null); return <WelcomeView />; }
        return <RubricsView />;
      case 'ladders':
        if (!visibleViews.includes('ladders')) { setCurrentView(null); return <WelcomeView />; }
        return <LaddersView />;
      case 'admin':
        if (realPermissions.role !== 'admin') { setCurrentView(null); return <WelcomeView />; }
        return <AdminView />;
      default:
        return <WelcomeView />;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#a0a0a0',
        backgroundColor: '#0d0d0d',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isLocalhost()) {
      return <LocalhostNamePrompt />;
    }
    return <PasswordLogin />;
  }

  return (
    <div className="app">
      <ImpersonationBanner />
      <Sidebar />
      <main className="main">
        <Header />
        <div className="content-area">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <SupabaseAuthProvider>
      <AppProvider>
        <LaddersProvider>
          <AppContent />
        </LaddersProvider>
      </AppProvider>
    </SupabaseAuthProvider>
  );
}

export default App;
