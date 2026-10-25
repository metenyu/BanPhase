import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function json(path) {
  try { return JSON.parse(readFileSync(resolve(root, path), 'utf8')); }
  catch (error) {
    failures.push(`${path}: ${error.message}`);
    return {};
  }
}

const heroesData = json('data/heroes.json');
const itemsData = json('data/items.json');
const buildsData = json('data/builds.json');
const heroes = Array.isArray(heroesData.heroes) ? heroesData.heroes : [];
const items = Array.isArray(itemsData.items) ? itemsData.items : [];
const builds = Array.isArray(buildsData.builds) ? buildsData.builds : [];
const unique = (rows, key) => new Set(rows.map((row) => row?.[key]));

check(heroes.length > 0 && heroesData.count === heroes.length, 'heroes.json count/roster mismatch');
check(unique(heroes, 'id').size === heroes.length, 'heroes.json has duplicate or missing IDs');
check(unique(heroes, 'name').size === heroes.length, 'heroes.json has duplicate or missing names');
check(heroes.every((hero) => hero.id && hero.name && Array.isArray(hero.roles) && hero.roles.length), 'hero record is missing identity or roles');
check(items.length > 0 && itemsData.count === items.length, 'items.json count/catalog mismatch');
check(unique(items, 'id').size === items.length, 'items.json has duplicate or missing IDs');
check(items.every((item) => item.id && item.nameTr), 'item record is missing identity');
check(buildsData.count === builds.length, 'builds.json count mismatch');

const heroIds = new Set(heroes.map((hero) => hero.id));
const itemIds = new Set(items.map((item) => item.id));
for (const [index, build] of builds.entries()) {
  check(heroIds.has(build.heroId), `build ${index + 1} references unknown hero: ${build.heroId}`);
  for (const itemId of build.items ?? []) check(itemIds.has(itemId), `build ${index + 1} references unknown item: ${itemId}`);
}

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set(ids);
check(idSet.size === ids.length, 'index.html has duplicate IDs');
for (const [, ref] of html.matchAll(/\bhref="#([^"]+)"/g)) check(idSet.has(ref), `index.html has unresolved anchor: #${ref}`);
for (const [, raw] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (/^(?:#|[a-z]+:|\/\/)/i.test(raw)) continue;
  const relative = decodeURIComponent(raw.split(/[?#]/, 1)[0]).replace(/^\.\//, '');
  const target = resolve(root, relative);
  check((target === root || target.startsWith(`${root}${sep}`)) && existsSync(target), `missing local HTML resource: ${raw}`);
}

const css = readFileSync(resolve(root, 'assets/css/style.css'), 'utf8');
check(css.includes('@media (max-width:720px)') && css.includes('@media (max-width:390px)'), 'responsive breakpoints are missing');
check(css.includes('prefers-reduced-motion'), 'reduced-motion support is missing');

const sw = readFileSync(resolve(root, 'sw.js'), 'utf8');
for (const [, asset] of sw.matchAll(/^\s+'(\.\/[^']+)'\s*,?$/gm)) {
  check(existsSync(resolve(root, asset.slice(2))), `service worker asset missing: ${asset}`);
}

for (const path of ['assets/js/app.js', 'sw.js', 'tools/preview.mjs', 'tools/preview-server.mjs']) {
  const file = resolve(root, path);
  if (!existsSync(file)) continue;
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  check(result.status === 0, `${path} syntax error: ${(result.stderr || result.stdout).trim()}`);
}

if (failures.length) {
  console.error(`BanPhase validation failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`BanPhase validation passed: ${heroes.length} heroes, ${items.length} items, ${builds.length} builds; JSON, references, responsive markers, local assets and JavaScript syntax are valid.`);
}
