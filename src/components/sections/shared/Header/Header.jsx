import { useState } from 'react';
import {
  Link,
  NavLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import styles from './Header.module.css';
import Container from '../../../ui/Container/Container';
import Logo from '../../../ui/Logo/Logo';
import Button from '../../../ui/Button/Button';
import AuthModal from '../../../ui/AuthModal/AuthModal';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import useTravelerAuth from '../../../../context/useTravelerAuth';
import useReviewableBookings from '../../../../hooks/useReviewableBookings';
import useUnreadNotifications from '../../../../hooks/useUnreadNotifications';

const mainNavLinks = [
  { label: 'Home', to: '/#top' },
  { label: 'About us', to: '/#why-choose' },
  { label: 'Contacts', to: '/#contacts' },
  { label: 'Wishlist', to: '/wishlist' },
];

const secondaryNavLinks = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'Special Offers', href: '/offers' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    traveler,
    isOperator,
    loading,
    login,
    register,
    logout,
  } = useTravelerAuth();
  const unreadNotifications = useUnreadNotifications(traveler?.uid);
  const reviewable = useReviewableBookings(traveler?.uid);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedAuth = searchParams.get('auth');
  const authMode =
    requestedAuth === 'login' || requestedAuth === 'signup'
      ? requestedAuth
      : null;
  const redirectAfterAuth = searchParams.get('from') ?? '';

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const openAuth = (mode) => {
    setMenuOpen(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('auth', mode);
    nextParams.delete('from');
    setSearchParams(nextParams, { replace: true });
  };

  const switchAuthMode = (mode) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('auth', mode);
    setSearchParams(nextParams, { replace: true });
  };

  const closeAuth = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('auth');
    nextParams.delete('from');
    setSearchParams(nextParams, { replace: true });
  };

  const handleLogin = async (credentials) => {
    await login(credentials);
    const target = redirectAfterAuth;
    closeAuth();
    closeMenu();

    if (target) {
      navigate(target, { replace: true });
    }
  };

  const handleSignup = async (details) => {
    await register(details);
    const target = redirectAfterAuth;
    closeAuth();
    closeMenu();

    if (target) {
      navigate(target, { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const travelerName =
    [traveler?.firstName, traveler?.lastName].filter(Boolean).join(' ') ||
    traveler?.email;

  return (
    <header className={styles.header}>
      {/* Top tier */}
      <div className={styles.topTier}>
        <Container size="wide">
          <div className={styles.topRow}>
            <Logo variant="full" size="large" />

            <nav className={styles.desktopMainNav} aria-label="Main navigation">
              <ul className={styles.navList}>
                {mainNavLinks.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className={styles.navLink}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={styles.navLink}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <span className={styles.topDivider} aria-hidden="true" />

            <div
              className={`${styles.authActions}${
                traveler ? ` ${styles.authActionsSignedIn}` : ''
              }`}
            >
              {traveler ? (
                <ProfileMenu
                  user={{
                    name: travelerName,
                    photo: traveler?.photoURL ?? '',
                  }}
                  notificationCount={unreadNotifications}
                  reviewCount={reviewable.count}
                  isOperator={isOperator}
                  onLogout={handleLogout}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.signUpLink}
                    onClick={() => openAuth('signup')}
                    disabled={loading}
                  >
                    Sign up
                  </button>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => openAuth('login')}
                    disabled={loading}
                  >
                    Log in
                  </Button>
                </>
              )}
            </div>

            <button
              className={styles.menuToggle}
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </Container>
      </div>

      {/* Bottom tier */}
      <div className={styles.bottomTier}>
        <Container size="wide">
          <div className={styles.bottomRow}>
            <div className={styles.bottomLeft}>
              <p className={styles.tagline}>Start your Vacation Here!</p>

              <nav aria-label="Tour navigation">
                <ul className={styles.secondaryNavList}>
                  {secondaryNavLinks.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            `${styles.secondaryNavLink}${
                              isActive ? ` ${styles.secondaryNavLinkActive}` : ''
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      ) : (
                        <a href={link.href} className={styles.secondaryNavLink}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className={styles.mobileMenu}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <Container size="wide">
            <div className={styles.mobileMenuContent}>
              <nav aria-label="Mobile main navigation">
                <ul className={styles.mobileNavList}>
                  {mainNavLinks.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className={styles.mobileNavLink}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className={styles.mobileNavLink}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles.mobileMenuDivider} />

              <nav aria-label="Mobile tour navigation">
                <ul className={styles.mobileNavList}>
                  {secondaryNavLinks.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            `${styles.mobileNavLink}${
                              isActive ? ` ${styles.mobileNavLinkActive}` : ''
                            }`
                          }
                          onClick={closeMenu}
                        >
                          {link.label}
                        </NavLink>
                      ) : (
                        <a
                          href={link.href}
                          className={styles.mobileNavLink}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {!traveler && (
                <>
                  <div className={styles.mobileMenuDivider} />

                  <div className={styles.mobileActions}>
                    <button
                      type="button"
                      className={styles.mobileSignUpLink}
                      onClick={() => openAuth('signup')}
                      disabled={loading}
                    >
                      Sign up
                    </button>
                    <Button
                      variant="primary"
                      size="large"
                      className={styles.mobileLoginButton}
                      onClick={() => openAuth('login')}
                      disabled={loading}
                    >
                      Login
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Container>
        </div>
      )}

      <AuthModal
        mode={authMode}
        onClose={closeAuth}
        onSwitchMode={switchAuthMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </header>
  );
}

export default Header;
