// data/source/items_tr_ocr.json -> data/items.json
// OCR çıktısını temizler, statları yapılandırır, kategori tahmini ekler,
// elle düzeltmeleri (items-fixes.json) uygular.
import { readFile, writeFile } from 'node:fs/promises';

const raw = JSON.parse(await readFile('data/source/items_tr_ocr.json', 'utf8'));

let fixes = { items: {} };
try {
  fixes = JSON.parse(await readFile('data/source/items-fixes.json', 'utf8'));
} catch {
  fixes = { items: {} };
}

const JUNK = /^Anti Fırlatıcı|^Fırlatıcı iksir|^Of3\(/i;
const BLESSING = /^Ekipman Kutsaması/i;

const STAT_KEYS = {
  'Fiziksel Saldırı': 'physical_attack',
  'Büyü Gücü': 'magic_power',
  'Can': 'hp',
  'Fiziksel Savunma': 'physical_defense',
  'Büyü Direnci': 'magic_defense',
  'Saldırı Hızı': 'attack_speed',
  'Hareket Hızı': 'movement_speed',
  'Fiziksel Zırh Delme': 'physical_penetration',
  'Büyü Nüfuzu': 'magic_penetration',
  'Kritik Şansı': 'crit_chance',
  'Kritik şansı': 'crit_chance',
  'Can Yenileme': 'hp_regen',
  'Mana': 'mana',
  'Mana Yenileme': 'mana_regen',
  'Bekleme Süresi Azaltma': 'cooldown_reduction',
  'BS Düşürme': 'physical_penetration',
  'Uyarlanabilir Saldırı': 'adaptive_attack',
};

function parseStats(lines) {
  const out = [];
  for (const line of lines) {
    const m = line.match(/^\+\s*(\d+)\s*(%?)\s*(.+)$/);
    if (!m) continue;
    const labelTr = m[3].trim();
    const key = STAT_KEYS[labelTr];
    if (!key) continue;
    out.push({ key, labelTr, value: Number(m[1]), percent: m[2] === '%' });
  }
  return out;
}

function categoryOf(name, stats) {
  if (BLESSING.test(name)) return 'kutsama';
  const keys = new Set(stats.map((s) => s.key));
  if (keys.has('movement_speed') && /bot/i.test(name)) return 'movement';
  if (keys.has('magic_power') || keys.has('magic_penetration')) return 'magic';
  if (keys.has('physical_attack')) return 'attack';
  if (keys.has('physical_defense') || keys.has('magic_defense') || keys.has('hp')) return 'defense';
  return 'other';
}

const items = [];
for (const item of raw.items) {
  if (JUNK.test(item.nameTr)) continue;
  const stats = parseStats(item.statsText);
  let passive = (item.passiveTr ?? '')
    .replace(/\b(\d{1,3})96\b/g, (full, n) => (Number(n) <= 100 ? `${n}%` : full))
    .replace(/\s+/g, ' ')
    .trim();

  let nameTr = item.nameTr;
  if (BLESSING.test(nameTr)) {
    nameTr = nameTr
      .replace(/^Ekipman Kutsaması\s*-\s*/i, '')
      .replace(/^(Aktif|Pasif)\s*-\s*/i, '')
      .trim();
    nameTr = nameTr.charAt(0).toLocaleUpperCase('tr') + nameTr.slice(1);
  }

  const fix = fixes.items?.[item.id];
  if (fix?.passiveTr) passive = fix.passiveTr;
  if (fix?.nameTr) nameTr = fix.nameTr;

  items.push({
    id: item.id,
    nameTr,
    category: categoryOf(item.nameTr, stats),
    stats,
    passiveTr: passive.length > 5 ? passive : null,
    evidence: item.imageCount ? `${item.imageCount} ekran görüntüsü` : null,
  });
}

items.sort((a, b) => a.nameTr.localeCompare(b.nameTr, 'tr'));

const byCat = {};
for (const item of items) byCat[item.category] = (byCat[item.category] ?? 0) + 1;

await writeFile('data/items.json', JSON.stringify({
  schema: 1,
  kind: 'items',
  generatedAt: new Date().toISOString().slice(0, 10),
  count: items.length,
  source: 'Oyun içi eşya ekran görüntüleri (kullanıcı), OCR + elle düzeltmeler',
  licenseNote: 'Eşya adları ve açıklamaları Moonton\'a aittir; yalnızca atıflı, ticari olmayan kullanım.',
  note: 'Her eşyanın pasifi olmak zorunda değil (ör. botlar). Pasif yoksa null.',
  categories: ['attack', 'magic', 'defense', 'movement', 'kutsama', 'other'],
  counts: byCat,
  items,
}, null, 2), 'utf8');

console.log(JSON.stringify({ count: items.length, byCat, withPassive: items.filter((i) => i.passiveTr).length }, null, 2));
