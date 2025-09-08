:root {
  --accent: #ff4d88;
  --muted: #7a7a7a;
  --bg: #fff0f5;
}

* { box-sizing: border-box }
html, body { height: 100% }
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  background: linear-gradient(180deg, #ffe6f0 0%, #fff 100%);
  color: #222;
  overflow-x: hidden;
}

.wrap { max-width: 720px; margin: 0 auto; padding: 18px; position: relative; z-index: 2; }
.top { text-align: center; margin-bottom: 8px }
.top h1 { color: var(--accent); margin: 6px 0; font-size: 1.8rem }
.top .sub { color: var(--muted); margin: 0 0 12px }

/* background hearts animation */
.hearts-bg::before, .hearts-bg::after {
  content: "💕";
  position: fixed;
  font-size: 2rem;
  animation: float 10s linear infinite;
  color: rgba(255,77,136,0.3);
}
.hearts-bg::after {
  content: "💗";
  font-size: 2.5rem;
  left: 30%;
  animation-duration: 12s;
}
@keyframes float {
  0% { top: 100%; opacity: 0; }
  50% { opacity: 1; }
  100% { top: -10%; opacity: 0; }
}

#slideshow { display: block }
.slide {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 18px;
}
.slide.active { display: flex }

.slide img, .slide video {
  width: 100%;
  max-height: 60vh;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 26px rgba(0,0,0,0.06);
}

/* heartfelt slide */
.heartfelt {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  text-align: center;
}

/* reveal heart */
.reveal-heart {
  background: transparent;
  border: 2px dashed var(--accent);
  color: var(--accent);
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
}
.secret {
  margin-top: 8px;
  color: var(--muted);
  font-style: italic;
  min-height: 2em;
  text-align: center;
}

/* nav row */
.nav-row { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 12px }
.btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn[disabled] { opacity: .5; cursor: not-allowed }
.dots { flex: 1; text-align: center }
.dots .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #eee; margin: 0 6px }
.dots .dot.active { background: #ffb6c6 }

/* proposal */
.proposal-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  box-shadow: 0 8px 26px rgba(0,0,0,0.05);
  text-align: center;
}
.proposal-text { color: #333; margin: 10px 0 }
.proposal-actions { display: flex; gap: 12px; justify-content: center; margin-top: 6px }
.cta { background: var(--accent); color: white; padding: 10px 14px; border-radius: 10px; border: none }
.muted { background: #eee; color: #333; padding: 10px 14px; border-radius: 10px; border: none }
.yes-area, .no-area { margin-top: 12px; background: #fff6fb; padding: 12px; border-radius: 12px }
.sad { color: #555 }

/* gift preview */
.gift-preview img {
  max-width: 160px;
  border-radius: 10px;
  margin-top: 8px;
}

/* footer */
.foot { text-align: center; margin-top: 12px; color: var(--muted) }

/* confetti */
.confetti { position: fixed; z-index: 9999; pointer-events: none }

/* responsive */
@media (max-width: 420px) {
  .top h1 { font-size: 1.4rem }
  .btn, .reveal-heart { padding: 8px 10px }
}
