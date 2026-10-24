// data/source/heroes_playable_identity.json -> data/heroes.json
// Kaynak dosya Fandom MLBB Wiki (CC BY-SA 3.0) + Rone kataloğu kimlik eşlemesi.
// Çalıştırma: node tools/build-heroes.mjs

import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'data/source/heroes_playable_identity.json';
const TARGET = 'data/heroes.json';

const ROLE_TR = {
  Tank: 'Tank',
  Fighter: 'Savaşçı',
  Assassin: 'Suikastçı',
  Mage: 'Büyücü',
  Marksman: 'Nişancı',
  Support: 'Destek',
};

const ROLE_ORDER = ['Tank', 'Savaşçı', 'Suikastçı', 'Büyücü', 'Nişancı', 'Destek'];

const TR_ASCII = {
  'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
  'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
};

function slug(name) {
  return String(name)
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (ch) => TR_ASCII[ch])
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const raw = JSON.parse(await readFile(SOURCE, 'utf8'));
const rows = raw.heroes ?? [];
const problems = [];

// Opsiyonel: Cue'nun kahraman etiketleri (varsa birleştir)
// Gelen kimlikler farklı yazımla gelebilir ("chang'e", "x.borg") — slug ile eşitle.
let tagMap = new Map();
try {
  const tagData = JSON.parse(await readFile('data/source/hero_tags.json', 'utf8'));
  tagMap = new Map((tagData.heroes ?? []).map((tag) => [slug(tag.heroId), tag]));
} catch {
  tagMap = new Map();
}

if (rows.length !== 133) problems.push(`beklenen 133 kayıt, gelen ${rows.length}`);

const seenIds = new Set();
const heroes = rows.map((row) => {
  const roles = [row.role1, row.role2]
    .filter(Boolean)
    .map((role) => {
      const tr = ROLE_TR[role];
      if (!tr) problems.push(`${row.name}: bilinmeyen rol "${role}"`);
      return tr;
    })
    .filter(Boolean);

  let id = slug(row.name);
  if (!id) problems.push(`${row.name}: slug üretilemedi`);
  if (seenIds.has(id)) {
    let n = 2;
    while (seenIds.has(`${id}-${n}`)) n += 1;
    problems.push(`${row.name}: slug çakışması, ${id}-${n} yapıldı`);
    id = `${id}-${n}`;
  }
  seenIds.add(id);

  if (!roles.length) problems.push(`${row.name}: rol yok`);

  const tag = tagMap.get(id) ?? null;

  return {
    id,
    name: row.name,
    roles: ROLE_ORDER.filter((role) => roles.includes(role)),
    primaryRole: ROLE_TR[row.role1] ?? null,
    roneId: row.rone_hero_id,
    tags: tag ? {
      lanes: tag.lanes ?? [],
      style: tag.style ?? [],
      damage: tag.damage ?? null,
      engage: tag.engage ?? null,
      confidence: tag.confidence ?? null,
    } : null,
  };
});

const out = {
  schema: 2,
  kind: 'identity',
  generatedAt: new Date().toISOString().slice(0, 10),
  count: heroes.length,
  roles: ROLE_ORDER,
  sources: [
    {
      name: 'Fandom MLBB Wiki — Module:Hero/data',
      url: 'https://mobile-legends.fandom.com/wiki/Module:Hero/data',
      license: 'CC BY-SA 3.0',
      usedFor: 'ad, rol, çıkış tarihi',
    },
    {
      name: 'Rone Arena API — /academy/heroes/catalog',
      url: 'https://arena.fastapicloud.dev/api/academy/heroes/catalog?size=200',
      license: 'BSD-3 (kod); oyun verisi hakkı belirsiz',
      usedFor: 'yalnızca kimlik eşlemesi (roneId)',
    },
  ],
  note: 'Yalnızca kimlik: istatistik, build, sıralama yok. Çıkış tarihleri bilinçli olarak dışarıda bırakıldı (kaynakta serbest metin ve biçim tutarsız). "Esper Assassin" etiketi Hirara olarak düzeltildi; yayımlanmamış Dori dışarıda.',
  heroes,
};

await writeFile(TARGET, `${JSON.stringify(out, null, 2)}\n`, 'utf8');

console.log(`yazıldı: ${TARGET} — ${heroes.length} kahraman`);
if (problems.length) {
  console.error('SORUNLAR:');
  for (const p of problems) console.error(' -', p);
  process.exitCode = 1;
} else {
  console.log('doğrulama: sorun yok');
}
