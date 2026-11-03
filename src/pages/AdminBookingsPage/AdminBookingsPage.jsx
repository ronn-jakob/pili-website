import { useEffect, useMemo, useState } from 'react';
import { adminCancelBooking } from '../../lib/paymentApi';
import { getAdminBookings } from '../../lib/operatorBookings';
import { formatLongDate, formatMoney } from '../../utils/booking';
import styles from './AdminBookingsPage.module.css';

const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getAdminBookings()
      .then((items) => {
        if (active) {
          setBookings(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load bookings.');
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

  const counts = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((item) => item.status === 'confirmed').length,
      refunded: bookings.filter((item) => item.paymentStatus === 'refunded')
        .length,
      revenue: bookings
        .filter(
          (item) =>
            item.paymentStatus === 'paid' && item.status !== 'cancelled',
        )
        .reduce((total, item) => total + Number(item.amounts?.total || 0), 0),
    }),
    [bookings],
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
        (booking.travelerSnapshot?.email ?? '')
          .toLowerCase()
          .includes(search) ||
        (booking.operatorId ?? '').toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, query, filter]);

  const handleCancel = async () => {
    if (!cancelling || saving) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await adminCancelBooking(cancelling.id);
      setBookings(await getAdminBookings());
      setCancelling(null);
    } catch (cancelError) {
      setError(cancelError?.message || 'Could not cancel this booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Reservations</span>
          </p>
          <h1 className={styles.title}>Reservation Monitoring</h1>
          <p className={styles.subtitle}>
            Review bookings, payment states and refunds across all operators.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {[
          ['Total bookings', counts.total],
          ['Confirmed', counts.confirmed],
          ['Refunded', counts.refunded],
          ['Paid revenue', formatMoney(counts.revenue, 'PHP')],
        ].map(([label, value]) => (
          <div key={label} className={styles.summaryCard}>
            <span className={styles.summaryValue}>{value}</span>
            <span className={styles.summaryLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search bookings</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Reference, traveler, tour or operator…"
          />
        </label>
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
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Loading bookings…</p>
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
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => {
                  const canCancel =
                    booking.status === 'pending' &&
                    booking.paymentStatus === 'unpaid';

                  return (
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
                      {booking.departureStartAt
                        ? formatLongDate(booking.departureStartAt)
                        : '—'}
                    </td>
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
                    <td>{booking.paymentStatus || 'unpaid'}</td>
                    <td>
                      {canCancel && (
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => setCancelling(booking)}
                        >
                          Cancel / refund
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {cancelling && (
        <div className={styles.overlay} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>Cancel booking</h2>
            <p className={styles.modalText}>
              {cancelling.reference} ·{' '}
              {cancelling.tourSnapshot?.title || 'Tour'}
            </p>
            <p className={styles.modalText}>
              {cancelling.paymentStatus === 'paid'
                ? 'This will issue a Stripe test refund, release capacity and notify the traveler.'
                : 'This will cancel the pending booking, release capacity and notify the traveler.'}
            </p>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.confirm}
                disabled={saving}
                onClick={handleCancel}
              >
                {saving ? 'Processing…' : 'Confirm cancellation'}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setCancelling(null)}
              >
                Keep booking
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;
