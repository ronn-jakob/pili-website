import styles from './SettingsProfileForm.module.css';

function Field({
  id,
  label,
  name,
  value,
  onChange,
  type = 'text',
  autoComplete,
  full = false,
}) {
  return (
    <div className={`${styles.field}${full ? ` ${styles.full}` : ''}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function SettingsProfileForm({ draft, onChange }) {
  return (
    <>
      <section
        id="personal-info"
        className={styles.section}
        aria-labelledby="personal-info-title"
      >
        <h2 id="personal-info-title" className={styles.title}>
          Personal information
        </h2>
        <p className={styles.description}>
          This is how your name appears on bookings and receipts.
        </p>

        <div className={styles.grid}>
          <Field
            id="profile-first-name"
            label="First name"
            name="firstName"
            value={draft.firstName}
            onChange={onChange}
            autoComplete="given-name"
          />
          <Field
            id="profile-last-name"
            label="Last name"
            name="lastName"
            value={draft.lastName}
            onChange={onChange}
            autoComplete="family-name"
          />
          <Field
            id="profile-date-of-birth"
            label="Date of birth"
            name="dateOfBirth"
            value={draft.dateOfBirth}
            onChange={onChange}
            autoComplete="bday"
          />
          <Field
            id="profile-nationality"
            label="Nationality"
            name="nationality"
            value={draft.nationality}
            onChange={onChange}
            autoComplete="country-name"
          />
          <Field
            id="profile-gender"
            label="Gender"
            name="gender"
            value={draft.gender}
            onChange={onChange}
          />
          <Field
            id="profile-language"
            label="Preferred language"
            name="language"
            value={draft.language}
            onChange={onChange}
          />
        </div>
      </section>

      <section
        id="contact-details"
        className={styles.section}
        aria-labelledby="contact-details-title"
      >
        <h2 id="contact-details-title" className={styles.title}>
          Contact details
        </h2>
        <p className={styles.description}>
          Used for booking confirmations and trip updates.
        </p>

        <div className={styles.grid}>
          <Field
            id="profile-email"
            label="Email address"
            name="email"
            type="email"
            value={draft.email}
            onChange={onChange}
            autoComplete="email"
            full
          />
          <Field
            id="profile-mobile"
            label="Mobile number"
            name="mobile"
            type="tel"
            value={draft.mobile}
            onChange={onChange}
            autoComplete="tel"
          />
          <Field
            id="profile-alternate-phone"
            label="Alternate phone"
            name="alternatePhone"
            type="tel"
            value={draft.alternatePhone}
            onChange={onChange}
          />
          <Field
            id="profile-street"
            label="Street address"
            name="street"
            value={draft.street}
            onChange={onChange}
            autoComplete="street-address"
            full
          />
          <Field
            id="profile-city"
            label="City / Province"
            name="city"
            value={draft.city}
            onChange={onChange}
            autoComplete="address-level1"
          />
          <Field
            id="profile-postal-code"
            label="Postal code"
            name="postalCode"
            value={draft.postalCode}
            onChange={onChange}
            autoComplete="postal-code"
          />
        </div>
      </section>

      <section
        id="emergency-contact"
        className={styles.section}
        aria-labelledby="emergency-contact-title"
      >
        <h2 id="emergency-contact-title" className={styles.title}>
          Emergency contact
        </h2>
        <p className={styles.description}>
          Someone we can reach if needed during your trip.
        </p>

        <div className={styles.grid}>
          <Field
            id="profile-emergency-name"
            label="Full name"
            name="emergencyName"
            value={draft.emergencyName}
            onChange={onChange}
          />
          <Field
            id="profile-emergency-relationship"
            label="Relationship"
            name="emergencyRelationship"
            value={draft.emergencyRelationship}
            onChange={onChange}
          />
          <Field
            id="profile-emergency-phone"
            label="Phone number"
            name="emergencyPhone"
            type="tel"
            value={draft.emergencyPhone}
            onChange={onChange}
          />
        </div>
      </section>
    </>
  );
}

export default SettingsProfileForm;
