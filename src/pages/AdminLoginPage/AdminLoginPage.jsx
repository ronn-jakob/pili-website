import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Logo from '../../components/ui/Logo/Logo';
import PasswordToggle from '../../components/ui/PasswordToggle/PasswordToggle';
import { auth } from '../../lib/firebase';
import { ADMIN_EMAIL, adminLoginErrorMessage, isAdminUser } from '../../lib/adminAuth';
import styles from './AdminLoginPage.module.css';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) {
        return;
      }

      if (user && (await isAdminUser(user))) {
        if (active) {
          navigate('/admin', { replace: true });
        }
        return;
      }

      if (active) {
        setChecking(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      if (credential.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError('This account does not have administrator access.');
        return;
      }

      const allowed = await isAdminUser(credential.user);

      if (!allowed) {
        await signOut(auth);
        setError('This account does not have administrator access.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (signInError) {
      setError(adminLoginErrorMessage(signInError.code));
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <main className={styles.page}>
        <div className={styles.loading} role="status">
          Checking administrator access…
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand} aria-label="Pili Tour and Travel">
          <Logo link={false} size="medium" />
        </Link>

        <p className={styles.eyebrow}>Admin console</p>
          <h1 className={styles.title}>Administrator sign in</h1>
          <p className={styles.subtitle}>
            Use the Pili administrator account to access the dashboard.
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Email address</span>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@gmail.com"
                autoComplete="username"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((current) => !current)}
                  label="password"
                  className={styles.passwordToggle}
                />
              </div>
            </label>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={styles.submit}
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <Link to="/" className={styles.backLink}>
            ← Back to Pili website
          </Link>
      </div>
    </main>
  );
}

export default AdminLoginPage;
