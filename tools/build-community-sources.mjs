import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'banphase-source-pack/sources';
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8').replace(/^\uFEFF/, ''));
const norm = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const heroes = readJson('data/heroes.json').heroes;
const runtimeItems = readJson('data/items.json').items;
const ceplinHeroes = readJson(`${base}/ceplin/data/hero.json`);
const equipment = readJson(`${base}/ceplin/data/equipment.json`);
const ceplinBuilds = readJson(`${base}/ceplin/data/build-item.json`);

function csvRows(text) {
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i]; if(quoted) { if(c==='"' && text[i+1]==='"'){cell+='"';i++;} else if(c==='"') quoted=false; else cell+=c; } else if(c==='"') quoted=true; else if(c===','){row.push(cell);cell='';} else if(c==='\n'){row.push(cell.replace(/\r$/, ''));rows.push(row);row=[];cell='';} else cell+=c; }
  if(cell||row.length){row.push(cell.replace(/\r$/, ''));rows.push(row);} return rows;
}
const csv=csvRows(readFileSync(resolve(root,`${base}/kaggle/hero_data.csv`),'utf8'));
const headers=csv.shift().map((h)=>h.trim());
const kaggleRows=csv.filter((r)=>r.length>1).map((r)=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
const heroIndex=new Map(heroes.map(h=>[norm(h.name),h]));
const ceplinIndex=new Map(ceplinHeroes.map(h=>[norm(h.name_hero),h]));
const kaggleIndex=new Map(kaggleRows.map(h=>[norm(h.name),h]));
const iconMap=[]; const missingIcons=[]; const unmatchedCeplin=[]; const unmatchedKaggle=[];
for(const hero of heroes){
 const c=ceplinIndex.get(norm(hero.name)); const k=kaggleIndex.get(norm(hero.name));
 if(!c) unmatchedCeplin.push(hero.name);
 else if(c['images-hero'] && existsSync(resolve(root,`${base}/ceplin/images-hero/${c['images-hero']}`))) iconMap.push({heroId:hero.id,heroName:hero.name,path:`./${base}/ceplin/images-hero/${c['images-hero']}`,ceplinName:c.name_hero});
 else missingIcons.push(hero.name);
 if(!k) unmatchedKaggle.push(hero.name);
}
const ceplinEquipment=equipment.map(e=>({id:e.id_equip,name:e['name-equipment'],price:e['prize-gold']??null,icon:e['logo-equipment']&&existsSync(resolve(root,`${base}/ceplin/logo-equipment/${e['logo-equipment']}`))?`./${base}/ceplin/logo-equipment/${e['logo-equipment']}`:null}));
const ceplinItemGroups=new Map();
for(const item of equipment){const key=norm(item['name-equipment']);ceplinItemGroups.set(key,[...(ceplinItemGroups.get(key)||[]),item]);}
const ceplinItemIndex=new Map([...ceplinItemGroups].filter(([,group])=>group.length===1).map(([key,group])=>[key,group[0]]));
const itemMatches=runtimeItems.flatMap((item)=>{const match=item.englishName?ceplinItemIndex.get(norm(item.englishName)):null;return match?[{runtimeItemId:item.id,runtimeEnglishName:item.englishName,ceplinItemId:match.id_equip,ceplinName:match['name-equipment']}]:[];});
const matchedCeplinIds=new Set(itemMatches.map((match)=>match.ceplinItemId));
const kaggle=heroes.flatMap(hero=>{const row=kaggleIndex.get(norm(hero.name)); if(!row)return[]; const parseList=(s)=>{const m=String(s||'').match(/\[[\s\S]*\]/); if(!m)return[]; return [...m[0].matchAll(/(?:heroname|name)\s*['"]?\s*:\s*['"]([^'"]+)/gi)].map(x=>x[1]);}; return [{heroId:hero.id,name:hero.name,lane:row.laning||'',role:row.class||'',speciality:row.speciality||'',counters:parseList(row.counters),synergies:parseList(row.synergies)}];});
const builds=ceplinBuilds.flatMap(b=>{const hero=heroIndex.get(norm(b.hero_name)); return hero?(b.top_builds||[]).map(x=>({heroId:hero.id,heroName:hero.name,role:b.role||'',speciality:b.speciality||[],spell:x.battle_spell||'',items:x.items||[],emblems:x.emblems||[]})):[];});
const duplicateCeplinItemNames=[...ceplinItemGroups].filter(([,group])=>group.length>1).map(([,group])=>group.map((item)=>({id:item.id_equip,name:item['name-equipment']})));
const output={schemaVersion:1,sourceLabel:'Ceplin/Kaggle kaynaklı topluluk verisi, doğrulanmamış',icons:iconMap,ceplinEquipment,kaggleInsights:kaggle,ceplinBuilds:builds,itemMatches,matching:{roster:heroes.length,iconMatches:iconMap.length,missingIcons,unmatchedCeplin,unmatchedKaggle,ceplinEquipment:equipment.length,ceplinEquipmentWithoutIcon:ceplinEquipment.filter((item)=>!item.icon).map((item)=>item.name),kaggleHeroes:kaggle.length,ceplinBuilds:builds.length,exactRuntimeItemMatches:itemMatches.length,duplicateCeplinItemNames,unmatchedCeplinItems:equipment.filter((item)=>!matchedCeplinIds.has(item.id_equip)).map((item)=>item['name-equipment']),unmatchedRuntimeItems:runtimeItems.filter((item)=>!item.englishName||!ceplinItemIndex.has(norm(item.englishName))).map((item)=>item.nameTr)}};
writeFileSync(resolve(root,'data/source/community-integration.json'),`${JSON.stringify(output,null,2)}\n`);
console.log(JSON.stringify(output.matching,null,2));
