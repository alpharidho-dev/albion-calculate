/**
 * AlbionCalculate — Market Flipping Calculator
 */

import { CITY_NAMES, CITIES } from '../utils/constants.js';
import { calcFlippingProfit } from '../utils/calculations.js';
import { formatSilverFull, formatPercent, profitClass, showToast } from '../utils/formatters.js';
import { fetchPrices, getBestPrices } from '../api/albionData.js';
import { searchItems } from '../api/items.js';

export function renderFlipping() {
  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">📈 <span class="gradient-text">Market Flipping Calculator</span></h1>
          <p class="page-subtitle">Hitung margin flipping, ROI, dan temukan arbitrage antar kota.</p>
        </div>
      </div>

      <div class="calc-layout">
        <div class="calc-inputs">
          <!-- Item Search -->
          <div class="input-panel">
            <div class="input-panel-title">📦 Item</div>
            <div class="form-group">
              <div class="item-search-wrapper">
                <span class="item-search-icon">🔍</span>
                <input type="text" id="flip-item-search" class="item-search-input" placeholder="Search item to flip..." />
                <div id="flip-search-results" class="item-search-results"></div>
              </div>
            </div>
            <div id="flip-selected" style="margin-top:var(--space-sm);display:none">
              <span class="badge badge-gold" id="flip-selected-name"></span>
              <button class="btn btn-secondary btn-sm" id="flip-fetch-all" style="margin-left:var(--space-sm)">⚡ Fetch All City Prices</button>
            </div>
          </div>

          <!-- Manual Input -->
          <div class="input-panel">
            <div class="input-panel-title">💲 Flip Calculation</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Buy Price (buy order)</label>
                <input type="number" class="input input-mono" id="flip-buy-price" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label class="label">Sell Price (sell order)</label>
                <input type="number" class="input input-mono" id="flip-sell-price" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Quantity</label>
                <input type="number" class="input input-mono" id="flip-quantity" value="10" min="1" />
              </div>
              <div class="toggle-wrapper" style="align-self:end;padding-bottom:8px">
                <input type="checkbox" class="toggle" id="flip-premium" checked />
                <label class="toggle-label" for="flip-premium">Premium</label>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="flip-calculate" style="width:100%">
            🧮 Calculate Flip
          </button>
        </div>

        <div class="calc-results">
          <div class="results-panel">
            <div class="results-panel-title">💰 Flipping Results</div>
            <div class="net-profit-display" id="flip-profit-box">
              <div class="net-profit-label">Net Profit</div>
              <div class="net-profit-value" id="flip-net-profit">—</div>
              <div class="net-profit-sub" id="flip-roi-display"></div>
            </div>

            <div class="result-grid" style="margin-bottom:var(--space-md)">
              <div class="result-card">
                <div class="result-label">Margin per Unit</div>
                <div class="result-value gold" id="flip-margin-unit">—</div>
              </div>
              <div class="result-card">
                <div class="result-label">ROI</div>
                <div class="result-value" style="color:var(--accent-blue)" id="flip-roi">—</div>
              </div>
            </div>

            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Total Buy Cost</span>
                <span class="breakdown-value" id="flip-total-buy">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Buy Setup Fee (2.5%)</span>
                <span class="breakdown-value text-red" id="flip-buy-fee">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Total Investment</span>
                <span class="breakdown-value" id="flip-invest">—</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-item">
                <span class="breakdown-label">Gross Sell Revenue</span>
                <span class="breakdown-value" id="flip-gross-sell">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Sell Setup Fee (2.5%)</span>
                <span class="breakdown-value text-red" id="flip-sell-fee">—</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Sales Tax</span>
                <span class="breakdown-value text-red" id="flip-sales-tax">—</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Net Sell Revenue</span>
                <span class="breakdown-value" id="flip-net-sell">—</span>
              </div>
            </div>
          </div>

          <!-- Arbitrage Section -->
          <div class="input-panel">
            <div class="input-panel-title" style="color:var(--accent-purple)">🌐 City Arbitrage</div>
            <p style="font-size:0.8125rem;color:var(--text-tertiary);margin-bottom:var(--space-md)">
              Fetch prices to find the best buy/sell cities for maximum arbitrage profit.
            </p>
            <div id="flip-arbitrage-results">
              <div class="empty-state" style="padding:var(--space-lg)">
                <div class="empty-state-icon" style="font-size:1.5rem">🌐</div>
                <div class="empty-state-text">Select an item and fetch prices to see arbitrage opportunities</div>
              </div>
            </div>
          <!-- Help / Info section -->
          <div class="result-card" style="margin-top:var(--space-md)">
            <div class="result-label">💡 Info Pajak & Biaya Market (Market Tax Rules)</div>
            <div class="breakdown-list" style="margin-top:var(--space-sm); font-size:0.85rem; line-height:1.4">
              <div style="margin-bottom:var(--space-xs)">
                🟢 <strong>Buy Order (Pesan Beli)</strong>: Dikenakan <strong>Setup Fee 2.5%</strong> di muka saat memasang order. Biaya ini tidak kembali meskipun order dibatalkan (cancel).
              </div>
              <div style="margin-bottom:var(--space-xs)">
                🟡 <strong>Sell Order (Pesan Jual)</strong>: Dikenakan <strong>Setup Fee 2.5%</strong> saat memasang order + <strong>Sales Tax (4% Premium / 8% Normal)</strong> setelah barang laku terjual.
              </div>
              <div style="margin-bottom:var(--space-xs)">
                🔵 <strong>Instant Sell (Jual Instan)</strong>: Hanya dikenakan <strong>Sales Tax (4% Premium / 8% Normal)</strong> langsung. Bebas dari Setup Fee 2.5%.
              </div>
              <div>
                ⚪ <strong>Instant Buy (Beli Instan)</strong>: Tidak ada biaya tambahan bagi pembeli (harga tertera adalah harga bersih).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export function initFlipping() {
  let selectedItem = null;

  // Item search
  const searchInput = document.getElementById('flip-item-search');
  const resultsDiv = document.getElementById('flip-search-results');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const results = searchItems(e.target.value, 8);
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
            document.getElementById('flip-selected-name').textContent = selectedItem.name;
            document.getElementById('flip-selected').style.display = 'flex';
          });
        });
      } else {
        resultsDiv.classList.remove('open');
      }
    });
    searchInput.addEventListener('blur', () => setTimeout(() => resultsDiv.classList.remove('open'), 200));
  }

  // Fetch all city prices
  document.getElementById('flip-fetch-all')?.addEventListener('click', async () => {
    if (!selectedItem) return;
    showToast('Fetching prices...', 'info');
    const bestPrices = await getBestPrices(selectedItem.id);
    if (!bestPrices) { showToast('No prices found', 'error'); return; }

    // Auto-fill
    if (bestPrices.bestBuy.price < Infinity) {
      document.getElementById('flip-buy-price').value = bestPrices.bestBuy.price;
    }
    if (bestPrices.bestSell.price > 0) {
      document.getElementById('flip-sell-price').value = bestPrices.bestSell.price;
    }

    // Show arbitrage
    const arbDiv = document.getElementById('flip-arbitrage-results');
    const pricesWithData = bestPrices.allPrices.filter(p => p.sellMin > 0 || p.buyMax > 0);

    if (pricesWithData.length < 2) {
      arbDiv.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.875rem">Not enough city data for arbitrage analysis.</p>`;
      return;
    }

    // Find best arbitrage route
    let bestArb = { profit: -Infinity, buyCity: '', sellCity: '' };
    const isPremium = document.getElementById('flip-premium').checked;
    const routes = [];

    for (const buyCity of pricesWithData) {
      if (buyCity.sellMin <= 0) continue;
      for (const sellCity of pricesWithData) {
        if (sellCity.buyMax <= 0 || sellCity.city === buyCity.city) continue;
        const result = calcFlippingProfit(buyCity.sellMin, sellCity.buyMax, 1, isPremium);
        routes.push({ from: buyCity.city, to: sellCity.city, buyPrice: buyCity.sellMin, sellPrice: sellCity.buyMax, ...result });
        if (result.netProfit > bestArb.profit) {
          bestArb = { profit: result.netProfit, buyCity: buyCity.city, sellCity: sellCity.city };
        }
      }
    }

    routes.sort((a, b) => b.netProfit - a.netProfit);
    const topRoutes = routes.slice(0, 4);

    arbDiv.innerHTML = `
      <div class="arbitrage-grid">
        ${topRoutes.map((r, i) => `
          <div class="arbitrage-card ${i === 0 && r.netProfit > 0 ? 'best' : ''}">
            <div class="arbitrage-route">
              <span>${r.from}</span>
              <span class="arbitrage-arrow">→</span>
              <span>${r.to}</span>
            </div>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Buy</span>
                <span class="breakdown-value">${formatSilverFull(r.buyPrice)}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Sell</span>
                <span class="breakdown-value">${formatSilverFull(r.sellPrice)}</span>
              </div>
              <div class="breakdown-item total">
                <span class="breakdown-label">Profit/unit</span>
                <span class="breakdown-value ${profitClass(r.netProfit)}">${formatSilverFull(r.netProfit, true)}</span>
              </div>
            </div>
            ${i === 0 && r.netProfit > 0 ? '<span class="badge badge-green" style="margin-top:var(--space-sm)">Best Route</span>' : ''}
          </div>
        `).join('')}
      </div>`;

    showToast('Prices & arbitrage loaded!', 'success');
  });

  // Calculate
  document.getElementById('flip-calculate')?.addEventListener('click', () => {
    const buyPrice = Number(document.getElementById('flip-buy-price').value) || 0;
    const sellPrice = Number(document.getElementById('flip-sell-price').value) || 0;
    const quantity = Number(document.getElementById('flip-quantity').value) || 1;
    const isPremium = document.getElementById('flip-premium').checked;

    if (buyPrice <= 0 || sellPrice <= 0) { showToast('Enter buy and sell prices', 'error'); return; }

    const result = calcFlippingProfit(buyPrice, sellPrice, quantity, isPremium);

    const box = document.getElementById('flip-profit-box');
    const val = document.getElementById('flip-net-profit');
    val.textContent = formatSilverFull(result.netProfit, true);
    val.className = `net-profit-value ${profitClass(result.netProfit)}`;
    box.className = `net-profit-display ${profitClass(result.netProfit)}`;
    document.getElementById('flip-roi-display').textContent = `ROI: ${result.roi}% | Per unit: ${formatSilverFull(result.marginPerUnit, true)}`;
    document.getElementById('flip-margin-unit').textContent = formatSilverFull(result.marginPerUnit, true);
    document.getElementById('flip-roi').textContent = `${result.roi}%`;
    document.getElementById('flip-total-buy').textContent = formatSilverFull(result.totalBuyCost);
    document.getElementById('flip-buy-fee').textContent = `-${formatSilverFull(result.buySetupFee)}`;
    document.getElementById('flip-invest').textContent = formatSilverFull(result.totalInvestment);
    document.getElementById('flip-gross-sell').textContent = formatSilverFull(result.grossSellRevenue);
    document.getElementById('flip-sell-fee').textContent = `-${formatSilverFull(result.sellSetupFee)}`;
    document.getElementById('flip-sales-tax').textContent = `-${formatSilverFull(result.salesTax)}`;
    document.getElementById('flip-net-sell').textContent = formatSilverFull(result.netSellRevenue);
  });
}
