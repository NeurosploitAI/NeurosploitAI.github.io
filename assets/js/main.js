/* ============================================================
   NeuroSploit — landing interactions
   ============================================================ */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav scroll state + burger ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1400, t0 = performance.now();
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  } else counters.forEach(countUp);

  /* ---------- agent bars fill ---------- */
  const bars = document.querySelectorAll('.ab-fill');
  if ('IntersectionObserver' in window) {
    const bio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.pct + '%'; bio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => bio.observe(b));
  } else bars.forEach(b => b.style.width = b.dataset.pct + '%');

  /* ---------- card mouse glow ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const old = btn.textContent;
        btn.textContent = 'copied ✓';
        setTimeout(() => (btn.textContent = old), 1600);
      } catch (_) { /* clipboard blocked */ }
    });
  });

  /* ---------- animated terminal ---------- */
  const term = document.getElementById('term');
  if (term) {
    const lines = [
      { t: '<span class="prompt">$</span> <span class="cmd">neurosploit run http://testphp.vulnweb.com/ \\</span>', d: 18 },
      { t: '    <span class="cmd">--subscription --model anthropic:claude-opus-4-8 -v</span>', d: 14 },
      { t: '', d: 120 },
      { t: '<span class="muted">[recon]</span>    mapping surface · curl · nmap · ffuf', d: 10 },
      { t: '<span class="muted">[select]</span>   matched <span class="vio">14</span> agents from 486 (recon-driven)', d: 10 },
      { t: '<span class="muted">[exploit]</span>  14 agents · parallel ReAct loops', d: 10 },
      { t: '  <span class="cya">›</span> sqli_error_based      <span class="warn">candidate</span>', d: 40 },
      { t: '  <span class="cya">›</span> idor_object_ref       <span class="warn">candidate</span>', d: 40 },
      { t: '  <span class="cya">›</span> xss_reflected         <span class="warn">candidate</span>', d: 40 },
      { t: '<span class="muted">[wire]</span>     re-sent 3 claims · <span class="ok">2 reproduced</span> · 1 unverifiable', d: 20 },
      { t: '<span class="muted">[vote]</span>     gpt-5.5 + gemini-3 adjudicate', d: 20 },
      { t: '  <span class="ok">✓ confirmed</span> <span class="crit">CRITICAL</span>  SQLi → RCE  <span class="muted">CWE-89</span>', d: 60 },
      { t: '  <span class="ok">✓ confirmed</span> <span class="warn">HIGH</span>      IDOR         <span class="muted">CWE-639</span>', d: 60 },
      { t: '<span class="muted">[chain]</span>    SQLi → RCE → LPE  <span class="muted">(each stage proven)</span>', d: 30 },
      { t: '<span class="muted">[report]</span>   runs/ns-2605-testphp/ · html · pdf · sarif', d: 20 },
      { t: '', d: 40 },
      { t: '<span class="ok">◀ run #1 done — 2 validated finding(s)</span>', d: 10 },
    ];

    if (reduceMotion) {
      term.innerHTML = lines.map(l => l.t).join('\n');
    } else {
      let li = 0;
      function typeLine() {
        if (li >= lines.length) {
          // loop subtly after a pause
          setTimeout(() => { term.innerHTML = ''; li = 0; typeLine(); }, 6500);
          return;
        }
        const line = lines[li++];
        const div = document.createElement('div');
        div.innerHTML = line.t + (li === lines.length ? '<span class="cursor"></span>' : '');
        term.appendChild(div);
        // keep a blinking cursor on the last appended line only
        term.querySelectorAll('.cursor').forEach((c, i, arr) => { if (i < arr.length - 1) c.remove(); });
        term.scrollTop = term.scrollHeight;
        setTimeout(typeLine, 180 + line.d);
      }
      // start when hero terminal visible
      if ('IntersectionObserver' in window) {
        const tio = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) { typeLine(); tio.disconnect(); }
        }, { threshold: 0.3 });
        tio.observe(term);
      } else typeLine();
    }
  }

  /* ---------- neural network canvas ---------- */
  const canvas = document.getElementById('neural-canvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, nodes = [], pulses = [], raf;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      const density = Math.max(26, Math.min(64, Math.floor((w * h) / 22000)));
      nodes = [];
      for (let i = 0; i < density; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 1.0,
        });
      }
    }

    const LINK = 150;
    function frame() {
      ctx.clearRect(0, 0, w, h);

      // move
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            const al = (1 - dist / LINK) * 0.5;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(139,92,246,${al})`);
            grad.addColorStop(1, `rgba(34,211,238,${al})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(196,181,253,0.85)';
        ctx.fill();
      }

      // pulses traveling along random links
      if (pulses.length < 6 && Math.random() < 0.05 && nodes.length > 2) {
        const a = nodes[(Math.random() * nodes.length) | 0];
        const b = nodes[(Math.random() * nodes.length) | 0];
        if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < LINK * 1.4) pulses.push({ a, b, t: 0 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += 0.018;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,211,238,0.95)';
        ctx.shadowColor = 'rgba(34,211,238,0.9)'; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(frame);
    }

    // pointer repulsion
    let mouse = { x: -999, y: -999 };
    canvas.parentElement.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 90 && d > 0) { n.vx += (dx / d) * 0.14; n.vy += (dy / d) * 0.14; }
      }
    });

    resize();
    frame();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 160); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else frame();
    });
  }

  /* ---------- active nav link on scroll ---------- */
  const sections = ['thesis', 'how', 'modes', 'features', 'agents'].map(id => document.getElementById(id)).filter(Boolean);
  const linkFor = {};
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) linkFor[href.slice(1)] = a;
  });
  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          Object.values(linkFor).forEach(a => a.style.color = '');
          const a = linkFor[e.target.id];
          if (a) a.style.color = 'var(--text)';
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => sio.observe(s));
  }
})();
