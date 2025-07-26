import { $, $$ } from './utils.js';

export function openModal(selector) {
  const modal = $(selector);
  if (modal) modal.classList.add('show');
}

export function closeModal(selector) {
  const modal = $(selector);
  if (modal) modal.classList.remove('show');
}

/* Global delegation */
export function initModalDelegation() {
  document.addEventListener('click', (event) => {
    const overlay = event.target.closest('.modal-overlay');
    if (!overlay) return;

    const clickedBackdrop = event.target === overlay;
    const clickedClose    = event.target.closest('.modal-close');
    const clickedCancel   = event.target.closest('.btn-secondary');

    if (clickedBackdrop || clickedClose || clickedCancel) {
      closeModal(`#${overlay.id}`);
    }
  });

  /* For keyboard nav – close when overlay itself is clicked */
  $$('.modal-overlay').forEach((ov) =>
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeModal(`#${ov.id}`);
    })
  );
}
