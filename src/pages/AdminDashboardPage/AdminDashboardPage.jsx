import { useEffect, useState } from 'react';
import AdminBookingChart from '../../components/sections/admin/AdminBookingChart/AdminBookingChart';
import AdminPendingActions from '../../components/sections/admin/AdminPendingActions/AdminPendingActions';
import AdminRecentReservations from '../../components/sections/admin/AdminRecentReservations/AdminRecentReservations';
import AdminStatCards from '../../components/sections/admin/AdminStatCards/AdminStatCards';
import { getAdminDashboardData } from '../../lib/adminDashboard';
import styles from './AdminDashboardPage.module.css';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getAdminDashboardData()
      .then((nextData) => {
        if (active) {
          setData(nextData);
        }
      })
      .catch(() => {
        if (active) {
          setError('Showing cached dashboard data.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          <span>Admin</span>
          <span aria-hidden="true">/</span>
          <span>Dashboard</span>
        </p>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Platform overview of users, operators, tours, and reservations.
        </p>
        {error && (
          <p className={styles.subtitle} role="status">
            {error}
          </p>
        )}
      </header>

      <AdminStatCards stats={data?.stats} />

      <div className={styles.mid}>
        <AdminBookingChart bars={data?.bookingBars} />
        <AdminPendingActions actions={data?.pendingActions} />
      </div>

      <AdminRecentReservations reservations={data?.recentReservations} />

      {data?.recentAudit?.length > 0 && (
        <section className={styles.auditCard} aria-labelledby="audit-title">
          <h2 id="audit-title" className={styles.auditTitle}>
            Recent admin activity
          </h2>
          <ul className={styles.auditList}>
            {data.recentAudit.map((entry) => (
              <li key={entry.id} className={styles.auditRow}>
                <span>{entry.summary}</span>
                <span className={styles.auditDate}>
                  {entry.createdAtDate
                    ? new Intl.DateTimeFormat('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }).format(entry.createdAtDate)
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default AdminDashboardPage;
