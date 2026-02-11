(() => {
  const state = {
    config: null,
    query: ''
  };

  const dom = {
    title: document.getElementById('title'),
    logo: document.getElementById('logo'),
    themeToggle: document.getElementById('themeToggle'),
    search: document.getElementById('search'),
    content: document.getElementById('content'),
    year: document.getElementById('year'),
    brand: document.getElementById('brand')
  };

  function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getStoredTheme() {
    return localStorage.getItem('menu_theme');
  }

  function setStoredTheme(theme) {
    localStorage.setItem('menu_theme', theme);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && prefersDark())) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function cycleTheme() {
    const current = getStoredTheme() || state.config?.theme || 'system';
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    setStoredTheme(next);
    applyTheme(next);
  }

  function normalize(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }

  function filterGroups(groups, q) {
    if (!q) return groups;
    const n = normalize(q);
    return groups
      .map(group => {
        const items = (group.items || []).filter(item =>
          normalize(item.label).includes(n) || normalize(item.href).includes(n)
        );
        if (items.length === 0 && !normalize(group.title).includes(n)) return null;
        return { ...group, items: items.length ? items : group.items };
      })
      .filter(Boolean);
  }

  function createItem(item) {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-3 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-colors';
    a.target = item.target || '_self';
    a.rel = 'noopener noreferrer';
    const emoji = document.createElement('div');
    emoji.textContent = item.emoji || '👉';
    emoji.className = 'text-xl';
    const label = document.createElement('div');
    label.className = 'flex flex-col';
    const title = document.createElement('span');
    title.textContent = item.label;
    title.className = 'font-medium';
    const href = document.createElement('span');
    href.textContent = item.href;
    href.className = 'text-xs text-slate-500 dark:text-slate-400';
    label.appendChild(title);
    label.appendChild(href);
    a.appendChild(emoji);
    a.appendChild(label);
    return a;
  }

  function render() {
    if (!state.config) return;
    const groups = filterGroups(state.config.groups || [], state.query);
    dom.content.innerHTML = '';

    groups.forEach(group => {
      const section = document.createElement('section');
      const h2 = document.createElement('h2');
      h2.textContent = group.title || '';
      h2.className = 'mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200';
      section.appendChild(h2);

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
      (group.items || []).forEach(item => grid.appendChild(createItem(item)));
      section.appendChild(grid);
      dom.content.appendChild(section);
    });
  }

  async function loadConfig() {
    const res = await fetch('/assets/storage/menu.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Không tải được menu.json');
    const json = await res.json();
    state.config = json;
  }

  function initUI() {
    const c = state.config || {};
    dom.title.textContent = c.title || 'Menu';
    dom.brand.textContent = c.logo?.text || 'Brand';
    dom.logo.href = c.logo?.href || '#';
    dom.year.textContent = new Date().getFullYear().toString();
    const initialTheme = getStoredTheme() || c.theme || 'system';
    applyTheme(initialTheme);

    if (c.search === false) {
      dom.search.parentElement.style.display = 'none';
    }

    dom.themeToggle.addEventListener('click', cycleTheme);
    dom.search.addEventListener('input', (e) => {
      state.query = e.target.value;
      render();
    });
  }

  async function start() {
    try {
      await loadConfig();
      initUI();
      render();
    } catch (err) {
      console.error(err);
      dom.content.innerHTML = '<div class="text-red-600">Lỗi tải cấu hình menu.</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', start);
})();



