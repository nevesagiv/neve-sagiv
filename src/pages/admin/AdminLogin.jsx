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
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.password_placeholder', 'הזן סיסמה')}
            autoComplete="current-password"
            required
            dir="ltr"
          />

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
