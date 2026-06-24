/**
 * AlbionCalculate — Main Application Entry Point
 */

import { route, initRouter } from './router.js';
import { getPreferences, saveLocalPrefs } from './supabase.js';
import { setServer, getServer } from './api/albionData.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCrafting, initCrafting } from './pages/crafting.js';
import { renderRefining, initRefining } from './pages/refining.js';
import { renderGathering, initGathering } from './pages/gathering.js';
import { renderFlipping, initFlipping } from './pages/flipping.js';
import { renderFarming, initFarming } from './pages/farming.js';
import { renderLabourers, initLabourers } from './pages/labourers.js';
import { renderBlackmarket, initBlackmarket } from './pages/blackmarket.js';
import { renderTransmutation, initTransmutation } from './pages/transmutation.js';
import { renderComparison, initComparison } from './pages/comparison.js';
import { renderTools, initTools } from './pages/tools.js';
import { showToast } from './utils/formatters.js';

// Initialize app
function initApp() {
  // Load user preferences
  const prefs = getPreferences();
  setServer(prefs.server || 'east');

  // Server badge interaction
  const serverBadge = document.getElementById('server-badge');
  const serverLabel = serverBadge?.querySelector('.server-label');
  
  function updateServerUI() {
    if (serverLabel) {
      serverLabel.textContent = getServer().label;
    }
  }
  
  updateServerUI();

  if (serverBadge) {
    serverBadge.style.cursor = 'pointer';
    serverBadge.addEventListener('click', () => {
      const current = getServer().key;
      const nextServer = current === 'east' ? 'europe' : (current === 'europe' ? 'west' : 'east');
      
      setServer(nextServer);
      
      const updatedPrefs = { ...getPreferences(), server: nextServer };
      saveLocalPrefs(updatedPrefs);
      
      updateServerUI();
      showToast(`Server diubah ke: ${getServer().label}`);
      
      // Auto-reload the page to fetch correct server prices
      window.dispatchEvent(new Event('hashchange'));
    });
  }

  // Register routes
  route('/', async () => {
    const html = renderDashboard();
    return html;
  });

  route('/crafting', async () => {
    const html = renderCrafting();
    setTimeout(() => initCrafting(), 0);
    return html;
  });

  route('/refining', async () => {
    const html = renderRefining();
    setTimeout(() => initRefining(), 0);
    return html;
  });

  route('/gathering', async () => {
    const html = renderGathering();
    setTimeout(() => initGathering(), 0);
    return html;
  });

  route('/flipping', async () => {
    const html = renderFlipping();
    setTimeout(() => initFlipping(), 0);
    return html;
  });

  route('/farming', async () => {
    const html = renderFarming();
    setTimeout(() => initFarming(), 0);
    return html;
  });

  route('/labourers', async () => {
    const html = renderLabourers();
    setTimeout(() => initLabourers(), 0);
    return html;
  });

  route('/blackmarket', async () => {
    const html = renderBlackmarket();
    setTimeout(() => initBlackmarket(), 0);
    return html;
  });

  route('/transmutation', async () => {
    const html = renderTransmutation();
    setTimeout(() => initTransmutation(), 0);
    return html;
  });

  route('/comparison', async () => {
    const html = renderComparison();
    setTimeout(() => initComparison(), 0);
    return html;
  });

  route('/tools', async () => {
    const html = renderTools();
    setTimeout(() => initTools(), 0);
    return html;
  });

  // Sidebar toggle for mobile
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking nav item on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 480) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  // Start router
  initRouter();
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
