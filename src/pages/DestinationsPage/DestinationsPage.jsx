import { useEffect, useState } from 'react';
import DestinationsHero from '../../components/sections/destinations/DestinationsHero/DestinationsHero';
import PopularDestinations from '../../components/sections/destinations/PopularDestinations/PopularDestinations';
import StorySection from '../../components/sections/destinations/StorySection/StorySection';
import FeaturedPackages from '../../components/sections/destinations/FeaturedPackages/FeaturedPackages';
import { getPublicDestinations } from '../../lib/publicCatalog';

function DestinationsPage() {
  const [destinations, setDestinations] = useState(null);

  useEffect(() => {
    let active = true;

    getPublicDestinations()
      .then((items) => {
        if (active) {
          setDestinations(items);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <DestinationsHero />
      <PopularDestinations destinations={destinations} />
      <StorySection />
      <FeaturedPackages destinations={destinations} />
    </main>
  );
}

export default DestinationsPage;
