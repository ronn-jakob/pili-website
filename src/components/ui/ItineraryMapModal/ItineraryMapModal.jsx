import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
  googleMapsUrl,
} from '../../../lib/maps';
import styles from './ItineraryMapModal.module.css';

const markerIcon = L.divIcon({
  className: styles.mapPin,
  html: '<span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function ItineraryMapModal({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!item?.location) {
    return null;
  }

  const location = item.location;
  const position = [Number(location.lat), Number(location.lng)];
  const directionsUrl = googleMapsUrl(location);

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="itinerary-map-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{item.title || `Day ${item.day}`}</p>
            <h2 id="itinerary-map-title" className={styles.title}>
              {location.name}
            </h2>
            {location.address && (
              <p className={styles.address}>{location.address}</p>
            )}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close itinerary map"
          >
            ×
          </button>
        </header>

        <div className={styles.mapWrap}>
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom
            className={styles.map}
          >
            <TileLayer
              attribution={MAP_TILE_ATTRIBUTION}
              url={MAP_TILE_URL}
            />
            <Marker position={position} icon={markerIcon}>
              <Popup>{location.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {item.text && <p className={styles.description}>{item.text}</p>}

        <footer className={styles.footer}>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.directions}
            >
              Open in Google Maps
            </a>
          )}
          <button
            type="button"
            className={styles.done}
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export default ItineraryMapModal;
