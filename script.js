// Page navigation
let pages = document.querySelectorAll('.page');
let nextBtns = document.querySelectorAll('.next-btn');
let currentPage = 0;

nextBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pages[currentPage].classList.remove('active');
    currentPage++;
    pages[currentPage].classList.add('active');
  });
});

// Slideshow
let slides = document.querySelectorAll('.slide');
let slideIndex = 0;
slides[slideIndex].classList.add('active');

document.getElementById('next').addEventListener('click', () => {
  slides[slideIndex].classList.remove('active');
  slideIndex = (slideIndex + 1) % slides.length;
  slides[slideIndex].classList.add('active');
});
document.getElementById('prev').addEventListener('click', () => {
  slides[slideIndex].classList.remove('active');
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  slides[slideIndex].classList.add('active');
});

// Heart messages
let hearts = document.querySelectorAll('.heart');
let msg = document.getElementById('heart-message');
hearts.forEach(h => {
  h.addEventListener('click', () => {
    msg.textContent = h.getAttribute('data-msg');
  });
});

// Proposal
document.getElementById('yes-btn').addEventListener('click', () => {
  document.getElementById('yes-surprise').style.display = 'block';
  document.getElementById('no-message').style.display = 'none';
});
document.getElementById('no-btn').addEventListener('click', () => {
  document.getElementById('no-message').style.display = 'block';
  document.getElementById('yes-surprise').style.display = 'none';
});

// Gift submission → Google Form
document.getElementById('submit-gift').addEventListener('click', () => {
  let choice = document.getElementById('gift-dropdown').value;
  if (!choice) return alert("Please choose a gift!");

  // Replace with your Google Form action link + entry ID
  fetch("https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
      "entry.123456": choice   // Replace entry.123456 with your field ID
    })
  });

  document.getElementById('gift-result').textContent = "Your choice has been submitted 🎉";
});
