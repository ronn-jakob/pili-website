import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PackagesHero.module.css';
import heroImage from '../../../../Images/packages-hero.png';

const categories = [
  'All places',
  'Beaches',
  'Mountains',
  'City Tours',
  'Adventure',
];

function PackagesHero() {
  const [activeCategory, setActiveCategory] = useState('All places');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const destination = String(formData.get('destination') ?? '').trim();
    const budget = formData.get('budget');
    const duration = formData.get('duration');
    const type = formData.get('type');

    if (destination) {
      params.set('search', destination);
    }

    if (budget === 'under-5000') {
      params.set('max', '5000');
    } else if (budget === '5000-10000') {
      params.set('min', '5000');
      params.set('max', '10000');
    } else if (budget === 'over-10000') {
      params.set('min', '10000');
    }

    const durationMap = {
      day: 'Day tour',
      '2-3': '2–3 days',
      '4-7': '4–7 days',
      '8-plus': '8+ days',
    };
    const typeMap = {
      beaches: 'Beaches & Islands',
      mountains: 'Mountains & Hiking',
      city: 'Culture & Heritage',
      adventure: 'Nature & Adventure',
    };

    if (durationMap[duration]) {
      params.set('duration', durationMap[duration]);
    }

    if (typeMap[type]) {
      params.set('category', typeMap[type]);
    }

    navigate(`/packages${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleCategory = (category) => {
    setActiveCategory(category);
    const categoryMap = {
      Beaches: 'Beaches & Islands',
      Mountains: 'Mountains & Hiking',
      'City Tours': 'Culture & Heritage',
      Adventure: 'Nature & Adventure',
    };
    const mapped = categoryMap[category];

    navigate(
      mapped
        ? `/packages?category=${encodeURIComponent(mapped)}`
        : '/packages',
    );
  };

  return (
    <div className={styles.wrap}>
      <section className={styles.hero} aria-labelledby="packages-hero-title">
        <img
          src={heroImage}
          alt=""
          className={styles.background}
          aria-hidden="true"
        />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Pick a package, we&apos;ll handle the rest</p>
          <h1 id="packages-hero-title" className={styles.title}>
            Tour Packages
          </h1>
        </div>
      </section>

      <form className={styles.searchCard} role="search" onSubmit={handleSubmit}>
        <div className={styles.searchHeader}>
          <p className={styles.searchTitle}>Where is your next destination?</p>
          <p className={styles.searchNote}>Good trips start with one small idea</p>
        </div>

        <div className={styles.searchDivider} />

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Destination or country</span>
            <input
              className={styles.fieldInput}
              type="text"
              name="destination"
              placeholder="Try Palawan, Cebu, Bohol..."
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Budget</span>
            <select className={styles.fieldSelect} name="budget" defaultValue="any">
              <option value="any">Any budget</option>
              <option value="under-5000">Under ₱5,000</option>
              <option value="5000-10000">₱5,000 – ₱10,000</option>
              <option value="over-10000">Over ₱10,000</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Trip duration</span>
            <select className={styles.fieldSelect} name="duration" defaultValue="any">
              <option value="any">Any length</option>
              <option value="day">Day tour</option>
              <option value="2-3">2–3 days</option>
              <option value="4-7">4–7 days</option>
              <option value="8-plus">8+ days</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Travel type</span>
            <select className={styles.fieldSelect} name="type" defaultValue="any">
              <option value="any">Any type</option>
              <option value="beaches">Beaches</option>
              <option value="mountains">Mountains</option>
              <option value="city">City Tours</option>
              <option value="adventure">Adventure</option>
            </select>
          </label>

          <button type="submit" className={styles.findButton}>
            Find my place
          </button>
        </div>

        <div className={styles.categoryRow}>
          <span className={styles.categoryLabel}>Browse by category</span>
          <div className={styles.pills}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.pill}${
                  category === activeCategory ? ` ${styles.pillActive}` : ''
                }`}
                aria-pressed={category === activeCategory}
                onClick={() => handleCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default PackagesHero;
