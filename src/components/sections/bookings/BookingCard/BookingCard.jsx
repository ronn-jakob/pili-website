import { Link } from 'react-router-dom';
import styles from './BookingCard.module.css';

const statusClass = {
  Confirmed: styles.confirmed,
  Pending: styles.pending,
  Completed: styles.completed,
  Cancelled: styles.cancelled,
};

function BookingCard({
  booking,
  onCancel,
  cancelLoading = false,
}) {
  return (
    <article className={styles.card}>
      <div className={styles.photoWrap}>
        <img
          className={styles.photo}
          src={booking.image}
          alt={`${booking.title}, ${booking.location}`}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${statusClass[booking.status]}`}>
            {booking.status}
          </span>
          <span className={styles.reference}>{booking.reference}</span>
        </div>

        <h2 className={styles.title}>{booking.title}</h2>
        <p className={styles.location}>{booking.location}</p>

        <div className={styles.details}>
          <dl className={styles.dates}>
            <div className={styles.row}>
              <dt>Check-in</dt>
              <dd>{booking.checkIn}</dd>
            </div>
            <div className={styles.row}>
              <dt>Check-out</dt>
              <dd>{booking.checkOut}</dd>
            </div>
            <div className={styles.row}>
              <dt>Duration</dt>
              <dd>{booking.duration}</dd>
            </div>
            <div className={styles.row}>
              <dt>Guests</dt>
              <dd>{booking.guests}</dd>
            </div>
          </dl>

          <div className={styles.info}>
            <p className={styles.label}>Meeting point</p>
            <p className={styles.value}>{booking.meetingPoint}</p>
            <p className={`${styles.label} ${styles.includesLabel}`}>
              Includes
            </p>
            <p className={styles.value}>{booking.includes}</p>
            <p className={styles.policy}>{booking.policy}</p>
            {booking.refundRequest && (
              <p className={styles.refundNote}>
                {booking.refundRequest.status === 'requested' &&
                  'Refund request pending admin approval.'}
                {booking.refundRequest.status === 'rejected' &&
                  `Refund request rejected.${
                    booking.refundRequest.adminNote
                      ? ` ${booking.refundRequest.adminNote}`
                      : ''
                  }`}
                {booking.refundRequest.status === 'processed' &&
                  'Refund approved and processed.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.payment}>
          <p className={styles.price}>{booking.priceLabel}</p>
          <p
            className={`${styles.paymentStatus} ${
              styles[booking.paymentTone]
            }`}
          >
            {booking.paymentStatus}
          </p>
          <p className={styles.method}>{booking.paymentMethod}</p>
          <p className={styles.remaining}>{booking.remaining}</p>
        </div>

        <div className={styles.buttons}>
          <Link
            to={`/bookings/${booking.id}`}
            className={styles.view}
          >
            View full details
          </Link>
          {booking.canRequestChange && (
            <button type="button" className={styles.change}>
              Request change
            </button>
          )}
          {booking.canCancel && (
            <button
              type="button"
              className={styles.cancel}
              onClick={() => onCancel?.(booking)}
              disabled={cancelLoading}
            >
              {cancelLoading
                ? 'Working…'
                : booking.paymentStatusRaw === 'paid'
                  ? 'Request refund'
                  : 'Cancel booking'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
