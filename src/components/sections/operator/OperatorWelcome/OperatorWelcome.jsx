import { operatorWelcome } from '../../../../data/operatorDashboard';
import styles from './OperatorWelcome.module.css';

function OperatorWelcome() {
  return (
    <section className={styles.banner} aria-labelledby="operator-welcome-title">
      <div className={styles.copy}>
        <p className={styles.greeting}>{operatorWelcome.greeting}</p>
        <h1 id="operator-welcome-title" className={styles.title}>
          {operatorWelcome.title}
        </h1>
        <p className={styles.summary}>{operatorWelcome.summary}</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary}>
          + Add tour
        </button>
        <button type="button" className={styles.secondary}>
          View bookings
        </button>
      </div>
    </section>
  );
}

export default OperatorWelcome;
