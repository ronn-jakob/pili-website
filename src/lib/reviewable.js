import { getTravelerBookings } from './bookings';
import { getDepartureById } from './departures';
import {
  getReviewEligibility,
  getTravelerReviews,
} from './reviews';

export async function getReviewableBookings(travelerId) {
  if (!travelerId) {
    return [];
  }

  const [bookings, reviews] = await Promise.all([
    getTravelerBookings(travelerId),
    getTravelerReviews(travelerId),
  ]);
  const reviewsByBooking = new Map(
    reviews.map((review) => [review.bookingId, review]),
  );
  const departureIds = [
    ...new Set(bookings.map((booking) => booking.departureId).filter(Boolean)),
  ];
  const departures = await Promise.all(
    departureIds.map((departureId) =>
      getDepartureById(departureId).catch(() => null),
    ),
  );
  const departuresById = new Map(
    departures.filter(Boolean).map((departure) => [departure.id, departure]),
  );

  return bookings
    .filter((booking) => {
      const departure = departuresById.get(booking.departureId);
      return getReviewEligibility(
        booking,
        reviewsByBooking.get(booking.id),
        departure?.status ?? '',
      ).eligible;
    })
    .map((booking) => ({
      ...booking,
      departureStatus:
        departuresById.get(booking.departureId)?.status ?? '',
    }));
}
