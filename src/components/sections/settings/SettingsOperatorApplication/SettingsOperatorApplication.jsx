import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useTravelerAuth from '../../../../context/useTravelerAuth';
import {
  getOperatorApplication,
  operatorApplicationErrorMessage,
  submitOperatorApplication,
} from '../../../../lib/operatorApplications';
import styles from './SettingsOperatorApplication.module.css';

function emptyForm(traveler, application) {
  return {
    businessName: application?.businessName ?? '',
    contactName:
      application?.contactName ??
      `${traveler?.firstName ?? ''} ${traveler?.lastName ?? ''}`.trim(),
    contactEmail: application?.contactEmail ?? traveler?.email ?? '',
    contactPhone: application?.contactPhone ?? traveler?.phone ?? '',
    description: application?.description ?? '',
  };
}

function formatDate(value) {
  const date = value?.toDate ? value.toDate() : null;

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function SettingsOperatorApplication() {
  const { traveler, isOperator } = useTravelerAuth();
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(() => emptyForm(traveler));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!traveler) {
      return undefined;
    }

    let active = true;

    getOperatorApplication(traveler.uid)
      .then((item) => {
        if (active) {
          setApplication(item);
          setForm(emptyForm(traveler, item));
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load your operator application.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [traveler]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!traveler || submitting) {
      return;
    }

    if (
      !form.businessName.trim() ||
      !form.contactName.trim() ||
      !form.contactEmail.trim() ||
      !form.contactPhone.trim() ||
      !form.description.trim()
    ) {
      setError('Complete every field before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setStatus('');

    try {
      await submitOperatorApplication(traveler.uid, form);
      const next = await getOperatorApplication(traveler.uid);
      setApplication(next);
      setStatus('Application submitted. An administrator will review it.');
    } catch (submitError) {
      setError(operatorApplicationErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (!traveler) {
    return null;
  }

  return (
    <section
      id="operator-application"
      className={styles.card}
      aria-labelledby="operator-application-title"
    >
      <div className={styles.header}>
        <div>
          <h2 id="operator-application-title" className={styles.title}>
            Become a tour operator
          </h2>
          <p className={styles.subtitle}>
            Apply with your business details. Once approved, this same account
            can access the operator console.
          </p>
        </div>
        {isOperator && <span className={styles.approvedBadge}>Approved</span>}
      </div>

      {loading ? (
        <p className={styles.state}>Loading application status…</p>
      ) : isOperator || application?.status === 'approved' ? (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Your operator account is active.</p>
          <p className={styles.panelText}>
            You can keep using Pili as a traveler and open the operator
            dashboard with the same account.
          </p>
          <Link to="/operator" className={styles.primaryLink}>
            Open operator dashboard
          </Link>
        </div>
      ) : application?.status === 'pending' ? (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Application pending review</p>
          <p className={styles.panelText}>
            Submitted {formatDate(application.submittedAt) || 'recently'}.
            An administrator will review your business details.
          </p>
          <dl className={styles.summary}>
            <div>
              <dt>Business</dt>
              <dd>{application.businessName}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{application.contactName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{application.contactEmail}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <>
          {application?.status === 'rejected' && (
            <div className={styles.rejected} role="status">
              <strong>Previous application rejected.</strong>
              {application.rejectionReason
                ? ` ${application.rejectionReason}`
                : ' Update your details and submit again.'}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Business name</span>
                <input
                  className={styles.input}
                  name="businessName"
                  value={form.businessName}
                  onChange={(event) =>
                    handleChange('businessName', event.target.value)
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Contact name</span>
                <input
                  className={styles.input}
                  name="contactName"
                  value={form.contactName}
                  onChange={(event) =>
                    handleChange('contactName', event.target.value)
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Contact email</span>
                <input
                  type="email"
                  className={styles.input}
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={(event) =>
                    handleChange('contactEmail', event.target.value)
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Contact phone</span>
                <input
                  className={styles.input}
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={(event) =>
                    handleChange('contactPhone', event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>About your tours</span>
              <textarea
                className={styles.textarea}
                name="description"
                rows={4}
                value={form.description}
                onChange={(event) =>
                  handleChange('description', event.target.value)
                }
                required
              />
            </label>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            {status && (
              <p className={styles.status} role="status">
                {status}
              </p>
            )}

            <button
              type="submit"
              className={styles.submit}
              disabled={submitting}
            >
              {submitting
                ? 'Submitting…'
                : application?.status === 'rejected'
                  ? 'Resubmit application'
                  : 'Submit application'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default SettingsOperatorApplication;
