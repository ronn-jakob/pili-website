import { useEffect, useState } from 'react';
import PackagesHero from '../../components/sections/packages/PackagesHero/PackagesHero';
import PackagesListing from '../../components/sections/packages/PackagesListing/PackagesListing';
import { allPackages } from '../../data/packages';
import { getPublicDepartureDatesByTour } from '../../lib/departures';
import { getPublicPackages } from '../../lib/publicCatalog';

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [departureDates, setDepartureDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPackages() {
      try {
        const items = await getPublicPackages();
        let dates = {};

        try {
          dates = await getPublicDepartureDatesByTour(
            items.map((item) => item.id),
          );
        } catch {
          dates = {};
        }

        if (active) {
          setPackages(items);
          setDepartureDates(dates);
        }
      } catch {
        if (active) {
          setPackages(allPackages);
          setError('Showing cached packages while live data is unavailable.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <PackagesHero />
      <PackagesListing
        packages={packages}
        departureDates={departureDates}
        loading={loading}
        error={error}
      />
    </main>
  );
}

export default PackagesPage;
