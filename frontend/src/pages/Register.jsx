import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [status, setStatus] = useState(null); // { type: 'error'|'success', message }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (form.password !== form.confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (form.password.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Registration failed.' });
      } else {
        setStatus({ type: 'success', message: data.message });
        setForm({ name: '', email: '', password: '', confirm: '' });
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

        <h1>Create account</h1>
        <p className="subtitle">Join us — it only takes a minute.</p>

        {status && (
          <div className={`alert alert-${status.type}`}>
            <span>{status.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{status.message}</span>
          </div>
        )}

        {status?.type !== 'success' && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                name="confirm"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button id="register-submit" className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : '🚀'}
              {loading ? 'Sending verification...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="divider">already have an account?</div>
        <Link id="go-to-login" to="/login" className="btn btn-ghost">
          Sign In →
        </Link>
      </div>
    </div>
  );
}
