import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Login failed.' });
      } else {
        navigate('/dashboard');
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">ThreeTier App</span>
        </div>

        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your account to continue.</p>

        {status && (
          <div className={`alert alert-${status.type}`}>
            <span>⚠️</span>
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button id="login-submit" className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : '🔐'}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">don't have an account?</div>
        <Link id="go-to-register" to="/register" className="btn btn-ghost">
          Create Account →
        </Link>
      </div>
    </div>
  );
}
