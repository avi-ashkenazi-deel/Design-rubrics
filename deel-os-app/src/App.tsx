import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LaddersProvider } from './context/LaddersContext';
// import { AuthOverlay } from './components/Auth/GoogleAuth';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { CompetenciesView } from './components/Views/CompetenciesView';
import { RubricsView } from './components/Views/RubricsView';
import { LaddersView } from './components/Views/LaddersView';
import { TranscriptView } from './components/Views/TranscriptView';
import { WelcomeView } from './components/Views/WelcomeView';
import './styles/globals.css';

function AppContent() {
  // const { isAuthenticated } = useAuth();
  const { currentView } = useApp();

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'definitions':
        return <CompetenciesView />;
      case 'rubric':
        return <RubricsView />;
      case 'ladders':
        return <LaddersView />;
      case 'transcript':
        return <TranscriptView />;
      default:
        return <WelcomeView />;
    }
  };

  // For now, skip auth and show app directly
  // Uncomment AuthOverlay when Google OAuth is configured
  return (
    <>
      {/* <AuthOverlay /> */}
      {/* {isAuthenticated && ( */}
        <div className="app">
          <Sidebar />
          <main className="main">
            <Header />
            <div className="content-area">
              {renderView()}
            </div>
          </main>
        </div>
      {/* )} */}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <LaddersProvider>
          <AppContent />
        </LaddersProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
