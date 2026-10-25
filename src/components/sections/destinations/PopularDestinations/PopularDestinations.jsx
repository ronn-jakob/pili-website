import { useEffect, useState } from 'react';
import styles from './PopularDestinations.module.css';
import { Link } from 'react-router-dom';
import Container from '../../../ui/Container/Container';
import WishlistButton from '../../../ui/WishlistButton/WishlistButton';
import palawanImage from '../../../../Images/destinations/palawan.png';
import siargaoImage from '../../../../Images/destinations/siargao.png';
import boholImage from '../../../../Images/destinations/bohol.png';
import cebuImage from '../../../../Images/destinations/cebu.png';
import banaueImage from '../../../../Images/destinations/banaue.png';
import { getPublicPackages } from '../../../../lib/publicCatalog';

const destinationMeta = {
  palawan: '6 nights   |   from $480 / person',
  siargao: '5 nights   |   from $520 / person',
  bohol: '4 nights   |   from $265 / person',
  cebu: '3 nights   |   from $240 / person',
  ifugao: '4 nights   |   from $220 / person',
};

const destinationTips = {
  palawan: 'Local tip  Book island-hopping permits a day ahead in peak season.',
  siargao: 'Local tip  Rent a scooter early; the best cafes open before the surf.',
  bohol: 'Local tip  Start the hills loop before 8am to miss the midday heat.',
  cebu: 'Local tip  Leave extra time for city traffic when catching a ferry south.',
  ifugao: 'Local tip  Pack a light layer; the highlands cool down after sunset.',
};

const fallbackDestinations = [
  {
    id: 'palawan',
    variant: 'feature',
    region: 'MIMAROPA  ·  EL NIDO & CORON',
    name: 'Palawan',
    description:
      'Limestone islands, hidden lagoons and the kind of blue that makes you miss your ferry on purpose.',
    meta: '6 nights   |   from $480 / person',
    tip: 'Local tip  Book island-hopping permits a day ahead in peak season.',
    tipBox: true,
    image: palawanImage,
  },
  {
    id: 'siargao',
    variant: 'tall',
    region: 'CARAGA  ·  SURIGAO DEL NORTE',
    name: 'Siargao',
    description:
      'Surf breaks, palm-lined roads and slow afternoons on an island with its own easy rhythm.',
    meta: '5 nights   |   from $520 / person',
    tip: 'Local tip  Rent a scooter early; the best cafes open before the surf.',
    image: siargaoImage,
  },
  {
    id: 'bohol',
    variant: 'small',
    region: 'CENTRAL VISAYAS  ·  PANGLAO',
    name: 'Bohol',
    description:
      'Chocolate Hills at sunrise, quiet river bends and a warm stretch of sand to come back to.',
    meta: '4 nights   |   from $265 / person',
    tip: 'Local tip  Start the hills loop before 8am to miss the midday heat.',
    image: boholImage,
  },
  {
    id: 'cebu',
    variant: 'small',
    region: 'CENTRAL VISAYAS  ·  CEBU CITY',
    name: 'Cebu',
    description:
      'A lively gateway with layered history, island day trips and the best lechon on your route.',
    meta: '3 nights   |   from $240 / person',
    tip: 'Local tip  Leave extra time for city traffic when catching a ferry south.',
    image: cebuImage,
  },
  {
    id: 'banaue',
    variant: 'small',
    region: 'CORDILLERA  ·  IFUGAO',
    name: 'Banaue',
    description:
      'Walk the ancient rice terraces with a local guide and wake up above the clouds.',
    meta: '4 nights   |   from $220 / person',
    tip: 'Local tip  Pack a light layer; the highlands cool down after sunset.',
    image: banaueImage,
  },
];

function DestinationCard({ destination }) {
  const {
    id,
    variant,
    region,
    name,
    description,
    meta,
    tip,
    tipBox = false,
    image,
  } = destination;

  return (
    <article className={`${styles.card} ${styles[variant]}`} id={id}>
      <div className={styles.photoWrap}>
        <img src={image} alt="" className={styles.photo} />
        <WishlistButton itemName={name} raised className={styles.heart} />
      </div>

      <div className={styles.body}>
        <p className={styles.region}>{region}</p>
        <h3 className={styles.name}>
          <Link
            to={`/packages?search=${encodeURIComponent(name)}`}
            className={styles.nameLink}
          >
            {name}
          </Link>
        </h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.meta}>{meta}</p>
        <p className={tipBox ? styles.tipBox : styles.tip}>{tip}</p>
      </div>
    </article>
  );
}

function PopularDestinations({ destinations: providedDestinations = null }) {
  const [destinations, setDestinations] = useState(fallbackDestinations);

  useEffect(() => {
    if (!providedDestinations || providedDestinations.length === 0) {
      return undefined;
    }

    let active = true;

    getPublicPackages()
      .then((packages) => {
        if (!active) {
          return;
        }

        const counts = {};
        for (const pkg of packages) {
          const key = (pkg.destinationName ?? '').toLowerCase();
          counts[key] = (counts[key] ?? 0) + 1;
        }

        setDestinations(
          providedDestinations.slice(0, 5).map((destination, index) => ({
            id: destination.id,
            variant:
              index === 0 ? 'feature' : index === 1 ? 'tall' : 'small',
            region: `${destination.region.toUpperCase()}  ·  ${destination.province.toUpperCase()}`,
            name: destination.name,
            description: destination.description,
            meta:
              destinationMeta[destination.id] ??
              `Explore ${destination.province}`,
            tip:
              destinationTips[destination.id] ??
              'Local tip  Ask your guide for the best season to visit.',
            tipBox: index === 0,
            image: destination.image,
          })),
        );
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [providedDestinations]);

  return (
    <section
      className={styles.section}
      aria-labelledby="popular-destinations-title"
    >
      <Container size="page">
        <header className={styles.header}>
          <div className={styles.eyebrowRow}>
            <p className={styles.eyebrow}>A good place to begin</p>
            <p className={styles.count}>
              {String(destinations.length).padStart(2, '0')} places to explore
            </p>
          </div>
          <h2
            id="popular-destinations-title"
            className={styles.title}
            aria-label="Popular destinations"
          >
            <span>Popular</span>
            <span className={styles.titleAccent}>destinations</span>
          </h2>
        </header>

        <div className={styles.topRow}>
          {destinations.slice(0, 2).map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>

        <div className={styles.bottomRow}>
          {destinations.slice(2).map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default PopularDestinations;
