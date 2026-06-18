(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var params = new URLSearchParams(window.location.search);
    var initial = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var grid = document.querySelector('[data-search-grid]');
    var status = document.querySelector('[data-search-status]');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.dataset.search || '').toLowerCase();
        card.hidden = value.length > 0 && text.indexOf(value) === -1;
      });
      if (status) {
        status.textContent = value ? '已为你筛选相关影片' : '输入关键词即可筛选影片';
      }
    }
    input.value = initial;
    input.addEventListener('input', apply);
    apply();
  });
})();
