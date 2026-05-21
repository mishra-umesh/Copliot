/**
 * Cache Key Builder
 * Builds a deterministic Redis key for every supplier + search combination.
 *
 * Key format:
 *   bus:cache:{supplierName}:{sourceId}:{destinationId}:{journeyDate}:{flags}:{platform}:{countryCode}
 *
 * Where {flags} = isVrl|isVolvo|inventory  (binary string, e.g. "1|0|1")
 */

/**
 * @param {object} params
 * @param {string} params.supplierName
 * @param {string|number} params.sourceId
 * @param {string|number} params.destinationId
 * @param {string} params.journeyDate   – YYYY-MM-DD
 * @param {boolean} [params.isVrl]
 * @param {boolean} [params.isVolvo]
 * @param {boolean} [params.inventory]
 * @param {string} [params.platform]    – e.g. "app" | "web"
 * @param {string} [params.countryCode] – e.g. "IN"
 * @returns {string}
 */
function buildCacheKey({
  supplierName,
  sourceId,
  destinationId,
  journeyDate,
  isVrl = false,
  isVolvo = false,
  inventory = false,
  platform = 'web',
  countryCode = 'IN',
}) {
  if (!supplierName || !sourceId || !destinationId || !journeyDate) {
    throw new Error('buildCacheKey: supplierName, sourceId, destinationId and journeyDate are required');
  }

  const flags = `${isVrl ? 1 : 0}|${isVolvo ? 1 : 0}|${inventory ? 1 : 0}`;
  const key = [
    'bus:cache',
    supplierName.toUpperCase(),
    sourceId,
    destinationId,
    journeyDate,
    flags,
    platform.toLowerCase(),
    countryCode.toUpperCase(),
  ].join(':');

  return key;
}

/**
 * Builds cache keys for ALL suppliers given in the list.
 * @param {string[]} supplierNames
 * @param {object} params  – same shape as buildCacheKey (without supplierName)
 * @returns {{ [supplierName: string]: string }}
 */
function buildAllSupplierKeys(supplierNames, params) {
  return supplierNames.reduce((acc, name) => {
    acc[name] = buildCacheKey({ ...params, supplierName: name });
    return acc;
  }, {});
}

module.exports = { buildCacheKey, buildAllSupplierKeys };
