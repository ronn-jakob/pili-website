import { bookingBars } from '../../../../data/adminDashboard';
import styles from './AdminBookingChart.module.css';

function AdminBookingChart() {
  return (
    <section className={styles.card} aria-labelledby="booking-overview-title">
      <h2 id="booking-overview-title" className={styles.title}>
        Booking overview
      </h2>
      <p className={styles.subtitle}>Reservations per month</p>

      <div
        className={styles.chart}
        role="img"
        aria-label="Monthly reservations from May to October"
      >
        {bookingBars.map((bar) => (
          <div key={bar.month} className={styles.column}>
            <div className={styles.barArea}>
              <span
                className={`${styles.bar}${
                  bar.month === 'Oct' ? ` ${styles.barActive}` : ''
                }`}
                style={{ '--bar-height': `${bar.height}%` }}
                title={`${bar.month}: ${bar.value} reservations`}
              />
            </div>
            <span className={styles.month}>{bar.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminBookingChart;
