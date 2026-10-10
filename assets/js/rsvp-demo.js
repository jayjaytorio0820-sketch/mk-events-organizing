// RSVP demo — sample couple wedding site (bonus for MK packages).
// Demo only: RSVPs live in memory and reset on reload. The real version would save to a database.
(function () {
  const WEDDING = new Date('2027-02-20T15:00:00+08:00'); // sample date

  const cd = document.querySelector('.countdown');
  function tick() {
    let ms = Math.max(0, WEDDING - new Date());
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4);
    cd.querySelector('[data-d]').textContent = d;
    cd.querySelector('[data-h]').textContent = h;
    cd.querySelector('[data-m]').textContent = m;
  }
  if (cd) { tick(); setInterval(tick, 30000); }

  const form = document.getElementById('rsvp');
  const done = document.querySelector('.rsvp-done');
  const tally = { yes: 0, no: 0, seats: 0 };
  // Sample responses so the couple's dashboard view isn't empty
  [['yes', 2], ['yes', 1], ['no', 0], ['yes', 3]].forEach(([a, s]) => { tally[a]++; tally.seats += s; });

  function renderTally() {
    document.querySelector('[data-t-yes]').textContent = tally.yes + ' attending';
    document.querySelector('[data-t-no]').textContent = tally.no + ' declined';
    document.querySelector('[data-t-seats]').textContent = tally.seats + ' seats needed';
  }
  renderTally();

  form.addEventListener('change', e => {
    if (e.target.name === 'attend') {
      document.getElementById('seats-field').hidden = e.target.value !== 'yes';
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.guest.value.trim();
    const attend = form.querySelector('[name="attend"]:checked');
    const err = form.querySelector('.error');
    if (!name || !attend) { err.hidden = false; (name ? form.querySelector('[name="attend"]') : form.guest).focus(); return; }
    err.hidden = true;
    const seats = attend.value === 'yes' ? Number(form.seats.value) : 0;
    tally[attend.value]++; tally.seats += seats;
    renderTally();
    form.hidden = true;
    done.hidden = false;
    done.querySelector('h3').textContent = attend.value === 'yes'
      ? `Thank you, ${name}! See you in February.`
      : `Thank you for replying, ${name}. You'll be missed.`;
    done.querySelector('[data-detail]').textContent = attend.value === 'yes'
      ? `We've reserved ${seats} ${seats === 1 ? 'seat' : 'seats'} for you.`
      : 'The couple has received your reply.';
    done.focus();
  });

  document.querySelector('[data-rsvp-again]').addEventListener('click', () => {
    form.reset(); document.getElementById('seats-field').hidden = true;
    form.hidden = false; done.hidden = true; form.guest.focus();
  });
})();
