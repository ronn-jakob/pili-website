import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOperatorTours } from '../../context/useOperatorTours';
import { TOUR_STATUS } from '../../lib/firestoreSchema';
import { getTourStatusLabel } from '../../lib/tours';
import { formatMoney } from '../../utils/booking';
import styles from './OperatorToursPage.module.css';

const filters = [
  { value: 'all', label: 'All packages' },
  { value: TOUR_STATUS.draft, label: 'Draft' },
  { value: TOUR_STATUS.pendingReview, label: 'Pending review' },
  { value: TOUR_STATUS.published, label: 'Published' },
  { value: TOUR_STATUS.rejected, label: 'Rejected' },
  { value: TOUR_STATUS.hidden, label: 'Hidden' },
  { value: TOUR_STATUS.archived, label: 'Archived' },
];

const statusClasses = {
  [TOUR_STATUS.draft]: styles.draft,
  [TOUR_STATUS.pendingReview]: styles.pendingReview,
  [TOUR_STATUS.published]: styles.published,
  [TOUR_STATUS.rejected]: styles.rejected,
  [TOUR_STATUS.hidden]: styles.hidden,
  [TOUR_STATUS.archived]: styles.archived,
};

function OperatorToursPage() {
  const { tours, loading, error } = useOperatorTours();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const visibleTours = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tours.filter((tour) => {
      const matchesFilter =
        activeFilter === 'all' || tour.status === activeFilter;
      const matchesQuery =
        !search ||
        tour.title.toLowerCase().includes(search) ||
        tour.destination.toLowerCase().includes(search);

      return matchesFilter && matchesQuery;
    });
  }, [tours, query, activeFilter]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Organizer</span>
            <span aria-hidden="true">/</span>
            <span>Tour Packages</span>
          </p>
          <h1 className={styles.title}>Tour Packages</h1>
          <p className={styles.subtitle}>
            Create and manage the experiences you offer to travelers.
          </p>
        </div>

        <Link to="/operator/tours/new" className={styles.addTour}>
          + Add Tour
        </Link>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search tour packages</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m16.2 16.2 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tour packages…"
          />
        </label>

        <div className={styles.filters} role="group" aria-label="Filter tours">
          {filters.map((filter) => (
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

      <section className={styles.listSection} aria-labelledby="your-tours">
        <h2 id="your-tours" className={styles.listTitle}>
          Your tour packages
        </h2>

        {loading && (
          <p className={styles.empty} role="status">
            Loading your tours…
          </p>
        )}

        {!loading && error && (
          <p className={`${styles.empty} ${styles.error}`} role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className={styles.list}>
            {visibleTours.map((tour) => {
              const locked =
                tour.status === TOUR_STATUS.pendingReview ||
                tour.status === TOUR_STATUS.archived;

              return (
                <article key={tour.id} className={styles.row}>
                  <div
                    className={`${styles.thumb} ${styles[tour.thumbTone]}`}
                    aria-hidden="true"
                  >
                    {tour.thumbLabel}
                  </div>

                  <div className={styles.body}>
                    <div className={styles.info}>
                      <h3 className={styles.tourTitle}>{tour.title}</h3>
                      <p className={styles.summary}>{tour.summary}</p>
                      <p className={styles.meta}>
                        <span className={styles.price}>
                          {formatMoney(tour.price, 'PHP')}
                        </span>
                        <span className={styles.bookings}>
                          {tour.bookings > 0
                            ? `${tour.bookings} bookings`
                            : 'No bookings yet'}
                        </span>
                      </p>
                    </div>

                    <div className={styles.actions}>
                      <span
                        className={`${styles.status} ${
                          statusClasses[tour.status] ?? styles.draft
                        }`}
                      >
                        {getTourStatusLabel(tour.status)}
                      </span>

                      {tour.status === TOUR_STATUS.published && (
                        <Link
                          to={`/operator/tours/${tour.id}/departures`}
                          className={styles.departures}
                        >
                          Departures
                        </Link>
                      )}

                      <Link
                        to={`/operator/tours/${tour.id}/edit`}
                        className={styles.edit}
                      >
                        {locked ? 'View Tour' : 'Edit Tour'}
                      </Link>

                      <button
                        type="button"
                        className={styles.more}
                        aria-label={`More options for ${tour.title}`}
                      >
                        ···
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {tours.length === 0 && (
              <div className={styles.empty}>
                <p>You have no tour packages yet.</p>
                <Link
                  to="/operator/tours/new"
                  className={styles.emptyLink}
                >
                  Create your first tour
                </Link>
              </div>
            )}

            {tours.length > 0 && visibleTours.length === 0 && (
              <p className={styles.empty}>
                No tour packages match this search or filter.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default OperatorToursPage;
