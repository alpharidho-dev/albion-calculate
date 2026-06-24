/**
 * AlbionCalculate — Black Market Arbitrage Calculator
 */

import { CITY_NAMES } from '../utils/constants.js';
import { calcMarketProfit } from '../utils/calculations.js';
import { formatSilverFull, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices } from '../api/albionData.js';
import { searchItems } from '../api/items.js';

export function renderBlackmarket() {
  const royalCityOptions = CITY_NAMES.filter(c => c !== 'Caerleon' && c !== 'Brecilien' && c !== 'Black Market').map(c =>
    `<option value="${c}">${c}</option>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">🏴 <span class="gradient-text">Black Market Calculator</span></h1>
          <p class="page-subtitle">Hitung profit membawa barang dari Royal City ke Black Market Caerleon (Arbitrage).</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Item Selection -->
          <div class="input-panel">
            <div class="input-panel-title">📦 Item Selection</div>
            <div class="form-group">
              <label class="label">Search Item</label>
              <div class="item-search-wrapper">
                <span class="item-search-icon">🔍</span>
                <input type="text" id="bm-item-search" class="item-search-input" placeholder="Search item (e.g. T4 Soldier Armor)..." />
                <div id="bm-search-results" class="item-search-results"></div>
              </div>
            </div>
            <div id="bm-selected-item" style="margin-top: var(--space-sm);display:none;">
              <div class="badge badge-gold" id="bm-selected-badge"></div>
            </div>
          </div>

          <!-- Locations & Trading settings -->
          <div class="input-panel">
            <div class="input-panel-title">🗺️ Route & Settings</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Source Royal City</label>
                <select class="select" id="bm-source-city">${royalCityOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Quantity</label>
                <input type="number" class="input input-mono" id="bm-qty" value="1" min="1" />
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Transport Cost / Fee (Total)</label>
                <input type="number" class="input input-mono" id="bm-transport-cost" value="0" min="0" placeholder="e.g. food/consumables" />
              </div>
              <div class="form-group">
                <label class="label">Transport Risk (Death Chance %)</label>
                <input type="number" class="input input-mono" id="bm-risk-percent" value="0" min="0" max="100" placeholder="0%" />
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="bm-sell-order" checked />
                <label class="toggle-label" for="bm-sell-order">Sell Order (Subject to 2.5% Fee)</label>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="bm-fetch-prices" style="margin-top:var(--space-md)">
              ⚡ Fetch Market Prices
            </button>
          </div>

          <!-- Price Overrides -->
          <div class="input-panel">
            <div class="input-panel-title">🪙 Price Inputs</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Royal Buy Price (per unit)</label>
                <input type="number" class="input input-mono" id="bm-royal-price" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Black Market Sell Price (per unit)</label>
                <input type="number" class="input input-mono" id="bm-price" placeholder="0" min="0" />
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="bm-calculate" style="width:100%">
            🧮 Calculate Arbitrage Profit
          </button>
        </div>

        <div class="calc-results">
          <!-- Results Card -->
          <div class="results-panel">
            <div class="results-panel-title">💰 Arbitrage Results</div>
            <div class="net-profit-display" id="bm-profit-box">
              <div class="net-profit-label">Net Profit after Tax & Transport</div>
              <div class="net-profit-value" id="bm-net-profit">—</div>
              <div class="net-profit-sub" id="bm-roi">—</div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Total Purchase Cost</div>
                <div class="result-value text-red" id="bm-purchase-cost">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Risk Loss Valuation</div>
                <div class="result-value text-red" id="bm-risk-cost">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Purchase Price (Total)</span>
                <span class="breakdown-value text-red" id="bm-breakdown-purchase">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Transport Cost</span>
                <span class="breakdown-value text-red" id="bm-breakdown-transport">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Risk Cost (Death Chance)</span>
                <span class="breakdown-value text-red" id="bm-breakdown-risk">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Investment Cost</span>
                <span class="breakdown-value" id="bm-breakdown-total-cost">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Black Market Sales</span>
                <span class="breakdown-value" id="bm-breakdown-gross">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Setup Fee (2.5%)</span>
                <span class="breakdown-value text-red" id="bm-breakdown-fee">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net BM Revenue</span>
                <span class="breakdown-value" id="bm-breakdown-revenue">—</span>
              </div>
            </div>
          </div>

          <!-- Transport Recommendation -->
          <div class="result-card">
            <div class="result-label">🛡️ Transport Recommendation</div>
            <div class="result-value gold" id="bm-recommendation">—</div>
            <div class="result-sub">Black Market prices vary quickly. Always double-check before crossing Red/Black zones!</div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initBlackmarket() {
  let selectedItem = null;

  // Autocomplete Item Search
  const searchInput = document.getElementById('bm-item-search');
  const resultsDiv = document.getElementById('bm-search-results');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const results = searchItems(e.target.value, 10);
      if (results.length > 0) {
        resultsDiv.innerHTML = results.map(item => `
          <div class="item-result" data-id="${item.id}" data-name="${item.name}">
            <span class="item-result-tier">T${item.tier}</span>
            <span class="item-result-name">${item.name}</span>
            <span class="item-result-category">${item.category}</span>
          </div>
        `).join('');
        resultsDiv.classList.add('open');

        resultsDiv.querySelectorAll('.item-result').forEach(el => {
          el.addEventListener('click', () => {
            selectedItem = { id: el.dataset.id, name: el.dataset.name };
            searchInput.value = el.dataset.name;
            resultsDiv.classList.remove('open');
            document.getElementById('bm-selected-badge').textContent = selectedItem.name;
            document.getElementById('bm-selected-item').style.display = 'block';

            // Auto trigger fetch
            document.getElementById('bm-fetch-prices').click();
          });
        });
      } else {
        resultsDiv.classList.remove('open');
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (e.target !== searchInput && e.target !== resultsDiv) {
        resultsDiv.classList.remove('open');
      }
    });
  }

  // Price Fetching
  document.getElementById('bm-fetch-prices')?.addEventListener('click', async () => {
    if (!selectedItem) {
      showToast('Please select an item first!', 'warning');
      return;
    }

    const sourceCity = document.getElementById('bm-source-city').value;
    const destinations = [sourceCity, 'Black Market'];

    showToast(`Fetching ${selectedItem.name} prices...`);
    try {
      const prices = await fetchPrices([selectedItem.id], destinations);

      const royalPriceData = prices.find(p => p.item_id === selectedItem.id && p.city === sourceCity);
      const bmPriceData = prices.find(p => p.item_id === selectedItem.id && p.city === 'Black Market');

      if (royalPriceData && royalPriceData.sell_price_min > 0) {
        document.getElementById('bm-royal-price').value = royalPriceData.sell_price_min;
      } else {
        document.getElementById('bm-royal-price').value = 0;
      }

      if (bmPriceData && bmPriceData.buy_price_max > 0) {
        // BM usually wants to buy, so buy_price_max is the highest buy order they placed!
        // sell_price_min is the lowest sell order (usually placed by other flippers).
        // Let's take buy_price_max for instant sell, or sell_price_min for placing sell orders.
        const useSellOrder = document.getElementById('bm-sell-order').checked;
        document.getElementById('bm-price').value = useSellOrder ? bmPriceData.sell_price_min : bmPriceData.buy_price_max;
      } else {
        document.getElementById('bm-price').value = 0;
      }

      showToast('Prices updated successfully!');
      document.getElementById('bm-calculate').click();
    } catch (err) {
      showToast('Failed to fetch prices. Please enter manually.', 'error');
      console.error(err);
    }
  });

  // Calculate
  document.getElementById('bm-calculate')?.addEventListener('click', () => {
    const royalPrice = Number(document.getElementById('bm-royal-price').value) || 0;
    const bmPrice = Number(document.getElementById('bm-price').value) || 0;
    const qty = Number(document.getElementById('bm-qty').value) || 1;
    const transportCost = Number(document.getElementById('bm-transport-cost').value) || 0;
    const riskPercent = (Number(document.getElementById('bm-risk-percent').value) || 0) / 100;
    const useSellOrder = document.getElementById('bm-sell-order').checked;

    // Purchase valuation
    const totalPurchase = royalPrice * qty;
    
    // Risk valuation (cost of losing the items * probability of death)
    const riskValuation = Math.round(totalPurchase * riskPercent);

    const totalInvestment = totalPurchase + transportCost + riskValuation;

    // Selling calculations
    const grossRevenue = bmPrice * qty;
    // Black Market setup fee is 2.5% if placing sell order. Instasell is 0%. No sales tax exists on BM sales.
    const setupFee = useSellOrder ? Math.round(grossRevenue * 0.025) : 0;
    const netRevenue = grossRevenue - setupFee;

    const netProfit = netRevenue - totalInvestment;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    // Display
    const box = document.getElementById('bm-profit-box');
    const profitVal = document.getElementById('bm-net-profit');

    profitVal.textContent = formatSilverFull(netProfit, true);
    profitVal.className = `net-profit-value ${profitClass(netProfit)}`;
    box.className = `net-profit-display ${profitClass(netProfit)}`;

    document.getElementById('bm-roi').textContent = `ROI: ${roi.toFixed(2)}%`;
    document.getElementById('bm-purchase-cost').textContent = formatSilverFull(totalPurchase);
    document.getElementById('bm-risk-cost').textContent = formatSilverFull(riskValuation);

    // Breakdown list
    document.getElementById('bm-breakdown-purchase').textContent = formatSilverFull(totalPurchase);
    document.getElementById('bm-breakdown-transport').textContent = formatSilverFull(transportCost);
    document.getElementById('bm-breakdown-risk').textContent = formatSilverFull(riskValuation);
    document.getElementById('bm-breakdown-total-cost').textContent = formatSilverFull(totalInvestment);
    document.getElementById('bm-breakdown-gross').textContent = formatSilverFull(grossRevenue);
    document.getElementById('bm-breakdown-fee').textContent = `-${formatSilverFull(setupFee)}`;
    document.getElementById('bm-breakdown-revenue').textContent = formatSilverFull(netRevenue);

    // Recommendation
    const rec = document.getElementById('bm-recommendation');
    if (netProfit <= 0) {
      rec.textContent = '❌ JANGAN DIKIRIM (Merugi)';
      rec.style.color = 'var(--loss-red)';
    } else {
      if (roi > 20) {
        rec.textContent = '🔥 SANGAT REKOMENDASI (ROI > 20%)';
        rec.style.color = 'var(--profit-green)';
      } else {
        rec.textContent = '⚖️ LAYAK DIKIRIM (Profit Tipis)';
        rec.style.color = 'var(--accent-blue)';
      }
    }
  });
}
