import { useState } from 'react';
import { Link } from 'react-router-dom';
import WriteReviewModal from '../../components/sections/booking/WriteReviewModal/WriteReviewModal';
import useTravelerAuth from '../../context/useTravelerAuth';
import useReviewableBookings from '../../hooks/useReviewableBookings';
import { formatLongDate } from '../../utils/booking';
import fallbackImage from '../../Images/destinations-hero.png';
import styles from './NeedsReviewPage.module.css';

function NeedsReviewPage() {
  const { traveler } = useTravelerAuth();
  const { bookings, loading, error, refresh } = useReviewableBookings(
    traveler?.uid,
  );
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmitted = () => {
    setSelectedBooking(null);
    setMessage('Review submitted. It will appear after administrator approval.');
    refresh();
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Your trips</p>
          <h1 className={styles.title}>Tours to Review</h1>
          <p className={styles.subtitle}>
            Share your experience for completed trips you have not reviewed yet.
          </p>
        </header>

        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className={styles.empty}>Loading tours that need a review…</p>
        ) : bookings.length === 0 ? (
          <section className={styles.emptyCard}>
            <h2>No tours need a review right now.</h2>
            <p>
              After a trip ends or the operator marks the departure completed,
              the tour will appear here.
            </p>
            <Link to="/bookings" className={styles.secondaryLink}>
              View My Bookings
            </Link>
          </section>
        ) : (
          <div className={styles.list}>
            {bookings.map((booking) => (
              <article key={booking.id} className={styles.card}>
                <img
                  src={booking.tourSnapshot?.image || fallbackImage}
                  alt=""
                  className={styles.image}
                />
                <div className={styles.body}>
                  <p className={styles.reference}>{booking.reference}</p>
                  <h2 className={styles.cardTitle}>
                    {booking.tourSnapshot?.title || 'Tour booking'}
                  </h2>
                  <p className={styles.meta}>
                    {booking.tourSnapshot?.destinationName || 'Philippines'} ·{' '}
                    {booking.tourSnapshot?.durationLabel || 'Flexible'}
                  </p>
                  <p className={styles.meta}>
                    {booking.departureStartAt
                      ? formatLongDate(booking.departureStartAt)
                      : 'Departure date to be confirmed'}
                  </p>
                  <div className={styles.actions}>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className={styles.secondaryLink}
                    >
                      View booking
                    </Link>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        setMessage('');
                        setSelectedBooking(booking);
                      }}
                    >
                      Write a review
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <WriteReviewModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </main>
  );
}

export default NeedsReviewPage;
