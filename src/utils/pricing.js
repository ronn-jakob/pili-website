import { normalizeTravelers } from './travelers.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function startOfDay(value) {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function toDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  return new Date(value);
}

export function calculateBookingAmounts({
  adultPrice,
  childPrice,
  infantPrice,
  travelers,
  serviceFee = 0,
  minGroupSize = 1,
  groupDiscountPercent = 0,
  earlyBirdPercent = 0,
  earlyBirdDays = 0,
  discounts = {},
  departureStartAt = null,
  bookedAt = new Date(),
} = {}) {
  const normalizedTravelers = normalizeTravelers(travelers);
  const adult = Math.max(0, toNumber(adultPrice));
  const child = Math.max(0, toNumber(childPrice));
  const infant = Math.max(0, toNumber(infantPrice));
  const subtotal = roundMoney(
    normalizedTravelers.adults * adult +
      normalizedTravelers.children * child +
      normalizedTravelers.infants * infant,
  );
  const minimumGroup = Math.max(1, toNumber(minGroupSize, 1));
  const groupPercent = Math.min(
    100,
    Math.max(0, toNumber(groupDiscountPercent)),
  );
  const earlyPercent = Math.min(
    100,
    Math.max(0, toNumber(earlyBirdPercent)),
  );
  const earlyDays = Math.max(0, toNumber(earlyBirdDays));
  const groupEnabled = discounts?.group !== false;
  const earlyBirdEnabled = discounts?.earlyBird !== false;
  const groupEligible =
    groupEnabled &&
    groupPercent > 0 &&
    normalizedTravelers.total >= minimumGroup;
  const departureDay = startOfDay(departureStartAt);
  const bookingDay = startOfDay(bookedAt);
  const daysUntilDeparture =
    departureDay && bookingDay
      ? Math.floor(
          (departureDay.getTime() - bookingDay.getTime()) / MS_PER_DAY,
        )
      : 0;
  const earlyBirdEligible =
    earlyBirdEnabled &&
    earlyPercent > 0 &&
    earlyDays > 0 &&
    daysUntilDeparture >= earlyDays;
  const groupDiscount = groupEligible
    ? roundMoney((subtotal * groupPercent) / 100)
    : 0;
  const earlyBirdDiscount = earlyBirdEligible
    ? roundMoney((subtotal * earlyPercent) / 100)
    : 0;
  const discount = roundMoney(
    Math.min(subtotal, groupDiscount + earlyBirdDiscount),
  );
  const fees = Math.max(0, roundMoney(serviceFee));
  const taxes = 0;
  const total = Math.max(0, roundMoney(subtotal - discount + taxes + fees));

  return {
    subtotal,
    discount,
    fees,
    taxes,
    total,
    groupDiscount,
    earlyBirdDiscount,
    groupEligible,
    earlyBirdEligible,
    daysUntilDeparture,
    travelers: normalizedTravelers,
  };
}

export function calculatePackageAmounts(pkg, travelers, dateValue) {
  return calculateBookingAmounts({
    adultPrice: pkg?.priceValue,
    childPrice: pkg?.childPrice,
    infantPrice: pkg?.infantPrice,
    travelers,
    serviceFee: pkg?.serviceFee,
    minGroupSize: pkg?.minGroupSize,
    groupDiscountPercent: pkg?.groupDiscountPercent,
    earlyBirdPercent: pkg?.earlyBirdPercent,
    earlyBirdDays: pkg?.earlyBirdDays,
    discounts: pkg?.discounts,
    departureStartAt: toDateValue(dateValue),
    bookedAt: new Date(),
  });
}
