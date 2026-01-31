import { useState } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

export function LocalhostNamePrompt() {
  const [name, setName] = useState('');
  const { setUserName } = useSupabaseAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          marginBottom: '8px',
          fontSize: '24px',
          fontWeight: 600,
          color: '#333'
        }}>
          Design Rubrics
        </h1>
        <p style={{ 
          marginBottom: '8px',
          color: '#4f46e5',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Local Development Mode
        </p>
        <p style={{ 
          marginBottom: '24px',
          color: '#666',
          fontSize: '14px'
        }}>
          Enter your name for change tracking
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '16px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: name.trim() ? '#4f46e5' : '#a5a5a5',
              border: 'none',
              borderRadius: '8px',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => name.trim() && (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseOut={(e) => name.trim() && (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
