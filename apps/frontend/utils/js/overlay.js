// One feedback system for legacy pages and React views.
function showOverlay(message, type = 'info') {
  const form = document.querySelector('.hm-modal-overlay.is-open form, .grade-modal form, #password-form');
  if ((type === 'error' || type === 'warning') && form) {
    let feedback = form.querySelector('.hm-inline-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'hm-inline-feedback';
      feedback.setAttribute('role', 'alert');
      form.appendChild(feedback);
    }
    feedback.textContent = message;
    return;
  }
  window.hmToast?.show(message, type);
}
window.showOverlay = showOverlay;
window.hideOverlay = () => document.querySelectorAll('.hm-toast').forEach(node => node.remove());
