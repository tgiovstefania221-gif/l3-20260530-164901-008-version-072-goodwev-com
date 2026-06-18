(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('.movie-player').forEach(function (video) {
      var shell = video.closest('.video-shell');
      var button = shell ? shell.querySelector('.player-start') : null;
      var source = video.getAttribute('data-hls');
      var loaded = false;
      var hlsInstance = null;
      if (!source || !button || !shell) {
        return;
      }
      function loadVideo() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function startVideo() {
        shell.classList.add('is-loading');
        loadVideo();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            shell.classList.remove('is-loading');
            shell.classList.add('is-playing');
          }).catch(function () {
            shell.classList.remove('is-loading');
            shell.classList.remove('is-playing');
          });
        } else {
          shell.classList.remove('is-loading');
          shell.classList.add('is-playing');
        }
      }
      button.addEventListener('click', startVideo);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
