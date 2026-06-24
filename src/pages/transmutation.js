/**
 * AlbionCalculate — Transmutation Calculator
 */

import { RESOURCE_TYPES, CITY_NAMES } from '../utils/constants.js';
import { calcTransmutationProfit } from '../utils/calculations.js';
import { formatSilverFull, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices } from '../api/albionData.js';

export function renderTransmutation() {
  const resourceOptions = Object.entries(RESOURCE_TYPES).map(([key, r]) =>
    `<option value="${key}_raw">T2-T8 Raw ${r.name.split('/')[0]}</option>
     <option value="${key}_refined">T2-T8 Refined ${r.name.split('/')[1] || r.name}</option>`
  ).join('');

  const cityOptions = CITY_NAMES.map(c =>
    `<option value="${c}" ${c === 'Caerleon' ? 'selected' : ''}>${c}</option>`
  ).join('');

  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">🔁 <span class="gradient-text">Transmutation Calculator</span></h1>
          <p class="page-subtitle">Hitung profit melakukan transmutasi tier/enchantment item di Royal City.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Resource selection -->
          <div class="input-panel">
            <div class="input-panel-title">🔁 Transmutation Configuration</div>
            <div class="form-group">
              <label class="label">Resource Type</label>
              <select class="select" id="transmute-resource-type">${resourceOptions}</select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="label">Source Tier</label>
                <select class="select" id="transmute-src-tier">
                  <option value="4">T4</option>
                  <option value="5">T5</option>
                  <option value="6">T6</option>
                  <option value="7">T7</option>
                  <option value="8">T8</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Source Enchantment</label>
                <select class="select" id="transmute-src-ench">
                  <option value="0">.0</option>
                  <option value="1">.1</option>
                  <option value="2">.2</option>
                  <option value="3">.3</option>
                </select>
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Target Tier</label>
                <select class="select" id="transmute-tgt-tier">
                  <option value="4">T4</option>
                  <option value="5">T5</option>
                  <option value="6">T6</option>
                  <option value="7">T7</option>
                  <option value="8">T8</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Target Enchantment</label>
                <select class="select" id="transmute-tgt-ench">
                  <option value="0">.0</option>
                  <option value="1" selected>.1</option>
                  <option value="2">.2</option>
                  <option value="3">.3</option>
                  <option value="4">.4</option>
                </select>
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Market Location</label>
                <select class="select" id="transmute-city">${cityOptions}</select>
              </div>
              <div class="form-group">
                <label class="label">Quantity</label>
                <input type="number" class="input input-mono" id="transmute-qty" value="1" min="1" />
              </div>
            </div>

            <div class="form-row" style="margin-top:var(--space-md)">
              <div class="toggle-wrapper">
                <input type="checkbox" class="toggle" id="transmute-premium" checked />
                <label class="toggle-label" for="transmute-premium">Premium (reduced market tax)</label>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="transmute-fetch-prices" style="margin-top:var(--space-md)">
              ⚡ Fetch Market Prices
            </button>
          </div>

          <!-- Silver Cost Inputs -->
          <div class="input-panel">
            <div class="input-panel-title">🪙 Price & Fee Inputs</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Source Cost (per unit)</label>
                <input type="number" class="input input-mono" id="transmute-src-price" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Target Price (per unit)</label>
                <input type="number" class="input input-mono" id="transmute-tgt-price" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-group" style="margin-top:var(--space-sm)">
              <label class="label">Transmutation Silver Fee (per unit)</label>
              <input type="number" class="input input-mono" id="transmute-fee" placeholder="Check in-game station" value="0" min="0" />
              <span class="input-sub">Silver fee depends on target tier & enchantment level.</span>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="transmute-calculate" style="width:100%">
            🧮 Calculate Transmutation
          </button>
        </div>

        <div class="calc-results">
          <!-- Results panel -->
          <div class="results-panel">
            <div class="results-panel-title">💰 Transmutation Results</div>
            <div class="net-profit-display" id="transmute-profit-box">
              <div class="net-profit-label">Net Profit after Taxes & Fees</div>
              <div class="net-profit-value" id="transmute-net-profit">—</div>
              <div class="net-profit-sub" id="transmute-recommendation">Recommendation: —</div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Total Transmute Cost</div>
                <div class="result-value text-red" id="transmute-total-cost-card">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">Direct Sale Profit</div>
                <div class="result-value" style="color:var(--accent-blue)" id="transmute-direct-sale">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Source Item Value</span>
                <span class="breakdown-value text-red" id="transmute-breakdown-src">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Transmute Station Fee</span>
                <span class="breakdown-value text-red" id="transmute-breakdown-fee">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Production Input Cost</span>
                <span class="breakdown-value" id="transmute-breakdown-total-cost">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Target Sales Revenue</span>
                <span class="breakdown-value" id="transmute-breakdown-gross">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Market Listing & Sales Taxes</span>
                <span class="breakdown-value text-red" id="transmute-breakdown-taxes">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Target Sales Revenue</span>
                <span class="breakdown-value" id="transmute-breakdown-net-revenue">—</span>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="result-card">
            <div class="result-label">💡 Transmutation Tips</div>
            <div class="result-sub">Transmutasi sangat berguna ketika harga material .1 / .2 / .3 melonjak tinggi di pasar lokal. Selalu bandingkan biaya beli source + biaya perak dengan harga target langsung!</div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initTransmutation() {
  function getResourceItemId(resKey, isRefined, tier, enchantment) {
    const rawSuffixes = {
      ore: 'ORE', fiber: 'FIBER', hide: 'HIDE', stone: 'ROCK', wood: 'WOOD'
    };
    const refinedSuffixes = {
      ore: 'METALBAR', fiber: 'CLOTH', hide: 'LEATHER', stone: 'STONEBLOCK', wood: 'PLANKS'
    };

    const type = isRefined ? refinedSuffixes[resKey] : rawSuffixes[resKey];
    if (!type) return '';

    if (enchantment === 0) {
      return `T${tier}_${type}`;
    } else {
      return `T${tier}_${type}_LEVEL${enchantment}@${enchantment}`;
    }
  }

  // Price Fetching
  document.getElementById('transmute-fetch-prices')?.addEventListener('click', async () => {
    const fullResKey = document.getElementById('transmute-resource-type').value;
    const [resKey, mode] = fullResKey.split('_');
    const isRefined = mode === 'refined';

    const srcTier = Number(document.getElementById('transmute-src-tier').value);
    const srcEnch = Number(document.getElementById('transmute-src-ench').value);
    const tgtTier = Number(document.getElementById('transmute-tgt-tier').value);
    const tgtEnch = Number(document.getElementById('transmute-tgt-ench').value);
    const city = document.getElementById('transmute-city').value;

    const srcId = getResourceItemId(resKey, isRefined, srcTier, srcEnch);
    const tgtId = getResourceItemId(resKey, isRefined, tgtTier, tgtEnch);

    if (!srcId || !tgtId) return;

    showToast('Fetching prices for transmutation items...');
    try {
      const prices = await fetchPrices([srcId, tgtId], [city]);
      const srcPriceData = prices.find(p => p.item_id === srcId);
      const tgtPriceData = prices.find(p => p.item_id === tgtId);

      if (srcPriceData && srcPriceData.sell_price_min > 0) {
        document.getElementById('transmute-src-price').value = srcPriceData.sell_price_min;
      } else {
        document.getElementById('transmute-src-price').value = 0;
      }

      if (tgtPriceData && tgtPriceData.sell_price_min > 0) {
        document.getElementById('transmute-tgt-price').value = tgtPriceData.sell_price_min;
      } else {
        document.getElementById('transmute-tgt-price').value = 0;
      }

      // Try estimating the fee if 0
      // In-game transmutation fees scale exponentially:
      // T4.0 -> T4.1 is cheap, T8.0 -> T8.1 is very expensive.
      // We can try to guess a default or let it be 0.
      estimateTransmuteFee();

      showToast('Prices updated successfully!');
      document.getElementById('transmute-calculate').click();
    } catch (err) {
      showToast('Failed to fetch prices. Please enter manually.', 'error');
      console.error(err);
    }
  });

  function estimateTransmuteFee() {
    const srcTier = Number(document.getElementById('transmute-src-tier').value);
    const srcEnch = Number(document.getElementById('transmute-src-ench').value);
    const tgtTier = Number(document.getElementById('transmute-tgt-tier').value);
    const tgtEnch = Number(document.getElementById('transmute-tgt-ench').value);

    let fee = 0;
    // Just a rough estimation of in-game transmutation fees
    if (srcTier === tgtTier && tgtEnch > srcEnch) {
      // Enchantment upgrade
      const tierMult = Math.pow(3, srcTier - 4); // T4=1, T5=3, T6=9, T7=27, T8=81
      const enchMult = Math.pow(4, tgtEnch - 1); // .1=1, .2=4, .3=16, .4=64
      fee = 200 * tierMult * enchMult;
    } else if (tgtTier > srcTier && srcEnch === tgtEnch) {
      // Tier upgrade
      const tierMult = Math.pow(4, srcTier - 4);
      fee = 1000 * tierMult;
    }
    
    const feeInput = document.getElementById('transmute-fee');
    if (feeInput && (feeInput.value == 0 || feeInput.value == '')) {
      feeInput.value = Math.round(fee);
    }
  }

  // Auto fee update helper on change of selectors
  document.getElementById('transmute-src-tier')?.addEventListener('change', estimateTransmuteFee);
  document.getElementById('transmute-src-ench')?.addEventListener('change', estimateTransmuteFee);
  document.getElementById('transmute-tgt-tier')?.addEventListener('change', estimateTransmuteFee);
  document.getElementById('transmute-tgt-ench')?.addEventListener('change', estimateTransmuteFee);

  // Calculate
  document.getElementById('transmute-calculate')?.addEventListener('click', () => {
    const srcPrice = Number(document.getElementById('transmute-src-price').value) || 0;
    const tgtPrice = Number(document.getElementById('transmute-tgt-price').value) || 0;
    const fee = Number(document.getElementById('transmute-fee').value) || 0;
    const qty = Number(document.getElementById('transmute-qty').value) || 1;
    const isPremium = document.getElementById('transmute-premium').checked;

    const result = calcTransmutationProfit(srcPrice, fee, tgtPrice, qty, isPremium);

    const box = document.getElementById('transmute-profit-box');
    const netVal = document.getElementById('transmute-net-profit');

    netVal.textContent = formatSilverFull(result.netProfit, true);
    netVal.className = `net-profit-value ${profitClass(result.netProfit)}`;
    box.className = `net-profit-display ${profitClass(result.netProfit)}`;

    document.getElementById('transmute-total-cost-card').textContent = formatSilverFull(result.totalInputCost);
    document.getElementById('transmute-direct-sale').textContent = formatSilverFull(result.sellDirectProfit);

    document.getElementById('transmute-breakdown-src').textContent = formatSilverFull(result.sourceCostTotal);
    document.getElementById('transmute-breakdown-fee').textContent = formatSilverFull(result.transmuteFeeTotal);
    document.getElementById('transmute-breakdown-total-cost').textContent = formatSilverFull(result.totalInputCost);
    document.getElementById('transmute-breakdown-gross').textContent = formatSilverFull(result.grossRevenue);
    document.getElementById('transmute-breakdown-taxes').textContent = `-${formatSilverFull(result.taxes)}`;
    document.getElementById('transmute-breakdown-net-revenue').textContent = formatSilverFull(result.netRevenue);

    const rec = document.getElementById('transmute-recommendation');
    if (result.netProfit <= 0) {
      rec.textContent = 'Recommendation: JANGAN TRANSMUTASI (Rugi)';
      rec.style.color = 'var(--loss-red)';
    } else {
      if (result.recommendation === 'transmute') {
        rec.textContent = 'Recommendation: TRANSMUTE & SELL (Lebih untung daripada jual langsung)';
        rec.style.color = 'var(--profit-green)';
      } else {
        rec.textContent = 'Recommendation: JUAL LANGSUNG (Transmutasi profit, tapi jual langsung tanpa transmutasi lebih untung)';
        rec.style.color = 'var(--warning-yellow)';
      }
    }
  });
}
