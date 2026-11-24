/**
 * UniHub Lanka – Shared Animation Engine
 * animations.js  |  v1.0  |  < 2 KB gzipped
 *
 * Responsibilities:
 *  1. Add "js" class to <html> (progressive enhancement guard)
 *  2. IntersectionObserver scroll reveals ([data-animate])
 *  3. Auto-stagger for children of [data-stagger]
 *  4. Optional count-up for [data-countup] elements in stats bar
 *
 * No dependencies. defer-loaded.
 */

(function () {
  'use strict';

  /* ─── 1. Progressive enhancement guard ──────────── */
  /* This is also set by the inline script in <head>.
     Keep here as a fallback for the deferred load.    */
  document.documentElement.classList.add('js');

  /* Respect prefers-reduced-motion */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 2. Scroll-reveal via IntersectionObserver ─── */
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      revealObs.unobserve(el); /* each element animates once only */
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  /* ─── 3. Stagger: assign --i to children of [data-stagger] */
  function setupStagger(parent) {
    var children = parent.querySelectorAll('[data-animate]');
    var max = Math.min(children.length, 6); /* cap at 6 steps */
    children.forEach(function (child, idx) {
      if (idx < max) {
        child.style.setProperty('--i', idx);
      } else {
        child.style.setProperty('--i', max - 1); /* last children share max delay */
      }
    });
  }

  /* ─── 4. Count-up animation ──────────────────────── */
  function countUp(el) {
    if (reduced) return; /* skip for reduced-motion */
    var raw = el.getAttribute('data-countup');
    var suffix = el.getAttribute('data-countup-suffix') || '';
    var prefix = el.getAttribute('data-countup-prefix') || '';
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var duration = 900;
    var start = performance.now();
    var isInt = Number.isInteger(target);

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      /* ease-out cubic */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = prefix + (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        /* restore exact original text */
        el.textContent = prefix + raw + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  var countUpObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      countUpObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  /* ─── 5. Init on DOM ready ───────────────────────── */
  function init() {
    /* Observe all [data-animate] elements */
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      if (reduced) {
        /* skip IO; show immediately */
        el.classList.add('is-visible');
      } else {
        revealObs.observe(el);
      }
    });

    /* Setup stagger parents */
    document.querySelectorAll('[data-stagger]').forEach(setupStagger);

    /* Observe count-up elements */
    if (!reduced) {
      document.querySelectorAll('[data-countup]').forEach(function (el) {
        countUpObs.observe(el);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
