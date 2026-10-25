import { Link } from 'react-router-dom';
import styles from './Logo.module.css';
import logoName from '../../../Images/pili-name.svg';
import logoIcon from '../../../Images/pili-logo.svg';

function Logo({
  variant = 'full',
  size = 'medium',
  className = '',
  link = true,
  to = '/',
}) {
  const sizeClass = styles[size] || styles.medium;
  const classes = `${styles.logo} ${sizeClass} ${className}`;
  const content = (
    <>
      <span className={styles.iconWrapper}>
        <img
          src={logoIcon}
          alt=""
          className={styles.icon}
          aria-hidden="true"
        />
      </span>
      {variant === 'full' && (
        <span className={styles.nameWrapper}>
          <img
            src={logoName}
            alt="Pili Tour and Travel"
            className={styles.name}
          />
        </span>
      )}
    </>
  );

  if (!link) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}

export default Logo;
