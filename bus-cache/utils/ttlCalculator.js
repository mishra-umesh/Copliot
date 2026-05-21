/**
 * Dynamic TTL Calculator
 *
 * Priority order:
 *  1. Festival / holiday dates          → 2-5 min
 *  2. Journey within 0-2 days           → 2-5 min
 *  3. Journey within 3-7 days           → 10-15 min
 *  4. Journey beyond 7 days             → supplier cacheTTL (30-60 min default)
 *  5. Weekend (Fri/Sat/Sun)             → multiply TTL × weekendMultiplier (dynamic suppliers only)
 */

const { FESTIVAL_DATES, getSupplierConfig } = require('../config/supplierCacheConfig');

const TTL = {
  NEAR_MIN:  120,   // 2 min
  NEAR_MAX:  300,   // 5 min
  MID_MIN:   600,   // 10 min
  MID_MAX:   900,   // 15 min
  FAR_MIN:  1800,   // 30 min
  FAR_MAX:  3600,   // 60 min
};

/** Returns true for Friday (5), Saturday (6), Sunday (0). */
function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 5 || d === 6;
}

/** Returns true when the date string (YYYY-MM-DD) is a configured festival. */
function isFestivalDate(dateStr) {
  return FESTIVAL_DATES.has(dateStr);
}

/**
 * Days between today (UTC midnight) and journey date.
 * @param {string} journeyDate  YYYY-MM-DD
 * @returns {number}
 */
function daysUntilJourney(journeyDate) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const journey = new Date(journeyDate + 'T00:00:00Z');
  return Math.max(0, Math.round((journey - today) / 86_400_000));
}

/** Random integer in [min, max] – spreads cache expiries to avoid stampedes. */
function jitter(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate dynamic TTL for a supplier + journey.
 *
 * @param {string} supplierName
 * @param {string} journeyDate  YYYY-MM-DD
 * @returns {{ ttl: number, reason: string }}
 */
function calculateDynamicTTL(supplierName, journeyDate) {
  const config = getSupplierConfig(supplierName);

  if (!config.cacheEnabled) {
    return { ttl: 0, reason: 'cache_disabled_for_supplier' };
  }

  const days    = daysUntilJourney(journeyDate);
  const dateObj = new Date(journeyDate + 'T00:00:00Z');
  const weekend  = isWeekend(dateObj);
  const festival = isFestivalDate(journeyDate);

  let ttl, reason;

  if (festival || days <= 2) {
    ttl    = jitter(TTL.NEAR_MIN, TTL.NEAR_MAX);
    reason = festival ? 'festival_date' : 'near_date_0_2';
  } else if (days <= 7) {
    ttl    = jitter(TTL.MID_MIN, TTL.MID_MAX);
    reason = 'mid_date_3_7';
  } else {
    ttl    = config.cacheTTL || jitter(TTL.FAR_MIN, TTL.FAR_MAX);
    reason = 'far_date_7_plus';
  }

  // Weekend reduction for dynamic suppliers only
  if (weekend && config.dynamicPricing) {
    ttl    = Math.max(TTL.NEAR_MIN, Math.floor(ttl * config.weekendMultiplier));
    reason += '|weekend_reduced';
  }

  return { ttl, reason };
}

module.exports = { calculateDynamicTTL, isWeekend, isFestivalDate, daysUntilJourney };
