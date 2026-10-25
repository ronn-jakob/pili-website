import styles from './BookingsNote.module.css';

function BookingsNote() {
  return (
    <div className={styles.note}>
      <p className={styles.text}>
        Need to change or cancel a trip? Please review our cancellation
        policy or contact support at{' '}
        <a className={styles.link} href="mailto:pilitravelandtour@gmail.com">
          pilitravelandtour@gmail.com
        </a>
        . We usually reply within 24 hours.
      </p>
    </div>
  );
}

export default BookingsNote;
