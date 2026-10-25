import { useEffect, useState } from 'react';
import ItineraryMapModal from '../../../ui/ItineraryMapModal/ItineraryMapModal';
import { TOUR_STATUS } from '../../../../lib/firestoreSchema';
import {
  getTourStatusLabel,
  moderateTour,
  moderationErrorMessage,
} from '../../../../lib/tours';
import { formatMoney } from '../../../../utils/booking';
import styles from './AdminTourReview.module.css';

const statusClasses = {
  [TOUR_STATUS.draft]: styles.draft,
  [TOUR_STATUS.pendingReview]: styles.pendingReview,
  [TOUR_STATUS.published]: styles.published,
  [TOUR_STATUS.rejected]: styles.rejected,
  [TOUR_STATUS.hidden]: styles.hidden,
  [TOUR_STATUS.archived]: styles.archived,
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function AdminTourReview({ tour, onClose, onModerated }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');
  const [mapItem, setMapItem] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !updating && !mapItem) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, updating, mapItem]);

  const handleModerate = async (status, rejectionReason = '') => {
    if (status === TOUR_STATUS.rejected && !rejectionReason.trim()) {
      setError('Enter a rejection reason before rejecting this tour.');
      return;
    }

    setError('');
    setUpdating(status);

    try {
      await moderateTour(tour.id, status, rejectionReason);
      onModerated();
    } catch (moderationError) {
      setError(moderationErrorMessage(moderationError));
    } finally {
      setUpdating('');
    }
  };

  const canApprove = tour.status === TOUR_STATUS.pendingReview;
  const canReject = tour.status === TOUR_STATUS.pendingReview;
  const canHide = tour.status === TOUR_STATUS.published;
  const canPublish = tour.status === TOUR_STATUS.hidden;
  const canArchive =
    tour.status === TOUR_STATUS.rejected ||
    tour.status === TOUR_STATUS.hidden;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-tour-review-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Tour moderation</p>
            <h2 id="admin-tour-review-title" className={styles.title}>
              {tour.title}
            </h2>
            <p className={styles.subtitle}>
              {tour.destinationName || 'No destination'} ·{' '}
              {tour.duration || 'Duration not set'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <span
              className={`${styles.status} ${
                statusClasses[tour.status] ?? styles.draft
              }`}
            >
              {getTourStatusLabel(tour.status)}
            </span>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close tour review"
              disabled={Boolean(updating)}
            >
              ×
            </button>
          </div>
        </header>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaLabel}>Operator</span>
            <span className={styles.metaValue} title={tour.operatorId}>
              {tour.operatorId
                ? `Operator ${tour.operatorId.slice(0, 8)}…`
                : 'Unknown operator'}
            </span>
          </div>
          <div>
            <span className={styles.metaLabel}>Submitted</span>
            <span className={styles.metaValue}>
              {formatDate(tour.submittedAtMs || tour.updatedAtMs)}
            </span>
          </div>
          <div>
            <span className={styles.metaLabel}>Category</span>
            <span className={styles.metaValue}>
              {tour.category || 'Not set'}
            </span>
          </div>
          <div>
            <span className={styles.metaLabel}>Meeting point</span>
            <span className={styles.metaValue}>
              {tour.meetingPoint || 'Not set'}
            </span>
          </div>
        </div>

        <section className={styles.section} aria-labelledby="review-overview">
          <h3 id="review-overview" className={styles.sectionTitle}>
            Overview
          </h3>
          <p className={styles.description}>
            {tour.description || 'No description provided.'}
          </p>
          <div className={styles.priceRow}>
            <span>
              Adult <strong>{formatMoney(tour.price, 'PHP')}</strong>
            </span>
            <span>
              Child <strong>{formatMoney(tour.childPrice, 'PHP')}</strong>
            </span>
            <span>
              Infant <strong>{formatMoney(tour.infantPrice, 'PHP')}</strong>
            </span>
            <span>
              Min. group <strong>{tour.minGroupSize}</strong>
            </span>
            <span>
              Group discount <strong>{tour.groupDiscount}%</strong>
            </span>
          </div>
        </section>

        {tour.photos.length > 0 && (
          <section className={styles.section} aria-labelledby="review-photos">
            <h3 id="review-photos" className={styles.sectionTitle}>
              Photos
            </h3>
            <div className={styles.photoGrid}>
              {tour.photos.map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={photo}
                  alt={`Tour photo ${index + 1}`}
                  className={styles.photo}
                />
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} aria-labelledby="review-itinerary">
          <h3 id="review-itinerary" className={styles.sectionTitle}>
            Itinerary
          </h3>
          <div className={styles.itinerary}>
            {tour.itinerary.map((day) => (
              <article key={day.day} className={styles.day}>
                <span className={styles.dayPill}>Day {day.day}</span>
                <div className={styles.dayBody}>
                  {day.title && day.title !== `Day ${day.day}` && (
                    <h4 className={styles.dayTitle}>{day.title}</h4>
                  )}
                  <p>{day.text || 'No description.'}</p>
                  {day.location ? (
                    <div className={styles.locationRow}>
                      <span className={styles.location}>
                        {day.location.name}
                        {day.location.address
                          ? ` · ${day.location.address}`
                          : ''}
                      </span>
                      <button
                        type="button"
                        className={styles.mapButton}
                        onClick={() =>
                          setMapItem({
                            ...day,
                            title: `Day ${day.day}`,
                          })
                        }
                      >
                        View map
                      </button>
                    </div>
                  ) : (
                    <span className={styles.missingLocation}>
                      No location pinned
                    </span>
                  )}
                </div>
              </article>
            ))}
            {tour.itinerary.length === 0 && (
              <p className={styles.emptyText}>No itinerary days.</p>
            )}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="review-discounts">
          <h3 id="review-discounts" className={styles.sectionTitle}>
            Discounts and fees
          </h3>
          <div className={styles.chips}>
            <span className={tour.discounts.earlyBird ? styles.chipOn : styles.chipOff}>
              Early bird
            </span>
            <span className={tour.discounts.group ? styles.chipOn : styles.chipOff}>
              Group
            </span>
            <span className={tour.discounts.student ? styles.chipOn : styles.chipOff}>
              Student
            </span>
            <span className={tour.discounts.senior ? styles.chipOn : styles.chipOff}>
              Senior / PWD
            </span>
            <span className={styles.chipNeutral}>{tour.taxesAndFees}</span>
          </div>
        </section>

        {tour.rejectionReason && (
          <p className={styles.rejectionReason}>
            <strong>Previous rejection:</strong> {tour.rejectionReason}
          </p>
        )}

        {rejecting ? (
          <div className={styles.rejectBox}>
            <label className={styles.rejectLabel} htmlFor="tour-rejection-reason">
              Rejection reason
            </label>
            <textarea
              id="tour-rejection-reason"
              className={styles.textarea}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain what the operator needs to change."
              rows="3"
              autoFocus
            />
            <div className={styles.rejectActions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  setRejecting(false);
                  setReason('');
                  setError('');
                }}
                disabled={Boolean(updating)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.danger}
                onClick={() => handleModerate(TOUR_STATUS.rejected, reason)}
                disabled={Boolean(updating)}
              >
                {updating ? 'Rejecting…' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        ) : (
          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
              disabled={Boolean(updating)}
            >
              Close
            </button>
            <div className={styles.actions}>
              {canArchive && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => handleModerate(TOUR_STATUS.archived)}
                  disabled={Boolean(updating)}
                >
                  {updating ? 'Updating…' : 'Archive'}
                </button>
              )}
              {canHide && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => handleModerate(TOUR_STATUS.hidden)}
                  disabled={Boolean(updating)}
                >
                  {updating ? 'Updating…' : 'Hide'}
                </button>
              )}
              {canPublish && (
                <button
                  type="button"
                  className={styles.approve}
                  onClick={() => handleModerate(TOUR_STATUS.published)}
                  disabled={Boolean(updating)}
                >
                  {updating ? 'Updating…' : 'Publish'}
                </button>
              )}
              {canReject && (
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => setRejecting(true)}
                  disabled={Boolean(updating)}
                >
                  Reject
                </button>
              )}
              {canApprove && (
                <button
                  type="button"
                  className={styles.approve}
                  onClick={() => handleModerate(TOUR_STATUS.published)}
                  disabled={Boolean(updating)}
                >
                  {updating ? 'Approving…' : 'Approve'}
                </button>
              )}
            </div>
          </footer>
        )}
      </div>

      {mapItem && (
        <ItineraryMapModal
          item={mapItem}
          onClose={() => setMapItem(null)}
        />
      )}
    </div>
  );
}

export default AdminTourReview;
