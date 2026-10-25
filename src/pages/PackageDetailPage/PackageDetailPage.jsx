import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PackageDetailHero from '../../components/sections/package-detail/PackageDetailHero/PackageDetailHero';
import PackageDetailBody from '../../components/sections/package-detail/PackageDetailBody/PackageDetailBody';
import PackageGallery from '../../components/sections/package-detail/PackageGallery/PackageGallery';
import PackageReviews from '../../components/sections/package-detail/PackageReviews/PackageReviews';
import { getPackageById } from '../../data/packages';
import { getPublicDeparturesForTour } from '../../lib/departures';
import { mapTourToPackage } from '../../lib/publicCatalog';
import { getPublicTourById } from '../../lib/tours';

function PackageDetailPage() {
  const { packageId } = useParams();
  const staticPkg = getPackageById(packageId);
  const [firestoreTour, setFirestoreTour] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getPublicTourById(packageId)
      .then((tour) => {
        if (active) {
          setFirestoreTour(tour);
        }
      })
      .catch(() => {
        if (active) {
          setFirestoreTour(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    getPublicDeparturesForTour(packageId)
      .then((items) => {
        if (active) {
          setDepartures(items);
        }
      })
      .catch(() => {
        if (active) {
          setDepartures([]);
        }
      });

    return () => {
      active = false;
    };
  }, [packageId]);

  if (!staticPkg && loading) {
    return (
      <main className="page-loading">
        <p>Loading tour details…</p>
      </main>
    );
  }

  if (!staticPkg && !firestoreTour) {
    return <Navigate to="/packages" replace />;
  }

  const basePkg = staticPkg ?? mapTourToPackage(firestoreTour);
  const itinerarySource = staticPkg?.itinerary ?? basePkg.itinerary;
  const itinerary = itinerarySource.map((day, index) => {
    const remoteDay = firestoreTour?.itinerary?.[index];

    return {
      ...day,
      title: remoteDay?.title || day.title,
      text: remoteDay?.text || day.text,
      location: remoteDay?.location ?? null,
    };
  });

  const displayPkg =
    staticPkg && firestoreTour
      ? {
          ...staticPkg,
          title: firestoreTour.title || staticPkg.title,
          description: firestoreTour.description || staticPkg.description,
          location: firestoreTour.destinationName || staticPkg.location,
          shortPlace: firestoreTour.destinationName || staticPkg.shortPlace,
          durationLabel: firestoreTour.duration || staticPkg.durationLabel,
          duration: firestoreTour.duration || staticPkg.duration,
          durationWords: firestoreTour.duration || staticPkg.durationWords,
          category: firestoreTour.category || staticPkg.category,
          heroImage: firestoreTour.photos[0] || staticPkg.heroImage,
          gallery: firestoreTour.photos.length
            ? firestoreTour.photos
            : staticPkg.gallery,
          inclusions: firestoreTour.inclusions.length
            ? firestoreTour.inclusions
            : staticPkg.inclusions,
          exclusions: firestoreTour.exclusions.length
            ? firestoreTour.exclusions
            : staticPkg.exclusions,
          rules: firestoreTour.rules.length
            ? firestoreTour.rules
            : staticPkg.rules,
        }
      : basePkg;

  return (
    <main>
      <PackageDetailHero pkg={displayPkg} />
      <PackageDetailBody
        pkg={displayPkg}
        itinerary={itinerary}
        departures={departures}
        bookable={Boolean(staticPkg)}
      />
      <PackageGallery pkg={displayPkg} />
      <PackageReviews pkg={displayPkg} />
    </main>
  );
}

export default PackageDetailPage;
