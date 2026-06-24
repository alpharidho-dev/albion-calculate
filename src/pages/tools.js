/**
 * AlbionCalculate — Miscellaneous Tools & Wishlist Tracker
 */

import { CITY_NAMES, RESOURCE_TYPES } from '../utils/constants.js';
import { formatSilverFull, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices, fetchHistory, fetchBatchPrices } from '../api/albionData.js';
import { searchItems } from '../api/items.js';
import { getWishlistItems, saveWishlistItem, removeWishlistItem, isSupabaseConfigured } from '../supabase.js';
import { Chart } from 'chart.js/auto';

// Recipes for crafting tree tool
const CRAFTING_RECIPES = {
  'T4_BAG': {
    name: 'T4 Bag',
    materials: [
      { id: 'T4_LEATHER', name: 'T4 Leather', qty: 8, baseRawId: 'T4_HIDE', rawQty: 16, prevRefinedId: 'T3_LEATHER', prevRefinedQty: 8 }
    ]
  },
  'T4_ARMOR_PLATE_SET1': {
    name: 'T4 Soldier Armor',
    materials: [
      { id: 'T4_METALBAR', name: 'T4 Metal Bar', qty: 32, baseRawId: 'T4_ORE', rawQty: 64, prevRefinedId: 'T3_METALBAR', prevRefinedQty: 32 }
    ]
  },
  'T4_ARMOR_LEATHER_SET1': {
    name: 'T4 Mercenary Jacket',
    materials: [
      { id: 'T4_LEATHER', name: 'T4 Leather', qty: 32, baseRawId: 'T4_HIDE', rawQty: 64, prevRefinedId: 'T3_LEATHER', prevRefinedQty: 32 }
    ]
  },
  'T4_ARMOR_CLOTH_SET1': {
    name: 'T4 Scholar Robe',
    materials: [
      { id: 'T4_CLOTH', name: 'T4 Cloth', qty: 32, baseRawId: 'T4_FIBER', rawQty: 64, prevRefinedId: 'T3_CLOTH', prevRefinedQty: 32 }
    ]
  },
  'T4_MAIN_SWORD': {
    name: 'T4 Broadsword',
    materials: [
      { id: 'T4_METALBAR', name: 'T4 Metal Bar', qty: 16, baseRawId: 'T4_ORE', rawQty: 32, prevRefinedId: 'T3_METALBAR', prevRefinedQty: 16 }
    ]
  }
};

export function renderTools() {
  const recipeOptions = Object.entries(CRAFTING_RECIPES).map(([id, r]) =>
    `<option value="${id}">${r.name}</option>`
  ).join('');

  const cityOptions = CITY_NAMES.map(c =>
    `<option value="${c}">${c}</option>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">🗺️ <span class="gradient-text">Auxiliary Economy Tools</span></h1>
          <p class="page-subtitle">Akses tool tambahan: Tracker Wishlist, grafik riwayat harga, kalkulator pohon crafting, dan tabel efisiensi fokus.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs" id="tools-tabs" style="margin-bottom:var(--space-md)">
        <button class="tab active" data-target="tools-wishlist">⭐ Wishlist Tracker</button>
        <button class="tab" data-target="tools-history">📈 Price History</button>
        <button class="tab" data-target="tools-tree">🌳 Crafting Tree</button>
        <button class="tab" data-target="tools-focus">⚡ Focus Cost Table</button>
      </div>

      <!-- Tab Content Area -->
      <div class="tools-tab-content">
        <!-- 1. Wishlist Tab -->
        <div class="tools-panel" id="tools-wishlist">
          <div class="calc-layout" style="grid-template-columns: 350px 1fr; gap: var(--space-md);">
            <!-- Sidebar Add Item -->
            <div class="input-panel">
              <div class="input-panel-title">⭐ Add Wishlist Item</div>
              <div class="form-group">
                <label class="label">Search Item</label>
                <div class="item-search-wrapper">
                  <span class="item-search-icon">🔍</span>
                  <input type="text" id="wishlist-item-search" class="item-search-input" placeholder="Search item..." />
                  <div id="wishlist-search-results" class="item-search-results"></div>
                </div>
              </div>
              <div id="wishlist-selected-item" style="margin: var(--space-sm) 0; display:none;">
                <div class="badge badge-gold" id="wishlist-selected-badge"></div>
              </div>
              <div class="form-group">
                <label class="label">Target City</label>
                <select class="select" id="wishlist-city">${cityOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Target Profit Threshold (Silver)</label>
                <input type="number" class="input input-mono" id="wishlist-threshold" value="10000" min="0" />
              </div>
              <button class="btn btn-primary" id="wishlist-add-btn" style="width:100%; margin-top:var(--space-sm)">
                ⭐ Add to Wishlist
              </button>
            </div>

            <!-- Wishlist Grid / List -->
            <div class="input-panel" style="min-height:300px;">
              <div class="input-panel-title" style="display:flex; justify-content:space-between; align-items:center;">
                <span>Active Wishlist Tracker</span>
                <button class="btn btn-secondary btn-sm" id="wishlist-refresh-btn">⚡ Refresh Prices</button>
              </div>
              <div class="table-container" style="margin-top:var(--space-md); overflow-x:auto;">
                <table class="table" style="width:100%; border-collapse:collapse; text-align:left;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,215,0,0.15); color:var(--text-secondary)">
                      <th style="padding:var(--space-sm)">Item Name</th>
                      <th style="padding:var(--space-sm)">Target City</th>
                      <th style="padding:var(--space-sm)">Market Min Sell</th>
                      <th style="padding:var(--space-sm)">Target Profit</th>
                      <th style="padding:var(--space-sm)">Last Updated</th>
                      <th style="padding:var(--space-sm)">Action</th>
                    </tr>
                  </thead>
                  <tbody id="wishlist-table-body">
                    <tr><td colspan="6" style="text-align:center; padding:var(--space-md); color:var(--text-secondary);">No items in wishlist. Add some items on the left!</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Price History Tab -->
        <div class="tools-panel" style="display:none;" id="tools-history">
          <div class="calc-layout" style="grid-template-columns: 350px 1fr; gap: var(--space-md);">
            <div class="input-panel">
              <div class="input-panel-title">📈 History Settings</div>
              <div class="form-group">
                <label class="label">Search Item</label>
                <div class="item-search-wrapper">
                  <span class="item-search-icon">🔍</span>
                  <input type="text" id="history-item-search" class="item-search-input" placeholder="Search item..." />
                  <div id="history-search-results" class="item-search-results"></div>
                </div>
              </div>
              <div id="history-selected-item" style="margin: var(--space-sm) 0; display:none;">
                <div class="badge badge-gold" id="history-selected-badge"></div>
              </div>
              <div class="form-group">
                <label class="label">City Location</label>
                <select class="select" id="history-city">${cityOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Time Scale</label>
                <select class="select" id="history-timescale">
                  <option value="24" selected>Daily Trends</option>
                  <option value="6">6-Hour Intervals</option>
                  <option value="1">Hourly Intervals</option>
                </select>
              </div>
              <button class="btn btn-primary" id="history-render-btn" style="width:100%; margin-top:var(--space-sm)">
                📈 Fetch & Plot History
              </button>
            </div>

            <div class="input-panel" style="min-height:350px;">
              <div class="input-panel-title">📊 Price History Chart</div>
              <div style="position: relative; height:320px; width:100%;">
                <canvas id="history-chart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Crafting Tree Tab -->
        <div class="tools-panel" style="display:none;" id="tools-tree">
          <div class="calc-layout" style="grid-template-columns: 350px 1fr; gap: var(--space-md);">
            <div class="input-panel">
              <div class="input-panel-title">🌳 Crafting Tree Setup</div>
              <div class="form-group">
                <label class="label">Select Crafted Item</label>
                <select class="select" id="tree-crafted-item">${recipeOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Craft City (Affects RRR)</label>
                <select class="select" id="tree-city">${cityOptions}</select>
              </div>
              <div class="form-row">
                <div class="toggle-wrapper">
                  <input type="checkbox" class="toggle" id="tree-use-focus" />
                  <label class="toggle-label" for="tree-use-focus">Use Focus</label>
                </div>
              </div>
              <button class="btn btn-primary" id="tree-calculate-btn" style="width:100%; margin-top:var(--space-md)">
                🌳 Calculate Tree Cost
              </button>
            </div>

            <div class="input-panel">
              <div class="input-panel-title">🌳 Crafting Tree Breakdown</div>
              
              <div class="result-grid" style="margin-bottom:var(--space-md);">
                <div class="result-card">
                  <div class="result-label">Cost using Raw Materials</div>
                  <div class="result-value gold" id="tree-raw-cost">—</div>
                </div>
                <div class="result-card">
                  <div class="result-label">Cost buying Refined directly</div>
                  <div class="result-value" style="color:var(--accent-blue)" id="tree-refined-cost">—</div>
                </div>
              </div>

              <div class="breakdown-list" id="tree-recipe-details">
                <div style="text-align:center; color:var(--text-secondary); padding:var(--space-md)">
                  Select an item and calculate to see recipe trees.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Focus Cost Table Tab -->
        <div class="tools-panel" style="display:none;" id="tools-focus">
          <div class="calc-layout" style="grid-template-columns: 350px 1fr; gap: var(--space-md);">
            <div class="input-panel">
              <div class="input-panel-title">⚡ Focus Reduction Calculator</div>
              <div class="form-group">
                <label class="label">Base Focus Cost (Spec 0)</label>
                <input type="number" class="input input-mono" id="focus-base-cost" value="1000" min="10" />
              </div>
              <div class="form-group">
                <label class="label">Your Specialization Level</label>
                <input type="number" class="input input-mono" id="focus-user-spec" value="50" min="0" max="100" />
              </div>
              <button class="btn btn-primary" id="focus-calculate-btn" style="width:100%; margin-top:var(--space-sm)">
                📊 Generate Spec Table
              </button>
            </div>

            <div class="input-panel">
              <div class="input-panel-title">⚡ Focus Cost vs Specialization (0-100)</div>
              
              <div class="result-grid" style="margin-bottom:var(--space-md);">
                <div class="result-card">
                  <div class="result-label">Your Effective Focus Cost</div>
                  <div class="result-value gold" id="focus-effective-cost">—</div>
                  <div class="result-sub" id="focus-effective-saved">—</div>
                </div>
                <div class="result-card">
                  <div class="result-label">Crafts per Day (10,000 Focus)</div>
                  <div class="result-value" style="color:var(--profit-green)" id="focus-crafts-day">—</div>
                </div>
              </div>

              <div class="table-container" style="overflow-x:auto;">
                <table class="table" style="width:100%; border-collapse:collapse; text-align:left;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,215,0,0.15); color:var(--text-secondary)">
                      <th style="padding:var(--space-xs) var(--space-sm)">Spec Level</th>
                      <th style="padding:var(--space-xs) var(--space-sm)">Effective Focus Cost</th>
                      <th style="padding:var(--space-xs) var(--space-sm)">Focus Cost Reduction</th>
                      <th style="padding:var(--space-xs) var(--space-sm)">Max Crafts / Day</th>
                    </tr>
                  </thead>
                  <tbody id="focus-table-body">
                    <!-- Dynamic rows -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// Local storage wishlist fallback helpers
function getLocalWishlist() {
  const list = localStorage.getItem('albion_wishlist');
  return list ? JSON.parse(list) : [];
}

function saveLocalWishlistItem(item) {
  const list = getLocalWishlist();
  const index = list.findIndex(i => i.item_id === item.item_id);
  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }
  localStorage.setItem('albion_wishlist', JSON.stringify(list));
}

function removeLocalWishlistItem(itemId) {
  const list = getLocalWishlist();
  const filtered = list.filter(i => i.item_id !== itemId);
  localStorage.setItem('albion_wishlist', JSON.stringify(filtered));
}

let historyChart = null;

export function initTools() {
  // Tab Switching
  document.querySelectorAll('#tools-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#tools-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      document.querySelectorAll('.tools-tab-content .tools-panel').forEach(panel => {
        panel.style.display = 'none';
      });
      document.getElementById(target).style.display = 'block';
    });
  });

  // ==========================================
  // 1. WISHLIST TRACKER LOGIC
  // ==========================================
  let selectedWishlistItem = null;
  const wishSearchInput = document.getElementById('wishlist-item-search');
  const wishSearchResults = document.getElementById('wishlist-search-results');

  if (wishSearchInput) {
    wishSearchInput.addEventListener('input', (e) => {
      const results = searchItems(e.target.value, 10);
      if (results.length > 0) {
        wishSearchResults.innerHTML = results.map(item => `
          <div class="item-result" data-id="${item.id}" data-name="${item.name}">
            <span class="item-result-tier">T${item.tier}</span>
            <span class="item-result-name">${item.name}</span>
          </div>
        `).join('');
        wishSearchResults.classList.add('open');

        wishSearchResults.querySelectorAll('.item-result').forEach(el => {
          el.addEventListener('click', () => {
            selectedWishlistItem = { id: el.dataset.id, name: el.dataset.name };
            wishSearchInput.value = el.dataset.name;
            wishSearchResults.classList.remove('open');
            document.getElementById('wishlist-selected-badge').textContent = selectedWishlistItem.name;
            document.getElementById('wishlist-selected-item').style.display = 'block';
          });
        });
      } else {
        wishSearchResults.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target !== wishSearchInput && e.target !== wishSearchResults) {
        wishSearchResults.classList.remove('open');
      }
    });
  }

  const renderWishlist = async () => {
    let items = [];
    const useSupabase = isSupabaseConfigured();
    
    if (useSupabase) {
      items = await getWishlistItems();
    } else {
      items = getLocalWishlist();
    }

    const tbody = document.getElementById('wishlist-table-body');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--space-md); color:var(--text-secondary);">No items in wishlist. Add some items on the left!</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const formattedPrice = item.last_price > 0 ? formatSilverFull(item.last_price) : 'No Price (Refresh)';
      const priceClass = item.last_price > 0 ? 'gold font-mono' : 'text-secondary';
      const lastUpdate = item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Never';

      return `
        <tr style="border-bottom: 1px solid rgba(255,215,0,0.05)">
          <td style="padding:var(--space-sm); font-weight:600; color:var(--text-primary)">${item.item_name}</td>
          <td style="padding:var(--space-sm); color:var(--accent-blue)">${item.target_city}</td>
          <td style="padding:var(--space-sm);" class="${priceClass}">${formattedPrice}</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono); font-weight:bold; color:var(--warning-yellow)">${formatSilverFull(item.target_profit)}</td>
          <td style="padding:var(--space-sm); font-size:0.85rem; color:var(--text-secondary)">${lastUpdate}</td>
          <td style="padding:var(--space-sm)">
            <button class="btn btn-secondary btn-sm wish-delete-btn" data-id="${item.item_id}" style="padding:2px 8px; font-size:0.8rem; background:#EF4444; border-color:#EF4444">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind delete events
    tbody.querySelectorAll('.wish-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (useSupabase) {
          await removeWishlistItem(id);
        } else {
          removeLocalWishlistItem(id);
        }
        showToast('Item removed from wishlist');
        renderWishlist();
      });
    });
  };

  document.getElementById('wishlist-add-btn')?.addEventListener('click', async () => {
    if (!selectedWishlistItem) {
      showToast('Select an item first!', 'warning');
      return;
    }

    const city = document.getElementById('wishlist-city').value;
    const threshold = Number(document.getElementById('wishlist-threshold').value) || 0;

    const newItem = {
      item_id: selectedWishlistItem.id,
      item_name: selectedWishlistItem.name,
      target_city: city,
      target_profit: threshold,
      last_price: 0,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      await saveWishlistItem(newItem);
    } else {
      saveLocalWishlistItem(newItem);
    }

    showToast('Item added to wishlist!');
    wishSearchInput.value = '';
    document.getElementById('wishlist-selected-item').style.display = 'none';
    selectedWishlistItem = null;
    renderWishlist();
  });

  document.getElementById('wishlist-refresh-btn')?.addEventListener('click', async () => {
    let items = [];
    const useSupabase = isSupabaseConfigured();
    if (useSupabase) {
      items = await getWishlistItems();
    } else {
      items = getLocalWishlist();
    }

    if (items.length === 0) return;

    showToast('Refreshing prices...');
    const itemIds = items.map(i => i.item_id);

    try {
      // Batch fetch prices
      const prices = await fetchPrices(itemIds, CITY_NAMES);
      
      for (const item of items) {
        const itemPrices = prices.find(p => p.item_id === item.item_id && p.city === item.target_city);
        if (itemPrices && itemPrices.sell_price_min > 0) {
          item.last_price = itemPrices.sell_price_min;
          item.updated_at = new Date().toISOString();
          
          if (useSupabase) {
            await saveWishlistItem(item);
          } else {
            saveLocalWishlistItem(item);
          }
        }
      }
      
      showToast('Wishlist prices updated!');
      renderWishlist();
    } catch (err) {
      showToast('Failed to refresh prices', 'error');
      console.error(err);
    }
  });

  renderWishlist(); // Initial wishlist render

  // ==========================================
  // 2. PRICE HISTORY LOGIC
  // ==========================================
  let selectedHistoryItem = null;
  const histSearchInput = document.getElementById('history-item-search');
  const histSearchResults = document.getElementById('history-search-results');

  if (histSearchInput) {
    histSearchInput.addEventListener('input', (e) => {
      const results = searchItems(e.target.value, 10);
      if (results.length > 0) {
        histSearchResults.innerHTML = results.map(item => `
          <div class="item-result" data-id="${item.id}" data-name="${item.name}">
            <span class="item-result-tier">T${item.tier}</span>
            <span class="item-result-name">${item.name}</span>
          </div>
        `).join('');
        histSearchResults.classList.add('open');

        histSearchResults.querySelectorAll('.item-result').forEach(el => {
          el.addEventListener('click', () => {
            selectedHistoryItem = { id: el.dataset.id, name: el.dataset.name };
            histSearchInput.value = el.dataset.name;
            histSearchResults.classList.remove('open');
            document.getElementById('history-selected-badge').textContent = selectedHistoryItem.name;
            document.getElementById('history-selected-item').style.display = 'block';
          });
        });
      } else {
        histSearchResults.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target !== histSearchInput && e.target !== histSearchResults) {
        histSearchResults.classList.remove('open');
      }
    });
  }

  document.getElementById('history-render-btn')?.addEventListener('click', async () => {
    if (!selectedHistoryItem) {
      showToast('Select an item first!', 'warning');
      return;
    }

    const city = document.getElementById('history-city').value;
    const scale = Number(document.getElementById('history-timescale').value) || 24;

    showToast('Fetching price history...');
    try {
      const historyData = await fetchHistory(selectedHistoryItem.id, scale, city);
      
      if (!historyData || historyData.length === 0 || !historyData[0].data) {
        showToast('No history data found for this item/city combination.', 'warning');
        return;
      }

      const rawPoints = historyData[0].data;
      // Sort history points by date ascending
      rawPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Limit to latest 30 points for chart readability
      const points = rawPoints.slice(-30);

      const labels = points.map(p => new Date(p.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}));
      const minPrices = points.map(p => p.item_amount);

      const ctx = document.getElementById('history-chart');
      if (ctx) {
        if (historyChart) historyChart.destroy();

        historyChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Avg Price (Silver)',
              data: minPrices,
              borderColor: '#FFD700',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderWidth: 2,
              tension: 0.1,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => ` ${formatSilverFull(context.raw)} Silver`
                }
              }
            },
            scales: {
              x: { ticks: { color: '#9CA3AF' }, grid: { display: false } },
              y: { 
                ticks: { 
                  color: '#9CA3AF',
                  callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
                }, 
                grid: { color: 'rgba(255, 215, 0, 0.05)' } 
              }
            }
          }
        });
      }
      showToast('Chart plotted successfully!');
    } catch (err) {
      showToast('Failed to fetch history', 'error');
      console.error(err);
    }
  });

  // ==========================================
  // 3. CRAFTING TREE LOGIC
  // ==========================================
  document.getElementById('tree-calculate-btn')?.addEventListener('click', async () => {
    const itemId = document.getElementById('tree-crafted-item').value;
    const city = document.getElementById('tree-city').value;
    const useFocus = document.getElementById('tree-use-focus').checked;

    const recipe = CRAFTING_RECIPES[itemId];
    if (!recipe) return;

    showToast('Calculating recipe tree costs...');

    // Extract item IDs to fetch
    const mat = recipe.materials[0];
    const itemsToFetch = [itemId, mat.id, mat.baseRawId, mat.prevRefinedId];

    try {
      const prices = await fetchPrices(itemsToFetch, [city]);
      const craftedPrice = prices.find(p => p.item_id === itemId)?.sell_price_min || 0;
      const refinedPrice = prices.find(p => p.item_id === mat.id)?.sell_price_min || 0;
      const rawPrice = prices.find(p => p.item_id === mat.baseRawId)?.sell_price_min || 0;
      const prevRefinedPrice = prices.find(p => p.item_id === mat.prevRefinedId)?.sell_price_min || 0;

      // Formula details: RRR
      const isBonusCity = city === 'Thetford' || city === 'Fort Sterling' || city === 'Lymhurst' || city === 'Bridgewatch' || city === 'Martlock';
      let rrr = 0.15; // base
      if (isBonusCity) rrr += 0.15; // bonus city crafting
      if (useFocus) rrr += 0.30; // focus approx

      const netRawMultiplier = 1 - rrr;

      // 1. Refined direct cost: Buy refined mats directly
      const refinedDirectTotal = refinedPrice * mat.qty;

      // 2. Buy raw mats and refine them yourself (raw cost + prev refined)
      const rawInputCostPerUnit = (rawPrice * 2) + prevRefinedPrice; // T4 refinement ratio is 2:1
      const effectiveRefineCost = rawInputCostPerUnit * netRawMultiplier;
      const totalRawCost = Math.round(effectiveRefineCost * mat.qty);

      document.getElementById('tree-raw-cost').textContent = formatSilverFull(totalRawCost);
      document.getElementById('tree-refined-cost').textContent = formatSilverFull(refinedDirectTotal);

      // Recipe Details layout
      const details = document.getElementById('tree-recipe-details');
      details.innerHTML = `
        <div class="breakdown-list">
          <div class="breakdown-item">
            <span class="breakdown-label">Crafted Output: <strong>${recipe.name}</strong></span>
            <span class="breakdown-value gold font-mono">${formatSilverFull(craftedPrice)} sell price</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Material required: ${mat.qty}x ${mat.name}</span>
            <span class="breakdown-value text-red font-mono">-${formatSilverFull(refinedDirectTotal)} (@ ${formatSilverFull(refinedPrice)})</span>
          </div>
          <div class="divider"></div>
          <div class="breakdown-item">
            <span class="breakdown-label">Refining tree options for ${mat.qty}x ${mat.name}:</span>
          </div>
          <div class="breakdown-item" style="padding-left: var(--space-md)">
            <span class="breakdown-label">🍀 Buy Raw resource (${mat.rawQty}x @ ${formatSilverFull(rawPrice)})</span>
            <span class="breakdown-value font-mono">${formatSilverFull(rawPrice * mat.rawQty)}</span>
          </div>
          <div class="breakdown-item" style="padding-left: var(--space-md)">
            <span class="breakdown-label">🪵 Buy Previous Tier refined (${mat.prevRefinedQty}x @ ${formatSilverFull(prevRefinedPrice)})</span>
            <span class="breakdown-value font-mono">${formatSilverFull(prevRefinedPrice * mat.prevRefinedQty)}</span>
          </div>
          <div class="breakdown-item" style="padding-left: var(--space-md)">
            <span class="breakdown-label">♻️ Effective return rebate (${(rrr * 100).toFixed(0)}% RRR)</span>
            <span class="breakdown-value text-green font-mono">-${formatSilverFull((rawPrice * mat.rawQty + prevRefinedPrice * mat.prevRefinedQty) * rrr)}</span>
          </div>
          <div class="divider"></div>
          <div class="breakdown-item total">
            <span class="breakdown-label">Crafting Recommendation</span>
            <span class="breakdown-value" style="color:${totalRawCost < refinedDirectTotal ? 'var(--profit-green)' : 'var(--accent-blue)'}">
              ${totalRawCost < refinedDirectTotal ? 'REFINING RAW LEBIH MURAH' : 'BELI REFINED LANGSUNG LEBIH MURAH'}
            </span>
          </div>
        </div>
      `;
    } catch (err) {
      showToast('Failed to calculate tree costs', 'error');
      console.error(err);
    }
  });

  // ==========================================
  // 4. FOCUS COST TABLE LOGIC
  // ==========================================
  document.getElementById('focus-calculate-btn')?.addEventListener('click', () => {
    const baseCost = Number(document.getElementById('focus-base-cost').value) || 1000;
    const userSpec = Number(document.getElementById('focus-user-spec').value) || 0;

    // Formula: Cost = Base * (0.5 ^ (Spec / 100))
    const calcCost = (spec) => Math.round(baseCost * Math.pow(0.5, spec / 100));

    const userCost = calcCost(userSpec);
    const userSaved = baseCost - userCost;
    const userCrafts = Math.floor(10000 / userCost);

    document.getElementById('focus-effective-cost').textContent = `${userCost} points`;
    document.getElementById('focus-effective-saved').textContent = `Savings: ${userSaved} points (${((userSaved / baseCost) * 100).toFixed(0)}% saved)`;
    document.getElementById('focus-crafts-day').textContent = `${userCrafts} crafts`;

    // Render comparison steps
    const tbody = document.getElementById('focus-table-body');
    if (tbody) {
      const specs = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      tbody.innerHTML = specs.map(spec => {
        const cost = calcCost(spec);
        const savedPercent = ((baseCost - cost) / baseCost) * 100;
        const maxCrafts = Math.floor(10000 / cost);
        const isUserLine = spec === Math.round(userSpec / 10) * 10;
        const style = isUserLine ? 'background: rgba(255, 215, 0, 0.05); font-weight: bold; border-left: 2px solid var(--accent-gold)' : '';

        return `
          <tr style="border-bottom: 1px solid rgba(255,215,0,0.05); ${style}">
            <td style="padding:var(--space-xs) var(--space-sm)">${spec === 100 ? '100 (Max Spec)' : spec}</td>
            <td style="padding:var(--space-xs) var(--space-sm); font-family:var(--font-mono)">${cost} points</td>
            <td style="padding:var(--space-xs) var(--space-sm); color:var(--profit-green)">${savedPercent.toFixed(0)}%</td>
            <td style="padding:var(--space-xs) var(--space-sm); font-family:var(--font-mono)">${maxCrafts} crafts</td>
          </tr>
        `;
      }).join('');
    }
  });

  // Initial trigger for focus
  document.getElementById('focus-calculate-btn')?.click();
}
