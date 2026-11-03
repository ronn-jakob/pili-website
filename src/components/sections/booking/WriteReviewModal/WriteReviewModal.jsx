import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  createReview,
  reviewErrorMessage,
} from '../../../../lib/reviews';
import styles from './WriteReviewModal.module.css';

function WriteReviewModal({ booking, onClose, onSubmitted }) {
  const titleId = useId();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, submitting]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Choose a star rating.');
      return;
    }

    if (!title.trim()) {
      setError('Add a short review title.');
      return;
    }

    if (!comment.trim()) {
      setError('Write a short review.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const review = await createReview({
        bookingId: booking.id,
        rating,
        title,
        comment,
      });

      onSubmitted(review);
    } catch (reviewError) {
      setError(reviewErrorMessage(reviewError));
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close review form"
          disabled={submitting}
        >
          ×
        </button>

        <p className={styles.eyebrow}>Your trip</p>
        <h2 id={titleId} className={styles.title}>
          Write a review
        </h2>
        <p className={styles.subtitle}>
          {booking.tourSnapshot?.title || 'Tour booking'} ·{' '}
          {booking.reference}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.ratingField}>
            <legend>Rating</legend>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.star}${
                    value <= rating ? ` ${styles.starActive}` : ''
                  }`}
                  aria-label={`${value} star${
                    value === 1 ? '' : 's'
                  }`}
                  aria-pressed={value <= rating}
                  onClick={() => {
                    setRating(value);
                    setError('');
                  }}
                  disabled={submitting}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>Review title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError('');
              }}
              maxLength={120}
              placeholder="Summarize your experience"
              disabled={submitting}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Review</span>
            <textarea
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setError('');
              }}
              rows={5}
              maxLength={1200}
              placeholder="What did you enjoy? What should future travelers know?"
              disabled={submitting}
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <p className={styles.note}>
            Reviews are published after administrator approval.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default WriteReviewModal;
