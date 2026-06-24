/**
 * AlbionCalculate — Hash-based SPA Router
 */

const routes = {};
let currentPage = null;

/**
 * Register a route
 * @param {string} path - Route path (e.g., '/', '/crafting')
 * @param {Function} handler - Async function that returns page HTML and sets up events
 */
export function route(path, handler) {
  routes[path] = handler;
}

/**
 * Navigate to a route
 * @param {string} path
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Get current route path
 */
export function getCurrentRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

/**
 * Initialize the router
 */
export function initRouter() {
  async function handleRoute() {
    const path = getCurrentRoute();
    const container = document.getElementById('page-container');
    if (!container) return;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemPath = item.getAttribute('href')?.replace('#', '') || '/';
      item.classList.toggle('active', itemPath === path);
    });

    const handler = routes[path] || routes['/'];
    if (!handler) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Page not found</div>
        </div>`;
      return;
    }

    // Page transition
    container.classList.remove('page-enter');
    container.style.opacity = '0';

    try {
      const pageContent = await handler();
      container.innerHTML = pageContent;
      currentPage = path;

      // Trigger enter animation
      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.classList.add('page-enter');
      });
    } catch (error) {
      console.error('Route error:', error);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Failed to load page</div>
        </div>`;
      container.style.opacity = '1';
    }
  }

  window.addEventListener('hashchange', handleRoute);
  // Handle initial load
  handleRoute();
}
