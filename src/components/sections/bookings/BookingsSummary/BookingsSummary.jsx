import { formatMoney } from '../../../../utils/booking';
import styles from './BookingsSummary.module.css';

function BookingsSummary({ stats }) {
  const cards = [
    { label: 'Upcoming', value: stats.upcoming },
    { label: 'Completed', value: stats.completed },
    { label: 'Cancelled', value: stats.cancelled },
    { label: 'Total spent', value: formatMoney(stats.totalSpent, 'PHP') },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.label}>{card.label}</span>
          <span className={styles.value}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}

export default BookingsSummary;
