import styles from './CarouselButton.module.css';

/**
 * Circular "next" control used by the destination and package carousels.
 * Positioning is owned by the section (pass `className`); this component only
 * renders the 48px control and its ep:arrow-left-bold glyph.
 */
function CarouselButton({
  className,
  label = 'Show more',
  direction = 'next',
  ...props
}) {
  return (
    <button
      type="button"
      className={`${styles.button}${className ? ` ${className}` : ''}`}
      aria-label={label}
      {...props}
    >
      <svg
        className={`${styles.icon}${
          direction === 'prev' ? ` ${styles.iconPrev}` : ''
        }`}
        xmlns="http://www.w3.org/2000/svg"
        width="22.4"
        height="22.4"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18.7359 2.86289C19.064 3.19107 19.2484 3.63613 19.2484 4.1002C19.2484 4.56426 19.064 5.00932 18.7359 5.3375L10.0734 14L18.7359 22.6625C19.0447 22.9942 19.2128 23.4327 19.2048 23.8857C19.1968 24.3388 19.0134 24.7711 18.6932 25.0917C18.3729 25.4123 17.9408 25.5961 17.4878 25.6046C17.0347 25.6131 16.5961 25.4455 16.2641 25.1371L6.36289 15.2387C6.03478 14.9105 5.85046 14.4654 5.85046 14.0014C5.85046 13.5373 6.03478 13.0922 6.36289 12.7641L16.2613 2.86289C16.5895 2.53478 17.0346 2.35046 17.4986 2.35046C17.9627 2.35046 18.4078 2.53478 18.7359 2.86289Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export default CarouselButton;
