import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingsFilters from '../../components/sections/bookings/BookingsFilters/BookingsFilters';
import BookingsNote from '../../components/sections/bookings/BookingsNote/BookingsNote';
import BookingsSummary from '../../components/sections/bookings/BookingsSummary/BookingsSummary';
import BookingCard from '../../components/sections/bookings/BookingCard/BookingCard';
import {
  bookingFilters,
  bookings,
  getBookingStats,
} from '../../data/bookings';
import styles from './BookingsPage.module.css';

function BookingsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const handleReturn = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const stats = useMemo(() => getBookingStats(bookings), []);
  const visibleBookings = useMemo(
    () =>
      activeFilter === 'All'
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter),
    [activeFilter],
  );

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.returnLink}
          onClick={handleReturn}
        >
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
        </button>

        <header className={styles.heading}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>
            View and manage your upcoming and past adventures.
          </p>
        </header>

        <BookingsSummary stats={stats} />

        <div className={styles.filters}>
          <BookingsFilters
            filters={bookingFilters}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        <div className={styles.list}>
          {visibleBookings.length > 0 ? (
            visibleBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <p className={styles.empty}>
              No {activeFilter.toLowerCase()} bookings yet.
            </p>
          )}
        </div>

        <div className={styles.note}>
          <BookingsNote />
        </div>
      </div>
    </main>
  );
}

export default BookingsPage;
