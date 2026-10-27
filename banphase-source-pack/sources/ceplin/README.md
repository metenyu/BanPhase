# 🎮 Mobile Legends: Bang Bang (MLBB) Comprehensive Database & eSports Dataset

[![MLBB Dataset](https://img.shields.io/badge/MLBB-Database-blue?style=for-the-badge&logo=gamepad)](https://github.com)
[![Format](https://img.shields.io/badge/Format-JSON%20%26%20Assets-orange?style=for-the-badge&logo=json)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com)
[![Data Version](https://img.shields.io/badge/Season-2026%20Meta-purple?style=for-the-badge)](https://github.com)

A complete, high-quality, structured JSON dataset and image asset repository for **Mobile Legends: Bang Bang (MLBB)**. This dataset covers full hero metrics, item equipments, emblem systems, build recommendations, meta draft picks, professional teams, player statistics, tournaments, talent/casters, and technical staff.

Designed specifically for **developers, data analysts, esports enthusiasts, web/mobile app creators, and machine learning researchers**.

---

## 📌 Table of Contents

- [✨ Features \& Highlights](#-features--highlights)
- [📁 Repository Structure](#-repository-structure)
- [📊 Datasets Overview](#-datasets-overview)
  - [1. Hero Database (`hero.json`)](#1-hero-database-herojson)
  - [2. Equipment \& Items (`equipment.json`)](#2-equipment--items-equipmentjson)
  - [3. Emblem System (`emblem.json`)](#3-emblem-system-emblemjson)
  - [4. Build Item Sets (`build-item.json`)](#4-build-item-sets-build-itemjson)
  - [5. Meta Draft Pick Tier List (`meta-draftpick-ml.json`)](#5-meta-draft-pick-tier-list-meta-draftpick-mljson)
  - [6. Tournaments (`tournament.json`)](#6-tournaments-tournamentjson)
  - [7. Professional Teams (`teams.json`)](#7-professional-teams-teamsjson)
  - [8. Player Profiles \& Advanced Stats (`players.json` \& `stat-player.json`)](#8-player-profiles--advanced-stats-playersjson--stat-playerjson)
  - [9. Esports Staff \& Talent (`staf.json` \& `host-cast.json`)](#9-esports-staff--talent-stafjson--host-castjson)
- [🖼️ Image Assets Directory](#️-image-assets-directory)
- [💻 Quick Start / Usage Examples](#-quick-start--usage-examples)
  - [Python Integration](#python-integration)
  - [JavaScript / Node.js Integration](#javascript--nodejs-integration)
- [🚀 Potential Use Cases](#-potential-use-cases)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features & Highlights

- 🎯 **Complete Game Data**: Full list of heroes, roles, emblems, equipment prices, and top meta build recommendations.
- 🏆 **eSports & Tournament Ecosystem**: Detailed metadata on professional tournaments, prize pools, teams, player rosters, coaches, hosts, and casters.
- 📈 **Advanced Player Analytics**: Detailed attribute ratings for pro players including mechanics, map awareness, retribution timing, composure, tilt resistance, and meta adaptability.
- 🖼️ **Rich Visual Assets**: Includes hero avatars, equipment icons, team logos, tournament logos, and national flags.
- ⚡ **Developer Friendly**: Pure, standardized JSON schemas ready to be imported into any database (MongoDB, PostgreSQL, SQLite, Firebase) or used directly in frontend applications.

---

## 📁 Repository Structure

```directory
Database ML/
├── 📄 hero.json                # Hero roster, roles, and image filenames
├── 📄 equipment.json           # In-game items, gold prices, and icons
├── 📄 emblem.json              # Emblems, attributes, standard & core talents
├── 📄 build-item.json          # Recommended pro builds, spells, & emblem setups
├── 📄 meta-draftpick-ml.json   # Role-based draft pick priority tier list
├── 📄 tournament.json          # Global esports tournaments, prize pools, & logos
├── 📄 teams.json               # Esports organizations, rosters, regions, & logos
├── 📄 players.json             # Player profiles, nationalities, and roles
├── 📄 stat-player.json         # Granular player skill ratings & psychological stats
├── 📄 staf.json                # Coaches, analysts, & management staff history
├── 📄 host-cast.json           # Hosts, casters, and tournament talent profiles
│
├── 📁 images/                  # General assets and logos
├── 📁 images-flag/             # Country flag icons for player nationalities
├── 📁 images-hero/             # High-resolution hero avatars
├── 📁 logo-equipment/          # Item / Equipment icons
└── 📁 logo-tur/                # Official tournament logos
```

---

## 📊 Datasets Overview

### 1. Hero Database (`hero.json`)
Contains all MLBB heroes indexed with unique IDs, names, primary/secondary roles, and associated avatar file paths.

```json
[
  {
    "id_hero": 1,
    "name_hero": "Aamon",
    "images-hero": "aamon.png",
    "role": [ "assassin" ]
  },
  {
    "id_hero": 4,
    "name_hero": "Alice",
    "images-hero": "alice.png",
    "role": [ "tank", "mage" ]
  }
]
```

---

### 2. Equipment & Items (`equipment.json`)
List of in-game equipment items with ID, item name, gold price, and icon reference.

```json
[
  {
    "id_equip": 1,
    "name-equipment": "Berserker's Fury",
    "prize-gold": 2390,
    "logo-equipment": "berserkers_fury.png"
  }
]
```

---

### 3. Emblem System (`emblem.json`)
Detailed breakdown of emblems, base attribute bonuses, standard talents, and core talents.

```json
{
  "emblems": [
    {
      "name": "Basic Common Emblem",
      "attributes": {
        "Physical Attack": 12,
        "Magic Power": 12
      },
      "standard_talents": [
        { "name": "Life Drain", "description": "Kill a minion to restore 150 HP." }
      ],
      "core_talents": [
        { "name": "Firmness", "description": "Gain 4 Physical and Magic Defense." }
      ]
    }
  ]
}
```

---

### 4. Build Item Sets (`build-item.json`)
Top meta build configurations per hero, including battle spells, emblem combinations, and item purchase order.

```json
[
  {
    "hero_name": "Aamon",
    "role": "Assassin",
    "speciality": [ "Jungle", "Chase", "Magic Damage" ],
    "top_builds": [
      {
        "battle_spell": "Retribution",
        "emblems": [ "Custom Magic Emblem", "Thrill", "Bargain Hunter", "Impure Rage" ],
        "items": [
          "Arcane Boots",
          "Feather of Heaven",
          "Genius Wand",
          "Holy Crystal",
          "Blood Wings"
        ]
      }
    ]
  }
]
```

---

### 5. Meta Draft Pick Tier List (`meta-draftpick-ml.json`)
Tier list priority data (S-Tier, A-Tier, etc.) mapped to specific lanes (EXP Lane, Gold Lane, Mid Lane, Jungler, Roamer).

```json
{
  "metadata": {
    "title": "MLBB Professional Meta Draft Pick Data 2026 By MPL"
  },
  "meta_draft_picks": {
    "exp_lane": [
      { "hero_name": "Gloo", "priority_tier": "S-Tier" },
      { "hero_name": "Arlott", "priority_tier": "S-Tier" }
    ],
    "roamer": [
      { "hero_name": "Floryn", "priority_tier": "S-Tier" }
    ]
  }
}
```

---

### 6. Tournaments (`tournament.json`)
Comprehensive list of major international esports tournaments, locations, prize pools, and logo paths.

| Tournament Name | Prize Pool | Location | Logo File |
| :--- | :--- | :--- | :--- |
| Esports Nations Cup 2026 | $1,864,000 | Riyadh | `logo-tur/logo_1.png` |
| Games of the Future 2026 | $900,000 | Astana | `logo-tur/logo_2.png` |
| MLBB Mid Season Cup 2026 | $3,025,000 | Paris | `logo-tur/logo_3.png` |
| M7 World Championship | $1,000,000 | Jakarta | `logo-tur/logo_5.png` |

---

### 7. Professional Teams (`teams.json`)
Esports organizations with region, nationality, active rosters, coaches, and team logos.

```json
[
  {
    "id_teams": 6,
    "name": "AP.Bren",
    "region": "Southeast Asia",
    "nationality": "Philippines",
    "current_roster": [
      { "id_players": "94", "ign": "Jamespangks", "name": "Jonathan James Mendoza", "flag": "flag_philippines.png" }
    ],
    "logo": "team_6.png"
  }
]
```

---

### 8. Player Profiles & Advanced Stats (`players.json` & `stat-player.json`)
Granular numerical ratings assessing pro player capabilities across multiple dimensions:

- 🎮 **In-Game Skills**: Mechanics, Reaction Time, Map Awareness, Positioning, Retribution Timing, Laning Phase, Shot Calling.
- 🧠 **Mental & Psychological**: Clutch performance, Composure, Tilt Resistance, Consistency, Teamwork.
- 🎯 **Role & Hero Mastery**: Role familiarity, Hero mastery overall, Signature hero bonus, Meta adaptability.

---

### 9. Esports Staff & Talent (`staf.json` & `host-cast.json`)
Detailed tracking of head coaches, analysts, managers, casters, and tournament hosts including career achievements, team history, and personal details.

---

## 🖼️ Image Assets Directory

All image assets are stored locally and referenced directly in the JSON files:

- **Hero Avatars**: `images-hero/<hero_name>.png` (e.g., `images-hero/aamon.png`)
- **Equipment Icons**: `logo-equipment/<icon_name>.png` (e.g., `logo-equipment/berserkers_fury.png`)
- **Tournament Logos**: `logo-tur/<logo_name>.png` (e.g., `logo-tur/logo_1.png`)
- **Country Flags**: `images-flag/<flag_name>.png` (e.g., `images-flag/flag_philippines.png`)

---

## 💻 Quick Start / Usage Examples

### Python Integration

```python
import json
import os

# Load Hero Database
with open("hero.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

# Filter Assassins
assassins = [h for h in heroes if "assassin" in h.get("role", [])]
print(f"Total Assassins: {len(assassins)}")
for hero in assassins[:5]:
    print(f"- {hero['name_hero']} (Image: images-hero/{hero['images-hero']})")
```

### JavaScript / Node.js Integration

```javascript
const fs = require('fs');

// Load Teams & Roster
const teamsData = JSON.parse(fs.readFileSync('./teams.json', 'utf8'));

teamsData.forEach(team => {
  console.log(`Team: ${team.name} (${team.nationality})`);
  console.log(`Roster Count: ${team.current_roster.length}`);
});
```

---

## 🚀 Potential Use Cases

1. 🌐 **Esports & Gaming Portals**: Build web applications for tournament statistics, team rosters, and hero build guides.
2. 📱 **Mobile Companion Apps**: Native iOS/Android apps for draft pick recommendations and item counter-building.
3. 🤖 **Discord / Telegram Bots**: Automated bots providing fast queries for hero builds (`!build aamon`) or player stats (`!stat marzyyy`).
4. 🎮 **Esports Manager Simulator**: Develop a strategy manager game powered by real-world player skills and stats.
5. 📊 **Data Science & ML Models**: Analyze draft pick winning trends, meta shift impacts, and player attribute correlations.

---

## 🤝 Contributing

Contributions are warmly welcomed! If you would like to add new heroes, update meta builds, or refresh player stats:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/update-meta`).
3. Commit your changes (`git commit -m 'Update S-Tier Meta Draft Pick'`).
4. Push to the branch (`git push origin feature/update-meta`).
5. Open a **Pull Request**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p center>
Made with ❤️ for the Mobile Legends: Bang Bang Community & Esports Developers.
</p>
