import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import BookingHeader from '../../components/sections/booking/BookingHeader/BookingHeader';
import BookingTourCard from '../../components/sections/booking/BookingTourCard/BookingTourCard';
import BookingDetailsForm from '../../components/sections/booking/BookingDetailsForm/BookingDetailsForm';
import BookingSummary from '../../components/sections/booking/BookingSummary/BookingSummary';
import { getPackageById } from '../../data/packages';
import styles from './BookingPage.module.css';

function BookingPage() {
  const { packageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pkg = getPackageById(packageId);

  if (!pkg) {
    return <Navigate to="/packages" replace />;
  }

  const state = location.state ?? {};
  const travelers = Math.min(8, Math.max(1, Number(state.travelers) || 2));
  const dateValue =
    typeof state.date === 'string' && state.date
      ? state.date
      : '2026-11-12';
  const initialDetails = state.details;
  const departureId = state.departureId;

  const handleContinue = (details) => {
    navigate(`/packages/${pkg.id}/book/review`, {
      state: { date: dateValue, travelers, details, departureId },
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <BookingHeader pkg={pkg} activeStep={1} />

        <div className={styles.grid}>
          <div className={styles.left}>
            <BookingTourCard pkg={pkg} travelers={travelers} />
            <BookingDetailsForm
              initialDetails={initialDetails}
              onContinue={handleContinue}
            />
          </div>

          <BookingSummary
            pkg={pkg}
            dateValue={dateValue}
            travelers={travelers}
          />
        </div>
      </div>
    </main>
  );
}

export default BookingPage;
