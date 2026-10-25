import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { isOperatorUser } from '../../../lib/operatorAuth';
import { operatorNav } from '../../../data/operatorNav';
import AdminHeader from '../AdminLayout/AdminHeader';
import AdminSidebar from '../AdminLayout/AdminSidebar';
import AdminFooter from '../AdminLayout/AdminFooter';
import { OperatorToursProvider } from '../../../context/OperatorToursProvider';
import styles from './OperatorLayout.module.css';

function OperatorLayout() {
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

      const allowed = await isOperatorUser(user);

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
    navigate('/operator/login', { replace: true });
  };

  if (session.loading) {
    return (
      <div className={styles.loading} role="status">
        Checking operator access…
      </div>
    );
  }

  if (!session.user) {
    return <Navigate to="/operator/login" replace />;
  }

  return (
    <OperatorToursProvider
      key={session.user.uid}
      operatorId={session.user.uid}
    >
      <div className={styles.shell}>
        <AdminHeader
          user={session.user}
          onLogout={handleLogout}
          homePath="/operator"
          profileRole="Tour Operator"
        />
        <div className={styles.body}>
          <AdminSidebar
            items={operatorNav}
            eyebrow="Operator menu"
            ariaLabel="Operator sections"
          />
          <main className={styles.main}>
            <div className={styles.mainInner}>
              <Outlet />
            </div>
          </main>
        </div>
        <AdminFooter label="Operator Console" />
      </div>
    </OperatorToursProvider>
  );
}

export default OperatorLayout;
