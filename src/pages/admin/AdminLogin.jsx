import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminLogin, getCurrentUser, sendPasswordReset } from '../../lib/adminAuth.js';
import './AdminLogin.css';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  // If already authenticated, skip the login screen
  useEffect(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (active && user) {
        navigate('/admin/dashboard', { replace: true });
      }
    });
    return () => { active = false; };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || t('admin.login_error', 'שם משתמש או סיסמה שגויים'));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setError('יש להזין את כתובת המייל לפני בקשת איפוס סיסמה');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setResetMessage('שלחנו קישור לאיפוס הסיסמה אל המייל שלך. תבדוק גם בספאם.');
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.message || 'לא הצלחנו לשלוח את הקישור. נסה שוב.');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <span className="login-pill">PRIVATE</span>
        <h1>{t('admin.login_title', 'אזור ניהול')}</h1>
        <p className="login-sub">{t('admin.login_sub', 'גישה לאזור הניהול של נווה שגיב')}</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-email">{t('admin.email_label', 'אימייל')}</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            autoFocus
            required
            dir="ltr"
          />

          <label htmlFor="admin-password">{t('admin.password_label', 'סיסמה')}</label>
          <div className="password-wrap">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.password_placeholder', 'הזן סיסמה')}
              autoComplete="current-password"
              required
              dir="ltr"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}
          {resetMessage && <p className="login-success">{resetMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? t('admin.checking', 'בודק...') : t('admin.login_button', 'כניסה')}
          </button>

          <button
            type="button"
            className="login-reset-link"
            onClick={handleReset}
            disabled={loading}
          >
            שכחתי סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}
