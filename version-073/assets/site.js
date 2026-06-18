(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showSlide(i);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var input = filterRoot.querySelector('[data-filter-input]');
        var region = filterRoot.querySelector('[data-filter-region]');
        var year = filterRoot.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
        var empty = filterRoot.querySelector('[data-empty-state]');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var q = normalize(input ? input.value : '');
            var selectedRegion = normalize(region ? region.value : '');
            var selectedYear = normalize(year ? year.value : '');
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
})();
