// MK Events — shared behaviour: menu, motif switcher, gallery filters, lightbox, inquiry form.
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Motif (theme) ---------- */
  const MOTIF_KEY = 'mk-motif';
  function applyMotif(m) {
    if (m === 'emerald' || !m) document.documentElement.removeAttribute('data-motif');
    else document.documentElement.setAttribute('data-motif', m);
    document.querySelectorAll('[data-set-motif]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.setMotif === (m || 'emerald'))));
    const art = document.querySelector('[data-hero-img]');
    if (art) {
      const btn = document.querySelector(`[data-set-motif="${m || 'emerald'}"]`);
      if (btn && btn.dataset.img && art.getAttribute('src') !== btn.dataset.img) {
        art.style.opacity = 0;
        setTimeout(() => { art.src = btn.dataset.img; art.alt = btn.dataset.alt || ''; art.style.opacity = 1; }, 250);
      }
      const cap = document.querySelector('[data-hero-cap]');
      if (cap && btn) cap.textContent = btn.dataset.cap || '';
    }
  }
  applyMotif(store.get(MOTIF_KEY));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-set-motif]');
    if (!b) return;
    store.set(MOTIF_KEY, b.dataset.setMotif);
    applyMotif(b.dataset.setMotif);
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ---------- Preview notice ---------- */
  const bar = document.querySelector('.preview-bar');
  if (bar) {
    if (store.get('mk-preview-hidden') === '1') bar.remove();
    else bar.querySelector('button')?.addEventListener('click', () => { store.set('mk-preview-hidden', '1'); bar.remove(); });
  }

  /* ---------- Portfolio filters ---------- */
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const state = { motif: 'all', event: 'all' };
    const count = document.querySelector('[data-count]');
    const empty = document.querySelector('.empty');
    // Allow deep links: portfolio.html?motif=royal-tunnel
    const qs = new URLSearchParams(location.search);
    if (qs.get('motif')) state.motif = qs.get('motif');
    if (qs.get('event')) state.event = qs.get('event');

    function render() {
      let n = 0;
      gallery.querySelectorAll('.shot').forEach(s => {
        const ok = (state.motif === 'all' || s.dataset.motif === state.motif) &&
                   (state.event === 'all' || s.dataset.event.split(' ').includes(state.event));
        s.hidden = !ok; if (ok) n++;
      });
      document.querySelectorAll('[data-filter]').forEach(c =>
        c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value)));
      if (count) count.textContent = n === 1 ? '1 photo' : n + ' photos';
      if (empty) empty.hidden = n !== 0;
    }
    document.querySelectorAll('[data-filter]').forEach(c => c.addEventListener('click', () => {
      state[c.dataset.filter] = c.dataset.value; render();
    }));
    document.querySelector('[data-reset]')?.addEventListener('click', () => { state.motif = 'all'; state.event = 'all'; render(); });
    render();

    /* Lightbox */
    const lb = document.querySelector('.lightbox');
    const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p'), lbClose = lb.querySelector('button');
    let last = null;
    function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); last && last.focus(); }
    gallery.addEventListener('click', e => {
      const s = e.target.closest('.shot'); if (!s) return;
      last = s;
      const img = s.querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = s.querySelector('figcaption')?.textContent || '';
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lbClose.focus();
    });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* ---------- Smart Inquiry Form ---------- */
  const form = document.getElementById('inquiry');
  if (form) {
    const out = document.getElementById('summary');
    const status = document.querySelector('.status');
    const PHONE = form.dataset.phone;          // PLACEHOLDER: confirm the number with MK
    const MESSENGER = form.dataset.messenger;  // PLACEHOLDER: m.me link ng FB page

    // Preselect from ?package= or ?motif=
    const qs = new URLSearchParams(location.search);
    ['package', 'motif'].forEach(k => {
      const v = qs.get(k); if (!v) return;
      const el = form.querySelector(`[name="${k}"][value="${v}"]`) || form.querySelector(`select[name="${k}"]`);
      if (el && el.type === 'radio') el.checked = true; else if (el) el.value = v;
    });

    const label = (name) => {
      const el = form.querySelector(`[name="${name}"]:checked`) || form.querySelector(`[name="${name}"]`);
      if (!el) return '';
      if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text : '';
      if (el.type === 'radio') return el.checked ? el.dataset.label || el.value : '';
      return el.value.trim();
    };
    function fmtDate(v) {
      if (!v) return '';
      const d = new Date(v + 'T00:00:00');
      return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    }
    function message() {
      const lines = [
        'Hi MK Events! I\'d like to inquire.',
        '',
        `Name: ${label('name') || '—'}`,
        `Event: ${label('event') || '—'}`,
        `Date: ${fmtDate(form.date.value) || '—'}`,
        `Venue: ${label('venue') || '—'}`,
        `Guests: ${label('guests') || '—'}`,
        `Motif: ${label('motif') || '—'}`,
        `Package: ${label('package') || '—'}`,
        `Budget: ${label('budget') || '—'}`,
      ];
      const notes = label('notes'); if (notes) lines.push('', `Notes: ${notes}`);
      lines.push('', `Contact: ${label('contact') || '—'}`);
      return lines.join('\n');
    }
    function update() { out.textContent = message(); }
    form.addEventListener('input', update); form.addEventListener('change', update); update();

    function validate() {
      let ok = true;
      form.querySelectorAll('[data-required]').forEach(f => {
        const name = f.dataset.required;
        const err = form.querySelector(`[data-error="${name}"]`);
        const filled = !!label(name);
        if (err) err.hidden = filled;
        if (!filled && ok) { (form.querySelector(`[name="${name}"]`)).focus(); }
        ok = ok && filled;
      });
      if (!ok) status.textContent = 'Some details are missing. Check the highlighted fields.';
      return ok;
    }
    async function copy(text) {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
    }
    document.querySelector('[data-send="messenger"]').addEventListener('click', async () => {
      if (!validate()) return;
      const copied = await copy(message());
      status.textContent = copied
        ? 'Inquiry copied. Paste it into the Messenger chat that opens.'
        : 'Open Messenger and paste the inquiry shown above.';
      window.open(MESSENGER, '_blank', 'noopener');
    });
    document.querySelector('[data-send="sms"]').addEventListener('click', () => {
      if (!validate()) return;
      status.textContent = 'Opening your Messages app…';
      location.href = `sms:${PHONE}?&body=${encodeURIComponent(message())}`;
    });
    document.querySelector('[data-send="copy"]').addEventListener('click', async () => {
      status.textContent = (await copy(message())) ? 'Inquiry copied.' : 'Couldn\'t copy. Select the text above and copy it manually.';
    });
  }
})();
