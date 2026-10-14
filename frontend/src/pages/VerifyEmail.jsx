import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">ThreeTier App</span>
        </div>

        <div className="verify-container">
          {status === 'loading' && (
            <>
              <span className="verify-icon">⏳</span>
              <h1>Verifying your email…</h1>
              <p className="subtitle">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="verify-icon">✅</span>
              <h1>Email Verified!</h1>
              <p className="subtitle">{message}</p>
              <div style={{ marginTop: 28 }}>
                <Link id="go-login-after-verify" to="/login" className="btn btn-primary">
                  🔐 Sign In Now
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="verify-icon">❌</span>
              <h1>Verification Failed</h1>
              <div className="alert alert-error" style={{ textAlign: 'left', marginTop: 16 }}>
                <span>⚠️</span>
                <span>{message}</span>
              </div>
              <Link id="go-register-retry" to="/register" className="btn btn-ghost" style={{ marginTop: 16 }}>
                Try Registering Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
