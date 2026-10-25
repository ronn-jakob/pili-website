import styles from './SettingsActions.module.css';

function SettingsActions({ onCancel, status }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        <p className={styles.note}>
          Changes apply to future bookings and confirmations.
        </p>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.save}>
            Save changes
          </button>
        </div>
      </div>

      {status && (
        <p className={styles.status} role="status">
          {status}
        </p>
      )}
    </div>
  );
}

export default SettingsActions;
