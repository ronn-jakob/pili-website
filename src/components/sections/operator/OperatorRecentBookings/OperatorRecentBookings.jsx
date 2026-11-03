import { operatorBookings } from '../../../../data/operatorDashboard';
import styles from './OperatorRecentBookings.module.css';

const statusClass = {
  Confirmed: styles.confirmed,
  Pending: styles.pending,
  Completed: styles.confirmed,
  Cancelled: styles.cancelled,
};

function OperatorRecentBookings({ bookings = operatorBookings }) {
  return (
    <section
      className={styles.card}
      aria-labelledby="operator-bookings-title"
    >
      <h2 id="operator-bookings-title" className={styles.title}>
        Latest bookings
      </h2>

      <div className={styles.tableWrap}>
        <div className={styles.rows}>
          {bookings.length === 0 ? (
            <p className={styles.traveler}>No bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className={styles.row}>
                <span className={styles.traveler}>{booking.traveler}</span>
                <span className={styles.tour}>{booking.tour}</span>
                <span className={styles.amount}>{booking.amount}</span>
                <span
                  className={`${styles.status} ${
                    statusClass[booking.status] ?? ''
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default OperatorRecentBookings;
