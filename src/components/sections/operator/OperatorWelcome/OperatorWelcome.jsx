import { Link } from 'react-router-dom';
import { operatorWelcome } from '../../../../data/operatorDashboard';
import styles from './OperatorWelcome.module.css';

function OperatorWelcome({ welcome = operatorWelcome }) {
  return (
    <section className={styles.banner} aria-labelledby="operator-welcome-title">
      <div className={styles.copy}>
        <p className={styles.greeting}>{welcome.greeting}</p>
        <h1 id="operator-welcome-title" className={styles.title}>
          {welcome.title}
        </h1>
        <p className={styles.summary}>{welcome.summary}</p>
      </div>

      <div className={styles.actions}>
        <Link to="/operator/tours/new" className={styles.primary}>
          + Add tour
        </Link>
        <Link to="/operator/reservations" className={styles.secondary}>
          View bookings
        </Link>
      </div>
    </section>
  );
}

export default OperatorWelcome;
