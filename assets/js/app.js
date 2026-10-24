'use strict';

/* BanPhase — V1 iskelet
   Bağımlılık yok. Durum localStorage'da; sunucuya hiçbir şey gönderilmez. */

const CONFIG = {
  banOptions: [3, 5],
  banSeconds: 30,
  storageKey: 'banphase.draft.v1',
  dataUrl: './data/heroes.json',
};

const TEAM_LABEL = { blue: 'Mavi Takım', red: 'Kırmızı Takım' };

const state = {
  heroes: [],
  heroById: new Map(),
  roles: [],
  dataLoaded: false,
  slots: [],
  bansPerTeam: 5,
  cursor: 0,
  query: '',
  role: 'all',
  finished: false,
  timer: { remaining: CONFIG.banSeconds, running: false, deadline: 0, handle: 0, armed: false },
};

const els = {};
let toastTimer = 0;

/* ---------- yardımcılar ---------- */

const TR_MAP = {
  'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
  'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
};

function fold(text) {
  return String(text)
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (ch) => TR_MAP[ch])
    .toLowerCase();
}

function hue(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.codePointAt(0)) % 360;
  return `hsl(${h} 62% 38%)`;
}

const NAME_STOPWORDS = new Set(['and', 'of', 'the', 'de', 'van']);

function initials(name) {
  const words = String(name).split(/[\s.\-]+/).filter(Boolean)
    .filter((word) => !NAME_STOPWORDS.has(word.toLowerCase()));
  if (!words.length) return String(name).slice(0, 2).toUpperCase();
  const raw = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return raw.toUpperCase();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/* ---------- durum ---------- */

function makeSlots(bansPerTeam = state.bansPerTeam) {
  const total = bansPerTeam * 2;
  let blue = 0;
  let red = 0;
  return Array.from({ length: total }, (_, i) => {
    const team = i % 2 === 0 ? 'blue' : 'red';
    const teamIndex = team === 'blue' ? blue++ : red++;
    return { index: i, team, teamIndex, heroId: null, skipped: false };
  });
}

function restore() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== 1 || !Array.isArray(data.slots)) return null;

    const bansPerTeam = CONFIG.banOptions.includes(data.bansPerTeam) ? data.bansPerTeam : 5;
    if (data.slots.length !== bansPerTeam * 2) return null;

    const slots = data.slots.map((slot, i) => {
      const team = i % 2 === 0 ? 'blue' : 'red';
      const known = !state.dataLoaded || state.heroById.has(slot.heroId);
      const heroId = slot.heroId && known ? slot.heroId : null;
      return {
        index: i,
        team,
        teamIndex: Number.isInteger(slot.teamIndex) ? slot.teamIndex : 0,
        heroId,
        skipped: Boolean(slot.skipped),
      };
    });

    const cursor = Math.min(Math.max(Number(data.cursor) || 0, 0), slots.length);
    return { slots, cursor, finished: Boolean(data.finished), bansPerTeam };
  } catch {
    return null;
  }
}

function save() {
  if (!state.dataLoaded) return;
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      v: 1,
      bansPerTeam: state.bansPerTeam,
      slots: state.slots.map((s) => ({ teamIndex: s.teamIndex, heroId: s.heroId, skipped: s.skipped })),
      cursor: state.cursor,
      finished: state.finished,
    }));
  } catch {
    /* gizli mod / kota dolu: sessizce devam */
  }
}

/* ---------- çizim ---------- */

function render() {
  renderTurn();
  renderBoard();
  renderHeroes();
}

function renderTurn() {
  const done = state.finished;
  els.turnTeam.dataset.team = done ? 'done' : state.slots[state.cursor].team;

  if (done) {
    els.turnTeam.textContent = 'Ban aşaması tamam';
    els.turnSlot.textContent = 'Özeti açıp takımına yapıştırabilirsin.';
  } else {
    const slot = state.slots[state.cursor];
    const next = state.slots.slice(state.cursor + 1, state.cursor + 3)
      .map((s) => (s.team === 'blue' ? 'Mavi' : 'Kırmızı'));
    const nextText = next.length ? ` · sırada ${next.join(', ')}` : '';
    els.turnTeam.textContent = TEAM_LABEL[slot.team];
    els.turnSlot.textContent = `${slot.teamIndex + 1}. ban · ${state.cursor + 1}/${state.slots.length}${nextText}`;
  }

  els.bansToggle?.querySelectorAll('[data-bans]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.bans) === state.bansPerTeam));
  });
  if (els.settingsHint) els.settingsHint.textContent = `${state.bansPerTeam * 2} ban`;

  els.btnTimer.textContent = state.timer.running ? 'Duraklat' : 'Başlat';
  els.btnTimer.disabled = done;
  els.btnSkip.disabled = done;
  els.btnUndo.disabled = state.cursor === 0 && !done;
  els.btnSummary.hidden = !done;

  document.querySelectorAll('.team').forEach((card) => {
    const team = card.dataset.team;
    card.classList.toggle('is-turn', !done && state.slots[state.cursor].team === team);
  });
}

function renderBoard() {
  for (const team of ['blue', 'red']) {
    const list = document.getElementById(`slots-${team}`);
    if (!list) continue;

    const teamSlots = state.slots.filter((s) => s.team === team);
    list.style.setProperty('--cols', teamSlots.length);
    list.innerHTML = teamSlots.map((slot) => {
      const hero = slot.heroId ? state.heroById.get(slot.heroId) : null;
      const isActive = !state.finished && state.cursor === slot.index;
      const classes = ['slot'];
      if (slot.heroId) classes.push('is-filled');
      if (slot.skipped) classes.push('is-skipped');
      if (isActive) classes.push('is-active');

      const tone = hero ? hue(hero.id) : 'transparent';
      const face = hero ? initials(hero.name) : (slot.heroId ? '?' : '—');
      return `<li class="${classes.join(' ')}"${isActive ? ' aria-current="true"' : ''} style="--tone:${tone}">
        <span class="slot-no">${slot.teamIndex + 1}</span>
        <span class="slot-face">${face}</span>
      </li>`;
    }).join('');

    const count = teamSlots.filter((s) => s.heroId).length;
    const chip = document.querySelector(`[data-count="${team}"]`);
    if (chip) chip.textContent = `${count}/${teamSlots.length}`;
  }
}

function visibleHeroes() {
  const q = fold(state.query.trim());
  return state.heroes.filter((hero) => {
    if (state.role !== 'all' && !hero.roles.includes(state.role)) return false;
    if (!q) return true;
    if (fold(hero.name).includes(q)) return true;
    return hero.roles.some((role) => fold(role).includes(q));
  });
}

function renderHeroes() {
  const banned = new Set(state.slots.filter((s) => s.heroId).map((s) => s.heroId));
  const list = visibleHeroes();

  els.heroCount.textContent = list.length === state.heroes.length
    ? `${state.heroes.length}`
    : `${list.length} / ${state.heroes.length}`;
  els.empty.hidden = list.length > 0 || state.heroes.length === 0;

  els.heroGrid.innerHTML = list.map((hero) => {
    const isBanned = banned.has(hero.id);
    const roleText = hero.roles.join(' · ');
    return `<button class="hero${isBanned ? ' is-banned' : ''}" type="button"
      data-hero-id="${hero.id}" ${isBanned ? 'disabled' : ''}
      aria-label="${hero.name}, ${roleText}${isBanned ? ', banlandı' : ''}">
      <span class="hero-art" style="--tone:${hue(hero.id)}">${initials(hero.name)}</span>
      <span class="hero-name">${hero.name}</span>
      <span class="hero-role">${roleText}</span>
    </button>`;
  }).join('');
}

function renderRoles() {
  const roles = ['all', ...state.roles];
  els.roles.innerHTML = roles.map((role) => {
    const label = role === 'all' ? 'Tümü' : role;
    return `<button class="role" type="button" data-role="${role}"
      aria-pressed="${state.role === role}">${label}</button>`;
  }).join('');
}

function renderTimer() {
  const { remaining, running } = state.timer;
  els.timer.textContent = pad2(remaining);
  els.timer.classList.toggle('is-running', running);
  els.timer.classList.toggle('is-low', remaining <= 5 && !state.finished);
}

/* ---------- zamanlayıcı ---------- */

function renderTimerButton() {
  els.btnTimer.textContent = state.timer.running ? 'Duraklat' : 'Başlat';
}

function startTimer() {
  if (state.finished || state.timer.running) return;
  if (state.timer.remaining <= 0) state.timer.remaining = CONFIG.banSeconds;

  state.timer.armed = true;
  state.timer.deadline = Date.now() + state.timer.remaining * 1000;
  state.timer.running = true;
  state.timer.handle = window.setInterval(tick, 250);
  renderTimer();
  renderTimerButton();
}

function stopTimer() {
  if (state.timer.handle) window.clearInterval(state.timer.handle);
  state.timer.handle = 0;
  state.timer.running = false;
  renderTimer();
  renderTimerButton();
}

function tick() {
  const left = Math.max(0, Math.ceil((state.timer.deadline - Date.now()) / 1000));
  if (left !== state.timer.remaining) {
    state.timer.remaining = left;
    renderTimer();
  }
  if (left <= 0) {
    stopTimer();
    handleTimeout();
  }
}

function resetTimer(autoStart) {
  stopTimer();
  state.timer.remaining = CONFIG.banSeconds;
  state.timer.armed = Boolean(autoStart);
  renderTimer();
  if (autoStart) startTimer();
}

function handleTimeout() {
  if (state.finished) return;
  state.slots[state.cursor].skipped = true;
  toast('Süre doldu — bu ban atlandı.');
  state.timer.armed = false;
  advance({ autoStart: false });
}

/* ---------- eylemler ---------- */

function advance(options = {}) {
  const autoStart = options.autoStart ?? state.timer.armed;
  state.cursor += 1;

  if (state.cursor >= state.slots.length) {
    finishDraft();
    return;
  }

  resetTimer(autoStart);
  save();
  render();
}

function banHero(heroId) {
  if (state.finished) return toast('Ban aşaması bitti.');
  const hero = state.heroById.get(heroId);
  if (!hero) return;

  const already = state.slots.some((s) => s.heroId === heroId);
  if (already) return toast(`${hero.name} zaten banlı.`);

  state.slots[state.cursor].heroId = heroId;
  toast(`${hero.name} banlandı.`);
  advance();
}

function skipSlot() {
  if (state.finished) return toast('Ban aşaması bitti.');
  state.slots[state.cursor].skipped = true;
  advance();
}

function undo() {
  const idx = Math.min(state.cursor, state.slots.length) - 1;
  if (idx < 0) return toast('Geri alınacak hamle yok.');

  const slot = state.slots[idx];
  if (!slot.heroId && !slot.skipped) return toast('Geri alınacak hamle yok.');

  slot.heroId = null;
  slot.skipped = false;
  state.finished = false;
  state.cursor = idx;
  state.timer.armed = false;

  closeSummary();
  resetTimer(false);
  save();
  render();
  toast('Son hamle geri alındı.');
}

function finishDraft() {
  state.finished = true;
  state.timer.armed = false;
  stopTimer();
  save();
  render();
  showSummary();
}

function resetDraft() {
  if (!window.confirm('Ban tahtası sıfırlanacak. Emin misin?')) return;
  state.slots = makeSlots(state.bansPerTeam);
  state.cursor = 0;
  state.finished = false;
  state.timer.armed = false;
  resetTimer(false);
  closeSummary();
  save();
  render();
  toast('Tahta sıfırlandı.');
}

function setBansPerTeam(value) {
  const count = Number(value);
  if (!CONFIG.banOptions.includes(count) || count === state.bansPerTeam) return;

  const touched = state.slots.some((slot) => slot.heroId || slot.skipped);
  if (touched && !window.confirm(`Tahta ${count} + ${count} için sıfırlanacak. Devam?`)) return;

  state.bansPerTeam = count;
  state.slots = makeSlots(count);
  state.cursor = 0;
  state.finished = false;
  state.timer.armed = false;
  resetTimer(false);
  closeSummary();
  save();
  render();
  toast(`Takım başına ${count} ban.`);
}

/* ---------- özet ---------- */

function summaryLines() {
  return ['blue', 'red'].map((team) => {
    const items = state.slots
      .filter((s) => s.team === team)
      .map((slot) => {
        if (slot.heroId) return state.heroById.get(slot.heroId)?.name ?? slot.heroId;
        return slot.skipped ? '(atlandı)' : '—';
      });
    return { team, label: TEAM_LABEL[team], items };
  });
}

function showSummary() {
  const lines = summaryLines();
  els.summaryBody.innerHTML = lines.map((line) => `
    <div class="${line.team}">
      <h3>${line.label}</h3>
      <p>${line.items.join(', ')}</p>
    </div>`).join('');

  if (typeof els.summary.showModal === 'function') {
    if (!els.summary.open) els.summary.showModal();
  } else {
    els.summary.setAttribute('open', '');
  }
}

function closeSummary() {
  if (typeof els.summary.close === 'function' && els.summary.open) els.summary.close();
  else els.summary.removeAttribute('open');
}

async function copySummary() {
  const text = ['BanPhase — ban aşaması', ...summaryLines()
    .map((line) => `${line.label}: ${line.items.join(', ')}`)].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    toast('Kopyalandı.');
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      toast('Kopyalandı.');
    } catch {
      toast('Kopyalanamadı — metni elle seç.');
    }
    area.remove();
  }
}

/* ---------- bildirim ---------- */

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.remove('is-visible'), 2200);
}

/* ---------- olaylar ---------- */

function bindEvents() {
  els.btnTimer.addEventListener('click', () => {
    if (state.timer.running) {
      const left = Math.max(0, Math.ceil((state.timer.deadline - Date.now()) / 1000));
      stopTimer();
      state.timer.remaining = left;
      state.timer.armed = false;
      renderTimer();
    } else {
      startTimer();
    }
  });

  els.btnSkip.addEventListener('click', skipSlot);
  els.btnUndo.addEventListener('click', undo);
  els.btnReset.addEventListener('click', resetDraft);

  els.bansToggle.addEventListener('click', (event) => {
    const button = event.target.closest('[data-bans]');
    if (!button) return;
    setBansPerTeam(button.dataset.bans);
  });
  els.btnSummary.addEventListener('click', showSummary);
  els.btnCopy.addEventListener('click', copySummary);
  els.btnClose.addEventListener('click', closeSummary);

  els.search.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderHeroes();
  });

  els.roles.addEventListener('click', (event) => {
    const button = event.target.closest('[data-role]');
    if (!button) return;
    state.role = button.dataset.role;
    renderRoles();
    renderHeroes();
  });

  els.heroGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-hero-id]');
    if (!button) return;
    banHero(button.dataset.heroId);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== els.search) {
      event.preventDefault();
      els.search.focus();
    }
  });
}

/* ---------- açılış ---------- */

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const start = () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker kaydı başarısız:', error.message);
    });
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

function cacheElements() {
  const ids = ['turn-team', 'turn-slot', 'timer', 'btn-timer', 'btn-undo', 'btn-skip',
    'btn-summary', 'btn-reset', 'search', 'roles', 'hero-grid', 'hero-count', 'empty',
    'summary', 'summary-body', 'btn-copy', 'btn-close', 'toast', 'data-badge',
    'bans-toggle', 'settings-hint'];
  for (const id of ids) els[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
}

async function boot() {
  cacheElements();
  bindEvents();
  registerServiceWorker();

  try {
    const response = await fetch(CONFIG.dataUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.heroes = Array.isArray(data.heroes) ? data.heroes : [];
    state.heroById = new Map(state.heroes.map((hero) => [hero.id, hero]));
    state.dataLoaded = true;
    state.roles = Array.isArray(data.roles) && data.roles.length
      ? data.roles
      : [...new Set(state.heroes.flatMap((hero) => hero.roles))];
    els.dataBadge.hidden = true;
  } catch (error) {
    els.dataBadge.hidden = false;
    els.dataBadge.textContent = 'veri yok';
    toast('Kahraman verisi yüklenemedi.');
    console.error(error);
  }

  const saved = restore();
  state.bansPerTeam = saved ? saved.bansPerTeam : 5;
  state.slots = saved ? saved.slots : makeSlots(state.bansPerTeam);
  state.cursor = saved ? saved.cursor : 0;
  state.finished = saved ? saved.finished : false;

  renderRoles();
  renderTimer();
  render();

  if (state.finished) showSummary();
}

boot().catch((error) => {
  console.error(error);
  const badge = document.getElementById('data-badge');
  if (badge) {
    badge.hidden = false;
    badge.textContent = 'hata';
  }
});
