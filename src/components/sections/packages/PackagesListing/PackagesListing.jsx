import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '../../../ui/Container/Container';
import WishlistButton from '../../../ui/WishlistButton/WishlistButton';
import styles from './PackagesListing.module.css';

const durationOptions = [
  { label: 'Day tour', matches: (days) => days <= 1 },
  { label: '2–3 days', matches: (days) => days >= 2 && days <= 3 },
  { label: '4–7 days', matches: (days) => days >= 4 && days <= 7 },
  { label: '8+ days', matches: (days) => days >= 8 },
];

function CheckRow({ label, checked, onChange }) {
  return (
    <label className={styles.checkRow}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}

function PackageFilters({
  categories,
  selectedCategories,
  selectedDurations,
  minBudget,
  maxBudget,
  onToggleCategory,
  onToggleDuration,
  onBudgetChange,
  onApply,
  onClear,
}) {
  return (
    <form
      className={styles.filters}
      aria-label="Package filters"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className={styles.filtersHeader}>
        <h2 className={styles.filtersTitle}>Filters</h2>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Clear all
        </button>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Category</legend>
        {categories.map((category) => (
          <CheckRow
            key={category}
            label={category}
            checked={selectedCategories.includes(category)}
            onChange={() => onToggleCategory(category)}
          />
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Duration</legend>
        {durationOptions.map((duration) => (
          <CheckRow
            key={duration.label}
            label={duration.label}
            checked={selectedDurations.includes(duration.label)}
            onChange={() => onToggleDuration(duration.label)}
          />
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Budget per person</legend>
        <div className={styles.budget}>
          <input
            type="number"
            min="0"
            className={styles.budgetInput}
            placeholder="₱ Min"
            aria-label="Minimum budget"
            value={minBudget}
            onChange={(event) => onBudgetChange('min', event.target.value)}
          />
          <input
            type="number"
            min="0"
            className={styles.budgetInput}
            placeholder="₱ Max"
            aria-label="Maximum budget"
            value={maxBudget}
            onChange={(event) => onBudgetChange('max', event.target.value)}
          />
        </div>
      </fieldset>

      <button type="submit" className={styles.applyButton}>
        Apply filters
      </button>
    </form>
  );
}

function PackageCard({ pkg }) {
  return (
    <article className={styles.card}>
      <div className={styles.photo} style={{ backgroundColor: pkg.color }}>
        <span className={styles.duration}>{pkg.duration}</span>
        <WishlistButton
          itemName={pkg.title}
          tone="dark"
          className={styles.heart}
        />
      </div>

      <div className={styles.body}>
        <p className={styles.location}>{pkg.location}</p>
        <h3 className={styles.cardTitle}>
          <Link to={`/packages/${pkg.id}`} className={styles.titleLink}>
            {pkg.title}
          </Link>
        </h3>
        <p className={styles.inclusions}>{pkg.listingSummary}</p>
        <p className={styles.rating}>
          <span aria-hidden="true">★</span> {pkg.rating} ({pkg.reviewCount}{' '}
          reviews)
        </p>

        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            <span className={styles.from}>from</span>
            <span className={styles.price}>{pkg.priceLabel}</span>
            <span className={styles.perPerson}>per person</span>
          </div>
          <span className={styles.viewButton} aria-hidden="true">
            View package
          </span>
        </div>
      </div>
    </article>
  );
}

function PackagesListing({ packages = [], loading = false, error = '' }) {
  const categories = useMemo(
    () =>
      [...new Set(packages.map((pkg) => pkg.category).filter(Boolean))].sort(),
    [packages],
  );
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    durations: [],
    min: '',
    max: '',
  });
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const urlSearch = (searchParams.get('search') ?? '').trim().toLowerCase();
  const urlCategory = searchParams.get('category') ?? '';
  const urlDuration = searchParams.get('duration') ?? '';
  const urlMin = searchParams.get('min') ?? '';
  const urlMax = searchParams.get('max') ?? '';
  const pageSize = 6;

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const toggleDuration = (duration) => {
    setSelectedDurations((current) =>
      current.includes(duration)
        ? current.filter((item) => item !== duration)
        : [...current, duration],
    );
  };

  const handleBudgetChange = (field, value) => {
    if (field === 'min') {
      setMinBudget(value);
    } else {
      setMaxBudget(value);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      categories: selectedCategories,
      durations: selectedDurations,
      min: minBudget,
      max: maxBudget,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDurations([]);
    setMinBudget('');
    setMaxBudget('');
    setAppliedFilters({ categories: [], durations: [], min: '', max: '' });
    setPage(1);
  };

  const filteredPackages = useMemo(() => {
    const min = Number(appliedFilters.min);
    const max = Number(appliedFilters.max);
    const urlMinValue = Number(urlMin);
    const urlMaxValue = Number(urlMax);
    const urlDurationOption = durationOptions.find(
      (option) => option.label === urlDuration,
    );
    const filtered = packages.filter((pkg) => {
      const matchesSearch =
        !urlSearch ||
        [
          pkg.title,
          pkg.location,
          pkg.destinationName,
          pkg.category,
          pkg.shortPlace,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(urlSearch),
        );
      const matchesCategory =
        appliedFilters.categories.length === 0 ||
        appliedFilters.categories.includes(pkg.category);
      const matchesUrlCategory = !urlCategory || pkg.category === urlCategory;
      const matchesDuration =
        appliedFilters.durations.length === 0 ||
        appliedFilters.durations.some((label) => {
          const option = durationOptions.find((item) => item.label === label);
          return option?.matches(Number(pkg.durationDays) || 1);
        });
      const matchesUrlDuration =
        !urlDurationOption ||
        urlDurationOption.matches(Number(pkg.durationDays) || 1);
      const matchesMin =
        (!appliedFilters.min ||
          (Number.isFinite(min) && pkg.priceValue >= min)) &&
        (!urlMin || (Number.isFinite(urlMinValue) && pkg.priceValue >= urlMinValue));
      const matchesMax =
        (!appliedFilters.max ||
          (Number.isFinite(max) && pkg.priceValue <= max)) &&
        (!urlMax || (Number.isFinite(urlMaxValue) && pkg.priceValue <= urlMaxValue));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesUrlCategory &&
        matchesDuration &&
        matchesUrlDuration &&
        matchesMin &&
        matchesMax
      );
    });

    return filtered.sort((first, second) => {
      if (sort === 'price-low') {
        return first.priceValue - second.priceValue;
      }

      if (sort === 'price-high') {
        return second.priceValue - first.priceValue;
      }

      if (sort === 'rating') {
        return (
          Number(second.rating) - Number(first.rating) ||
          first.title.localeCompare(second.title)
        );
      }

      return (
        Number(second.featured) - Number(first.featured) ||
        first.title.localeCompare(second.title)
      );
    });
  }, [
    packages,
    appliedFilters,
    sort,
    urlSearch,
    urlCategory,
    urlDuration,
    urlMin,
    urlMax,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePackages = filteredPackages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <section className={styles.section} aria-labelledby="packages-list-title">
      <Container size="page">
        <div className={styles.listing}>
          <PackageFilters
            categories={categories}
            selectedCategories={selectedCategories}
            selectedDurations={selectedDurations}
            minBudget={minBudget}
            maxBudget={maxBudget}
            onToggleCategory={toggleCategory}
            onToggleDuration={toggleDuration}
            onBudgetChange={handleBudgetChange}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          <div className={styles.main}>
            <div className={styles.mainHeader}>
              <div>
                <h2 id="packages-list-title" className={styles.heading}>
                  Popular Packages
                </h2>
                <p className={styles.count}>
                  {filteredPackages.length} available package
                  {filteredPackages.length === 1 ? '' : 's'}
                </p>
              </div>

              <label className={styles.sort}>
                <span className={styles.srOnly}>Sort packages</span>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="popular">Sort by: Most Popular</option>
                  <option value="price-low">Sort by: Price low to high</option>
                  <option value="price-high">Sort by: Price high to low</option>
                  <option value="rating">Sort by: Top rated</option>
                </select>
              </label>
            </div>

            {error && (
              <p className={styles.error} role="status">
                {error}
              </p>
            )}

            {loading && (
              <p className={styles.state} role="status">
                Loading tour packages…
              </p>
            )}

            {!loading && (
              <>
                <div className={styles.grid}>
                  {visiblePackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>

                {visiblePackages.length === 0 && (
                  <p className={styles.state}>
                    No packages match the selected filters.
                  </p>
                )}

                {totalPages > 1 && (
                  <nav className={styles.pagination} aria-label="Package pages">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        type="button"
                        className={`${styles.pageButton}${
                          currentPage === index + 1
                            ? ` ${styles.pageActive}`
                            : ''
                        }`}
                        aria-current={
                          currentPage === index + 1 ? 'page' : undefined
                        }
                        onClick={() => setPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default PackagesListing;
