// data/source/items_tr_ocr.json -> data/items.json
// OCR çıktısını temizler, statları yapılandırır, kategori tahmini ekler.
import { readFile, writeFile } from 'node:fs/promises';

const raw = JSON.parse(await readFile('data/source/items_tr_ocr.json', 'utf8'));

const JUNK = /^Ekipman Kutsaması|^Anti Fırlatıcı|^Fırlatıcı|^Of3\(/i;

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
  const passive = (item.passiveTr ?? '')
    .replace(/\b(\d{1,3})96\b/g, (full, n) => (Number(n) <= 100 ? `${n}%` : full))
    .replace(/\s+/g, ' ')
    .trim();

  items.push({
    id: item.id,
    nameTr: item.nameTr,
    category: categoryOf(item.nameTr, stats),
    stats,
    passiveTr: passive,
    evidence: item.imageCount ? `${item.imageCount} ekran görüntüsü` : null,
  });
}

items.sort((a, b) => a.nameTr.localeCompare(b.nameTr, 'tr'));

await writeFile('data/items.json', JSON.stringify({
  schema: 1,
  kind: 'items',
  generatedAt: new Date().toISOString().slice(0, 10),
  count: items.length,
  source: 'Oyun içi eşya ekran görüntüleri (kullanıcı), OCR',
  licenseNote: 'Eşya adları ve açıklamaları Moonton\'a aittir; yalnızca atıflı, ticari olmayan kullanım.',
  categories: ['attack', 'magic', 'defense', 'movement', 'other'],
  items,
}, null, 2), 'utf8');

const byCat = {};
for (const i of items) byCat[i.category] = (byCat[i.category] ?? 0) + 1;
console.log(JSON.stringify({ count: items.length, byCat, withPassive: items.filter((i) => i.passiveTr.length > 30).length, sample: items.slice(0, 3) }, null, 2));
