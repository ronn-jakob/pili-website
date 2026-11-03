import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DestinationsHero from '../../components/sections/destinations/DestinationsHero/DestinationsHero';
import DestinationSearchResults from '../../components/sections/destinations/DestinationSearchResults/DestinationSearchResults';
import PopularDestinations from '../../components/sections/destinations/PopularDestinations/PopularDestinations';
import StorySection from '../../components/sections/destinations/StorySection/StorySection';
import FeaturedPackages from '../../components/sections/destinations/FeaturedPackages/FeaturedPackages';
import { getPublicDestinations } from '../../lib/publicCatalog';

function DestinationsPage() {
  const [destinations, setDestinations] = useState(null);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('search') ?? '').trim();

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

  const searchResults = useMemo(() => {
    if (!query) {
      return [];
    }

    const search = query.toLowerCase();

    return (destinations ?? []).filter((destination) =>
      [
        destination.name,
        destination.region,
        destination.province,
        destination.description,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(search),
      ),
    );
  }, [destinations, query]);

  return (
    <main>
      <DestinationsHero key={query} initialValue={query} />
      {query ? (
        <DestinationSearchResults
          destinations={searchResults}
          query={query}
          loading={!destinations}
        />
      ) : (
        <>
          <PopularDestinations destinations={destinations} />
          <StorySection />
          <FeaturedPackages destinations={destinations} />
        </>
      )}
    </main>
  );
}

export default DestinationsPage;
