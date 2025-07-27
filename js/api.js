// js/admin.js (use apiFetch instead of fetch)
import { openModal, closeModal, initModalDelegation } from './modal.js';
import { showToast } from './utils.js';
import { apiFetch } from './api.js';

// Use current origin for API base
const API_BASE = window.API_BASE || window.location.origin;
let isConnected = false;

// Initialise on page load
... (rest unchanged until initConnect) ...

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

async function fetchAndRenderProducts() {
  try {
    const res = await apiFetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { products } = await res.json();
    ...
}

async function populateSKUOptions() {
  try {
    const res = await apiFetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { products } = await res.json();
    ...
}

async function onSKUChange() {
  ...
    const res = await apiFetch(`/api/inventory?sku=${encodeURIComponent(sku)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { stock } = await res.json();
    ...
}

async function adjustStock() {
  ...
    const res = await apiFetch(
      `/api/inventory?sku=${encodeURIComponent(sku)}`,
      {
        method: 'POST',
        body: JSON.stringify({ delta }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const { stock } = await res.json();
    ...
}