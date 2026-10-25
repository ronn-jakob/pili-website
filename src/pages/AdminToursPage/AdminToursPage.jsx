import { useEffect, useMemo, useState } from 'react';
import AdminTourReview from '../../components/sections/admin/AdminTourReview/AdminTourReview';
import { TOUR_STATUS } from '../../lib/firestoreSchema';
import {
  getTourStatusLabel,
  getToursForModeration,
  moderationErrorMessage,
} from '../../lib/tours';
import styles from './AdminToursPage.module.css';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: TOUR_STATUS.pendingReview, label: 'Pending review' },
  { value: TOUR_STATUS.published, label: 'Published' },
  { value: TOUR_STATUS.rejected, label: 'Rejected' },
  { value: TOUR_STATUS.hidden, label: 'Hidden' },
  { value: TOUR_STATUS.archived, label: 'Archived' },
  { value: TOUR_STATUS.draft, label: 'Draft' },
];

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

function AdminToursPage() {
  const [tours, setTours] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);

  const loadTours = async () => {
    setLoading(true);
    setError('');

    try {
      setTours(await getToursForModeration());
    } catch (loadError) {
      setError(moderationErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getToursForModeration()
      .then((tourList) => {
        if (active) {
          setTours(tourList);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(moderationErrorMessage(loadError));
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

  const counts = useMemo(() => {
    const next = {
      [TOUR_STATUS.pendingReview]: 0,
      [TOUR_STATUS.published]: 0,
      [TOUR_STATUS.rejected]: 0,
      [TOUR_STATUS.hidden]: 0,
      [TOUR_STATUS.archived]: 0,
      [TOUR_STATUS.draft]: 0,
    };

    for (const tour of tours) {
      if (next[tour.status] !== undefined) {
        next[tour.status] += 1;
      }
    }

    return next;
  }, [tours]);

  const visibleTours = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tours.filter((tour) => {
      const matchesFilter =
        activeFilter === 'all' || tour.status === activeFilter;
      const matchesQuery =
        !search ||
        tour.title.toLowerCase().includes(search) ||
        tour.destinationName.toLowerCase().includes(search) ||
        tour.category.toLowerCase().includes(search) ||
        tour.operatorId.toLowerCase().includes(search);

      return matchesFilter && matchesQuery;
    });
  }, [tours, query, activeFilter]);

  const handleModerated = async () => {
    setSelectedTour(null);
    await loadTours();
  };

  const summaryCards = [
    {
      status: TOUR_STATUS.pendingReview,
      label: 'Pending review',
      tone: styles.summaryPending,
    },
    {
      status: TOUR_STATUS.published,
      label: 'Published',
      tone: styles.summaryPublished,
    },
    {
      status: TOUR_STATUS.rejected,
      label: 'Rejected',
      tone: styles.summaryRejected,
    },
    {
      status: TOUR_STATUS.hidden,
      label: 'Hidden',
      tone: styles.summaryHidden,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Tour Packages</span>
          </p>
          <h1 className={styles.title}>Tour Packages</h1>
          <p className={styles.subtitle}>
            Review operator submissions, approve published tours, and moderate
            visibility.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <button
            key={card.status}
            type="button"
            className={`${styles.summaryCard} ${card.tone}${
              activeFilter === card.status ? ` ${styles.summaryActive}` : ''
            }`}
            onClick={() =>
              setActiveFilter((current) =>
                current === card.status ? 'all' : card.status,
              )
            }
          >
            <span className={styles.summaryValue}>{counts[card.status]}</span>
            <span className={styles.summaryLabel}>{card.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search tour packages</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.2 16.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tours, destinations or operators…"
          />
        </label>

        <div className={styles.filters} role="group" aria-label="Filter tours">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`${styles.filter}${
                activeFilter === filter.value ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.tableCard} aria-labelledby="tours-table-title">
        <div className={styles.tableHeader}>
          <div>
            <h2 id="tours-table-title" className={styles.tableTitle}>
              All tour packages
            </h2>
            <p className={styles.tableSubtitle}>
              {visibleTours.length} of {tours.length} tours
            </p>
          </div>
          <button
            type="button"
            className={styles.refresh}
            onClick={loadTours}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Tour</th>
                <th scope="col">Destination</th>
                <th scope="col">Operator</th>
                <th scope="col">Submitted</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className={styles.loading}>
                    Loading tour packages…
                  </td>
                </tr>
              )}

              {!loading &&
                visibleTours.map((tour) => (
                  <tr key={tour.id}>
                    <td>
                      <div className={styles.tourCell}>
                        <span
                          className={`${styles.thumb} ${
                            styles[tour.thumbTone] ?? styles.thumbBlue
                          }`}
                          aria-hidden="true"
                        >
                          {tour.thumbLabel.slice(0, 2)}
                        </span>
                        <div>
                          <span className={styles.name}>{tour.title}</span>
                          <span className={styles.meta}>
                            {tour.duration} · {tour.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{tour.destinationName || '—'}</td>
                    <td>
                      <span title={tour.operatorId}>
                        {tour.operatorId
                          ? `Operator ${tour.operatorId.slice(0, 8)}…`
                          : '—'}
                      </span>
                    </td>
                    <td>{formatDate(tour.submittedAtMs || tour.updatedAtMs)}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          statusClasses[tour.status] ?? styles.draft
                        }`}
                      >
                        {getTourStatusLabel(tour.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.review}
                        onClick={() => setSelectedTour(tour)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && visibleTours.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No tour packages match this search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTour && (
        <AdminTourReview
          key={selectedTour.id}
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onModerated={handleModerated}
        />
      )}
    </div>
  );
}

export default AdminToursPage;
