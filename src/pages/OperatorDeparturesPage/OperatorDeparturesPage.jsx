import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import OperatorDepartureForm from '../../components/sections/operator/OperatorDepartureForm/OperatorDepartureForm';
import { useOperatorTours } from '../../context/useOperatorTours';
import {
  cancelDeparture,
  departureErrorMessage,
  getDeparturesForTour,
} from '../../lib/departures';
import { DEPARTURE_STATUS } from '../../lib/firestoreSchema';
import styles from './OperatorDeparturesPage.module.css';

const statusLabels = {
  [DEPARTURE_STATUS.scheduled]: 'Scheduled',
  [DEPARTURE_STATUS.full]: 'Full',
  [DEPARTURE_STATUS.completed]: 'Completed',
  [DEPARTURE_STATUS.cancelled]: 'Cancelled',
};

const statusClasses = {
  [DEPARTURE_STATUS.scheduled]: styles.scheduled,
  [DEPARTURE_STATUS.full]: styles.full,
  [DEPARTURE_STATUS.completed]: styles.completed,
  [DEPARTURE_STATUS.cancelled]: styles.cancelled,
};

function formatDate(date) {
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(date) {
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function OperatorDeparturesPage() {
  const { tourId } = useParams();
  const { getTour, loading: toursLoading } = useOperatorTours();
  const tour = getTour(tourId);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingSaving, setCancellingSaving] = useState(false);

  const loadDepartures = async () => {
    setLoading(true);
    setError('');

    try {
      setDepartures(await getDeparturesForTour(tourId));
    } catch (loadError) {
      setError(departureErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getDeparturesForTour(tourId)
      .then((items) => {
        if (active) {
          setDepartures(items);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(departureErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [tourId]);

  const stats = useMemo(() => {
    const activeDepartures = departures.filter(
      (departure) =>
        departure.status === DEPARTURE_STATUS.scheduled ||
        departure.status === DEPARTURE_STATUS.full,
    );

    return {
      total: departures.length,
      upcoming: activeDepartures.length,
      capacity: departures.reduce(
        (total, departure) => total + departure.capacity,
        0,
      ),
      booked: departures.reduce(
        (total, departure) => total + departure.bookedTravelers,
        0,
      ),
    };
  }, [departures]);

  if (toursLoading || loading) {
    return (
      <div className={styles.loadingPage} role="status">
        Loading departures…
      </div>
    );
  }

  if (!tour) {
    return <Navigate to="/operator/tours" replace />;
  }

  const canSchedule = tour.status === 'published';

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    loadDepartures();
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Enter a reason for cancelling this departure.');
      return;
    }

    setCancellingSaving(true);
    setError('');

    try {
      await cancelDeparture(cancelling.id, cancelReason);
      setCancelling(null);
      setCancelReason('');
      await loadDepartures();
    } catch (cancelError) {
      setError(departureErrorMessage(cancelError));
    } finally {
      setCancellingSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <Link to="/operator/tours">Tour Packages</Link>
            <span aria-hidden="true">/</span>
            <span>Departures</span>
          </p>
          <h1 className={styles.title}>{tour.title}</h1>
          <p className={styles.subtitle}>
            Manage scheduled dates, meeting points and capacity.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/operator/tours" className={styles.back}>
            Back to tours
          </Link>
          <button
            type="button"
            className={styles.add}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            disabled={!canSchedule}
          >
            + Add departure
          </button>
        </div>
      </header>

      {!canSchedule && (
        <p className={styles.notice}>
          This tour is not published. Publish it through admin review before
          adding new departures.
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Departures</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.upcoming}</span>
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.capacity}</span>
          <span className={styles.statLabel}>Total slots</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.booked}</span>
          <span className={styles.statLabel}>Booked</span>
        </div>
      </div>

      <section className={styles.tableCard} aria-labelledby="departures-title">
        <div className={styles.tableHeader}>
          <div>
            <h2 id="departures-title" className={styles.tableTitle}>
              Departure schedule
            </h2>
            <p className={styles.tableSubtitle}>
              {departures.length} scheduled records
            </p>
          </div>
          <button
            type="button"
            className={styles.refresh}
            onClick={loadDepartures}
          >
            Refresh
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Meeting point</th>
                <th scope="col">Capacity</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departures.map((departure) => {
                const percent = departure.capacity
                  ? Math.min(
                      100,
                      Math.round(
                        (departure.bookedTravelers / departure.capacity) * 100,
                      ),
                    )
                  : 0;
                const canEdit =
                  departure.status === DEPARTURE_STATUS.scheduled;
                const canCancel =
                  departure.status === DEPARTURE_STATUS.scheduled ||
                  departure.status === DEPARTURE_STATUS.full;

                return (
                  <tr key={departure.id}>
                    <td>
                      <span className={styles.date}>
                        {formatDate(departure.startAt)}
                      </span>
                      <span className={styles.endDate}>
                        to {formatDate(departure.endAt)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.time}>
                        {departure.meetingTime || formatTime(departure.startAt)}
                      </span>
                      <span className={styles.endDate}>meeting time</span>
                    </td>
                    <td>
                      <span className={styles.meeting}>
                        {departure.meetingPointName || 'Not pinned'}
                      </span>
                      {departure.meetingPointAddress && (
                        <span className={styles.endDate}>
                          {departure.meetingPointAddress}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={styles.capacity}>
                        {departure.bookedTravelers} / {departure.capacity}
                      </span>
                      <div className={styles.capacityBar}>
                        <span style={{ width: `${percent}%` }} />
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          statusClasses[departure.status] ?? styles.scheduled
                        }`}
                      >
                        {statusLabels[departure.status] ?? 'Scheduled'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {canEdit && (
                          <button
                            type="button"
                            className={styles.edit}
                            onClick={() => {
                              setEditing(departure);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            className={styles.cancel}
                            onClick={() => {
                              setCancelling(departure);
                              setCancelReason('');
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        {!canEdit && !canCancel && '—'}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {departures.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No departures yet. Add the first scheduled date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <OperatorDepartureForm
          key={editing?.id ?? 'new'}
          tour={tour}
          departure={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {cancelling && (
        <div className={styles.cancelOverlay} role="presentation">
          <div
            className={styles.cancelPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-departure-title"
          >
            <h2 id="cancel-departure-title" className={styles.cancelTitle}>
              Cancel departure
            </h2>
            <p className={styles.cancelText}>
              {formatDate(cancelling.startAt)} · {cancelling.meetingTime}
            </p>
            <label className={styles.field}>
              <span className={styles.label}>Cancellation reason</span>
              <textarea
                className={styles.textarea}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows="3"
                autoFocus
              />
            </label>
            <div className={styles.cancelActions}>
              <button
                type="button"
                className={styles.edit}
                onClick={() => setCancelling(null)}
                disabled={cancellingSaving}
              >
                Keep departure
              </button>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={handleCancel}
                disabled={cancellingSaving}
              >
                {cancellingSaving ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorDeparturesPage;
