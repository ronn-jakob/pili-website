import styles from './FeaturedPackages.module.css';
import { Link } from 'react-router-dom';
import Container from '../../../ui/Container/Container';

function FeaturedPackages({ destinations = null }) {
  const remainingDestinations = destinations?.slice(5) ?? [];

  if (!destinations || remainingDestinations.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="featured-packages-title">
      <Container size="page">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>The details, already sorted</p>
            <h2 id="featured-packages-title" className={styles.title}>
              Travel made <span className={styles.accent}>simple</span>
            </h2>
          </div>
          <p className={styles.note}>
            More places to explore, shaped by people who live here.
          </p>
        </div>

        <div className={styles.row}>
          {remainingDestinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/packages?search=${encodeURIComponent(destination.name)}`}
              className={styles.card}
            >
              <img
                src={destination.image}
                alt=""
                className={styles.photo}
              />
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{destination.name}</h3>
                <p className={styles.place}>
                  {destination.province}  ·  {destination.region}
                </p>
                <p className={styles.price}>Explore packages →</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default FeaturedPackages;
