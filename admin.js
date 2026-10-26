(function () {
  'use strict';

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('admin_auth');
    window.location.href = 'index.html';
  });

  const ORDERS_KEY = 'klientshub-orders';

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    renderOrders();
  }

  let currentTab = 'pending';

  const SERVICE_LABELS = {
    packaging: 'Product Packaging',
    labeling: 'Label Design & Printing',
    design: 'Package Design',
    all: 'Full Service (Design + Label + Packaging)'
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function displayValue(value, fallback = '—') {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return escapeHtml(value);
  }

  function formatService(service) {
    return escapeHtml(SERVICE_LABELS[service] || service || '—');
  }

  function formatDimensions(order) {
    const parts = [order.length, order.width, order.height].filter(Boolean);
    if (parts.length === 0) return '—';
    return `${displayValue(order.length)} × ${displayValue(order.width)} × ${displayValue(order.height)} cm`;
  }

  function buildOrderSummary(order) {
    const service = formatService(order.service);
    const quantity = displayValue(order.quantity);
    const materialBox = displayValue(order.materialBox);
    const materialLabel = displayValue(order.materialLabel);

    return `
      <div class="order-summary">
        <span class="order-summary__main">${service}</span>
        <span class="order-summary__meta">Qty: ${quantity} · Box: ${materialBox} · Label: ${materialLabel}</span>
        <details class="order-details-toggle">
          <summary>View all details</summary>
          <div class="order-details-panel">
            <dl>
              <dt>Phone</dt><dd>${displayValue(order.phone)}</dd>
              <dt>Company</dt><dd>${displayValue(order.company)}</dd>
              <dt>Service</dt><dd>${service}</dd>
              <dt>Quantity</dt><dd>${quantity}</dd>
              <dt>Material (Box)</dt><dd>${materialBox}</dd>
              <dt>Material (Label)</dt><dd>${materialLabel}</dd>
              <dt>Dimensions</dt><dd>${formatDimensions(order)}</dd>
              <dt>Project Details</dt><dd>${displayValue(order.details)}</dd>
              <dt>Reference Image</dt>
              <dd>
                ${
                  order.image
                    ? `<img src="${order.image}" alt="${displayValue(order.imageName || 'Reference image')}"><br>${displayValue(order.imageName || 'Uploaded image')}`
                    : '—'
                }
              </dd>
            </dl>
          </div>
        </details>
      </div>
    `;
  }

  // Tab switching
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentTab = e.target.getAttribute('data-tab');
      renderOrders();
    });
  });

  function renderOrders() {
    const ordersObj = getOrders();
    const ordersBody = document.getElementById('orders-table-body');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    
    // Convert object to array for easier filtering/sorting
    const allOrders = Object.entries(ordersObj).map(([id, order]) => ({ id, ...order }));
    
    // Sort by date (newest first)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by current tab
    const filteredOrders = allOrders.filter(order => {
      if (currentTab === 'pending') {
        return order.status === 'pending' || order.status === 'pending_payment' || order.status === 'to_be_approved';
      }
      if (currentTab === 'completed') {
        return order.status === 'completed' || order.status === 'in_shipment';
      }
      return order.status === currentTab;
    });

    ordersBody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
      noOrdersMsg.style.display = 'block';
    } else {
      noOrdersMsg.style.display = 'none';
      
      filteredOrders.forEach(order => {
        const tr = document.createElement('tr');
        const dateStr = new Date(order.date).toLocaleDateString() + ' ' + new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let actionsHtml = '';
        if (order.status === 'pending' || order.status === 'pending_payment' || order.status === 'to_be_approved') {
          actionsHtml = `<button class="btn-action btn-approve" data-id="${order.id}">Start Production</button>`;
        } else if (order.status === 'in_production' || order.status === 'in_shipment' || order.status === 'completed') {
          actionsHtml = `
            <select class="status-select" data-id="${order.id}">
              <option value="in_production" ${order.status === 'in_production' ? 'selected' : ''}>In Production</option>
              <option value="in_shipment" ${order.status === 'in_shipment' ? 'selected' : ''}>In Shipment</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          `;
          if (order.status === 'completed') {
             actionsHtml += `<button class="btn-action btn-delete" data-id="${order.id}">Delete</button>`;
          }
        }

        tr.innerHTML = `
          <td class="order-id">${escapeHtml(order.id)}</td>
          <td class="order-date">${escapeHtml(dateStr)}</td>
          <td>
            <strong>${escapeHtml(order.name)}</strong><br>
            <span style="font-size: var(--fs-xs); color: var(--clr-text-muted);">${escapeHtml(order.email)}</span>
          </td>
          <td>${buildOrderSummary(order)}</td>
          <td class="order-actions">${actionsHtml}</td>
        `;
        ordersBody.appendChild(tr);
      });
    }

    // Bind action events
    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const allOrders = getOrders();
        allOrders[id].status = 'in_production';
        saveOrders(allOrders);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to permanently delete this completed order?')) return;
        const id = e.target.getAttribute('data-id');
        const allOrders = getOrders();
        delete allOrders[id];
        saveOrders(allOrders);
      });
    });

    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        const allOrders = getOrders();
        allOrders[id].status = newStatus;
        saveOrders(allOrders);
      });
    });
  }

  // Initial render
  renderOrders();

  // Polling to simulate real-time updates (since it's localStorage across tabs)
  window.addEventListener('storage', (e) => {
    if (e.key === ORDERS_KEY) {
      renderOrders();
    }
  });

  // ——— Interactive Global Particles ———
  const particlesContainer = document.getElementById('global-particles');

  if (particlesContainer) {
    let lastParticleTime = 0;
    
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastParticleTime < 40) return;
      lastParticleTime = now;
      createParticle(e.clientX, e.clientY);
    });

    function createParticle(x, y) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      particle.style.left = `${x + offsetX}px`;
      particle.style.top = `${y + offsetY}px`;
      
      const size = Math.random() * 8 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const colors = ['var(--clr-primary)', 'var(--clr-accent)', 'var(--clr-rose)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      particlesContainer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }

})();
