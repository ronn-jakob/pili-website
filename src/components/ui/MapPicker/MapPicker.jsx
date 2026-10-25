import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MAP_DEFAULT_CENTER,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
  hasMapTilerKey,
  isValidLocation,
  normalizeLocation,
  searchPlaces,
} from '../../../lib/maps';
import styles from './MapPicker.module.css';

const markerIcon = L.divIcon({
  className: styles.mapPin,
  html: '<span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function MapController({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], 14, { duration: 0.5 });
    }
  }, [map, lat, lng]);

  return null;
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng);
    },
  });

  return null;
}

function MapCenterTracker({ onMove }) {
  const map = useMap();

  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onMove([center.lat, center.lng]);
    },
  });

  return null;
}

function MapPicker({
  open,
  initialLocation,
  onClose,
  onSave,
  onRemove,
  title = 'Pin this day on the map',
  eyebrow = 'Itinerary location',
}) {
  const [query, setQuery] = useState(initialLocation?.name ?? '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState(() =>
    normalizeLocation(initialLocation),
  );
  const [name, setName] = useState(initialLocation?.name ?? '');
  const [address, setAddress] = useState(initialLocation?.address ?? '');
  const mapCenterRef = useRef(
    initialLocation
      ? [Number(initialLocation.lat), Number(initialLocation.lng)]
      : MAP_DEFAULT_CENTER,
  );
  const hasMovedRef = useRef(false);
  const skipSearchRef = useRef(Boolean(initialLocation));

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
  }, [open, onClose]);

  useEffect(() => {
    if (
      !open ||
      !hasMapTilerKey ||
      skipSearchRef.current ||
      query.trim().length < 3
    ) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');

      try {
        const center = mapCenterRef.current;
        const places = await searchPlaces(query, controller.signal, {
          lat: center[0],
          lng: center[1],
          radius:
            initialLocation || hasMovedRef.current ? 1.5 : undefined,
        });
        setResults(places);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResults([]);
          setSearchError('Location search failed. Click the map to pin manually.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, initialLocation]);

  if (!open) {
    return null;
  }

  const handleQueryChange = (value) => {
    skipSearchRef.current = false;
    setQuery(value);
    setSearchError('');

    if (value.trim().length < 3) {
      setResults([]);
      setSearching(false);
    }
  };

  const handleSelect = (place) => {
    skipSearchRef.current = true;
    setSelected(place);
    setName(place.name);
    setAddress(place.address);
    setQuery(place.name);
    setResults([]);
    setSearchError('');
  };

  const handleMapClick = ({ lat, lng }) => {
    const nextName = name.trim() || 'Pinned location';

    if (!name.trim()) {
      setName(nextName);
    }

    setSelected({
      name: nextName,
      address,
      lat,
      lng,
      source: 'manual',
    });
  };

  const location = selected
    ? normalizeLocation({
        ...selected,
        name: name || selected.name || 'Pinned location',
        address,
      })
    : null;

  const handleSave = () => {
    if (!location) {
      return;
    }

    onSave(location);
  };

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
        aria-labelledby="map-picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="map-picker-title" className={styles.title}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close map picker"
          >
            ×
          </button>
        </header>

        <div className={styles.searchRow}>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>Search for a place</span>
            <input
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search a place or address"
            />
          </label>
          {searching && <span className={styles.searchStatus}>Searching…</span>}
        </div>

        {!hasMapTilerKey && (
          <p className={styles.hint}>
            Address search is not configured. Click the map to place the pin
            manually.
          </p>
        )}

        {hasMapTilerKey && query.trim().length > 0 && query.trim().length < 3 && (
          <p className={styles.hint}>Type at least 3 characters to search.</p>
        )}

        {searchError && (
          <p className={styles.error} role="alert">
            {searchError}
          </p>
        )}

        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className={styles.result}
                  onClick={() => handleSelect(place)}
                >
                  <strong>{place.name}</strong>
                  <span>{place.address}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.mapWrap}>
          <MapContainer
            center={
              initialLocation
                ? [Number(initialLocation.lat), Number(initialLocation.lng)]
                : MAP_DEFAULT_CENTER
            }
            zoom={initialLocation ? 14 : 6}
            scrollWheelZoom
            className={styles.map}
          >
            <TileLayer
              attribution={MAP_TILE_ATTRIBUTION}
              url={MAP_TILE_URL}
            />
            <MapController lat={selected?.lat} lng={selected?.lng} />
            <MapCenterTracker
              onMove={(center) => {
                mapCenterRef.current = center;
                hasMovedRef.current = true;
              }}
            />
            <MapClickHandler onClick={handleMapClick} />
            {selected && (
              <Marker
                position={[selected.lat, selected.lng]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => handleMapClick(event.target.getLatLng()),
                }}
              >
                <Popup>{name || selected.name || 'Pinned location'}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <p className={styles.mapHint}>
          Search is limited to the Philippines. Pan the map near the
          destination, then search or click the map and drag the marker to set
          the exact pin.
        </p>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Location name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Burnham Park"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Address or notes</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="e.g. Baguio, Benguet"
            />
          </label>
        </div>

        <footer className={styles.footer}>
          <div>
            {initialLocation && (
              <button
                type="button"
                className={styles.remove}
                onClick={onRemove}
              >
                Remove pin
              </button>
            )}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.save}
              onClick={handleSave}
              disabled={!isValidLocation(location)}
            >
              Save location
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export default MapPicker;
