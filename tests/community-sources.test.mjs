import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const json = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const integration = json('data/source/community-integration.json');
const heroes = json('data/heroes.json').heroes;
const byId = new Map(heroes.map((hero) => [hero.id, hero]));

test('Ceplin kahraman ikonları adla birebir roster eşleşmesi ve yerel dosyaya sahip', () => {
  assert.equal(integration.icons.length, 133);
  assert.equal(new Set(integration.icons.map((icon) => icon.heroId)).size, 133);
  for (const icon of integration.icons) {
    assert.equal(byId.get(icon.heroId)?.name, icon.heroName);
    assert.ok(existsSync(resolve(root, icon.path.slice(2))), `${icon.heroName} icon missing`);
  }
});

test('ikon yükleme hatasında kahraman baş harfi yedekte kalır', () => {
  const app = readFileSync(resolve(root, 'assets/js/app.js'), 'utf8');
  assert.match(app, /onerror="this\.remove\(\)"/);
  assert.match(app, /<span class="hero-initials">\$\{escapeHtml\(initials\(hero\.name\)\)\}<\/span>/);
});

test('Ceplin ve Kaggle içgörüleri BanPhase roster kimlikleriyle ad üzerinden eşleşir', () => {
  assert.equal(integration.kaggleInsights.length, 133);
  assert.equal(integration.matching.unmatchedCeplin.length, 0);
  assert.equal(integration.matching.unmatchedKaggle.length, 0);
  assert.equal(integration.ceplinEquipment.length, 109);
  assert.equal(integration.ceplinBuilds.length, 357);
  assert.equal(integration.itemMatches.length, 2);
  assert.equal(integration.matching.duplicateCeplinItemNames.length, 4);
  assert.ok(integration.itemMatches.every((match) => match.runtimeEnglishName === match.ceplinName));
  assert.match(integration.sourceLabel, /doğrulanmamış/);
  assert.ok(integration.ceplinEquipment.every((item) => !item.icon || existsSync(resolve(root, item.icon.slice(2)))));
});
