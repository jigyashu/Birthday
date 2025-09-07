/* ----------------------
  script.js - interactive logic
   - slideshow (page-by-page)
   - hearts messages
   - confetti on YES
   - finale: Yes/No + gift dropdown
   - submit to Google Form (no-cors POST)
   NOTE: Replace GOOGLE_FORM_ACTION and ENTRY_* values below.
-----------------------*/

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- SLIDESHOW ---------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const dotsContainer = document.getElementById('dots');

  let current = 0;
  let autoplay = true;
  let autoplayInterval = 6500;
  let autoplayTimer = null;

  // create dots
  slides.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => showSlide(i));
    dotsContainer.appendChild(d);
  });

  function showSlide(index){
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
    current = index;
  }

  function nextSlide(){ showSlide((current + 1) % slides.length); }
  function prevSlide(){ showSlide((current - 1 + slides.length) % slides.length); }

  nextBtn.addEventListener('click', () => { nextSlide(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prevSlide(); restartAutoplay(); });

  // keyboard arrows
  document.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight') { nextSlide(); restartAutoplay(); }
    if(e.key === 'ArrowLeft') { prevSlide(); restartAutoplay(); }
  });

  function startAutoplay(){
    if(autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, autoplayInterval);
  }
  function stopAutoplay(){ if(autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function restartAutoplay(){ stopAutoplay(); startAutoplay(); }
  // pause autoplay while hovering slideshow
  const slidesWrapper = document.querySelector('.slides-wrapper');
  slidesWrapper.addEventListener('mouseenter', stopAutoplay);
  slidesWrapper.addEventListener('mouseleave', startAutoplay);

  // start
  if(autoplay) startAutoplay();

  /* ---------- HEARTS ---------- */
  const hearts = document.querySelectorAll('.heart');
  const heartMsg = document.getElementById('heart-message');
  hearts.forEach(h => {
    h.addEventListener('click', () => {
      const m = h.getAttribute('data-msg');
      heartMsg.textContent = m;
    });
  });

  /* ---------- CONFETTI functions ---------- */
  const confettiContainer = document.querySelector('.confetti-container');

  function spawnConfettiPiece(){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = Math.random() * 12 + 8;
    el.style.width = Math.round(size) + 'px';
    el.style.height = Math.round(size * 1.1) + 'px';
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.top = '-50px';
    el.style.backgroundColor = `hsl(${Math.floor(Math.random()*360)}, 75%, 60%)`;
    el.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
    document.body.appendChild(el);

    const duration = 3000 + Math.random() * 2000;
    const finalX = Math.random() * 200 - 100;
    el.animate([
      { transform: `translateY(0px) rotate(0deg)`, opacity:1 },
      { transform: `translate(${finalX}px, ${window.innerHeight + 100}px) rotate(${Math.random()*720}deg)`, opacity:0.9 }
    ], { duration: duration, easing:'cubic-bezier(.2,.8,.2,1)' });

    setTimeout(()=> el.remove(), duration + 50);
  }

  let confettiTimer = null;
  function startConfetti(durationMs=5000, rate=150){
    if(confettiTimer) clearInterval(confettiTimer);
    confettiTimer = setInterval(spawnConfettiPiece, rate);
    setTimeout(()=> { if(confettiTimer) { clearInterval(confettiTimer); confettiTimer = null; } }, durationMs);
  }

  /* ---------- FINALE: reveal, yes/no, gift ---------- */
  const revealBtn = document.getElementById('reveal-btn');
  const questionContainer = document.getElementById('question-container');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const yesSurprise = document.getElementById('yes-surprise');
  const noMessage = document.getElementById('no-message');
  const giftDropdown = document.getElementById('gift-dropdown');
  const giftMsg = document.getElementById('gift-msg');
  const giftImage = document.getElementById('gift-image');
  const submitGiftBtn = document.getElementById('submit-gift');
  const bgMusic = document.getElementById('bg-music');

  // Play music only after user interacts (mobile autoplay policy)
  function tryPlayMusic(){ if(bgMusic && bgMusic.paused){ bgMusic.play().catch(()=>{}); } }
  document.body.addEventListener('click', tryPlayMusic, { once: true });

  revealBtn.addEventListener('click', () => {
    revealBtn.style.display = 'none';
    questionContainer.style.display = 'block';
  });

  // When she picks something in gift dropdown, show images/messages
  giftDropdown.addEventListener('change', () => {
    const val = giftDropdown.value;
    giftMsg.textContent = '';
    giftImage.innerHTML = '';
    if(!val) return;

    if(val === 'virtual-hug') giftMsg.textContent = "A big warm virtual hug is on its way 🤗";
    if(val === 'song') giftMsg.textContent = "I'll dedicate my favorite song to you 🎵";
    if(val === 'ice-cream-date') giftMsg.textContent = "Ice cream date — my treat! 🍦";
    if(val === 'earrings') {
      giftMsg.textContent = "I found these and thought they'd suit you 🎁";
      giftImage.innerHTML = `<a href="https://www.example.com/earrings" target="_blank" rel="noopener">
        <img src="assets/photos/earrings.jpg" alt="Gift earrings"></a>`;
    }
  });

  /* ---------- GOOGLE FORM SUBMISSION ----------
     Replace the placeholders below with your form values.
     - GOOGLE_FORM_ACTION: https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse
     - ENTRY_PROPOSAL: the name attribute for the "Will you be my girlfriend?" question
     - ENTRY_GIFT: the name attribute for the "Gift Selection" question
     - ENTRY_NAME: optional (a name field) if you want to collect her name
  --------------------------------------------*/
  const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/viewform";
  const ENTRY_PROPOSAL = "entry.1404707409"; // replace with your entry ID
  const ENTRY_GIFT     = "entry.1819396871_sentinel"; // replace with your entry ID
  const ENTRY_NAME     = "entry.3333333333"; // optional - replace or remove

  function submitToGoogleForm({proposal = "", gift = "", name = ""} = {}){
    // Build FormData with the entry keys
    try {
      const fd = new FormData();
      if(ENTRY_PROPOSAL) fd.append(ENTRY_PROPOSAL, proposal);
      if(ENTRY_GIFT)     fd.append(ENTRY_GIFT, gift);
      if(ENTRY_NAME)     fd.append(ENTRY_NAME, name);
      // Use fetch with no-cors so browser won't block cross-origin.
      fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: fd })
        .then(() => console.log('Submitted to Google Form (fire-and-forget).'))
        .catch(err => console.error('Error sending to Google Form:', err));
    } catch(e) {
      console.error('submitToGoogleForm error', e);
    }
  }

  // Yes handler
  yesBtn.addEventListener('click', () => {
    questionContainer.style.display = 'none';
    yesSurprise.style.display = 'block';
    // confetti for a bit
    startConfetti(7000, 100);

    // local friendly notice (only on her device)
    try { alert("Yay! Thanks for being honest — pick a surprise from the dropdown."); } catch(e){}

    // (Optionally) pre-submit the "Yes" answer now, if you prefer:
    // submitToGoogleForm({ proposal: "Yes", gift: "" });
    // We'll wait until she submits gift so you see concrete choice
  });

  // No handler
  noBtn.addEventListener('click', () => {
    questionContainer.style.display = 'none';
    noMessage.style.display = 'block';
    // gentle notification to your Google Form: record "No"
    submitToGoogleForm({ proposal: "No", gift: "" });
    try { alert("She said NO — the response was recorded."); } catch(e){}
  });

  // Submit gift button (this is when we record the final choice to Google Forms)
  submitGiftBtn.addEventListener('click', () => {
    const gift = giftDropdown.value;
    if(!gift){
      alert('Please select a surprise from the dropdown first.');
      return;
    }
    // Show in-page acknowledgement
    giftMsg.textContent = "Thanks — your choice was submitted 💖";
    // Record to Google Form: proposal = Yes, gift = selected
    submitToGoogleForm({ proposal: "Yes", gift: gift });
    try{ alert(`Choice submitted: ${gift}`); }catch(e){}
    // Disable the UI so she can't resubmit accidentally
    submitGiftBtn.disabled = true;
    giftDropdown.disabled = true;
  });

  /* ---------- END DOMContentLoaded  ---------- */
});
