// Simple overlay message utility
function showOverlay(message) {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        createOverlay();
        overlay = document.getElementById('overlay');
    }
    document.getElementById('overlay-message').textContent = message;
    overlay.style.display = 'flex';
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.display = 'none';
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="overlay-content">
            <p id="overlay-message"></p>
            <button id="overlay-close">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('overlay-close').addEventListener('click', hideOverlay);
}

document.addEventListener('DOMContentLoaded', createOverlay);

// expose globally
window.showOverlay = showOverlay;
window.hideOverlay = hideOverlay;
