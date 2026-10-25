import { useState } from 'react';
import PasswordToggle from '../../../ui/PasswordToggle/PasswordToggle';
import styles from './SettingsSecurity.module.css';

function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${styles.inputWithToggle}`}
          value={value}
          placeholder="••••••••••••"
          onChange={(event) => onChange(name, event.target.value)}
          autoComplete={autoComplete}
        />
        <PasswordToggle
          visible={visible}
          onToggle={() => setVisible((current) => !current)}
          label={label.toLowerCase()}
          className={styles.passwordToggle}
        />
      </div>
    </div>
  );
}

function SettingsSecurity() {
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const updatePassword = (name, value) => {
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  return (
    <section
      id="login-security"
      className={styles.section}
      aria-labelledby="login-security-title"
    >
      <h2 id="login-security-title" className={styles.title}>
        Login &amp; security
      </h2>
      <p className={styles.description}>
        Manage your password and keep your account secure.
      </p>

      <div className={styles.passwordGrid}>
        <PasswordField
          id="profile-current-password"
          label="Current password"
          name="current"
          value={passwords.current}
          onChange={updatePassword}
          autoComplete="current-password"
        />
        <PasswordField
          id="profile-new-password"
          label="New password"
          name="next"
          value={passwords.next}
          onChange={updatePassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="profile-confirm-password"
          label="Confirm new password"
          name="confirm"
          value={passwords.confirm}
          onChange={updatePassword}
          autoComplete="new-password"
        />
        <p className={styles.hint}>
          Use at least 8 characters, including a number and a symbol.
        </p>
      </div>
    </section>
  );
}

export default SettingsSecurity;
