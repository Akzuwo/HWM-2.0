(function () {
  function initPrivacyAnimations() {
    var body = document.body;
    if (!body || !body.classList.contains('legal-page')) {
      return;
    }

    window.requestAnimationFrame(function () {
      body.classList.add('legal-loaded');
    });

    var prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    var animatedElements = [];
    var header = document.querySelector('.legal-header');
    if (header) {
      animatedElements.push(header);
    }
    animatedElements = animatedElements.concat(Array.prototype.slice.call(document.querySelectorAll('.legal-section')));

    if (!animatedElements.length) {
      return;
    }

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      animatedElements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    animatedElements.forEach(function (element, index) {
      element.style.setProperty('--section-delay', index * 80 + 'ms');
      observer.observe(element);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyAnimations);
  } else {
    initPrivacyAnimations();
  }
})();
