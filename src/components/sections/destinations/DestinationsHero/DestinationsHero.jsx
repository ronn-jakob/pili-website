import styles from './DestinationsHero.module.css';
import heroImage from '../../../../Images/destinations-hero.png';

function DestinationsHero() {
  const handleSubmit = (event) => {
    // Search will be wired to real data once the backend exists.
    event.preventDefault();
  };

  return (
    <section className={styles.hero} aria-labelledby="destinations-hero-title">
      <img
        src={heroImage}
        alt=""
        className={styles.background}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>Choose your vacation</p>
        <h1 id="destinations-hero-title" className={styles.title}>
          Choose the
          <br />
          Philippines
        </h1>
        <p className={styles.subtitle}>
          Find a place you will love, from a quiet island beach to a mountain
          town above the clouds.
        </p>

        <form className={styles.search} role="search" onSubmit={handleSubmit}>
          <label htmlFor="destinations-search" className={styles.label}>
            Destination
          </label>
          <input
            id="destinations-search"
            type="text"
            name="destination"
            className={styles.searchInput}
            placeholder="Baguio"
            autoComplete="off"
          />
          <button
            type="submit"
            className={styles.searchButton}
            aria-label="Search destinations"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16.5"
              height="16.5"
              viewBox="0 0 18.6 18.6"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M17.8 17.8L13.7866 13.7794M13.7866 13.7794L13.7862 13.7791M13.7866 13.7794C15.2106 12.3535 16.0105 10.4206 16.0105 8.40526C16.0105 6.38822 15.2093 4.45379 13.783 3.02753C12.3567 1.60127 10.4223 0.8 8.40526 0.8C6.38822 0.8 4.45379 1.60127 3.02753 3.02753C1.60127 4.45379 0.8 6.38822 0.8 8.40526C0.8 10.4223 1.60127 12.3567 3.02753 13.783C4.45379 15.2093 6.38822 16.0105 8.40526 16.0105C10.4223 16.0105 12.3567 15.2093 13.783 13.783C13.7842 13.7818 13.7854 13.7806 13.7866 13.7794Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

export default DestinationsHero;
