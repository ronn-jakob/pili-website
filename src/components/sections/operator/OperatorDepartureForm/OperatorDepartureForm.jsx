import { useEffect, useState } from 'react';
import MapPicker from '../../../ui/MapPicker/MapPicker';
import {
  createDeparture,
  departureErrorMessage,
  updateDeparture,
} from '../../../../lib/departures';
import { isValidLocation } from '../../../../lib/maps';
import styles from './OperatorDepartureForm.module.css';

function toLocalInput(date) {
  const value = date ?? new Date();
  const local = new Date(
    value.getTime() - value.getTimezoneOffset() * 60000,
  );
  return local.toISOString().slice(0, 16);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function defaultStart() {
  const date = addDays(new Date(), 30);
  date.setHours(7, 0, 0, 0);
  return date;
}

function defaultEnd(start) {
  const date = new Date(start);
  date.setHours(18, 0, 0, 0);
  return date;
}

function defaultCutoff(start) {
  const date = addDays(new Date(start), -7);
  return date;
}

function OperatorDepartureForm({ tour, departure, onClose, onSaved }) {
  const editing = Boolean(departure);
  const start = departure?.startAt ?? defaultStart();
  const end = departure?.endAt ?? defaultEnd(start);
  const cutoff = departure?.cutoffAt ?? defaultCutoff(start);
  const [form, setForm] = useState({
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    meetingTime: departure?.meetingTime ?? '07:00',
    cutoffAt: toLocalInput(cutoff),
    capacity: departure?.capacity ?? 20,
    timezone: departure?.timezone ?? 'Asia/Manila',
  });
  const [meetingPoint, setMeetingPoint] = useState(
    departure?.meetingPoint ?? tour.meetingPointLocation ?? null,
  );
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving && !mapOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving, mapOpen]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const startDate = new Date(form.startAt);
    const endDate = new Date(form.endAt);
    const cutoffDate = new Date(form.cutoffAt);
    const capacity = Number(form.capacity);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError('Enter valid start and end dates.');
      return;
    }

    if (Number.isNaN(cutoffDate.getTime())) {
      setError('Enter a valid booking cutoff.');
      return;
    }

    if (endDate <= startDate) {
      setError('The end date must be after the start date.');
      return;
    }

    if (cutoffDate >= startDate) {
      setError('The booking cutoff must be before the departure starts.');
      return;
    }

    if (!form.meetingTime) {
      setError('Enter a meeting time.');
      return;
    }

    if (!isValidLocation(meetingPoint)) {
      setError('Pin the departure meeting point.');
      return;
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      setError('Capacity must be at least one traveler.');
      return;
    }

    if (capacity < departure?.bookedTravelers) {
      setError('Capacity cannot be lower than the booked travelers.');
      return;
    }

    setSaving(true);

    try {
      const values = { ...form, capacity, meetingPoint };

      if (editing) {
        await updateDeparture(
          departure.id,
          values,
          departure.bookedTravelers,
        );
      } else {
        await createDeparture(tour, values);
      }

      onSaved();
    } catch (saveError) {
      setError(departureErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="departure-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Departure schedule</p>
            <h2 id="departure-form-title" className={styles.title}>
              {editing ? 'Edit departure' : 'Add departure'}
            </h2>
            <p className={styles.subtitle}>{tour.title}</p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close departure form"
            disabled={saving}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Schedule</h3>
            <div className={styles.twoCols}>
              <label className={styles.field}>
                <span className={styles.label}>Departure start</span>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={form.startAt}
                  onChange={(event) =>
                    updateField('startAt', event.target.value)
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Departure end</span>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={form.endAt}
                  onChange={(event) =>
                    updateField('endAt', event.target.value)
                  }
                  required
                />
              </label>
            </div>
            <div className={styles.threeCols}>
              <label className={styles.field}>
                <span className={styles.label}>Meeting time</span>
                <input
                  type="time"
                  className={styles.input}
                  value={form.meetingTime}
                  onChange={(event) =>
                    updateField('meetingTime', event.target.value)
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Booking cutoff</span>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={form.cutoffAt}
                  onChange={(event) =>
                    updateField('cutoffAt', event.target.value)
                  }
                  required
                />
              </label>
              <div className={styles.field}>
                <span className={styles.label}>Timezone</span>
                <span className={styles.readonly}>Asia/Manila (PHT)</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Capacity</h3>
            <div className={styles.twoCols}>
              <label className={styles.field}>
                <span className={styles.label}>Maximum travelers</span>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  value={form.capacity}
                  onChange={(event) =>
                    updateField('capacity', event.target.value)
                  }
                  required
                />
              </label>
              <div className={styles.field}>
                <span className={styles.label}>Already booked</span>
                <span className={styles.readonly}>
                  {departure?.bookedTravelers ?? 0} travelers
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Meeting point</h3>
            <div className={styles.locationRow}>
              <span
                className={
                  meetingPoint ? styles.location : styles.locationMissing
                }
              >
                {meetingPoint
                  ? `${meetingPoint.name}${
                      meetingPoint.address ? ` · ${meetingPoint.address}` : ''
                    }`
                  : 'No meeting point pinned'}
              </span>
              <button
                type="button"
                className={styles.pin}
                onClick={() => setMapOpen(true)}
              >
                {meetingPoint ? 'Change pin' : 'Pin meeting point'}
              </button>
            </div>
          </section>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add departure'}
            </button>
          </footer>
        </form>

        {mapOpen && (
          <MapPicker
            key={`${meetingPoint?.lat ?? 'new'}-${meetingPoint?.lng ?? 'new'}`}
            open
            initialLocation={meetingPoint}
            title="Pin the departure meeting point"
            eyebrow="Departure meeting point"
            onClose={() => setMapOpen(false)}
            onSave={(location) => {
              setMeetingPoint(location);
              setMapOpen(false);
            }}
            onRemove={() => {
              setMeetingPoint(null);
              setMapOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default OperatorDepartureForm;
