export const seedCategories = [
  { id: 'beaches-islands', name: 'Beaches & Islands', sortOrder: 1 },
  { id: 'mountains-hiking', name: 'Mountains & Hiking', sortOrder: 2 },
  { id: 'culture-heritage', name: 'Culture & Heritage', sortOrder: 3 },
  { id: 'nature-adventure', name: 'Nature & Adventure', sortOrder: 4 },
  { id: 'theme-parks', name: 'Theme Parks', sortOrder: 5 },
  { id: 'island-exploration', name: 'Island Exploration', sortOrder: 6 },
  { id: 'mountain-getaway', name: 'Mountain Getaway', sortOrder: 7 },
  { id: 'beach-water', name: 'Beach & Water', sortOrder: 8 },
];

export function categoryIdFromName(name) {
  return (name ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
