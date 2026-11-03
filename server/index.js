import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';
import {
  adminApproveRefundRequest,
  adminCancelBooking,
  cancelBooking,
  confirmPaymentIntent,
  createPaymentIntentForBooking,
  releaseBooking,
} from './bookings.js';
import {
  getFirebaseServices,
  hasFirebaseCredentials,
} from './firebaseAdmin.js';
import { createNotification } from './notifications.js';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(serverDirectory, '.env') });

const app = express();
const port = Number(process.env.PORT) || 4242;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
let stripeClient = null;

app.use(
  cors({
    origin: clientUrl,
  }),
);
app.use(express.json({ limit: '1mb' }));

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env.',
    );
    error.status = 503;
    error.code = 'stripe/not-configured';
    throw error;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

async function requireTraveler(req, res, next) {
  const authorization = req.headers.authorization ?? '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';

  if (!token) {
    res.status(401).json({
      code: 'auth/required',
      error: 'Sign in as a traveler to continue.',
    });
    return;
  }

  if (!hasFirebaseCredentials()) {
    res.status(503).json({
      code: 'firebase/not-configured',
      error:
        'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH in server/.env.',
    });
    return;
  }

  try {
    const { auth } = getFirebaseServices();
    req.traveler = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({
      code: 'auth/invalid',
      error: 'Your session is invalid or expired. Sign in again.',
    });
  }
}

async function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization ?? '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';

  if (!token) {
    res.status(401).json({
      code: 'auth/required',
      error: 'Sign in as an administrator to continue.',
    });
    return;
  }

  if (!hasFirebaseCredentials()) {
    res.status(503).json({
      code: 'firebase/not-configured',
      error:
        'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH in server/.env.',
    });
    return;
  }

  try {
    const { auth, db } = getFirebaseServices();
    const user = await auth.verifyIdToken(token);
    const marker = await db.collection('admins').doc(user.uid).get();

    if (!marker.exists) {
      res.status(403).json({
        code: 'auth/not-admin',
        error: 'This account does not have administrator access.',
      });
      return;
    }

    req.admin = user;
    next();
  } catch {
    res.status(401).json({
      code: 'auth/invalid',
      error: 'Your session is invalid or expired. Sign in again.',
    });
  }
}

function sendError(res, error) {
  const status = Number(error.status) || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    code: error.code || 'server/error',
    error:
      status >= 500
        ? 'The payment server could not complete that request.'
        : error.message,
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    firebaseConfigured: hasFirebaseCredentials(),
  });
});

app.post(
  '/api/notifications/booking-created',
  requireTraveler,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const { db } = getFirebaseServices();
      const snapshot = await db
        .collection('bookings')
        .doc(bookingId)
        .get();

      if (!snapshot.exists) {
        res.status(404).json({
          code: 'booking/not-found',
          error: 'That booking could not be found.',
        });
        return;
      }

      const booking = snapshot.data();

      if (booking.travelerId !== req.traveler.uid) {
        res.status(403).json({
          code: 'booking/not-owner',
          error: 'You do not have permission to notify for this booking.',
        });
        return;
      }

      await createNotification({
        id: `booking-created-${bookingId}`,
        userId: booking.travelerId,
        role: 'traveler',
        type: 'booking_created',
        title: 'Booking created',
        message: `Your booking for ${
          booking.tourSnapshot?.title || 'your tour'
        } was created. Complete payment to confirm it.`,
        link: `/bookings/${bookingId}`,
        bookingId,
        tourId: booking.tourId ?? '',
      });

      if (booking.operatorId) {
        await createNotification({
          id: `operator-booking-created-${bookingId}`,
          userId: booking.operatorId,
          role: 'operator',
          type: 'booking_created',
          title: 'New booking',
          message: `A new booking was created for ${
            booking.tourSnapshot?.title || 'your tour'
          }.`,
          link: '/operator/reservations',
          bookingId,
          tourId: booking.tourId ?? '',
        });
      }

      res.json({ ok: true });
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/notifications/booking-change-requested',
  requireTraveler,
  async (req, res) => {
    try {
      const changeRequestId = String(
        req.body?.changeRequestId ?? '',
      ).trim();

      if (!changeRequestId) {
        res.status(400).json({
          code: 'booking-change/missing',
          error: 'A change request ID is required.',
        });
        return;
      }

      const { db } = getFirebaseServices();
      const snapshot = await db
        .collection('bookingChanges')
        .doc(changeRequestId)
        .get();

      if (!snapshot.exists) {
        res.status(404).json({
          code: 'booking-change/not-found',
          error: 'That change request could not be found.',
        });
        return;
      }

      const request = snapshot.data();

      if (request.travelerId !== req.traveler.uid) {
        res.status(403).json({
          code: 'booking-change/not-owner',
          error: 'You do not have permission to notify for this request.',
        });
        return;
      }

      if (request.operatorId) {
        await createNotification({
          id: `booking-change-requested-${changeRequestId}`,
          userId: request.operatorId,
          role: 'operator',
          type: 'booking_change_requested',
          title: 'Departure change requested',
          message: `A traveler requested a departure change for booking ${
            request.bookingReference || request.bookingId
          }.`,
          link: '/operator/reservations',
          bookingId: request.bookingId,
          tourId: request.tourId ?? '',
          changeRequestId,
        });
      }

      res.json({ ok: true });
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/notifications/review-submitted',
  requireTraveler,
  async (req, res) => {
    try {
      const reviewId = String(req.body?.reviewId ?? '').trim();

      if (!reviewId) {
        res.status(400).json({
          code: 'review/missing',
          error: 'A review ID is required.',
        });
        return;
      }

      const { db } = getFirebaseServices();
      const snapshot = await db.collection('reviews').doc(reviewId).get();

      if (!snapshot.exists) {
        res.status(404).json({
          code: 'review/not-found',
          error: 'That review could not be found.',
        });
        return;
      }

      const review = snapshot.data();

      if (review.travelerId !== req.traveler.uid) {
        res.status(403).json({
          code: 'review/not-owner',
          error: 'You do not have permission to notify for this review.',
        });
        return;
      }

      const admins = await db.collection('admins').get();

      await Promise.all(
        admins.docs.map((admin) =>
          createNotification({
            id: `review-submitted-${reviewId}-${admin.id}`,
            userId: admin.id,
            role: 'admin',
            type: 'review_submitted',
            title: 'New review submitted',
            message: `${review.travelerName || 'A traveler'} submitted a review for ${
              review.tourTitle || 'a tour'
            }.`,
            link: '/admin/reviews',
            bookingId: review.bookingId ?? reviewId,
            tourId: review.tourId ?? '',
            reviewId,
          }),
        ),
      );

      res.json({ ok: true });
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/notifications/refund-requested',
  requireTraveler,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'refund-request/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const { db } = getFirebaseServices();
      const snapshot = await db
        .collection('cancellationRequests')
        .doc(bookingId)
        .get();

      if (!snapshot.exists) {
        res.status(404).json({
          code: 'refund-request/not-found',
          error: 'That refund request could not be found.',
        });
        return;
      }

      const request = snapshot.data();

      if (request.travelerId !== req.traveler.uid) {
        res.status(403).json({
          code: 'refund-request/not-owner',
          error: 'You do not have permission to notify for this request.',
        });
        return;
      }

      const admins = await db.collection('admins').get();

      await Promise.all(
        admins.docs.map((admin) =>
          createNotification({
            id: `refund-requested-${bookingId}-${admin.id}`,
            userId: admin.id,
            role: 'admin',
            type: 'refund_requested',
            title: 'Refund request submitted',
            message: `A traveler requested a refund for booking ${
              request.bookingReference || bookingId
            }.`,
            link: '/admin/refunds',
            bookingId,
            tourId: request.tourId ?? '',
          }),
        ),
      );

      res.json({ ok: true });
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/create-payment-intent',
  requireTraveler,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const result = await createPaymentIntentForBooking({
        bookingId,
        travelerId: req.traveler.uid,
        stripe: getStripe(),
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.get(
  '/api/payment-intent',
  requireTraveler,
  async (req, res) => {
    try {
      const paymentIntentId = String(
        req.query.payment_intent ?? '',
      ).trim();

      if (!paymentIntentId) {
        res.status(400).json({
          code: 'stripe/payment-intent-missing',
          error: 'A Stripe PaymentIntent ID is required.',
        });
        return;
      }

      const result = await confirmPaymentIntent({
        paymentIntentId,
        travelerId: req.traveler.uid,
        stripe: getStripe(),
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/cancel-booking',
  requireTraveler,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const result = await cancelBooking({
        bookingId,
        travelerId: req.traveler.uid,
        stripe: getStripe(),
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/admin/approve-refund-request',
  requireAdmin,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const result = await adminApproveRefundRequest({
        bookingId,
        stripe: getStripe(),
        adminUid: req.admin.uid,
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/admin/cancel-booking',
  requireAdmin,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const result = await adminCancelBooking({
        bookingId,
        stripe: getStripe(),
        adminUid: req.admin.uid,
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.post(
  '/api/release-booking',
  requireTraveler,
  async (req, res) => {
    try {
      const bookingId = String(req.body?.bookingId ?? '').trim();
      const paymentIntentId = String(
        req.body?.paymentIntentId ?? '',
      ).trim();

      if (!bookingId) {
        res.status(400).json({
          code: 'booking/missing',
          error: 'A booking ID is required.',
        });
        return;
      }

      const result = await releaseBooking({
        bookingId,
        travelerId: req.traveler.uid,
        stripe: getStripe(),
        paymentIntentId: paymentIntentId || undefined,
      });

      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
);

app.use((req, res) => {
  res.status(404).json({
    code: 'server/not-found',
    error: 'That API endpoint does not exist.',
  });
});

app.listen(port, () => {
  console.log(`Pili payment server listening on http://localhost:${port}`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn(
      'STRIPE_SECRET_KEY is missing; checkout endpoints will return 503.',
    );
  }
  if (!hasFirebaseCredentials()) {
    console.warn(
      'Firebase Admin credentials are missing; protected endpoints will return 503.',
    );
  }
});
