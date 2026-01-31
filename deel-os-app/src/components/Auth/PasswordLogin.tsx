import { useState } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

export function PasswordLogin() {
  const [password, setPassword] = useState('');
  const { login, error } = useSupabaseAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
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
          marginBottom: '24px',
          color: '#666',
          fontSize: '14px'
        }}>
          Enter the password to access
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
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
              color: '#e53935',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </p>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            Access Rubrics
          </button>
        </form>
      </div>
    </div>
  );
}
