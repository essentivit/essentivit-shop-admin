// js/admin.js
console.log("admin.js loaded");

import { openModal, closeModal, initModalDelegation } from './modal.js';
import { showToast } from './utils.js';
import { apiFetch } from './api.js';

let isConnected = false;

document.addEventListener('DOMContentLoaded', () => {
  initModalDelegation();
  initTabs();
  initConnect();
  initProductForm();
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
      const res = await apiFetch('/api/products');
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
  const statusDot    = document.getElementById('status-dot');
  const statusText   = document.getElementById('status-text');
  const connectText  = document.getElementById('connect-text');
  const tokenInput   = document.getElementById('bearer-token');

  if (connected) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    connectText.textContent = 'Disconnect';
    tokenInput.disabled = true;
    initProductSection();
  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    connectText.textContent = 'Connect';
    tokenInput.disabled = false;
    clearProductSection();
  }
}

// ---------- Tab switching ----------
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!isConnected) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
}

// ---------- Products CRUD ----------
function initProductSection() {
  document.getElementById('add-product-btn').addEventListener('click', openCreateModal);
  document.getElementById('empty-add-product').addEventListener('click', openCreateModal);
  fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  try {
    const res = await apiFetch('/api/products');
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
      tr.querySelector('.edit-btn').addEventListener('click', () => openEditModal(p));
      tr.querySelector('.delete-btn').addEventListener('click', () => handleDelete(p.id));
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

function initProductForm() {
  const form = document.getElementById('product-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = form.dataset.mode;
    const id   = document.getElementById('product-id').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const desc = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value) * 100;
    const image = document.getElementById('product-image').value.trim();

    try {
      // Save product
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ id, name, description: desc, price, image }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // If stock-adjust was set, submit that
      const delta = parseInt(document.getElementById('product-stock-adjust').value, 10);
      if (!isNaN(delta) && delta !== 0) {
        try {
          const stockRes = await apiFetch(`/api/inventory?sku=${encodeURIComponent(id)}`, {
            method: 'POST',
            body: JSON.stringify({ delta }),
          });
          if (!stockRes.ok) {
            const err2 = await stockRes.json();
            throw new Error(err2.error || `HTTP ${stockRes.status}`);
          }
          const { stock: newStock } = await stockRes.json();
          showToast(`Stock updated to ${newStock}`);
        } catch (stockErr) {
          console.error(stockErr);
          showToast('Failed to update stock: ' + stockErr.message, 'error');
        }
      }

      closeModal('#product-modal');
      fetchAndRenderProducts();
      showToast(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save product: ' + err.message, 'error');
    }
  });
}

function openCreateModal() {
  const form = document.getElementById('product-form');
  form.dataset.mode = 'create';
  form.reset();
  document.getElementById('product-id').disabled = false;
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-stock').value = '';
  document.getElementById('product-stock-adjust').value = '';
  openModal('#product-modal');
}

function openEditModal(p) {
  const form = document.getElementById('product-form');
  form.dataset.mode = 'edit';
  document.getElementById('product-id').value          = p.id;
  document.getElementById('product-id').disabled       = true;
  document.getElementById('product-name').value        = p.name;
  document.getElementById('product-description').value = p.description;
  document.getElementById('product-price').value       = (p.price / 100).toFixed(2);
  document.getElementById('product-image').value       = p.image;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  // load current stock
  loadStock(p.id);
  openModal('#product-modal');
}

async function handleDelete(id) {
  if (!confirm(`Delete product ${id}?`)) return;
  try {
    const res = await apiFetch(`/api/products?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast(`Product ${id} deleted`);
    fetchAndRenderProducts();
  } catch (err) {
    console.error(err);
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ---------- Stock Helpers ----------
async function loadStock(sku) {
  try {
    const res = await apiFetch(`/api/inventory?sku=${encodeURIComponent(sku)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { stock } = await res.json();
    document.getElementById('product-stock').value = stock;
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch stock: ' + err.message, 'error');
    document.getElementById('product-stock').value = '';
  }
  document.getElementById('product-stock-adjust').value = '';
}
