import OperatorKpis from '../../components/sections/operator/OperatorKpis/OperatorKpis';
import OperatorRecentBookings from '../../components/sections/operator/OperatorRecentBookings/OperatorRecentBookings';
import OperatorTours from '../../components/sections/operator/OperatorTours/OperatorTours';
import OperatorWeekChart from '../../components/sections/operator/OperatorWeekChart/OperatorWeekChart';
import OperatorWelcome from '../../components/sections/operator/OperatorWelcome/OperatorWelcome';
import styles from './OperatorDashboardPage.module.css';

function OperatorDashboardPage() {
  return (
    <div className={styles.page}>
      <OperatorWelcome />
      <OperatorKpis />
      <OperatorTours />

      <div className={styles.lower}>
        <OperatorRecentBookings />
        <OperatorWeekChart />
      </div>
    </div>
  );
}

export default OperatorDashboardPage;
