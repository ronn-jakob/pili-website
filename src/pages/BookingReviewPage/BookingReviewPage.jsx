import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import BookingHeader from '../../components/sections/booking/BookingHeader/BookingHeader';
import BookingTourCard from '../../components/sections/booking/BookingTourCard/BookingTourCard';
import BookingReviewDetails from '../../components/sections/booking/BookingReviewDetails/BookingReviewDetails';
import BookingReviewSummary from '../../components/sections/booking/BookingReviewSummary/BookingReviewSummary';
import { getPackageById } from '../../data/packages';
import styles from './BookingReviewPage.module.css';

function BookingReviewPage() {
  const { packageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pkg = getPackageById(packageId);
  const state = location.state;

  if (!pkg) {
    return <Navigate to="/packages" replace />;
  }

  if (!state?.details) {
    return <Navigate to={`/packages/${pkg.id}/book`} replace />;
  }

  const { date, travelers, details, departureId } = state;
  const flowState = { date, travelers, details, departureId };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <BookingHeader
          pkg={pkg}
          title="Review your booking"
          subtitle="Double-check everything looks right before you pay"
          activeStep={2}
        />

        <div className={styles.grid}>
          <div className={styles.left}>
            <BookingTourCard pkg={pkg} travelers={travelers} />
            <BookingReviewDetails
              pkg={pkg}
              dateValue={date}
              travelers={travelers}
              details={details}
            />

            <div className={styles.actions}>
              <Link
                to={`/packages/${pkg.id}/book`}
                state={flowState}
                className={styles.back}
              >
                ← Back to details
              </Link>
              <button
                type="button"
                className={styles.continueButton}
                onClick={() =>
                  navigate(`/packages/${pkg.id}/book/payment`, {
                    state: flowState,
                  })
                }
              >
                Continue to payment
              </button>
            </div>
          </div>

          <BookingReviewSummary
            pkg={pkg}
            dateValue={date}
            travelers={travelers}
            details={details}
          />
        </div>
      </div>
    </main>
  );
}

export default BookingReviewPage;
