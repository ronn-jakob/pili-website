import { useEffect, useRef, useState } from 'react';
import styles from './AdminProfileMenu.module.css';

function AdminProfileMenu({ user, onLogout, roleLabel = 'Administrator' }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const initial = user?.email?.charAt(0).toUpperCase() || 'A';

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
