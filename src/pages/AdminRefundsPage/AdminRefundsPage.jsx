import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import {
  getAdminCancellationRequests,
  refundRequestErrorMessage,
  rejectCancellationRequest,
} from '../../lib/cancellationRequests';
import { approveRefundRequest } from '../../lib/paymentApi';
import { formatLongDate, formatMoney } from '../../utils/booking';
import styles from './AdminRefundsPage.module.css';

const filters = ['requested', 'processed', 'rejected', 'all'];

function statusLabel(status) {
  if (status === 'processed') {
    return 'Approved';
  }

  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Requested';
}

function AdminRefundsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('requested');
  const [actionId, setActionId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const loadRequests = async () => {
    setRequests(await getAdminCancellationRequests());
  };

  useEffect(() => {
    let active = true;

    getAdminCancellationRequests()
      .then((items) => {
        if (active) {
          setRequests(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load refund requests.');
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
      requested: requests.filter((item) => item.status === 'requested').length,
      processed: requests.filter((item) => item.status === 'processed').length,
      rejected: requests.filter((item) => item.status === 'rejected').length,
    }),
    [requests],
  );

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesFilter =
        filter === 'all' || request.status === filter;
      const matchesSearch =
        !search ||
        (request.bookingReference ?? '')
          .toLowerCase()
          .includes(search) ||
        (request.travelerId ?? '').toLowerCase().includes(search) ||
        (request.reason ?? '').toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [requests, query, filter]);

  const handleApprove = async (bookingId) => {
    setActionId(bookingId);
    setError('');

    try {
      await approveRefundRequest(bookingId);
      await loadRequests();
    } catch (approveError) {
      setError(
        approveError?.message || 'Could not approve this refund request.',
      );
    } finally {
      setActionId('');
    }
  };

  const handleReject = async (bookingId) => {
    setActionId(bookingId);
    setError('');

    try {
      await rejectCancellationRequest(
        bookingId,
        adminNote,
        auth.currentUser?.uid ?? '',
      );
      setRejectingId('');
      setAdminNote('');
      await loadRequests();
    } catch (rejectError) {
      setError(refundRequestErrorMessage(rejectError));
    } finally {
      setActionId('');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Cancellations & Refunds</span>
          </p>
          <h1 className={styles.title}>Cancellations & Refunds</h1>
          <p className={styles.subtitle}>
            Review customer refund requests before issuing a Stripe test refund.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {[
          ['Pending requests', counts.requested],
          ['Approved', counts.processed],
          ['Rejected', counts.rejected],
          ['Total requests', requests.length],
        ].map(([label, value]) => (
          <div key={label} className={styles.summaryCard}>
            <span className={styles.summaryValue}>{value}</span>
            <span className={styles.summaryLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search refund requests</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, traveler or reason…"
          />
        </label>
        <div className={styles.filters} role="group" aria-label="Filter refund requests">
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
                : value === 'processed'
                  ? 'Approved'
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
          <p className={styles.empty}>Loading refund requests…</p>
        ) : visible.length === 0 ? (
          <p className={styles.empty}>No refund requests match this view.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Reason</th>
                  <th>Amount</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((request) => {
                  const busy = actionId === request.id;

                  return (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.bookingReference || request.bookingId}</strong>
                        <span className={styles.muted}>
                          Traveler: {request.travelerId}
                        </span>
                      </td>
                      <td>{request.reason || '—'}</td>
                      <td>
                        {formatMoney(
                          request.refundAmount ?? 0,
                          'PHP',
                        )}
                      </td>
                      <td>
                        {request.createdAtDate
                          ? formatLongDate(request.createdAtDate)
                          : '—'}
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[request.status] ?? ''
                          }`}
                        >
                          {statusLabel(request.status)}
                        </span>
                        {request.adminNote && (
                          <span className={styles.muted}>
                            {request.adminNote}
                          </span>
                        )}
                      </td>
                      <td>
                        {request.status === 'requested' ? (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.approve}
                              disabled={busy}
                              onClick={() => handleApprove(request.bookingId)}
                            >
                              {busy ? 'Processing…' : 'Approve refund'}
                            </button>
                            <button
                              type="button"
                              className={styles.reject}
                              disabled={busy}
                              onClick={() => {
                                setRejectingId(request.id);
                                setAdminNote('');
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={styles.muted}>Resolved</span>
                        )}

                        {rejectingId === request.id && (
                          <div className={styles.rejectBox}>
                            <label htmlFor={`refund-note-${request.id}`}>
                              Rejection note
                            </label>
                            <textarea
                              id={`refund-note-${request.id}`}
                              rows={2}
                              value={adminNote}
                              onChange={(event) =>
                                setAdminNote(event.target.value)
                              }
                            />
                            <div className={styles.actions}>
                              <button
                                type="button"
                                className={styles.reject}
                                disabled={busy || !adminNote.trim()}
                                onClick={() => handleReject(request.bookingId)}
                              >
                                Confirm rejection
                              </button>
                              <button
                                type="button"
                                className={styles.cancel}
                                onClick={() => setRejectingId('')}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
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
    </div>
  );
}

export default AdminRefundsPage;
