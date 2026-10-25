import styles from './BookingsFilters.module.css';

function BookingsFilters({ filters, active, onChange }) {
  return (
    <div className={styles.filters} role="group" aria-label="Filter bookings">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`${styles.filter}${
            filter === active ? ` ${styles.active}` : ''
          }`}
          aria-pressed={filter === active}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default BookingsFilters;
