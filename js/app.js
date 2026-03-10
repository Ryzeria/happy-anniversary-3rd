/* ===== SHARED APP UTILITIES ===== */

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const START_DATE   = new Date('2023-03-10T00:00:00'); // when they started dating
const ANNIV_DAY    = { month: 2, day: 10 };           // March = month index 2

const GAME_SCHEDULE = [
  { id:1, code:'Unl6M0',   start:new Date('2026-03-10T00:00:00'), end:new Date('2026-03-17T00:00:00') },
  { id:2, code:'chdDRI',   start:new Date('2026-03-17T00:00:00'), end:new Date('2026-03-24T00:00:00') },
  { id:3, code:'NHBQeT',   start:new Date('2026-03-24T00:00:00'), end:new Date('2026-03-31T00:00:00') },
  { id:4, code:'RuTiF2',   start:new Date('2026-03-31T00:00:00'), end:new Date('2026-04-07T00:00:00') },
  { id:5, code:'M3JTQHJZ', start:new Date('2026-04-07T00:00:00'), end:new Date('2026-04-14T00:00:00') },
];
const VALID_CODES = GAME_SCHEDULE.map(g => g.code);

// ─── GAME STATUS ────────────────────────────────────────────────────────────
function getGameStatus(idx) {          // idx 0-based
  const g   = GAME_SCHEDULE[idx];
  const now = new Date();
  const key = `game${g.id}_done`;
  if (localStorage.getItem(key) === '1') return 'completed';
  if (now < g.start) return 'locked';
  if (now >= g.end)  return 'expired';
  return 'available';
}

function getGameCode(idx) {
  const key = `game${GAME_SCHEDULE[idx].id}_code`;
  return localStorage.getItem(key) || null;
}

// ─── COUNTDOWN / COUNTUP ────────────────────────────────────────────────────
function getCountdownData() {
  const now  = new Date();
  const diff = now - START_DATE;  // ms since they started
  const abs  = Math.abs(diff);

  const totalSec = Math.floor(abs / 1000);
  const years    = Math.floor(totalSec / (365.25 * 86400));
  const rem1     = totalSec % (365.25 * 86400);
  const days     = Math.floor(rem1 / 86400);
  const hours    = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;

  return { diff, years, days, hours, minutes, seconds };
}

// ─── STAR FIELD ─────────────────────────────────────────────────────────────
function initStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.3,
    a: Math.random(),
    da: (Math.random() * 0.008 + 0.003) * (Math.random() < .5 ? 1 : -1),
  }));

  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(s.a * 0.85).toFixed(2)})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

// ─── PARTICLES ──────────────────────────────────────────────────────────────
function initParticles(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const SYMBOLS = ['❤️','✨','🌸','💕','⭐','🌺','💗','🌟'];
  function spawn() {
    const el = document.createElement('span');
    el.className = 'ptcl';
    el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    el.style.left     = (Math.random() * 100) + 'vw';
    el.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';
    const dur = (Math.random() * 12 + 10).toFixed(1);
    el.style.animationDuration = dur + 's';
    el.style.animationDelay   = (Math.random() * 2).toFixed(1) + 's';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), (+dur + 3) * 1000);
  }
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 600);
  setInterval(spawn, 2200);
}

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function launchConfetti(count = 90) {
  let wrap = document.getElementById('confetti');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'confetti';
    document.body.appendChild(wrap);
  }
  const COLORS = ['#c9184a','#ff6b9d','#ffd700','#00ff88','#9d4edd','#ffb3c6','#fff'];
  for (let i = 0; i < count; i++) {
    const cf = document.createElement('div');
    cf.className = 'cf';
    cf.style.left            = (Math.random() * 100) + 'vw';
    cf.style.background      = COLORS[Math.floor(Math.random() * COLORS.length)];
    cf.style.width           = (Math.random() * 10 + 5) + 'px';
    cf.style.height          = (Math.random() * 10 + 5) + 'px';
    cf.style.borderRadius    = Math.random() > .5 ? '50%' : '2px';
    cf.style.animationDuration= (Math.random() * 2.5 + 1.5) + 's';
    cf.style.animationDelay  = (Math.random() * 1.2).toFixed(2) + 's';
    wrap.appendChild(cf);
  }
  setTimeout(() => { if (wrap) wrap.innerHTML = ''; }, 6000);
}

// ─── MUSIC PLAYER ────────────────────────────────────────────────────────────
class BGMusic {
  constructor(src, volume = 0.38) {
    this.audio = new Audio(src);
    this.audio.loop   = true;
    this.audio.volume = volume;
    this.on = false;
    // Resume across pages via sessionStorage
    if (sessionStorage.getItem('music_on') === '1') this.start();
  }
  start() {
    this.audio.play().then(() => { this.on = true; sessionStorage.setItem('music_on','1'); }).catch(() => {});
  }
  toggle() {
    if (this.on) {
      this.audio.pause(); this.on = false;
      sessionStorage.setItem('music_on','0');
    } else {
      this.start();
    }
    return this.on;
  }
}

// ─── UPDATE MUSIC BUTTON UI ─────────────────────────────────────────────────
function updateMusicBtn(btn, disc, playing) {
  if (!btn) return;
  if (playing) {
    btn.innerHTML = '🎵 <span class="music-disc" id="disc">🎵</span> Musik On';
    btn.querySelector('#disc')?.classList.remove('paused');
  } else {
    btn.innerHTML = '🎵 <span class="music-disc paused" id="disc">🎵</span> Musik Off';
  }
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function showModal(opts) {
  const bg = document.getElementById('modal-bg');
  if (!bg) return;
  bg.querySelector('.modal-icon').textContent  = opts.icon  || '✨';
  bg.querySelector('.modal-title').textContent = opts.title || '';
  bg.querySelector('.modal-body').innerHTML    = opts.body  || '';
  const codeEl = bg.querySelector('.modal-code');
  if (opts.code) { codeEl.textContent = opts.code; codeEl.classList.remove('hidden'); }
  else           { codeEl.classList.add('hidden'); }
  bg.classList.add('show');
}
function hideModal() { document.getElementById('modal-bg')?.classList.remove('show'); }

// ─── SIMPLE TOAST ────────────────────────────────────────────────────────────
function toast(msg, type = 'info', dur = 2800) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
    background:${type==='err'?'rgba(255,68,68,.9)':type==='ok'?'rgba(0,255,136,.15)':'rgba(30,15,50,.95)'};
    border:1px solid ${type==='err'?'rgba(255,68,68,.6)':type==='ok'?'rgba(0,255,136,.5)':'rgba(201,24,74,.4)'};
    color:#fff; padding:.7rem 1.6rem; border-radius:50px; z-index:9999;
    font-size:.85rem; backdrop-filter:blur(8px);
    animation:fadeIn .3s ease;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), dur);
}
