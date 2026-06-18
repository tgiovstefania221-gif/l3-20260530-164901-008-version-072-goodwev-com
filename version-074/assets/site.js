(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-nav-toggle]');
    if (header && toggle) {
      toggle.addEventListener('click', function () {
        header.classList.toggle('nav-open');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      if (slides.length <= 1) {
        return;
      }
      var index = 0;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    });

    document.querySelectorAll('[data-sort-grid]').forEach(function (grid) {
      var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      function sortCards(mode) {
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'popular') {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (mode === 'rating') {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        buttons.forEach(function (button) {
          button.classList.toggle('is-active', button.dataset.sort === mode);
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          sortCards(button.dataset.sort);
        });
      });
    });

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
      var grid = document.querySelector(input.getAttribute('data-card-filter'));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.dataset.search || '').toLowerCase();
          card.hidden = value.length > 0 && text.indexOf(value) === -1;
        });
      });
    });
  });
})();
