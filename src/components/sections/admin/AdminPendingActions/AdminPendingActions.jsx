import { pendingActions } from '../../../../data/adminDashboard';
import styles from './AdminPendingActions.module.css';

function AdminPendingActions() {
  return (
    <section className={styles.card} aria-labelledby="pending-actions-title">
      <h2 id="pending-actions-title" className={styles.title}>
        Pending actions
      </h2>
      <p className={styles.subtitle}>Needs admin attention</p>

      <ul className={styles.list}>
        {pendingActions.map((action) => (
          <li key={action.id} className={styles.row}>
            <span className={styles.label}>{action.label}</span>
            <span className={`${styles.badge} ${styles[action.tone]}`}>
              {action.count}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminPendingActions;
