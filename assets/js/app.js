'use strict';

/* BanPhase — draft tahtası
   Formatlar:
     turnuva: 3 ban → 3+3 seçim → 2 ban → 2+2 seçim
     ranked : 10 ban (aynı anda) → 1-2-2-2-2-1 seçim
   Veri cihazda; sunucuya hiçbir şey gönderilmez. */

const CONFIG = {
  banSeconds: 30,
  storageKey: 'banphase.draft.v2',
  dataUrl: './data/heroes.json',
  formats: {
    tournament: { label: 'Turnuva', hint: '3+3 ban · 3+3 seçim · 2+2 ban · 2+2 seçim', freeBans: false },
    ranked: { label: 'Ranked', hint: '10 ban aynı anda · 1-2-2-2-2-1 seçim', freeBans: true },
  },
};

const TEAM_LABEL = { blue: 'Mavi Takım', red: 'Kırmızı Takım' };
const TYPE_LABEL = { ban: 'ban', pick: 'seçim' };
const COMPS_KEY = 'banphase.comps.v2';
const COMP_ROLES = ['Tank', 'Savaşçı', 'Suikastçı', 'Büyücü', 'Nişancı', 'Destek'];

const state = {
  heroes: [],
  heroById: new Map(),
  roles: [],
  dataLoaded: false,
  slots: [],
  format: 'tournament',
  firstPick: 'blue',
  cursor: 0,
  freeSlot: null,
  query: '',
  role: 'all',
  comps: [],
  items: [],
  itemQuery: '',
  builds: [],
  buildQuery: '',
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

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/* ---------- comp analizi ---------- */

function compAnalysis(picks) {
  const coverage = {};
  const primary = {};

  for (const id of picks) {
    const hero = state.heroById.get(id);
    if (!hero) continue;
    for (const role of hero.roles) coverage[role] = (coverage[role] ?? 0) + 1;
    if (hero.primaryRole) primary[hero.primaryRole] = (primary[hero.primaryRole] ?? 0) + 1;
  }

  const notes = [];
  const has = (role) => (coverage[role] ?? 0) > 0;

  if (picks.length < 5) notes.push(`Eksik comp: ${picks.length}/5 seçim.`);
  if (!has('Tank')) notes.push('Ön saf yok: takımda Tank bulunmuyor.');
  if (!has('Destek')) notes.push('Destek yok: sürdürülebilirlik ve koruma zayıf.');
  if (!has('Nişancı')) notes.push('Nişancı yok: menzilli sürekli hasar eksik.');
  if (!has('Suikastçı')) notes.push('Suikastçı yok: arka hat tehdidi zayıf.');

  const max = Math.max(0, ...Object.values(primary));
  if (max >= 3) {
    const role = Object.keys(primary).find((r) => primary[r] === max);
    notes.push(`${max} ${role}: aynı ana rolde yığılma var.`);
  }

  // etiketler (yalnızca etiketli kahramanlar üzerinden)
  const tagInfo = { tagged: 0, engage: 0, physical: 0, magic: 0, lanes: new Set(), styles: new Set() };
  for (const id of picks) {
    const hero = state.heroById.get(id);
    if (!hero?.tags) continue;
    const tags = hero.tags;
    tagInfo.tagged += 1;
    if (tags.engage === 'high' || tags.engage === 'medium') tagInfo.engage += 1;
    if (tags.damage === 'physical') tagInfo.physical += 1;
    if (tags.damage === 'magic') tagInfo.magic += 1;
    for (const lane of tags.lanes) tagInfo.lanes.add(lane);
    for (const style of tags.style) tagInfo.styles.add(style);
  }

  if (tagInfo.tagged >= 3) {
    if (!tagInfo.engage) notes.push('Engage yok: etiketli kahramanlar arasında savaşı açan yok.');
    if (!tagInfo.physical) notes.push('Fiziksel hasar yok: tek zırh yığını yeter.');
    if (!tagInfo.magic) notes.push('Büyü hasarı yok: tek büyü direnci yeter.');
  }
  if (tagInfo.tagged > 0 && tagInfo.tagged < picks.length) {
    notes.push(`${picks.length - tagInfo.tagged} kahramanın etiketi yok; analiz kısmi.`);
  }
  if (tagInfo.tagged === 0 && picks.length > 0) {
    notes.push('Bu takımda etiketli kahraman yok; analiz yalnızca rol bazlı.');
  }

  if (!notes.length && picks.length === 5) notes.push('Rol dağılımı dengeli görünüyor.');

  return { counts: coverage, primary, notes, tagInfo, picksCount: picks.length };
}

function loadComps() {
  try {
    const raw = localStorage.getItem(COMPS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((comp) => comp
      && typeof comp.name === 'string'
      && comp.blue && Array.isArray(comp.blue.picks)
      && comp.red && Array.isArray(comp.red.picks));
  } catch {
    return [];
  }
}

function persistComps() {
  try {
    localStorage.setItem(COMPS_KEY, JSON.stringify(state.comps));
  } catch {
    /* kota */
  }
}

/* ---------- format motoru ---------- */

function sequence(format) {
  const steps = [];
  const add = (type, side, count = 1) => {
    for (let i = 0; i < count; i += 1) steps.push({ type, side });
  };

  if (format === 'ranked') {
    add('ban', 'fp', 5);
    add('ban', 'sp', 5);
    add('pick', 'fp', 1);
    add('pick', 'sp', 2);
    add('pick', 'fp', 2);
    add('pick', 'sp', 2);
    add('pick', 'fp', 2);
    add('pick', 'sp', 1);
    return steps;
  }

  add('ban', 'fp', 3);
  add('ban', 'sp', 3);
  add('pick', 'fp', 3);
  add('pick', 'sp', 3);
  add('ban', 'sp', 2);
  add('ban', 'fp', 2);
  add('pick', 'sp', 2);
  add('pick', 'fp', 2);
  return steps;
}

function buildSlots(format, firstPick) {
  const fpTeam = firstPick === 'red' ? 'red' : 'blue';
  const spTeam = fpTeam === 'blue' ? 'red' : 'blue';
  const counters = {
    blue: { ban: 0, pick: 0 },
    red: { ban: 0, pick: 0 },
  };

  return sequence(format).map((step, index) => {
    const team = step.side === 'fp' ? fpTeam : spTeam;
    const teamIndex = counters[team][step.type];
    counters[team][step.type] += 1;
    return { index, type: step.type, team, teamIndex, heroId: null, skipped: false };
  });
}

function banCount() {
  return state.slots.filter((slot) => slot.type === 'ban').length;
}

function isFreePhase() {
  return Boolean(CONFIG.formats[state.format].freeBans) && !state.finished && state.cursor < banCount();
}

function currentIndex() {
  return isFreePhase() && state.freeSlot != null ? state.freeSlot : state.cursor;
}

/* ---------- durum ---------- */

function restore() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== 2 || !Array.isArray(data.slots)) return null;

    const format = CONFIG.formats[data.format] ? data.format : 'tournament';
    const firstPick = data.firstPick === 'red' ? 'red' : 'blue';
    const expected = sequence(format).length;
    if (data.slots.length !== expected) return null;

    const slots = data.slots.map((slot, i) => {
      const known = !state.dataLoaded || state.heroById.has(slot.heroId);
      const heroId = slot.heroId && known ? slot.heroId : null;
      return {
        index: i,
        type: slot.type === 'pick' ? 'pick' : 'ban',
        team: slot.team === 'red' ? 'red' : 'blue',
        teamIndex: Number.isInteger(slot.teamIndex) ? slot.teamIndex : 0,
        heroId,
        skipped: Boolean(slot.skipped),
      };
    });

    const cursor = Math.min(Math.max(Number(data.cursor) || 0, 0), slots.length);
    const finished = Boolean(data.finished);
    return { slots, cursor, finished, format, firstPick, freeSlot: null };
  } catch {
    return null;
  }
}

function save() {
  if (!state.dataLoaded) return;
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      v: 2,
      format: state.format,
      firstPick: state.firstPick,
      slots: state.slots.map((s) => ({
        type: s.type, team: s.team, teamIndex: s.teamIndex, heroId: s.heroId, skipped: s.skipped,
      })),
      cursor: state.cursor,
      finished: state.finished,
    }));
  } catch {
    /* gizli mod / kota dolu */
  }
}

/* ---------- çizim ---------- */

function render() {
  renderTurn();
  renderBoard();
  renderLiveAnalysis();
  renderHeroes();
}

function renderLiveAnalysis() {
  const host = document.getElementById('live-analysis');
  if (!host) return;
  host.innerHTML = ['blue', 'red'].map((team) => {
    const picks = state.slots.filter((slot) => slot.team === team && slot.type === 'pick' && slot.heroId)
      .map((slot) => slot.heroId);
    const analysis = compAnalysis(picks);
    const roles = COMP_ROLES.map((role) =>
      `<span class="analysis-role${analysis.counts[role] ? ' has-role' : ''}">${escapeHtml(role)}<b>${analysis.counts[role] ?? 0}</b></span>`
    ).join('');
    const tags = analysis.tagInfo.tagged
      ? `<p class="analysis-data">Etiketli ${analysis.tagInfo.tagged}/${picks.length} · Engage ${analysis.tagInfo.engage} · Fiziksel ${analysis.tagInfo.physical} · Büyü ${analysis.tagInfo.magic}</p>`
      : `<p class="analysis-data">${picks.length ? 'Etiket verisi yok; rol özeti gösteriliyor.' : 'Seçimler geldikçe rol dağılımı burada görünür.'}</p>`;
    return `<article class="analysis-card ${team}">
      <header><span class="team-dot ${team}" aria-hidden="true"></span><h3>${TEAM_LABEL[team]}</h3><span class="analysis-total">${picks.length}/5</span></header>
      <div class="analysis-roles" aria-label="${TEAM_LABEL[team]} rol sayıları">${roles}</div>
      ${tags}
      ${analysis.tagInfo.tagged < picks.length && picks.length ? '<p class="analysis-caveat">Etiketler kısmi · analiz tahmin içerir</p>' : ''}
    </article>`;
  }).join('');
}

function renderTurn() {
  const done = state.finished;
  const slot = done ? null : state.slots[currentIndex()];

  els.turnTeam.dataset.team = done ? 'done' : slot.team;

  if (done) {
    els.turnTeam.textContent = 'Draft tamam';
    els.turnSlot.textContent = 'Özeti açıp takımına yapıştırabilirsin.';
  } else if (isFreePhase()) {
    const filled = state.slots.filter((s) => s.type === 'ban' && s.heroId).length;
    els.turnTeam.textContent = `${TEAM_LABEL[slot.team]} · serbest ban`;
    els.turnSlot.textContent = `${filled}/${banCount()} ban · sırayı sen seç`;
  } else {
    const next = state.slots.slice(state.cursor + 1, state.cursor + 3)
      .map((s) => (s.team === 'blue' ? 'Mavi' : 'Kırmızı'));
    const nextText = next.length ? ` · sırada ${next.join(', ')}` : '';
    els.turnTeam.textContent = TEAM_LABEL[slot.team];
    els.turnSlot.textContent = `${slot.teamIndex + 1}. ${TYPE_LABEL[slot.type]} · ${state.cursor + 1}/${state.slots.length}${nextText}`;
  }

  const progressMax = state.slots.length;
  const progressValue = state.slots.filter((item) => item.heroId || item.skipped).length;
  const progressText = `${progressValue} / ${progressMax} hamle`;
  if (els.draftProgress) {
    els.draftProgress.setAttribute('aria-valuemax', String(progressMax));
    els.draftProgress.setAttribute('aria-valuenow', String(progressValue));
    els.draftProgress.setAttribute('aria-valuetext', state.finished ? 'Draft tamamlandı' : progressText);
  }
  if (els.draftProgressLabel) els.draftProgressLabel.textContent = state.finished ? 'Tamamlandı' : progressText;
  if (els.progressFill) els.progressFill.style.width = `${progressMax ? (progressValue / progressMax) * 100 : 0}%`;

  els.formatToggle?.querySelectorAll('[data-format]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.format === state.format));
  });
  els.firstpickToggle?.querySelectorAll('[data-firstpick]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.firstpick === state.firstPick));
  });
  if (els.settingsHint) els.settingsHint.textContent = CONFIG.formats[state.format].hint;

  els.btnTimer.textContent = state.timer.running ? 'Duraklat' : 'Başlat';
  els.btnTimer.disabled = done || isFreePhase();
  els.btnTimer.hidden = isFreePhase();
  els.timer.hidden = isFreePhase();
  els.btnSkip.disabled = done;
  els.btnUndo.disabled = !hasHistory();
  els.btnSummary.hidden = !done;

  document.querySelectorAll('.team').forEach((card) => {
    const team = card.dataset.team;
    card.classList.toggle('is-turn', !done && slot.team === team);
  });

  const draft = document.querySelector('.draft');
  if (draft) draft.classList.toggle('is-free', isFreePhase());
}

function slotMarkup(slot) {
  const hero = slot.heroId ? state.heroById.get(slot.heroId) : null;
  const isActive = slot.index === (state.finished ? -1 : currentIndex());
  const classes = ['slot'];
  if (slot.type === 'pick') classes.push('is-pick');
  if (slot.heroId) classes.push('is-filled');
  if (slot.skipped) classes.push('is-skipped');
  if (isActive) classes.push('is-active');

  const tone = hero ? hue(hero.id) : 'transparent';
  const face = hero ? initials(hero.name) : (slot.heroId ? '?' : '—');
  const canSelect = isFreePhase() && slot.type === 'ban' && !slot.heroId;
  const label = `${TEAM_LABEL[slot.team]}, ${slot.teamIndex + 1}. ${slot.type === 'ban' ? 'ban' : 'seçim'}, ${hero?.name ?? (slot.skipped ? 'atlandı' : 'boş')}`;
  return `<li class="slot-cell">
    <button class="${classes.join(' ')}" type="button" data-index="${slot.index}" data-kind="${slot.type}"
      aria-label="${escapeHtml(label)}"${isActive ? ' aria-current="step"' : ''}${canSelect ? '' : ' disabled'} style="--tone:${tone}">
      <span class="slot-no">${slot.teamIndex + 1}</span>
      <span class="slot-face">${hero
        ? `<span class="slot-initials">${escapeHtml(face)}</span><span class="slot-name">${escapeHtml(hero.name)}</span>`
        : slot.type === 'pick'
          ? `<span class="slot-initials">${escapeHtml(face)}</span><span class="slot-name">Oyuncu ${slot.teamIndex + 1}</span>`
          : `<span class="slot-initials">${escapeHtml(face)}</span>`}</span>
    </button>
  </li>`;
}

function renderBoard() {
  for (const team of ['blue', 'red']) {
    const host = document.getElementById(`slots-${team}`);
    if (!host) continue;

    const teamSlots = state.slots.filter((slot) => slot.team === team);
    host.innerHTML = ['ban', 'pick'].map((type) => {
      const group = teamSlots.filter((slot) => slot.type === type);
      if (!group.length) return '';
      const label = type === 'ban' ? 'Ban' : 'Seçim';
      return `<div class="slot-row">
        <span class="row-label">${label}</span>
        <ul class="slots" style="--cols:${group.length}">${group.map(slotMarkup).join('')}</ul>
      </div>`;
    }).join('');

    const bans = teamSlots.filter((s) => s.type === 'ban');
    const picks = teamSlots.filter((s) => s.type === 'pick');
    const chip = document.querySelector(`[data-count="${team}"]`);
    if (chip) {
      chip.textContent = `${bans.filter((s) => s.heroId).length}/${bans.length} ban · ${picks.filter((s) => s.heroId).length}/${picks.length} seçim`;
    }
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

function heroUsage() {
  const map = new Map();
  for (const slot of state.slots) {
    if (slot.heroId) map.set(slot.heroId, slot.type);
  }
  return map;
}

function renderHeroes() {
  const used = heroUsage();
  const list = visibleHeroes();

  els.heroCount.textContent = list.length === state.heroes.length
    ? `${state.heroes.length}`
    : `${list.length} / ${state.heroes.length}`;
  els.empty.hidden = list.length > 0 || state.heroes.length === 0;

  els.heroGrid.innerHTML = list.map((hero) => {
    const usage = used.get(hero.id);
    const classes = ['hero'];
    if (usage === 'ban') classes.push('is-banned');
    if (usage === 'pick') classes.push('is-picked');
    const roleText = hero.roles.join(' · ');
    const stateText = usage === 'ban' ? ', banlandı' : (usage === 'pick' ? ', seçildi' : '');
    return `<button class="${classes.join(' ')}" type="button"
      data-hero-id="${hero.id}" data-primary-role="${escapeHtml(hero.primaryRole ?? hero.roles[0] ?? '')}" ${usage ? 'disabled' : ''}
      aria-label="${escapeHtml(hero.name)}, ${escapeHtml(roleText)}${stateText}">
      <span class="hero-art" style="--tone:${hue(hero.id)}"><span class="hero-initials">${escapeHtml(initials(hero.name))}</span></span>
      <span class="hero-name">${escapeHtml(hero.name)}</span>
      <span class="hero-role">${escapeHtml(roleText)}</span>
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
  if (state.finished || state.timer.running || isFreePhase()) return;
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
  if (state.finished || isFreePhase()) return;
  state.slots[state.cursor].skipped = true;
  toast('Süre doldu — bu sıra atlandı.');
  state.timer.armed = false;
  advance({ autoStart: false });
}

/* ---------- hamleler ---------- */

function hasHistory() {
  return state.slots.some((slot) => slot.heroId || slot.skipped);
}

function advance(options = {}) {
  const autoStart = options.autoStart ?? state.timer.armed;

  if (isFreePhase()) {
    const nextEmpty = state.slots.findIndex((s) => s.type === 'ban' && !s.heroId && !s.skipped);
    if (nextEmpty === -1) {
      state.cursor = banCount();
      state.freeSlot = null;
      resetTimer(autoStart);
    } else {
      state.freeSlot = nextEmpty;
    }
  } else {
    state.cursor += 1;
    if (state.cursor >= state.slots.length) {
      finishDraft();
      return;
    }
    resetTimer(autoStart);
  }

  save();
  render();
}

function placeHero(heroId) {
  if (state.finished) return toast('Draft bitti.');
  const hero = state.heroById.get(heroId);
  if (!hero) return;

  if (state.slots.some((s) => s.heroId === heroId)) return toast(`${hero.name} zaten kullanıldı.`);

  const idx = currentIndex();
  const slot = state.slots[idx];
  slot.heroId = heroId;

  const verb = slot.type === 'ban' ? 'banlandı' : 'seçildi';
  toast(`${hero.name} ${verb}.`);

  if (isFreePhase()) {
    const nextEmpty = state.slots.findIndex((s) => s.type === 'ban' && !s.heroId && !s.skipped && s.index !== idx);
    state.freeSlot = nextEmpty === -1 ? idx : nextEmpty;
    if (nextEmpty === -1) {
      state.cursor = banCount();
      state.freeSlot = null;
      save();
      render();
      return;
    }
    save();
    render();
    return;
  }

  advance();
}

function skipSlot() {
  if (state.finished) return toast('Draft bitti.');
  const idx = currentIndex();
  state.slots[idx].skipped = true;
  advance();
}

function undo() {
  let idx = -1;
  for (let i = state.slots.length - 1; i >= 0; i -= 1) {
    if (state.slots[i].heroId || state.slots[i].skipped) { idx = i; break; }
  }
  if (idx < 0) return toast('Geri alınacak hamle yok.');

  const slot = state.slots[idx];
  slot.heroId = null;
  slot.skipped = false;
  state.finished = false;

  if (CONFIG.formats[state.format].freeBans && slot.type === 'ban') {
    state.cursor = 0;
    state.freeSlot = idx;
  } else {
    state.freeSlot = null;
    state.cursor = idx;
  }

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
  if (!window.confirm('Tahta sıfırlanacak. Emin misin?')) return;
  state.slots = buildSlots(state.format, state.firstPick);
  state.cursor = 0;
  state.freeSlot = null;
  state.finished = false;
  state.timer.armed = false;
  resetTimer(false);
  closeSummary();
  save();
  render();
  toast('Tahta sıfırlandı.');
}

function setFormat(format) {
  if (!CONFIG.formats[format] || format === state.format) return;
  if (hasHistory() && !window.confirm('Format değişince tahta sıfırlanır. Devam?')) return;
  state.format = format;
  state.slots = buildSlots(format, state.firstPick);
  state.cursor = 0;
  state.freeSlot = null;
  state.finished = false;
  state.timer.armed = false;
  resetTimer(false);
  closeSummary();
  save();
  render();
  toast(`${CONFIG.formats[format].label}: ${CONFIG.formats[format].hint}`);
}

function setFirstPick(team) {
  if (!['blue', 'red'].includes(team) || team === state.firstPick) return;
  if (hasHistory() && !window.confirm('İlk seçim değişince tahta sıfırlanır. Devam?')) return;
  state.firstPick = team;
  state.slots = buildSlots(state.format, team);
  state.cursor = 0;
  state.freeSlot = null;
  state.finished = false;
  state.timer.armed = false;
  resetTimer(false);
  closeSummary();
  save();
  render();
  toast(`İlk seçim: ${TEAM_LABEL[team]}.`);
}

/* ---------- özet ---------- */

function summaryRows() {
  return ['blue', 'red'].map((team) => {
    const pick = (type) => state.slots
      .filter((s) => s.team === team && s.type === type)
      .map((slot) => {
        if (slot.heroId) return state.heroById.get(slot.heroId)?.name ?? slot.heroId;
        return slot.skipped ? '(atlandı)' : '—';
      });
    return { team, label: TEAM_LABEL[team], bans: pick('ban'), picks: pick('pick') };
  });
}

function showSummary() {
  const rows = summaryRows();

  const blocks = ['blue', 'red'].map((team) => {
    const picks = state.slots
      .filter((s) => s.team === team && s.type === 'pick' && s.heroId)
      .map((s) => s.heroId);
    const analysis = compAnalysis(picks);
    const roleLine = COMP_ROLES.filter((role) => analysis.primary[role])
      .map((role) => `${role} ${analysis.primary[role]}`).join(' · ');
    const tagLine = analysis.tagInfo.tagged
      ? `Etiket ${analysis.tagInfo.tagged}/${analysis.picksCount} · engage ${analysis.tagInfo.engage} · fiziksel ${analysis.tagInfo.physical} / büyü ${analysis.tagInfo.magic} · koridor: ${[...analysis.tagInfo.lanes].join(', ') || '—'}`
      : null;
    return `<div class="analysis ${team}">
      <h3>${TEAM_LABEL[team]} kompozisyonu</h3>
      <p class="muted">${roleLine ? `Ana roller: ${roleLine}` : 'Henüz seçim yok'}</p>
      ${tagLine ? `<p class="muted">${escapeHtml(tagLine)}</p>` : ''}
      <ul>${analysis.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
    </div>`;
  }).join('');

  els.summaryBody.innerHTML = `${rows.map((row) => `
    <div class="${row.team}">
      <h3>${row.label}</h3>
      <p><strong>Ban:</strong> ${row.bans.join(', ')}</p>
      <p><strong>Seçim:</strong> ${row.picks.join(', ')}</p>
    </div>`).join('')}${blocks}`;

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
  const rows = summaryRows();
  const head = `BanPhase — ${CONFIG.formats[state.format].label} · İlk seçim: ${state.firstPick === 'blue' ? 'Mavi' : 'Kırmızı'}`;
  const text = [head, ...rows.flatMap((row) => [
    `${row.label} — Ban: ${row.bans.join(', ')}`,
    `${row.label} — Seçim: ${row.picks.join(', ')}`,
  ])].join('\n');

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

/* ---------- comp kaydı ---------- */

function saveComp() {
  const teamData = (team) => ({
    picks: state.slots.filter((s) => s.team === team && s.type === 'pick' && s.heroId).map((s) => s.heroId),
    bans: state.slots.filter((s) => s.team === team && s.type === 'ban' && s.heroId).map((s) => s.heroId),
  });

  const blue = teamData('blue');
  const red = teamData('red');
  if (blue.picks.length < 5 || red.picks.length < 5) {
    return toast('Kaydetmek için iki takımın da 5 seçimi olmalı.');
  }

  const name = window.prompt('Draft adı', `Draft ${state.comps.length + 1}`);
  if (!name || !name.trim()) return;

  state.comps.unshift({
    id: `c${Date.now()}`,
    name: name.trim().slice(0, 60),
    at: new Date().toISOString().slice(0, 10),
    format: state.format,
    firstPick: state.firstPick,
    blue,
    red,
  });

  persistComps();
  renderComps();
  toast('Draft kaydedildi.');
}

function renderComps() {
  if (!els.compList) return;
  els.compsCount.textContent = state.comps.length ? `${state.comps.length}` : '';
  els.compsEmpty.hidden = state.comps.length > 0;

  const teamRow = (team, data) => {
    const avatars = data.picks.map((id) => {
      const hero = state.heroById.get(id);
      return `<span class="comp-hero" style="--tone:${hero ? hue(hero.id) : '#243049'}" title="${hero ? escapeHtml(hero.name) : id}">${hero ? initials(hero.name) : '?'}</span>`;
    }).join('');
    const analysis = compAnalysis(data.picks);
    const roles = COMP_ROLES.filter((role) => analysis.primary[role])
      .map((role) => `${role} ${analysis.primary[role]}`).join(' · ');
    return `<div class="comp-team">
      <span class="team-dot ${team}" aria-hidden="true"></span>
      <div class="comp-team-body">
        <div class="comp-heroes">${avatars}</div>
        <p class="comp-meta">${roles || '—'}</p>
      </div>
    </div>`;
  };

  els.compList.innerHTML = state.comps.map((comp) => `<article class="comp-card">
    <header>
      <strong>${escapeHtml(comp.name)}</strong>
      <button class="comp-del" type="button" data-del="${comp.id}" aria-label="${escapeHtml(comp.name)} kaydını sil">×</button>
    </header>
    ${teamRow('blue', comp.blue)}
    ${teamRow('red', comp.red)}
    <p class="comp-meta">${comp.format === 'ranked' ? 'Ranked' : 'Turnuva'} · ${comp.at}</p>
  </article>`).join('');
}

function deleteComp(id) {
  state.comps = state.comps.filter((comp) => comp.id !== id);
  persistComps();
  renderComps();
  toast('Comp silindi.');
}

/* ---------- eşyalar ---------- */

const CAT_TR = { attack: 'Saldırı', magic: 'Büyü', defense: 'Savunma', movement: 'Hareket', kutsama: 'Kutsama', other: 'Diğer' };

function renderItems() {
  if (!els.itemList) return;
  els.itemCount.textContent = state.items.length ? `${state.items.length}` : '';
  if (els.introItems) els.introItems.textContent = String(state.items.length);

  const q = fold(state.itemQuery.trim());
  const list = state.items.filter((item) => {
    if (!q) return true;
    if (fold(item.nameTr).includes(q)) return true;
    if (fold(item.passiveTr ?? '').includes(q)) return true;
    return (item.stats ?? []).some((stat) => fold(stat.labelTr).includes(q));
  });

  els.itemsEmpty.hidden = list.length > 0 || state.items.length === 0;

  els.itemList.innerHTML = list.map((item) => {
    const stats = (item.stats ?? [])
      .map((stat) => `<span class="item-stat">+${stat.value}${stat.percent ? '%' : ''} ${escapeHtml(stat.labelTr)}</span>`)
      .join('');
    return `<article class="item-card">
      <div class="item-head">
        <span class="item-name">${escapeHtml(item.nameTr)}</span>
        <span class="item-cat">${CAT_TR[item.category] ?? ''}</span>
      </div>
      <div class="item-stats">${stats || '<span class="item-stat">stat yok</span>'}</div>
      <p class="item-passive">${item.passiveTr ? escapeHtml(item.passiveTr) : item.dataQuality?.status === 'partial'
        ? `<span class="data-note" title="${escapeHtml(item.dataQuality.note ?? 'Kaynak metin doğrulanamadı.')}">Açıklama doğrulanamadı</span>`
        : '<span class="muted">Pasif yok — yalnızca stat verir.</span>'}</p>
    </article>`;
  }).join('');
}

/* ---------- build'ler ---------- */

const ROLE_TR = {
  tank: 'Tank', fighter: 'Savaşçı', assassin: 'Suikastçı', mage: 'Büyücü',
  marksman: 'Nişancı', support: 'Destek',
};

function itemById(id) {
  return state.items.find((item) => item.id === id) ?? null;
}

function renderBuilds() {
  if (!els.buildList) return;
  const query = fold(state.buildQuery.trim());
  const builds = state.builds.filter((build) => {
    if (!query) return true;
    const hero = state.heroById.get(build.heroId);
    const role = String(build.role ?? '');
    const roleLabel = ROLE_TR[role.toLowerCase()] ?? role;
    const itemNames = (build.items ?? []).map((id) => itemById(id)?.nameTr ?? id);
    const searchable = [hero?.name, build.heroId, role, roleLabel, build.lane, build.note, ...itemNames]
      .filter(Boolean).join(' ');
    return fold(searchable).includes(query);
  });
  els.buildsCount.textContent = state.buildQuery.trim()
    ? `${builds.length}/${state.builds.length}`
    : state.builds.length ? `${state.builds.length}` : '';
  if (els.introBuilds) els.introBuilds.textContent = String(state.builds.length);
  els.buildsEmpty.hidden = builds.length > 0;
  if (!builds.length) {
    els.buildsEmpty.textContent = state.builds.length
      ? 'Bu aramaya uyan build yok.'
      : 'Henüz kaynak bilgisi bulunan build eklenmedi; öneri uydurulmuyor.';
  }

  els.buildList.innerHTML = builds.map((build) => {
    const hero = state.heroById.get(build.heroId);
    const name = hero ? hero.name : build.heroId;
    const role = ROLE_TR[String(build.role ?? '').toLowerCase()] ?? build.role ?? '';
    const items = (build.items ?? []).map((id) => {
      const item = itemById(id);
      const label = item ? item.nameTr : id;
      return `<button class="build-item" type="button" data-item-id="${escapeHtml(id)}">${escapeHtml(label)}</button>`;
    }).join('');

    return `<article class="build-card">
      <div class="build-head">
        <span class="build-hero">${escapeHtml(name)}</span>
        <span class="build-role">${escapeHtml(role)}</span>
      </div>
      <div class="build-items">${items || '<span class="muted">eşya yok</span>'}</div>
      ${build.note ? `<p class="build-note">${escapeHtml(build.note)}</p>` : ''}
    </article>`;
  }).join('');
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
  els.btnSummary.addEventListener('click', showSummary);
  els.btnCopy.addEventListener('click', copySummary);
  els.btnClose.addEventListener('click', closeSummary);
  els.btnSaveComp.addEventListener('click', saveComp);

  els.compList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-del]');
    if (button) deleteComp(button.dataset.del);
  });

  els.formatToggle.addEventListener('click', (event) => {
    const button = event.target.closest('[data-format]');
    if (button) setFormat(button.dataset.format);
  });

  els.firstpickToggle.addEventListener('click', (event) => {
    const button = event.target.closest('[data-firstpick]');
    if (button) setFirstPick(button.dataset.firstpick);
  });

  els.search.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderHeroes();
  });

  els.itemSearch?.addEventListener('input', (event) => {
    state.itemQuery = event.target.value;
    renderItems();
  });

  els.buildSearch?.addEventListener('input', (event) => {
    state.buildQuery = event.target.value;
    renderBuilds();
  });

  els.buildList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-item-id]');
    if (!button) return;
    const item = itemById(button.dataset.itemId);
    if (!item) return;
    const block = document.getElementById('items');
    if (block) block.open = true;
    state.itemQuery = item.nameTr;
    if (els.itemSearch) els.itemSearch.value = item.nameTr;
    renderItems();
    block?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    if (button) placeHero(button.dataset.heroId);
  });

  document.querySelector('.draft')?.addEventListener('click', (event) => {
    if (!isFreePhase()) return;
    const el = event.target.closest('.slot');
    if (!el) return;
    const idx = Number(el.dataset.index);
    const slot = state.slots[idx];
    if (!slot || slot.type !== 'ban' || slot.heroId) return;
    state.freeSlot = idx;
    render();
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement
      && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (event.key === '/' && !event.altKey && !event.ctrlKey && !event.metaKey
      && !isTyping && document.activeElement !== els.search) {
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

function renderConnectionStatus() {
  const label = document.getElementById('connection-status');
  const dot = document.getElementById('connection-dot');
  if (!label) return;
  const online = navigator.onLine;
  label.textContent = online ? 'Çevrimiçi' : 'Çevrim dışı';
  dot?.classList.toggle('is-offline', !online);
}

function cacheElements() {
  const ids = ['turn-team', 'turn-slot', 'timer', 'btn-timer', 'btn-undo', 'btn-skip',
    'btn-summary', 'btn-reset', 'search', 'roles', 'hero-grid', 'hero-count', 'empty',
    'summary', 'summary-body', 'btn-copy', 'btn-close', 'toast', 'data-badge',
    'format-toggle', 'firstpick-toggle', 'settings-hint',
    'btn-save-comp', 'comp-list', 'comps-count', 'comps-empty',
    'item-search', 'item-list', 'item-count', 'items-empty',
    'build-search', 'build-list', 'builds-count', 'builds-empty', 'intro-items', 'intro-builds',
    'draft-progress', 'draft-progress-label', 'progress-fill'];
  for (const id of ids) els[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
}

async function boot() {
  cacheElements();
  bindEvents();
  renderConnectionStatus();
  window.addEventListener('online', renderConnectionStatus);
  window.addEventListener('offline', renderConnectionStatus);
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

  try {
    const response = await fetch('./data/items.json', { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      state.items = Array.isArray(data.items) ? data.items : [];
    }
  } catch {
    state.items = [];
  }

  try {
    const response = await fetch('./data/builds.json', { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      state.builds = Array.isArray(data.builds) ? data.builds : [];
    }
  } catch {
    state.builds = [];
  }

  const saved = restore();
  state.format = saved ? saved.format : 'tournament';
  state.firstPick = saved ? saved.firstPick : 'blue';
  state.slots = saved ? saved.slots : buildSlots(state.format, state.firstPick);
  state.cursor = saved ? saved.cursor : 0;
  state.finished = saved ? saved.finished : false;
  state.freeSlot = null;

  if (!saved && state.format === 'ranked') state.freeSlot = 0;

  state.comps = loadComps();
  renderRoles();
  renderComps();
  renderItems();
  renderBuilds();
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
