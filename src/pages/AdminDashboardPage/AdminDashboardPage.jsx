import AdminBookingChart from '../../components/sections/admin/AdminBookingChart/AdminBookingChart';
import AdminPendingActions from '../../components/sections/admin/AdminPendingActions/AdminPendingActions';
import AdminRecentReservations from '../../components/sections/admin/AdminRecentReservations/AdminRecentReservations';
import AdminStatCards from '../../components/sections/admin/AdminStatCards/AdminStatCards';
import styles from './AdminDashboardPage.module.css';

function AdminDashboardPage() {
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
      </header>

      <AdminStatCards />

      <div className={styles.mid}>
        <AdminBookingChart />
        <AdminPendingActions />
      </div>

      <AdminRecentReservations />
    </div>
  );
}

export default AdminDashboardPage;
