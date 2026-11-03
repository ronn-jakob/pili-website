import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import {
  approveBookingChange,
  getOperatorBookingChanges,
  rejectBookingChange,
} from '../../lib/bookingChanges';
import { getOperatorBookings } from '../../lib/operatorBookings';
import { formatLongDate, formatMoney } from '../../utils/booking';
import styles from './OperatorReservationsPage.module.css';

const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function formatDateRange(start, end) {
  if (!start) {
    return 'Date to be confirmed';
  }

  return end
    ? `${formatLongDate(start)} – ${formatLongDate(end)}`
    : formatLongDate(start);
}

function partyLabel(travelers = {}) {
  const parts = [];
  const adults = Number(travelers.adults) || 0;
  const children = Number(travelers.children) || 0;
  const infants = Number(travelers.infants) || 0;

  if (adults) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children) parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  if (infants) parts.push(`${infants} infant${infants === 1 ? '' : 's'}`);

  return parts.join(', ') || '—';
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function OperatorReservationsPage() {
  const [bookings, setBookings] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionId, setActionId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadReservations = async () => {
    const uid = auth.currentUser?.uid ?? '';
    const [nextBookings, nextChanges] = await Promise.all([
      getOperatorBookings(uid),
      getOperatorBookingChanges(uid),
    ]);
    setBookings(nextBookings);
    setChanges(nextChanges);
  };

  useEffect(() => {
    let active = true;
    const uid = auth.currentUser?.uid ?? '';

    Promise.all([
      getOperatorBookings(uid),
      getOperatorBookingChanges(uid),
    ])
      .then(([nextBookings, nextChanges]) => {
        if (active) {
          setBookings(nextBookings);
          setChanges(nextChanges);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load reservations.');
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
  }, []);

  const requestedChanges = useMemo(
    () => changes.filter((item) => item.status === 'requested'),
    [changes],
  );

  const visibleBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesFilter =
        filter === 'all' || booking.status === filter;
      const matchesSearch =
        !search ||
        (booking.reference ?? '').toLowerCase().includes(search) ||
        (booking.tourSnapshot?.title ?? '').toLowerCase().includes(search) ||
        (booking.travelerSnapshot?.firstName ?? '')
          .toLowerCase()
          .includes(search) ||
        (booking.travelerSnapshot?.lastName ?? '')
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, query, filter]);

  const manifestGroups = useMemo(() => {
    const groups = new Map();

    for (const booking of bookings) {
      if (booking.status === 'cancelled') {
        continue;
      }

      const key = booking.departureId;
      const current = groups.get(key) ?? {
        departureId: key,
        startAt: booking.departureStartAt,
        endAt: booking.departureEndAt,
        tourTitle: booking.tourSnapshot?.title ?? 'Tour',
        bookings: [],
      };
      current.bookings.push(booking);
      groups.set(key, current);
    }

    return [...groups.values()].sort(
      (first, second) =>
        (first.startAt?.getTime() ?? 0) - (second.startAt?.getTime() ?? 0),
    );
  }, [bookings]);

  const handleApproveChange = async (requestId) => {
    setActionId(requestId);
    setError('');

    try {
      await approveBookingChange(requestId, auth.currentUser?.uid ?? '');
      await loadReservations();
    } catch (approveError) {
      setError(approveError?.message || 'Could not approve the change.');
    } finally {
      setActionId('');
    }
  };

  const handleRejectChange = async (requestId) => {
    setActionId(requestId);
    setError('');

    try {
      await rejectBookingChange(
        requestId,
        rejectionReason,
        auth.currentUser?.uid ?? '',
      );
      setRejectingId('');
      setRejectionReason('');
      await loadReservations();
    } catch (rejectError) {
      setError(rejectError?.message || 'Could not reject the change.');
    } finally {
      setActionId('');
    }
  };

  const handleManifestCsv = (group) => {
    const rows = [
      ['Booking', 'Lead traveler', 'Email', 'Phone', 'Party', 'Status'],
      ...group.bookings.map((booking) => [
        booking.reference,
        `${booking.travelerSnapshot?.firstName ?? ''} ${
          booking.travelerSnapshot?.lastName ?? ''
        }`.trim(),
        booking.travelerSnapshot?.email ?? '',
        booking.travelerSnapshot?.mobile ?? '',
        partyLabel(booking.travelers),
        booking.status,
      ]),
    ];
    downloadCsv(
      `manifest-${group.tourTitle.replaceAll(' ', '-').toLowerCase()}-${
        group.startAt?.toISOString?.().slice(0, 10) ?? 'departure'
      }.csv`,
      rows,
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Organizer</span>
            <span aria-hidden="true">/</span>
            <span>Reservations</span>
          </p>
          <h1 className={styles.title}>Reservations</h1>
          <p className={styles.subtitle}>
            Review bookings, departure manifests and traveler change requests.
          </p>
        </div>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.panel} aria-labelledby="changes-title">
        <h2 id="changes-title" className={styles.sectionTitle}>
          Departure change requests
        </h2>
        {requestedChanges.length === 0 ? (
          <p className={styles.empty}>No pending change requests.</p>
        ) : (
          <div className={styles.changeList}>
            {requestedChanges.map((change) => {
              const busy = actionId === change.id;
              return (
                <article key={change.id} className={styles.changeCard}>
                  <div>
                    <strong>{change.bookingReference || change.bookingId}</strong>
                    <p>
                      Move to{' '}
                      {formatDateRange(
                        change.toDepartureSnapshot?.startAt?.toDate?.() ??
                          change.toDepartureSnapshot?.startAt,
                        change.toDepartureSnapshot?.endAt?.toDate?.() ??
                          change.toDepartureSnapshot?.endAt,
                      )}
                    </p>
                    {change.reason && (
                      <p className={styles.muted}>{change.reason}</p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.approve}
                      disabled={busy}
                      onClick={() => handleApproveChange(change.id)}
                    >
                      {busy ? 'Working…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className={styles.reject}
                      disabled={busy}
                      onClick={() => {
                        setRejectingId(change.id);
                        setRejectionReason('');
                      }}
                    >
                      Reject
                    </button>
                  </div>
                  {rejectingId === change.id && (
                    <div className={styles.rejectBox}>
                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        placeholder="Reason for rejecting this change"
                      />
                      <button
                        type="button"
                        className={styles.reject}
                        disabled={busy || !rejectionReason.trim()}
                        onClick={() => handleRejectChange(change.id)}
                      >
                        Confirm rejection
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="bookings-title">
        <div className={styles.panelHeader}>
          <h2 id="bookings-title" className={styles.sectionTitle}>
            Bookings
          </h2>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>Search bookings</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reference, traveler or tour…"
            />
          </label>
        </div>

        <div className={styles.filters} role="group" aria-label="Filter bookings">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.filter}${
                filter === value ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === 'all'
                ? 'All'
                : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className={styles.empty}>Loading reservations…</p>
        ) : visibleBookings.length === 0 ? (
          <p className={styles.empty}>No bookings match this view.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Traveler</th>
                  <th>Tour</th>
                  <th>Departure</th>
                  <th>Party</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.reference}</td>
                    <td>
                      <strong>
                        {`${booking.travelerSnapshot?.firstName ?? ''} ${
                          booking.travelerSnapshot?.lastName ?? ''
                        }`.trim() || '—'}
                      </strong>
                      <span className={styles.muted}>
                        {booking.travelerSnapshot?.email ?? ''}
                      </span>
                    </td>
                    <td>{booking.tourSnapshot?.title ?? 'Tour'}</td>
                    <td>
                      {formatDateRange(
                        booking.departureStartAt,
                        booking.departureEndAt,
                      )}
                    </td>
                    <td>{partyLabel(booking.travelers)}</td>
                    <td>
                      {formatMoney(
                        booking.amounts?.total ?? 0,
                        booking.amounts?.currency || 'PHP',
                      )}
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[booking.status] ?? ''}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="manifest-title">
        <h2 id="manifest-title" className={styles.sectionTitle}>
          Departure manifests
        </h2>
        {manifestGroups.length === 0 ? (
          <p className={styles.empty}>No active departure manifests yet.</p>
        ) : (
          <div className={styles.manifestList}>
            {manifestGroups.map((group) => (
              <details key={group.departureId} className={styles.manifest}>
                <summary>
                  <span>
                    <strong>{group.tourTitle}</strong>
                    <span className={styles.muted}>
                      {formatDateRange(group.startAt, group.endAt)} ·{' '}
                      {group.bookings.length} booking
                      {group.bookings.length === 1 ? '' : 's'}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={styles.csv}
                    onClick={(event) => {
                      event.preventDefault();
                      handleManifestCsv(group);
                    }}
                  >
                    Download CSV
                  </button>
                </summary>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Lead traveler</th>
                        <th>Party</th>
                        <th>Contact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.reference}</td>
                          <td>
                            {`${booking.travelerSnapshot?.firstName ?? ''} ${
                              booking.travelerSnapshot?.lastName ?? ''
                            }`.trim() || '—'}
                          </td>
                          <td>{partyLabel(booking.travelers)}</td>
                          <td>
                            {booking.travelerSnapshot?.mobile ||
                              booking.travelerSnapshot?.email ||
                              '—'}
                          </td>
                          <td>{booking.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OperatorReservationsPage;
