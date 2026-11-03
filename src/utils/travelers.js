// Safety cap for malformed route state. The real limit comes from
// the selected departure's remaining capacity.
export const MAX_TRAVELERS = 50;

export const DEFAULT_TRAVELERS = Object.freeze({
  adults: 2,
  children: 0,
  infants: 0,
  total: 2,
});

function clampCount(value, minimum = 0) {
  const number = Math.floor(Number(value) || 0);
  return Math.max(minimum, number);
}

export function normalizeTravelers(value) {
  if (value == null) {
    return { ...DEFAULT_TRAVELERS };
  }

  if (typeof value === 'number') {
    const adults = Math.min(
      MAX_TRAVELERS,
      Math.max(1, clampCount(value, 1)),
    );

    return {
      adults,
      children: 0,
      infants: 0,
      total: adults,
    };
  }

  let adults = clampCount(value?.adults);
  let children = clampCount(value?.children);
  let infants = clampCount(value?.infants);

  if (adults + children + infants === 0) {
    adults = Math.min(
      MAX_TRAVELERS,
      Math.max(1, clampCount(value?.total, 1)),
    );
  }

  let overflow = adults + children + infants - MAX_TRAVELERS;

  if (overflow > 0) {
    const reduce = (count, minimum) => {
      const amount = Math.min(overflow, Math.max(0, count - minimum));
      return count - amount;
    };

    infants = reduce(infants, 0);
    overflow = adults + children + infants - MAX_TRAVELERS;

    if (overflow > 0) {
      children = reduce(children, 0);
      overflow = adults + children + infants - MAX_TRAVELERS;
    }

    if (overflow > 0) {
      adults = reduce(adults, 1);
    }
  }

  return {
    adults,
    children,
    infants,
    total: adults + children + infants,
  };
}

export function clampTravelersToSlots(value, slots) {
  const normalized = normalizeTravelers(value);
  const limit = Math.max(
    1,
    Math.min(MAX_TRAVELERS, Math.floor(Number(slots) || 0)),
  );

  if (normalized.total <= limit) {
    return normalized;
  }

  let adults = normalized.adults;
  let children = normalized.children;
  let infants = normalized.infants;
  let overflow = adults + children + infants - limit;

  const reduce = (count, minimum) => {
    const amount = Math.min(overflow, Math.max(0, count - minimum));
    return count - amount;
  };

  infants = reduce(infants, 0);
  overflow = adults + children + infants - limit;

  if (overflow > 0) {
    children = reduce(children, 0);
    overflow = adults + children + infants - limit;
  }

  if (overflow > 0) {
    adults = reduce(adults, 1);
  }

  return {
    adults,
    children,
    infants,
    total: adults + children + infants,
  };
}

export function travelerTotal(travelers) {
  return normalizeTravelers(travelers).total;
}

export function travelerLabel(travelers) {
  const normalized = normalizeTravelers(travelers);
  const parts = [];

  if (normalized.adults > 0) {
    parts.push(
      `${normalized.adults} ${
        normalized.adults === 1 ? 'adult' : 'adults'
      }`,
    );
  }

  if (normalized.children > 0) {
    parts.push(
      `${normalized.children} ${
        normalized.children === 1 ? 'child' : 'children'
      }`,
    );
  }

  if (normalized.infants > 0) {
    parts.push(
      `${normalized.infants} ${
        normalized.infants === 1 ? 'infant' : 'infants'
      }`,
    );
  }

  return parts.join(', ');
}

export function travelerLineItems(pkg, travelers) {
  const normalized = normalizeTravelers(travelers);
  const adultPrice = Number(pkg.priceValue) || 0;
  const childPrice = Number(pkg.childPrice ?? adultPrice) || 0;
  const infantPrice = Number(pkg.infantPrice ?? 0) || 0;

  return [
    {
      key: 'adults',
      label: 'Adult',
      count: normalized.adults,
      unitPrice: adultPrice,
      amount: adultPrice * normalized.adults,
    },
    {
      key: 'children',
      label: 'Child',
      count: normalized.children,
      unitPrice: childPrice,
      amount: childPrice * normalized.children,
    },
    {
      key: 'infants',
      label: 'Infant',
      count: normalized.infants,
      unitPrice: infantPrice,
      amount: infantPrice * normalized.infants,
    },
  ].filter((item) => item.count > 0);
}

export function travelerSubtotal(pkg, travelers) {
  return travelerLineItems(pkg, travelers).reduce(
    (total, item) => total + item.amount,
    0,
  );
}
