import { Link } from 'react-router-dom';
import { recentReservations } from '../../../../data/adminDashboard';
import styles from './AdminRecentReservations.module.css';

const statusClass = {
  Confirmed: styles.confirmed,
  Pending: styles.pending,
  Cancelled: styles.cancelled,
  Completed: styles.confirmed,
};

function AdminRecentReservations({
  reservations = recentReservations,
}) {
  return (
    <section
      className={styles.card}
      aria-labelledby="recent-reservations-title"
    >
      <div className={styles.header}>
        <div>
          <h2 id="recent-reservations-title" className={styles.title}>
            Recent reservations
          </h2>
          <p className={styles.subtitle}>
            Latest bookings across the platform
          </p>
        </div>
        <Link to="/admin/bookings" className={styles.viewAll}>
          View all
        </Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Booking ID</th>
              <th scope="col">Traveler</th>
              <th scope="col">Tour</th>
              <th scope="col">Date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((row) => (
              <tr key={row.id}>
                <td className={styles.bookingId}>{row.id}</td>
                <td>{row.traveler}</td>
                <td>{row.tour}</td>
                <td>{row.date}</td>
                <td className={styles.amount}>{row.amount}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      statusClass[row.status]
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminRecentReservations;
