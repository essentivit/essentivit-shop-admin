// js/api.js

/**
 * Performs an authenticated fetch to the API using a Bearer token.
 *
 * @param {string} path - the API path (e.g. '/api/inventory').
 * @param {RequestInit} [options] - fetch options (method, body, etc).
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const base = window.API_BASE || window.location.origin;

  // Get token from input field
  const tokenInput = document.getElementById('bearer-token');
  const token = tokenInput ? tokenInput.value.trim() : '';

  if (!token) {
    throw new Error('Missing bearer token');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 🔍 Log what’s being sent
  console.log("Sending token:", token);
  console.log("Headers:", [...headers.entries()]);

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  return response;
}
