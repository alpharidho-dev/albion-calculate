/**
 * AlbionCalculate — Albion Data Project API Wrapper
 * Fetches market prices and historical data
 */

import { API_SERVERS, DEFAULT_SERVER, API_LOCATIONS } from '../utils/constants.js';
import { showToast } from '../utils/formatters.js';

let currentServer = DEFAULT_SERVER;

// Cache with 5-minute TTL
const priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Set the API server region
 * @param {'west'|'east'|'europe'} server
 */
export function setServer(server) {
  if (API_SERVERS[server]) {
    currentServer = server;
    priceCache.clear(); // Clear cache when switching servers
  }
}

/**
 * Get current server info
 */
export function getServer() {
  return { key: currentServer, ...API_SERVERS[currentServer] };
}

/**
 * Get base URL for current server
 */
function getBaseUrl() {
  return API_SERVERS[currentServer].url;
}

/**
 * Generate cache key
 */
function cacheKey(endpoint, params) {
  return `${currentServer}:${endpoint}:${JSON.stringify(params)}`;
}

/**
 * Check cache validity
 */
function getCached(key) {
  const entry = priceCache.get(key);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
    return entry.data;
  }
  priceCache.delete(key);
  return null;
}

/**
 * Set cache entry
 */
function setCache(key, data) {
  priceCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch current prices for items
 * @param {string|string[]} itemIds - Item ID(s) to look up
 * @param {string[]} locations - City names (defaults to all)
 * @param {number[]} qualities - Quality levels (1-5)
 * @returns {Promise<Array>} Price data array
 */
export async function fetchPrices(itemIds, locations = null, qualities = null) {
  const ids = Array.isArray(itemIds) ? itemIds.join(',') : itemIds;
  const locs = locations ? locations.join(',') : API_LOCATIONS.join(',');
  const params = { locations: locs };
  if (qualities) params.qualities = qualities.join(',');

  const key = cacheKey('prices', { ids, ...params });
  const cached = getCached(key);
  if (cached) return cached;

  try {
    let url = `${getBaseUrl()}/api/v2/stats/prices/${ids}.json?locations=${encodeURIComponent(locs)}`;
    if (qualities) url += `&qualities=${qualities.join(',')}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    setCache(key, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    showToast('Failed to fetch market prices', 'error');
    return [];
  }
}

/**
 * Fetch historical prices
 * @param {string} itemId - Single item ID
 * @param {number} timeScale - 1 (hourly), 6 (6-hour), 24 (daily)
 * @param {string} location - City name
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD
 * @returns {Promise<Array>} Historical price data
 */
export async function fetchHistory(itemId, timeScale = 24, location = 'Caerleon', startDate = null, endDate = null) {
  const key = cacheKey('history', { itemId, timeScale, location, startDate, endDate });
  const cached = getCached(key);
  if (cached) return cached;

  try {
    let url = `${getBaseUrl()}/api/v2/stats/history/${itemId}.json?time-scale=${timeScale}&locations=${encodeURIComponent(location)}`;
    if (startDate) url += `&date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    setCache(key, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    showToast('Failed to fetch price history', 'error');
    return [];
  }
}

/**
 * Get best buy/sell prices across cities for an item
 * @param {string} itemId
 * @returns {Promise<object>} {bestBuy: {city, price}, bestSell: {city, price}, allPrices: [...]}
 */
export async function getBestPrices(itemId) {
  const data = await fetchPrices(itemId);
  if (!data.length) return null;

  let bestBuy = { city: '', price: Infinity };
  let bestSell = { city: '', price: 0 };
  const allPrices = [];

  for (const entry of data) {
    const info = {
      city: entry.city,
      sellMin: entry.sell_price_min || 0,
      sellMax: entry.sell_price_max || 0,
      buyMin: entry.buy_price_min || 0,
      buyMax: entry.buy_price_max || 0,
      sellDate: entry.sell_price_min_date,
      buyDate: entry.buy_price_max_date
    };
    allPrices.push(info);

    if (info.sellMin > 0 && info.sellMin < bestBuy.price) {
      bestBuy = { city: info.city, price: info.sellMin };
    }
    if (info.buyMax > bestSell.price) {
      bestSell = { city: info.city, price: info.buyMax };
    }
  }

  return { bestBuy, bestSell, allPrices };
}

/**
 * Fetch prices for multiple items at once (batch)
 * @param {string[]} itemIds
 * @param {string} location
 * @returns {Promise<Map<string, object>>} Map of itemId -> price data
 */
export async function fetchBatchPrices(itemIds, location = null) {
  const data = await fetchPrices(itemIds, location ? [location] : null);
  const priceMap = new Map();

  for (const entry of data) {
    const key = `${entry.item_id}_${entry.city}`;
    priceMap.set(key, {
      itemId: entry.item_id,
      city: entry.city,
      sellMin: entry.sell_price_min || 0,
      buyMax: entry.buy_price_max || 0
    });
  }

  return priceMap;
}

/**
 * Clear the price cache
 */
export function clearCache() {
  priceCache.clear();
  showToast('Price cache cleared', 'info');
}
