import { Navigate, useLocation, useParams } from 'react-router-dom';
import BookingHeader from '../../components/sections/booking/BookingHeader/BookingHeader';
import BookingPaymentForm from '../../components/sections/booking/BookingPaymentForm/BookingPaymentForm';
import BookingPaymentSummary from '../../components/sections/booking/BookingPaymentSummary/BookingPaymentSummary';
import { getPackageById } from '../../data/packages';
import styles from './BookingPaymentPage.module.css';

function BookingPaymentPage() {
  const { packageId } = useParams();
  const location = useLocation();
  const pkg = getPackageById(packageId);
  const state = location.state;

  if (!pkg) {
    return <Navigate to="/packages" replace />;
  }

  if (!state?.details) {
    return <Navigate to={`/packages/${pkg.id}/book`} replace />;
  }

  const { date, travelers, details } = state;
  const total = pkg.priceValue * travelers + pkg.serviceFee;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <BookingHeader
          pkg={pkg}
          title="Payment"
          subtitle="Secure payment powered by Stripe"
          activeStep={3}
        />

        <div className={styles.grid}>
          <div className={styles.left}>
            <BookingPaymentForm
              pkg={pkg}
              backState={{ date, travelers, details }}
              total={total}
            />
          </div>

          <BookingPaymentSummary
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

export default BookingPaymentPage;
