/* ============================================================
   NeuroSploit — docs interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const old = btn.textContent;
        btn.textContent = 'copied ✓';
        setTimeout(() => (btn.textContent = old), 1500);
      } catch (_) {}
    });
  });

  /* ---------- mobile sidebar ---------- */
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const burger = document.getElementById('burger');
  function closeSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
  if (burger) {
    burger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      scrim.classList.toggle('show');
    });
  }
  if (scrim) scrim.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSidebar));

  /* ---------- build right-hand TOC from section headings ---------- */
  const tocNav = document.getElementById('tocNav');
  const sections = Array.from(document.querySelectorAll('.content section[id]'));
  if (tocNav) {
    sections.forEach(sec => {
      const h2 = sec.querySelector('h2');
      if (!h2) return;
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      a.textContent = h2.textContent.replace('#', '').trim();
      a.dataset.target = sec.id;
      tocNav.appendChild(a);
    });
  }

  /* ---------- scroll-spy for sidebar + TOC ---------- */
  const sidebarLinks = {};
  document.querySelectorAll('.sidebar a[href^="#"]').forEach(a => {
    sidebarLinks[a.getAttribute('href').slice(1)] = a;
  });
  const tocLinks = {};
  document.querySelectorAll('#tocNav a').forEach(a => { tocLinks[a.dataset.target] = a; });

  function setActive(id) {
    Object.values(sidebarLinks).forEach(a => a.classList.remove('active'));
    Object.values(tocLinks).forEach(a => a.classList.remove('active'));
    if (sidebarLinks[id]) sidebarLinks[id].classList.add('active');
    if (tocLinks[id]) tocLinks[id].classList.add('active');
  }

  if ('IntersectionObserver' in window && sections.length) {
    let visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      // choose the topmost visible section
      const ordered = sections.map(s => s.id).filter(id => visible.has(id));
      if (ordered.length) setActive(ordered[0]);
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- scroll active sidebar link into view ---------- */
  const sidebarEl = document.getElementById('sidebar');
  let lastActive = null;
  const activeWatcher = new MutationObserver(() => {
    const cur = sidebarEl.querySelector('a.active');
    if (cur && cur !== lastActive) {
      lastActive = cur;
      const r = cur.getBoundingClientRect(), sr = sidebarEl.getBoundingClientRect();
      if (r.top < sr.top + 60 || r.bottom > sr.bottom - 20) {
        cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  });
  activeWatcher.observe(sidebarEl, { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ---------- sidebar search filter ---------- */
  const search = document.getElementById('docSearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.nav-group').forEach(group => {
        let any = false;
        group.querySelectorAll('a').forEach(a => {
          const match = !q || a.textContent.toLowerCase().includes(q);
          a.style.display = match ? '' : 'none';
          if (match) any = true;
        });
        group.style.display = any ? '' : 'none';
      });
    });
    // keyboard shortcut: "/" focuses search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== search) {
        e.preventDefault(); search.focus();
      }
      if (e.key === 'Escape' && document.activeElement === search) {
        search.value = ''; search.dispatchEvent(new Event('input')); search.blur();
      }
    });
  }
})();
