import { lazy, Suspense, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout/SiteLayout';
import RequireTraveler from './components/layout/RequireTraveler/RequireTraveler';
import Home from './pages/Home/Home';
import DestinationsPage from './pages/DestinationsPage/DestinationsPage';
import PackagesPage from './pages/PackagesPage/PackagesPage';
import PackageDetailPage from './pages/PackageDetailPage/PackageDetailPage';
import BookingPage from './pages/BookingPage/BookingPage';
import BookingReviewPage from './pages/BookingReviewPage/BookingReviewPage';
import BookingPaymentPage from './pages/BookingPaymentPage/BookingPaymentPage';
import BookingsPage from './pages/BookingsPage/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage/BookingDetailPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import NeedsReviewPage from './pages/NeedsReviewPage/NeedsReviewPage';
import WishlistPage from './pages/WishlistPage/WishlistPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

const AdminLayout = lazy(
  () => import('./components/layout/AdminLayout/AdminLayout'),
);
const AdminLoginPage = lazy(
  () => import('./pages/AdminLoginPage/AdminLoginPage'),
);
const AdminDashboardPage = lazy(
  () => import('./pages/AdminDashboardPage/AdminDashboardPage'),
);
const AdminDestinationsPage = lazy(
  () => import('./pages/AdminDestinationsPage/AdminDestinationsPage'),
);
const AdminToursPage = lazy(
  () => import('./pages/AdminToursPage/AdminToursPage'),
);
const AdminCategoriesPage = lazy(
  () => import('./pages/AdminCategoriesPage/AdminCategoriesPage'),
);
const AdminReviewsPage = lazy(
  () => import('./pages/AdminReviewsPage/AdminReviewsPage'),
);
const AdminOperatorsPage = lazy(
  () => import('./pages/AdminOperatorsPage/AdminOperatorsPage'),
);
const AdminUsersPage = lazy(
  () => import('./pages/AdminUsersPage/AdminUsersPage'),
);
const AdminBookingsPage = lazy(
  () => import('./pages/AdminBookingsPage/AdminBookingsPage'),
);
const AdminReportsPage = lazy(
  () => import('./pages/AdminReportsPage/AdminReportsPage'),
);
const AdminRefundsPage = lazy(
  () => import('./pages/AdminRefundsPage/AdminRefundsPage'),
);
const AdminDeparturesPage = lazy(
  () => import('./pages/AdminDeparturesPage/AdminDeparturesPage'),
);
const OperatorLayout = lazy(
  () => import('./components/layout/OperatorLayout/OperatorLayout'),
);
const OperatorLoginPage = lazy(
  () => import('./pages/OperatorLoginPage/OperatorLoginPage'),
);
const OperatorDashboardPage = lazy(
  () => import('./pages/OperatorDashboardPage/OperatorDashboardPage'),
);
const OperatorToursPage = lazy(
  () => import('./pages/OperatorToursPage/OperatorToursPage'),
);
const OperatorReservationsPage = lazy(
  () => import('./pages/OperatorReservationsPage/OperatorReservationsPage'),
);
const OperatorReviewsPage = lazy(
  () => import('./pages/OperatorReviewsPage/OperatorReviewsPage'),
);
const OperatorReportsPage = lazy(
  () => import('./pages/OperatorReportsPage/OperatorReportsPage'),
);
const OperatorEditTourPage = lazy(
  () => import('./pages/OperatorEditTourPage/OperatorEditTourPage'),
);
const OperatorDeparturesPage = lazy(
  () => import('./pages/OperatorDeparturesPage/OperatorDeparturesPage'),
);

function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash, key]);

  return null;
}

function App() {
  return (
    <>
      <ScrollManager />
      <div id="top" />
      <Suspense fallback={null}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages/:packageId" element={<PackageDetailPage />} />
            <Route element={<RequireTraveler />}>
              <Route
                path="/packages/:packageId/book"
                element={<BookingPage />}
              />
              <Route
                path="/packages/:packageId/book/review"
                element={<BookingReviewPage />}
              />
              <Route
                path="/packages/:packageId/book/payment"
                element={<BookingPaymentPage />}
              />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route
                path="/bookings/:bookingId"
                element={<BookingDetailPage />}
              />
              <Route
                path="/notifications"
                element={<NotificationsPage />}
              />
              <Route path="/reviews" element={<NeedsReviewPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="tours" element={<AdminToursPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="operators" element={<AdminOperatorsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="refunds" element={<AdminRefundsPage />} />
            <Route path="departures" element={<AdminDeparturesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="destinations" element={<AdminDestinationsPage />} />
          </Route>

          <Route path="/operator/login" element={<OperatorLoginPage />} />
          <Route path="/operator" element={<OperatorLayout />}>
            <Route index element={<OperatorDashboardPage />} />
            <Route path="tours" element={<OperatorToursPage />} />
            <Route
              path="reservations"
              element={<OperatorReservationsPage />}
            />
            <Route path="reviews" element={<OperatorReviewsPage />} />
            <Route path="reports" element={<OperatorReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="tours/new" element={<OperatorEditTourPage key="new" />} />
            <Route
              path="tours/:tourId/edit"
              element={<OperatorEditTourPage key="edit" />}
            />
            <Route
              path="tours/:tourId/departures"
              element={<OperatorDeparturesPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
