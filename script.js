/* ===== Klients Hub — Main Script ===== */

(function () {
  'use strict';

  // ——— Theme Toggle ———
  const THEME_KEY = 'klientshub-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage not available
    }
  }

  // Initialize theme: respect stored preference, otherwise default to dark
  function initTheme() {
    const stored = getStoredTheme();
    if (stored) {
      setTheme(stored);
      return;
    }
    // Default is dark mode
    setTheme('dark');
  }

  initTheme();

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Bind both desktop and mobile toggle buttons
  const toggleDesktop = document.getElementById('theme-toggle-desktop');
  const toggleMobile = document.getElementById('theme-toggle-mobile');

  if (toggleDesktop) toggleDesktop.addEventListener('click', toggleTheme);
  if (toggleMobile) toggleMobile.addEventListener('click', toggleTheme);

  // ——— Floating Navbar scroll effect ———
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ——— Mobile slide-in panel ———
  const hamburger = document.getElementById('nav-hamburger');
  const mobilePanel = document.getElementById('nav-mobile-panel');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  function openMobileMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobilePanel.classList.add('open');
    mobileBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobilePanel.classList.remove('open');
    mobileBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobilePanel.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close when tapping backdrop
  mobileBackdrop.addEventListener('click', closeMobileMenu);

  // Close mobile nav when a link is clicked
  mobilePanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ——— Smooth scroll for anchor links ———
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      // If it's the order section, make it visible first
      if (targetId === '#order') {
        const orderSection = document.getElementById('order');
        orderSection.classList.add('active');
      }

      const navHeight = navbar.getBoundingClientRect().height;
      const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    });
  });

  // ——— Scroll Reveal (Intersection Observer) ———
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ——— LocalStorage Order System ———
  const ORDERS_KEY = 'klientshub-orders';

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveOrder(orderId, orderData) {
    const orders = getOrders();
    orders[orderId] = orderData;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function generateOrderId() {
    return 'ORD-' + Math.floor(10000 + Math.random() * 90000);
  }

  // ——— Modals ———
  const modalSuccess = document.getElementById('modal-success');
  const modalTrack = document.getElementById('modal-track');
  const modalAdmin = document.getElementById('modal-admin-login');

  document.getElementById('close-success-modal').addEventListener('click', () => modalSuccess.classList.remove('visible'));
  document.getElementById('close-track-modal').addEventListener('click', () => modalTrack.classList.remove('visible'));
  document.getElementById('close-admin-modal').addEventListener('click', () => modalAdmin.classList.remove('visible'));

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('visible');
    });
  });

  // Track Order Nav Links
  document.getElementById('nav-track').addEventListener('click', () => modalTrack.classList.add('visible'));
  document.getElementById('mob-track').addEventListener('click', () => {
    closeMobileMenu();
    modalTrack.classList.add('visible');
  });

  // Login Nav Links
  document.getElementById('nav-login').addEventListener('click', () => modalAdmin.classList.add('visible'));
  document.getElementById('mob-login').addEventListener('click', () => {
    closeMobileMenu();
    modalAdmin.classList.add('visible');
  });

  // ——— Order form handling ———
  const orderForm = document.getElementById('order-form');
  const submitBtn = document.getElementById('order-submit-btn');
  const formSteps = Array.from(document.querySelectorAll('.form-step'));
  const serviceSelect = document.getElementById('order-service');
  const materialBoxSelect = document.getElementById('order-material-box');
  const materialLabelSelect = document.getElementById('order-material-label');
  const materialBoxGroup = document.getElementById('material-box-group');
  const materialLabelGroup = document.getElementById('material-label-group');
  const materialsRow = document.getElementById('materials-row');
  const dimensionsHint = document.getElementById('dimensions-hint');

  function getSelectedService() {
    return serviceSelect.value;
  }

  function serviceNeedsBoxMaterial(service) {
    return service === 'packaging' || service === 'labeling' || service === 'all';
  }

  function serviceNeedsLabelMaterial(service) {
    return service === 'design' || service === 'labeling' || service === 'all';
  }

  function materialsStepComplete() {
    const service = getSelectedService();
    const needsBox = serviceNeedsBoxMaterial(service);
    const needsLabel = serviceNeedsLabelMaterial(service);
    const materialBox = materialBoxSelect.value;
    const materialLabel = materialLabelSelect.value;

    return (!needsBox || materialBox) && (!needsLabel || materialLabel);
  }

  function updateServiceFields() {
    const service = getSelectedService();
    const showBox = serviceNeedsBoxMaterial(service);
    const showLabel = serviceNeedsLabelMaterial(service);

    materialBoxGroup.hidden = !showBox;
    materialLabelGroup.hidden = !showLabel;
    materialBoxSelect.required = showBox;
    materialLabelSelect.required = showLabel;
    materialsRow.classList.toggle('form-row--single', showBox !== showLabel);

    if (!showBox) {
      materialBoxSelect.value = '';
    }

    if (!showLabel) {
      materialLabelSelect.value = '';
    }

    dimensionsHint.textContent = service === 'packaging' ? '(Box)' : '(in cm)';
    updateProgressiveForm();
  }

  const stepValidators = {
    1: () => {
      const name = document.getElementById('order-name').value.trim();
      const emailInput = document.getElementById('order-email');
      return name && emailInput.value.trim() && emailInput.checkValidity();
    },
    2: () => document.getElementById('order-phone').value.trim(),
    3: () => getSelectedService(),
    4: () => materialsStepComplete(),
    5: () => document.getElementById('order-details').value.trim(),
    6: () => {
      const length = document.getElementById('order-length').value;
      const width = document.getElementById('order-width').value;
      const height = document.getElementById('order-height').value;
      return length && width && height;
    },
    7: () => {
      const quantity = parseInt(document.getElementById('order-quantity').value, 10);
      return quantity >= 1 && quantity <= 9999;
    },
    8: () => true
  };

  function updateProgressiveForm() {
    let completedSteps = 0;

    for (let step = 1; step <= formSteps.length; step += 1) {
      if (stepValidators[step] && stepValidators[step]()) {
        completedSteps = step;
      } else {
        break;
      }
    }

    formSteps.forEach((stepEl) => {
      const stepNumber = Number(stepEl.dataset.step);
      stepEl.classList.toggle('visible', stepNumber <= completedSteps + 1);
    });
  }

  orderForm.addEventListener('input', updateProgressiveForm);
  orderForm.addEventListener('change', updateProgressiveForm);
  serviceSelect.addEventListener('change', updateServiceFields);
  updateServiceFields();

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('order-name').value.trim();
    const email = document.getElementById('order-email').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const company = document.getElementById('order-company').value.trim();
    const service = getSelectedService();
    const quantity = parseInt(document.getElementById('order-quantity').value, 10);
    const materialBox = materialBoxSelect.value;
    const materialLabel = materialLabelSelect.value;
    const details = document.getElementById('order-details').value.trim();
    const length = document.getElementById('order-length').value.trim();
    const width = document.getElementById('order-width').value.trim();
    const height = document.getElementById('order-height').value.trim();
    const imageInput = document.getElementById('order-image');
    const imageFile = imageInput.files[0];
    const needsBox = serviceNeedsBoxMaterial(service);
    const needsLabel = serviceNeedsLabelMaterial(service);

    if (
      !name ||
      !email ||
      !phone ||
      !service ||
      !details ||
      !length ||
      !width ||
      !height ||
      (needsBox && !materialBox) ||
      (needsLabel && !materialLabel)
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!quantity || quantity < 1 || quantity > 9999) {
      alert('Please enter a quantity between 1 and 9999.');
      return;
    }


    const orderId = generateOrderId();

    const orderData = {
      name,
      email,
      phone,
      company,
      service,
      quantity,
      materialBox,
      materialLabel,
      details,
      length,
      width,
      height,
      status: 'pending',
      date: new Date().toISOString()
    };

    function finalizeOrder() {
      saveOrder(orderId, orderData);
      document.getElementById('display-order-id').textContent = orderId;
      modalSuccess.classList.add('visible');
      orderForm.reset();
      updateServiceFields();
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        orderData.image = reader.result;
        orderData.imageName = imageFile.name;
        finalizeOrder();
      };
      reader.onerror = () => {
        alert('Could not read the uploaded image. Please try again.');
      };
      reader.readAsDataURL(imageFile);
    } else {
      finalizeOrder();
    }
  });

  // ——— Track Order Logic ———
  const trackBtn = document.getElementById('btn-track-submit');
  const trackInput = document.getElementById('track-order-id');
  const trackResult = document.getElementById('track-result');
  const trackStatusText = document.getElementById('track-status-text');

  const STATUS_LABELS = {
    'pending': 'Order Received',
    'in_production': 'In Production',
    'in_shipment': 'In Shipment',
    'completed': 'Completed'
  };

  trackBtn.addEventListener('click', () => {
    const orderId = trackInput.value.trim().toUpperCase();
    if (!orderId) return;

    const orders = getOrders();
    const order = orders[orderId];

    trackResult.style.display = 'block';

    if (order) {
      trackStatusText.textContent = STATUS_LABELS[order.status] || order.status;
      trackStatusText.style.color = 'var(--clr-primary)';
    } else {
      trackStatusText.textContent = 'Order Not Found';
      trackStatusText.style.color = 'var(--clr-rose)';
    }
  });

  // ——— Hidden Admin Login (Double click footer brand) ———
  const footerBrand = document.querySelector('.footer__brand-name');
  if (footerBrand) {
    footerBrand.addEventListener('dblclick', () => {
      modalAdmin.classList.add('visible');
    });
  }

  // Admin Login Logic
  const adminUser = document.getElementById('admin-user');
  const adminPass = document.getElementById('admin-pass');
  const btnAdminLogin = document.getElementById('btn-admin-login');

  function handleAdminLogin() {
    const user = adminUser.value.trim().toLowerCase();
    const pass = adminPass.value.trim();

    if (user === 'admin' && pass === 'Kamakshi1982') {
      // Store auth state locally
      sessionStorage.setItem('admin_auth', 'true');
      window.location.href = 'admin.html';
    } else {
      alert('Invalid credentials. Please make sure the password is correct.');
    }
  }

  btnAdminLogin.addEventListener('click', handleAdminLogin);

  [adminUser, adminPass].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAdminLogin();
      }
    });
  });

  // ——— Sanitize inputs (XSS prevention) ———
  document.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      const clean = input.value.replace(/<[^>]*>/g, '');
      if (clean !== input.value) {
        input.value = clean;
      }
    });
  });

  // ——— Interactive Global Particles ———
  const particlesContainer = document.getElementById('global-particles');

  if (particlesContainer) {
    let lastParticleTime = 0;
    
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      // Throttle particle creation
      if (now - lastParticleTime < 40) return;
      lastParticleTime = now;

      // Because the container is fixed inset 0, the coordinates are just clientX/clientY
      createParticle(e.clientX, e.clientY);
    });

    function createParticle(x, y) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Randomize position slightly around the cursor
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      particle.style.left = `${x + offsetX}px`;
      particle.style.top = `${y + offsetY}px`;
      
      // Randomize size
      const size = Math.random() * 8 + 4; // 4px to 12px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Randomize color among brand colors
      const colors = ['var(--clr-primary)', 'var(--clr-accent)', 'var(--clr-rose)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      particlesContainer.appendChild(particle);

      // Remove particle after animation completes (1s)
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
})();
