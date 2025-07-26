/**
 * js/utils.js
 * Shared, side-effect-free helpers.
 */

/* DOM helpers */
export const $  = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

/* Slug helpers */
export const rawSlug = (s = '') =>
  s.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const fallbackSlug = (prefix = 'item') =>
  `${prefix}-${Date.now().toString(36)}`;

export function uniq(base, arr) {
  let n = base, i = 1;
  while (arr.includes(n)) n = `${base}-${++i}`;
  return n;
}

/* Toast */
export function showToast(msg, type = 'success', delay = 3000) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);

  requestAnimationFrame(() => t.classList.add('show'));

  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, delay);
}
