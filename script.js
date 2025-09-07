/* script.js
   - single-slide flow (photo/video) with secret heart message per slide
   - prev/next nav, dots, mobile swipe
   - final proposal: Yes/No -> gift -> submit to Google Form
   - robust: fetch + hidden form, auto-maps gift to exact form value
*/

document.addEventListener('DOMContentLoaded', () => {

  // ---------------- SLIDES ----------------
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let index = 0;

  slides.forEach((s, i) => {
    const dotsContainers = s.querySelectorAll('.dots');
    dotsContainers.forEach(dc => {
      dc.innerHTML = Array.from({length: total}).map((_, j) => `<span class="dot ${j===i? 'active':''}" data-dot="${j}"></span>`).join('');
      dc.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.dot, 10)));
      });
    });
  });

  function showSlide(i){
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
      const prev = s.querySelector('.prev');
      const next = s.querySelector('.next');
      if (prev) prev.disabled = (i === 0);
      if (next) next.disabled = (i === total -1);
      s.querySelectorAll('.dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.dot,10) === i));
    });
    index = i;
    document.querySelectorAll('video').forEach((v, idx) => {
      if (idx === i && !v.paused) return;
      try { v.pause(); } catch(e){}
    });
  }

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
  const swipeThreshold = 50;

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

  showSlide(0);

  // ---------------- GOOGLE FORM ----------------
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const yesArea = document.getElementById('yes-area');
  const noArea = document.getElementById('no-area');
  const giftSelect = document.getElementById('gift-select');
  const giftPreview = document.getElementById('gift-preview');
  const btnSubmit = document.getElementById('btn-submit');

  const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";
  const ENTRY_PROPOSAL = "entry.1819396871";            
  const ENTRY_PROPOSAL_SENTINEL = "entry.1819396871_sentinel";
  const ENTRY_GIFT     = "entry.1404707409";
  const ENTRY_NAME     = "";

  function getFormHiddenFields() {
    const fields = {};
    document.querySelectorAll('input[type="hidden"]').forEach(input => {
      if(input.name && input.value !== undefined) {
        fields[input.name] = input.value;
      }
    });
    return fields;
  }

  // get gift dropdown values from form
  function getGiftOptions() {
    const select = document.querySelector(`select[name="${ENTRY_GIFT}"]`);
    const options = [];
    if (select) {
      select.querySelectorAll('option').forEach(opt => {
        if(opt.value) options.push(opt.value.trim());
      });
    }
    return options;
  }

  function mapGiftSelection(value) {
    const options = getGiftOptions();
    if(!options.length) return value;
    const match = options.find(opt => opt.toLowerCase().replace(/\s+/g,'-') === value.toLowerCase());
    return match || options[0];
  }

  function submitToGoogle({ proposal='', gift='', name='' } = {}) {
    const hiddenFields = getFormHiddenFields();
    const fd = new FormData();

    if(ENTRY_PROPOSAL) fd.append(ENTRY_PROPOSAL, proposal);
    if(ENTRY_PROPOSAL_SENTINEL) fd.append(ENTRY_PROPOSAL_SENTINEL, proposal);
    if(ENTRY_GIFT) fd.append(ENTRY_GIFT, gift);
    if(ENTRY_NAME && name) fd.append(ENTRY_NAME, name);

    for(const [k,v] of Object.entries(hiddenFields)) {
      fd.append(k, v);
    }

    fetch(FORM_ACTION, { method:'POST', mode:'no-cors', body: fd })
      .then(()=> console.log('Form submitted successfully'))
      .catch(err => console.warn('Form submit error', err));

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

    fd.forEach((v,k) => {
      const ip = document.createElement('input');
      ip.type = 'hidden';
      ip.name = k;
      ip.value = v;
      form.appendChild(ip);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(()=>{ iframe.remove(); form.remove(); }, 3000);
  }

  // Yes/No handlers
  btnYes.addEventListener('click', () => {
    yesArea.style.display = 'block';
    noArea.style.display = 'none';
    burstConfetti(40);
    setTimeout(()=> giftSelect.scrollIntoView({behavior:'smooth', block:'center'}), 300);
  });

  btnNo.addEventListener('click', () => {
    yesArea.style.display = 'none';
    noArea.style.display = 'block';
    submitToGoogle({ proposal:'No', gift:'' });
  });

  // gift preview
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

  // final submit: Yes + gift
  btnSubmit.addEventListener('click', () => {
    const internalGift = giftSelect.value;
    const gift = mapGiftSelection(internalGift);

    submitToGoogle({ proposal:'Yes', gift: gift });
    btnSubmit.disabled = true;
    giftSelect.disabled = true;
    giftPreview.innerHTML += '<p style="margin-top:8px;color:green">Your choice was submitted — thank you! 💖</p>';
    setTimeout(()=> showSlide(slides.length - 1), 1000);
  });

  // ---------------- CONFETTI ----------------
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
