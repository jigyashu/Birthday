document.addEventListener("DOMContentLoaded", () => {
  // -------- slideshow --------
  const slides = [...document.querySelectorAll(".slide")];
  let index = 0;

  function renderDots(i) {
    slides.forEach((s, j) => {
      const dots = s.querySelector(".dots");
      if (!dots) return;
      dots.innerHTML = slides.map(
        (_, k) => `<span class="dot ${k===i ? "active":""}" data-dot="${k}"></span>`
      ).join("");
      dots.querySelectorAll(".dot").forEach(dot => {
        dot.onclick = () => showSlide(parseInt(dot.dataset.dot));
      });
    });
  }

  function showSlide(i) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    slides.forEach((s, j) => {
      s.classList.toggle("active", j === i);
      const prev = s.querySelector(".prev");
      const next = s.querySelector(".next");
      if (prev) prev.disabled = j === 0;
      if (next) next.disabled = j === slides.length-1;
    });
    index = i;
    renderDots(i);
  }

  slides.forEach((s, i) => {
    const prev = s.querySelector(".prev");
    const next = s.querySelector(".next");
    if (prev) prev.onclick = () => showSlide(i-1);
    if (next) next.onclick = () => showSlide(i+1);
  });

  showSlide(0);

  // -------- reveal hearts --------
  document.querySelectorAll(".reveal-heart").forEach(btn => {
    btn.onclick = () => {
      const slide = btn.closest(".slide");
      const secret = slide.querySelector(".secret");
      const msg = slide.dataset.msg || "";
      if (!secret.textContent) {
        secret.textContent = msg;
        btn.textContent = "💖 Hide";
      } else {
        secret.textContent = "";
        btn.textContent = "💖 Reveal";
      }
    };
  });

  // -------- gifts --------
  const giftMap = {
    earrings: "assets/gifts/earrings.jpg",
    dress: "assets/gifts/dress.jpg",
    trip: "assets/gifts/trip.jpg",
    watch: "assets/gifts/watch.jpg",
    purse: "assets/gifts/purse.jpg",
    shoes: "assets/gifts/shoes.jpg",
    softtoy: "assets/gifts/softtoy.jpg",
    chocolates: "assets/gifts/chocolates.jpg",
    jacket: "assets/gifts/jacket.jpg"
  };

  function setupGift(selectId, previewId) {
    const sel = document.getElementById(selectId);
    const preview = document.getElementById(previewId);
    sel.addEventListener("change", () => {
      const val = sel.value;
      preview.innerHTML = val
        ? giftMap[val]
          ? `<p>Selected: ${val}</p><img src="${giftMap[val]}" alt="${val}">`
          : `<p>Selected: ${val}</p>`
        : "";
    });
  }
  setupGift("gift-select-yes", "gift-preview-yes");
  setupGift("gift-select-no", "gift-preview-no");

  // -------- proposal buttons --------
  const yesArea = document.getElementById("yes-area");
  const noArea = document.getElementById("no-area");
  const thanksMsg = document.getElementById("thanks-msg");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");

  btnYes.onclick = () => {
    yesArea.style.display = "block";
    noArea.style.display = "none";
    thanksMsg.style.display = "none";
    burstConfetti(40);
  };

  btnNo.onclick = () => {
    noArea.style.display = "block";
    yesArea.style.display = "none";
    thanksMsg.style.display = "none";
    burstConfetti(20);
  };

  // -------- form submission (to Google Forms) --------
  const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";
  const ENTRY_PROPOSAL = "entry.1819396871";
  const ENTRY_GIFT_YES = "entry.1404707409";
  const ENTRY_GIFT_NO = "entry.101708814";

  function submitToGoogle({proposal, gift, giftField}) {
    const fd = new FormData();
    fd.append(ENTRY_PROPOSAL, proposal);
    if (gift && giftField) fd.append(giftField, gift);

    fetch(FORM_ACTION, {method:"POST", mode:"no-cors", body: fd})
      .catch(e=>console.warn("submit error", e));

    thanksMsg.style.display = "block";
  }

  document.getElementById("btn-submit-yes").onclick = () => {
    const gift = document.getElementById("gift-select-yes").value;
    if (!gift) return alert("Please choose a gift.");
    submitToGoogle({proposal:"Yes", gift, giftField: ENTRY_GIFT_YES});
  };

  document.getElementById("btn-submit-no").onclick = () => {
    const gift = document.getElementById("gift-select-no").value;
    if (!gift) return alert("Please choose a gift.");
    submitToGoogle({proposal:"No", g
