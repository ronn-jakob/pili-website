import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WriteReviewModal from '../../components/sections/booking/WriteReviewModal/WriteReviewModal';
import useTravelerAuth from '../../context/useTravelerAuth';
import { getBookingById } from '../../lib/bookings';
import {
  bookingChangeErrorMessage,
  createBookingChangeRequest,
  getBookingChangeForBooking,
} from '../../lib/bookingChanges';
import {
  getCancellationRequest,
  refundRequestStatusLabel,
} from '../../lib/cancellationRequests';
import {
  getDepartureById,
  getPublicDeparturesForTour,
} from '../../lib/departures';
import { mapBookingToCard } from '../../lib/bookingMapper';
import {
  getReviewEligibility,
  getReviewForBooking,
  reviewStatusLabel,
} from '../../lib/reviews';
import { formatLongDate, formatMoney } from '../../utils/booking';
import styles from './BookingDetailPage.module.css';

function formatDateTime(value) {
  if (!value) {
    return 'To be confirmed';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function formatDateRange(start, end) {
  if (!start) {
    return 'To be confirmed';
  }

  return end
    ? `${formatLongDate(start)} – ${formatLongDate(end)}`
    : formatLongDate(start);
}

function BookingDetailPage() {
  const { bookingId } = useParams();
  const { traveler } = useTravelerAuth();
  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState(null);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeDepartures, setChangeDepartures] = useState([]);
  const [changeDepartureId, setChangeDepartureId] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeSubmitting, setChangeSubmitting] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [refundRequest, setRefundRequest] = useState(null);
  const [departureStatus, setDepartureStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!traveler) {
      return undefined;
    }

    let active = true;

    getBookingById(bookingId)
      .then((item) => {
        if (!active) {
          return;
        }

        if (!item || item.travelerId !== traveler.uid) {
          setBooking(null);
        } else {
          setBooking(item);
        }

        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError('Could not load this booking.');
          setLoading(false);
        }
      });

    getReviewForBooking(bookingId)
      .then((item) => {
        if (active) {
          setReview(item);
          setReviewLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setReview(null);
          setReviewLoading(false);
        }
      });

    getBookingChangeForBooking(bookingId)
      .then((item) => {
        if (active) {
          setChangeRequest(item);
        }
      })
      .catch(() => {
        if (active) {
          setChangeRequest(null);
        }
      });

    getCancellationRequest(bookingId)
      .then((item) => {
        if (active) {
          setRefundRequest(item);
        }
      })
      .catch(() => {
        if (active) {
          setRefundRequest(null);
        }
      });

    return () => {
      active = false;
    };
  }, [bookingId, traveler]);

  useEffect(() => {
    if (!booking?.departureId) {
      return undefined;
    }

    let active = true;

    getDepartureById(booking.departureId)
      .then((departure) => {
        if (active) {
          setDepartureStatus(departure?.status ?? '');
        }
      })
      .catch(() => {
        if (active) {
          setDepartureStatus('');
        }
      });

    return () => {
      active = false;
    };
  }, [booking?.departureId]);

  if (loading) {
    return (
      <main className="page-loading">
        <p>Loading booking details…</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link to="/bookings" className={styles.back}>
            ← Back to My Bookings
          </Link>
          <section className={styles.missing}>
            <h1 className={styles.missingTitle}>
              Booking not found
            </h1>
            <p className={styles.missingText}>
              This booking could not be found, or it does not belong to
              your account.
            </p>
            <Link to="/bookings" className={styles.missingLink}>
              Return to My Bookings
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const card = mapBookingToCard(booking);
  const tour = booking.tourSnapshot ?? {};
  const departure = booking.departureSnapshot ?? {};
  const lead = booking.travelerSnapshot ?? {};
  const travelers = booking.travelers ?? {};
  const pricing = booking.pricingSnapshot ?? {};
  const amounts = booking.amounts ?? {};
  const currency = amounts.currency || 'PHP';
  const adultCount = Number(travelers.adults) || 0;
  const childCount = Number(travelers.children) || 0;
  const infantCount = Number(travelers.infants) || 0;
  const discount = Number(amounts.discount) || 0;
  const taxes = Number(amounts.taxes) || 0;
  const fees = Number(amounts.fees) || 0;
  const refundAmount = Number(booking.refundAmount) || 0;
  const unitRows = [
    {
      label: `Adult × ${adultCount}`,
      value: (Number(pricing.adultPrice) || 0) * adultCount,
    },
    {
      label: `Child × ${childCount}`,
      value: (Number(pricing.childPrice) || 0) * childCount,
    },
    {
      label: `Infant × ${infantCount}`,
      value: (Number(pricing.infantPrice) || 0) * infantCount,
    },
  ].filter((row) => row.value > 0);
  const statusClass = styles[booking.status] ?? '';
  const paymentTone = styles[card.paymentTone] ?? '';
  const meetingPoint = departure.meetingPoint ?? {};
  const reviewEligibility = getReviewEligibility(
    booking,
    review,
    departureStatus,
  );
  const reviewStatusClass =
    review?.moderationStatus === 'published'
      ? styles.reviewPublished
      : review?.moderationStatus === 'hidden'
        ? styles.reviewHidden
        : styles.reviewPending;

  const handleReviewSubmitted = (submittedReview) => {
    setReview(submittedReview);
    setReviewLoading(false);
    setShowReviewModal(false);
  };

  const canRequestChange =
    !changeRequest &&
    ['pending', 'confirmed'].includes(booking.status);

  const handleOpenChangeForm = async () => {
    setShowChangeForm(true);
    setChangeError('');

    if (changeDepartures.length > 0) {
      return;
    }

    setChangeLoading(true);

    try {
      const items = await getPublicDeparturesForTour(booking.tourId);
      const partySize = Number(travelers.total) || 0;
      const now = Date.now();
      const available = items.filter(
        (item) =>
          item.id !== booking.departureId &&
          item.startAt &&
          item.startAt.getTime() > now &&
          Number(item.capacity) - Number(item.bookedTravelers) >= partySize,
      );

      setChangeDepartures(available);
      setChangeDepartureId(available[0]?.id ?? '');

      if (available.length === 0) {
        setChangeError(
          'No other departures currently have enough slots for this booking.',
        );
      }
    } catch {
      setChangeError('Could not load available departures.');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleChangeSubmit = async (event) => {
    event.preventDefault();

    if (changeSubmitting) {
      return;
    }

    const newDeparture = changeDepartures.find(
      (item) => item.id === changeDepartureId,
    );

    if (!newDeparture) {
      setChangeError('Choose a departure.');
      return;
    }

    setChangeSubmitting(true);
    setChangeError('');

    try {
      await createBookingChangeRequest({
        booking,
        travelerId: traveler.uid,
        newDeparture,
        reason: changeReason,
      });
      setChangeRequest({
        status: 'requested',
        toDepartureId: newDeparture.id,
        toDepartureSnapshot: {
          startAt: newDeparture.startAt,
          endAt: newDeparture.endAt,
          meetingTime: newDeparture.meetingTime,
          meetingPoint: newDeparture.meetingPoint,
          cutoffAt: newDeparture.cutoffAt,
        },
        createdAtDate: new Date(),
      });
      setShowChangeForm(false);
      setChangeReason('');
    } catch (changeSubmitError) {
      setChangeError(bookingChangeErrorMessage(changeSubmitError));
    } finally {
      setChangeSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/bookings" className={styles.back}>
          ← Back to My Bookings
        </Link>

        <header className={styles.header}>
          <div className={styles.headerMain}>
            <p className={styles.eyebrow}>Booking details</p>
            <h1 className={styles.title}>
              {tour.title || 'Tour booking'}
            </h1>
            <p className={styles.subtitle}>
              {tour.destinationName || 'Philippines'} ·{' '}
              {tour.durationLabel || 'Flexible duration'}
            </p>
            <div className={styles.badges}>
              <span
                className={`${styles.statusBadge} ${statusClass}`}
              >
                {card.status}
              </span>
              <span
                className={`${styles.paymentBadge} ${paymentTone}`}
              >
                {card.paymentStatus}
              </span>
              <span className={styles.reference}>
                {booking.reference}
              </span>
            </div>
          </div>

          <div className={styles.headerTotal}>
            <span>Total</span>
            <strong>
              {formatMoney(amounts.total ?? 0, currency)}
            </strong>
            <span>{card.remaining}</span>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Tour</h2>
              <div className={styles.tourRow}>
                <img
                  className={styles.tourImage}
                  src={card.image}
                  alt=""
                />
                <div className={styles.tourInfo}>
                  <h3>{tour.title || 'Tour booking'}</h3>
                  <p>{tour.destinationName || 'Philippines'}</p>
                  <p>
                    {tour.category || 'Tour'} ·{' '}
                    {tour.durationLabel || 'Flexible'}
                  </p>
                  <p className={styles.includes}>
                    <strong>Includes:</strong> {card.includes}
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Departure</h2>
              <div className={styles.detailGrid}>
                <div>
                  <span>Dates</span>
                  <strong>
                    {formatDateRange(
                      booking.departureStartAt,
                      booking.departureEndAt,
                    )}
                  </strong>
                </div>
                <div>
                  <span>Meeting time</span>
                  <strong>
                    {departure.meetingTime || 'To be confirmed'}
                  </strong>
                </div>
                <div>
                  <span>Meeting point</span>
                  <strong>
                    {meetingPoint.name || 'To be confirmed'}
                  </strong>
                  {meetingPoint.address && (
                    <p className={styles.detailNote}>
                      {meetingPoint.address}
                    </p>
                  )}
                </div>
                <div>
                  <span>Booking cutoff</span>
                  <strong>
                    {formatDateTime(booking.departureCutoffAt)}
                  </strong>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Change departure</h2>

              {changeRequest?.status === 'requested' ? (
                <>
                  <p className={styles.bodyText}>
                    Your request to move to{' '}
                    {formatDateRange(
                      changeRequest.toDepartureSnapshot?.startAt?.toDate?.() ??
                        changeRequest.toDepartureSnapshot?.startAt,
                      changeRequest.toDepartureSnapshot?.endAt?.toDate?.() ??
                        changeRequest.toDepartureSnapshot?.endAt,
                    )}{' '}
                    is waiting for operator approval.
                  </p>
                  {changeRequest.reason && (
                    <p className={styles.bodyText}>
                      Reason: {changeRequest.reason}
                    </p>
                  )}
                </>
              ) : showChangeForm ? (
                <form className={styles.changeForm} onSubmit={handleChangeSubmit}>
                  <label className={styles.changeField}>
                    <span>New departure</span>
                    <select
                      className={styles.changeSelect}
                      value={changeDepartureId}
                      onChange={(event) =>
                        setChangeDepartureId(event.target.value)
                      }
                      disabled={changeLoading || changeDepartures.length === 0}
                    >
                      {changeDepartures.map((item) => (
                        <option key={item.id} value={item.id}>
                          {formatDateRange(item.startAt, item.endAt)} ·{' '}
                          {Number(item.capacity) - Number(item.bookedTravelers)}{' '}
                          slots left
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.changeField}>
                    <span>Reason (optional)</span>
                    <textarea
                      className={styles.changeTextarea}
                      rows={3}
                      value={changeReason}
                      onChange={(event) => setChangeReason(event.target.value)}
                      placeholder="Tell the operator why you need to move."
                    />
                  </label>

                  {changeError && (
                    <p className={styles.changeError} role="alert">
                      {changeError}
                    </p>
                  )}

                  <div className={styles.changeActions}>
                    <button
                      type="submit"
                      className={styles.changeButton}
                      disabled={
                        changeSubmitting ||
                        changeLoading ||
                        !changeDepartureId
                      }
                    >
                      {changeSubmitting ? 'Submitting…' : 'Submit request'}
                    </button>
                    <button
                      type="button"
                      className={styles.changeCancel}
                      onClick={() => {
                        setShowChangeForm(false);
                        setChangeError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : canRequestChange ? (
                <>
                  <p className={styles.bodyText}>
                    Need a different date? Request another departure for this
                    same tour. The price stays the same.
                  </p>
                  <button
                    type="button"
                    className={styles.reviewButton}
                    onClick={handleOpenChangeForm}
                  >
                    Request departure change
                  </button>
                  {changeLoading && (
                    <p className={styles.bodyText}>Loading departures…</p>
                  )}
                </>
              ) : (
                <p className={styles.bodyText}>
                  {changeRequest
                    ? 'This booking already has a change request.'
                    : 'Departure changes are available for active bookings before the trip starts.'}
                </p>
              )}

              {changeError && !showChangeForm && (
                <p className={styles.changeError} role="alert">
                  {changeError}
                </p>
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Lead traveler</h2>
              <div className={styles.detailGrid}>
                <div>
                  <span>Name</span>
                  <strong>
                    {[lead.firstName, lead.lastName]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{lead.email || '—'}</strong>
                </div>
                <div>
                  <span>Mobile</span>
                  <strong>{lead.mobile || '—'}</strong>
                </div>
                <div>
                  <span>Pickup</span>
                  <strong>{lead.pickup || '—'}</strong>
                </div>
                <div className={styles.full}>
                  <span>Hotel / accommodation</span>
                  <strong>{lead.hotel || '—'}</strong>
                </div>
                <div className={styles.full}>
                  <span>Special requests</span>
                  <strong>{booking.specialRequests || '—'}</strong>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Travelers</h2>
              <div className={styles.travelerStats}>
                <div>
                  <span>Adults</span>
                  <strong>{adultCount}</strong>
                </div>
                <div>
                  <span>Children</span>
                  <strong>{childCount}</strong>
                </div>
                <div>
                  <span>Infants</span>
                  <strong>{infantCount}</strong>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>
                Payment breakdown
              </h2>
              <dl className={styles.rows}>
                {unitRows.map((row) => (
                  <div key={row.label} className={styles.row}>
                    <dt>{row.label}</dt>
                    <dd>{formatMoney(row.value, currency)}</dd>
                  </div>
                ))}
                <div className={styles.row}>
                  <dt>Subtotal</dt>
                  <dd>
                    {formatMoney(amounts.subtotal ?? 0, currency)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className={styles.row}>
                    <dt>Discount</dt>
                    <dd>-{formatMoney(discount, currency)}</dd>
                  </div>
                )}
                {taxes > 0 && (
                  <div className={styles.row}>
                    <dt>Taxes</dt>
                    <dd>{formatMoney(taxes, currency)}</dd>
                  </div>
                )}
                <div className={styles.row}>
                  <dt>Service fee</dt>
                  <dd>{formatMoney(fees, currency)}</dd>
                </div>
                <div className={`${styles.row} ${styles.totalRow}`}>
                  <dt>Total</dt>
                  <dd>{formatMoney(amounts.total ?? 0, currency)}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Balance due</dt>
                  <dd>
                    {formatMoney(amounts.balanceDue ?? 0, currency)}
                  </dd>
                </div>
                {refundAmount > 0 && (
                  <div className={styles.row}>
                    <dt>Refunded</dt>
                    <dd>{formatMoney(refundAmount, currency)}</dd>
                  </div>
                )}
              </dl>

              <div className={styles.paymentMeta}>
                <p>
                  <span>Payment method</span>
                  <strong>{booking.paymentMethod || '—'}</strong>
                </p>
                {booking.confirmedAtDate && (
                  <p>
                    <span>Confirmed</span>
                    <strong>
                      {formatLongDate(booking.confirmedAtDate)}
                    </strong>
                  </p>
                )}
                {booking.refundedAtDate && (
                  <p>
                    <span>Refunded</span>
                    <strong>
                      {formatLongDate(booking.refundedAtDate)}
                    </strong>
                  </p>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Cancellation</h2>
              <p className={styles.bodyText}>{card.policy}</p>
              {refundRequest && (
                <p className={styles.bodyText}>
                  <strong>{refundRequestStatusLabel(refundRequest.status)}.</strong>
                  {refundRequest.adminNote
                    ? ` ${refundRequest.adminNote}`
                    : ''}
                </p>
              )}
              {booking.status === 'cancelled' && (
                <p className={styles.bodyText}>
                  This booking has been cancelled.
                  {booking.paymentStatus === 'refunded'
                    ? ' The payment was refunded.'
                    : ' No payment is due.'}
                </p>
              )}
              {card.canCancel && (
                <p className={styles.bodyText}>
                  You can cancel this booking from My Bookings.
                </p>
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Your review</h2>

              {reviewLoading ? (
                <p className={styles.bodyText}>
                  Checking review eligibility…
                </p>
              ) : review ? (
                <>
                  <span
                    className={`${styles.reviewStatus} ${reviewStatusClass}`}
                  >
                    {reviewStatusLabel(review.moderationStatus)}
                  </span>
                  <p
                    className={styles.reviewStars}
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </p>
                  <h3 className={styles.reviewTitle}>
                    {review.title}
                  </h3>
                  <p className={styles.reviewComment}>
                    {review.comment}
                  </p>
                  {review.moderationStatus === 'pending' && (
                    <p className={styles.reviewHint}>
                      Your review is visible after administrator
                      approval.
                    </p>
                  )}
                </>
              ) : reviewEligibility.eligible ? (
                <>
                  <p className={styles.bodyText}>
                    Share your experience with future travelers.
                  </p>
                  <button
                    type="button"
                    className={styles.reviewButton}
                    onClick={() => setShowReviewModal(true)}
                  >
                    Write a review
                  </button>
                </>
              ) : (
                <p className={styles.bodyText}>
                  {reviewEligibility.reason}
                </p>
              )}
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>
                Booking summary
              </h2>
              <dl className={styles.sideRows}>
                <div>
                  <dt>Reference</dt>
                  <dd>{booking.reference}</dd>
                </div>
                <div>
                  <dt>Booked</dt>
                  <dd>
                    {booking.createdAtDate
                      ? formatLongDate(booking.createdAtDate)
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{card.status}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{card.paymentStatus}</dd>
                </div>
                {booking.status === 'pending' &&
                  booking.holdExpiresAtDate && (
                    <div>
                      <dt>Hold expires</dt>
                      <dd>
                        {formatDateTime(booking.holdExpiresAtDate)}
                      </dd>
                    </div>
                  )}
              </dl>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Need help?</h2>
              <p className={styles.bodyText}>
                Email us and include your booking reference.
              </p>
              <a
                href="mailto:pilitravelandtour@gmail.com"
                className={styles.supportLink}
              >
                pilitravelandtour@gmail.com
              </a>
            </section>
          </aside>
        </div>
      </div>

      {showReviewModal && (
        <WriteReviewModal
          booking={booking}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </main>
  );
}

export default BookingDetailPage;
