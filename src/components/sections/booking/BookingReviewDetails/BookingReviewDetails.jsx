import { Link } from 'react-router-dom';
import { formatLongDate, parseDate } from '../../../../utils/booking';
import styles from './BookingReviewDetails.module.css';

function BookingReviewDetails({ pkg, dateValue, travelers, details }) {
  const date = parseDate(dateValue);
  const name = `${details.firstName} ${details.lastName}`.trim() || '—';
  const editState = { date: dateValue, travelers, details };

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Trip details</h2>
          <Link
            to={`/packages/${pkg.id}/book`}
            state={editState}
            className={styles.edit}
          >
            Edit
          </Link>
        </div>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{formatLongDate(date)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Travelers</dt>
            <dd>
              {travelers} {travelers === 1 ? 'person' : 'persons'}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Pickup</dt>
            <dd>{details.pickup || '—'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Stay</dt>
            <dd>{details.hotel || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Lead traveler</h2>
          <Link
            to={`/packages/${pkg.id}/book`}
            state={editState}
            className={styles.edit}
          >
            Edit
          </Link>
        </div>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Name</dt>
            <dd>{name}</dd>
          </div>
          <div className={styles.row}>
            <dt>Mobile</dt>
            <dd>{details.mobile || '—'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Email</dt>
            <dd>{details.email || '—'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Notes</dt>
            <dd>{details.requests || 'None'}</dd>
          </div>
        </dl>
      </section>

      <p className={styles.warning}>
        Once you proceed to payment, traveler and trip details cannot be
        changed. Please make sure everything is correct.
      </p>
    </div>
  );
}

export default BookingReviewDetails;
