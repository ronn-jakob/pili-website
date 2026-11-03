import { useEffect, useMemo, useState } from 'react';
import { getAdminUsers, setAdminUserStatus } from '../../lib/adminUsers';
import styles from './AdminUsersPage.module.css';

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

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    let active = true;

    getAdminUsers()
      .then((items) => {
        if (active) {
          setUsers(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load traveler accounts.');
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

  const visibleUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter(
      (user) =>
        !search ||
        (user.email ?? '').toLowerCase().includes(search) ||
        (user.firstName ?? '').toLowerCase().includes(search) ||
        (user.lastName ?? '').toLowerCase().includes(search),
    );
  }, [users, query]);

  const handleToggle = async (user) => {
    setUpdatingId(user.id);
    setError('');

    try {
      const nextStatus = user.status === 'disabled' ? 'active' : 'disabled';
      await setAdminUserStatus(user.id, nextStatus);
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch (statusError) {
      setError(statusError?.message || 'Could not update this account.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>User Management</span>
          </p>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>
            Review traveler accounts and disable access when needed.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search users</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email…"
          />
        </label>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Loading users…</p>
        ) : visibleUsers.length === 0 ? (
          <p className={styles.empty}>No traveler accounts found.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>
                        {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                          'Traveler'}
                      </strong>
                    </td>
                    <td>{user.email || '—'}</td>
                    <td>{user.phone || '—'}</td>
                    <td>{formatDate(user.createdAtDate)}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          user.status === 'disabled'
                            ? styles.disabled
                            : styles.active
                        }`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          user.status === 'disabled'
                            ? styles.enable
                            : styles.disable
                        }
                        disabled={updatingId === user.id}
                        onClick={() => handleToggle(user)}
                      >
                        {updatingId === user.id
                          ? 'Working…'
                          : user.status === 'disabled'
                            ? 'Enable'
                            : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsersPage;
