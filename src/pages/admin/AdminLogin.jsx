import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAuthenticated, login } from '../../lib/adminAuth.js';
import './AdminLogin.css';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, skip the login screen
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(t('admin.login_error'));
      setPassword('');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <span className="login-pill">PRIVATE</span>
        <h1>{t('admin.login_title')}</h1>
        <p className="login-sub">{t('admin.login_sub')}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password">{t('admin.password_label')}</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.password_placeholder')}
            autoComplete="current-password"
            autoFocus
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? t('admin.checking') : t('admin.login_button')}
          </button>
        </form>
      </div>
    </div>
  );
}
