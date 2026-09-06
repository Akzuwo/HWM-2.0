// Page transitions provide the entrance. Content remains visible when loaded later.
(function () {
  function showContent() {
    if (document.body.classList.contains('home-page')) document.body.classList.add('home-loaded');
    if (document.body.classList.contains('help-page')) document.body.classList.add('help-loaded');
    document.querySelectorAll('.home-callout, .home-card, .help-hero, .help-section, .help-callout').forEach(element => element.classList.add('is-visible'));
  }
  document.addEventListener('DOMContentLoaded', showContent);
  showContent();
})();
