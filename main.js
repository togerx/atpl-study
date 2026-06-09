/* ═══════════════════════════════════════════════════════════
   ATPL STUDY — main.js
   Tout est piloté par cours.json — ne jamais toucher la sidebar
   manuellement. Ajouter un cours = l'ajouter dans cours.json.
═══════════════════════════════════════════════════════════ */

// ── Résoudre le chemin racine selon la profondeur de la page ──
const _segs    = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
const _hasHtml = _segs.length > 0 && _segs[_segs.length - 1].endsWith('.html');
const depth    = _hasHtml ? _segs.length - 2 : _segs.length - 1;
const ROOT     = depth <= 0 ? './' : '../'.repeat(depth);

// ── Charger cours.json et tout initialiser ─────────────────
fetch(ROOT + 'cours.json')
  .then(r => r.json())
  .then(data => {
    buildSidebar(data.matieres);
    buildSearch(data.matieres);
    initNavigation(data.matieres);
    initPage();
  })
  .catch(() => {
    // Fallback si fetch bloqué (file:// sur certains OS) : mode dégradé
    initPage();
  });

// ══════════════════════════════════════════════════════════
// SIDEBAR — construite dynamiquement depuis cours.json
// ══════════════════════════════════════════════════════════
function buildSidebar(matieres) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Détecter le cours actif via data-code sur <main>
  const activePage = document.querySelector('main[data-code]');
  const activeCode = activePage?.dataset.code || '';
  const activeMat  = activePage?.dataset.matiere || '';

  sidebar.innerHTML = matieres.map(mat => {
    const isActiveMat = mat.id === activeMat;
    const hasCours    = mat.cours.length > 0;

    const items = mat.cours.map(c => {
      const isActive = c.code === activeCode;
      // Chemin relatif vers le fichier du cours
      const href = `${ROOT}${mat.id}/${c.code}.html`;
      return `
        <a class="sidebar-cours-item${isActive ? ' active' : ''}" href="${href}">
          <span class="code">${c.code}</span>${c.titre.split('—')[0].trim()}
        </a>`;
    }).join('');

    return `
      <div class="sidebar-section">
        <div class="sidebar-matiere${isActiveMat ? ' active open' : ''}${hasCours ? '' : ' empty'}">
          <span>${mat.emoji}</span> ${mat.nom}
          ${hasCours ? `<span class="badge">${mat.cours.length}</span>` : ''}
          ${hasCours ? '<span class="chevron">▶</span>' : ''}
        </div>
        ${hasCours ? `<div class="sidebar-cours-list${isActiveMat ? ' open' : ''}">${items}</div>` : ''}
      </div>`;
  }).join('');

  // Bind accordéon
  sidebar.querySelectorAll('.sidebar-matiere').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('.sidebar-section');
      const list    = section.querySelector('.sidebar-cours-list');
      if (!list) return;
      const isOpen  = list.classList.contains('open');
      sidebar.querySelectorAll('.sidebar-cours-list').forEach(l => l.classList.remove('open'));
      sidebar.querySelectorAll('.sidebar-matiere').forEach(b => b.classList.remove('open', 'active'));
      if (!isOpen) { list.classList.add('open'); btn.classList.add('open', 'active'); }
    });
  });
}

// ══════════════════════════════════════════════════════════
// NAVIGATION PREV / NEXT — calculée depuis cours.json
// ══════════════════════════════════════════════════════════
function initNavigation(matieres) {
  const navPrev = document.getElementById('nav-prev');
  const navNext = document.getElementById('nav-next');
  if (!navPrev && !navNext) return;

  const activePage = document.querySelector('main[data-code]');
  const activeCode = activePage?.dataset.code || '';

  // Aplatir tous les cours dans l'ordre
  const all = [];
  matieres.forEach(mat => mat.cours.forEach(c => all.push({ ...c, matiere: mat.id })));

  const idx = all.findIndex(c => c.code === activeCode);
  if (idx < 0) return;

  const prev = all[idx - 1];
  const next = all[idx + 1];

const hrefFor = (c) => `${ROOT}${c.matiere}/${c.code}.html`;

  if (navPrev) {
    if (prev) {
      navPrev.href = hrefFor(prev);
      navPrev.innerHTML = `← ${prev.code} — ${prev.titre.split('—')[0].trim()}`;
      navPrev.style.display = 'flex';
    } else {
      navPrev.style.visibility = 'hidden';
    }
  }
  if (navNext) {
    if (next) {
      navNext.href = hrefFor(next);
      navNext.innerHTML = `${next.code} — ${next.titre.split('—')[0].trim()} →`;
      navNext.style.display = 'flex';
    } else {
      navNext.style.visibility = 'hidden';
    }
  }
}

// ══════════════════════════════════════════════════════════
// RECHERCHE Ctrl+K
// ══════════════════════════════════════════════════════════
let SEARCH_INDEX = [];

function buildSearch(matieres) {
  SEARCH_INDEX = [];
  matieres.forEach(mat => {
    mat.cours.forEach(c => {
      SEARCH_INDEX.push({
        code:    c.code,
        matiere: mat.nom,
        titre:   c.titre,
        url:     ROOT + mat.id + '/' + c.code + '.html'
      });
    });
  });
}

function renderSearchResults(query) {
  const container = document.getElementById('search-results');
  if (!container) return;
  if (!query.trim()) { container.innerHTML = ''; return; }
  const q = query.toLowerCase();
  const results = SEARCH_INDEX.filter(r =>
    r.code.toLowerCase().includes(q) ||
    r.titre.toLowerCase().includes(q) ||
    r.matiere.toLowerCase().includes(q)
  ).slice(0, 8);
  if (!results.length) {
    container.innerHTML = '<p style="padding:1rem 1.25rem;color:var(--text-muted);font-size:.85rem;">Aucun résultat</p>';
    return;
  }
  container.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="location.href='${r.url}'">
      <span class="code">${r.code}</span>
      <div class="search-result-text">
        <strong>${r.titre}</strong>
        <p>${r.matiere}</p>
      </div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════════════
// PAGE d'ACCUEIL — grille matières dynamique
// ══════════════════════════════════════════════════════════
function buildHomePage(matieres) {
  const grid = document.getElementById('matieres-grid');
  if (!grid) return;

  // Stats globales
  const totalCours = matieres.reduce((s, m) => s + m.cours.length, 0);
  document.getElementById('stat-cours').textContent  = totalCours;

  grid.innerHTML = matieres.map(mat => {
    const n = mat.cours.length;
    return `
    <a href="${mat.id}/index.html" class="matiere-card">
      <div class="matiere-icon" style="background:${mat.couleur}">${mat.emoji}</div>
      <div>
        <div class="matiere-name">${mat.nom}</div>
        <div class="matiere-desc">${mat.description}</div>
      </div>
      <div class="matiere-footer">
        <span class="matiere-count">${n === 0 ? 'Aucun cours' : n + ' cours'}</span>
        <span class="matiere-arrow">→</span>
      </div>
    </a>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
// PAGE MATIÈRE — liste cours dynamique
// ══════════════════════════════════════════════════════════
function buildMatierePage(matieres) {
  const list = document.getElementById('cours-list');
  if (!list) return;

  const matiereId = document.querySelector('[data-matiere-id]')?.dataset.matiereId;
  const mat = matieres.find(m => m.id === matiereId);
  if (!mat) return;

  document.title = `${mat.nom} — ATPL Study`;
  document.getElementById('matiere-title').textContent = mat.nom;
  document.getElementById('matiere-desc').textContent  =
    `${mat.description} — ${mat.cours.length} cours disponible${mat.cours.length > 1 ? 's' : ''}`;
  document.getElementById('topbar-subtitle').textContent = mat.nom;

  list.innerHTML = mat.cours.map((c, i) => `
    <a href="${ROOT}${mat.id}/${c.code}.html" class="cours-list-item">
      <span class="cours-list-code">${c.code}</span>
      <div class="cours-list-body">
        <div class="cours-list-titre">${c.titre}</div>
        <div class="cours-list-desc">${c.description}</div>
      </div>
      <span class="cours-list-arrow">→</span>
    </a>`).join('') || '<p style="color:var(--text-muted);padding:1rem 0">Aucun cours dans cette matière pour l\'instant.</p>';
}

// ══════════════════════════════════════════════════════════
// INIT PAGE — tabs, TOC, progress, QC, sidebar toggle mobile
// ══════════════════════════════════════════════════════════
function initPage() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + target)?.classList.add('active');
    });
  });

  // Quick Check
  document.querySelectorAll('.qc-item').forEach(item => {
    item.addEventListener('click', () => {
      const answer = item.querySelector('.qc-answer');
      const open   = item.classList.contains('revealed');
      item.classList.toggle('revealed', !open);
      answer?.classList.toggle('visible', !open);
    });
  });

  // TOC highlight
  const tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length) {
    const headings = document.querySelectorAll('.content h1[id], .content h2[id], .content h3[id]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-56px 0px -70% 0px' });
    headings.forEach(h => obs.observe(h));
  }

  // TOC auto-générée si #toc-auto présent
  const tocAuto = document.getElementById('toc-auto');
  if (tocAuto) {
    const headings = document.querySelectorAll('.content h1[id], .content h2[id], .content h3[id]');
    tocAuto.innerHTML = Array.from(headings).map(h => {
      const level = h.tagName === 'H1' ? 'h2' : h.tagName === 'H2' ? 'h2' : 'h3';
      return `<a href="#${h.id}" class="${level}">${h.textContent}</a>`;
    }).join('');
  }

  // Barre de progression lecture
  const fill = document.querySelector('.progress-bar-fill');
  if (fill) {
    window.addEventListener('scroll', () => {
      const main = document.querySelector('.main');
      if (!main) return;
      const pct = Math.min(100, Math.max(0,
        ((window.scrollY - main.offsetTop) / (main.scrollHeight - window.innerHeight)) * 100));
      fill.style.width = pct + '%';
    }, { passive: true });
  }

  // Recherche
  const overlay    = document.getElementById('search-overlay');
  const searchInp  = document.getElementById('search-input');
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });
  document.querySelector('.topbar-search')?.addEventListener('click', openSearch);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  searchInp?.addEventListener('input', e => renderSearchResults(e.target.value));

  // Mobile sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });
}

function openSearch() {
  const overlay   = document.getElementById('search-overlay');
  const searchInp = document.getElementById('search-input');
  overlay?.classList.add('open');
  setTimeout(() => searchInp?.focus(), 50);
}
function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('open');
  const inp = document.getElementById('search-input');
  if (inp) inp.value = '';
  renderSearchResults('');
}

// ── Dispatcher selon type de page ─────────────────────────
fetch(ROOT + 'cours.json')
  .then(r => r.json())
  .then(data => {
    if (document.getElementById('matieres-grid')) buildHomePage(data.matieres);
    if (document.getElementById('cours-list'))    buildMatierePage(data.matieres);
  })
  .catch(() => {});
