import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingsFilters from '../../components/sections/bookings/BookingsFilters/BookingsFilters';
import BookingsNote from '../../components/sections/bookings/BookingsNote/BookingsNote';
import BookingsSummary from '../../components/sections/bookings/BookingsSummary/BookingsSummary';
import BookingCard from '../../components/sections/bookings/BookingCard/BookingCard';
import useTravelerAuth from '../../context/useTravelerAuth';
import {
  bookingFilters,
  getBookingStats,
  mapBookingToCard,
} from '../../lib/bookingMapper';
import { getTravelerBookings } from '../../lib/bookings';
import {
  createCancellationRequest,
  getTravelerCancellationRequests,
  refundRequestErrorMessage,
} from '../../lib/cancellationRequests';
import {
  cancelBooking,
  confirmPaymentIntent,
  paymentErrorMessage,
  releaseBooking,
} from '../../lib/paymentApi';
import styles from './BookingsPage.module.css';

function BookingsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [refundRequests, setRefundRequests] = useState([]);
  const { traveler } = useTravelerAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!traveler) {
      return undefined;
    }

    let active = true;

    getTravelerBookings(traveler.uid)
      .then((items) => {
        if (active) {
          setBookings(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(
            'Could not load your bookings. Refresh the page and try again.',
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [traveler]);

  useEffect(() => {
    const stripeState = searchParams.get('stripe');

    if (!traveler || !stripeState) {
      return undefined;
    }

    let active = true;

    const completeStripeReturn = async () => {
      try {
        if (stripeState === 'success') {
          const paymentIntentId =
            searchParams.get('payment_intent');

          if (!paymentIntentId) {
            throw new Error(
              'The Stripe payment reference is missing.',
            );
          }

          const result = await confirmPaymentIntent(paymentIntentId);

          if (result.status !== 'paid') {
            throw new Error(
              'Stripe has not confirmed this payment yet. Refresh in a moment.',
            );
          }

          const items = await getTravelerBookings(traveler.uid);

          if (active) {
            setBookings(items);
            setLoading(false);
            setPaymentMessage(
              'Payment successful. Your booking is confirmed.',
            );
          }
        } else if (stripeState === 'cancelled') {
          const bookingId = searchParams.get('booking_id');

          if (bookingId) {
            try {
              await releaseBooking(bookingId);
            } catch {
              // The booking remains pending if release fails.
            }
          }

          const items = await getTravelerBookings(traveler.uid);

          if (active) {
            setBookings(items);
            setLoading(false);
            setPaymentMessage(
              'Payment cancelled. Your reservation was released.',
            );
          }
        }
      } catch (error) {
        if (active) {
          setPaymentError(paymentErrorMessage(error));
        }
      } finally {
        if (active) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('stripe');
          nextParams.delete('session_id');
          nextParams.delete('payment_intent');
          nextParams.delete('payment_intent_client_secret');
          nextParams.delete('redirect_status');
          nextParams.delete('booking_id');
          setSearchParams(nextParams, { replace: true });
        }
      }
    };

    completeStripeReturn();

    return () => {
      active = false;
    };
  }, [traveler, searchParams, setSearchParams]);

  useEffect(() => {
    if (!traveler) {
      return undefined;
    }

    let active = true;

    getTravelerCancellationRequests(traveler.uid)
      .then((items) => {
        if (active) {
          setRefundRequests(items);
        }
      })
      .catch(() => {
        if (active) {
          setRefundRequests([]);
        }
      });

    return () => {
      active = false;
    };
  }, [traveler]);

  const cardBookings = useMemo(() => {
    const requestsByBooking = new Map(
      refundRequests.map((request) => [request.bookingId, request]),
    );

    return bookings.map((booking) => {
      const card = mapBookingToCard(booking);
      const refundRequest = requestsByBooking.get(booking.id) ?? null;

      return {
        ...card,
        refundRequest,
        canCancel: card.canCancel && !refundRequest,
      };
    });
  }, [bookings, refundRequests]);
  const stats = useMemo(
    () => getBookingStats(cardBookings),
    [cardBookings],
  );
  const visibleBookings = useMemo(
    () =>
      activeFilter === 'All'
        ? cardBookings
        : cardBookings.filter(
            (booking) => booking.status === activeFilter,
          ),
    [activeFilter, cardBookings],
  );

  const handleReturn = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const handleCancelClick = (booking) => {
    setCancelError('');
    setCancelReason('');
    setCancelTarget(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !traveler || cancellingId) {
      return;
    }

    const targetBooking = bookings.find(
      (booking) => booking.id === cancelTarget.id,
    );

    if (!targetBooking) {
      setCancelError('This booking could not be found.');
      return;
    }

    setCancellingId(cancelTarget.id);
    setCancelError('');
    setPaymentMessage('');
    setPaymentError('');

    try {
      if (targetBooking.paymentStatus === 'paid') {
        if (!cancelReason.trim()) {
          setCancelError('Tell the admin why you are requesting a refund.');
          return;
        }

        const request = await createCancellationRequest({
          booking: targetBooking,
          travelerId: traveler.uid,
          reason: cancelReason,
        });

        setRefundRequests((current) => [
          request,
          ...current.filter(
            (item) => item.bookingId !== request.bookingId,
          ),
        ]);
        setCancelTarget(null);
        setCancelReason('');
        setPaymentMessage(
          'Refund request submitted. An administrator will review it before any refund is issued.',
        );
        return;
      }

      const result = await cancelBooking(cancelTarget.id);

      if (!result.cancelled) {
        setCancelError('This booking could not be cancelled.');
        return;
      }

      const items = await getTravelerBookings(traveler.uid);

      setBookings(items);
      setCancelTarget(null);
      setPaymentMessage('Booking cancelled and reservation released.');
    } catch (error) {
      setCancelError(
        targetBooking.paymentStatus === 'paid'
          ? refundRequestErrorMessage(error)
          : paymentErrorMessage(error),
      );
    } finally {
      setCancellingId('');
    }
  };

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

        {paymentMessage && (
          <p
            className={`${styles.banner} ${styles.success}`}
            role="status"
          >
            {paymentMessage}
          </p>
        )}

        {paymentError && (
          <p className={`${styles.banner} ${styles.error}`} role="alert">
            {paymentError}
          </p>
        )}

        {loadError && (
          <p className={`${styles.banner} ${styles.error}`} role="alert">
            {loadError}
          </p>
        )}

        <BookingsSummary stats={stats} />

        <div className={styles.filters}>
          <BookingsFilters
            filters={bookingFilters}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        <div className={styles.list}>
          {loading ? (
            <p className={styles.empty}>Loading your bookings…</p>
          ) : visibleBookings.length > 0 ? (
            visibleBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelClick}
                cancelLoading={cancellingId === booking.id}
              />
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

      {cancelTarget && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !cancellingId
            ) {
              setCancelTarget(null);
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
          >
            <h2
              id="cancel-booking-title"
              className={styles.modalTitle}
            >
              {cancelTarget.paymentStatusRaw === 'paid'
                ? 'Request a refund?'
                : 'Cancel this booking?'}
            </h2>
            <p className={styles.modalText}>
              {cancelTarget.reference} · {cancelTarget.title}
            </p>
            <p className={styles.modalText}>
              {cancelTarget.paymentStatusRaw === 'paid'
                ? 'This sends a refund request to an administrator. The booking stays active and capacity remains reserved until the request is approved.'
                : 'This releases your pending reservation. No payment is due.'}
            </p>

            {cancelTarget.paymentStatusRaw === 'paid' && (
              <label className={styles.modalField}>
                <span>Reason for refund</span>
                <textarea
                  className={styles.modalTextarea}
                  rows={3}
                  value={cancelReason}
                  onChange={(event) =>
                    setCancelReason(event.target.value)
                  }
                  placeholder="Tell the admin why you need a refund."
                />
              </label>
            )}

            {cancelError && (
              <p className={styles.modalError} role="alert">
                {cancelError}
              </p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalKeep}
                onClick={() => setCancelTarget(null)}
                disabled={Boolean(cancellingId)}
              >
                Keep booking
              </button>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingId)}
              >
                {cancellingId
                  ? cancelTarget.paymentStatusRaw === 'paid'
                    ? 'Submitting…'
                    : 'Cancelling…'
                  : cancelTarget.paymentStatusRaw === 'paid'
                    ? 'Submit refund request'
                    : 'Cancel booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default BookingsPage;
