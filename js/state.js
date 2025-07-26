/**
 * Lightweight shared state container.
 */
export const state = {
  retailers: [],
  products: [],
  currentTab: 'retailers',
  editingRetailer: null,
  editingProduct: null,
};

/* Selectors */
export function getProductCoupons(pid) {
  return state.retailers.flatMap((r) =>
    (r.coupons || [])
      .filter((c) => !c.productId || c.productId === pid)
      .map((c) => ({ ...c, retailerId: r.id, retailerName: r.name }))
  );
}

export function getAllCoupons() {
  return state.retailers.flatMap((r) =>
    (r.coupons || []).map((c) => ({
      ...c,
      retailerId:   r.id,
      retailerName: r.name,
      productName:  c.productId
        ? state.products.find((p) => p.id === c.productId)?.name || ''
        : 'Site-wide',
    }))
  );
}
