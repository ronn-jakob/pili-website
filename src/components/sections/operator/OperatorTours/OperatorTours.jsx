import { operatorTours } from '../../../../data/operatorDashboard';
import styles from './OperatorTours.module.css';

function OperatorTours() {
  return (
    <section className={styles.section} aria-labelledby="live-tours-title">
      <div className={styles.heading}>
        <h2 id="live-tours-title" className={styles.title}>
          Your live tours
        </h2>
        <p className={styles.subtitle}>Packages currently open for booking</p>
      </div>

      <div className={styles.grid}>
        {operatorTours.map((tour) => (
          <article key={tour.id} className={styles.card}>
            <div
              className={styles.photo}
              style={{ background: tour.background }}
              aria-hidden="true"
            />
            <div className={styles.body}>
              <h3 className={styles.tourTitle}>{tour.title}</h3>
              <p className={styles.seats}>{tour.seats}</p>
              <span className={`${styles.badge} ${styles[tour.tone]}`}>
                {tour.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OperatorTours;
