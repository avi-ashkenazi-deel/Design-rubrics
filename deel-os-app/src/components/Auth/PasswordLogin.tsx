import { useState } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

export function PasswordLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const { sendMagicLink, loginWithPassword, error } = useSupabaseAuth();

  const isValidEmail = email.trim().toLowerCase().endsWith('@deel.com')
    || email.trim().toLowerCase().endsWith('@letsdeel.com');

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return;
    loginWithPassword(email.trim().toLowerCase(), password);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || sending) return;
    setSending(true);
    const result = await sendMagicLink(email.trim().toLowerCase());
    setSending(false);
    if (result.success) setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #E2E4E9',
    borderRadius: '8px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#F5F6F8',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E4E9',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      }}>
        <h1 style={{
          marginBottom: '8px',
          fontSize: '24px',
          fontWeight: 700,
          color: '#111827',
        }}>
          Deel OS
        </h1>

        {sent ? (
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}>
              ✉️
            </div>
            <p style={{ color: '#16A34A', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Check your email
            </p>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              We sent a one-time login link to<br />
              <strong style={{ color: '#111827' }}>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
                backgroundColor: 'transparent',
                border: '1px solid #E2E4E9',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Use a different email
            </button>
          </div>
        ) : mode === 'password' ? (
          <>
            <p style={{ marginBottom: '24px', color: '#6B7280', fontSize: '14px' }}>
              Sign in with your Deel email
            </p>

            <form onSubmit={handlePasswordLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@deel.com"
                style={inputStyle}
                autoFocus
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={inputStyle}
              />

              {error && (
                <p style={{
                  color: '#DC2626',
                  marginBottom: '12px',
                  fontSize: '13px',
                  padding: '10px',
                  background: 'rgba(220, 38, 38, 0.06)',
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
                  fontSize: '15px',
                  fontWeight: 600,
                  color: !isValidEmail ? '#9CA3AF' : '#FFFFFF',
                  backgroundColor: !isValidEmail ? '#EFF0F3' : '#2563EB',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !isValidEmail ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                Sign In
              </button>
            </form>

            <button
              onClick={() => setMode('magic')}
              style={{
                marginTop: '16px',
                padding: '0',
                fontSize: '13px',
                color: '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Use magic link instead
            </button>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '24px', color: '#6B7280', fontSize: '14px' }}>
              Enter your Deel email to receive a login link
            </p>

            <form onSubmit={handleMagicLink}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@deel.com"
                style={inputStyle}
                autoFocus
              />

              {error && (
                <p style={{
                  color: '#DC2626',
                  marginBottom: '12px',
                  fontSize: '13px',
                  padding: '10px',
                  background: 'rgba(220, 38, 38, 0.06)',
                  borderRadius: '8px',
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!isValidEmail || sending}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: (!isValidEmail || sending) ? '#9CA3AF' : '#FFFFFF',
                  backgroundColor: (!isValidEmail || sending) ? '#EFF0F3' : '#2563EB',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!isValidEmail || sending) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {sending ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>

            <button
              onClick={() => setMode('password')}
              style={{
                marginTop: '16px',
                padding: '0',
                fontSize: '13px',
                color: '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Use password instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
