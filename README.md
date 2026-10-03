# Lantern Marches

An original two-player, turn-based monster battler built around independently generated teams. Make an unfamiliar team work through prediction, switching, move selection, and managing limited resources.

**[Play the prototype](https://lantern-marches.danielhulton21.chatgpt.site)**

The game is publicly accessible. Each battle uses a private room code and separate player seats.

## Project status

V1 is a playable prototype for testing the core battle loop, team generation, and balance. The active roster contains **12 original monsters**, with **24 authored sets** and **24 shared moves**, plus two fallback attack variants.

All balance values are initial tuning choices. Formal playtest measurements and broader balance calibration remain work in progress.

This repository contains the full application source, build helpers, database migration, simulation scripts, and artwork. The earlier TypeScript-only export is a smaller source collection; use this complete project for local development.

## How to play

1. Create a room and share its code with your opponent.
2. Review your randomly assigned four-monster team. Keep it or take one blind redraw.
3. After both teams are finalized, choose your lead in secret.
4. Each turn, select a move or switch, then commit your choice.
5. Knock out every opposing monster to win.

Players choose actions simultaneously. Switches resolve first, followed by move priority and Speed. Exact Speed ties use seeded randomness. A knocked-out actor loses its queued action.

Each monster knows four moves. Move uses are limited; an unlimited fallback attack becomes available when damaging moves are exhausted. Battles still undecided after turn 60 end in a draw.

The six types are **Fire, Air, Earth, Water, Dark, and Light**. Normal damage has no random range; executed damaging moves have a **1/36** chance of a modest critical hit.

Choices are untimed. Reopen a room in the same browser profile to resume your seat. Completed battles can be exported as JSON records.

## Features

- Independent random teams selected from eligible combinations and pre-authored movesets.
- Secret choices, simultaneous turn resolution, and clear public battle information.
- Versioned rules, seeded random streams, and deterministic battle replay.
- Persistent rooms, reconnect support, and optional playtest feedback.
- Original pixel artwork: 80×80 front and distinct back sprites, plus 32×32 menu icons.
- Type-tinted move buttons and a responsive React interface.
- Offline bots, simulation reports, and SQLite-backed room verification.

The setting combines creatures born from local rituals, stories, and remembered objects. Future designs can broaden their origins while keeping the same battle rules.

## Technology

| Area | Technology |
| --- | --- |
| Primary language | TypeScript |
| Interface | React, Vinext/Vite, Tailwind CSS |
| Server runtime | Cloudflare Workers |
| Persistent storage | Cloudflare D1 / SQLite |
| Schema and migrations | Drizzle |
| Rules and simulations | Shared TypeScript engine |
| Content | Structured JSON |
| Package manager | pnpm |

The original hosted prototype uses Sites with Cloudflare Workers and D1. Game decisions and match state are resolved on the server; the browser receives a player-specific view.

## Repository map

| Location | Purpose |
| --- | --- |
| `lib/game/content.json` | Monsters, authored sets, moves, type chart, and status definitions |
| `lib/game/engine.ts` | Legal actions, turn resolution, effect timing, views, and replay |
| `lib/game/generator.ts` | Eligible teams, independent offers, redraws, and slot order |
| `lib/game/math.ts` | Effective stats and damage calculations |
| `lib/game/rng.ts` | Seeded streams, unbiased sampling, and draw traces |
| `lib/game/bots.ts`, `tactical.ts` | Offline bot policies |
| `lib/server/rooms.ts`, `app/api/rooms/` | Room creation, authorization, choices, exports, and feedback |
| `db/`, `drizzle/` | Database access, schema, and migration |
| `components/game-client.tsx` | Lobby, team review, battle controls, and results |
| `components/game-details.tsx` | Stats, type badges, inspection, and rules |
| `components/creature-art.tsx` | Sprite rendering |
| `public/sprites/`, `public/battle/` | Sprite assets, manifest, and battlefield backgrounds |
| `art/` | Drawing sources, palettes, and generation prompts |
| `scripts/` | Build helpers, verification, simulations, replay, and asset preparation |
| `reports/` | Saved engineering and simulation reports |
| `docs/approved-design.md` | Approved V1 design baseline |
| `docs/pixel-art.md` | Artwork formats and regeneration notes |
| `proposals/` | Proposed content that is separate from the active roster |

## Local setup

Requires **Node.js 22.13 or later** and **pnpm 11.25.0**, as recorded in `package.json`.

Install dependencies and build the Worker:

```sh
pnpm install
pnpm build
```

For a fresh local database, apply the supplied schema once:

```sh
pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_even_tigra.sql
```

Start the built application:

```sh
pnpm start
```

Open the local URL printed by Wrangler. The start script uses the generated configuration in `dist/server/wrangler.json` and local state in `.wrangler/state`.

For development with live reload, use `pnpm dev`. The multiplayer routes need the `DB` D1 binding and the migration tables; the offline engine checks below use their own fixtures.

For a separate hosted deployment, configure your own Sites project or Cloudflare Worker and D1 database. The checked-in hosting metadata identifies the original project. The production database must be exposed as `DB` and have the supplied migration applied.

## Verification and simulations

Run from the repository root after installing dependencies.

### Type and rules checks

```sh
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --experimental-strip-types scripts/verify.mjs
node --experimental-strip-types scripts/verify-rooms.mjs
```

The rules verifier checks content fixtures, eligible teams, effect interactions, seeded matches, and exact replay. The room verifier uses SQLite to check joins, authorization, private commitments, concurrent submissions, retries, exports, and feedback.

### Bot matches

```sh
node --experimental-strip-types scripts/simulate.mjs --matches 1000 --p0 S --p1 S --out reports/ss-campaign.json
```

| Policy | Behavior |
| --- | --- |
| `R` | Random legal choices |
| `S` | Direct attack-focused heuristic |
| `T` | Experimental four-turn forecast |

Reports record outcomes, game length, team and content performance, critical counts, and reproducible fixtures. The tactical policy still needs calibration. Compare results within consistent policy pairings and content versions.

### Replay a saved battle

```sh
node --experimental-strip-types scripts/replay.mjs reports/example-replay.json
```

Replays depend on the recorded content and rules version. Keep the matching source release when changing battle content.

## Artwork

All monsters are original designs. Front and back sprites use a fixed 80×80 grid, menu icons use 32×32, and display scaling uses whole-number nearest-neighbor pixels with `image-rendering: pixelated`.

Each creature shares a limited palette across its views. Silhouettes use colored outlines, hard cel-shading, and top-left lighting.

With Node and ImageMagick installed:

```sh
node scripts/prepare-pixel-assets.mjs art/source
node scripts/verify-pixel-assets.mjs
```

See [the artwork notes](docs/pixel-art.md) for details. A ready-to-use PNG/JSON pack is included at `public/downloads/lantern-marches-pixel-assets.zip`.

## Skulklick proposal

`proposals/skulklick.ts` defines **Skulklick**, a proposed Dark-type computer-mouse rat with click-panel armor, a scroll-wheel ridge, and a cable tail. Its sprites and source prompts are in `proposals/skulklick/`.

Its proposed role is a fast Force attacker with cleanup or limited control. It uses the existing move catalogue and the same 330-point authoring budget as the initial roster.

Skulklick is **not yet part of live random teams**. Integrating it requires reviewing content versions, generation constraints, type frequencies, and the sprite catalogue.

## Playtesting and next work

- Measure whether the intended 5–10 minute matches provide interesting decisions.
- Review redraw reasons and teams that players find difficult to use.
- Expand matchup simulations and calibrate the forecast bot.
- Tune stats, set access, and generator constraints using recorded evidence.
- Evaluate Skulklick as a roster expansion.
- Explore team building later through the existing separation between team generation and battle resolution.

Useful feedback includes the battle record, the decision that felt unclear or decisive, whether the assigned team offered a workable plan, and approximate match duration.

## License

A project-wide license has not yet been selected. Bundled third-party code retains its included license notices.

