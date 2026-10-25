import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import Container from '../../../ui/Container/Container';
import visaIcon from '../../../../Images/payments/visa.svg';
import googlePayIcon from '../../../../Images/payments/google-pay.svg';
import mastercardIcon from '../../../../Images/payments/mastercard.svg';
import applePayIcon from '../../../../Images/payments/apple-pay.svg';
import paypalIcon from '../../../../Images/payments/paypal.svg';
import facebookIcon from '../../../../Images/social/facebook.svg';
import youtubeIcon from '../../../../Images/social/youtube.svg';
import xIcon from '../../../../Images/social/x.svg';
import tiktokIcon from '../../../../Images/social/tiktok.svg';
import instagramIcon from '../../../../Images/social/instagram.svg';

const payments = [
  { id: 'visa', label: 'Visa', icon: visaIcon },
  { id: 'google-pay', label: 'Google Pay', icon: googlePayIcon },
  { id: 'mastercard', label: 'Mastercard', icon: mastercardIcon },
  { id: 'apple-pay', label: 'Apple Pay', icon: applePayIcon },
  { id: 'paypal', label: 'PayPal', icon: paypalIcon },
];

const socials = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/', icon: facebookIcon },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/', icon: youtubeIcon },
  { id: 'x', label: 'X', href: 'https://x.com/', icon: xIcon },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/', icon: tiktokIcon },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/', icon: instagramIcon },
];

function Footer() {
  return (
    <footer id="contacts" className={styles.footer}>
      <div className={styles.top}>
        <Container size="wide">
          <div className={styles.grid}>
            <div className={styles.column}>
              <h2 className={styles.heading}>Contacts</h2>
              <address className={styles.contactList}>
                <a href="mailto:pilitravelandtour@gmail.com">
                  pilitravelandtour@gmail.com
                </a>
                <a href="tel:+639728399826">+63 972 839 9826</a>
                <span>Makiling St. San Rafael, Bulacan, Philippines</span>
              </address>
            </div>

            <div className={styles.column}>
              <h2 className={styles.heading}>Payment Channels</h2>
              <ul className={styles.payments}>
                {payments.map((payment) => (
                  <li key={payment.id} className={styles.payment}>
                    <img src={payment.icon} alt={payment.label} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>

      <div className={styles.bottom}>
        <Container size="wide" className={styles.bottomRow}>
          <p className={styles.copyright}>
            © 2026 Pili Tour and Travels All Rights Reserved
          </p>

          <div className={styles.bottomRight}>
            <Link to="/admin/login" className={styles.adminLink}>
              Admin
            </Link>
            <Link to="/operator/login" className={styles.adminLink}>
              Operator
            </Link>

            <ul className={styles.socials}>
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={social.icon} alt="" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
