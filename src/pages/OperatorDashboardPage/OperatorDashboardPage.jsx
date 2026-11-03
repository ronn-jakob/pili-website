import { useEffect, useMemo, useState } from 'react';
import OperatorKpis from '../../components/sections/operator/OperatorKpis/OperatorKpis';
import OperatorRecentBookings from '../../components/sections/operator/OperatorRecentBookings/OperatorRecentBookings';
import OperatorTours from '../../components/sections/operator/OperatorTours/OperatorTours';
import OperatorWeekChart from '../../components/sections/operator/OperatorWeekChart/OperatorWeekChart';
import OperatorWelcome from '../../components/sections/operator/OperatorWelcome/OperatorWelcome';
import { useOperatorTours } from '../../context/useOperatorTours';
import { auth } from '../../lib/firebase';
import { buildOperatorDashboard } from '../../lib/operatorDashboard';
import { getOperatorBookings } from '../../lib/operatorBookings';
import styles from './OperatorDashboardPage.module.css';

function OperatorDashboardPage() {
  const { tours } = useOperatorTours();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [now] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const uid = auth.currentUser?.uid ?? '';

    getOperatorBookings(uid)
      .then((items) => {
        if (active) {
          setBookings(items);
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

  const data = useMemo(
    () =>
      bookings
        ? buildOperatorDashboard(tours, bookings, now)
        : null,
    [tours, bookings, now],
  );

  return (
    <div className={styles.page}>
      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}
      <OperatorWelcome welcome={data?.welcome} />
      <OperatorKpis kpis={data?.kpis} />
      <OperatorTours tours={data?.tours} />

      <div className={styles.lower}>
        <OperatorRecentBookings bookings={data?.bookings} />
        <OperatorWeekChart
          week={data?.week}
          caption={data?.weekCaption}
        />
      </div>
    </div>
  );
}

export default OperatorDashboardPage;
