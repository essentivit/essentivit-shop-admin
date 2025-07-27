// js/api.js

/**
 * Performs an authenticated fetch to the API using a Bearer token.
 *
 * Expects VITE_API_BASE and VITE_ADMIN_TOKEN to be injected at build time
 * (e.g. via .dev.vars → VITE_…).
 *
 * @param {string} path - the API path (e.g. '/api/inventory').
 * @param {RequestInit} [options] - fetch options (method, body, etc).
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const base = import.meta.env.VITE_API_BASE || window.location.origin;
  const token = import.meta.env.VITE_ADMIN_TOKEN;
  if (!token) {
    throw new Error('Missing VITE_ADMIN_TOKEN – please set it in .dev.vars');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });
  return response;
}
