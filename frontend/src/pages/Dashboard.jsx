import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, margin: '0 auto' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() || '?';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="dashboard-page">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="brand-icon" style={{ width: 32, height: 32, fontSize: 16 }}>⚡</div>
          ThreeTier App
        </div>
        <button id="logout-btn" className="btn btn-ghost" style={{ width: 'auto', padding: '8px 18px' }} onClick={handleLogout}>
          Sign Out
        </button>
      </nav>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <div className="welcome-hero">
          <div className="avatar">{initial}</div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="subtitle">You're successfully authenticated. Your account is verified and active.</p>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-label">Name</div>
            <div className="stat-value">{user?.name}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-label">Email</div>
            <div className="stat-value" style={{ fontSize: '0.9rem' }}>{user?.email}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-label">Member Since</div>
            <div className="stat-value">{joinedDate}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Account Status</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>Verified</div>
          </div>
        </div>

        {/* ── Stack Info ──────────────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <div className="stat-card" style={{ textAlign: 'left', padding: 28 }}>
            <h2 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--text-muted)' }}>
              🏗️ Architecture
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { icon: '⚛️', label: 'React + Vite', color: '#61dafb' },
                { icon: '🟩', label: 'Node.js + Express', color: '#68d391' },
                { icon: '🐘', label: 'PostgreSQL', color: '#7c9ef7' },
                { icon: '🔴', label: 'Redis', color: '#fc8181' },
                { icon: '📬', label: 'MailHog', color: '#f6ad55' },
                { icon: '🐳', label: 'Docker', color: '#63b3ed' },
              ].map(({ icon, label, color }) => (
                <span
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    color,
                    fontWeight: 500,
                  }}
                >
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
