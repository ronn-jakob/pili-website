export const philippineRegions = [
  {
    name: 'National Capital Region',
    provinces: ['Metro Manila'],
  },
  {
    name: 'Cordillera Administrative Region',
    provinces: [
      'Abra',
      'Apayao',
      'Benguet',
      'Ifugao',
      'Kalinga',
      'Mountain Province',
    ],
  },
  {
    name: 'Ilocos Region',
    provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  },
  {
    name: 'Cagayan Valley',
    provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  },
  {
    name: 'Central Luzon',
    provinces: [
      'Aurora',
      'Bataan',
      'Bulacan',
      'Nueva Ecija',
      'Pampanga',
      'Tarlac',
      'Zambales',
    ],
  },
  {
    name: 'Calabarzon',
    provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  },
  {
    name: 'Mimaropa',
    provinces: [
      'Marinduque',
      'Occidental Mindoro',
      'Oriental Mindoro',
      'Palawan',
      'Romblon',
    ],
  },
  {
    name: 'Bicol Region',
    provinces: [
      'Albay',
      'Camarines Norte',
      'Camarines Sur',
      'Catanduanes',
      'Masbate',
      'Sorsogon',
    ],
  },
  {
    name: 'Western Visayas',
    provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  },
  {
    name: 'Central Visayas',
    provinces: ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  },
  {
    name: 'Eastern Visayas',
    provinces: [
      'Biliran',
      'Eastern Samar',
      'Leyte',
      'Northern Samar',
      'Samar',
      'Southern Leyte',
    ],
  },
  {
    name: 'Zamboanga Peninsula',
    provinces: ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  },
  {
    name: 'Northern Mindanao',
    provinces: [
      'Bukidnon',
      'Camiguin',
      'Lanao del Norte',
      'Misamis Occidental',
      'Misamis Oriental',
    ],
  },
  {
    name: 'Davao Region',
    provinces: [
      'Davao de Oro',
      'Davao del Norte',
      'Davao del Sur',
      'Davao Occidental',
      'Davao Oriental',
    ],
  },
  {
    name: 'Soccsksargen',
    provinces: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  },
  {
    name: 'Caraga',
    provinces: [
      'Agusan del Norte',
      'Agusan del Sur',
      'Dinagat Islands',
      'Surigao del Norte',
      'Surigao del Sur',
    ],
  },
  {
    name: 'BARMM',
    provinces: [
      'Basilan',
      'Lanao del Sur',
      'Maguindanao del Norte',
      'Maguindanao del Sur',
      'Sulu',
      'Tawi-Tawi',
    ],
  },
];

export const regionForProvince = Object.fromEntries(
  philippineRegions.flatMap((region) =>
    region.provinces.map((province) => [province, region.name]),
  ),
);

export function getRegionForProvince(province) {
  return regionForProvince[province] ?? '';
}
