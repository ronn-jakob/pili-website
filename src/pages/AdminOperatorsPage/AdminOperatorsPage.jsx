import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import {
  approveOperatorApplication,
  getOperatorApplications,
  getOperators,
  operatorAdminErrorMessage,
  rejectOperatorApplication,
  setOperatorSuspended,
} from '../../lib/operators';
import styles from './AdminOperatorsPage.module.css';

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

function statusClass(status, stylesMap) {
  return stylesMap[status] ?? stylesMap.pending;
}

const statusClasses = {
  pending: styles.pending,
  approved: styles.approved,
  rejected: styles.rejected,
  active: styles.approved,
  suspended: styles.rejected,
};

function AdminOperatorsPage() {
  const [applications, setApplications] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [filter, setFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    const [nextApplications, nextOperators] = await Promise.all([
      getOperatorApplications(),
      getOperators(),
    ]);
    setApplications(nextApplications);
    setOperators(nextOperators);
  };

  useEffect(() => {
    let active = true;

    Promise.all([getOperatorApplications(), getOperators()])
      .then(([nextApplications, nextOperators]) => {
        if (active) {
          setApplications(nextApplications);
          setOperators(nextOperators);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(operatorAdminErrorMessage(loadError));
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
      pending: applications.filter((item) => item.status === 'pending').length,
      approved: applications.filter((item) => item.status === 'approved')
        .length,
      rejected: applications.filter((item) => item.status === 'rejected')
        .length,
      operators: operators.length,
    }),
    [applications, operators],
  );

  const visibleApplications = useMemo(
    () =>
      applications.filter(
        (item) => filter === 'all' || item.status === filter,
      ),
    [applications, filter],
  );

  const handleApprove = async (applicationId) => {
    setActionId(applicationId);
    setError('');

    try {
      await approveOperatorApplication(
        applicationId,
        auth.currentUser?.uid ?? '',
      );
      await loadData();
    } catch (approveError) {
      setError(operatorAdminErrorMessage(approveError));
    } finally {
      setActionId('');
    }
  };

  const handleReject = async (applicationId) => {
    setActionId(applicationId);
    setError('');

    try {
      await rejectOperatorApplication(
        applicationId,
        reason,
        auth.currentUser?.uid ?? '',
      );
      setRejectingId('');
      setReason('');
      await loadData();
    } catch (rejectError) {
      setError(operatorAdminErrorMessage(rejectError));
    } finally {
      setActionId('');
    }
  };

  const handleOperatorStatus = async (operatorId, suspended) => {
    setActionId(operatorId);
    setError('');

    try {
      await setOperatorSuspended(operatorId, suspended);
      await loadData();
    } catch (statusError) {
      setError(operatorAdminErrorMessage(statusError));
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
            <span>Operators</span>
          </p>
          <h1 className={styles.title}>Operator Management</h1>
          <p className={styles.subtitle}>
            Review traveler applications, approve operator access and manage
            active operators.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {[
          ['pending', 'Pending applications'],
          ['approved', 'Approved applications'],
          ['rejected', 'Rejected applications'],
          ['operators', 'Operator accounts'],
        ].map(([key, label]) => (
          <div key={key} className={styles.summaryCard}>
            <span className={styles.summaryValue}>{counts[key]}</span>
            <span className={styles.summaryLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filter applications">
          {['pending', 'approved', 'rejected', 'all'].map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.filter}${
                filter === value ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.tableCard} aria-labelledby="applications-title">
        <h2 id="applications-title" className={styles.sectionTitle}>
          Applications
        </h2>
        {loading ? (
          <p className={styles.empty}>Loading applications…</p>
        ) : visibleApplications.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((application) => {
                  const busy = actionId === application.id;

                  return (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.businessName}</strong>
                        <span className={styles.muted}>
                          {application.description}
                        </span>
                      </td>
                      <td>
                        <strong>{application.contactName}</strong>
                        <span className={styles.muted}>
                          {application.contactEmail}
                          <br />
                          {application.contactPhone}
                        </span>
                      </td>
                      <td>{formatDate(application.submittedAt?.toDate?.())}</td>
                      <td>
                        <span
                          className={`${styles.status} ${statusClass(
                            application.status,
                            statusClasses,
                          )}`}
                        >
                          {application.status}
                        </span>
                        {application.rejectionReason && (
                          <span className={styles.muted}>
                            {application.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td>
                        {application.status === 'pending' ? (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.approve}
                              disabled={busy}
                              onClick={() => handleApprove(application.id)}
                            >
                              {busy ? 'Working…' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className={styles.reject}
                              disabled={busy}
                              onClick={() => {
                                setRejectingId(application.id);
                                setReason('');
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={styles.muted}>Reviewed</span>
                        )}

                        {rejectingId === application.id && (
                          <div className={styles.rejectBox}>
                            <label htmlFor={`reject-${application.id}`}>
                              Rejection reason
                            </label>
                            <textarea
                              id={`reject-${application.id}`}
                              rows={2}
                              value={reason}
                              onChange={(event) => setReason(event.target.value)}
                            />
                            <div className={styles.actions}>
                              <button
                                type="button"
                                className={styles.reject}
                                disabled={busy || !reason.trim()}
                                onClick={() => handleReject(application.id)}
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
        ) : (
          <p className={styles.empty}>No applications match this filter.</p>
        )}
      </section>

      <section className={styles.tableCard} aria-labelledby="operators-title">
        <h2 id="operators-title" className={styles.sectionTitle}>
          Operator accounts
        </h2>
        {operators.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => {
                  const busy = actionId === operator.id;
                  const suspended = operator.status === 'suspended';

                  return (
                    <tr key={operator.id}>
                      <td>
                        <strong>{operator.businessName || operator.email}</strong>
                      </td>
                      <td>
                        <span className={styles.muted}>
                          {operator.contactName || '—'}
                          <br />
                          {operator.email || '—'}
                        </span>
                      </td>
                      <td>{formatDate(operator.joinedAt?.toDate?.())}</td>
                      <td>
                        <span
                          className={`${styles.status} ${statusClass(
                            suspended ? 'suspended' : 'active',
                            statusClasses,
                          )}`}
                        >
                          {suspended ? 'suspended' : 'active'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={suspended ? styles.approve : styles.reject}
                          disabled={busy}
                          onClick={() =>
                            handleOperatorStatus(operator.id, !suspended)
                          }
                        >
                          {suspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No operator accounts yet.</p>
        )}
      </section>
    </div>
  );
}

export default AdminOperatorsPage;
