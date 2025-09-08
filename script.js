/* Updated script.js
   - prevents auto-submit on No
   - ensures Submit buttons work for Yes and No flows
   - uses the provided entry IDs:
      ENTRY_PROPOSAL = entry.1819396871
      ENTRY_GIFT_YES = entry.1404707409
      ENTRY_GIFT_NO = entry.101708814
*/

document.addEventListener("DOMContentLoaded", () => {
  // ---------- slides + navigation ----------
  const slides = Array.from(document.querySelectorAll(".slide"));
  let index = 0;

  function renderDots(activeIndex) {
    slides.forEach((s, i) => {
      const dots = s.querySelector(".dots");
      if (!dots) return;
      dots.innerHTML = slides
        .map((_, j) => `<span class="dot ${j === activeIndex ? "active" : ""}" data-dot="${j}"></span>`)
        .join("");
      // attach dot click handlers (one-time)
      dots.querySelectorAll(".dot").forEach((d) => {
        d.onclick = () => showSlide(parseInt(d.dataset.dot, 10));
      });
    });
  }

  function showSlide(i) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
      const prev = s.querySelector(".prev");
      const next = s.querySelector(".next");
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === slides.length - 1;
    });
    index = i;
    renderDots(index);

    // pause all videos except the one in view
    document.querySelectorAll("video").forEach((v, idx) => {
      if (idx !== index) try { v.pause(); } catch (e) {}
    });
  }

  // attach prev/next per slide
  slides.forEach((s, i) => {
    const prev = s.querySelector(".prev");
    const next = s.querySelector(".next");
    if (prev) prev.addEventListener("click", () => showSlide(i - 1));
    if (next) next.addEventListener("click", () => showSlide(i + 1));
  });

  // swipe support
  let touchStartX = null, touchStartY = null;
  const swipeThreshold = 40;
  document.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!touchStartX) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
      if (dx < 0) showSlide(index + 1);
      else showSlide(index - 1);
    }
    touchStartX = null; touchStartY = null;
  });

  // initial render
  showSlide(0);

  // ---------- reveal hearts ----------
  document.querySelectorAll(".reveal-heart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slide = btn.closest(".slide");
      const secret = slide.querySelector(".secret");
      const msg = slide.dataset.msg || "";
      if (!secret) return;
      if (secret.textContent && secret.textContent.trim().length > 0) {
        secret.textContent = "";
        btn.textContent = "💖 Reveal";
        secret.setAttribute("aria-hidden", "true");
      } else {
        secret.textContent = msg;
        btn.textContent = "💖 Hide";
        secret.setAttribute("aria-hidden", "false");
      }
    });
  });

  // ---------- form & submission logic ----------
  const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";
  const ENTRY_PROPOSAL = "entry.1819396871";     // proposal (Yes/No)
  const ENTRY_GIFT_YES = "entry.1404707409";     // gift when Yes
  const ENTRY_GIFT_NO  = "entry.101708814";      // gift when No

  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const yesArea = document.getElementById("yes-area");
  const noArea = document.getElementById("no-area");
  const thanksMsg = document.getElementById("thanks-msg");

  // yes flow elements
  const giftSelectYes = document.getElementById("gift-select-yes");
  const giftPreviewYes = document.getElementById("gift-preview-yes");
  const btnSubmitYes = document.getElementById("btn-submit-yes");

  // no flow elements
  const giftSelectNo = document.getElementById("gift-select-no");
  const giftPreviewNo = document.getElementById("gift-preview-no");
  const btnSubmitNo = document.getElementById("btn-submit-no");

  // ensure UI starts hidden for areas
  yesArea.style.display = "none";
  noArea.style.display = "none";
  thanksMsg.style.display = "none";

  // prevent auto-submit: clicking No should only reveal no-area, not submit
  btnYes.addEventListener("click", () => {
    yesArea.style.display = "block";
    noArea.style.display = "none";
    thanksMsg.style.display = "none";
    burstConfetti(40);
    // scroll gift into view on small screens
    setTimeout(() => giftSelectYes.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  });

  btnNo.addEventListener("click", () => {
    noArea.style.display = "block";
    yesArea.style.display = "none";
    thanksMsg.style.display = "none";
    burstConfetti(16);
    setTimeout(() => giftSelectNo.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  });

  // preview helpers
  giftSelectYes.addEventListener("change", () => {
    const v = giftSelectYes.value;
    giftPreviewYes.textContent = v ? `Selected: ${v}` : "";
  });
  giftSelectNo.addEventListener("change", () => {
    const v = giftSelectNo.value;
    giftPreviewNo.textContent = v ? `Selected: ${v}` : "";
  });

  // robust submit function: fetch (no-cors) and show local confirmation
  function submitToGoogle({ proposal, gift, giftField }) {
    if (!FORM_ACTION || !ENTRY_PROPOSAL) {
      console.warn("FORM_ACTION or ENTRY_PROPOSAL not configured.");
      return;
    }

    const fd = new FormData();
    fd.append(ENTRY_PROPOSAL, proposal);
    if (gift && giftField) fd.append(giftField, gift);

    // 1) attempt fetch (fire-and-forget)
    try {
      fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body: fd })
        .then(() => {
          console.log("fetch attempt done (no-cors).");
        })
        .catch((err) => {
          console.warn("fetch submit error:", err);
        });
    } catch (e) {
      console.warn("fetch error:", e);
    }

    // 2) show local confirmation immediately (we can't reliably inspect cross-origin response)
    thanksMsg.style.display = "block";
  }

  // Yes submit button handler
  btnSubmitYes.addEventListener("click", () => {
    const gift = giftSelectYes.value;
    if (!gift) {
      alert("Please select a gift before submitting.");
      return;
    }
    // disable to prevent double-submit
    btnSubmitYes.disabled = true;
    giftSelectYes.disabled = true;

    submitToGoogle({ proposal: "Yes", gift: gift, giftField: ENTRY_GIFT_YES });

    // show local confirmation and optionally move to final slide after a short delay
    setTimeout(() => {
      // show final "thanks" slide (optional: here we keep her on same slide and show message)
      // showSlide(slides.length - 1);
    }, 600);
  });

  // No submit button handler
  btnSubmitNo.addEventListener("click", () => {
    const gift = giftSelectNo.value;
    if (!gift) {
      alert("Please select a gift before submitting.");
      return;
    }
    btnSubmitNo.disabled = true;
    giftSelectNo.disabled = true;

    submitToGoogle({ proposal: "No", gift: gift, giftField: ENTRY_GIFT_NO });

    setTimeout(() => {
      // optional: nothing more
    }, 600);
  });

  // ---------- confetti ----------
  function spawnPiece() {
    const el = document.createElement("div");
    el.className = "confetti";
    const w = 6 + Math.random() * 12;
    el.style.width = w + "px";
    el.style.height = w * 1.2 + "px";
    el.style.left = Math.random() * window.innerWidth + "px";
    el.style.top = "-10px";
    el.style.background = `hsl(${Math.floor(Math.random() * 360)},70%,60%)`;
    document.body.appendChild(el);
    const dur = 1500 + Math.random() * 2000;
    const dx = (Math.random() - 0.5) * 200;
    el.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px, ${window.innerHeight + 200}px) rotate(${Math.random() * 720}deg)`, opacity: 0.9 }
      ],
      { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    setTimeout(() => el.remove(), dur + 50);
  }

  function burstConfetti(count = 30, interval = 25) {
    for (let i = 0; i < count; i++) setTimeout(spawnPiece, i * interval);
  }
});
