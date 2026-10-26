'use strict';

/* Deterministic, data-only BanPhase draft simulation. */
const SIM_CONFIG = Object.freeze({
  lanes: Object.freeze(['gold', 'exp', 'mid', 'jungle', 'roam']),
  laneLabels: Object.freeze({ gold: 'Altın koridoru', exp: 'EXP koridoru', mid: 'Orta koridor', jungle: 'Orman', roam: 'Dolaşım' }),
  weights: Object.freeze({ lane: 0.5, damage: 0.25, engage: 0.25 }),
  battleMs: 7000,
  individualBase: 10,
  laneBonus: 2,
  engageBonus: Object.freeze({ high: 3, medium: 2, low: 1 }),
  balancedDamageScore: 100,
  singleDamageScore: 50,
  engageReadyScore: 100,
  engageWeakScore: 0,
  requiredLaneCoverage: 5,
  partialLaneCoverage: 4,
  damageTypesForBalance: 2,
  mediumEngageRequired: 2,
  teamAnalysisDivisor: 10,
});

function tagsById(tags) {
  if (tags instanceof Map) return tags;
  return new Map((Array.isArray(tags) ? tags : [])
    .filter((item) => item && typeof item.heroId === 'string')
    .map((item) => [item.heroId, item]));
}

function assignLanes(heroIds, tags, config = SIM_CONFIG) {
  const tagMap = tagsById(tags);
  const lanes = config.lanes;
  const laneToIndex = new Map();
  const heroToLane = new Map();
  const candidates = (Array.isArray(heroIds) ? heroIds : []).map((heroId, index) => ({
    heroId, index, lanes: tagMap.get(heroId)?.lanes,
  }));

  function place(heroIndex, visited) {
    const hero = candidates[heroIndex];
    for (const lane of lanes) {
      if (!Array.isArray(hero.lanes) || !hero.lanes.includes(lane) || visited.has(lane)) continue;
      visited.add(lane);
      const previous = laneToIndex.get(lane);
      if (previous === undefined || place(previous, visited)) {
        laneToIndex.set(lane, heroIndex);
        heroToLane.set(heroIndex, lane);
        return true;
      }
    }
    return false;
  }

  candidates.forEach((_, index) => place(index, new Set()));
  const matched = new Set(laneToIndex.keys());
  const unmatchedHeroes = candidates.map((_, index) => index).filter((index) => !heroToLane.has(index));
  const laneAssignments = lanes.map((lane) => {
    const matchedIndex = laneToIndex.get(lane);
    if (matchedIndex !== undefined) return { lane, heroId: candidates[matchedIndex].heroId, flexible: false };
    const fallbackIndex = unmatchedHeroes.shift();
    return { lane, heroId: fallbackIndex === undefined ? null : candidates[fallbackIndex].heroId, flexible: fallbackIndex !== undefined };
  });
  return { count: matched.size, missing: lanes.filter((lane) => !matched.has(lane)), laneAssignments, matched };
}

function analyzeTeam(heroIds, tags, config = SIM_CONFIG) {
  const tagMap = tagsById(tags);
  const ids = Array.isArray(heroIds) ? heroIds.filter((id) => typeof id === 'string' && id) : [];
  const assignment = assignLanes(ids, tagMap, config);
  let physical = 0;
  let magic = 0;
  let high = 0;
  let medium = 0;
  for (const id of ids) {
    const tag = tagMap.get(id);
    if (!tag) continue;
    if (tag.damage === 'physical' || tag.damage === 'mixed') physical += 1;
    if (tag.damage === 'magic' || tag.damage === 'mixed') magic += 1;
    if (tag.engage === 'high') high += 1;
    if (tag.engage === 'medium') medium += 1;
  }
  const damageTypeCount = Number(physical > 0) + Number(magic > 0);
  const damageStatus = damageTypeCount >= config.damageTypesForBalance ? 'Dengeli' : damageTypeCount ? 'Tek tip' : 'Veri yok';
  const engageReady = high > 0 || medium >= config.mediumEngageRequired;
  const laneScore = assignment.count / config.requiredLaneCoverage * 100;
  const damageScore = damageTypeCount >= config.damageTypesForBalance ? config.balancedDamageScore
    : damageTypeCount ? config.singleDamageScore : 0;
  const engageScore = engageReady ? config.engageReadyScore : config.engageWeakScore;
  const score = Math.round(laneScore * config.weights.lane
    + damageScore * config.weights.damage + engageScore * config.weights.engage);
  return {
    heroIds: ids, laneCount: assignment.count, missingLanes: assignment.missing,
    laneStatus: assignment.count >= config.requiredLaneCoverage ? 'Tam' : assignment.count >= config.partialLaneCoverage ? 'Kısmi' : 'Eksik',
    physical, magic, damageStatus, high, medium, engageReady,
    engageStatus: engageReady ? 'Savaşa girebilir' : 'Girişi zayıf',
    laneScore, damageScore, engageScore, score,
  };
}

function simulateBattle(blueTeam, redTeam, tags, config = SIM_CONFIG) {
  const tagMap = tagsById(tags);
  const teams = { blue: Array.isArray(blueTeam) ? blueTeam : [], red: Array.isArray(redTeam) ? redTeam : [] };
  const analysis = {
    blue: analyzeTeam(teams.blue, tagMap, config),
    red: analyzeTeam(teams.red, tagMap, config),
  };
  const individual = { blue: new Map(), red: new Map() };
  const teamScore = {};
  for (const team of ['blue', 'red']) {
    const assigned = assignLanes(teams[team], tagMap, config).laneAssignments;
    for (const [index, slot] of assigned.entries()) {
      if (!slot.heroId) continue;
      const tag = tagMap.get(slot.heroId);
      const engage = config.engageBonus[tag?.engage] ?? 0;
      const laneBonus = !slot.flexible && Array.isArray(tag?.lanes) && tag.lanes.includes(slot.lane)
        ? config.laneBonus : 0;
      individual[team].set(slot.heroId, config.individualBase + engage + laneBonus);
      slot.individualScore = config.individualBase + engage + laneBonus;
      slot.pickOrder = index;
    }
    teamScore[team] = [...individual[team].values()].reduce((sum, score) => sum + score, 0) + analysis[team].score / config.teamAnalysisDivisor;
  }

  const lanes = config.lanes.map((lane, index) => {
    const blue = assignLanes(teams.blue, tagMap, config).laneAssignments[index];
    const red = assignLanes(teams.red, tagMap, config).laneAssignments[index];
    const blueScore = blue?.heroId ? individual.blue.get(blue.heroId) ?? config.individualBase : null;
    const redScore = red?.heroId ? individual.red.get(red.heroId) ?? config.individualBase : null;
    const winner = blueScore === null || redScore === null || blueScore === redScore
      ? 'draw' : blueScore > redScore ? 'blue' : 'red';
    return { lane, label: config.laneLabels[lane] ?? lane, blueHeroId: blue?.heroId ?? null,
      redHeroId: red?.heroId ?? null, blueScore, redScore, winner,
      blueFlexible: Boolean(blue?.flexible), redFlexible: Boolean(red?.flexible) };
  });
  const laneWins = { blue: lanes.filter((item) => item.winner === 'blue').length,
    red: lanes.filter((item) => item.winner === 'red').length,
    draw: lanes.filter((item) => item.winner === 'draw').length };
  let winner = laneWins.blue > laneWins.red ? 'blue' : laneWins.red > laneWins.blue ? 'red'
    : teamScore.blue === teamScore.red ? 'draw' : teamScore.blue > teamScore.red ? 'blue' : 'red';
  let mvp = null;
  if (winner !== 'draw') {
    for (const [pickOrder, heroId] of teams[winner].entries()) {
      const score = individual[winner].get(heroId) ?? config.individualBase;
      if (!mvp || score > mvp.score) {
        const tag = tagMap.get(heroId);
        const reasons = [];
        if (tag?.engage) reasons.push(`${tag.engage} engage`);
        const assignedLane = lanes.find((item) => item[`${winner}HeroId`] === heroId && !item[`${winner}Flexible`]);
        if (assignedLane) reasons.push('koridor eşleşmesi');
        mvp = { heroId, score, pickOrder, reason: reasons.length ? `En yüksek bireysel puan: ${reasons.join(' ve ')}.` : 'Kazanan takımın en yüksek bireysel puanını aldı.' };
      }
    }
  }
  return { winner, teamScore, laneWins, series: `${laneWins.blue}-${laneWins.red}`,
    lanes, analysis, mvp, individualScores: { blue: Object.fromEntries(individual.blue), red: Object.fromEntries(individual.red) } };
}

const BanPhaseSimulation = { SIM_CONFIG, assignLanes, analyzeTeam, simulateBattle };
if (typeof module !== 'undefined' && module.exports) module.exports = BanPhaseSimulation;
if (typeof globalThis !== 'undefined') globalThis.BanPhaseSimulation = BanPhaseSimulation;
