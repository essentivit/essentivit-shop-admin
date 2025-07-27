// js/admin.js
console.log("admin.js loaded");

import { openModal, closeModal, initModalDelegation } from './modal.js';
import { showToast } from './utils.js';
import { apiFetch } from './api.js'; // ✅ added import

const API_BASE = window.API_BASE || window.location.origin;
let isConnected = false;

// Initialise on page load
document.addEventListener('DOMContentLoaded', () => {
  initModalDelegation();
  initTabs();
  initConnect();
});

// ---------- Connection Handling ----------
function initConnect() {
  const btn = document.getElementById('connect-btn');
  btn.addEventListener('click', async () => {
    if (isConnected) {
      setConnected(false);
      return;
    }

    btn.disabled = true;
    document.getElementById('connect-loading').style.display = '';
    try {
      const res = await apiFetch('/api/products'); // ✅ use secure API call
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setConnected(true);
      showToast('Connected to API');
    } catch (err) {
      console.error(err);
      showToast('Failed to connect: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      document.getElementById('connect-loading').style.display = 'none';
    }
  });
}

function setConnected(connected) {
  isConnected = connected;
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const connectText = document.getElementById('connect-text');
  const tokenInput = document.getElementById('bearer-token');

  if (connected) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    connectText.textContent = 'Disconnect';
    tokenInput.disabled = true;
    initProductSection();
    initInventorySection();
  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    connectText.textContent = 'Connect';
    tokenInput.disabled = false;
    clearProductSection();
    clearInventorySection();
  }
}

// ---------- Tab switching ----------
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!isConnected) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      document.getElementById(`${name}-tab`).classList.add('active');
    });
  });
}

// ---------- Products ----------
async function initProductSection() {
  document.getElementById('add-product-btn').addEventListener('click', () => {
    showToast('Add product not implemented yet', 'warning');
  });
  document.getElementById('empty-add-product').addEventListener('click', () => {
    showToast('Add product not implemented yet', 'warning');
  });

  await fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  try {
    const res = await apiFetch('/api/products'); // ✅ secure call
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { products } = await res.json();

    const empty = document.getElementById('products-empty');
    const table = document.getElementById('products-table');
    const tbody = document.getElementById('products-tbody');

    if (!products.length) {
      empty.style.display = 'block';
      table.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    table.style.display = '';

    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${(p.price / 100).toFixed(2)}</td>
        <td><img src="${p.image}" alt="${p.name}" class="product-thumb"></td>
        <td>
          <button class="btn btn-secondary edit-btn" data-sku="${p.id}">Edit</button>
          <button class="btn btn-danger delete-btn" data-sku="${p.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    showToast('Failed to load products: ' + err.message, 'error');
  }
}

function clearProductSection() {
  document.getElementById('products-tbody').innerHTML = '';
  document.getElementById('products-table').style.display = 'none';
  document.getElementById('products-empty').style.display = 'block';
}

// ---------- Inventory ----------
async function initInventorySection() {
  const skuSelect = document.getElementById('inventory-sku-select');
  const adjustBtn = document.getElementById('inventory-adjust-btn');

  skuSelect.addEventListener('change', onSKUChange);
  adjustBtn.addEventListener('click', adjustStock);

  await populateSKUOptions();
  adjustBtn.disabled = true;
}

async function populateSKUOptions() {
  try {
    const res = await apiFetch('/api/products'); // ✅ secure call
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { products } = await res.json();

    const skuSelect = document.getElementById('inventory-sku-select');
    skuSelect.innerHTML = `<option value="">Select product</option>`;
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.id} — ${p.name}`;
      skuSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    showToast('Failed to load SKUs: ' + err.message, 'error');
  }
}

async function onSKUChange() {
  if (!isConnected) return;
  const sku = this.value;
  const stockEl = document.getElementById('inventory-stock');
  const adjustBtn = document.getElementById('inventory-adjust-btn');

  if (!sku) {
    stockEl.textContent = '—';
    adjustBtn.disabled = true;
    return;
  }

  try {
    const res = await apiFetch(`/api/inventory?sku=${encodeURIComponent(sku)}`); // ✅ secure call
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { stock } = await res.json();
    stockEl.textContent = stock;
    adjustBtn.disabled = false;
    document.getElementById('inventory-delta').value = '';
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch stock: ' + err.message, 'error');
  }
}

async function adjustStock() {
  if (!isConnected) return;
  const sku = document.getElementById('inventory-sku-select').value;
  const delta = parseInt(document.getElementById('inventory-delta').value, 10);
  if (!sku || isNaN(delta)) return showToast('Select a product and enter a valid number', 'error');

  try {
    const res = await apiFetch(`/api/inventory?sku=${encodeURIComponent(sku)}`, { // ✅ secure call
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const { stock } = await res.json();
    document.getElementById('inventory-stock').textContent = stock;
    document.getElementById('inventory-delta').value = '';
    showToast('Stock updated to ' + stock);
  } catch (err) {
    console.error(err);
    showToast('Could not update stock: ' + err.message, 'error');
  }
}

function clearInventorySection() {
  const skuSelect = document.getElementById('inventory-sku-select');
  skuSelect.innerHTML = '<option value="">Select product</option>';
  document.getElementById('inventory-stock').textContent = '—';
  document.getElementById('inventory-delta').value = '';
  document.getElementById('inventory-adjust-btn').disabled = true;
}
