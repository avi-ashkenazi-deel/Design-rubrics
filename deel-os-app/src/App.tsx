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
import './styles/globals.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'definitions':
        return <CompetenciesView />;
      case 'rubric':
        return <RubricsView />;
      case 'ladders':
        return <LaddersView />;
      default:
        return <WelcomeView />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    // On localhost, show simple name prompt (no password needed)
    if (isLocalhost()) {
      return <LocalhostNamePrompt />;
    }
    // On production, show password + name login
    return <PasswordLogin />;
  }

  return (
    <div className="app">
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
