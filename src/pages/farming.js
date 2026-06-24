/**
 * AlbionCalculate — Farming Calculator
 */

import { CROPS, HERBS } from '../utils/constants.js';
import { calcFarmingProfit } from '../utils/calculations.js';
import { formatSilverFull, profitClass, showToast } from '../utils/formatters.js';

export function renderFarming() {
  const cropOptions = Object.entries(CROPS).map(([key, c]) =>
    `<option value="${key}">T${c.tier} ${c.name}</option>`
  ).join('');

  const herbOptions = Object.entries(HERBS).map(([key, h]) =>
    `<option value="${key}">T${h.tier} ${h.name}</option>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">🌱 <span class="gradient-text">Farming Calculator</span></h1>
          <p class="page-subtitle">Hitung profit farming crops, herbs, dan animal breeding per siklus panen.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Type Selection -->
          <div class="input-panel">
            <div class="input-panel-title">🌾 Farm Type</div>
            <div class="tabs" id="farm-type-tabs">
              <button class="tab active" data-type="crop">🌾 Crops</button>
              <button class="tab" data-type="herb">🌿 Herbs</button>
              <button class="tab" data-type="animal">🐄 Animals</button>
            </div>
            <div class="form-group" style="margin-top:var(--space-md)">
              <label class="label">Select Item</label>
              <select class="select" id="farm-item">
                <optgroup label="Crops">${cropOptions}</optgroup>
                <optgroup label="Herbs">${herbOptions}</optgroup>
              </select>
            </div>
          </div>

          <!-- Costs -->
          <div class="input-panel">
            <div class="input-panel-title">💲 Costs & Settings</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Seed/Baby Cost (each)</label>
                <input type="number" class="input input-mono" id="farm-seed-cost" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Seed Quantity</label>
                <input type="number" class="input input-mono" id="farm-seed-qty" value="9" min="1" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Feed/Water Cost (per seed)</label>
                <input type="number" class="input input-mono" id="farm-feed-cost" value="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Harvest Price (per unit)</label>
                <input type="number" class="input input-mono" id="farm-harvest-price" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Base Yield (per seed)</label>
                <input type="number" class="input input-mono" id="farm-base-yield" value="9" min="1" />
              </div>
              <div class="form-group">
                <label class="label">Bonus Yield Chance (%)</label>
                <input type="number" class="input input-mono" id="farm-bonus-chance" value="0" min="0" max="100" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="farm-use-focus" />
                <label class="toggle-label" for="farm-use-focus">Use Focus</label>
              </div>
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="farm-premium" checked />
                <label class="toggle-label" for="farm-premium">Premium</label>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="farm-calculate" style="width:100%">
            🧮 Calculate Farm Profit
          </button>
        </div>

        <div class="calc-results">
          <div class="results-panel">
            <div class="results-panel-title">💰 Farm Results (per cycle)</div>
            <div class="net-profit-display" id="farm-profit-box">
              <div class="net-profit-label">Net Profit per Cycle</div>
              <div class="net-profit-value" id="farm-net-profit">—</div>
              <div class="net-profit-sub" id="farm-sub">~22h growth cycle</div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Expected Yield</div>
                <div class="result-value gold" id="farm-yield">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Seed Returns</div>
                <div class="result-value" style="color:var(--accent-blue)" id="farm-seed-return">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Seed Cost</span>
                <span class="breakdown-value text-red" id="farm-seed-total">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Feed/Water Cost</span>
                <span class="breakdown-value text-red" id="farm-feed-total">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Investment</span>
                <span class="breakdown-value" id="farm-investment">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Revenue</span>
                <span class="breakdown-value" id="farm-gross">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Market Taxes</span>
                <span class="breakdown-value text-red" id="farm-taxes">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Profit</span>
                <span class="breakdown-value" id="farm-net2">—</span>
              </div>
            </div>
          </div>

          <!-- Daily Profit Estimate -->
          <div class="result-card">
            <div class="result-label">📅 Estimated Daily Profit</div>
            <div class="result-value gold" id="farm-daily">—</div>
            <div class="result-sub">Based on 1 cycle per day (22h growth)</div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initFarming() {
  // Type tabs
  document.querySelectorAll('#farm-type-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#farm-type-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Calculate
  document.getElementById('farm-calculate')?.addEventListener('click', () => {
    const seedCost = Number(document.getElementById('farm-seed-cost').value) || 0;
    const seedQty = Number(document.getElementById('farm-seed-qty').value) || 1;
    const feedCost = Number(document.getElementById('farm-feed-cost').value) || 0;
    const harvestPrice = Number(document.getElementById('farm-harvest-price').value) || 0;
    const baseYield = Number(document.getElementById('farm-base-yield').value) || 1;
    const bonusChance = (Number(document.getElementById('farm-bonus-chance').value) || 0) / 100;
    const useFocus = document.getElementById('farm-use-focus').checked;
    const isPremium = document.getElementById('farm-premium').checked;

    const result = calcFarmingProfit(seedCost, seedQty, feedCost, harvestPrice, baseYield, bonusChance, useFocus, isPremium);

    const box = document.getElementById('farm-profit-box');
    const val = document.getElementById('farm-net-profit');
    val.textContent = formatSilverFull(result.netProfit, true);
    val.className = `net-profit-value ${profitClass(result.netProfit)}`;
    box.className = `net-profit-display ${profitClass(result.netProfit)}`;

    document.getElementById('farm-yield').textContent = `${result.expectedYield} units`;
    document.getElementById('farm-seed-return').textContent = `${result.expectedSeedReturn} seeds`;
    document.getElementById('farm-seed-total').textContent = `-${formatSilverFull(result.totalSeedCost)}`;
    document.getElementById('farm-feed-total').textContent = `-${formatSilverFull(result.totalFeedCost)}`;
    document.getElementById('farm-investment').textContent = formatSilverFull(result.totalInvestment);
    document.getElementById('farm-gross').textContent = formatSilverFull(result.grossRevenue);
    document.getElementById('farm-taxes').textContent = `-${formatSilverFull(result.taxes)}`;

    const net2 = document.getElementById('farm-net2');
    net2.textContent = formatSilverFull(result.netProfit, true);
    net2.className = `breakdown-value ${profitClass(result.netProfit)}`;

    document.getElementById('farm-daily').textContent = formatSilverFull(result.netProfit);
  });
}
