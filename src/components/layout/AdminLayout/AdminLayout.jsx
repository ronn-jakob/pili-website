import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { isAdminUser } from '../../../lib/adminAuth';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const [session, setSession] = useState({ loading: true, user: null });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) {
        return;
      }

      if (!user) {
        setSession({ loading: false, user: null });
        return;
      }

      const allowed = await isAdminUser(user);

      if (!active) {
        return;
      }

      if (!allowed) {
        await signOut(auth);
        if (active) {
          setSession({ loading: false, user: null });
        }
        return;
      }

      setSession({ loading: false, user });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login', { replace: true });
  };

  if (session.loading) {
    return (
      <div className={styles.loading} role="status">
        Checking administrator access…
      </div>
    );
  }

  if (!session.user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={styles.shell}>
      <AdminHeader user={session.user} onLogout={handleLogout} />
      <div className={styles.body}>
        <AdminSidebar />
        <main className={styles.main}>
          <div className={styles.mainInner}>
            <Outlet />
          </div>
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}

export default AdminLayout;
