import { operatorWeek } from '../../../../data/operatorDashboard';
import styles from './OperatorWeekChart.module.css';

function OperatorWeekChart() {
  const max = Math.max(...operatorWeek.map((day) => day.value));

  return (
    <section className={styles.card} aria-labelledby="operator-week-title">
      <h2 id="operator-week-title" className={styles.title}>
        This week
      </h2>

      <div
        className={styles.chart}
        role="img"
        aria-label="Bookings for the current week, peaking on Saturday"
      >
        {operatorWeek.map((day, index) => (
          <div key={`${day.day}-${index}`} className={styles.column}>
            <div className={styles.barArea}>
              <span
                className={`${styles.bar}${
                  day.peak ? ` ${styles.barPeak}` : ''
                }`}
                style={{ '--bar-height': `${(day.value / max) * 100}%` }}
                title={`${day.day}: ${day.value} bookings`}
              />
            </div>
            <span className={styles.day}>{day.day}</span>
          </div>
        ))}
      </div>

      <p className={styles.caption}>Peak day: Saturday · 24 bookings</p>
    </section>
  );
}

export default OperatorWeekChart;
