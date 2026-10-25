import { useEffect, useRef, useState } from 'react';
import styles from './Destinations.module.css';
import { Link } from 'react-router-dom';
import Container from '../../../ui/Container/Container';
import CarouselButton from '../../../ui/CarouselButton/CarouselButton';
import aklanImage from '../../../../Images/aklan.jpg';
import {
  getPublicDestinations,
  getPublicPackages,
} from '../../../../lib/publicCatalog';

const fallbackDestinations = [
  {
    id: 'aklan',
    name: 'Aklan',
    activities: '10 Activities',
    image: aklanImage,
    href: '/packages?search=Aklan',
  },
  { id: 'placeholder-1', placeholder: true },
  { id: 'placeholder-2', placeholder: true },
  { id: 'placeholder-3', placeholder: true },
  { id: 'placeholder-4', placeholder: true },
];

function Destinations() {
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const cardsRef = useRef(null);

  const updateScrollState = () => {
    const cards = cardsRef.current;

    if (!cards) {
      return;
    }

    setCanScrollPrev(cards.scrollLeft > 4);
    setCanScrollNext(
      cards.scrollLeft + cards.clientWidth < cards.scrollWidth - 4,
    );
  };

  useEffect(() => {
    let active = true;

    Promise.all([getPublicDestinations(), getPublicPackages()])
      .then(([destinationItems, packageItems]) => {
        if (!active || destinationItems.length === 0) {
          return;
        }

        const counts = {};
        for (const pkg of packageItems) {
          const key = (pkg.destinationName ?? '').toLowerCase();
          counts[key] = (counts[key] ?? 0) + 1;
        }

        const cards = destinationItems.map((destination) => ({
          id: destination.id,
          name: destination.name,
          activities: `${counts[destination.name.toLowerCase()] ?? 0} Activities`,
          image: destination.image,
          href: `/packages?search=${encodeURIComponent(destination.name)}`,
        }));

        while (cards.length < 5) {
          cards.push({
            id: `placeholder-${cards.length}`,
            placeholder: true,
          });
        }

        setDestinations(cards);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateScrollState);

    return () => cancelAnimationFrame(frame);
  }, [destinations]);

  const scrollNext = () => {
    const cards = cardsRef.current;

    if (!cards) {
      return;
    }

    cards.scrollBy({
      left: Math.max(216, cards.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  const scrollPrev = () => {
    const cards = cardsRef.current;

    if (!cards) {
      return;
    }

    cards.scrollBy({
      left: -Math.max(216, cards.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.section} aria-labelledby="destinations-title">
      <Container size="wide">
        <div className={styles.heading}>
          <h2 id="destinations-title" className={styles.title}>
            Where is your next Destination?
          </h2>
          <Link to="/destinations" className={styles.seeMore}>
            See more
          </Link>
        </div>

        <div className={styles.row}>
          <ul
            ref={cardsRef}
            className={styles.cards}
            onScroll={updateScrollState}
          >
            {destinations.map((destination) => (
              <li key={destination.id} className={styles.cardWrapper}>
                {destination.placeholder ? (
                  <div
                    className={`${styles.card} ${styles.cardPlaceholder}`}
                    aria-hidden="true"
                  />
                ) : (
                  <Link to={destination.href} className={styles.card}>
                    <img
                      src={destination.image}
                      alt=""
                      className={styles.cardImage}
                    />
                    <span className={styles.cardTitle}>{destination.name}</span>
                    <span className={styles.cardMeta}>
                      {destination.activities}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <CarouselButton
            className={styles.prev}
            label="Show previous destinations"
            direction="prev"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          />
          <CarouselButton
            className={styles.next}
            label="Show more destinations"
            onClick={scrollNext}
            disabled={!canScrollNext}
          />
        </div>
      </Container>
    </section>
  );
}

export default Destinations;
