document.addEventListener("DOMContentLoaded", () => {
  // -------- slideshow --------
  const slides = [...document.querySelectorAll(".slide")];
  const dotsContainer = document.querySelector(".dots");
  let index = 0;

  function renderDots() {
    dotsContainer.innerHTML = slides.map(
      (_, i) => `<span class="dot ${i===index ? "active":""}" data-idx="${i}"></span>`
    ).join("");
    dotsContainer.querySelectorAll(".dot").forEach(dot => {
      dot.onclick = () => showSlide(parseInt(dot.dataset.idx));
    });
  }

  function showSlide(i) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    slides.forEach((s, j) => s.classList.toggle("active", j===i));
    index = i;
    renderDots();
    document.getElementById("prev").disabled = (i===0);
    document.getElementById("next").disabled = (i===slides.length-1);
  }

  document.getElementById("prev").onclick = () => showSlide(index-1);
  document.getElementById("next").onclick = () => showSlide(index+1);

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
    if (!sel) return;
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
    submitToGoogle({proposal:"No", gift, giftField: ENTRY_GIFT_NO});
  };

  // -------- confetti --------
  function spawnConfetti() {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = Math.random()*100+"%";
    el.style.top = "-10px";
    el.style.width = "8px";
    el.style.height = "14px";
    el.style.background = `hsl(${Math.random()*360},70%,60%)`;
    el.style.position = "fixed";
    el.style.opacity = 0.9;
    el.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);

    let t = 0;
    const fall = setInterval(()=>{
      t+=3;
      el.style.top = t+"px";
      if (t>window.innerHeight) {
        clearInterval(fall);
        el.remove();
      }
    },30);
  }
  function burstConfetti(n) {
    for (let i=0;i<n;i++) setTimeout(spawnConfetti,i*40);
  }
});
