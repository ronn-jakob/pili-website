import { Link } from 'react-router-dom';
import Container from '../../ui/Container/Container';
import Logo from '../../ui/Logo/Logo';
import AdminProfileMenu from './AdminProfileMenu';
import styles from './AdminHeader.module.css';

function AdminHeader({
  user,
  onLogout,
  homePath = '/admin',
  profileRole = 'Administrator',
  notificationsPath = '',
  mainSitePath = '',
}) {
  return (
    <header className={styles.header}>
      <Container size="wide" className={styles.row}>
        <Logo
          variant="full"
          size="large"
          to={homePath}
          className={styles.brand}
        />

        <div className={styles.actions}>
          {mainSitePath && (
            <Link to={mainSitePath} className={styles.mainSite}>
              ← Return to main website
            </Link>
          )}
          <AdminProfileMenu
            user={user}
            onLogout={onLogout}
            roleLabel={profileRole}
            notificationsPath={notificationsPath}
          />
        </div>
      </Container>
    </header>
  );
}

export default AdminHeader;
