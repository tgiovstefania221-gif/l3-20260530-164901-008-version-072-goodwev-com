
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-text]'));
    var empty = document.querySelector('[data-search-empty]');
    if (!cards.length) {
      return;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search-text') || '';
        var match = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-search', !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', apply);
  }

  function setupMoviePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player[data-src]'));
    players.forEach(function (player) {
      var button = player.querySelector('.play-overlay');
      var video = player.querySelector('video');
      if (!button || !video) {
        return;
      }
      button.addEventListener('click', function () {
        playMoviePlayer(player);
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playMoviePlayer(player);
        }
      });
    });
  }

  function playMoviePlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var status = player.querySelector('.player-status');
    var source = player.getAttribute('data-src');
    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    if (!video.dataset.bound) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.dataset.bound = 'true';
    }

    video.controls = true;
    if (overlay) {
      overlay.classList.add('hidden');
    }
    setStatus('正在加载视频...');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        setStatus('');
      }).catch(function () {
        setStatus('点击视频区域继续播放');
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupSearch();
    setupMoviePlayers();
  });
})();
