import { useEffect, useMemo, useState } from 'react';
import {
  adminDepartureErrorMessage,
  cancelAdminDeparture,
  getAdminDepartures,
} from '../../lib/adminDepartures';
import styles from './AdminDeparturesPage.module.css';

const statusFilters = ['all', 'scheduled', 'full', 'completed', 'cancelled'];

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
}

function AdminDeparturesPage() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDepartures = async () => {
    setDepartures(await getAdminDepartures());
  };

  useEffect(() => {
    let active = true;

    getAdminDepartures()
      .then((items) => {
        if (active) {
          setDepartures(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load departures.');
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
      total: departures.length,
      scheduled: departures.filter((item) => item.status === 'scheduled').length,
      full: departures.filter((item) => item.status === 'full').length,
      cancelled: departures.filter((item) => item.status === 'cancelled').length,
    }),
    [departures],
  );

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return departures.filter((departure) => {
      const matchesFilter =
        filter === 'all' || departure.status === filter;
      const matchesSearch =
        !search ||
        departure.tourTitle.toLowerCase().includes(search) ||
        departure.operatorName.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [departures, query, filter]);

  const handleCancel = async () => {
    if (!cancelling || saving) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await cancelAdminDeparture(cancelling.id, reason);
      setCancelling(null);
      setReason('');
      await loadDepartures();
    } catch (cancelError) {
      setError(adminDepartureErrorMessage(cancelError));
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
            <span>Schedule Oversight</span>
          </p>
          <h1 className={styles.title}>Schedule Oversight</h1>
          <p className={styles.subtitle}>
            Monitor all tour departures, capacity and cancellations.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {[
          ['Total departures', counts.total],
          ['Scheduled', counts.scheduled],
          ['Full', counts.full],
          ['Cancelled', counts.cancelled],
        ].map(([label, value]) => (
          <div key={label} className={styles.summaryCard}>
            <span className={styles.summaryValue}>{value}</span>
            <span className={styles.summaryLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search departures</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tour or operator…"
          />
        </label>
        <div className={styles.filters} role="group" aria-label="Filter departures">
          {statusFilters.map((value) => (
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
          <p className={styles.empty}>Loading departures…</p>
        ) : visible.length === 0 ? (
          <p className={styles.empty}>No departures match this view.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Operator</th>
                  <th>Dates</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((departure) => (
                  <tr key={departure.id}>
                    <td>
                      <strong>{departure.tourTitle}</strong>
                      {departure.cancellationReason && (
                        <span className={styles.muted}>
                          {departure.cancellationReason}
                        </span>
                      )}
                    </td>
                    <td>{departure.operatorName}</td>
                    <td>
                      {formatDate(departure.startAtDate)} –{' '}
                      {formatDate(departure.endAtDate)}
                    </td>
                    <td>
                      {departure.bookedTravelers} / {departure.capacity}
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[departure.status] ?? ''}`}>
                        {departure.status}
                      </span>
                    </td>
                    <td>
                      {(departure.status === 'scheduled' ||
                        departure.status === 'full') && (
                        <button
                          type="button"
                          className={styles.cancel}
                          onClick={() => {
                            setCancelling(departure);
                            setReason('');
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {cancelling && (
        <div className={styles.overlay} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>Cancel departure</h2>
            <p className={styles.modalText}>
              {cancelling.tourTitle} · {formatDate(cancelling.startAtDate)}
            </p>
            <label className={styles.field}>
              <span>Cancellation reason</span>
              <textarea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.confirm}
                disabled={saving || !reason.trim()}
                onClick={handleCancel}
              >
                {saving ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => setCancelling(null)}
              >
                Keep departure
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDeparturesPage;
