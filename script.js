document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  let currentPage = 0;

  function showPage(i) {
    pages.forEach((p, idx) => p.classList.toggle("active", idx === i));
    currentPage = i;
  }

  document.querySelectorAll(".next-btn").forEach(btn => {
    btn.addEventListener("click", () => showPage(currentPage + 1));
  });

  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const giftDropdown = document.getElementById("gift-dropdown");
  const giftDisplay = document.getElementById("gift-display");
  const submitGiftBtn = document.getElementById("submit-gift");

  // Google Form settings
  const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSepX4yV2Z_aBdqkslV_gWkahPqveilmVpqb_sJE0ianTufDCQ/formResponse";
  const ENTRY_PROPOSAL = "entry.1404707409"; // Yes/No
  const ENTRY_GIFT = "entry.1819396871"; // dropdown actual ID (not sentinel)

  function submitToGoogle(proposal, gift = "") {
    const formData = new FormData();
    formData.append(ENTRY_PROPOSAL, proposal);
    if (gift) formData.append(ENTRY_GIFT, gift);

    fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: formData
    }).then(() => console.log("Submitted to Google Form"));
  }

  yesBtn.addEventListener("click", () => {
    submitToGoogle("Yes");
    showPage(currentPage + 1);
    startConfetti();
  });

  noBtn.addEventListener("click", () => {
    submitToGoogle("No");
    showPage(pages.length - 1); // go to NO page
  });

  giftDropdown.addEventListener("change", () => {
    const val = giftDropdown.value;
    giftDisplay.innerHTML = "";
    if (val === "earrings") {
      giftDisplay.innerHTML = `
        <p>I thought these would look beautiful on you 💍</p>
        <a href="https://www.example.com/earrings" target="_blank">
          <img src="assets/photos/earrings.jpg" alt="Earrings gift">
        </a>`;
    } else if (val === "virtual-hug") {
      giftDisplay.innerHTML = "<p>A big warm hug for you 🤗</p>";
    } else if (val === "song") {
      giftDisplay.innerHTML = "<p>I'll dedicate my favorite song to you 🎵</p>";
    } else if (val === "ice-cream-date") {
      giftDisplay.innerHTML = "<p>Let's go for an ice cream date 🍦</p>";
    }
  });

  submitGiftBtn.addEventListener("click", () => {
    const gift = giftDropdown.value;
    if (!gift) return alert("Please select a gift first!");
    submitToGoogle("Yes", gift);
    giftDisplay.innerHTML += "<p>💖 Your choice has been submitted!</p>";
    submitGiftBtn.disabled = true;
  });

  /* Confetti */
  function startConfetti() {
    for (let i = 0; i < 100; i++) {
      setTimeout(spawnConfetti, i * 50);
    }
  }

  function spawnConfetti() {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * window.innerWidth + "px";
    el.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
    document.body.appendChild(el);

    el.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: `translateY(${window.innerHeight}px)`, opacity: 0 }
      ],
      { duration: 3000 + Math.random() * 2000 }
    );

    setTimeout(() => el.remove(), 5000);
  }
});
