import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import { getOperatorBookings } from '../../lib/operatorBookings';
import { formatMoney } from '../../utils/booking';
import styles from './OperatorReportsPage.module.css';

function monthKey(date) {
  if (!date) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function downloadCsv(rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'operator-revenue-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function OperatorReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const uid = auth.currentUser?.uid ?? '';

    getOperatorBookings(uid)
      .then((items) => {
        if (active) {
          setBookings(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load revenue data.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const report = useMemo(() => {
    const paid = bookings.filter(
      (booking) =>
        booking.status !== 'cancelled' &&
        booking.paymentStatus === 'paid',
    );
    const refunded = bookings.filter(
      (booking) => booking.paymentStatus === 'refunded',
    );
    const gross = paid.reduce(
      (total, booking) => total + Number(booking.amounts?.total || 0),
      0,
    );
    const refundTotal = refunded.reduce(
      (total, booking) =>
        total +
        Number(booking.refundAmount || booking.amounts?.total || 0),
      0,
    );
    const monthly = new Map();
    const tours = new Map();

    for (const booking of paid) {
      const key = monthKey(booking.createdAtDate);
      const month = monthly.get(key) ?? { bookings: 0, revenue: 0 };
      month.bookings += 1;
      month.revenue += Number(booking.amounts?.total || 0);
      monthly.set(key, month);

      const tourTitle = booking.tourSnapshot?.title || 'Tour';
      const tour = tours.get(tourTitle) ?? { bookings: 0, revenue: 0 };
      tour.bookings += 1;
      tour.revenue += Number(booking.amounts?.total || 0);
      tours.set(tourTitle, tour);
    }

    return {
      gross,
      refundTotal,
      net: gross - refundTotal,
      paidCount: paid.length,
      refundCount: refunded.length,
      monthly: [...monthly.entries()].sort((first, second) =>
        first[0].localeCompare(second[0]),
      ),
      tours: [...tours.entries()].sort(
        (first, second) => second[1].revenue - first[1].revenue,
      ),
    };
  }, [bookings]);

  const handleExport = () => {
    downloadCsv([
      ['Tour', 'Paid bookings', 'Revenue (PHP)'],
      ...report.tours.map(([tour, values]) => [
        tour,
        values.bookings,
        values.revenue,
      ]),
    ]);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Organizer</span>
            <span aria-hidden="true">/</span>
            <span>Performance</span>
          </p>
          <h1 className={styles.title}>Performance</h1>
          <p className={styles.subtitle}>
            Revenue and booking performance based on your paid reservations.
          </p>
        </div>
        <button type="button" className={styles.export} onClick={handleExport}>
          Download CSV
        </button>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.summaryGrid}>
        {[
          ['Gross revenue', formatMoney(report.gross, 'PHP')],
          ['Refunds', formatMoney(report.refundTotal, 'PHP')],
          ['Net revenue', formatMoney(report.net, 'PHP')],
          ['Paid bookings', report.paidCount],
          ['Refunded bookings', report.refundCount],
        ].map(([label, value]) => (
          <div key={label} className={styles.summaryCard}>
            <span className={styles.summaryValue}>{value}</span>
            <span className={styles.summaryLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="monthly-title">
          <h2 id="monthly-title" className={styles.sectionTitle}>
            Monthly revenue
          </h2>
          {loading ? (
            <p className={styles.empty}>Loading report…</p>
          ) : report.monthly.length === 0 ? (
            <p className={styles.empty}>No paid bookings yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.monthly.map(([month, values]) => (
                  <tr key={month}>
                    <td>{month}</td>
                    <td>{values.bookings}</td>
                    <td>{formatMoney(values.revenue, 'PHP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.card} aria-labelledby="tours-title">
          <h2 id="tours-title" className={styles.sectionTitle}>
            Revenue by tour
          </h2>
          {loading ? (
            <p className={styles.empty}>Loading report…</p>
          ) : report.tours.length === 0 ? (
            <p className={styles.empty}>No paid bookings yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.tours.map(([tour, values]) => (
                  <tr key={tour}>
                    <td>{tour}</td>
                    <td>{values.bookings}</td>
                    <td>{formatMoney(values.revenue, 'PHP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default OperatorReportsPage;
