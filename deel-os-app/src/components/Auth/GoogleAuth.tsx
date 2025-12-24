import { useAuth } from '../../context/AuthContext';

const CLIENT_ID = '848389852726-9h1feruda3eld0me4hj8audasl72mb1n.apps.googleusercontent.com';

export function AuthOverlay() {
  const { isAuthenticated, error } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <h2>Deel OS</h2>
        <p>Sign in with your Deel account to continue</p>
        <div className="google-signin-container">
          <div 
            id="g_id_onload"
            data-client_id={CLIENT_ID}
            data-context="signin"
            data-ux_mode="popup"
            data-callback="handleGoogleSignIn"
            data-auto_prompt="false"
          />
          <div 
            className="g_id_signin"
            data-type="standard"
            data-shape="rectangular"
            data-theme="filled_black"
            data-text="signin_with"
            data-size="large"
            data-logo_alignment="left"
          />
        </div>
        <p className="subtitle">Only @deel.com accounts are allowed</p>
        {error && <div className="auth-error visible">{error}</div>}
      </div>
    </div>
  );
}

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="user-profile">
      <img className="user-avatar" src={user.picture} alt={user.name} />
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
      </div>
      <button className="signout-btn" onClick={logout} title="Sign out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}






