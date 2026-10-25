import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import Logo from '../../components/ui/Logo/Logo';
import PasswordToggle from '../../components/ui/PasswordToggle/PasswordToggle';
import { auth } from '../../lib/firebase';
import {
  OPERATOR_EMAIL,
  isOperatorUser,
  operatorLoginErrorMessage,
} from '../../lib/operatorAuth';
import styles from './OperatorLoginPage.module.css';

function OperatorLoginPage() {
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

      if (user && (await isOperatorUser(user))) {
        if (active) {
          navigate('/operator', { replace: true });
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

      if (credential.user.email !== OPERATOR_EMAIL) {
        await signOut(auth);
        setError('This account does not have operator access.');
        return;
      }

      const allowed = await isOperatorUser(credential.user);

      if (!allowed) {
        await signOut(auth);
        setError('This account does not have operator access.');
        return;
      }

      navigate('/operator', { replace: true });
    } catch (signInError) {
      setError(operatorLoginErrorMessage(signInError.code));
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <main className={styles.page}>
        <div className={styles.loading} role="status">
          Checking operator access…
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

        <p className={styles.eyebrow}>Operator console</p>
        <h1 className={styles.title}>Operator sign in</h1>
        <p className={styles.subtitle}>
          Use the Pili operator account to access the dashboard.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email address</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="operator@gmail.com"
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

          <button type="submit" className={styles.submit} disabled={submitting}>
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

export default OperatorLoginPage;
