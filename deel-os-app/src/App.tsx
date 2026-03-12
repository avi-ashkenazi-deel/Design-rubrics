import { useEffect, useRef, useState } from 'react';
import { SupabaseAuthProvider, useSupabaseAuth, isLocalhost } from './context/SupabaseAuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LaddersProvider } from './context/LaddersContext';
import { PasswordLogin } from './components/Auth/PasswordLogin';
import { LocalhostNamePrompt } from './components/Auth/LocalhostNamePrompt';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { ContentFilters } from './components/Layout/ContentFilters';
import { CompetenciesView } from './components/Views/CompetenciesView';
import { RubricsView } from './components/Views/RubricsView';
import { LaddersView } from './components/Views/LaddersView';
import { WelcomeView } from './components/Views/WelcomeView';
import { AdminView } from './components/Views/AdminView';
import './styles/globals.css';

const DEEL_LOGO_SRC = '/deel-logo.png';

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

function TopBar() {
  const { user, permissions, logout } = useSupabaseAuth();
  const { setCurrentView } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div className="top-bar">
      <div className="top-bar-left" onClick={() => setCurrentView(null)} style={{ cursor: 'pointer' }}>
        <img className="top-bar-logo-image" src={DEEL_LOGO_SRC} alt="deel." />
        <span className="top-bar-product">OS</span>
      </div>
      <div className="top-bar-right">
        {user && (
          <div className="top-bar-user-menu" ref={userMenuRef}>
            <button
              className="top-bar-user"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              type="button"
            >
              <div className="top-bar-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="top-bar-user-info">
                <span className="top-bar-user-name">{user.name}</span>
                <span className="top-bar-user-role">{permissions.role}</span>
              </div>
              <svg className={`top-bar-user-chevron${isUserMenuOpen ? ' open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="top-bar-user-dropdown" role="menu">
                <button className="top-bar-user-dropdown-item" onClick={logout} type="button" role="menuitem">
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
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
        color: '#6B7280',
        backgroundColor: '#EDE8F5',
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
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="main">
          <div className="content-sheet">
            <Header />
            <ContentFilters />
            <div className="content-area">
              {renderView()}
            </div>
          </div>
        </main>
      </div>
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
