(() => {
  'use strict';

  // ---------- Target date ----------
  const TARGET_DATE = new Date('2026-09-23T00:00:00');

  // ---------- Element references ----------
  const countdownScreen = document.getElementById('countdownScreen');
  const revealScreen = document.getElementById('revealScreen');
  const letterScreen = document.getElementById('letterScreen');
  const surpriseBtn = document.getElementById('surpriseBtn');

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  let previousValues = { days: null, hours: null, minutes: null, seconds: null };
  let hasFinished = false;

  // ---------- Firas & Amira approach elements ----------
  const approachTrack = document.getElementById('approachTrack');
  const approachFill = document.getElementById('approachFill');
  const firasAvatar = document.getElementById('firasAvatar');
  const amiraAvatar = document.getElementById('amiraAvatar');
  const unionLine = document.getElementById('unionLine');

  const APPROACH_WINDOW_MS = 45 * 24 * 60 * 60 * 1000; // the pair start visibly "apart" 45 days out
  const START_LEFT = 6;   // Firas' position (%) when maximally far apart
  const START_RIGHT = 94; // Amira's position (%) when maximally far apart
  const CENTER = 50;

  let lastFirasPos = START_LEFT;
  let lastAmiraPos = START_RIGHT;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function animateTick(el) {
    el.classList.remove('tick');
    // Force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function updateUnit(el, newValue, key) {
    const padded = pad(newValue);
    if (previousValues[key] !== newValue) {
      el.textContent = padded;
      animateTick(el);
      previousValues[key] = newValue;
    }
  }

  function updateApproach(distance) {
    const clamped = Math.min(Math.max(distance, 0), APPROACH_WINDOW_MS);
    const progress = 1 - clamped / APPROACH_WINDOW_MS; // 0 = far apart, 1 = together

    const firasPos = START_LEFT + (CENTER - START_LEFT) * progress;
    const amiraPos = START_RIGHT - (START_RIGHT - CENTER) * progress;

    firasAvatar.style.left = `${firasPos}%`;
    amiraAvatar.style.left = `${amiraPos}%`;

    approachFill.style.left = `${firasPos}%`;
    approachFill.style.width = `${Math.max(amiraPos - firasPos, 0)}%`;
    approachFill.style.opacity = (0.15 + progress * 0.7).toFixed(2);

    lastFirasPos = firasPos;
    lastAmiraPos = amiraPos;
  }

  function spawnPathHeart() {
    const heart = document.createElement('div');
    heart.className = 'path-heart';
    heart.innerHTML = '&#10084;';
    const duration = 5 + Math.random() * 3;
    heart.style.animationDuration = `${duration}s`;
    approachTrack.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }

  function spawnMiniHeart(xPercent) {
    const heart = document.createElement('div');
    heart.className = 'mini-heart';
    heart.innerHTML = '&#10084;';
    heart.style.left = `${xPercent}%`;
    approachTrack.appendChild(heart);
    setTimeout(() => heart.remove(), 2400);
  }

  function spawnMeetingBurst() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart';
      heart.innerHTML = '&#10084;';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const distancePx = 50 + Math.random() * 45;
      const tx = Math.cos(angle) * distancePx;
      const ty = Math.sin(angle) * distancePx;
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--ty', `${ty}px`);
      heart.style.animationDelay = `${Math.random() * 0.2}s`;
      approachTrack.appendChild(heart);
      setTimeout(() => heart.remove(), 1700);
    }
  }

  setInterval(spawnPathHeart, 3200);
  setInterval(() => {
    spawnMiniHeart(lastFirasPos + (Math.random() * 6 - 3));
    spawnMiniHeart(lastAmiraPos + (Math.random() * 6 - 3));
  }, 2600);

  function tick() {
    const now = new Date().getTime();
    const distance = TARGET_DATE.getTime() - now;

    updateApproach(distance);

    if (distance <= 0) {
      updateUnit(daysEl, 0, 'days');
      updateUnit(hoursEl, 0, 'hours');
      updateUnit(minutesEl, 0, 'minutes');
      updateUnit(secondsEl, 0, 'seconds');

      if (!hasFinished) {
        hasFinished = true;
        approachTrack.classList.add('met');
        spawnMeetingBurst();
        unionLine.classList.add('show');
        setTimeout(triggerReveal, 1400);
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateUnit(daysEl, days, 'days');
    updateUnit(hoursEl, hours, 'hours');
    updateUnit(minutesEl, minutes, 'minutes');
    updateUnit(secondsEl, seconds, 'seconds');
  }

  function triggerReveal() {
    countdownScreen.classList.add('fading-out');

    setTimeout(() => {
      countdownScreen.hidden = true;
      revealScreen.hidden = false;
      // Allow the browser to paint hidden=false before transitioning opacity
      requestAnimationFrame(() => {
        revealScreen.classList.add('visible');
      });

      const lines = revealScreen.querySelectorAll('.reveal-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('shown'), 500 + i * 700);
      });

      setTimeout(() => {
        surpriseBtn.hidden = false;
      }, 500 + lines.length * 700 + 600);
    }, 1400);
  }

  surpriseBtn.addEventListener('click', () => {
    letterScreen.hidden = false;
    requestAnimationFrame(() => {
      letterScreen.classList.add('visible');
    });
    surpriseBtn.disabled = true;
  });

  // ---------- Countdown loop ----------
  tick();
  setInterval(tick, 1000);

  // ---------- Floating hearts ----------
  const heartsField = document.getElementById('heartsField');
  const HEART_COUNT = 18;

  function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '&#10084;';

    const size = 10 + Math.random() * 22;
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 14;
    const delay = Math.random() * 12;
    const drift = 40 + Math.random() * 80;
    const opacity = 0.25 + Math.random() * 0.5;

    heart.style.left = `${left}vw`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `-${delay}s`;
    heart.style.setProperty('--drift', `${drift}px`);
    heart.style.setProperty('--heart-opacity', opacity.toFixed(2));

    heartsField.appendChild(heart);
  }

  for (let i = 0; i < HEART_COUNT; i++) {
    spawnHeart();
  }

  // ---------- Starfield / particles on canvas ----------
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((width * height) / 9000);
    stars = new Array(count).fill(null).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.15,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function drawStars(timestamp) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = star.baseAlpha + Math.sin(timestamp * star.twinkleSpeed + star.phase) * 0.25;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247, 238, 245, ${Math.max(0, alpha)})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(drawStars);
})();
