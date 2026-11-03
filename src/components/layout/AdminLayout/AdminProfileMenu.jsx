import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useUnreadNotifications from '../../../hooks/useUnreadNotifications';
import styles from './AdminProfileMenu.module.css';

function AdminProfileMenu({
  user,
  onLogout,
  roleLabel = 'Administrator',
  notificationsPath = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const initial = user?.email?.charAt(0).toUpperCase() || 'A';
  const unread = useUnreadNotifications(user?.uid);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.avatar}
        aria-label="Open admin profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="admin-profile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {initial}
      </button>

      {open && (
        <div
          id="admin-profile-menu"
          className={styles.menu}
          role="menu"
          aria-label="Admin profile menu"
        >
          <div className={styles.account}>
            <span className={styles.accountLabel}>Signed in as</span>
            <span className={styles.email}>{user?.email}</span>
            <span className={styles.role}>{roleLabel}</span>
          </div>

          <div className={styles.divider} />

          {notificationsPath && (
            <Link
              to={notificationsPath}
              role="menuitem"
              className={styles.menuLink}
              onClick={() => setOpen(false)}
            >
              Notifications
              {unread > 0 && (
                <span className={styles.badge}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            className={styles.logout}
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminProfileMenu;
