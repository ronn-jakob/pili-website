const MAPTILER_KEY = (import.meta.env.VITE_MAPTILER_KEY ?? '').trim();

export const hasMapTilerKey = Boolean(MAPTILER_KEY);

export const MAP_DEFAULT_CENTER = [12.8797, 121.774];

export const MAP_TILE_URL = hasMapTilerKey
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_ATTRIBUTION = hasMapTilerKey
  ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function isValidLocation(location) {
  return Boolean(
    location &&
      typeof location.name === 'string' &&
      location.name.trim() &&
      Number.isFinite(Number(location.lat)) &&
      Number.isFinite(Number(location.lng)) &&
      Math.abs(Number(location.lat)) <= 90 &&
      Math.abs(Number(location.lng)) <= 180,
  );
}

export function normalizeLocation(location) {
  if (!isValidLocation(location)) {
    return null;
  }

  return {
    name: location.name.trim(),
    address: (location.address ?? '').trim(),
    lat: Number(location.lat),
    lng: Number(location.lng),
    source: location.source === 'geocoded' ? 'geocoded' : 'manual',
  };
}

export function googleMapsUrl(location) {
  if (!isValidLocation(location)) {
    return '';
  }

  return `https://www.google.com/maps/search/?api=1&query=${Number(location.lat)},${Number(location.lng)}`;
}

export async function searchPlaces(query, signal, options = {}) {
  const trimmed = query.trim();

  if (!hasMapTilerKey || trimmed.length < 3) {
    return [];
  }

  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(trimmed)}.json`,
  );
  url.searchParams.set('key', MAPTILER_KEY);
  url.searchParams.set('limit', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('autocomplete', 'true');
  url.searchParams.set('country', 'ph');

  if (Number.isFinite(options.lat) && Number.isFinite(options.lng)) {
    url.searchParams.set('proximity', `${options.lng},${options.lat}`);

    if (Number.isFinite(options.radius)) {
      const radius = options.radius;
      url.searchParams.set(
        'bbox',
        [
          options.lng - radius,
          options.lat - radius,
          options.lng + radius,
          options.lat + radius,
        ].join(','),
      );
    }
  }

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error('Location search is unavailable right now.');
  }

  const data = await response.json();

  return (data.features ?? [])
    .map((feature) => {
      const [lng, lat] = feature.geometry?.coordinates ?? [];
      const name =
        feature.text ||
        feature.place_name?.split(',')[0] ||
        feature.properties?.name ||
        '';

      if (!name || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
        return null;
      }

      return {
        id: String(feature.id ?? `${lat},${lng}`),
        name,
        address: feature.place_name ?? feature.properties?.address ?? '',
        lat: Number(lat),
        lng: Number(lng),
        source: 'geocoded',
      };
    })
    .filter(Boolean);
}
