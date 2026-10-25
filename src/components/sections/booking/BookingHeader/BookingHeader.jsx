import { Link } from 'react-router-dom';
import styles from './BookingHeader.module.css';

const steps = ['Details', 'Review', 'Payment'];

function BookingHeader({
  pkg,
  title = 'Complete your booking',
  subtitle = 'Review your details and confirm before payment',
  activeStep = 1,
}) {
  return (
    <header className={styles.header}>
      <Link to={`/packages/${pkg.id}`} className={styles.returnLink}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M19 12H5M5 12L11 6M5 12L11 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Return
      </Link>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      <ol className={styles.steps} aria-label="Booking steps">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`${styles.step}${
              index + 1 === activeStep ? ` ${styles.stepActive}` : ''
            }`}
            aria-current={index + 1 === activeStep ? 'step' : undefined}
          >
            {index + 1} {step}
          </li>
        ))}
      </ol>
    </header>
  );
}

export default BookingHeader;
