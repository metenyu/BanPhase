/* BanPhase service worker — kabuk önbelleği.
   Şablon dosyalar önce önbellekten, JSON verisi önce ağdan (çevrimdışıysa önbellek). */

const VERSION = 'banphase-v27';
const SHELL = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/simulation.js',
  './assets/images/arena-hero.webp',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/heroes.json',
  './data/items.json',
  './data/builds.json',
  './data/source/hero_tags.json',
  './banphase-source-pack/sources/ceplin/images-hero/aamon.png',
  './banphase-source-pack/sources/ceplin/images-hero/akai.png',
  './banphase-source-pack/sources/ceplin/images-hero/aldous.png',
  './banphase-source-pack/sources/ceplin/images-hero/alice.png',
  './banphase-source-pack/sources/ceplin/images-hero/alpha.png',
  './banphase-source-pack/sources/ceplin/images-hero/alucard.png',
  './banphase-source-pack/sources/ceplin/images-hero/angela.png',
  './banphase-source-pack/sources/ceplin/images-hero/argus.png',
  './banphase-source-pack/sources/ceplin/images-hero/arlott.png',
  './banphase-source-pack/sources/ceplin/images-hero/atlas.png',
  './banphase-source-pack/sources/ceplin/images-hero/aulus.png',
  './banphase-source-pack/sources/ceplin/images-hero/aurora.png',
  './banphase-source-pack/sources/ceplin/images-hero/badang.png',
  './banphase-source-pack/sources/ceplin/images-hero/balmond.png',
  './banphase-source-pack/sources/ceplin/images-hero/bane.png',
  './banphase-source-pack/sources/ceplin/images-hero/barats.png',
  './banphase-source-pack/sources/ceplin/images-hero/baxia.png',
  './banphase-source-pack/sources/ceplin/images-hero/beatrix.png',
  './banphase-source-pack/sources/ceplin/images-hero/belerick.png',
  './banphase-source-pack/sources/ceplin/images-hero/benedetta.png',
  './banphase-source-pack/sources/ceplin/images-hero/brody.png',
  './banphase-source-pack/sources/ceplin/images-hero/bruno.png',
  './banphase-source-pack/sources/ceplin/images-hero/carmilla.png',
  './banphase-source-pack/sources/ceplin/images-hero/cecilion.png',
  './banphase-source-pack/sources/ceplin/images-hero/chang27e.png',
  './banphase-source-pack/sources/ceplin/images-hero/chip.png',
  './banphase-source-pack/sources/ceplin/images-hero/chou.png',
  './banphase-source-pack/sources/ceplin/images-hero/cici.png',
  './banphase-source-pack/sources/ceplin/images-hero/claude.png',
  './banphase-source-pack/sources/ceplin/images-hero/clint.png',
  './banphase-source-pack/sources/ceplin/images-hero/cyclops.png',
  './banphase-source-pack/sources/ceplin/images-hero/diggie.png',
  './banphase-source-pack/sources/ceplin/images-hero/dyrroth.png',
  './banphase-source-pack/sources/ceplin/images-hero/edith.png',
  './banphase-source-pack/sources/ceplin/images-hero/esmeralda.png',
  './banphase-source-pack/sources/ceplin/images-hero/estes.png',
  './banphase-source-pack/sources/ceplin/images-hero/eudora.png',
  './banphase-source-pack/sources/ceplin/images-hero/fanny.png',
  './banphase-source-pack/sources/ceplin/images-hero/faramis.png',
  './banphase-source-pack/sources/ceplin/images-hero/floryn.png',
  './banphase-source-pack/sources/ceplin/images-hero/franco.png',
  './banphase-source-pack/sources/ceplin/images-hero/fredrinn.png',
  './banphase-source-pack/sources/ceplin/images-hero/freya.png',
  './banphase-source-pack/sources/ceplin/images-hero/gatotkaca.png',
  './banphase-source-pack/sources/ceplin/images-hero/gloo.png',
  './banphase-source-pack/sources/ceplin/images-hero/gord.png',
  './banphase-source-pack/sources/ceplin/images-hero/granger.png',
  './banphase-source-pack/sources/ceplin/images-hero/grock.png',
  './banphase-source-pack/sources/ceplin/images-hero/guinevere.png',
  './banphase-source-pack/sources/ceplin/images-hero/gusion.png',
  './banphase-source-pack/sources/ceplin/images-hero/hanabi.png',
  './banphase-source-pack/sources/ceplin/images-hero/hanzo.png',
  './banphase-source-pack/sources/ceplin/images-hero/harith.png',
  './banphase-source-pack/sources/ceplin/images-hero/harley.png',
  './banphase-source-pack/sources/ceplin/images-hero/hayabusa.png',
  './banphase-source-pack/sources/ceplin/images-hero/helcurt.png',
  './banphase-source-pack/sources/ceplin/images-hero/hilda.png',
  './banphase-source-pack/sources/ceplin/images-hero/hirara.png',
  './banphase-source-pack/sources/ceplin/images-hero/hylos.png',
  './banphase-source-pack/sources/ceplin/images-hero/irithel.png',
  './banphase-source-pack/sources/ceplin/images-hero/ixia.png',
  './banphase-source-pack/sources/ceplin/images-hero/jawhead.png',
  './banphase-source-pack/sources/ceplin/images-hero/johnson.png',
  './banphase-source-pack/sources/ceplin/images-hero/joy.png',
  './banphase-source-pack/sources/ceplin/images-hero/julian.png',
  './banphase-source-pack/sources/ceplin/images-hero/kadita.png',
  './banphase-source-pack/sources/ceplin/images-hero/kagura.png',
  './banphase-source-pack/sources/ceplin/images-hero/kaja.png',
  './banphase-source-pack/sources/ceplin/images-hero/kalea.png',
  './banphase-source-pack/sources/ceplin/images-hero/karina.png',
  './banphase-source-pack/sources/ceplin/images-hero/karrie.png',
  './banphase-source-pack/sources/ceplin/images-hero/khaleed.png',
  './banphase-source-pack/sources/ceplin/images-hero/khufra.png',
  './banphase-source-pack/sources/ceplin/images-hero/kimmy.png',
  './banphase-source-pack/sources/ceplin/images-hero/lancelot.png',
  './banphase-source-pack/sources/ceplin/images-hero/lapu-lapu.png',
  './banphase-source-pack/sources/ceplin/images-hero/layla.png',
  './banphase-source-pack/sources/ceplin/images-hero/leomord.png',
  './banphase-source-pack/sources/ceplin/images-hero/lesley.png',
  './banphase-source-pack/sources/ceplin/images-hero/ling.png',
  './banphase-source-pack/sources/ceplin/images-hero/lolita.png',
  './banphase-source-pack/sources/ceplin/images-hero/lukas.png',
  './banphase-source-pack/sources/ceplin/images-hero/lunox.png',
  './banphase-source-pack/sources/ceplin/images-hero/luo_yi.png',
  './banphase-source-pack/sources/ceplin/images-hero/lylia.png',
  './banphase-source-pack/sources/ceplin/images-hero/marcel.png',
  './banphase-source-pack/sources/ceplin/images-hero/martis.png',
  './banphase-source-pack/sources/ceplin/images-hero/masha.png',
  './banphase-source-pack/sources/ceplin/images-hero/mathilda.png',
  './banphase-source-pack/sources/ceplin/images-hero/melissa.png',
  './banphase-source-pack/sources/ceplin/images-hero/minotaur.png',
  './banphase-source-pack/sources/ceplin/images-hero/minsitthar.png',
  './banphase-source-pack/sources/ceplin/images-hero/miya.png',
  './banphase-source-pack/sources/ceplin/images-hero/moskov.png',
  './banphase-source-pack/sources/ceplin/images-hero/nana.png',
  './banphase-source-pack/sources/ceplin/images-hero/natalia.png',
  './banphase-source-pack/sources/ceplin/images-hero/natan.png',
  './banphase-source-pack/sources/ceplin/images-hero/nolan.png',
  './banphase-source-pack/sources/ceplin/images-hero/novaria.png',
  './banphase-source-pack/sources/ceplin/images-hero/obsidia.png',
  './banphase-source-pack/sources/ceplin/images-hero/odette.png',
  './banphase-source-pack/sources/ceplin/images-hero/paquito.png',
  './banphase-source-pack/sources/ceplin/images-hero/pharsa.png',
  './banphase-source-pack/sources/ceplin/images-hero/phoveus.png',
  './banphase-source-pack/sources/ceplin/images-hero/popol_and_kupa.png',
  './banphase-source-pack/sources/ceplin/images-hero/rafaela.png',
  './banphase-source-pack/sources/ceplin/images-hero/roger.png',
  './banphase-source-pack/sources/ceplin/images-hero/ruby.png',
  './banphase-source-pack/sources/ceplin/images-hero/saber.png',
  './banphase-source-pack/sources/ceplin/images-hero/selena.png',
  './banphase-source-pack/sources/ceplin/images-hero/silvanna.png',
  './banphase-source-pack/sources/ceplin/images-hero/sora.png',
  './banphase-source-pack/sources/ceplin/images-hero/sun.png',
  './banphase-source-pack/sources/ceplin/images-hero/suyou.png',
  './banphase-source-pack/sources/ceplin/images-hero/terizla.png',
  './banphase-source-pack/sources/ceplin/images-hero/thamuz.png',
  './banphase-source-pack/sources/ceplin/images-hero/tigreal.png',
  './banphase-source-pack/sources/ceplin/images-hero/uranus.png',
  './banphase-source-pack/sources/ceplin/images-hero/vale.png',
  './banphase-source-pack/sources/ceplin/images-hero/valentina.png',
  './banphase-source-pack/sources/ceplin/images-hero/valir.png',
  './banphase-source-pack/sources/ceplin/images-hero/vexana.png',
  './banphase-source-pack/sources/ceplin/images-hero/wanwan.png',
  './banphase-source-pack/sources/ceplin/images-hero/xavier.png',
  './banphase-source-pack/sources/ceplin/images-hero/xborg.png',
  './banphase-source-pack/sources/ceplin/images-hero/yi_sun-shin.png',
  './banphase-source-pack/sources/ceplin/images-hero/yin.png',
  './banphase-source-pack/sources/ceplin/images-hero/yu_zhong.png',
  './banphase-source-pack/sources/ceplin/images-hero/yve.png',
  './banphase-source-pack/sources/ceplin/images-hero/zetian.png',
  './banphase-source-pack/sources/ceplin/images-hero/zhask.png',
  './banphase-source-pack/sources/ceplin/images-hero/zhuxin.png',
  './banphase-source-pack/sources/ceplin/images-hero/zilong.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/allow_throw.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/antique_cuirass.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/arcane_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/ares_belt.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/athenas_shield.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/azure_blade.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/berserkers_fury.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/black_ice_shield.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/blade_armor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/blade_of_despair.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/blade_of_the_heptaseas.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/blood_wings.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/bloody_retribution.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/book_of_sages.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/broken_heart.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/brute_force_breastplate.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/chastise_pauldron.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/clock_of_destiny.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/conceal.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/concentrated_energy.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/corrosion_scythe.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/cursed_helmet.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/dagger.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/demon_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/demon_hunter_sword.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/dire_hit.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/divine_glaive.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/dominance_ice.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/dreadnaught_armor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/elegant_gem.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/enchanted_talisman.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/encourage.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/endless_battle.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/exotic_veil.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/expert_gloves.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/favor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/feather_of_heaven.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/flame_retribution.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/flask_of_the_oasis.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/fleeting_time.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/flower_of_hope.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/fury_hammer.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/genius_wand.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/glowing_wand.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/golden_staff.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/great_dragon_spear.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/guardian_helmet.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/haass_claws.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/healing_necklace.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/heros_ring.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/holy_crystal.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/hunter_strike.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/ice_queen_wand.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/ice_retribution.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/immortality.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/iron_hunting_bow.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/javelin.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/knife.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/lantern_of_hope.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/leather_jerkin.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/legion_sword.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/lightning_truncheon.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_blade.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_necklace.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_potion.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_resist_cloak.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/magic_wand.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/malefic_gun.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/malefic_roar.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/molten_essence.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/mystery_codex.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/mystic_container.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/ogre_tomahawk.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/oracle.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/power_crystal.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/power_potion.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/queens_wings.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/radiant_armor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/rapid_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/regular_spear.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/rock_potion.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/rogue_meteor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/rose_gold_meteor.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/sea_halberd.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/silence_robe.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/sky_piercer.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/starlium_scythe.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/steel_legplates.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/swift_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/swift_crossbow.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/throw_forbidden.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/thunder_belt.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/tome_of_evil.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/tough_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/vampire_mallet.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/vitality_crystal.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/war_axe.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/warrior_boots.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/wind_of_nature.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/windtalker.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/winter_crown.png',
  './banphase-source-pack/sources/ceplin/logo-equipment/wishing_lantern.png',
  './data/source/community-integration.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(VERSION);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
