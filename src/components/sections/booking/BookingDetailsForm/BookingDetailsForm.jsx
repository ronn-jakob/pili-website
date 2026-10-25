import styles from './BookingDetailsForm.module.css';

const pickupOptions = [
  'Select a meeting point',
  'Airport arrival hall',
  'City center',
  'Hotel lobby',
];

function BookingDetailsForm({ onContinue, initialDetails = {} }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    onContinue?.({
      pickup: data.get('pickup') ?? '',
      hotel: data.get('hotel') ?? '',
      firstName: data.get('firstName') ?? '',
      lastName: data.get('lastName') ?? '',
      mobile: data.get('mobile') ?? '',
      email: data.get('email') ?? '',
      promo: data.get('promo') ?? '',
      requests: data.get('requests') ?? '',
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.group}>
        <label htmlFor="pickup-location" className={styles.label}>
          Pickup location
        </label>
        <p className={styles.helper}>Where should we meet you?</p>
        <select
          id="pickup-location"
          name="pickup"
          className={`${styles.field} ${styles.tall}`}
          defaultValue={initialDetails.pickup ?? ''}
        >
          {pickupOptions.map((option, index) => (
            <option key={option} value={index === 0 ? '' : option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="hotel" className={styles.label}>
          Where are you staying?
        </label>
        <p className={styles.helper}>Hotel or accommodation name &amp; address</p>
        <input
          id="hotel"
          type="text"
          name="hotel"
          className={`${styles.field} ${styles.tall}`}
          placeholder="e.g. Manila Hotel, Rizal Park"
          autoComplete="street-address"
          defaultValue={initialDetails.hotel ?? ''}
        />
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Lead traveler</legend>
        <p className={styles.helper}>
          This person will receive booking updates
        </p>

        <div className={styles.twoColumns}>
          <label className={styles.smallField}>
            <span>First name</span>
            <input
              type="text"
              name="firstName"
              className={styles.field}
              placeholder="Juan"
              autoComplete="given-name"
              defaultValue={initialDetails.firstName ?? ''}
            />
          </label>
          <label className={styles.smallField}>
            <span>Last name</span>
            <input
              type="text"
              name="lastName"
              className={styles.field}
              placeholder="Dela Cruz"
              autoComplete="family-name"
              defaultValue={initialDetails.lastName ?? ''}
            />
          </label>
          <label className={styles.smallField}>
            <span>Mobile number</span>
            <input
              type="tel"
              name="mobile"
              className={styles.field}
              placeholder="+63 9XX XXX XXXX"
              autoComplete="tel"
              defaultValue={initialDetails.mobile ?? ''}
            />
          </label>
          <label className={styles.smallField}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              className={styles.field}
              placeholder="you@email.com"
              autoComplete="email"
              defaultValue={initialDetails.email ?? ''}
            />
          </label>
        </div>
      </fieldset>

      <div className={styles.group}>
        <label htmlFor="promo-code" className={styles.label}>
          Promo code (optional)
        </label>
        <div className={styles.promoRow}>
          <input
            id="promo-code"
            type="text"
            name="promo"
            className={`${styles.field} ${styles.tall} ${styles.promoInput}`}
            placeholder="Enter code"
            defaultValue={initialDetails.promo ?? ''}
          />
          <button type="button" className={styles.applyButton}>
            Apply
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="special-requests" className={styles.label}>
          Special requests
        </label>
        <textarea
          id="special-requests"
          name="requests"
          className={styles.textarea}
          placeholder="Allergies, accessibility needs, or anything we should know…"
          defaultValue={initialDetails.requests ?? ''}
        />
      </div>

      <p className={styles.terms}>
        By continuing you agree to Pili’s Terms of Use and Privacy Policy.
      </p>

      <div className={styles.divider} />

      <div className={styles.footer}>
        <p className={styles.footerNote}>
          You can review everything again on the next step.
        </p>
        <button type="submit" className={styles.continueButton}>
          Continue to review
        </button>
      </div>
    </form>
  );
}

export default BookingDetailsForm;
