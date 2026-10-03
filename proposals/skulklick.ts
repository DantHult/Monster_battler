// Skulklick: proposed Dark-type computer-mouse rat for Lantern Marches.
// Standalone TypeScript data; no imports or package dependencies required.
// All combat numbers are initial tuning values. Existing move IDs are reused.
// This file does not register the monster or change the live game's roster.

export const SKULKLICK = {
  "id": "N13",
  "name": "Skulklick",
  "type": "dark" as const,
  "origin_tag": "relic",
  "role": "Fast Force attacker; cleanup or pressure",
  "premise": "A rat-shaped computer mouse born from years of furtive clicks at an abandoned terminal. It nests in cable tangles and steals small objects after the lamps go out.",
  "stats": {
    "health": 110,
    "force": 95,
    "guard": 75,
    "spirit": 40,
    "ward": 60,
    "speed": 95
  }
};

export const SKULKLICK_SETS = [
  {
    "id": "N13-A",
    "monster_id": "N13",
    "name": "Silent Click",
    "move_ids": [
      "M09",
      "M17",
      "M14",
      "M24"
    ],
    "plan": "Threaten early Force damage; use Dark priority to finish weakened opponents, Air priority against Light, and cleanup to regain a usable attacking window.",
    "weight": 1
  },
  {
    "id": "N13-B",
    "monster_id": "N13",
    "name": "Cable Trap",
    "move_ids": [
      "M09",
      "M17",
      "M21",
      "M20"
    ],
    "plan": "Use limited Tethered or Fray applications when direct damage is a poor exchange; follow with Shade Rake or Gloom Nick. Slowing a target does not change the queued order that turn.",
    "weight": 1
  }
];

export const SKULKLICK_ART = {
  "palette": [
    "#211c2b",
    "#34313e",
    "#53515d",
    "#787b88",
    "#a7abb6",
    "#414650",
    "#657180",
    "#92a0ad",
    "#c1c9cf",
    "#604557",
    "#956d88",
    "#c097b0",
    "#734154",
    "#b25d75",
    "#dd98a3",
    "#b8b1a4",
    "#ece7d4"
  ],
  "outline": "#211c2b",
  "lighting": "top-left",
  "animation": false,
  "frames": {
    "front": {
      "path": "skulklick-front.png",
      "size": [
        80,
        80
      ],
      "pivot": [
        40,
        76
      ]
    },
    "back": {
      "path": "skulklick-back.png",
      "size": [
        80,
        80
      ],
      "pivot": [
        40,
        76
      ]
    },
    "icon": {
      "path": "skulklick-icon.png",
      "size": [
        32,
        32
      ],
      "pivot": [
        16,
        30
      ]
    }
  }
} as const;

export const SKULKLICK_METADATA = {
  "status": "design_proposal",
  "enabled": false,
  "content_basis": "Lantern Marches V1; shared move IDs from the current catalogue",
  "authoring_budget": {
    "formula": "H + max(Force,Spirit) + min(Force,Spirit)/4 + (Guard+Ward)/2 + Speed/2",
    "value": 330,
    "initial_tuning_values": true
  },
  "integration_notes": [
    "This is draft content; it is not loaded into the live roster.",
    "The current V1 roster contains twelve monsters, two of each type. Adding N13 requires a content revision and a review of team-generation eligibility and type frequencies.",
    "Equal stat budgets do not establish equal battle strength. Test both assigned sets before release."
  ]
} as const;

export const SKULKLICK_PROPOSAL = {
  ...SKULKLICK_METADATA,
  monster: SKULKLICK,
  sets: SKULKLICK_SETS,
  art: SKULKLICK_ART,
};

export default SKULKLICK_PROPOSAL;

