import { useEffect, useMemo, useState } from 'react';
import { getAdminBookings } from '../../lib/operatorBookings';
import { formatMoney } from '../../utils/booking';
import styles from './AdminReportsPage.module.css';

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
  link.download = 'pili-admin-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function AdminReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getAdminBookings()
      .then((items) => {
        if (active) {
          setBookings(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load report data.');
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
        booking.paymentStatus === 'paid' && booking.status !== 'cancelled',
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
    const byTour = new Map();
    const byStatus = new Map();

    for (const booking of bookings) {
      byStatus.set(
        booking.status,
        (byStatus.get(booking.status) || 0) + 1,
      );
    }

    for (const booking of paid) {
      const tour = booking.tourSnapshot?.title || 'Tour';
      const current = byTour.get(tour) ?? { bookings: 0, revenue: 0 };
      current.bookings += 1;
      current.revenue += Number(booking.amounts?.total || 0);
      byTour.set(tour, current);
    }

    return {
      gross,
      refundTotal,
      net: gross - refundTotal,
      paidCount: paid.length,
      refundCount: refunded.length,
      byTour: [...byTour.entries()].sort(
        (first, second) => second[1].revenue - first[1].revenue,
      ),
      byStatus: [...byStatus.entries()].sort(
        (first, second) => second[1] - first[1],
      ),
    };
  }, [bookings]);

  const handleExport = () => {
    downloadCsv([
      ['Tour', 'Paid bookings', 'Revenue (PHP)'],
      ...report.byTour.map(([tour, values]) => [
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
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Reports</span>
          </p>
          <h1 className={styles.title}>Reports & Analytics</h1>
          <p className={styles.subtitle}>
            Platform revenue, booking status and tour performance.
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
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Bookings by status</h2>
          {loading ? (
            <p className={styles.empty}>Loading report…</p>
          ) : report.byStatus.length === 0 ? (
            <p className={styles.empty}>No bookings yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {report.byStatus.map(([status, count]) => (
                  <tr key={status}>
                    <td>{status}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Revenue by tour</h2>
          {loading ? (
            <p className={styles.empty}>Loading report…</p>
          ) : report.byTour.length === 0 ? (
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
                {report.byTour.map(([tour, values]) => (
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

export default AdminReportsPage;
