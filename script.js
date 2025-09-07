/* script.js
   - single-slide flow (photo/video) with secret heart message per slide
   - prev/next nav, dots, mobile swipe
   - final proposal: Yes/No -> gift -> submit to Google Form (robust: fetch + hidden form)
   - Uses your provided formId and entry IDs (both gift variants for safety)
*/

document.addEventListener('DOMContentLoaded', () => {
  // SLIDES
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let index = 0;

  // build dots for each slide (each slide has a dot region in its .nav-row)
  slides.forEach((s, i) => {
    const dotsContainers = s.querySelectorAll('.dots');
    dotsContainers.forEach(dc => {
      // only set dots in the nav-row of the slide (we'll update active state globally)
      dc.innerHTML = Array.from({length: total}).map((_, j) => `<span class="dot ${j===i? 'active':''}" data-dot="${j}"></span>`).join('');
      // attach click handlers
      dc.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const to = parseInt(e.target.dataset.dot, 10);
          showSlide(to);
        });
      });
    });
  });

  function showSlide(i){
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
      // enable/disable prev buttons
      const prev = s.querySelector('.prev');
      const next = s.querySelector('.next');
      if (prev) prev.disabled = (i === 0);
      if (next) next.disabled = (i === total -1);
      // update dots in this slide's nav-row to reflect overall active
      s.querySelectorAll('.dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.dot,10) === i));
    });
    index = i;
    // if the current slide contains a video, pause others
    document.querySelectorAll('video').forEach((v, idx) => {
      if (idx === i && v.paused === false) return;
      try { v.pause(); } catch(e){}
    });
  }

  // attach prev/next buttons on each slide
  slides.forEach((s, idx) => {
    const prev = s.querySelector('.prev');
    const next = s.querySelector('.next');
    if (prev) prev.addEventListener('click', () => showSlide(idx - 1));
    if (next) next.addEventListener('click', () => showSlide(idx + 1));
  });

  // reveal-heart per slide
  slides.forEach((s) => {
    const btn = s.querySelector('.reveal-heart');
    const secret = s.querySelector('.secret');
    const msg = s.dataset.msg || '';
    if(btn && secret) {
      btn.addEventListener('click', () => {
        // toggle
        const visible = secret.innerHTML.trim().length > 0;
        if(visible){
          secret.innerHTML = '';
          secret.setAttribute('aria-hidden', 'true');
          btn.textContent = '💖 Reveal';
        } else {
          secret.innerHTML = msg;
          secret.setAttribute('aria-hidden', 'false');
          btn.textContent = '💖 Hide';
        }
      });
    }
  });

  // swipe support for mobile
  let touchStartX = null;
  let touchStartY = null;
  const swipeThreshold = 50; // px

  document.addEventListener('touchstart', (e) => {
    if(e.touches && e.touches.length === 1){
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    } else {
      touchStartX = null;
      touchStartY = null;
    }
  }, {passive:true});

  document.addEventListener('touchend', (e) => {
    if(!touchStartX) return;
    const dx = (e.changedTouches[0].clientX - touchStartX);
    const dy = (e.changedTouches[0].clientY - touchStartY);
    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold){
      if(dx < 0) showSlide(index + 1);
      else showSlide(index - 1);
    }
    touchStartX = null;
    touchStartY = null;
  });

  // initial show
  showSlide(0);

  /* ---------------- PROPOSAL + FORM SUBMIT ---------------- */

  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const yesArea = document.getElementById('yes-area');
  const noArea = document.getElementById('no-area');
  const giftSelect = document.getElementById('gift-select');
  const giftPreview = document.getElementById('gift-preview');
  const btnSubmit = document.getElementById('btn-submit');

  // GOOGLE FORM constants (YOUR FORM)
  const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";
  const ENTRY_PROPOSAL = "entry.1404707409";        // Yes/No field (you provided)
  const ENTRY_GIFT_A   = "entry.1819396871";        // gift expected id
  const ENTRY_GIFT_B   = "entry.1819396871_sentinel"; // sentinel variant (some forms)
  // (OPTIONAL) if you added a name field, set ENTRY_NAME = "entry.XXXXX"; else leave empty
  const ENTRY_NAME     = "";

  function submitToGoogle({ proposal = '', gift = '', name = '' } = {}){
    // quick validation
    if(!FORM_ACTION || FORM_ACTION.indexOf('formResponse') === -1){
      console.warn('FORM_ACTION not set correctly. Please set the formResponse URL.');
      return;
    }

    // Build FormData for fetch attempt
    try {
      const fd = new FormData();
      if (ENTRY_PROPOSAL) fd.append(ENTRY_PROPOSAL, proposal);
      if (ENTRY_GIFT_A) fd.append(ENTRY_GIFT_A, gift);
      if (ENTRY_GIFT_B) fd.append(ENTRY_GIFT_B, gift);
      if (ENTRY_NAME && name) fd.append(ENTRY_NAME, name);

      // 1) try fetch (no-cors)
      fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body: fd })
        .then(() => console.log('fetch submitted (no-cors)'))
        .catch(err => console.warn('fetch submit err', err));
    } catch(e) {
      console.warn('fetch form submit failed', e);
    }

    // 2) fallback: hidden form + iframe submit
    try {
      const iframeName = 'hidden_iframe_' + Math.random().toString(36).slice(2);
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.action = FORM_ACTION;
      form.method = 'POST';
      form.target = iframeName;
      form.style.display = 'none';

      // append inputs (we add both gift variants so the right one is consumed)
      if (ENTRY_PROPOSAL) {
        const ip = document.createElement('input'); ip.type='hidden'; ip.name = ENTRY_PROPOSAL; ip.value = proposal; form.appendChild(ip);
      }
      if (ENTRY_GIFT_A) {
        const ig = document.createElement('input'); ig.type='hidden'; ig.name = ENTRY_GIFT_A; ig.value = gift; form.appendChild(ig);
      }
      if (ENTRY_GIFT_B) {
        const ig2 = document.createElement('input'); ig2.type='hidden'; ig2.name = ENTRY_GIFT_B; ig2.value = gift; form.appendChild(ig2);
      }
      if (ENTRY_NAME && name) {
        const iname = document.createElement('input'); iname.type='hidden'; iname.name = ENTRY_NAME; iname.value = name; form.appendChild(iname);
      }

      document.body.appendChild(form);
      form.submit();

      // cleanup
      setTimeout(()=>{ try { iframe.remove(); form.remove(); } catch(e){} }, 3000);
      console.log('Hidden form fallback submitted.');
    } catch(err){
      console.error('Hidden form fallback failed', err);
    }
  }

  // Yes handler: reveal gift area (don't submit yet)
  btnYes.addEventListener('click', () => {
    yesArea.style.display = 'block';
    noArea.style.display = 'none';
    // gentle confetti burst visual
    burstConfetti(40);
    // scroll to gift area if on mobile
    setTimeout(()=> document.getElementById('gift-select').scrollIntoView({behavior:'smooth', block:'center'}), 300);
  });

  // No handler: submit "No" immediately and show no-area
  btnNo.addEventListener('click', () => {
    yesArea.style.display = 'none';
    noArea.style.display = 'block';
    submitToGoogle({ proposal: 'No', gift: '' });
    // move to the end (optional)
    setTimeout(()=> {
      // show thank-you / last slide - let's find last slide (index = total-1)
      // keep user on the no-area
    }, 600);
  });

  // preview gift visuals
  giftSelect.addEventListener('change', () => {
    const v = giftSelect.value;
    giftPreview.innerHTML = '';
    if(!v) return;
    if(v === 'earrings') {
      giftPreview.innerHTML = `<p>I thought these would look lovely:</p>
        <a href="https://www.example.com/earrings" target="_blank" rel="noopener">
          <img src="assets/photos/earrings.jpg" alt="earrings"></a>`;
    } else if(v === 'virtual-hug') {
      giftPreview.textContent = 'A big warm virtual hug 🤗';
    } else if(v === 'song') {
      giftPreview.textContent = "I'll dedicate my favorite song to you 🎵";
    } else if(v === 'ice-cream') {
      giftPreview.textContent = 'Ice cream date — my treat 🍦';
    }
  });

  // final submit: send "Yes" + gift to Google Form
  btnSubmit.addEventListener('click', () => {
    const gift = giftSelect.value;
    if (!gift) return alert('Please pick a gift before submitting.');
    submitToGoogle({ proposal: 'Yes', gift: gift });
    // disable UI and show thanks
    btnSubmit.disabled = true;
    giftSelect.disabled = true;
    giftPreview.innerHTML += '<p style="margin-top:8px;color:green">Your choice was submitted — thank you! 💖</p>';
    // optional: move to final "thanks" slide (last slide)
    setTimeout(()=> showSlide(slides.length - 1), 1000);
  });

  /* ---------------- simple confetti burst ---------------- */
  function spawnPiece() {
    const el = document.createElement('div');
    el.className = 'confetti';
    const w = 6 + Math.random()*12;
    el.style.width = w + 'px';
    el.style.height = (w*1.2) + 'px';
    el.style.left = Math.random()*window.innerWidth + 'px';
    el.style.background = `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`;
    el.style.top = '-10px';
    document.body.appendChild(el);
    const dur = 1500 + Math.random()*2000;
    const dx = (Math.random()-0.5)*200;
    el.animate([{ transform:'translateY(0) rotate(0deg)', opacity:1 }, { transform: `translate(${dx}px, ${window.innerHeight + 200}px) rotate(${Math.random()*720}deg)`, opacity:0.9 }], { duration: dur, easing:'cubic-bezier(.2,.8,.2,1)' });
    setTimeout(()=> el.remove(), dur+50);
  }

  function burstConfetti(count=30, interval=25){
    for(let i=0;i<count;i++){
      setTimeout(spawnPiece, i*interval);
    }
  }

});
