import styles from './SettingsActions.module.css';

function SettingsActions({
  onCancel,
  status,
  error,
  saving = false,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        <p className={styles.note}>
          Changes apply to future bookings and confirmations.
        </p>

        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className={styles.save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {status && (
        <p className={styles.status} role="status">
          {status}
        </p>
      )}
    </div>
  );
}

export default SettingsActions;
