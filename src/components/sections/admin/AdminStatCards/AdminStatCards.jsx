import { adminStats } from '../../../../data/adminDashboard';
import styles from './AdminStatCards.module.css';

function AdminStatCards() {
  return (
    <section className={styles.grid} aria-label="Platform statistics">
      {adminStats.map((stat) => (
        <article
          key={stat.id}
          className={`${styles.card} ${styles[stat.tone]}`}
        >
          <p className={styles.label}>{stat.label}</p>
          <div className={styles.valueGroup}>
            <p className={styles.value}>{stat.value}</p>
            <p className={styles.delta}>{stat.delta}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default AdminStatCards;
