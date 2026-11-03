import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/ui/Container/Container';
import WishlistButton from '../../components/ui/WishlistButton/WishlistButton';
import useWishlist from '../../context/useWishlist';
import { getPublicPackages } from '../../lib/publicCatalog';
import styles from './WishlistPage.module.css';

function WishlistPage() {
  const { wishlistIds, loading: wishlistLoading, error: wishlistError } =
    useWishlist();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getPublicPackages()
      .then((items) => {
        if (active) {
          setPackages(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load your wishlist tours.');
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

  const idSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const saved = useMemo(
    () => packages.filter((pkg) => idSet.has(pkg.id)),
    [packages, idSet],
  );
  const busy = loading || wishlistLoading;

  return (
    <main className={styles.page}>
      <Container size="page">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Saved trips</p>
          <h1 className={styles.title}>My Wishlist</h1>
          <p className={styles.subtitle}>
            Tours you saved with the heart button. Prices are shown per person.
          </p>
        </header>

        {wishlistError && (
          <p className={styles.error} role="alert">
            {wishlistError}
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {busy ? (
          <p className={styles.empty}>Loading your wishlist…</p>
        ) : saved.length === 0 ? (
          <section className={styles.emptyCard}>
            <h2>Your wishlist is empty.</h2>
            <p>Tap the heart on a tour card to save it here.</p>
            <Link to="/packages" className={styles.browse}>
              Browse tour packages
            </Link>
          </section>
        ) : (
          <div className={styles.grid}>
            {saved.map((pkg) => (
              <article key={pkg.id} className={styles.card}>
                <div className={styles.photo}>
                  <img src={pkg.heroImage} alt="" className={styles.image} />
                  <WishlistButton
                    tourId={pkg.id}
                    itemName={pkg.title}
                    raised
                    className={styles.heart}
                  />
                </div>
                <div className={styles.body}>
                  <p className={styles.location}>{pkg.location}</p>
                  <h2 className={styles.cardTitle}>
                    <Link to={`/packages/${pkg.id}`} className={styles.titleLink}>
                      {pkg.title}
                    </Link>
                  </h2>
                  <p className={styles.rating}>
                    <span aria-hidden="true">★</span> {pkg.rating} (
                    {pkg.reviewCount} reviews)
                  </p>
                  <div className={styles.footer}>
                    <span className={styles.price}>{pkg.priceLabel}</span>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className={styles.view}
                    >
                      View package
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

export default WishlistPage;
