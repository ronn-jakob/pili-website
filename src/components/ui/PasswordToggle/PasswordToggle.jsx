import styles from './PasswordToggle.module.css';

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="m3 3 18 18" />
    </svg>
  );
}

function PasswordToggle({
  visible,
  onToggle,
  label = 'password',
  className = '',
}) {
  const action = visible ? 'Hide' : 'Show';

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`.trim()}
      onClick={onToggle}
      onMouseDown={(event) => event.preventDefault()}
      aria-label={`${action} ${label}`}
      aria-pressed={visible}
      title={`${action} ${label}`}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

export default PasswordToggle;
