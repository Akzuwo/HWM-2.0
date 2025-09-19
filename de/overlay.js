// Simple overlay message utility
const MESSAGE_OVERLAY_VISIBLE = 'is-visible';
const MESSAGE_OVERLAY_CLOSING = 'closing';
const MESSAGE_OVERLAY_DURATION = 200;

function ensureOverlay() {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        overlay = createOverlay();
    }
    return overlay;
}

function applyOverlayState(overlay, show) {
    if (!overlay) return;
    overlay.classList.remove(MESSAGE_OVERLAY_CLOSING);
    if (show) {
        overlay.classList.add(MESSAGE_OVERLAY_VISIBLE);
        return;
    }
    overlay.classList.remove(MESSAGE_OVERLAY_VISIBLE);
    overlay.classList.add(MESSAGE_OVERLAY_CLOSING);
    window.setTimeout(() => overlay.classList.remove(MESSAGE_OVERLAY_CLOSING), MESSAGE_OVERLAY_DURATION);
}

function showOverlay(message) {
    const overlay = ensureOverlay();
    const messageNode = document.getElementById('overlay-message');
    if (messageNode) {
        messageNode.textContent = message;
    }
    applyOverlayState(overlay, true);
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    applyOverlayState(overlay, false);
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="overlay-content">
            <p id="overlay-message"></p>
            <button id="overlay-close">OK</button>
        </div>
    `;
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            hideOverlay();
        }
    });
    document.body.appendChild(overlay);
    const closeButton = document.getElementById('overlay-close');
    if (closeButton) {
        closeButton.addEventListener('click', hideOverlay);
    }
    return overlay;
}

document.addEventListener('DOMContentLoaded', ensureOverlay);

// expose globally
window.showOverlay = showOverlay;
window.hideOverlay = hideOverlay;
