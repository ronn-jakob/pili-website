import { NavLink } from 'react-router-dom';
import { adminNav } from '../../../data/adminNav';
import styles from './AdminSidebar.module.css';

function NavIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 19c0-3.1 2.5-5.2 5.5-5.2s5.5 2.1 5.5 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 5.2a3 3 0 0 1 0 5.8M17.5 14.2c1.9.5 3.2 2.2 3.2 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'operators':
      return (
        <svg {...common}>
          <path d="M4 20V6.5L12 3v17M12 20h8V9.5l-8-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 8h2M7 12h2M7 16h2M15 11h2M15 15h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'packages':
      return (
        <svg {...common}>
          <path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2 2 0 0 0 0-3.6V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 7v10" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 3" strokeLinecap="round" />
        </svg>
      );
    case 'reservations':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3v4M16 3v4M3.5 10h17M9 14.5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'schedule':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cancellations':
      return (
        <svg {...common}>
          <path d="M4.5 9A8 8 0 1 1 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4.5 4.5V9H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'reviews':
      return (
        <svg {...common}>
          <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'categories':
      return (
        <svg {...common}>
          <path d="M4 7.5V5a1.5 1.5 0 0 1 1.5-1.5H9L11 6h7.5A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'destinations':
      return (
        <svg {...common}>
          <path d="M19.5 10.2c0 5.1-7.5 10.3-7.5 10.3S4.5 15.3 4.5 10.2a7.5 7.5 0 1 1 15 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'access':
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function AdminSidebar({
  items = adminNav,
  eyebrow = 'Admin menu',
  ariaLabel = 'Admin sections',
}) {
  return (
    <aside className={styles.sidebar}>
      <p className={styles.eyebrow}>{eyebrow}</p>

      <nav className={styles.nav} aria-label={ariaLabel}>
        {items.map((item) =>
          item.available ? (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.item}${isActive ? ` ${styles.active}` : ''}`
              }
              title={item.label}
            >
              <span className={styles.icon}>
                <NavIcon name={item.icon} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ) : (
            <span
              key={item.id}
              className={`${styles.item} ${styles.inert}`}
              aria-disabled="true"
              title={`${item.label} — coming soon`}
            >
              <span className={styles.icon}>
                <NavIcon name={item.icon} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
