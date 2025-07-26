// js/admin.js
const API_BASE = 'http://localhost:8787';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initProductSection();
  initInventorySection();
});

// ---------- Tab switching ----------
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
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
  document.getElementById('add-product-btn')
    .addEventListener('click', () => console.log('Open product modal'));
  document.getElementById('empty-add-product')
    .addEventListener('click', () => console.log('Open product modal'));

  await fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
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
    alert('Failed to load products: ' + err.message);
  }
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
    const res = await fetch(`${API_BASE}/api/products`);
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
    alert('Failed to load SKUs: ' + err.message);
  }
}

async function onSKUChange() {
  const sku = this.value;
  const stockEl = document.getElementById('inventory-stock');
  const adjustBtn = document.getElementById('inventory-adjust-btn');

  if (!sku) {
    stockEl.textContent = '—';
    adjustBtn.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/inventory?sku=${encodeURIComponent(sku)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { stock } = await res.json();
    stockEl.textContent = stock;
    adjustBtn.disabled = false;
    document.getElementById('inventory-delta').value = '';
  } catch (err) {
    console.error(err);
    alert('Failed to fetch stock: ' + err.message);
  }
}

async function adjustStock() {
  const sku = document.getElementById('inventory-sku-select').value;
  const delta = parseInt(document.getElementById('inventory-delta').value, 10);
  if (!sku || isNaN(delta)) return alert('Select a product and enter a valid number');

  try {
    const res = await fetch(`${API_BASE}/api/inventory?sku=${encodeURIComponent(sku)}`, {
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
    alert('Stock updated to ' + stock);
  } catch (err) {
    console.error(err);
    alert('Could not update stock: ' + err.message);
  }
}
