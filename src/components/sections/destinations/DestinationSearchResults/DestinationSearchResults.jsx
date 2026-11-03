import { Link } from 'react-router-dom';
import Container from '../../../ui/Container/Container';
import styles from './DestinationSearchResults.module.css';

function DestinationSearchResults({
  destinations = [],
  query,
  loading = false,
}) {
  return (
    <section className={styles.section} aria-labelledby="destination-results-title">
      <Container size="page">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Search results</p>
            <h2 id="destination-results-title" className={styles.title}>
              Destinations matching “{query}”
            </h2>
          </div>
          <Link to="/destinations" className={styles.clear}>
            Clear search
          </Link>
        </div>

        {loading ? (
          <p className={styles.empty}>Searching destinations…</p>
        ) : destinations.length === 0 ? (
          <div className={styles.emptyCard}>
            <h3>No destinations found.</h3>
            <p>Try another province, region or destination name.</p>
            <Link to="/destinations" className={styles.clearButton}>
              Show all destinations
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/packages?search=${encodeURIComponent(destination.name)}`}
                className={styles.card}
              >
                <img
                  src={destination.image}
                  alt=""
                  className={styles.image}
                />
                <div className={styles.body}>
                  <p className={styles.region}>
                    {destination.region} · {destination.province}
                  </p>
                  <h3 className={styles.cardTitle}>{destination.name}</h3>
                  <p className={styles.description}>
                    {destination.description || 'Explore this destination.'}
                  </p>
                  <span className={styles.explore}>Explore packages →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export default DestinationSearchResults;
