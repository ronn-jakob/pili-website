import { useEffect, useState } from 'react';
import { getPackageById } from '../data/packages';
import { getPublicPackageById } from '../lib/publicCatalog';

function usePublicPackage(packageId) {
  const staticPackage = getPackageById(packageId);
  const [pkg, setPkg] = useState(staticPackage ?? null);
  const [loading, setLoading] = useState(!staticPackage);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getPublicPackageById(packageId)
      .then((remotePackage) => {
        if (!active) {
          return;
        }

        const nextPackage = remotePackage ?? staticPackage ?? null;
        setPkg(nextPackage);
        setError(nextPackage ? '' : 'This tour is not available.');
      })
      .catch(() => {
        if (!active) {
          return;
        }

        if (!staticPackage) {
          setError('Could not load this tour.');
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
  }, [packageId, staticPackage]);

  return { pkg, loading, error };
}

export default usePublicPackage;
