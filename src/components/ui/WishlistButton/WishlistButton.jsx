import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useTravelerAuth from '../../../context/useTravelerAuth';
import useWishlist from '../../../context/useWishlist';
import styles from './WishlistButton.module.css';

function HeartIcon() {
  return (
    <svg
      className={styles.icon}
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.29167 3.125C4.41563 3.125 2.08333 5.43333 2.08333 8.28125C2.08333 10.5802 2.99479 16.0365 11.9667 21.5521C12.1276 21.6493 12.312 21.7007 12.5 21.7007C12.688 21.7007 12.8724 21.6493 13.0333 21.5521C22.0063 16.0365 22.9167 10.5802 22.9167 8.28125C22.9167 5.43333 20.5844 3.125 17.7083 3.125C14.8323 3.125 12.5 6.25 12.5 6.25C12.5 6.25 10.1677 3.125 7.29167 3.125Z"
        fill="currentColor"
        stroke="rgba(0, 0, 0, 0.63)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WishlistButton({
  tourId = '',
  itemName,
  className = '',
  raised = false,
  tone = 'default',
}) {
  const { traveler } = useTravelerAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const wishlisted = tourId ? isWishlisted(tourId) : false;
  const classes = [
    styles.button,
    raised ? styles.raised : '',
    tone === 'dark' ? styles.dark : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = async () => {
    if (!tourId || pending) {
      return;
    }

    if (!traveler) {
      const from = `${location.pathname}${location.search}`;
      navigate(`/?auth=login&from=${encodeURIComponent(from)}`);
      return;
    }

    setPending(true);

    try {
      await toggleWishlist(tourId);
    } catch {
      // The context reverts the optimistic state and exposes the error.
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={classes}
      aria-label={`${wishlisted ? 'Remove' : 'Add'} ${itemName} ${
        wishlisted ? 'from' : 'to'
      } wishlist`}
      aria-pressed={wishlisted}
      disabled={!tourId || pending}
      onClick={handleClick}
    >
      <HeartIcon />
    </button>
  );
}

export default WishlistButton;
