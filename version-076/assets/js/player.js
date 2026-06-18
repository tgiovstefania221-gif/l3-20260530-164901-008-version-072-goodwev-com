(function () {
  window.initPlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var cover = document.getElementById("moviePlayLayer");
    var state = document.getElementById("moviePlayerState");
    if (!video || !cover || !streamUrl) {
      return;
    }
    var hls = null;
    var attached = false;
    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }
    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
              attached = false;
            }
          });
          window.setTimeout(resolve, 1600);
        });
      }
      video.src = streamUrl;
      return Promise.resolve();
    }
    function begin() {
      cover.classList.add("is-loading");
      setState("正在加载");
      attach()
        .then(function () {
          return video.play();
        })
        .then(function () {
          cover.classList.remove("is-loading");
          cover.classList.add("is-hidden");
        })
        .catch(function () {
          cover.classList.remove("is-loading");
          setState("点击重试");
        });
    }
    cover.addEventListener("click", begin);
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        cover.classList.remove("is-hidden");
      }
    });
  };
})();
