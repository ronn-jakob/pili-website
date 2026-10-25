import styles from './Container.module.css';

function Container({ children, className = '', size = 'default' }) {
  const sizeClass = styles[size] || styles.default;

  return (
    <div className={`${styles.container} ${sizeClass} ${className}`}>
      {children}
    </div>
  );
}

export default Container;
