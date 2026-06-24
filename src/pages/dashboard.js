/**
 * AlbionCalculate — Dashboard Page
 */

export function renderDashboard() {
  return `
    <div class="calc-page">
      <!-- Hero Section -->
      <div class="dashboard-hero">
        <div class="dashboard-hero-content">
          <h1><span class="gradient-text">AlbionCalculate</span></h1>
          <p>Kalkulator ekonomi lengkap untuk Albion Online. Hitung profit crafting, refining, gathering, market flipping, dan lainnya — semua dalam satu tempat.</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="section" style="margin-bottom: var(--space-xl)">
        <div class="section-title">
          <h2 class="heading-md">📊 Quick Overview</h2>
        </div>
        <div class="dashboard-stats">
          <div class="result-card">
            <div class="result-label">Server</div>
            <div class="result-value gold">West</div>
            <div class="result-sub">Americas</div>
          </div>
          <div class="result-card">
            <div class="result-label">Market Tax</div>
            <div class="result-value" style="color: var(--text-primary)">10.5%</div>
            <div class="result-sub">2.5% setup + 8% sales</div>
          </div>
          <div class="result-card">
            <div class="result-label">Focus/Day</div>
            <div class="result-value" style="color: var(--accent-blue)">10,000</div>
            <div class="result-sub">Premium required</div>
          </div>
          <div class="result-card">
            <div class="result-label">Calculators</div>
            <div class="result-value" style="color: var(--accent-purple)">10</div>
            <div class="result-sub">All activities</div>
          </div>
        </div>
      </div>

      <!-- Calculator Cards Grid -->
      <div class="section">
        <div class="section-title">
          <h2 class="heading-md">🧮 Calculators</h2>
        </div>
        <div class="calc-cards-grid">
          <a href="#/crafting" class="calc-card-link">
            <div class="calc-card-icon">🔨</div>
            <div class="calc-card-title">Crafting Profit</div>
            <div class="calc-card-desc">Hitung profit crafting dengan resource return rate, city bonus, focus, dan pajak market.</div>
          </a>
          <a href="#/refining" class="calc-card-link">
            <div class="calc-card-icon">⚗️</div>
            <div class="calc-card-title">Refining</div>
            <div class="calc-card-desc">Kalkulator refining: ore, fiber, hide, stone, wood. Bandingkan jual raw vs refined.</div>
          </a>
          <a href="#/gathering" class="calc-card-link">
            <div class="calc-card-icon">⛏️</div>
            <div class="calc-card-title">Gathering</div>
            <div class="calc-card-desc">Profit gathering per jam, tool amortization, perbandingan tier dan zona.</div>
          </a>
          <a href="#/flipping" class="calc-card-link">
            <div class="calc-card-icon">📈</div>
            <div class="calc-card-title">Market Flipping</div>
            <div class="calc-card-desc">Hitung margin flipping, ROI, dan arbitrage antar kota.</div>
          </a>
          <a href="#/farming" class="calc-card-link">
            <div class="calc-card-icon">🌱</div>
            <div class="calc-card-title">Farming</div>
            <div class="calc-card-desc">Profit farm crops, herbs, dan animal breeding per siklus.</div>
          </a>
          <a href="#/labourers" class="calc-card-link">
            <div class="calc-card-icon">👷</div>
            <div class="calc-card-title">Labourers</div>
            <div class="calc-card-desc">Hitung profit journal labourer berdasarkan tier, happiness, dan material return.</div>
          </a>
          <a href="#/blackmarket" class="calc-card-link">
            <div class="calc-card-icon">🏴</div>
            <div class="calc-card-title">Black Market</div>
            <div class="calc-card-desc">Bandingkan profit jual di Royal Market vs setor ke Black Market.</div>
          </a>
          <a href="#/transmutation" class="calc-card-link">
            <div class="calc-card-icon">🔁</div>
            <div class="calc-card-title">Transmutation</div>
            <div class="calc-card-desc">Cek apakah transmute lebih cuan daripada jual langsung.</div>
          </a>
          <a href="#/comparison" class="calc-card-link">
            <div class="calc-card-icon">📊</div>
            <div class="calc-card-title">Activity Compare</div>
            <div class="calc-card-desc">Ranking aktivitas paling menguntungkan berdasarkan modal dan waktu.</div>
          </a>
          <a href="#/tools" class="calc-card-link">
            <div class="calc-card-icon">🗺️</div>
            <div class="calc-card-title">Tools</div>
            <div class="calc-card-desc">Crafting tree, focus cost table, price history, wishlist tracker.</div>
          </a>
        </div>
      </div>

      <!-- City Bonuses Reference -->
      <div class="section" style="margin-top: var(--space-xl)">
        <div class="section-title">
          <h2 class="heading-md">🏙️ City Refining Bonuses</h2>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>City</th>
                <th>Refining Bonus</th>
                <th>Bonus Rate</th>
                <th>Special</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="city-dot fort-sterling" style="display:inline-block;margin-right:8px"></span>Fort Sterling</td>
                <td>Ore → Metal Bar</td>
                <td style="color: var(--profit-green)">+36.7%</td>
                <td>Plate Armor, Tools</td>
              </tr>
              <tr>
                <td><span class="city-dot lymhurst" style="display:inline-block;margin-right:8px"></span>Lymhurst</td>
                <td>Fiber → Cloth</td>
                <td style="color: var(--profit-green)">+36.7%</td>
                <td>Bows, Leather Armor</td>
              </tr>
              <tr>
                <td><span class="city-dot bridgewatch" style="display:inline-block;margin-right:8px"></span>Bridgewatch</td>
                <td>Hide → Leather</td>
                <td style="color: var(--profit-green)">+36.7%</td>
                <td>Crossbows, Cloth Armor</td>
              </tr>
              <tr>
                <td><span class="city-dot martlock" style="display:inline-block;margin-right:8px"></span>Martlock</td>
                <td>Stone → Stone Block</td>
                <td style="color: var(--profit-green)">+36.7%</td>
                <td>Hammers, Heavy Armor</td>
              </tr>
              <tr>
                <td><span class="city-dot thetford" style="display:inline-block;margin-right:8px"></span>Thetford</td>
                <td>Wood → Planks</td>
                <td style="color: var(--profit-green)">+36.7%</td>
                <td>Staves, Light Armor</td>
              </tr>
              <tr>
                <td><span class="city-dot caerleon" style="display:inline-block;margin-right:8px"></span>Caerleon</td>
                <td>—</td>
                <td style="color: var(--text-tertiary)">No bonus</td>
                <td style="color: var(--accent-gold)">Black Market</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}
