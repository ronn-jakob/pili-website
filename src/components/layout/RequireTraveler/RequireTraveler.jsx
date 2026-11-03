import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useTravelerAuth from '../../../context/useTravelerAuth';
import styles from './RequireTraveler.module.css';

function RequireTraveler() {
  const { traveler, loading } = useTravelerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message} role="status">
          Checking your account…
        </p>
      </main>
    );
  }

  if (!traveler) {
    const from = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/?auth=login&from=${encodeURIComponent(from)}`}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RequireTraveler;
