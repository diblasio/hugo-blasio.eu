// Theme toggle with persisted preference.
(function() {
  'use strict';

  var STORAGE_KEY = 'lumen-theme';
  var html = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function getResolvedTheme() {
    var current = html.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') return current;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setPressedState(theme) {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  setPressedState(getResolvedTheme());

  if (!toggle) return;

  toggle.addEventListener('click', function() {
    var current = getResolvedTheme();
    var next = current === 'dark' ? 'light' : 'dark';

    html.classList.add('no-transition');
    html.setAttribute('data-theme', next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setPressedState(next);

    window.requestAnimationFrame(function() {
      html.classList.remove('no-transition');
    });
  });
})();
