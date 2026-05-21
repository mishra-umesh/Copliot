/**
 * Supplier Cache Configuration
 * Defines per-supplier caching behaviour, TTL, and pricing type.
 */

const SUPPLIER_CACHE_CONFIG = {
  REDBUS: {
    supplierName: 'REDBUS',
    cacheEnabled: true,
    cacheTTL: 1800,           // seconds – default (>7 days journey)
    dynamicPricing: true,
    weekendMultiplier: 0.5,
    nearDateTTL: 300,         // 0-2 days journey
  },
  ABHIBUS: {
    supplierName: 'ABHIBUS',
    cacheEnabled: true,
    cacheTTL: 1800,
    dynamicPricing: true,
    weekendMultiplier: 0.5,
    nearDateTTL: 300,
  },
  VRL: {
    supplierName: 'VRL',
    cacheEnabled: true,
    cacheTTL: 3600,           // static-ish supplier – longer TTL
    dynamicPricing: false,
    weekendMultiplier: 0.7,
    nearDateTTL: 600,
  },
  MSRTC: {
    supplierName: 'MSRTC',
    cacheEnabled: true,
    cacheTTL: 3600,
    dynamicPricing: false,
    weekendMultiplier: 0.7,
    nearDateTTL: 600,
  },
  KALLADA: {
    supplierName: 'KALLADA',
    cacheEnabled: true,
    cacheTTL: 1800,
    dynamicPricing: true,
    weekendMultiplier: 0.5,
    nearDateTTL: 300,
  },
  DEFAULT: {
    supplierName: 'DEFAULT',
    cacheEnabled: true,
    cacheTTL: 1800,
    dynamicPricing: true,
    weekendMultiplier: 0.5,
    nearDateTTL: 300,
  },
};

/**
 * Public holidays / festival dates (YYYY-MM-DD).
 * Extend this list or fetch dynamically from a DB / external API.
 */
const FESTIVAL_DATES = new Set([
  '2026-01-26', // Republic Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-10-20', // Diwali (example)
  '2026-12-25', // Christmas
]);

/**
 * Returns the config for a given supplier (falls back to DEFAULT).
 * @param {string} supplierName
 * @returns {object}
 */
function getSupplierConfig(supplierName) {
  return SUPPLIER_CACHE_CONFIG[supplierName?.toUpperCase()] || SUPPLIER_CACHE_CONFIG.DEFAULT;
}

module.exports = { SUPPLIER_CACHE_CONFIG, FESTIVAL_DATES, getSupplierConfig };
