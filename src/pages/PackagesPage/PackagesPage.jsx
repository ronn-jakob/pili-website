import { useEffect, useState } from 'react';
import PackagesHero from '../../components/sections/packages/PackagesHero/PackagesHero';
import PackagesListing from '../../components/sections/packages/PackagesListing/PackagesListing';
import { allPackages } from '../../data/packages';
import { getPublicPackages } from '../../lib/publicCatalog';

function PackagesPage() {
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
          setPackages(allPackages);
          setError('Showing cached packages while live data is unavailable.');
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

  return (
    <main>
      <PackagesHero />
      <PackagesListing packages={packages} loading={loading} error={error} />
    </main>
  );
}

export default PackagesPage;
