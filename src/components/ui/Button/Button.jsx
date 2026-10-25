import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  shape = 'pill',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.medium;
  const shapeClass = styles[shape] || styles.pill;

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${shapeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner}></span>}
      <span className={loading ? styles.loadingText : ''}>{children}</span>
    </button>
  );
}

export default Button;
