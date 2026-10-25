import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.css';
import Logo from '../Logo/Logo';
import PasswordToggle from '../PasswordToggle/PasswordToggle';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19.2"
      height="19.2"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.emailIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="27"
      height="21"
      viewBox="0 0 27 21"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.38889 2.35714L10.8722 8.61629L10.875 8.619L10.8829 8.62469C11.8193 9.2954 12.289 9.6318 12.8042 9.76171C13.2605 9.8771 13.7395 9.8771 14.1958 9.76171C14.7125 9.63143 15.1847 9.2935 16.1292 8.61629C16.1292 8.61629 21.5694 4.53672 24.6111 2.35714M1 15.6571V5.34286C1 3.82286 1 3.06286 1.30278 2.482C1.56945 1.97036 1.99306 1.55643 2.51667 1.29586C3.11111 1 3.88889 1 5.44445 1H21.5556C23.1111 1 23.8889 1 24.4819 1.29586C25.0056 1.55643 25.4306 1.97036 25.6972 2.482C26 3.0615 26 3.8215 26 5.33879V15.6626C26 17.1799 26 17.9371 25.6972 18.518C25.4305 19.0289 25.0051 19.4441 24.4819 19.7041C23.8889 20 23.1125 20 21.5597 20H5.44028C3.8875 20 3.10972 20 2.51667 19.7041C1.99402 19.4439 1.56909 19.0287 1.30278 18.518C1 17.9371 1 17.1771 1 15.6571Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignupEmailIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.signupEmailIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="20"
      viewBox="0 0 26 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.33333 2.28572L10.4773 8.21543L10.48 8.218L10.4876 8.22339C11.3865 8.8588 11.8374 9.17749 12.332 9.30057C12.7701 9.40989 13.2299 9.40989 13.668 9.30057C14.164 9.17714 14.6173 8.857 15.524 8.21543C15.524 8.21543 20.7467 4.35057 23.6667 2.28572M1 14.8857V5.11429C1 3.67429 1 2.95429 1.29067 2.404C1.54667 1.91929 1.95333 1.52714 2.456 1.28029C3.02667 1 3.77333 1 5.26667 1H20.7333C22.2267 1 22.9733 1 23.5427 1.28029C24.0453 1.52714 24.4533 1.91929 24.7093 2.404C25 2.953 25 3.673 25 5.11043V14.8909C25 16.3283 25 17.0457 24.7093 17.596C24.4533 18.08 24.0449 18.4734 23.5427 18.7197C22.9733 19 22.228 19 20.7373 19H5.26267C3.772 19 3.02533 19 2.456 18.7197C1.95426 18.4732 1.54633 18.0798 1.29067 17.596C1 17.0457 1 16.3257 1 14.8857Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PasswordIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.passwordIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.16667 13.5417C3.29861 13.5417 2.56076 13.2378 1.95312 12.6302C1.34549 12.0226 1.04167 11.2847 1.04167 10.4167C1.04167 9.54861 1.34549 8.81076 1.95312 8.20312C2.56076 7.59549 3.29861 7.29167 4.16667 7.29167C5.03472 7.29167 5.77257 7.59549 6.38021 8.20312C6.98785 8.81076 7.29167 9.54861 7.29167 10.4167C7.29167 11.2847 6.98785 12.0226 6.38021 12.6302C5.77257 13.2378 5.03472 13.5417 4.16667 13.5417ZM3.125 19.7917C2.82986 19.7917 2.58264 19.6917 2.38333 19.4917C2.18403 19.2917 2.08403 19.0444 2.08333 18.75C2.08264 18.4556 2.18264 18.2083 2.38333 18.0083C2.58403 17.8083 2.83125 17.7083 3.125 17.7083H21.875C22.1701 17.7083 22.4177 17.8083 22.6177 18.0083C22.8177 18.2083 22.9174 18.4556 22.9167 18.75C22.916 19.0444 22.816 19.292 22.6167 19.4927C22.4174 19.6934 22.1701 19.7931 21.875 19.7917H3.125ZM10.2865 12.6302C9.67882 12.0226 9.375 11.2847 9.375 10.4167C9.375 9.54861 9.67882 8.81076 10.2865 8.20312C10.8941 7.59549 11.6319 7.29167 12.5 7.29167C13.3681 7.29167 14.1059 7.59549 14.7135 8.20312C15.3212 8.81076 15.625 9.54861 15.625 10.4167C15.625 11.2847 15.3212 12.0226 14.7135 12.6302C14.1059 13.2378 13.3681 13.5417 12.5 13.5417C11.6319 13.5417 10.8941 13.2378 10.2865 12.6302ZM18.6198 12.6302C18.0122 12.0226 17.7083 11.2847 17.7083 10.4167C17.7083 9.54861 18.0122 8.81076 18.6198 8.20312C19.2274 7.59549 19.9653 7.29167 20.8333 7.29167C21.7014 7.29167 22.4392 7.59549 23.0469 8.20312C23.6545 8.81076 23.9583 9.54861 23.9583 10.4167C23.9583 11.2847 23.6545 12.0226 23.0469 12.6302C22.4392 13.2378 21.7014 13.5417 20.8333 13.5417C19.9653 13.5417 19.2274 13.2378 18.6198 12.6302Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.personIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="19.4689"
      height="22"
      viewBox="0 0 19.4689 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.7344 6C14.7344 8.76142 12.4959 11 9.73444 11C6.97301 11 4.73444 8.76142 4.73444 6C4.73444 3.23858 6.97301 1 9.73444 1C12.4959 1 14.7344 3.23858 14.7344 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M14.7344 13H15.0864C15.8175 13.0002 16.5234 13.2674 17.0714 13.7513C17.6194 14.2352 17.9718 14.9026 18.0624 15.628L18.4534 18.752C18.4886 19.0334 18.4635 19.3191 18.3798 19.5901C18.2961 19.8611 18.1558 20.1112 17.9681 20.3238C17.7803 20.5364 17.5495 20.7066 17.291 20.8232C17.0324 20.9398 16.7521 21.0001 16.4684 21H3.00044C2.71682 21.0001 2.43643 20.9398 2.17788 20.8232C1.91933 20.7066 1.68854 20.5364 1.50081 20.3238C1.31309 20.1112 1.17272 19.8611 1.08904 19.5901C1.00536 19.3191 0.980267 19.0334 1.01544 18.752L1.40544 15.628C1.49613 14.9022 1.84885 14.2346 2.39727 13.7506C2.94568 13.2667 3.65201 12.9997 4.38344 13H4.73444"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.houseIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.0605 2.25C12.7792 1.96879 12.3977 1.81082 12 1.81082C11.6023 1.81082 11.2208 1.96879 10.9395 2.25L0.969 12.219C0.899268 12.2887 0.843954 12.3715 0.806215 12.4626C0.768476 12.5537 0.749053 12.6514 0.749053 12.75C0.749053 12.8486 0.768476 12.9463 0.806215 13.0374C0.843954 13.1285 0.899268 13.2113 0.969 13.281C1.10983 13.4218 1.30084 13.5009 1.5 13.5009C1.59862 13.5009 1.69627 13.4815 1.78738 13.4438C1.87848 13.406 1.96127 13.3507 2.031 13.281L3 12.3105V20.25C3 20.8467 3.23705 21.419 3.65901 21.841C4.08097 22.2629 4.65326 22.5 5.25 22.5H18.75C19.3467 22.5 19.919 22.2629 20.341 21.841C20.7629 21.419 21 20.8467 21 20.25V12.3105L21.969 13.281C22.1098 13.4218 22.3008 13.5009 22.5 13.5009C22.6992 13.5009 22.8902 13.4218 23.031 13.281C23.1718 13.1402 23.2509 12.9492 23.2509 12.75C23.2509 12.5508 23.1718 12.3598 23.031 12.219L19.5 8.6895V3.75C19.5 3.55109 19.421 3.36032 19.2803 3.21967C19.1397 3.07902 18.9489 3 18.75 3H17.25C17.0511 3 16.8603 3.07902 16.7197 3.21967C16.579 3.36032 16.5 3.55109 16.5 3.75V5.6895L13.0605 2.25ZM19.5 10.8105V20.25C19.5 20.4489 19.421 20.6397 19.2803 20.7803C19.1397 20.921 18.9489 21 18.75 21H5.25C5.05109 21 4.86032 20.921 4.71967 20.7803C4.57902 20.6397 4.5 20.4489 4.5 20.25V10.8105L12 3.3105L19.5 10.8105Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className={`${styles.fieldIcon} ${styles.phoneIcon}`}
      xmlns="http://www.w3.org/2000/svg"
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.1143 5.98L6.87221 2.23771C6.49846 1.80646 5.81325 1.80837 5.37912 2.24346L2.71304 4.91433C1.91954 5.70879 1.69242 6.8885 2.15146 7.83437C4.89341 13.5128 9.47286 18.0986 15.1474 20.8485C16.0923 21.3076 17.2711 21.0805 18.0646 20.286L20.7556 17.5902C21.1916 17.1542 21.1926 16.4651 20.7575 16.0914L17.0008 12.8666C16.6079 12.5292 15.9975 12.5733 15.6036 12.9682L14.2964 14.2772C14.2297 14.3477 14.1416 14.3941 14.0457 14.4093C13.9499 14.4246 13.8518 14.4078 13.7665 14.3616C11.6299 13.1311 9.85752 11.3564 8.62979 9.21821C8.58333 9.1328 8.56641 9.03443 8.58167 8.93841C8.59692 8.84239 8.64349 8.7541 8.71413 8.68729L10.0175 7.383C10.4123 6.98625 10.4554 6.37387 10.1143 5.98Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Field({ icon, name, placeholder, type = 'text', autoComplete }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <label className={styles.field}>
      <span className={styles.srOnly}>{placeholder}</span>
      {icon}
      <input
        className={`${styles.input}${
          isPassword ? ` ${styles.inputWithToggle}` : ''
        }`}
        type={isPassword && visible ? 'text' : type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {isPassword && (
        <PasswordToggle
          visible={visible}
          onToggle={() => setVisible((current) => !current)}
          label={placeholder || 'password'}
          className={styles.passwordToggle}
        />
      )}
    </label>
  );
}

function Terms() {
  return (
    <p className={styles.terms}>
      By signing up or logging in, you acknowledge and agree to Pili&apos;s
      General Terms of Use and Privacy Policy.
    </p>
  );
}

function LoginBody({ onSwitchMode, onLogin }) {
  return (
    <>
      <form
        className={styles.loginForm}
        onSubmit={(event) => {
          event.preventDefault();
          onLogin?.();
        }}
        noValidate
      >
        <Field
          icon={<EmailIcon />}
          name="email"
          placeholder="Email address"
          type="email"
          autoComplete="email"
        />
        <div className={styles.fieldSpaced}>
          <Field
            icon={<PasswordIcon />}
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.forgotRow}>
          <a href="/forgot-password" className={styles.forgotLink}>
            Forgot Password
          </a>
        </div>

        <button
          type="submit"
          className={`${styles.primaryButton} ${styles.loginSubmit}`}
        >
          Login
        </button>
      </form>

      <div className={styles.accountRow}>
        <span className={styles.accountLine} aria-hidden="true" />
        <span className={styles.accountLabel}>No Account ?</span>
        <span className={styles.accountLine} aria-hidden="true" />
      </div>

      <button
        type="button"
        className={`${styles.secondaryButton} ${styles.loginSecondary}`}
        onClick={() => onSwitchMode('signup')}
      >
        Create Account
      </button>

      <Terms />
    </>
  );
}

function SignUpBody({ onSwitchMode }) {
  const personalId = useId();
  const accountId = useId();

  return (
    <form
      className={styles.signupForm}
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <div className={styles.signupColumns}>
        <section className={styles.signupColumn} aria-labelledby={personalId}>
          <h3 id={personalId} className={styles.columnTitle}>
            Personal Information
          </h3>

          <div className={styles.columnFields}>
            <Field
              icon={<PersonIcon />}
              name="firstName"
              placeholder="First Name"
              autoComplete="given-name"
            />
            <Field
              icon={<PersonIcon />}
              name="lastName"
              placeholder="Last Name"
              autoComplete="family-name"
            />
            <Field
              icon={<HouseIcon />}
              name="address"
              placeholder="Address"
              autoComplete="street-address"
            />
            <Field
              icon={<PhoneIcon />}
              name="phone"
              placeholder="Phone Number"
              type="tel"
              autoComplete="tel"
            />
          </div>
        </section>

        <section className={styles.signupColumn} aria-labelledby={accountId}>
          <h3 id={accountId} className={styles.columnTitle}>
            Account Details
          </h3>

          <div className={styles.columnFields}>
            <Field
              icon={<SignupEmailIcon />}
              name="email"
              placeholder="Email address"
              type="email"
              autoComplete="email"
            />
            <Field
              icon={<PasswordIcon />}
              name="password"
              placeholder="Password"
              type="password"
              autoComplete="new-password"
            />
            <Field
              icon={<PasswordIcon />}
              name="confirmPassword"
              placeholder="Confirm password"
              type="password"
              autoComplete="new-password"
            />

            <button type="submit" className={styles.primaryButton}>
              Sign up
            </button>
          </div>

          <div className={`${styles.accountRow} ${styles.signupAccountRow}`}>
            <span className={styles.accountLine} aria-hidden="true" />
            <span className={styles.accountLabel}>
              Already have an Account ?
            </span>
            <span className={styles.accountLine} aria-hidden="true" />
          </div>

          <button
            type="button"
            className={`${styles.secondaryButton} ${styles.signupSecondary}`}
            onClick={() => onSwitchMode('login')}
          >
            Log in
          </button>

          <Terms />
        </section>
      </div>

      <span className={styles.verticalDivider} aria-hidden="true" />
    </form>
  );
}

function AuthModal({ mode, onClose, onSwitchMode, onLogin }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = useId();
  const open = mode !== null;
  const isSignup = mode === 'signup';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previouslyFocusedRef.current = document.activeElement;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;

      const previous = previouslyFocusedRef.current;
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector('input')?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`${styles.overlay}${open ? ` ${styles.overlayOpen}` : ''}`}
      onMouseDown={handleBackdropMouseDown}
      inert={!open}
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog}${isSignup ? ` ${styles.dialogSignup}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close authentication dialog"
        >
          <CloseIcon />
        </button>

        <div
          className={`${styles.panel} ${isSignup ? styles.signupPanel : styles.loginPanel}`}
        >
          <div className={styles.brand}>
            <Logo
              variant="full"
              size="large"
              link={false}
              className={styles.modalLogo}
            />
          </div>

          <div className={styles.topDivider} />

          <h2 id={titleId} className={styles.title}>
            {isSignup ? 'Sign-up' : 'Log in'}
          </h2>

          {isSignup ? (
            <SignUpBody onSwitchMode={onSwitchMode} />
          ) : (
            <LoginBody
              onSwitchMode={onSwitchMode}
              onLogin={onLogin}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default AuthModal;
