/**
 * AlbionCalculate — Activity Profit Comparison Board
 */

import { formatSilverFull, profitClass } from '../utils/formatters.js';
import { Chart } from 'chart.js/auto';

export function renderComparison() {
  return `
    <div class="calc-page">
      <div class="page-header">
        <div>
          <h1 class="heading-xl">📊 <span class="gradient-text">Activity Comparison Board</span></h1>
          <p class="page-subtitle">Bandingkan perkiraan profit per jam dan ROI dari berbagai aktivitas ekonomi di Albion Online.</p>
        </div>
      </div>

      <div class="calc-layout" style="grid-template-columns: 1fr;">
        <!-- Inputs & Summary Row -->
        <div class="grid-2col" style="gap:var(--space-md); margin-bottom:var(--space-md);">
          <div class="input-panel">
            <div class="input-panel-title">⚙️ Comparison Settings</div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Available Capital (Silver)</label>
                <input type="number" class="input input-mono" id="comp-capital" value="1000000" min="10000" step="10000" />
              </div>
              <div class="form-group">
                <label class="label">Duration / Active Time (Hours)</label>
                <input type="number" class="input input-mono" id="comp-duration" value="1" min="0.5" max="24" step="0.5" />
              </div>
            </div>
            <div class="form-row" style="margin-top:var(--space-sm)">
              <div class="form-group">
                <label class="label">Premium Active</label>
                <select class="select" id="comp-premium">
                  <option value="yes" selected>Yes (Premium)</option>
                  <option value="no">No (Non-Premium)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Daily Focus Points available</label>
                <input type="number" class="input input-mono" id="comp-focus" value="10000" min="0" max="30000" step="1000" />
              </div>
            </div>
            <button class="btn btn-primary" id="comp-refresh" style="width:100%; margin-top:var(--space-md)">
              🔄 Recalculate & Compare
            </button>
          </div>

          <div class="input-panel" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <div class="input-panel-title" style="align-self:flex-start">📈 Best Performance</div>
            <div class="net-profit-display profit" id="comp-best-box" style="width:100%; padding:var(--space-md);">
              <div class="net-profit-label">Recommended Activity</div>
              <div class="net-profit-value" id="comp-best-activity" style="font-size: 1.8rem; margin: var(--space-xs) 0;">Market Flipping</div>
              <div class="net-profit-sub" id="comp-best-rate">~ 450,000 Silver / jam</div>
            </div>
          </div>
        </div>

        <!-- Chart Row -->
        <div class="input-panel" style="margin-bottom:var(--space-md);">
          <div class="input-panel-title">📊 Silver per Hour Comparison</div>
          <div style="position: relative; height:300px; width:100%;">
            <canvas id="comp-chart"></canvas>
          </div>
        </div>

        <!-- Details Table -->
        <div class="input-panel">
          <div class="input-panel-title">📋 Comparison Details</div>
          <div class="table-container" style="overflow-x:auto;">
            <table class="table" style="width:100%; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,215,0,0.15); color:var(--text-secondary);">
                  <th style="padding:var(--space-sm)">Activity</th>
                  <th style="padding:var(--space-sm)">Risk Level</th>
                  <th style="padding:var(--space-sm)">Capital Req</th>
                  <th style="padding:var(--space-sm)">Silver / Hour</th>
                  <th style="padding:var(--space-sm)">Net Profit</th>
                  <th style="padding:var(--space-sm)">Est. ROI</th>
                  <th style="padding:var(--space-sm)">Focus Needed</th>
                </tr>
              </thead>
              <tbody id="comp-table-body">
                <!-- Rows will be injected here -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

let compChart = null;

export function initComparison() {
  const getRowsData = (capital, duration, hasPremium, focusAvailable) => {
    // We estimate standard activities scaled by user capital and focus.
    const isPremium = hasPremium === 'yes';

    // 1. Crafting
    // Scaled by capital, standard T6 craft with focus:
    const craftFocusCost = 250;
    const craftMaxQty = Math.min(Math.floor(capital / 45000), Math.floor(focusAvailable / craftFocusCost));
    const craftCost = craftMaxQty * 45000;
    const craftNetProfit = craftMaxQty * 16000;
    const craftRoi = craftCost > 0 ? (craftNetProfit / craftCost) * 100 : 0;
    const craftHourly = duration > 0 ? Math.round(craftNetProfit / duration) : 0;

    // 2. Refining
    // T6 material refining in correct city:
    const refineFocusCost = 120;
    const refineMaxQty = Math.min(Math.floor(capital / 18000), Math.floor(focusAvailable / refineFocusCost));
    const refineCost = refineMaxQty * 18000;
    const refineNetProfit = refineMaxQty * 6500;
    const refineRoi = refineCost > 0 ? (refineNetProfit / refineCost) * 100 : 0;
    const refineHourly = duration > 0 ? Math.round(refineNetProfit / duration) : 0;

    // 3. Gathering
    // T6 gathering doesn't require high capital, but tool costs. Hourly income is active.
    const gatherCapital = 150000; // T6 tool + gear + mount
    const gatherRate = isPremium ? 450 : 350;
    const gatherPrice = 750; // Average T6 raw resource price
    const gatherNetHourly = gatherRate * gatherPrice; // gross/hour
    const gatherNetProfit = Math.round(gatherNetHourly * duration);
    const gatherRoi = (gatherNetProfit / gatherCapital) * 100;

    // 4. Market Flipping
    // Scaled by capital, active flipping of items with ~8% profit margin:
    const flipCost = capital;
    const flipNetProfit = Math.round(flipCost * (isPremium ? 0.08 : 0.04));
    const flipHourly = duration > 0 ? Math.round(flipNetProfit / duration) : 0;
    const flipRoi = isPremium ? 8.0 : 4.0;

    // 5. Farming
    // 9 patches plot Panen Wortel/Cabbage (Passive)
    const farmCost = Math.min(capital, 150000);
    const farmNetProfit = Math.round(farmCost * (isPremium ? 0.22 : 0.12));
    const farmHourly = duration > 0 ? Math.round(farmNetProfit / duration) : 0;
    const farmRoi = isPremium ? 22.0 : 12.0;

    // 6. Labourers
    // T5 Labourer Journals run
    const labCost = Math.min(capital, 500000);
    const labNetProfit = Math.round(labCost * 0.15);
    const labHourly = duration > 0 ? Math.round(labNetProfit / duration) : 0;
    const labRoi = 15.0;

    // 7. Black Market Arbitrage
    // High risk, transport to Caerleon, high reward (18% ROI average)
    const bmCost = capital;
    const bmDeathChance = 0.05; // 5% chance of dying
    const bmGrossRevenue = bmCost * 1.25; // 25% price difference
    const bmNetProfit = Math.round((bmGrossRevenue * (1 - bmDeathChance)) - bmCost);
    const bmHourly = duration > 0 ? Math.round(bmNetProfit / duration) : 0;
    const bmRoi = bmCost > 0 ? (bmNetProfit / bmCost) * 100 : 0;

    // 8. Transmutation
    // Low risk, low/med margin, capital scaled
    const transCost = capital;
    const transNetProfit = Math.round(transCost * 0.06);
    const transHourly = duration > 0 ? Math.round(transNetProfit / duration) : 0;
    const transRoi = 6.0;

    return [
      {
        name: '🔨 Crafting with Focus',
        risk: 'Safe (In Town)',
        riskClass: 'text-green',
        capital: craftCost,
        hourly: craftHourly,
        profit: craftNetProfit,
        roi: craftRoi,
        focus: craftMaxQty * craftFocusCost
      },
      {
        name: '⚗️ Refining with Focus',
        risk: 'Safe (In Town)',
        riskClass: 'text-green',
        capital: refineCost,
        hourly: refineHourly,
        profit: refineNetProfit,
        roi: refineRoi,
        focus: refineMaxQty * refineFocusCost
      },
      {
        name: '⛏️ Active Gathering (T6)',
        risk: 'PvP (Red/Black Zone)',
        riskClass: 'text-red',
        capital: gatherCapital,
        hourly: Math.round(gatherNetHourly),
        profit: gatherNetProfit,
        roi: gatherRoi,
        focus: 0
      },
      {
        name: '📈 Market Flipping (Arbitrage)',
        risk: 'Low Risk',
        riskClass: 'text-green',
        capital: flipCost,
        hourly: flipHourly,
        profit: flipNetProfit,
        roi: flipRoi,
        focus: 0
      },
      {
        name: '🌱 Farming (Crops/Animals)',
        risk: 'Safe (Island)',
        riskClass: 'text-green',
        capital: farmCost,
        hourly: farmHourly,
        profit: farmNetProfit,
        roi: farmRoi,
        focus: 0
      },
      {
        name: '👷 Labourer Journals',
        risk: 'Safe (Island)',
        riskClass: 'text-green',
        capital: labCost,
        hourly: labHourly,
        profit: labNetProfit,
        roi: labRoi,
        focus: 0
      },
      {
        name: '🏴 Black Market Transport',
        risk: 'High (Loot PvP)',
        riskClass: 'text-red',
        capital: bmCost,
        hourly: bmHourly,
        profit: bmNetProfit,
        roi: bmRoi,
        focus: 0
      },
      {
        name: '🔁 Transmutation',
        risk: 'Safe (In Town)',
        riskClass: 'text-green',
        capital: transCost,
        hourly: transHourly,
        profit: transNetProfit,
        roi: transRoi,
        focus: 0
      }
    ];
  };

  const updateComparison = () => {
    const capital = Number(document.getElementById('comp-capital').value) || 100000;
    const duration = Number(document.getElementById('comp-duration').value) || 1;
    const premium = document.getElementById('comp-premium').value;
    const focus = Number(document.getElementById('comp-focus').value) || 0;

    const data = getRowsData(capital, duration, premium, focus);

    // Sort by profit hourly descending
    data.sort((a, b) => b.hourly - a.hourly);

    // Render table
    const tableBody = document.getElementById('comp-table-body');
    if (tableBody) {
      tableBody.innerHTML = data.map(row => `
        <tr style="border-bottom: 1px solid rgba(255,215,0,0.05); hover:background:rgba(255,255,255,0.02)">
          <td style="padding:var(--space-sm); font-weight:600; color:var(--text-primary);">${row.name}</td>
          <td style="padding:var(--space-sm);" class="${row.riskClass}">${row.risk}</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono);">${formatSilverFull(row.capital)}</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono); font-weight:bold;" class="${profitClass(row.hourly)}">${formatSilverFull(row.hourly)}</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono);" class="${profitClass(row.profit)}">${formatSilverFull(row.profit)}</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono); color:var(--accent-blue)">${row.roi.toFixed(1)}%</td>
          <td style="padding:var(--space-sm); font-family:var(--font-mono); color:var(--text-secondary)">${row.focus > 0 ? row.focus : '—'}</td>
        </tr>
      `).join('');
    }

    // Best recommendation display
    const best = data[0];
    if (best) {
      document.getElementById('comp-best-activity').textContent = best.name.substring(2);
      document.getElementById('comp-best-rate').textContent = `~ ${formatSilverFull(best.hourly)} Silver / jam (ROI: ${best.roi.toFixed(1)}%)`;
    }

    // Render / update chart
    renderChart(data);
  };

  const renderChart = (data) => {
    const ctx = document.getElementById('comp-chart');
    if (!ctx) return;

    if (compChart) {
      compChart.destroy();
    }

    const labels = data.map(d => d.name.substring(2));
    const values = data.map(d => d.hourly);
    
    // Color bars based on profit values (green for positive, red if negative)
    const barColors = data.map(d => d.hourly > 0 ? '#10B981' : '#EF4444');

    compChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Silver / Jam',
          data: values,
          backgroundColor: barColors,
          borderColor: '#FFD700',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${formatSilverFull(context.raw)} Silver / Jam`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { display: false }
          },
          y: {
            ticks: { 
              color: '#9CA3AF',
              callback: function(value) {
                if (value >= 1000000) return (value / 1000000) + 'M';
                if (value >= 1000) return (value / 1000) + 'k';
                return value;
              }
            },
            grid: { color: 'rgba(255, 215, 0, 0.05)' }
          }
        }
      }
    });
  };

  // Bind events
  document.getElementById('comp-refresh')?.addEventListener('click', updateComparison);
  updateComparison(); // Initial render
}
