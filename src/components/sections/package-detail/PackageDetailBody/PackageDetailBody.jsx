import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItineraryMapModal from '../../../ui/ItineraryMapModal/ItineraryMapModal';
import { formatMoney } from '../../../../utils/booking';
import {
  clampTravelersToSlots,
  DEFAULT_TRAVELERS,
  MAX_TRAVELERS,
  travelerLineItems,
  travelerSubtotal,
  travelerTotal,
} from '../../../../utils/travelers';
import styles from './PackageDetailBody.module.css';

const tabs = [
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'exclusions', label: 'Exclusions' },
  { id: 'rules', label: 'Rules' },
];

const markers = {
  inclusions: '✓',
  exclusions: '✕',
  rules: '•',
};

function toDateInput(date) {
  if (!date) {
    return '';
  }

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return local.toISOString().slice(0, 10);
}

function formatDepartureLabel(departure) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(departure.startAt);
}

function PackageDetailBody({ pkg, itinerary, departures = [], bookable = true }) {
  const navigate = useNavigate();
  const [travelers, setTravelers] = useState({
    ...DEFAULT_TRAVELERS,
  });
  const [date, setDate] = useState('2026-11-12');
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [activeTab, setActiveTab] = useState('inclusions');
  const [activeMapDay, setActiveMapDay] = useState(null);

  const subtotal = travelerSubtotal(pkg, travelers);
  const total = subtotal + pkg.serviceFee;
  const travelerRows = travelerLineItems(pkg, travelers);
  const totalTravelers = travelerTotal(travelers);
  const days = itinerary ?? pkg.itinerary;
  const selectedDeparture =
    departures.find((departure) => departure.id === selectedDepartureId) ??
    departures[0] ??
    null;
  const dateValue = selectedDeparture
    ? toDateInput(selectedDeparture.startAt)
    : date;
  const remainingSlots = selectedDeparture
    ? Math.max(
        0,
        selectedDeparture.capacity - selectedDeparture.bookedTravelers,
      )
    : 0;
  const maxTravelers = selectedDeparture
    ? Math.min(remainingSlots, MAX_TRAVELERS)
    : MAX_TRAVELERS;
  const hasEnoughSlots =
    !selectedDeparture || totalTravelers <= maxTravelers;

  const updateTraveler = (field, delta) => {
    setTravelers((current) => {
      const minimum = field === 'adults' ? 1 : 0;
      const nextCount = current[field] + delta;

      if (nextCount < minimum) {
        return current;
      }

      const nextTotal =
        current.total - current[field] + nextCount;

      if (nextTotal > maxTravelers) {
        return current;
      }

      return {
        ...current,
        [field]: nextCount,
        total: nextTotal,
      };
    });
  };

  const handleDepartureChange = (departureId) => {
    setSelectedDepartureId(departureId);

    const departure = departures.find(
      (item) => item.id === departureId,
    );
    const slots = departure
      ? Math.max(
          0,
          departure.capacity - departure.bookedTravelers,
        )
      : MAX_TRAVELERS;

    setTravelers((current) =>
      clampTravelersToSlots(current, slots),
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <section className={styles.block}>
            <h2 className={styles.heading}>About this tour</h2>
            <p className={styles.description}>{pkg.description}</p>
          </section>

          <section className={styles.block}>
            <h2 className={styles.heading}>Itinerary</h2>
            <div className={styles.days}>
              {days.map((day, index) => (
                <article
                  key={`${day.title}-${index}`}
                  className={styles.day}
                >
                  {day.image && (
                    <img src={day.image} alt="" className={styles.dayImage} />
                  )}
                  <div className={styles.dayCopy}>
                    <h3 className={styles.dayTitle}>{day.title}</h3>
                    <p className={styles.dayText}>{day.text}</p>
                    {day.location && (
                      <button
                        type="button"
                        className={styles.mapButton}
                        onClick={() =>
                          setActiveMapDay({
                            ...day,
                            day: index + 1,
                            title: day.title || `Day ${index + 1}`,
                          })
                        }
                      >
                        <span aria-hidden="true">⌖</span>
                        View {day.location.name} on map
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.tabsSection}>
            <div className={styles.tabRow} role="tablist" aria-label="Package details">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`${styles.tab}${
                    activeTab === tab.id ? ` ${styles.tabActive}` : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ul
              className={styles.detailList}
              role="tabpanel"
              aria-label={activeTab}
            >
              {pkg[activeTab].map((item) => (
                <li key={item} className={styles.detailRow}>
                  <span
                    className={`${styles.marker} ${styles[activeTab]}`}
                    aria-hidden="true"
                  >
                    {markers[activeTab]}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar} aria-label="Booking">
          <div className={styles.priceBlock}>
            <span className={styles.from}>from</span>
            <span className={styles.price}>{pkg.priceLabel}</span>
            <span className={styles.perPerson}>per person</span>
          </div>

          <div className={styles.divider} />

          {departures.length > 0 ? (
            <>
              <label className={styles.fieldLabel} htmlFor="departure-date">
                Select departure
              </label>
              <select
                id="departure-date"
                className={styles.dateInput}
                value={selectedDeparture?.id ?? ''}
                onChange={(event) =>
                  handleDepartureChange(event.target.value)
                }
              >
                <option value="">Choose a departure</option>
                {departures.map((departure) => {
                  const slots = Math.max(
                    0,
                    departure.capacity - departure.bookedTravelers,
                  );

                  return (
                    <option key={departure.id} value={departure.id}>
                      {formatDepartureLabel(departure)} ·{' '}
                      {departure.meetingTime || 'Time TBA'} · {slots} slots
                    </option>
                  );
                })}
              </select>
              <p className={styles.slots}>
                ✓ {remainingSlots} slots available for this date
              </p>
            </>
          ) : (
            <>
              <label className={styles.fieldLabel} htmlFor="departure-date">
                Select departure date
              </label>
              <input
                id="departure-date"
                type="date"
                className={styles.dateInput}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <p className={styles.slots}>
                Check availability for this date
              </p>
            </>
          )}

          <p className={styles.fieldLabel}>Travelers</p>
          <div className={styles.travelerGroup}>
            <div className={styles.travelerRow}>
              <div className={styles.travelerInfo}>
                <span className={styles.travelerLabel}>Adults</span>
                <span className={styles.travelerHint}>Age 12+</span>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Remove adult"
                  disabled={travelers.adults <= 1}
                  onClick={() => updateTraveler('adults', -1)}
                >
                  −
                </button>
                <span className={styles.count} aria-live="polite">
                  {travelers.adults}
                </span>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Add adult"
                  disabled={
                    maxTravelers <= 0 ||
                    travelers.total >= maxTravelers
                  }
                  onClick={() => updateTraveler('adults', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.travelerRow}>
              <div className={styles.travelerInfo}>
                <span className={styles.travelerLabel}>Children</span>
                <span className={styles.travelerHint}>Age 3–11</span>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Remove child"
                  disabled={travelers.children <= 0}
                  onClick={() => updateTraveler('children', -1)}
                >
                  −
                </button>
                <span className={styles.count} aria-live="polite">
                  {travelers.children}
                </span>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Add child"
                  disabled={
                    maxTravelers <= 0 ||
                    travelers.total >= maxTravelers
                  }
                  onClick={() => updateTraveler('children', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.travelerRow}>
              <div className={styles.travelerInfo}>
                <span className={styles.travelerLabel}>Infants</span>
                <span className={styles.travelerHint}>Under 3</span>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Remove infant"
                  disabled={travelers.infants <= 0}
                  onClick={() => updateTraveler('infants', -1)}
                >
                  −
                </button>
                <span className={styles.count} aria-live="polite">
                  {travelers.infants}
                </span>
                <button
                  type="button"
                  className={styles.counterButton}
                  aria-label="Add infant"
                  disabled={
                    maxTravelers <= 0 ||
                    travelers.total >= maxTravelers
                  }
                  onClick={() => updateTraveler('infants', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <p className={styles.travelerTotal}>
              {maxTravelers <= 0
                ? 'No slots available for this departure.'
                : totalTravelers > maxTravelers
                  ? `Only ${maxTravelers} slots available. Reduce travelers to continue.`
                  : `Total: ${totalTravelers} of ${maxTravelers} available ${
                      maxTravelers === 1 ? 'slot' : 'slots'
                    }`}
            </p>
          </div>

          <p className={styles.fieldLabel}>Price Summary</p>
          <div className={styles.summary}>
            {travelerRows.map((row) => (
              <div key={row.key} className={styles.summaryRow}>
                <span>
                  {row.label} × {row.count}
                </span>
                <span>{formatMoney(row.amount, pkg.currency)}</span>
              </div>
            ))}
            <div className={styles.summaryRow}>
              <span>Service fee</span>
              <span>{formatMoney(pkg.serviceFee, pkg.currency)}</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>{formatMoney(total, pkg.currency)}</strong>
          </div>

          {bookable && selectedDeparture && hasEnoughSlots ? (
            <button
              type="button"
              className={styles.bookButton}
              onClick={() =>
                navigate(`/packages/${pkg.id}/book`, {
                  state: {
                    date: dateValue,
                    travelers,
                    departureId: selectedDeparture.id,
                  },
                })
              }
            >
              Book Now
            </button>
          ) : (
            <p className={styles.comingSoon}>
              {bookable
                ? selectedDeparture
                  ? maxTravelers <= 0
                    ? 'No slots available for this departure.'
                    : `Only ${maxTravelers} slots available. Reduce travelers to continue.`
                  : departures.length > 0
                    ? 'Choose an available departure to continue.'
                    : 'No upcoming departures are available yet.'
                : 'Online booking for this tour is coming soon.'}
            </p>
          )}
          <p className={styles.cancel}>
            Free cancellation up to {pkg.cancellationHours} hours before
            departure
          </p>
        </aside>
      </div>

      {activeMapDay && (
        <ItineraryMapModal
          item={activeMapDay}
          onClose={() => setActiveMapDay(null)}
        />
      )}
    </section>
  );
}

export default PackageDetailBody;
