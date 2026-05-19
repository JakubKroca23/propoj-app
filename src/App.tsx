import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import Login from '@/pages/Login';

function MainApp() {
  const { user, isLoading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center animate-pulse" 
        style={{ height: '100vh', width: '100vw', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }} />
          <p className="text-sm font-medium">Spouštění Canvas OS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div 
      className="flex items-center justify-center" 
      style={{ height: '100vh', width: '100vw', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">OS Shell bude zde</h1>
        <p className="text-sm text-secondary">Přihlášen jako {user.name} ({user.email})</p>
        <button 
          onClick={() => useAuthStore.getState().logout()}
          className="login-submit-btn" 
          style={{ width: 'auto', padding: '10px 20px', marginTop: '16px' }}
        >
          Odhlásit se
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
