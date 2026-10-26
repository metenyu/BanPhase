'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { SIM_CONFIG, analyzeTeam, simulateBattle } = require('../assets/js/simulation.js');

const tags = [
  { heroId: 'g', lanes: ['gold'], damage: 'physical', engage: 'low' },
  { heroId: 'e', lanes: ['exp'], damage: 'physical', engage: 'medium' },
  { heroId: 'm', lanes: ['mid'], damage: 'magic', engage: 'low' },
  { heroId: 'j', lanes: ['jungle'], damage: 'physical', engage: 'high' },
  { heroId: 'r', lanes: ['roam'], damage: 'mixed', engage: 'medium' },
  { heroId: 'g2', lanes: ['gold'], damage: 'magic', engage: 'low' },
  { heroId: 'g3', lanes: ['gold'], damage: 'physical', engage: 'low' },
];

test('aynı girdi her zaman aynı savaş sonucunu üretir', () => {
  const first = simulateBattle(['g', 'e', 'm', 'j', 'r'], ['g2', 'e', 'm', 'j', 'r'], tags);
  const second = simulateBattle(['g', 'e', 'm', 'j', 'r'], ['g2', 'e', 'm', 'j', 'r'], tags);
  assert.deepStrictEqual(first, second);
});

test('maksimum eşleşme beş ayrı lanei tam, üç aynı-lane kahramanı eksik sayar', () => {
  assert.equal(analyzeTeam(['g', 'e', 'm', 'j', 'r'], tags).laneStatus, 'Tam');
  const repeated = analyzeTeam(['g', 'g2', 'g3'], tags);
  assert.equal(repeated.laneStatus, 'Eksik');
  assert.equal(repeated.laneCount, 1);
  assert.ok(repeated.missingLanes.includes('roam'));
});

test('lane eşleştirmesi greedy seçim yerine maksimum eşleşmeyi bulur', () => {
  const result = analyzeTeam(['flex', 'gold-only'], [
    { heroId: 'flex', lanes: ['gold', 'exp'], damage: 'physical', engage: 'low' },
    { heroId: 'gold-only', lanes: ['gold'], damage: 'magic', engage: 'low' },
  ]);
  assert.equal(result.laneCount, 2);
});

test('eşit takımlar berabere kalabilir; en fazla beş lane karara bağlanır', () => {
  const result = simulateBattle(['g', 'e', 'm', 'j', 'r'], ['g', 'e', 'm', 'j', 'r'], tags);
  assert.equal(result.winner, 'draw');
  assert.equal(result.laneWins.blue + result.laneWins.red + result.laneWins.draw, 5);
});

test('MVP kazanan takımdan seçilir ve eşitlikte önce seçilen kahraman kalır', () => {
  const blue = ['g', 'e', 'm', 'j', 'r'];
  const red = ['u1', 'u2', 'u3', 'u4', 'u5'];
  const result = simulateBattle(blue, red, tags);
  assert.equal(result.winner, 'blue');
  assert.ok(blue.includes(result.mvp.heroId));
  const topScore = Math.max(...blue.map((id) => result.individualScores.blue[id]));
  assert.equal(result.mvp.heroId, blue.find((id) => result.individualScores.blue[id] === topScore));
});

test('eksik etiket nötr kabul edilir ve hata üretmez', () => {
  const result = simulateBattle(['unknown', 'e', 'm', 'j', 'r'], ['unknown', 'e', 'm', 'j', 'r'], tags);
  assert.equal(result.individualScores.blue.unknown, SIM_CONFIG.individualBase);
  assert.doesNotThrow(() => analyzeTeam(['unknown'], tags));
});

test('seri skoru lane sonuçlarıyla tutarlıdır', () => {
  const result = simulateBattle(['g', 'e', 'm', 'j', 'r'], ['g2', 'e', 'm', 'j', 'r'], tags);
  assert.equal(result.laneWins.blue, result.lanes.filter((lane) => lane.winner === 'blue').length);
  assert.equal(result.laneWins.red, result.lanes.filter((lane) => lane.winner === 'red').length);
  assert.equal(result.laneWins.draw, result.lanes.filter((lane) => lane.winner === 'draw').length);
  assert.equal(result.series, `${result.laneWins.blue}-${result.laneWins.red}`);
});
