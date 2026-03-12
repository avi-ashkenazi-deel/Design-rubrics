import { useState } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

export function LocalhostNamePrompt() {
  const [email, setEmail] = useState('');
  const { setUserEmail, error } = useSupabaseAuth();

  const isValidEmail = email.trim().toLowerCase().endsWith('@deel.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidEmail) {
      setUserEmail(email.trim().toLowerCase());
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
          Deel OS
        </h1>
        <p style={{ 
          marginBottom: '8px',
          color: '#2563EB',
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
          Enter your Deel email for access and change tracking
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@deel.com"
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
          
          {error && (
            <p style={{
              color: '#dc2626',
              marginBottom: '16px',
              fontSize: '13px',
              padding: '10px',
              background: 'rgba(220, 38, 38, 0.08)',
              borderRadius: '8px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValidEmail}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: isValidEmail ? '#2563EB' : '#a5a5a5',
              border: 'none',
              borderRadius: '8px',
              cursor: isValidEmail ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => isValidEmail && (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseOut={(e) => isValidEmail && (e.currentTarget.style.backgroundColor = '#2563EB')}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
