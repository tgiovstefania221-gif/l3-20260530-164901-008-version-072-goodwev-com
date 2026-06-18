(function(){
  const input = document.querySelector('[data-search-input]');
  const grid = document.getElementById('searchResults');
  const count = document.getElementById('resultCount');
  const data = (window.MOVIE_CATALOG || []).slice();
  function card(item){
    return `<article class="movie-card"><a href="movie/${item.id}.html"><div class="movie-poster" style="background: linear-gradient(145deg, hsl(${(item.score * 3) % 360} 82% 54%), hsl(${(item.score * 3 + 65) % 360} 82% 46%) 55%, hsl(${(item.score * 3 + 110) % 360} 82% 38%));"><span>${item.title}</span></div><div class="movie-body"><h3 class="movie-title">${item.title}</h3><div class="meta-line"><span>${item.year}</span><span>${item.type}</span><span>${item.category}</span></div><p>${item.one_line}</p></div></a></article>`;
  }
  function render(list){
    const trimmed = list.slice(0, 60);
    if (grid) grid.innerHTML = trimmed.map(card).join('');
    if (count) count.textContent = `${list.length} 条结果`;
  }
  function filter(){
    const q = (input?.value || '').trim().toLowerCase();
    if (!q) { render(data.slice(0, 48)); return; }
    const results = data.filter(item => [item.title, item.region, item.type, item.genre, item.category, item.one_line, ...(item.tags || [])].join(' ').toLowerCase().includes(q));
    render(results.length ? results : data.slice(0, 24));
  }
  if (input){
    input.addEventListener('input', filter);
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    if (q) input.value = q;
    filter();
  }
})();
