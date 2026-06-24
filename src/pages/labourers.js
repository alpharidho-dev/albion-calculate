/**
 * AlbionCalculate — Labourer Journal Calculator
 */

import { LABOURER_TYPES, LABOURER_RETURNS, CITY_NAMES } from '../utils/constants.js';
import { calcLabourerProfit } from '../utils/calculations.js';
import { formatSilverFull, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices } from '../api/albionData.js';

export function renderLabourers() {
  const typeOptions = Object.entries(LABOURER_TYPES).map(([key, t]) =>
    `<option value="${key}">${t.name} (${t.resource})</option>`
  ).join('');

  const cityOptions = CITY_NAMES.map(c =>
    `<option value="${c}" ${c === 'Caerleon' ? 'selected' : ''}>${c}</option>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">👷 <span class="gradient-text">Labourer Journal Calculator</span></h1>
          <p class="page-subtitle">Hitung profit dari siklus Labourer: beli empty journal, isi (atau beli full), dan ambil resource hasil return.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Selection & Setup -->
          <div class="input-panel">
            <div class="input-panel-title">👷 Labourer Setup</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Labourer Type</label>
                <select class="select" id="labourer-type">${typeOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Journal Tier</label>
                <select class="select" id="labourer-tier">
                  <option value="2">T2 (Novice)</option>
                  <option value="3">T3 (Journeyman)</option>
                  <option value="4" selected>T4 (Adept)</option>
                  <option value="5">T5 (Expert)</option>
                  <option value="6">T6 (Master)</option>
                  <option value="7">T7 (Grandmaster)</option>
                  <option value="8">T8 (Elder)</option>
                </select>
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Market Location (Prices)</label>
                <select class="select" id="labourer-city">${cityOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Yield / Happiness Multiplier (%)</label>
                <input type="number" class="input input-mono" id="labourer-happiness" value="100" min="0" max="150" />
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="labourer-fetch-prices" style="margin-top:var(--space-md)">
              ⚡ Fetch Market Prices
            </button>
          </div>

          <!-- Price & Yield Inputs -->
          <div class="input-panel">
            <div class="input-panel-title">🪙 Prices & Yields</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Empty Journal Price</label>
                <input type="number" class="input input-mono" id="labourer-empty-price" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Full Journal Sell Price</label>
                <input type="number" class="input input-mono" id="labourer-full-price" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Material Output Price</label>
                <input type="number" class="input input-mono" id="labourer-mat-price" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Base Return Qty (auto)</label>
                <input type="number" class="input input-mono" id="labourer-mat-qty" value="22" readonly />
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="labourer-calculate" style="width:100%">
            🧮 Calculate Labourer Profit
          </button>
        </div>

        <div class="calc-results">
          <!-- Results panel -->
          <div class="results-panel">
            <div class="results-panel-title">💰 Labourer Profit Results</div>
            <div class="net-profit-display" id="labourer-profit-box">
              <div class="net-profit-label">Net Profit per Journal (Yield)</div>
              <div class="net-profit-value" id="labourer-net-profit">—</div>
              <div class="net-profit-sub" id="labourer-sub">Based on happiness multiplier</div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Adjusted Return Qty</div>
                <div class="result-value gold" id="labourer-adj-qty">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Return Value</div>
                <div class="result-value" style="color:var(--accent-blue)" id="labourer-return-val">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Empty Journal Cost</span>
                <span class="breakdown-value text-red" id="labourer-cost-display">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Return Value</span>
                <span class="breakdown-value text-green" id="labourer-gross-display">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Return Profit</span>
                <span class="breakdown-value" id="labourer-net-display">—</span>
              </div>
            </div>
          </div>

          <!-- Flip Comparison -->
          <div class="result-card">
            <div class="result-label">🔁 Journal Flip Profit (Beli Empty -> Isi -> Jual Full)</div>
            <div class="result-value gold" id="labourer-flip-profit">—</div>
            <div class="result-sub" id="labourer-recommendation">Best Option: —</div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initLabourers() {
  const typeSelect = document.getElementById('labourer-type');
  const tierSelect = document.getElementById('labourer-tier');
  const matQtyInput = document.getElementById('labourer-mat-qty');

  function updateBaseReturn() {
    const tier = Number(tierSelect.value) || 4;
    const baseReturn = LABOURER_RETURNS[tier] || 22;
    matQtyInput.value = baseReturn;
  }

  typeSelect?.addEventListener('change', updateBaseReturn);
  tierSelect?.addEventListener('change', updateBaseReturn);
  updateBaseReturn(); // Initial setup

  // Price fetching
  document.getElementById('labourer-fetch-prices')?.addEventListener('click', async () => {
    const typeKey = typeSelect.value;
    const tier = tierSelect.value;
    const city = document.getElementById('labourer-city').value;

    const typeData = LABOURER_TYPES[typeKey];
    if (!typeData) return;

    const emptyId = `T${tier}_${typeData.journalPrefix}_EMPTY`;
    const fullId = `T${tier}_${typeData.journalPrefix}_FULL`;

    // Map resource to item ID
    let matId = '';
    const resource = typeData.resource;
    if (resource === 'Metal Bar') matId = `T${tier}_METALBAR`;
    else if (resource === 'Planks') matId = `T${tier}_PLANKS`;
    else if (resource === 'Cloth') matId = `T${tier}_CLOTH`;
    else if (resource === 'Leather') matId = `T${tier}_LEATHER`;
    else if (resource === 'Stone Block') matId = `T${tier}_STONEBLOCK`;
    else if (resource === 'Ore') matId = `T${tier}_ORE`;
    else if (resource === 'Fiber') matId = `T${tier}_FIBER`;
    else if (resource === 'Wood') matId = `T${tier}_WOOD`;
    else if (resource === 'Stone') matId = `T${tier}_ROCK`;
    else if (resource === 'Hide') matId = `T${tier}_HIDE`;

    const itemsToFetch = [emptyId, fullId];
    if (matId) itemsToFetch.push(matId);

    showToast('Fetching prices from Albion Data Project...');
    try {
      const prices = await fetchPrices(itemsToFetch, [city]);
      
      const emptyPriceData = prices.find(p => p.item_id === emptyId);
      const fullPriceData = prices.find(p => p.item_id === fullId);
      const matPriceData = matId ? prices.find(p => p.item_id === matId) : null;

      if (emptyPriceData && emptyPriceData.sell_price_min > 0) {
        document.getElementById('labourer-empty-price').value = emptyPriceData.sell_price_min;
      } else {
        document.getElementById('labourer-empty-price').value = 0;
      }

      if (fullPriceData && fullPriceData.sell_price_min > 0) {
        document.getElementById('labourer-full-price').value = fullPriceData.sell_price_min;
      } else {
        document.getElementById('labourer-full-price').value = 0;
      }

      if (matPriceData && matPriceData.sell_price_min > 0) {
        document.getElementById('labourer-mat-price').value = matPriceData.sell_price_min;
      } else {
        document.getElementById('labourer-mat-price').value = 0;
      }

      showToast('Prices updated successfully!');
      document.getElementById('labourer-calculate').click();
    } catch (err) {
      showToast('Failed to fetch prices. Please enter manually.', 'error');
      console.error(err);
    }
  });

  // Calculate
  document.getElementById('labourer-calculate')?.addEventListener('click', () => {
    const emptyCost = Number(document.getElementById('labourer-empty-price').value) || 0;
    const fullSell = Number(document.getElementById('labourer-full-price').value) || 0;
    const matPrice = Number(document.getElementById('labourer-mat-price').value) || 0;
    const baseQty = Number(matQtyInput.value) || 1;
    const happiness = (Number(document.getElementById('labourer-happiness').value) || 100) / 100;

    const result = calcLabourerProfit(emptyCost, fullSell, matPrice, baseQty, happiness);

    // Render results
    const box = document.getElementById('labourer-profit-box');
    const netVal = document.getElementById('labourer-net-profit');

    netVal.textContent = formatSilverFull(result.netProfit, true);
    netVal.className = `net-profit-value ${profitClass(result.netProfit)}`;
    box.className = `net-profit-display ${profitClass(result.netProfit)}`;

    document.getElementById('labourer-adj-qty').textContent = `${result.adjustedReturn} units`;
    document.getElementById('labourer-return-val').textContent = formatSilverFull(result.returnValue);

    document.getElementById('labourer-cost-display').textContent = `-${formatSilverFull(result.emptyJournalCost)}`;
    document.getElementById('labourer-gross-display').textContent = formatSilverFull(result.returnValue);

    const netDisplay = document.getElementById('labourer-net-display');
    netDisplay.textContent = formatSilverFull(result.netProfit, true);
    netDisplay.className = `breakdown-value ${profitClass(result.netProfit)}`;

    // Flip comparison
    const flipVal = document.getElementById('labourer-flip-profit');
    flipVal.textContent = formatSilverFull(result.journalFlipProfit, true);
    flipVal.className = `result-value ${profitClass(result.journalFlipProfit)}`;

    const rec = document.getElementById('labourer-recommendation');
    if (result.netProfit <= 0 && result.journalFlipProfit <= 0) {
      rec.textContent = 'Recommendation: Menjual jurnal/material merugi. Cek harga input!';
    } else {
      const best = result.bestOption === 'use' ? 'Kirim Labourer (Ambil Material)' : 'Jual Jurnal Full di Market';
      rec.textContent = `Best Option: ${best}`;
    }
  });
}
