document.addEventListener("DOMContentLoaded", () => {
  const slides = [...document.querySelectorAll(".slide")];
  let index = 0;

  // ------------------ NAVIGATION ------------------
  function showSlide(i) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
      const dots = s.querySelector(".dots");
      if (dots) {
        dots.innerHTML = slides
          .map((_, j) => `<span class="dot ${j === i ? "active" : ""}"></span>`)
          .join("");
      }
    });
    index = i;
  }

  slides.forEach((s, i) => {
    const prev = s.querySelector(".prev");
    const next = s.querySelector(".next");
    if (prev) prev.addEventListener("click", () => showSlide(i - 1));
    if (next) next.addEventListener("click", () => showSlide(i + 1));
  });

  showSlide(0);

  // ------------------ HEART REVEAL ------------------
  document.querySelectorAll(".reveal-heart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slide = btn.closest(".slide");
      const secret = slide.querySelector(".secret");
      const msg = slide.dataset.msg;
      if (secret.textContent) {
        secret.textContent = "";
        btn.textContent = "💖 Reveal";
      } else {
        secret.textContent = msg;
        btn.textContent = "💖 Hide";
      }
    });
  });

  // ------------------ FORM HANDLING ------------------
  const FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";

  const ENTRY_PROPOSAL = "entry.1819396871";
  const ENTRY_GIFT_YES = "entry.1404707409";
  const ENTRY_GIFT_NO = "entry.101708814";

  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const yesArea = document.getElementById("yes-area");
  const noArea = document.getElementById("no-area");
  const thanks = document.getElementById("thanks-msg");

  const giftSelectYes = document.getElementById("gift-select-yes");
  const giftPreviewYes = document.getElementById("gift-preview-yes");
  const btnSubmitYes = document.getElementById("btn-submit-yes");

  const giftSelectNo = document.getElementById("gift-select-no");
  const giftPreviewNo = document.getElementById("gift-preview-no");
  const btnSubmitNo = document.getElementById("btn-submit-no");

  function submitToGoogle({ proposal, gift, giftField }) {
    const fd = new FormData();
    fd.append(ENTRY_PROPOSAL, proposal);
    if (gift && giftField) fd.append(giftField, gift);

    fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body: fd })
      .then(() => {
        console.log("Submitted to Google Form");
        thanks.style.display = "block";
      })
      .catch((err) => console.warn("Form error", err));
  }

  // Proposal buttons
  btnYes.addEventListener("click", () => {
    yesArea.style.display = "block";
    noArea.style.display = "none";
    burstConfetti(40);
  });

  btnNo.addEventListener("click", () => {
    noArea.style.display = "block";
    yesArea.style.display = "none";
    burstConfetti(20);
  });

  // Gift preview YES
  giftSelectYes.addEventListener("change", () => {
    const v = giftSelectYes.value;
    giftPreviewYes.textContent = v ? `Selected: ${v}` : "";
  });

  // Gift preview NO
  giftSelectNo.addEventListener("change", () => {
    const v = giftSelectNo.value;
    giftPreviewNo.textContent = v ? `Selected: ${v}` : "";
  });

  // Submit YES
  btnSubmitYes.addEventListener("click", () => {
    const gift = giftSelectYes.value;
    if (!gift) return alert("Please choose a gift first!");
    submitToGoogle({ proposal: "Yes", gift, giftField: ENTRY_GIFT_YES });
    btnSubmitYes.disabled = true;
  });

  // Submit NO
  btnSubmitNo.addEventListener("click", () => {
    const gift = giftSelectNo.value;
    if (!gift) return alert("Please choose a gift first!");
    submitToGoogle({ proposal: "No", gift, giftField: ENTRY_GIFT_NO });
    btnSubmitNo.disabled = true;
  });

  // ------------------ CONFETTI ------------------
  function spawnPiece() {
    const el = document.createElement("div");
    el.className = "confetti";
    const w = 6 + Math.random() * 12;
    el.style.width = w + "px";
    el.style.height = w * 1.2 + "px";
    el.style.left = Math.random() * window.innerWidth + "px";
    el.style.top = "-10px";
    el.style.background = `hsl(${Math.random() * 360},70%,60%)`;
    document.body.appendChild(el);
    const dur = 1500 + Math.random() * 2000;
    const dx = (Math.random() - 0.5) * 200;
    el.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        {
          transform: `translate(${dx}px,${window.innerHeight + 200}px)`,
          opacity: 0.9,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    setTimeout(() => el.remove(), dur + 50);
  }

  function burstConfetti(count = 30, interval = 25) {
    for (let i = 0; i < count; i++) {
      setTimeout(spawnPiece, i * interval);
    }
  }
});
