/* script.js - polished, single-flow interactive logic
   - page navigation (one section at a time)
   - memories slideshow (prev/next + dots)
   - hearts messages
   - confetti on YES
   - Yes/No proposal + gift dropdown
   - submit to Google Form (fetch no-cors + fallback hidden form submit)
   IMPORTANT: Replace GOOGLE_FORM_ACTION and ENTRY_* constants below.
*/

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PAGE NAVIGATION (one-by-one) ---------- */
  const pages = Array.from(document.querySelectorAll('.page'));
  const nextButtons = Array.from(document.querySelectorAll('.nav-next'));
  let currentPage = 0;

  function showPage(n){
    pages.forEach((p, i) => p.classList.toggle('active', i === n));
    currentPage = n;
    // try to pause background music when leaving, etc. (no-op here)
  }

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentPage < pages.length - 1) showPage(currentPage + 1);
    });
  });

  /* ---------- MEMORIES SLIDESHOW ---------- */
  const memSlides = Array.from(document.querySelectorAll('.mem-slide'));
  const memPrev = document.getElementById('mem-prev');
  const memNext = document.getElementById('mem-next');
  const memDots = document.getElementById('mem-dots');
  const slidesWrapper = document.getElementById('slides-wrapper');
  let memIndex = 0;
  let memAutoTimer = null;
  const memAutoInterval = 6000;

  // build dots
  memSlides.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => showMemSlide(i));
    memDots.appendChild(d);
  });

  function showMemSlide(i){
    memSlides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    Array.from(memDots.children).forEach((dot, idx) => dot.classList.toggle('active', idx === i));
    memIndex = i;
  }

  function nextMemSlide(){ showMemSlide((memIndex + 1) % memSlides.length); }
  function prevMemSlide(){ showMemSlide((memIndex - 1 + memSlides.length) % memSlides.length); }

  memNext.addEventListener('click', () => { nextMemSlide(); restartMemAuto(); });
  memPrev.addEventListener('click', () => { prevMemSlide(); restartMemAuto(); });

  // keyboard support while on the memories page
  document.addEventListener('keydown', e => {
    if (document.getElementById('page-memories').classList.contains('active')) {
      if (e.key === 'ArrowRight') nextMemSlide();
      if (e.key === 'ArrowLeft') prevMemSlide();
    }
  });

  // autoplay with pause on hover
  function startMemAuto(){ stopMemAuto(); memAutoTimer = setInterval(nextMemSlide, memAutoInterval); }
  function stopMemAuto(){ if(memAutoTimer) { clearInterval(memAutoTimer); memAutoTimer = null; } }
  function restartMemAuto(){ stopMemAuto(); startMemAuto(); }

  slidesWrapper.addEventListener('mouseenter', stopMemAuto);
  slidesWrapper.addEventListener('mouseleave', startMemAuto);

  if (memSlides.length > 1) startMemAuto();

  /* ---------- HEART MESSAGES ---------- */
  const hearts = Array.from(document.querySelectorAll('.heart'));
  const heartMessage = document.getElementById('heart-message');
  hearts.forEach(h => {
    h.addEventListener('click', () => heartMessage.textContent = h.dataset.msg || '');
  });

  /* ---------- CONFETTI (quick particle burst) ---------- */
  function spawnConfettiPiece(){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const w = 6 + Math.random() * 16;
    el.style.width = Math.round(w) + 'px';
    el.style.height = Math.round(w * 1.2) + 'px';
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.top = '-40px';
    el.style.background = `hsl(${Math.floor(Math.random()*360)},70%,60%)`;
    el.style.opacity = 0.95;
    document.body.appendChild(el);

    const duration = 2000 + Math.random() * 2000;
    const finalX = (Math.random() - 0.5) * 300;
    el.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${finalX}px, ${window.innerHeight + 200}px) rotate(${Math.random()*720}deg)`, opacity: 0.9 }
    ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });

    setTimeout(() => el.remove(), duration + 50);
  }

  function burstConfetti(duration = 4000, rate = 80){
    const t = setInterval(spawnConfettiPiece, rate);
    setTimeout(() => clearInterval(t), duration);
  }

  /* ---------- PROPOSAL + GIFT FLOW ---------- */
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const yesArea = document.getElementById('yes-area');
  const noArea = document.getElementById('no-area');
  const giftDropdown = document.getElementById('gift-dropdown');
  const giftMsg = document.getElementById('gift-msg');
  const giftImage = document.getElementById('gift-image');
  const btnSubmitGift = document.getElementById('btn-submit-gift');
  const bgMusic = document.getElementById('bg-music');

  // start music after first user gesture
  function tryPlayMusic(){ if(bgMusic && bgMusic.paused) bgMusic.play().catch(()=>{}); }
  document.body.addEventListener('click', tryPlayMusic, { once: true });

  btnYes.addEventListener('click', () => {
    yesArea.style.display = 'block';
    noArea.style.display = 'none';
    // confetti burst
    burstConfetti(5000, 60);
  });

  btnNo.addEventListener('click', () => {
    noArea.style.display = 'block';
    yesArea.style.display = 'none';
    // record "No" immediately (optional)
    submitForm({ proposal: 'No', gift: '' });
    // go to thanks after a short delay
    setTimeout(() => showPage(pages.indexOf(document.getElementById('page-thanks'))), 1300);
  });

  // gift dropdown preview
  giftDropdown.addEventListener('change', () => {
    giftMsg.textContent = '';
    giftImage.innerHTML = '';
    const v = giftDropdown.value;
    if (!v) return;
    if (v === 'virtual-hug') giftMsg.textContent = 'A big warm virtual hug coming your way 🤗';
    if (v === 'song') giftMsg.textContent = "I'll dedicate a special song just for you 🎵";
    if (v === 'ice-cream') giftMsg.textContent = 'Ice cream date — my treat! 🍦';
    if (v === 'earrings') {
      giftMsg.textContent = "These seemed perfect — click to view:";
      // put your gift image in assets/photos/earrings.jpg and adjust link below if you like
      giftImage.innerHTML = `<a href="https://www.example.com/earrings" target="_blank" rel="noopener">
        <img src="assets/photos/earrings.jpg" alt="Earrings gift" /></a>`;
    }
  });

  /* ---------- GOOGLE FORM SUBMISSION (robust) ---------- */
  // --- YOU MUST replace these with values from YOUR Google Form ---
  const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
  const ENTRY_PROPOSAL = "entry.1111111111"; // entry id for "Will you be my girlfriend?" question
  const ENTRY_GIFT     = "entry.2222222222"; // entry id for "Gift Selection" question
  const ENTRY_NAME     = ""; // optional: entry.3333333333 if you have a name field
  // -----------------------------------------------------------------

  // robust submit function: attempt fetch(no-cors) then fallback to hidden form submit (safer)
  function submitForm({ proposal = '', gift = '', name = '' } = {}) {
    if (!GOOGLE_FORM_ACTION.includes('formResponse')) {
      console.warn('Please update GOOGLE_FORM_ACTION to your formResponse URL (see instructions). Submission skipped.');
      return;
    }

    const fd = new FormData();
    if (ENTRY_PROPOSAL) fd.append(ENTRY_PROPOSAL, proposal);
    if (ENTRY_GIFT)     fd.append(ENTRY_GIFT, gift);
    if (ENTRY_NAME)     fd.append(ENTRY_NAME, name);

    // 1) try fetch no-cors (fire-and-forget)
    try {
      fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: fd })
        .then(() => console.log('Attempted submit via fetch (no-cors).'));
    } catch (e) {
      console.warn('fetch submit failed, will fallback to form submit', e);
    }

    // 2) fallback: build a hidden <form> and submit into hidden iframe (more reliable)
    try {
      const iframeName = 'hidden_iframe_' + Math.random().toString(36).slice(2);
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.action = GOOGLE_FORM_ACTION;
      form.method = 'POST';
      form.target = iframeName;
      form.style.display = 'none';

      if (ENTRY_PROPOSAL) {
        const i = document.createElement('input'); i.type = 'hidden'; i.name = ENTRY_PROPOSAL; i.value = proposal; form.appendChild(i);
      }
      if (ENTRY_GIFT) {
        const i = document.createElement('input'); i.type = 'hidden'; i.name = ENTRY_GIFT; i.value = gift; form.appendChild(i);
      }
      if (ENTRY_NAME && name) {
        const i = document.createElement('input'); i.type = 'hidden'; i.name = ENTRY_NAME; i.value = name; form.appendChild(i);
      }
      document.body.appendChild(form);
      form.submit();

      // cleanup after a bit
      setTimeout(() => { try { iframe.remove(); form.remove(); } catch(e){} }, 4000);
      console.log('Submitted via hidden form fallback.');
    } catch (err) {
      console.error('Fallback hidden form submit failed', err);
    }
  }

  // handle gift submission click
  btnSubmitGift.addEventListener('click', () => {
    const choice = giftDropdown.value;
    if (!choice) { alert('Please choose a surprise first.'); return; }
    // Save to Google Form: proposal = Yes, gift = choice
    submitForm({ proposal: 'Yes', gift: choice });

    // show thanks and disable controls
    giftMsg.textContent = 'Thanks — your choice was submitted 💖';
    giftDropdown.disabled = true;
    btnSubmitGift.disabled = true;

    // go to thank-you page after a short pause
    setTimeout(() => showPage(pages.indexOf(document.getElementById('page-thanks'))), 1200);
  });

  /* ---------- small helpers: ensure at least page 0 shown ---------- */
  showPage(0);

}); // DOMContentLoaded end
