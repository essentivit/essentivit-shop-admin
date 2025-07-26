import { $, $$ } from './utils.js';
import { state, getProductCoupons, getAllCoupons } from './state.js';

/* Stats */
export function updateStats() {
  $('#retailers-count').textContent = state.retailers.length;
  $('#products-count').textContent  = state.products.length;
  $('#coupons-count').textContent   = state.retailers.reduce(
    (s, r) => s + (r.coupons?.length || 0), 0
  );
}

export function couponStatus(expires) {
  if (!expires) return { txt: 'No expiry', cls: 'success' };
  const d    = new Date(expires);
  const days = Math.ceil((d - Date.now()) / 864e5);
  if (days < 0)  return { txt: 'Expired', cls: 'error' };
  if (days <= 7) return { txt: `${days} days`, cls: 'warning' };
  return { txt: 'Active', cls: 'success' };
}

/* Retailers */
export function renderRetailers() {
  const empty = $('#retailers-empty');
  const table = $('#retailers-table');
  const tbody = $('#retailers-tbody');

  if (!state.retailers.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  table.style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = state.retailers
    .map((r, i) => {
      const prodCnt = state.products.filter((p) => p.retailerIds?.includes(r.id)).length;
      const coupCnt = r.coupons?.length || 0;
      return `
        <tr data-idx="${i}" class="retailer-row">
          <td>
            <div style="font-weight:500">${r.name || 'Unnamed'}</div>
            <div style="font-size:12px;color:var(--text-muted)">${r.id}</div>
          </td>
          <td>${r.url ? `<a href="${r.url}" target="_blank">${r.url}</a>` : '-'}</td>
          <td><span class="badge">${prodCnt}</span></td>
          <td><span class="badge">${coupCnt}</span></td>
          <td><button class="btn btn-secondary btn-sm edit-retailer-btn">✏️ Edit</button></td>
        </tr>`;
    })
    .join('');
}

/* Products */
export function renderProducts() {
  const empty = $('#products-empty');
  const table = $('#products-table');
  const tbody = $('#products-tbody');

  if (!state.products.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  table.style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = state.products
    .map((p, i) => {
      const coupCnt = getProductCoupons(p.id).length;
      const retCnt  = p.retailerIds?.length || 0;
      const tags    = p.tags?.map((t) => `<span class="badge" style="margin-right:4px">${t}</span>`).join('') || '-';
      const img = p.image
        ? `<img src="${p.image}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:4px">`
        : '<div style="width:40px;height:40px;background:var(--bg-tertiary);border-radius:4px;display:flex;align-items:center;justify-content:center">📦</div>';

      return `
        <tr data-idx="${i}" class="product-row">
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              ${img}
              <div>
                <div style="font-weight:500">${p.name || 'Unnamed'}</div>
                <div style="font-size:12px;color:var(--text-muted)">${p.id}</div>
              </div>
            </div>
          </td>
          <td>${tags}</td>
          <td><span class="badge">${retCnt}</span></td>
          <td><span class="badge">${coupCnt}</span></td>
          <td><button class="btn btn-secondary btn-sm edit-product-btn">✏️ Edit</button></td>
        </tr>`;
    })
    .join('');
}

/* Coupons */
export function renderCoupons() {
  const empty  = $('#coupons-empty');
  const table  = $('#coupons-table');
  const tbody  = $('#coupons-tbody');
  const filter = $('#coupon-filter').value;

  const list = getAllCoupons().filter((c) => !filter || c.retailerId === filter);

  if (!list.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  table.style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = list
    .map((c) => {
      const s = couponStatus(c.expires);
      return `
        <tr>
          <td><code>${c.code}</code></td>
          <td>${c.discount}</td>
          <td>${c.retailerName}</td>
          <td>${c.productName}</td>
          <td>${c.expires || '-'}</td>
          <td><span class="badge" style="background:var(--${s.cls});color:#fff">${s.txt}</span></td>
        </tr>`;
    })
    .join('');
}

/* Coupon filter dropdown */
export function renderCouponFilter() {
  $('#coupon-filter').innerHTML =
    `<option value="">All retailers</option>` +
    state.retailers.map((r) => `<option value="${r.id}">${r.name}</option>`).join('');
}

/* Root render */
export function render() {
  updateStats();
  renderCouponFilter();

  if (state.currentTab === 'retailers')       renderRetailers();
  else if (state.currentTab === 'products')   renderProducts();
  else                                        renderCoupons();
}
