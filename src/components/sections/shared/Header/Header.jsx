import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import Container from '../../../ui/Container/Container';
import Logo from '../../../ui/Logo/Logo';
import Button from '../../../ui/Button/Button';
import AuthModal from '../../../ui/AuthModal/AuthModal';
import ProfileMenu from '../ProfileMenu/ProfileMenu';

const mainNavLinks = [
  { label: 'Home', to: '/#top' },
  { label: 'About us', to: '/#why-choose' },
  { label: 'Contacts', to: '/#contacts' },
  { label: 'Wishlist', href: '/wishlist' },
];

const secondaryNavLinks = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'Special Offers', href: '/offers' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const openAuth = (mode) => {
    setMenuOpen(false);
    setAuthMode(mode);
  };

  const closeAuth = () => setAuthMode(null);

  const handleLogin = () => {
    setUser({ name: 'Pili Traveler' });
    closeAuth();
    closeMenu();
  };

  const handleLogout = () => setUser(null);

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
                user ? ` ${styles.authActionsSignedIn}` : ''
              }`}
            >
              {user ? (
                <ProfileMenu user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.signUpLink}
                    onClick={() => openAuth('signup')}
                  >
                    Sign up
                  </button>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => openAuth('login')}
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

              {!user && (
                <>
                  <div className={styles.mobileMenuDivider} />

                  <div className={styles.mobileActions}>
                    <button
                      type="button"
                      className={styles.mobileSignUpLink}
                      onClick={() => openAuth('signup')}
                    >
                      Sign up
                    </button>
                    <Button
                      variant="primary"
                      size="large"
                      className={styles.mobileLoginButton}
                      onClick={() => openAuth('login')}
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
        onSwitchMode={setAuthMode}
        onLogin={handleLogin}
      />
    </header>
  );
}

export default Header;
