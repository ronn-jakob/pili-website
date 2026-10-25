import styles from './AdminFooter.module.css';

function AdminFooter({ label = 'Admin Console' }) {
  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>
        © 2026 Pili. All rights reserved. {label}.
      </p>
    </footer>
  );
}

export default AdminFooter;
