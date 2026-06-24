/**
 * AlbionCalculate — Gathering Profit Calculator
 */

import { ZONES, GATHERING_RATES, TIERS } from '../utils/constants.js';
import { calcGatheringProfit } from '../utils/calculations.js';
import { formatSilverFull, formatHours, profitClass, showToast } from '../utils/formatters.js';

export function renderGathering() {
  const resTypes = [
    { key: 'ore', icon: '⛏️', name: 'Ore' },
    { key: 'fiber', icon: '🧵', name: 'Fiber' },
    { key: 'hide', icon: '🐄', name: 'Hide' },
    { key: 'stone', icon: '🪨', name: 'Stone' },
    { key: 'wood', icon: '🪵', name: 'Wood' },
    { key: 'fish', icon: '🐟', name: 'Fish' },
  ];

  const resTabs = resTypes.map(r =>
    `<button class="tab" data-res="${r.key}">${r.icon} ${r.name}</button>`
  ).join('');

  const tierOpts = TIERS.filter(t => t.value >= 4).map(t =>
    `<option value="${t.value}">${t.label} — ${t.name}</option>`
  ).join('');

  const zoneBtns = Object.entries(ZONES).map(([key, z]) =>
    `<div class="zone-card zone-${key}" data-zone="${key}">
      <div class="zone-card-name">${z.name}</div>
      <div class="zone-card-risk">${z.risk}</div>
    </div>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">⛏️ <span class="gradient-text">Gathering Profit Calculator</span></h1>
          <p class="page-subtitle">Hitung profit gathering per jam, bandingkan tier dan zona, amortisasi tool.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <div class="input-panel">
            <div class="input-panel-title">🪨 Resource & Tier</div>
            <div class="tabs" id="gather-res-tabs">${resTabs}</div>
            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="form-group">
                <label class="label">Tool Tier</label>
                <select class="select" id="gather-tier">${tierOpts}</select>
              </div>
              <div class="form-group">
                <label class="label">Resource Price (per unit)</label>
                <input type="number" class="input input-mono" id="gather-res-price" placeholder="0" min="0" />
              </div>
            </div>
          </div>

          <div class="input-panel">
            <div class="input-panel-title">🗺️ Zone</div>
            <div class="zone-cards" id="gather-zone-cards">${zoneBtns}</div>
          </div>

          <div class="input-panel">
            <div class="input-panel-title">⚙️ Costs & Rates</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Gather Rate (units/hour)</label>
                <input type="number" class="input input-mono" id="gather-rate" value="600" min="0" />
                <small style="color:var(--text-tertiary);font-size:0.75rem">Community avg auto-filled</small>
              </div>
              <div class="form-group">
                <label class="label">Tool Cost (silver)</label>
                <input type="number" class="input input-mono" id="gather-tool-cost" value="0" min="0" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Tool Durability (gathers)</label>
                <input type="number" class="input input-mono" id="gather-tool-durability" value="6000" min="1" />
              </div>
              <div class="form-group">
                <label class="label">Food Cost (silver/hour)</label>
                <input type="number" class="input input-mono" id="gather-food-cost" value="2000" min="0" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Mount Cost (amortized/hour)</label>
                <input type="number" class="input input-mono" id="gather-mount-cost" value="500" min="0" />
              </div>
              <div class="toggle-wrapper" style="align-self:end;padding-bottom:8px">
                <input type="checkbox" class="toggle" id="gather-premium" checked />
                <label class="toggle-label" for="gather-premium">Premium</label>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="gather-calculate" style="width:100%">
            🧮 Calculate Profit/Hour
          </button>
        </div>

        <div class="calc-results">
          <div class="results-panel">
            <div class="results-panel-title">💰 Gathering Results</div>
            <div class="net-profit-display" id="gather-profit-box">
              <div class="net-profit-label">Net Profit / Hour</div>
              <div class="net-profit-value" id="gather-net-profit">—</div>
              <div class="net-profit-sub" id="gather-sub"></div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Gross Income/Hr</div>
                <div class="result-value gold" id="gather-gross">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Hours to Pay Off Tool</div>
                <div class="result-value" style="color:var(--accent-blue)" id="gather-payoff">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Income</span>
                <span class="breakdown-value" id="gather-gross2">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Market Taxes</span>
                <span class="breakdown-value text-red" id="gather-taxes">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Tool Cost/Hr</span>
                <span class="breakdown-value text-red" id="gather-tool-hr">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Food Cost/Hr</span>
                <span class="breakdown-value text-red" id="gather-food-hr">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Mount Cost/Hr</span>
                <span class="breakdown-value text-red" id="gather-mount-hr">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Profit/Hr</span>
                <span class="breakdown-value" id="gather-net2">—</span>
              </div>
            </div>
          </div>

          <!-- Tier Comparison -->
          <div class="input-panel">
            <div class="input-panel-title">📊 Tier Comparison (estimated)</div>
            <div class="table-wrapper">
              <table class="tier-table" id="gather-tier-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Rate/Hr</th>
                    <th>Net Profit/Hr</th>
                  </tr>
                </thead>
                <tbody id="gather-tier-tbody">
                  <tr><td colspan="3" style="text-align:center;color:var(--text-tertiary)">Click calculate to see comparison</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initGathering() {
  let selectedZone = null;

  // Resource tabs
  document.querySelectorAll('#gather-res-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#gather-res-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Zone selector
  document.querySelectorAll('#gather-zone-cards .zone-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#gather-zone-cards .zone-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedZone = card.dataset.zone;
    });
  });

  // Auto-fill gathering rate when tier changes
  document.getElementById('gather-tier')?.addEventListener('change', (e) => {
    const tier = Number(e.target.value);
    const rate = GATHERING_RATES[tier];
    if (rate) {
      const isPremium = document.getElementById('gather-premium')?.checked;
      document.getElementById('gather-rate').value = isPremium ? rate.premium : rate.base;
    }
  });

  // Calculate
  document.getElementById('gather-calculate')?.addEventListener('click', () => {
    const resPrice = Number(document.getElementById('gather-res-price').value) || 0;
    const gatherRate = Number(document.getElementById('gather-rate').value) || 0;
    const toolCost = Number(document.getElementById('gather-tool-cost').value) || 0;
    const toolDurability = Number(document.getElementById('gather-tool-durability').value) || 6000;
    const foodCost = Number(document.getElementById('gather-food-cost').value) || 0;
    const mountCost = Number(document.getElementById('gather-mount-cost').value) || 0;
    const isPremium = document.getElementById('gather-premium').checked;

    // Zone multiplier
    const zoneMultiplier = selectedZone ? ZONES[selectedZone].multiplier : 1.0;
    const adjustedRate = Math.round(gatherRate * zoneMultiplier);

    const result = calcGatheringProfit(resPrice, adjustedRate, toolCost, toolDurability, foodCost, mountCost, isPremium);

    // Update UI
    const box = document.getElementById('gather-profit-box');
    const val = document.getElementById('gather-net-profit');
    val.textContent = formatSilverFull(result.netProfitPerHour, true);
    val.className = `net-profit-value ${profitClass(result.netProfitPerHour)}`;
    box.className = `net-profit-display ${profitClass(result.netProfitPerHour)}`;
    document.getElementById('gather-sub').textContent = `${adjustedRate} units/hr | Zone: ${selectedZone ? ZONES[selectedZone].name : 'None'}`;

    document.getElementById('gather-gross').textContent = formatSilverFull(result.grossIncomePerHour);
    document.getElementById('gather-payoff').textContent = formatHours(result.hoursToPayOff);
    document.getElementById('gather-gross2').textContent = formatSilverFull(result.grossIncomePerHour);
    document.getElementById('gather-taxes').textContent = `-${formatSilverFull(result.taxes)}`;
    document.getElementById('gather-tool-hr').textContent = `-${formatSilverFull(result.toolCostPerHour)}`;
    document.getElementById('gather-food-hr').textContent = `-${formatSilverFull(foodCost)}`;
    document.getElementById('gather-mount-hr').textContent = `-${formatSilverFull(mountCost)}`;
    const netEl = document.getElementById('gather-net2');
    netEl.textContent = formatSilverFull(result.netProfitPerHour, true);
    netEl.className = `breakdown-value ${profitClass(result.netProfitPerHour)}`;

    // Tier comparison
    const tbody = document.getElementById('gather-tier-tbody');
    const selectedTier = Number(document.getElementById('gather-tier').value);
    let rows = '';
    for (let t = 4; t <= 8; t++) {
      const rate = GATHERING_RATES[t];
      if (!rate) continue;
      const tRate = Math.round((isPremium ? rate.premium : rate.base) * zoneMultiplier);
      const tResult = calcGatheringProfit(resPrice, tRate, toolCost, toolDurability, foodCost, mountCost, isPremium);
      const highlight = t === selectedTier ? ' class="tier-highlight"' : '';
      rows += `<tr${highlight}>
        <td>T${t}</td>
        <td>${tRate}/hr</td>
        <td class="${profitClass(tResult.netProfitPerHour)}">${formatSilverFull(tResult.netProfitPerHour, true)}</td>
      </tr>`;
    }
    tbody.innerHTML = rows;
  });
}
