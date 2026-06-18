(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', mobileNav.classList.contains('open') ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    document.querySelectorAll('.hero-section').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var queryInput = searchPage.querySelector('[data-search-input]');
        var typeSelect = searchPage.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-card]'));
        var noResult = searchPage.querySelector('[data-no-result]');
        var initialQuery = params.get('q') || '';
        var initialType = params.get('type') || '';

        if (queryInput) {
            queryInput.value = initialQuery;
        }
        if (typeSelect) {
            typeSelect.value = initialType;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applySearch() {
            var q = normalize(queryInput ? queryInput.value : '');
            var selectedType = normalize(typeSelect ? typeSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matchedQuery = !q || haystack.indexOf(q) !== -1;
                var matchedType = !selectedType || cardType === selectedType;
                var showCard = matchedQuery && matchedType;

                card.style.display = showCard ? '' : 'none';
                if (showCard) {
                    visible += 1;
                }
            });

            if (noResult) {
                noResult.classList.toggle('show', visible === 0);
            }
        }

        if (queryInput) {
            queryInput.addEventListener('input', applySearch);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applySearch);
        }
        applySearch();
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var hls = null;
        var started = false;

        function startPlayer() {
            if (!video) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            shell.classList.add('playing');

            if (!started) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            hls.destroy();
                            hls = null;
                            video.src = stream;
                            video.play().catch(function () {});
                        }
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
                started = true;
            } else {
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayer);
        }
        if (video) {
            video.addEventListener('click', startPlayer);
            video.addEventListener('play', function () {
                shell.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    shell.classList.remove('playing');
                }
            });
        }
    });

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 12);
        }, { passive: true });
    }
})();
