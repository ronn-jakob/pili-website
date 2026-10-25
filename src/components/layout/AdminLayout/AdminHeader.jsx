import Container from '../../ui/Container/Container';
import Logo from '../../ui/Logo/Logo';
import AdminProfileMenu from './AdminProfileMenu';
import styles from './AdminHeader.module.css';

function AdminHeader({
  user,
  onLogout,
  homePath = '/admin',
  profileRole = 'Administrator',
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

        <AdminProfileMenu
          user={user}
          onLogout={onLogout}
          roleLabel={profileRole}
        />
      </Container>
    </header>
  );
}

export default AdminHeader;
