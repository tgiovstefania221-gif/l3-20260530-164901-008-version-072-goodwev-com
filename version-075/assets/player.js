(function () {
    function initMoviePlayer(source) {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('player-button');
        var shell = document.getElementById('player-shell');
        var loaded = false;
        var hls = null;

        if (!video || !button || !shell || !source) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            attachSource();
            shell.classList.add('is-playing');
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
