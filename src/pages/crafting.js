/**
 * AlbionCalculate — Crafting Profit Calculator
 */

import { CITIES, CITY_NAMES } from '../utils/constants.js';
import { calcEffectiveRRR, calcCraftingCost, calcMarketProfit, calcBreakEven, calcFocusEfficiency } from '../utils/calculations.js';
import { formatSilverFull, formatPercent, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices } from '../api/albionData.js';
import { getPreferences } from '../supabase.js';

export function renderCrafting() {
  const cityOptions = CITY_NAMES.map(c =>
    `<button class="city-btn" data-city="${c}">
      <span class="city-dot ${CITIES[c].dotClass}"></span>
      ${c}
    </button>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">🔨 <span class="gradient-text">Crafting Profit Calculator</span></h1>
          <p class="page-subtitle">Hitung profit crafting dengan RRR, city bonus, focus, dan pajak market.</p>
        </div>
      </div>

      <div class="calc-layout">
        <!-- Input Side -->
        <div class="calc-inputs">
          <!-- Materials -->
          <div class="input-panel">
            <div class="input-panel-title">🧱 Materials</div>
            <div id="craft-materials-list">
              <div class="form-row">
                <div class="form-group">
                  <label class="label">Material 1 (Item ID)</label>
                  <input type="text" class="input" id="craft-mat1-name" placeholder="e.g. T4_LEATHER" />
                </div>
                <div class="form-group">
                  <label class="label">Price per unit</label>
                  <input type="number" class="input input-mono" id="craft-mat1-price" placeholder="0" min="0" />
                </div>
                <div class="form-group">
                  <label class="label">Quantity</label>
                  <input type="number" class="input input-mono" id="craft-mat1-qty" placeholder="0" min="0" />
                </div>
              </div>
              <div class="form-row" style="margin-top:var(--space-sm)">
                <div class="form-group">
                  <label class="label">Material 2 (optional)</label>
                  <input type="text" class="input" id="craft-mat2-name" placeholder="e.g. T4_METALBAR" />
                </div>
                <div class="form-group">
                  <label class="label">Price per unit</label>
                  <input type="number" class="input input-mono" id="craft-mat2-price" placeholder="0" min="0" />
                </div>
                <div class="form-group">
                  <label class="label">Quantity</label>
                  <input type="number" class="input input-mono" id="craft-mat2-qty" placeholder="0" min="0" />
                </div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="craft-fetch-prices" style="margin-top:var(--space-md)">
              ⚡ Fetch Market Prices
            </button>
          </div>

          <!-- Settings -->
          <div class="input-panel">
            <div class="input-panel-title">⚙️ Settings</div>
            <div class="form-group" style="margin-bottom:var(--space-md)">
              <label class="label">Crafting City</label>
              <div class="city-selector" id="craft-city-selector">${cityOptions}</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Craft Quantity</label>
                <input type="number" class="input input-mono" id="craft-quantity" value="1" min="1" />
              </div>
              <div class="form-group">
                <label class="label">Sell Price (per unit)</label>
                <input type="number" class="input input-mono" id="craft-sell-price" placeholder="0" min="0" />
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="form-group">
                <label class="label">Station Fee (silver)</label>
                <input type="number" class="input input-mono" id="craft-station-fee" value="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Spec Level (0-100)</label>
                <input type="number" class="input input-mono" id="craft-spec-level" value="50" min="0" max="100" />
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="craft-use-focus" />
                <label class="toggle-label" for="craft-use-focus">Use Focus</label>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="craft-calculate" style="width:100%">
            🧮 Calculate Profit
          </button>
        </div>

        <!-- Results Side -->
        <div class="calc-results">
          <div class="results-panel">
            <div class="results-panel-title">💰 Results</div>

            <!-- Net Profit Display -->
            <div class="net-profit-display" id="craft-net-profit-box">
              <div class="net-profit-label">Net Profit</div>
              <div class="net-profit-value" id="craft-net-profit">—</div>
              <div class="net-profit-sub" id="craft-profit-margin"></div>
            </div>

            <!-- Result Grid -->
            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Resource Return Rate</div>
                <div class="result-value gold" id="craft-rrr">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Break Even Price</div>
                <div class="result-value" id="craft-breakeven" style="color:var(--warning-yellow)">—</div>
              </div>
            </div>

            <!-- Breakdown -->
            <div class="breakdown-list" id="craft-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Base Material Cost</span>
                <span class="breakdown-value" id="craft-base-cost">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Material Saved (RRR)</span>
                <span class="breakdown-value text-green" id="craft-saved">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Effective Cost</span>
                <span class="breakdown-value" id="craft-eff-cost">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Station Fee</span>
                <span class="breakdown-value" id="craft-station-display">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Production Cost</span>
                <span class="breakdown-value" id="craft-total-cost">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Revenue</span>
                <span class="breakdown-value" id="craft-gross">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Setup Fee (2.5%)</span>
                <span class="breakdown-value text-red" id="craft-setup-fee">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Sales Tax</span>
                <span class="breakdown-value text-red" id="craft-sales-tax">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Revenue</span>
                <span class="breakdown-value" id="craft-net-revenue">—</span>
              </div>
            </div>
          </div>

          <!-- Focus Efficiency -->
          <div class="result-card" id="craft-focus-section" style="display:none">
            <div class="result-label">⚡ Silver per Focus Point</div>
            <div class="result-value gold" id="craft-silver-per-focus">—</div>
            <div class="result-sub" id="craft-focus-detail"></div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initCrafting() {
  let selectedCity = null;

  // City selector
  document.querySelectorAll('#craft-city-selector .city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#craft-city-selector .city-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCity = btn.dataset.city;
    });
  });

  // Fetch prices button
  const fetchBtn = document.getElementById('craft-fetch-prices');
  if (fetchBtn) {
    fetchBtn.addEventListener('click', async () => {
      const mat1Id = document.getElementById('craft-mat1-name').value.trim();
      const mat2Id = document.getElementById('craft-mat2-name').value.trim();
      const itemIds = [mat1Id, mat2Id].filter(Boolean);

      if (itemIds.length === 0) {
        showToast('Enter material IDs first', 'error');
        return;
      }

      fetchBtn.textContent = '⏳ Fetching...';
      try {
        const city = selectedCity || 'Caerleon';
        const prices = await fetchPrices(itemIds, [city]);
        for (const p of prices) {
          if (p.item_id === mat1Id && p.sell_price_min > 0) {
            document.getElementById('craft-mat1-price').value = p.sell_price_min;
          }
          if (p.item_id === mat2Id && p.sell_price_min > 0) {
            document.getElementById('craft-mat2-price').value = p.sell_price_min;
          }
        }
        showToast('Prices fetched!', 'success');
      } catch (e) {
        showToast('Failed to fetch prices', 'error');
      }
      fetchBtn.textContent = '⚡ Fetch Market Prices';
    });
  }

  // Calculate
  const calcBtn = document.getElementById('craft-calculate');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const mat1Price = Number(document.getElementById('craft-mat1-price').value) || 0;
      const mat1Qty = Number(document.getElementById('craft-mat1-qty').value) || 0;
      const mat2Price = Number(document.getElementById('craft-mat2-price').value) || 0;
      const mat2Qty = Number(document.getElementById('craft-mat2-qty').value) || 0;
      const sellPrice = Number(document.getElementById('craft-sell-price').value) || 0;
      const quantity = Number(document.getElementById('craft-quantity').value) || 1;
      const stationFee = Number(document.getElementById('craft-station-fee').value) || 0;
      const specLevel = Number(document.getElementById('craft-spec-level').value) || 0;
      const useFocus = document.getElementById('craft-use-focus').checked;
      const isPremium = getPreferences().isPremium;

      // Determine city bonus
      const isBonusCity = selectedCity ? !!CITIES[selectedCity]?.craftingBonus?.length : false;

      // RRR
      const rrr = calcEffectiveRRR('crafting', isBonusCity, useFocus, specLevel);
      const rrrNoFocus = calcEffectiveRRR('crafting', isBonusCity, false, specLevel);

      // Costs
      const materials = [
        { price: mat1Price, quantity: mat1Qty },
        { price: mat2Price, quantity: mat2Qty }
      ].filter(m => m.price > 0 && m.quantity > 0);

      const cost = calcCraftingCost(materials, rrr, stationFee * quantity);

      // Profit
      const profit = calcMarketProfit(sellPrice, quantity, cost.totalCost, isPremium);

      // Break even
      const breakEven = calcBreakEven(cost.totalCost, quantity, isPremium);

      // Focus efficiency
      let silverPerFocus = 0;
      if (useFocus) {
        const costNoFocus = calcCraftingCost(materials, rrrNoFocus, stationFee * quantity);
        const profitNoFocus = calcMarketProfit(sellPrice, quantity, costNoFocus.totalCost, isPremium);
        silverPerFocus = calcFocusEfficiency(profit.netProfit, profitNoFocus.netProfit, 1000 * quantity);
      }

      // Update UI
      const netProfitBox = document.getElementById('craft-net-profit-box');
      const netProfitEl = document.getElementById('craft-net-profit');
      netProfitEl.textContent = formatSilverFull(profit.netProfit, true);
      netProfitEl.className = `net-profit-value ${profitClass(profit.netProfit)}`;
      netProfitBox.className = `net-profit-display ${profitClass(profit.netProfit)}`;

      document.getElementById('craft-profit-margin').textContent =
        `Margin: ${profit.profitMargin}% | Per unit: ${formatSilverFull(profit.profitPerUnit)}`;

      document.getElementById('craft-rrr').textContent = formatPercent(rrr);
      document.getElementById('craft-breakeven').textContent = formatSilverFull(breakEven);
      document.getElementById('craft-base-cost').textContent = formatSilverFull(cost.baseCost);
      document.getElementById('craft-saved').textContent = `-${formatSilverFull(cost.materialSaved)}`;
      document.getElementById('craft-eff-cost').textContent = formatSilverFull(cost.effectiveCost);
      document.getElementById('craft-station-display').textContent = formatSilverFull(stationFee * quantity);
      document.getElementById('craft-total-cost').textContent = formatSilverFull(cost.totalCost);
      document.getElementById('craft-gross').textContent = formatSilverFull(profit.grossRevenue);
      document.getElementById('craft-setup-fee').textContent = `-${formatSilverFull(profit.setupFee)}`;
      document.getElementById('craft-sales-tax').textContent = `-${formatSilverFull(profit.salesTax)} (${formatPercent(profit.salesTaxRate)})`;
      document.getElementById('craft-net-revenue').textContent = formatSilverFull(profit.netRevenue);

      // Focus section
      const focusSection = document.getElementById('craft-focus-section');
      if (useFocus) {
        focusSection.style.display = 'block';
        document.getElementById('craft-silver-per-focus').textContent = `${silverPerFocus} silver/focus`;
        document.getElementById('craft-focus-detail').textContent = `Extra profit from focus: ${formatSilverFull(profit.netProfit - (profit.netProfit - silverPerFocus * 1000 * quantity))}`;
      } else {
        focusSection.style.display = 'none';
      }
    });
  }
}
