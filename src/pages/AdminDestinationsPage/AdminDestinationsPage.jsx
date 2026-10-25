import { useEffect, useMemo, useState } from 'react';
import AdminDestinationForm from '../../components/sections/admin/AdminDestinationForm/AdminDestinationForm';
import {
  getDestinations,
  getTourCounts,
  setDestinationStatus,
} from '../../lib/destinations';
import styles from './AdminDestinationsPage.module.css';

const statusFilters = ['All', 'Active', 'Inactive'];

function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [tourCounts, setTourCounts] = useState({});
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updatingId, setUpdatingId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [destinationList, counts] = await Promise.all([
        getDestinations(),
        getTourCounts(),
      ]);
      setDestinations(destinationList);
      setTourCounts(counts);
    } catch {
      setError('Could not load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([getDestinations(), getTourCounts()])
      .then(([destinationList, counts]) => {
        if (active) {
          setDestinations(destinationList);
          setTourCounts(counts);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load destinations. Please try again.');
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

  const visibleDestinations = useMemo(() => {
    const search = query.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesFilter =
        activeFilter === 'All'
          ? true
          : destination.status === activeFilter.toLowerCase();
      const matchesQuery =
        !search ||
        destination.name.toLowerCase().includes(search) ||
        destination.region.toLowerCase().includes(search) ||
        destination.province.toLowerCase().includes(search);

      return matchesFilter && matchesQuery;
    });
  }, [destinations, query, activeFilter]);

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    loadData();
  };

  const handleToggleStatus = async (destination) => {
    const nextStatus =
      destination.status === 'active' ? 'inactive' : 'active';
    setUpdatingId(destination.id);

    try {
      await setDestinationStatus(destination.id, nextStatus);
      setDestinations((current) =>
        current.map((item) =>
          item.id === destination.id
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
    } catch {
      setError('Could not update this destination status.');
    } finally {
      setUpdatingId('');
    }
  };

  const nextSortOrder =
    destinations.reduce(
      (highest, destination) => Math.max(highest, destination.sortOrder),
      0,
    ) + 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Destinations</span>
          </p>
          <h1 className={styles.title}>Destinations</h1>
          <p className={styles.subtitle}>
            Create and maintain the destinations tour operators can publish under.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + New destination
        </button>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>
            Search destinations
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.2 16.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destinations…"
          />
        </label>

        <div className={styles.filters} role="group" aria-label="Filter destinations">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.filter}${
                activeFilter === filter ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.tableCard} aria-labelledby="destinations-table-title">
        <div className={styles.tableHeader}>
          <div>
            <h2 id="destinations-table-title" className={styles.tableTitle}>
              All destinations
            </h2>
            <p className={styles.tableSubtitle}>
              {visibleDestinations.length} of {destinations.length} destinations
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Destination</th>
                <th scope="col">Region</th>
                <th scope="col">Province</th>
                <th scope="col">Tours</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className={styles.loading}>
                    Loading destinations…
                  </td>
                </tr>
              )}

              {!loading &&
                visibleDestinations.map((destination) => (
                  <tr key={destination.id}>
                    <td>
                      <div className={styles.destinationCell}>
                        {destination.image ? (
                          <img
                            className={styles.destinationImage}
                            src={destination.image}
                            alt=""
                          />
                        ) : (
                          <span className={styles.initial} aria-hidden="true">
                            {destination.name.charAt(0)}
                          </span>
                        )}
                        <div>
                          <span className={styles.name}>{destination.name}</span>
                          {destination.featured && (
                            <span className={styles.featured}>Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{destination.region || '—'}</td>
                    <td>{destination.province || '—'}</td>
                    <td>{tourCounts[destination.id] ?? 0}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          destination.status === 'active'
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        {destination.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.edit}
                          onClick={() => {
                            setEditing(destination);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.toggle}
                          onClick={() => handleToggleStatus(destination)}
                          disabled={updatingId === destination.id}
                        >
                          {updatingId === destination.id
                            ? 'Updating…'
                            : destination.status === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && visibleDestinations.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No destinations match this search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <AdminDestinationForm
          key={editing?.id ?? 'new'}
          destination={editing}
          nextSortOrder={nextSortOrder}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default AdminDestinationsPage;
