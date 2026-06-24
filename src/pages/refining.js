/**
 * AlbionCalculate — Refining Calculator
 */

import { RESOURCE_TYPES, CITIES, CITY_NAMES, TIERS, REFINING_RATIOS } from '../utils/constants.js';
import { calcEffectiveRRR, calcRefiningProfit } from '../utils/calculations.js';
import { formatSilverFull, formatPercent, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices } from '../api/albionData.js';

export function renderRefining() {
  const resTypes = Object.entries(RESOURCE_TYPES).map(([key, val]) =>
    `<button class="tab" data-res="${key}">${val.icon} ${val.name}</button>`
  ).join('');

  const tierOpts = TIERS.filter(t => t.value >= 2).map(t =>
    `<option value="${t.value}">${t.label} — ${t.name}</option>`
  ).join('');

  const cityBtns = CITY_NAMES.map(c =>
    `<button class="city-btn" data-city="${c}">
      <span class="city-dot ${CITIES[c].dotClass}"></span>${c}
      ${CITIES[c].refiningBonus ? `<span class="city-bonus">+36.7%</span>` : ''}
    </button>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">⚗️ <span class="gradient-text">Refining Calculator</span></h1>
          <p class="page-subtitle">Hitung profit refining resource. Bandingkan jual raw material vs jual refined.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Resource Type -->
          <div class="input-panel">
            <div class="input-panel-title">🪨 Resource Type</div>
            <div class="tabs" id="refine-res-tabs">${resTypes}</div>
          </div>

          <!-- Settings -->
          <div class="input-panel">
            <div class="input-panel-title">⚙️ Settings</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Tier</label>
                <select class="select" id="refine-tier">${tierOpts}</select>
              </div>
              <div class="form-group">
                <label class="label">Quantity</label>
                <input type="number" class="input input-mono" id="refine-quantity" value="100" min="1" />
              </div>
            </div>

            <div class="form-group" style="margin-top:var(--space-md)">
              <label class="label">Refining City</label>
              <div class="city-selector" id="refine-city-selector">${cityBtns}</div>
            </div>

            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="refine-use-focus" />
                <label class="toggle-label" for="refine-use-focus">Use Focus</label>
              </div>
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="refine-premium" checked />
                <label class="toggle-label" for="refine-premium">Premium</label>
              </div>
            </div>
          </div>

          <!-- Prices -->
          <div class="input-panel">
            <div class="input-panel-title">💲 Prices</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label" id="refine-raw-label">Raw Resource Price</label>
                <input type="number" class="input input-mono" id="refine-raw-price" placeholder="0" min="0" />
              </div>
              <div class="form-group" id="refine-prev-group">
                <label class="label" id="refine-prev-label">Previous Tier Refined Price</label>
                <input type="number" class="input input-mono" id="refine-prev-price" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-group" style="margin-top:var(--space-sm)">
              <label class="label" id="refine-result-label">Refined Result Price</label>
              <input type="number" class="input input-mono" id="refine-result-price" placeholder="0" min="0" />
            </div>
            <button class="btn btn-secondary btn-sm" id="refine-fetch-prices" style="margin-top:var(--space-md)">
              ⚡ Fetch Market Prices
            </button>
          </div>

          <button class="btn btn-primary btn-lg" id="refine-calculate" style="width:100%">
            🧮 Calculate Profit
          </button>
        </div>

        <!-- Results -->
        <div class="calc-results">
          <div class="results-panel">
            <div class="results-panel-title">💰 Refining Results</div>

            <div class="net-profit-display" id="refine-net-profit-box">
              <div class="net-profit-label">Net Profit</div>
              <div class="net-profit-value" id="refine-net-profit">—</div>
              <div class="net-profit-sub" id="refine-profit-margin"></div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Return Rate</div>
                <div class="result-value gold" id="refine-rrr">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Materials Saved</div>
                <div class="result-value text-green" id="refine-saved">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Raw Materials Needed</span>
                <span class="breakdown-value" id="refine-raw-needed">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Prev Tier Refined Needed</span>
                <span class="breakdown-value" id="refine-prev-needed">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Base Material Cost</span>
                <span class="breakdown-value" id="refine-base-cost">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Effective Cost (after RRR)</span>
                <span class="breakdown-value" id="refine-eff-cost">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Cost</span>
                <span class="breakdown-value" id="refine-total-cost">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Revenue</span>
                <span class="breakdown-value" id="refine-gross">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Setup Fee + Tax</span>
                <span class="breakdown-value text-red" id="refine-taxes">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Revenue</span>
                <span class="breakdown-value" id="refine-net-revenue">—</span>
              </div>
            </div>
          </div>

          <!-- Comparison: Sell Raw vs Refined -->
          <div class="input-panel" style="border-color: var(--accent-blue); border-width:1px;">
            <div class="input-panel-title" style="color:var(--accent-blue)">📊 Sell Raw vs Sell Refined</div>
            <div class="comparison-row">
              <span class="comparison-label">Sell Raw Profit</span>
              <span class="comparison-value" id="refine-sell-raw">—</span>
            </div>
            <div class="comparison-row">
              <span class="comparison-label">Sell Refined Profit</span>
              <span class="comparison-value" id="refine-sell-refined">—</span>
            </div>
            <div class="comparison-row" style="border-bottom:none">
              <span class="comparison-label" style="font-weight:600; color:var(--text-primary)">Refine Benefit</span>
              <span class="comparison-value" id="refine-benefit">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initRefining() {
  let selectedRes = null;
  let selectedCity = null;

  // Resource tabs
  document.querySelectorAll('#refine-res-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#refine-res-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRes = tab.dataset.res;

      const res = RESOURCE_TYPES[selectedRes];
      document.getElementById('refine-raw-label').textContent = `${res.raw} Price (per unit)`;
      document.getElementById('refine-result-label').textContent = `${res.refined} Price (per unit)`;

      // Auto-select bonus city
      const bonusCity = res.bonusCity;
      document.querySelectorAll('#refine-city-selector .city-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.city === bonusCity);
      });
      selectedCity = bonusCity;
    });
  });

  // City selector
  document.querySelectorAll('#refine-city-selector .city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#refine-city-selector .city-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCity = btn.dataset.city;
    });
  });

  // Fetch prices
  const fetchBtn = document.getElementById('refine-fetch-prices');
  if (fetchBtn) {
    fetchBtn.addEventListener('click', async () => {
      if (!selectedRes) { showToast('Select resource type first', 'error'); return; }
      const tier = Number(document.getElementById('refine-tier').value);
      const res = RESOURCE_TYPES[selectedRes];
      const tierData = res.tiers[tier];
      if (!tierData) return;

      const ids = [tierData.raw, tierData.refined];
      if (tier > 2 && res.tiers[tier - 1]) ids.push(res.tiers[tier - 1].refined);

      fetchBtn.textContent = '⏳ Fetching...';
      const city = selectedCity || 'Caerleon';
      const prices = await fetchPrices(ids, [city]);

      for (const p of prices) {
        if (p.item_id === tierData.raw && p.sell_price_min > 0) {
          document.getElementById('refine-raw-price').value = p.sell_price_min;
        }
        if (p.item_id === tierData.refined && p.sell_price_min > 0) {
          document.getElementById('refine-result-price').value = p.sell_price_min;
        }
        if (tier > 2 && res.tiers[tier - 1] && p.item_id === res.tiers[tier - 1].refined && p.sell_price_min > 0) {
          document.getElementById('refine-prev-price').value = p.sell_price_min;
        }
      }
      fetchBtn.textContent = '⚡ Fetch Market Prices';
      showToast('Prices fetched!', 'success');
    });
  }

  // Calculate
  document.getElementById('refine-calculate')?.addEventListener('click', () => {
    const tier = Number(document.getElementById('refine-tier').value);
    const quantity = Number(document.getElementById('refine-quantity').value) || 1;
    const rawPrice = Number(document.getElementById('refine-raw-price').value) || 0;
    const prevPrice = Number(document.getElementById('refine-prev-price').value) || 0;
    const refinedPrice = Number(document.getElementById('refine-result-price').value) || 0;
    const useFocus = document.getElementById('refine-use-focus').checked;
    const isPremium = document.getElementById('refine-premium').checked;

    const isBonusCity = selectedRes && selectedCity
      ? RESOURCE_TYPES[selectedRes].bonusCity === selectedCity
      : false;

    const rrr = calcEffectiveRRR('refining', isBonusCity, useFocus, 50);
    const result = calcRefiningProfit(tier, rawPrice, prevPrice, refinedPrice, rrr, quantity, isPremium);

    if (!result) { showToast('Invalid tier', 'error'); return; }

    // Update UI
    const box = document.getElementById('refine-net-profit-box');
    const val = document.getElementById('refine-net-profit');
    val.textContent = formatSilverFull(result.netProfit, true);
    val.className = `net-profit-value ${profitClass(result.netProfit)}`;
    box.className = `net-profit-display ${profitClass(result.netProfit)}`;
    document.getElementById('refine-profit-margin').textContent = `Margin: ${result.profitMargin}% | Per unit: ${formatSilverFull(result.profitPerUnit)}`;
    document.getElementById('refine-rrr').textContent = formatPercent(rrr);
    document.getElementById('refine-saved').textContent = formatSilverFull(result.materialSaved);
    document.getElementById('refine-raw-needed').textContent = `${result.rawNeeded} units`;
    document.getElementById('refine-prev-needed').textContent = `${result.prevRefinedNeeded} units`;
    document.getElementById('refine-base-cost').textContent = formatSilverFull(result.rawCostPerUnit * quantity);
    document.getElementById('refine-eff-cost').textContent = formatSilverFull(result.effectiveCostPerUnit * quantity);
    document.getElementById('refine-total-cost').textContent = formatSilverFull(result.totalCost);
    document.getElementById('refine-gross').textContent = formatSilverFull(result.grossRevenue);
    document.getElementById('refine-taxes').textContent = `-${formatSilverFull(result.setupFee + result.salesTax)}`;
    document.getElementById('refine-net-revenue').textContent = formatSilverFull(result.netRevenue);

    // Comparison
    const sellRawEl = document.getElementById('refine-sell-raw');
    const sellRefinedEl = document.getElementById('refine-sell-refined');
    const benefitEl = document.getElementById('refine-benefit');
    sellRawEl.textContent = formatSilverFull(result.sellRawProfit);
    sellRawEl.className = `comparison-value ${profitClass(result.sellRawProfit)}`;
    sellRefinedEl.textContent = formatSilverFull(result.netProfit);
    sellRefinedEl.className = `comparison-value ${profitClass(result.netProfit)}`;
    benefitEl.textContent = formatSilverFull(result.refineBenefit, true);
    benefitEl.className = `comparison-value ${profitClass(result.refineBenefit)}`;
  });

  // Handle tier change — hide prev tier input for T2
  document.getElementById('refine-tier')?.addEventListener('change', (e) => {
    const tier = Number(e.target.value);
    document.getElementById('refine-prev-group').style.display = tier <= 2 ? 'none' : 'flex';
  });
}
