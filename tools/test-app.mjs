import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appPath = resolve(root, 'assets/js/app.js');
const app = readFileSync(appPath, 'utf8').split('\nboot().catch((error) => {')[0];
const storage = new Map();
const sandbox = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  window: { confirm: () => true, prompt: () => 'QA draft' },
  Date,
  console,
};
vm.createContext(sandbox);
vm.runInContext(`${app}
render = () => {};
toast = () => {};
resetTimer = () => {};
stopTimer = () => {};
showSummary = () => {};
closeSummary = () => {};
globalThis.api = { state, sequence, buildSlots, slotMarkup, placeHero, skipSlot, undo, resetDraft, setFormat, setFirstPick, visibleHeroes, renderHeroes, renderItems, renderBuilds, save, restore, compAnalysis, saveComp, loadComps, stubCompRender: () => { renderComps = () => {}; }, els };
`, sandbox);
const { api } = sandbox;
const heroesData = JSON.parse(readFileSync(resolve(root, 'data/heroes.json'), 'utf8'));
const itemsData = JSON.parse(readFileSync(resolve(root, 'data/items.json'), 'utf8'));
const buildsData = JSON.parse(readFileSync(resolve(root, 'data/builds.json'), 'utf8'));
const { state } = api;
state.heroes = heroesData.heroes;
state.heroById = new Map(state.heroes.map((hero) => [hero.id, hero]));
state.roles = heroesData.roles;
state.dataLoaded = true;
state.items = itemsData.items;
state.builds = buildsData.builds;

for (const team of ['blue', 'red']) {
  state.format = 'tournament';
  state.firstPick = team;
  state.slots = api.buildSlots(state.format, team);
  assert.equal(state.slots.length, 20);
  assert.equal(state.slots[0].team, team, `tournament first pick ${team}`);
}
assert.equal(api.sequence('tournament').map((step) => step.type[0]).join(''), 'bbbbbbppppppbbbbpppp');

state.format = 'tournament';
state.firstPick = 'blue';
state.slots = api.buildSlots(state.format, state.firstPick);
state.cursor = 0;
api.placeHero(state.heroes[0].id);
assert.equal(state.slots[0].heroId, state.heroes[0].id, 'ban places hero');
assert.match(api.slotMarkup(state.slots[0]), new RegExp(`slot-name">${state.heroes[0].name}</span>`), 'filled draft slot shows hero name');
assert.equal(state.cursor, 1, 'ban advances cursor');
api.undo();
assert.equal(state.slots[0].heroId, null, 'undo clears last hero');
assert.equal(state.cursor, 0, 'undo restores cursor');
api.skipSlot();
assert.equal(state.slots[0].skipped, true, 'skip marks slot');
api.undo();
assert.equal(state.slots[0].skipped, false, 'undo reverses skip');
api.setFirstPick('red');
assert.equal(state.slots[0].team, 'red', 'first pick changes side');
api.setFormat('ranked');
assert.equal(state.slots.length, 20, 'ranked creates 20 steps');
assert.equal(state.slots[0].team, 'red', 'ranked respects first pick');
assert.equal(state.slots.slice(0, 10).every((slot) => slot.type === 'ban'), true, 'ranked begins with 10 bans');
state.cursor = 0;
state.freeSlot = 0;
for (let i = 0; i < 10; i += 1) api.placeHero(state.heroes[i].id);
assert.equal(state.cursor, 10, 'ranked bans advance to picks');
assert.equal(state.slots.slice(0, 10).filter((slot) => slot.heroId).length, 10, 'ranked bans fill without duplicate');
state.slots[10].heroId = state.heroes[10].id;
state.cursor = 11;
api.save();
assert.equal(api.restore().slots[10].heroId, state.heroes[10].id, 'draft survives localStorage restore');
storage.set('banphase.draft.v2', JSON.stringify({ v: 2, format: 'ranked', slots: [{ heroId: 'unknown-hero' }] }));
assert.equal(api.restore(), null, 'malformed/stale draft record is rejected without throwing');
api.resetDraft();
assert.equal(state.slots.every((slot) => !slot.heroId && !slot.skipped), true, 'reset clears draft');

state.format = 'tournament';
state.slots = api.buildSlots(state.format, 'blue');
const pickSlots = state.slots.filter((slot) => slot.type === 'pick');
pickSlots.forEach((slot, index) => { slot.heroId = state.heroes[index].id; });
api.state.comps = [];
api.stubCompRender();
api.saveComp();
assert.equal(JSON.parse(storage.get('banphase.comps.v2'))[0].name, 'QA draft', 'saved draft persistence');
assert.equal(api.loadComps().length, 1, 'saved drafts restore from localStorage');
assert.match(api.compAnalysis(pickSlots.filter((slot) => slot.team === 'blue').map((slot) => slot.heroId)).notes.join(' '), /5\/5|Tank|Destek|Nişancı|Suikastçı/, 'team analysis returns role insights');

state.query = 'miya';
state.role = 'all';
assert.deepEqual(Array.from(api.visibleHeroes(), (hero) => hero.id), ['miya'], 'hero search');
state.query = '';
state.role = 'Tank';
assert.equal(api.visibleHeroes().every((hero) => hero.roles.includes('Tank')), true, 'role filter');

Object.assign(api.els, { heroGrid: { innerHTML: '' }, heroCount: { textContent: '' }, empty: { hidden: true } });
api.renderHeroes();
assert.match(api.els.heroGrid.innerHTML, /data-hero-id=/, 'hero cards render');
Object.assign(api.els, {
  itemList: { innerHTML: '' }, itemCount: { textContent: '' }, introItems: { textContent: '' }, itemsEmpty: { hidden: true },
});
state.itemQuery = 'dilek feneri';
api.renderItems();
assert.match(api.els.itemList.innerHTML, /Açıklama doğrulanamadı/, 'uncertain item text is not presented as no passive');
state.itemQuery = 'eşleşmeyen arama';
api.renderItems();
assert.equal(api.els.itemsEmpty.hidden, false, 'item search empty state');

Object.assign(api.els, {
  buildList: { innerHTML: '' }, buildsCount: { textContent: '' },
  buildsEmpty: { hidden: true, textContent: '' }, introBuilds: { textContent: '' },
});
state.buildQuery = 'claude';
api.renderBuilds();
assert.match(api.els.buildList.innerHTML, /Claude/, 'build search matches hero name');
assert.match(api.els.buildList.innerHTML, /data-item-id="direnc-botu"/, 'build items link to item details');
state.buildQuery = 'nişancı';
api.renderBuilds();
assert.match(api.els.buildList.innerHTML, /Claude/, 'build search matches translated role');
state.buildQuery = 'eşleşmeyen';
api.renderBuilds();
assert.equal(api.els.buildsEmpty.hidden, false, 'build search empty state');
state.builds = [];
state.buildQuery = '';
api.renderBuilds();
assert.match(api.els.buildsEmpty.textContent, /kaynak bilgisi/, 'missing builds are described without inventing a recommendation');

const missingStyles = heroesData.heroes.filter((hero) => !hero.tags?.style?.length).map((hero) => hero.name).sort();
assert.deepEqual(missingStyles, ['Angela', 'Baxia', 'Kimmy', 'Valir', 'Xavier'], 'incomplete style tags are documented, not inferred');

console.log('App behavior passed: tournament/ranked turns, both first picks, ban/pick, skip, undo, reset, hero search/role filter, item search/uncertain state, build search/item links/empty state, malformed localStorage recovery.');
