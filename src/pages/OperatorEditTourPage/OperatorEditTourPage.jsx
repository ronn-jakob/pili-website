import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import MapPicker from '../../components/ui/MapPicker/MapPicker';
import { useOperatorTours } from '../../context/useOperatorTours';
import { getActiveCategories } from '../../lib/categories';
import { TOUR_STATUS } from '../../lib/firestoreSchema';
import { isValidLocation } from '../../lib/maps';
import { uploadTourImage } from '../../lib/cloudinary';
import {
  createOperatorTour,
  deleteDraftTour,
  formatDurationLabel,
  getActiveDestinations,
  getTourStatusLabel,
  tourErrorMessage,
  updateOperatorTour,
} from '../../lib/tours';
import styles from './OperatorEditTourPage.module.css';

const discountOptions = [
  {
    key: 'earlyBird',
    title: 'Early bird discount',
    meta: '10% · Book 14 days ahead',
  },
  {
    key: 'group',
    title: 'Group booking discount',
    meta: '8% · 6 or more travelers',
  },
  {
    key: 'student',
    title: 'Student discount',
    meta: '5% · Valid ID required',
  },
  {
    key: 'senior',
    title: 'Senior / PWD discount',
    meta: 'As applicable by law',
  },
];

const statusClasses = {
  [TOUR_STATUS.draft]: styles.draft,
  [TOUR_STATUS.pendingReview]: styles.pendingReview,
  [TOUR_STATUS.published]: styles.published,
  [TOUR_STATUS.rejected]: styles.rejected,
  [TOUR_STATUS.hidden]: styles.hidden,
  [TOUR_STATUS.archived]: styles.archived,
};

function createEmptyDraft() {
  return {
    id: null,
    title: '',
    destinationId: '',
    destination: '',
    destinationName: '',
    description: '',
    duration: '1 day',
    durationDays: 1,
    durationNights: 0,
    categoryId: '',
    category: '',
    meetingPoint: '',
    meetingPointAddress: '',
    meetingPointLocation: null,
    price: '',
    childPrice: '',
    infantPrice: '',
    minGroupSize: 6,
    groupDiscount: 8,
    taxesAndFees: 'Included in displayed price',
    discounts: {
      earlyBird: true,
      group: true,
      student: false,
      senior: true,
    },
    status: TOUR_STATUS.draft,
    rejectionReason: '',
    itinerary: [{ day: 1, title: '', text: '', location: null }],
    photos: [],
    inclusions: [],
    exclusions: [],
    rules: [],
  };
}

function cloneTourDraft(tour, categories = []) {
  const matchedCategory = categories.find(
    (category) =>
      category.name.toLowerCase() === (tour.category ?? '').toLowerCase(),
  );

  return {
    ...tour,
    categoryId: tour.categoryId || matchedCategory?.id || '',
    category: tour.category || matchedCategory?.name || '',
    discounts: { ...tour.discounts },
    itinerary:
      tour.itinerary.length > 0
        ? tour.itinerary.map((item) => ({ ...item }))
        : [{ day: 1, title: '', text: '', location: null }],
    photos: [...tour.photos],
    inclusions: [...tour.inclusions],
    exclusions: [...tour.exclusions],
    rules: [...tour.rules],
  };
}

function validateDraft(draft, mode, activeDestinationIds, activeCategoryIds) {
  const errors = [];

  if (!draft.title.trim()) {
    errors.push('Enter a tour package name.');
  }

  if (
    !draft.destinationId ||
    !activeDestinationIds.has(draft.destinationId)
  ) {
    errors.push('Choose an active destination.');
  }

  if (mode === 'review') {
    if (!draft.description.trim()) {
      errors.push('Enter a short description.');
    }

    if (!Number.isInteger(draft.durationDays) || draft.durationDays < 1) {
      errors.push('Enter a valid trip duration in days.');
    }

    if (!draft.categoryId || !activeCategoryIds.has(draft.categoryId)) {
      errors.push('Choose an active category.');
    }

    if (!isValidLocation(draft.meetingPointLocation)) {
      errors.push('Pin the meeting point before submitting.');
    }

    if (!Number.isFinite(draft.price) || draft.price <= 0) {
      errors.push('Enter an adult price greater than zero.');
    }

    const meaningfulItinerary = draft.itinerary.filter(
      (item) => item.title.trim() || item.text.trim(),
    );

    if (meaningfulItinerary.length === 0) {
      errors.push('Add at least one itinerary day with a title.');
    }

    const missingTitle = meaningfulItinerary.find(
      (item) => !item.title.trim(),
    );

    if (missingTitle) {
      errors.push(`Enter a title for Day ${missingTitle.day}.`);
    }

    const missingLocation = meaningfulItinerary.find(
      (item) => !isValidLocation(item.location),
    );

    if (missingLocation) {
      errors.push(
        `Pin a location for Day ${missingLocation.day} before submitting.`,
      );
    }
  }

  return errors;
}

function OperatorEditTourPage() {
  const { tourId } = useParams();
  const isNew = !tourId;
  const {
    getTour,
    loading: toursLoading,
    error: toursError,
  } = useOperatorTours();
  const tour = isNew ? null : getTour(tourId);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getActiveDestinations(), getActiveCategories()])
      .then(([nextDestinations, nextCategories]) => {
        if (!active) {
          return;
        }

        setDestinations(nextDestinations);
        setCategories(nextCategories);
        setDestinationsError('');
        setCategoriesError('');
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        const message =
          error?.code === 'permission-denied'
            ? 'You do not have permission to read active destinations or categories.'
            : 'Could not load destinations or categories. Refresh and try again.';

        setDestinationsError(message);
        setCategoriesError(message);
      })
      .finally(() => {
        if (active) {
          setLookupsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (toursLoading || lookupsLoading) {
    return (
      <div className={styles.loadingPage} role="status">
        Loading tour details…
      </div>
    );
  }

  if (toursError) {
    return (
      <div className={styles.loadingPage} role="alert">
        <p>{toursError}</p>
        <Link to="/operator/tours" className={styles.back}>
          Back to tours
        </Link>
      </div>
    );
  }

  if (!isNew && !tour) {
    return <Navigate to="/operator/tours" replace />;
  }

  return (
    <TourEditor
      key={isNew ? 'new' : tour.id}
      tour={tour}
      isNew={isNew}
      destinations={destinations}
      categories={categories}
      destinationsError={destinationsError}
      categoriesError={categoriesError}
    />
  );
}

function TourEditor({
  tour,
  isNew,
  destinations,
  categories,
  destinationsError,
  categoriesError,
}) {
  const [draft, setDraft] = useState(() =>
    isNew ? createEmptyDraft() : cloneTourDraft(tour, categories),
  );
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(null);
  const [meetingPickerOpen, setMeetingPickerOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef(null);
  const navigate = useNavigate();

  const activeDestinationIds = useMemo(
    () => new Set(destinations.map((destination) => destination.id)),
    [destinations],
  );

  const activeCategoryIds = useMemo(
    () => new Set(categories.map((category) => category.id)),
    [categories],
  );

  const destinationOptions = useMemo(() => {
    const options = destinations.map((destination) => ({
      ...destination,
      isInactive: false,
    }));

    if (
      tour?.destinationId &&
      !activeDestinationIds.has(tour.destinationId)
    ) {
      options.push({
        id: tour.destinationId,
        name: tour.destinationName || 'Current destination',
        isInactive: true,
      });
    }

    return options;
  }, [destinations, tour, activeDestinationIds]);

  const categoryOptions = useMemo(() => {
    const options = categories.map((category) => ({
      ...category,
      isInactive: false,
    }));

    if (draft.categoryId && !activeCategoryIds.has(draft.categoryId)) {
      options.push({
        id: draft.categoryId,
        name: draft.category || 'Current category',
        isInactive: true,
      });
    }

    return options;
  }, [categories, draft.categoryId, draft.category, activeCategoryIds]);

  const isLocked =
    !isNew &&
    (draft.status === TOUR_STATUS.pendingReview ||
      draft.status === TOUR_STATUS.archived);
  const isPublished =
    draft.status === TOUR_STATUS.published ||
    draft.status === TOUR_STATUS.hidden;
  const canDelete = !isNew && draft.status === TOUR_STATUS.draft;

  const pageHeader = (
    <header className={styles.header}>
      <div>
        <p className={styles.breadcrumb}>
          <span>Organizer</span>
          <span aria-hidden="true">/</span>
          <span>{isNew ? 'Add Tour' : 'Package Editor'}</span>
        </p>
        <h1 className={styles.title}>{isNew ? 'Add Tour' : 'Edit Tour'}</h1>
        <p className={styles.subtitle}>
          {isNew
            ? 'Create a draft, then submit it for administrator review.'
            : 'Update the details of this tour package.'}
        </p>
      </div>

      <span
        className={`${styles.editingBadge} ${
          statusClasses[draft.status] ?? styles.draft
        }`}
      >
        {getTourStatusLabel(draft.status)}
      </span>
    </header>
  );

  if (isNew && destinations.length === 0) {
    return (
      <div className={styles.page}>
        {pageHeader}
        <section className={styles.blocked} aria-labelledby="no-destinations">
          <h2 id="no-destinations" className={styles.blockedTitle}>
            {destinationsError
              ? 'Could not load active destinations'
              : 'No active destinations available'}
          </h2>
          <p className={styles.blockedText}>
            {destinationsError ||
              'Tours can only be created under an active destination. Ask an administrator to activate at least one destination, then try again.'}
          </p>
          <Link to="/operator/tours" className={styles.back}>
            Back to tours
          </Link>
        </section>
      </div>
    );
  }

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateNumericField = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value === '' ? '' : Number(value),
    }));
  };

  const handleDestinationChange = (destinationId) => {
    const destination = destinationOptions.find(
      (option) => option.id === destinationId,
    );

    setDraft((current) => ({
      ...current,
      destinationId,
      destination: destination?.name ?? '',
      destinationName: destination?.name ?? '',
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const category = categoryOptions.find((option) => option.id === categoryId);

    setDraft((current) => ({
      ...current,
      categoryId,
      category: category?.name ?? '',
    }));
  };

  const handleMeetingPointSave = (location) => {
    setDraft((current) => ({
      ...current,
      meetingPointLocation: location,
      meetingPoint: location.name,
      meetingPointAddress: location.address,
    }));
    setMeetingPickerOpen(false);
  };

  const handleMeetingPointRemove = () => {
    setDraft((current) => ({
      ...current,
      meetingPointLocation: null,
      meetingPoint: '',
      meetingPointAddress: '',
    }));
    setMeetingPickerOpen(false);
  };

  const handleDurationDaysChange = (value) => {
    const days = Math.max(1, Math.floor(Number(value) || 1));

    setDraft((current) => ({
      ...current,
      durationDays: days,
      durationNights: Math.max(0, days - 1),
    }));
  };

  const handleDurationNightsChange = (value) => {
    const nights = Math.max(0, Math.floor(Number(value) || 0));

    setDraft((current) => ({
      ...current,
      durationDays: nights + 1,
      durationNights: nights,
    }));
  };

  const updateItinerary = (index, value) => {
    setDraft((current) => ({
      ...current,
      itinerary: current.itinerary.map((item, itemIndex) =>
        itemIndex === index ? { ...item, text: value } : item,
      ),
    }));
  };

  const updateItineraryTitle = (index, value) => {
    setDraft((current) => ({
      ...current,
      itinerary: current.itinerary.map((item, itemIndex) =>
        itemIndex === index ? { ...item, title: value } : item,
      ),
    }));
  };

  const addItineraryDay = () => {
    setDraft((current) => ({
      ...current,
      itinerary: [
        ...current.itinerary,
        {
          day: current.itinerary.length + 1,
          title: '',
          text: '',
          location: null,
        },
      ],
    }));
  };

  const removeItineraryDay = (index) => {
    setDraft((current) => ({
      ...current,
      itinerary: current.itinerary
        .filter((item, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, day: itemIndex + 1 })),
    }));
  };

  const updateItineraryLocation = (index, location) => {
    setDraft((current) => ({
      ...current,
      itinerary: current.itinerary.map((item, itemIndex) =>
        itemIndex === index ? { ...item, location } : item,
      ),
    }));
  };

  const handlePhotoSelect = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0 || photoUploading) {
      return;
    }

    setPhotoError('');
    const remaining = 10 - draft.photos.length;

    if (remaining <= 0) {
      setPhotoError('You can add up to 10 tour photos.');
      return;
    }

    const selected = files.slice(0, remaining);

    if (files.length > remaining) {
      setPhotoError(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} can be added.`);
    }

    setPhotoUploading(true);
    setPhotoProgress(0);

    try {
      for (let index = 0; index < selected.length; index += 1) {
        const result = await uploadTourImage(
          selected[index],
          (percent) => {
            setPhotoProgress(
              Math.round(((index + percent / 100) / selected.length) * 100),
            );
          },
        );

        setDraft((current) => ({
          ...current,
          photos: [...current.photos, result.url],
        }));
      }
    } catch (error) {
      setPhotoError(
        error?.message || 'Could not upload that photo. Please try again.',
      );
    } finally {
      setPhotoUploading(false);
      setPhotoProgress(0);
    }
  };

  const removePhoto = (index) => {
    setDraft((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  };

  const toggleDiscount = (key) => {
    setDraft((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        [key]: !current.discounts[key],
      },
    }));
  };

  const persist = async (mode) => {
    setFormError('');

    if (destinationsError) {
      setFormError(destinationsError);
      return;
    }

    const errors = validateDraft(
      draft,
      mode,
      activeDestinationIds,
      activeCategoryIds,
    );

    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }

    const nextStatus =
      mode === 'draft' ? TOUR_STATUS.draft : TOUR_STATUS.pendingReview;
    setSaving(true);

    try {
      if (isNew) {
        await createOperatorTour(draft, nextStatus);
      } else {
        await updateOperatorTour(tour.id, draft, nextStatus);
      }

      navigate('/operator/tours', { replace: true });
    } catch (error) {
      setFormError(tourErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Delete draft “${draft.title || 'Untitled tour'}”? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setFormError('');
    setSaving(true);

    try {
      await deleteDraftTour(tour.id);
      navigate('/operator/tours', { replace: true });
    } catch (error) {
      setFormError(tourErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const actionNote = isPublished
    ? 'Saving changes will send this tour for re-approval and hide it from the public catalog until an administrator approves it.'
    : draft.status === TOUR_STATUS.rejected
      ? 'This tour was rejected. Update it, then save a draft or resubmit it for review.'
      : 'Drafts are only visible to you. Submit the tour when its details are complete.';

  return (
    <form
      className={styles.page}
      onSubmit={(event) => event.preventDefault()}
    >
      {pageHeader}

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      {isLocked && (
        <p className={styles.notice}>
          {draft.status === TOUR_STATUS.archived
            ? 'This tour is archived and cannot be edited.'
            : 'This tour is under review. Editing is locked until an administrator approves or rejects it.'}
        </p>
      )}

      {draft.status === TOUR_STATUS.rejected &&
        draft.rejectionReason && (
          <p className={styles.rejectionNotice} role="status">
            <strong>Rejected:</strong> {draft.rejectionReason}
          </p>
        )}

      {destinationsError && (
        <p className={styles.formError} role="alert">
          {destinationsError}
        </p>
      )}

      <fieldset className={styles.formFields} disabled={isLocked || saving}>
        <section
          className={`${styles.section} ${styles.details}`}
          aria-labelledby="tour-details-title"
        >
          <h2 id="tour-details-title" className={styles.sectionTitle}>
            Tour Details
          </h2>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span className={styles.label}>Tour package name</span>
              <input
                className={styles.input}
                value={draft.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="e.g. Baguio Highlands Escape"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Destination</span>
              <select
                className={`${styles.input} ${styles.select}`}
                value={draft.destinationId}
                onChange={(event) =>
                  handleDestinationChange(event.target.value)
                }
              >
                <option value="">Choose an active destination</option>
                {destinationOptions.map((destination) => (
                  <option
                    key={destination.id}
                    value={destination.id}
                    disabled={destination.isInactive}
                  >
                    {destination.name}
                    {destination.isInactive ? ' (inactive)' : ''}
                  </option>
                ))}
              </select>
              {destinations.length === 0 && (
                <span className={styles.fieldHint}>
                  No active destinations are currently available.
                </span>
              )}
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Short description</span>
            <input
              className={styles.input}
              value={draft.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Describe this experience for travelers"
            />
          </label>

          <div className={styles.threeCols}>
            <div className={styles.field}>
              <span className={styles.label}>Trip duration</span>
              <div className={styles.durationFields}>
                <label className={styles.durationField}>
                  <span className={styles.sublabel}>Days</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={styles.input}
                    value={draft.durationDays}
                    onChange={(event) =>
                      handleDurationDaysChange(event.target.value)
                    }
                  />
                </label>
                <label className={styles.durationField}>
                  <span className={styles.sublabel}>Nights</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    value={draft.durationNights}
                    onChange={(event) =>
                      handleDurationNightsChange(event.target.value)
                    }
                  />
                </label>
              </div>
              <span className={styles.durationHint}>
                {formatDurationLabel(
                  draft.durationDays,
                  draft.durationNights,
                )}{' '}
                · Nights adjust automatically
              </span>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Tour type / category</span>
              <select
                className={`${styles.input} ${styles.select}`}
                value={draft.categoryId}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
              >
                <option value="">Choose an active category</option>
                {categoryOptions.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={category.isInactive}
                  >
                    {category.name}
                    {category.isInactive ? ' (inactive)' : ''}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <span className={styles.fieldHint}>{categoriesError}</span>
              )}
              {!categoriesError && categories.length === 0 && (
                <span className={styles.fieldHint}>
                  No active categories are currently available.
                </span>
              )}
            </label>
            <div className={styles.field}>
              <span className={styles.label}>Meeting point</span>
              <div className={styles.locationRow}>
                <span
                  className={
                    draft.meetingPointLocation
                      ? styles.locationLabel
                      : styles.locationMissing
                  }
                  title={draft.meetingPointAddress}
                >
                  {draft.meetingPointLocation
                    ? draft.meetingPoint
                    : 'No meeting point pinned'}
                </span>
                <button
                  type="button"
                  className={styles.pinButton}
                  onClick={() => setMeetingPickerOpen(true)}
                >
                  {draft.meetingPointLocation
                    ? 'Change pin'
                    : 'Pin meeting point'}
                </button>
                {draft.meetingPointLocation && (
                  <button
                    type="button"
                    className={styles.removePin}
                    onClick={handleMeetingPointRemove}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.itinerary}`}
          aria-labelledby="daily-itinerary-title"
        >
          <h2 id="daily-itinerary-title" className={styles.sectionTitle}>
            Daily Itinerary
          </h2>

          <div className={styles.itineraryList}>
            {draft.itinerary.map((item, index) => (
              <div key={`${item.day}-${index}`} className={styles.itineraryRow}>
                <span className={styles.dayPill}>Day {item.day}</span>
                <div className={styles.itineraryMain}>
                  <div className={styles.itineraryFields}>
                    <label className={styles.itineraryField}>
                      <span className={styles.itineraryLabel}>Day title</span>
                      <input
                        className={styles.itineraryTitleInput}
                        value={item.title}
                        onChange={(event) =>
                          updateItineraryTitle(index, event.target.value)
                        }
                        placeholder="e.g. Arrival & city tour"
                      />
                    </label>
                    <label className={styles.itineraryField}>
                      <span className={styles.itineraryLabel}>
                        Description <span className={styles.optional}>(optional)</span>
                      </span>
                      <textarea
                        className={styles.itineraryTextarea}
                        value={item.text}
                        onChange={(event) =>
                          updateItinerary(index, event.target.value)
                        }
                        placeholder="What happens on this day?"
                        rows="2"
                      />
                    </label>
                  </div>
                  <div className={styles.locationRow}>
                    <span
                      className={
                        item.location
                          ? styles.locationLabel
                          : styles.locationMissing
                      }
                    >
                      {item.location
                        ? `Pinned: ${item.location.name}`
                        : 'No location pinned'}
                    </span>
                    <button
                      type="button"
                      className={styles.pinButton}
                      onClick={() => setPickerIndex(index)}
                    >
                      {item.location ? 'Change pin' : 'Pin location'}
                    </button>
                    {item.location && (
                      <button
                        type="button"
                        className={styles.removePin}
                        onClick={() => updateItineraryLocation(index, null)}
                      >
                        Remove pin
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.removeDay}
                  onClick={() => removeItineraryDay(index)}
                  aria-label={`Remove day ${item.day}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addDay}
            onClick={addItineraryDay}
          >
            + Add itinerary day
          </button>
        </section>

        <div className={styles.pricingGrid}>
          <section
            className={`${styles.section} ${styles.basePricing}`}
            aria-labelledby="base-pricing-title"
          >
            <h2 id="base-pricing-title" className={styles.sectionTitle}>
              Base pricing
            </h2>

            <div className={styles.threeCols}>
              <label className={styles.field}>
                <span className={styles.label}>Adult price (₱)</span>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  value={draft.price}
                  onChange={(event) =>
                    updateNumericField('price', event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Child price (₱)</span>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  value={draft.childPrice}
                  onChange={(event) =>
                    updateNumericField('childPrice', event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Infant price (₱)</span>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  value={draft.infantPrice}
                  onChange={(event) =>
                    updateNumericField('infantPrice', event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.threeCols}>
              <label className={styles.field}>
                <span className={styles.label}>
                  Minimum travelers for group rate
                </span>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  value={draft.minGroupSize}
                  onChange={(event) =>
                    updateNumericField('minGroupSize', event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Group discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.input}
                  value={draft.groupDiscount}
                  onChange={(event) =>
                    updateNumericField('groupDiscount', event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Taxes and fees</span>
                <select
                  className={`${styles.input} ${styles.select}`}
                  value={draft.taxesAndFees}
                  onChange={(event) =>
                    updateField('taxesAndFees', event.target.value)
                  }
                >
                  <option>Included in displayed price</option>
                  <option>Added at checkout</option>
                </select>
              </label>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.discountsCard}`}
            aria-labelledby="available-discounts-title"
          >
            <h2 id="available-discounts-title" className={styles.sectionTitle}>
              Available discounts
            </h2>

            <div className={styles.discountList}>
              {discountOptions.map((option) => (
                <div key={option.key} className={styles.discountRow}>
                  <div className={styles.discountCopy}>
                    <p className={styles.discountTitle}>{option.title}</p>
                    <p className={styles.discountMeta}>{option.meta}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.discounts[option.key]}
                    aria-label={`Toggle ${option.title}`}
                    className={`${styles.switch}${
                      draft.discounts[option.key] ? ` ${styles.switchOn}` : ''
                    }`}
                    onClick={() => toggleDiscount(option.key)}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section
          className={`${styles.section} ${styles.photos}`}
          aria-labelledby="tour-photos-title"
        >
          <div className={styles.photoHeader}>
            <h2 id="tour-photos-title" className={styles.sectionTitle}>
              Tour Photos
            </h2>
            <span className={styles.photoCount}>
              {draft.photos.length} / 10
            </span>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className={styles.fileInput}
            onChange={handlePhotoSelect}
          />

          <button
            type="button"
            className={styles.upload}
            onClick={() => photoInputRef.current?.click()}
            disabled={photoUploading || draft.photos.length >= 10}
          >
            {photoUploading
              ? `Uploading… ${photoProgress}%`
              : '+ Upload tour photos · JPG, PNG or WebP · Up to 10 images'}
          </button>

          {photoUploading && (
            <div
              className={styles.uploadProgress}
              role="progressbar"
              aria-label="Tour photo upload progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={photoProgress}
            >
              <span style={{ width: `${photoProgress}%` }} />
            </div>
          )}

          {photoError && (
            <p className={styles.photoError} role="alert">
              {photoError}
            </p>
          )}

          {draft.photos.length > 0 && (
            <div className={styles.photoGrid}>
              {draft.photos.map((photo, index) => (
                <div key={`${photo}-${index}`} className={styles.photoCard}>
                  <img
                    src={photo}
                    alt={`Tour photo ${index + 1}`}
                    className={styles.photoPreview}
                  />
                  <button
                    type="button"
                    className={styles.removePhoto}
                    onClick={() => removePhoto(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </fieldset>

      {meetingPickerOpen && (
        <MapPicker
          key={`meeting-${draft.meetingPointLocation?.lat ?? 'new'}-${draft.meetingPointLocation?.lng ?? 'new'}`}
          open
          initialLocation={draft.meetingPointLocation}
          title="Pin the meeting point"
          eyebrow="Meeting point"
          onClose={() => setMeetingPickerOpen(false)}
          onSave={handleMeetingPointSave}
          onRemove={handleMeetingPointRemove}
        />
      )}

      {pickerIndex !== null && draft.itinerary[pickerIndex] && (
        <MapPicker
          key={`${pickerIndex}-${draft.itinerary[pickerIndex].location?.lat ?? 'new'}-${draft.itinerary[pickerIndex].location?.lng ?? 'new'}`}
          open
          initialLocation={draft.itinerary[pickerIndex].location}
          onClose={() => setPickerIndex(null)}
          onSave={(location) => {
            updateItineraryLocation(pickerIndex, location);
            setPickerIndex(null);
          }}
          onRemove={() => {
            updateItineraryLocation(pickerIndex, null);
            setPickerIndex(null);
          }}
        />
      )}

      <div className={styles.actionsBar}>
        <p className={isPublished ? styles.warning : styles.actionNote}>
          {actionNote}
        </p>

        <div className={styles.actions}>
          {canDelete && (
            <button
              type="button"
              className={styles.delete}
              onClick={handleDelete}
              disabled={saving}
            >
              Delete Draft
            </button>
          )}

          {!isLocked && isPublished && (
            <button
              type="button"
              className={styles.publish}
              onClick={() => persist('review')}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes for Review'}
            </button>
          )}

          {!isLocked && !isPublished && (
            <>
              <button
                type="button"
                className={styles.saveDraft}
                onClick={() => persist('draft')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                type="button"
                className={styles.publish}
                onClick={() => persist('review')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Submit for Review'}
              </button>
            </>
          )}

          {isLocked && (
            <Link to="/operator/tours" className={styles.back}>
              Back to tours
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}

export default OperatorEditTourPage;
