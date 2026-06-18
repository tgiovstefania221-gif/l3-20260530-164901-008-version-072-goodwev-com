(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initHeader() {
    var header = qs("[data-header]");
    if (!header) {
      return;
    }
    var update = function () {
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
        dot.setAttribute("aria-selected", dotIndex === active ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var panel = qs("[data-filter-panel]");
    var list = qs("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var input = qs("[data-filter-keyword]", panel);
    var year = qs("[data-filter-year]", panel);
    var region = qs("[data-filter-region]", panel);
    var type = qs("[data-filter-type]", panel);
    var count = qs("[data-filter-count]");
    var cards = qsa(".movie-card, .rank-row", list);

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
        var matchesType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
        var isVisible = matchesKeyword && matchesYear && matchesRegion && matchesType;
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 条影片";
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    applyFilter();
  }

  function createCard(movie) {
    var tags = (movie.displayTags || movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"detail/" + escapeHtml(movie.id) + ".html\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <span class=\"poster-shell\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "海报\" loading=\"lazy\" onerror=\"this.classList.add('image-missing')\">",
      "      <span class=\"poster-fallback\">" + escapeHtml(String(movie.title || "").slice(0, 6)) + "</span>",
      "      <span class=\"poster-play\">播放</span>",
      "    </span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.yearText) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"detail/" + escapeHtml(movie.id) + ".html\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var root = qs("[data-search-page]");
    if (!root || !window.MOVIES_DATA) {
      return;
    }
    var input = qs("[data-search-input]", root);
    var year = qs("[data-search-year]", root);
    var type = qs("[data-search-type]", root);
    var results = qs("[data-search-results]", root);
    var count = qs("[data-search-count]", root);
    var empty = qs("[data-empty-results]", root);
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }

    function render() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var matched = window.MOVIES_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.yearText,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || normalize(movie.yearText) === yearValue;
        var matchesType = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1;
        return matchesKeyword && matchesYear && matchesType;
      });
      results.innerHTML = matched.slice(0, 240).map(createCard).join("");
      if (count) {
        count.textContent = "找到 " + matched.length + " 条影片，当前显示前 " + Math.min(240, matched.length) + " 条";
      }
      if (empty) {
        empty.classList.toggle("is-visible", matched.length === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  function initPlayer() {
    var player = qs("[data-player]");
    if (!player) {
      return;
    }
    var video = qs("video", player);
    var overlay = qs("[data-player-overlay]", player);
    var message = qs("[data-player-message]", player);
    var src = player.getAttribute("data-video") || "";
    var initialized = false;
    var hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachSource() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (!src) {
        setMessage("当前条目没有可用播放源");
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放源加载失败，请检查网络或稍后重试");
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        setMessage("当前浏览器不支持 HLS 播放");
      }
    }

    function play() {
      attachSource();
      var attempt = video.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        }).catch(function () {
          setMessage("点击视频区域后即可开始播放");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileNav();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayer();
  });
}());
