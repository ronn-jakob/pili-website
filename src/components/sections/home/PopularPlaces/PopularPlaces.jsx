import { useEffect, useState } from 'react';
import styles from './PopularPlaces.module.css';
import { Link } from 'react-router-dom';
import Container from '../../../ui/Container/Container';
import CarouselButton from '../../../ui/CarouselButton/CarouselButton';
import WishlistButton from '../../../ui/WishlistButton/WishlistButton';
import enchantedKingdomImage from '../../../../Images/enchanted-kingdom.jpg';
import { getPublicPackages } from '../../../../lib/publicCatalog';

const fallbackPlaces = [
  {
    id: 'enchanted-kingdom',
    category: 'Theme Parks • Laguna',
    title: 'Enchanted Kingdom Ticket',
    rating: 5,
    reviews: 1,
    booked: 2,
    price: '₱1,299',
    offer: 'Limited Offer',
    image: enchantedKingdomImage,
    href: '/packages/enchanted-kingdom-day-pass',
  },
  { id: 'placeholder-1', placeholder: true },
  { id: 'placeholder-2', placeholder: true },
  { id: 'placeholder-3', placeholder: true },
];

function StarIcon() {
  return (
    <svg
      className={styles.star}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 11.0053 10.9991"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.03979 0.816495C5.19979 0.394502 5.80526 0.394502 5.96575 0.816495L7.00071 3.68345C7.03681 3.77684 7.10039 3.85709 7.18305 3.9136C7.26571 3.9701 7.36356 4.00021 7.46369 3.99995H10.0071C10.4771 3.99995 10.682 4.58494 10.3126 4.87143L8.50264 6.49991C8.42169 6.56234 8.36253 6.64875 8.33362 6.7468C8.30471 6.84486 8.30752 6.94954 8.34165 7.0459L9.00262 9.84736C9.16361 10.2974 8.64264 10.6838 8.24865 10.4069L5.79026 8.84688C5.70607 8.7877 5.60568 8.75595 5.50277 8.75595C5.39987 8.75595 5.29948 8.7877 5.21529 8.84688L2.7569 10.4069C2.36341 10.6838 1.84194 10.2969 2.00293 9.84736L2.6639 7.0459C2.69803 6.94954 2.70084 6.84486 2.67193 6.7468C2.64302 6.64875 2.58386 6.56234 2.50291 6.49991L0.692988 4.87143C0.323004 4.58494 0.528995 3.99995 0.997974 3.99995H3.54136C3.64149 4.00021 3.73934 3.9701 3.822 3.9136C3.90466 3.85709 3.96824 3.77684 4.00434 3.68345L5.03979 0.816495Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PopularPlaceCard({ place }) {
  return (
    <li className={styles.cardWrapper}>
      <article className={styles.card}>
        <img className={styles.image} src={place.image} alt="" />

        <div className={styles.body}>
          <p className={styles.category}>{place.category}</p>
          <h3 className={styles.cardTitle}>
            <Link to={place.href} className={styles.link}>
              {place.title}
            </Link>
          </h3>

          <div className={styles.meta}>
            <span className={styles.rating}>
              <StarIcon />
              <span className={styles.ratingValue}>{place.rating}</span>
              <span className={styles.ratingTotal}>/5</span>
            </span>
            <span className={styles.booked}>
              ({place.reviews}){' '}
              {place.booked > 0 ? `• ${place.booked} Booked` : '• New'}
            </span>
          </div>

          <p className={styles.price}>{place.price}</p>
          <span className={styles.offer}>{place.offer}</span>
        </div>

        <WishlistButton
          itemName={place.title}
          className={styles.heart}
        />
      </article>
    </li>
  );
}

function PopularPlaces() {
  const [places, setPlaces] = useState(fallbackPlaces);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;

    getPublicPackages()
      .then((packages) => {
        if (!active || packages.length === 0) {
          return;
        }

        const cards = [...packages]
          .sort(
            (first, second) =>
              Number(second.featured) - Number(first.featured) ||
              Number(second.rating) - Number(first.rating) ||
              first.title.localeCompare(second.title),
          )
          .map((pkg) => ({
            id: pkg.id,
            category: `${pkg.category} • ${pkg.shortPlace}`,
            title: pkg.title,
            rating: pkg.rating,
            reviews: pkg.reviewCount,
            booked: pkg.bookings ?? 0,
            price: pkg.priceLabel,
            offer: pkg.featured ? 'Featured' : 'Popular',
            image: pkg.heroImage,
            href: `/packages/${pkg.id}`,
          }));

        while (cards.length < 4) {
          cards.push({
            id: `placeholder-${cards.length}`,
            placeholder: true,
          });
        }

        setPlaces(cards);
        setPage(0);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(places.length / 4));
  const pages = Array.from({ length: pageCount }, (_, pageIndex) => {
    const cards = places.slice(pageIndex * 4, pageIndex * 4 + 4);

    while (cards.length < 4) {
      cards.push({
        id: `placeholder-${pageIndex}-${cards.length}`,
        placeholder: true,
      });
    }

    return cards;
  });
  const canGoPrev = page > 0;
  const canGoNext = page < pageCount - 1;

  return (
    <section className={styles.section} aria-labelledby="popular-places-title">
      <Container size="wide">
        <div className={styles.heading}>
          <div>
            <h2 id="popular-places-title" className={styles.sectionTitle}>
              Popular Places
            </h2>
            <p className={styles.subtitle}>Tourist Favorite Choices</p>
          </div>
          <Link to="/packages" className={styles.seeMore}>
            See more
          </Link>
        </div>

        <div className={styles.row}>
          <CarouselButton
            className={styles.prev}
            label="Show previous popular places"
            direction="prev"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={!canGoPrev}
          />

          <div className={styles.carouselViewport}>
            <div
              className={styles.pages}
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {pages.map((pagePlaces, pageIndex) => (
                <ul
                  key={pageIndex}
                  className={styles.grid}
                  aria-hidden={page !== pageIndex}
                  inert={page !== pageIndex}
                >
                  {pagePlaces.map((place) =>
                    place.placeholder ? (
                      <li key={place.id} className={styles.cardWrapper}>
                        <div
                          className={`${styles.card} ${styles.placeholder}`}
                          aria-hidden="true"
                        />
                      </li>
                    ) : (
                      <PopularPlaceCard key={place.id} place={place} />
                    ),
                  )}
                </ul>
              ))}
            </div>
          </div>

          <CarouselButton
            className={styles.next}
            label="Show more popular places"
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
            disabled={!canGoNext}
          />

          {pageCount > 1 && (
            <div className={styles.mobileControls}>
              <button
                type="button"
                className={styles.mobileControl}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={!canGoPrev}
              >
                Previous
              </button>
              <span className={styles.pageCount}>
                {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                className={styles.mobileControl}
                onClick={() =>
                  setPage((current) => Math.min(pageCount - 1, current + 1))
                }
                disabled={!canGoNext}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export default PopularPlaces;
