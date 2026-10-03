# Monster Battler — V1 Game Design Document

Working setting: The Lantern Marches  
Revision: 1.1 — 2026-10-02  
Status: All eight sections approved. Initial design baseline complete; ready for the implementation phase.

All numerical balance values and evaluation thresholds are initial tuning values. Approval establishes the design baseline; balance and enjoyment remain to be evaluated through simulation and human playtests.

## 1. Design brief, pillars, and playtest goals

### 1.1 Game promise

Make an unfamiliar team work through prediction, switching, and choosing favorable exchanges. Each player receives a team and four moves per monster, studies the available tools, and tries to knock out the opposing team. Players choose their actions secretly at the same time, then watch the consequences resolve.

V1 serves newcomers and experienced monster-battler players. A short introduction should explain the rules; mastery should come from recognizing threats, anticipating switches, managing limited resources, and preparing a winning endgame.

### 1.2 Setting: The Lantern Marches

Towns maintain lantern roads through a wilderness inhabited by creatures born from local stories, vows, and seasonal rituals. Communities settle disputes through formal contests between their creature companions. Weathered shrines, lively festivals, and expressive monsters give the setting a warm, mysterious atmosphere. A knockout means a creature cannot continue the contest.

Future rosters may introduce creatures born around foundries, salvaged machinery, impossible houses, and household memories. Store a creature's origin separately from its combat type: industrial and surreal origins can broaden the world using the same combat system. Combat types are Fire, Air, Earth, Water, Dark, and Light. Original monster names will be developed in Section 5.

### 1.3 Design pillars

| Pillar | Practical design consequence |
| --- | --- |
| Decisions earn victories | Attacking, switching, and utility each need situations where they are useful. Repeatedly choosing the same move should not be a generally optimal strategy. |
| Every assigned team offers a plan | Every eligible team and moveset must contain usable tools. Evaluate the first team offered as well as the team retained after a mulligan. |
| Battles move toward a result | Damage creates progress. Healing and temporary boosts provide bounded opportunities; defensive play must eventually help a player win. |
| Consequences are readable | Show complete finalized teams and moves, exact Health, remaining move uses, and active effects. Make action order and damage explainable in the battle record. |
| Uncertainty stays limited | Ordinary damage is fixed. Random criticals create occasional surprises with a modest damage increase; any other random rule must be explicitly defined. |
| A small roster supports reliable learning | Use shared, precisely defined effects and a compact content catalog. Change a few values at a time and measure the consequences. |

### 1.4 What V1 must answer

These approved evaluation targets are initial tuning values. Section 7 will define collection methods, sample requirements, and how much confidence the results justify.

| Question | Evidence to collect | Initial target |
| --- | --- | --- |
| Are decisions enjoyable? | Tester ratings after a short set of matches; willingness to play again | At least 70% rate decision interest 4/5 or higher and want another match. |
| Does the pace fit the format? | Elapsed time from initial team offer to result; battle turns; time spent on team review and decisions | Median total match time of 5–10 minutes; typical battles of 20–30 turns. |
| Can newcomers understand the rules? | A short rules check after an introduction and one practice match | At least 80% of newcomers answer at least 4 of 5 core-rules questions correctly; introduction lasts at most 10 minutes. |
| Do players perceive useful choices? | A brief post-match review from both players, checked against the battle record | In at least 75% of completed matches, both players identify a plausible decision that could have affected the outcome. |
| Do assigned teams feel usable? | First-offer ratings, mulligan reasons, and final-team ratings | Fewer than 10% of first offers are reported as having no workable plan; every such report receives a replay review. |
| Do battles consistently progress? | Reports of stalled play and review of repeated defensive or switching sequences | Fewer than 10% of matches are called stalled by either player. Any strategy that reliably denies progress without spending resources triggers a rules review. |

A workable plan means a sequence of available battle choices that can improve the player's position. It does not mean a guaranteed win or favorable matchup.

Human feedback establishes whether the game is enjoyable and understandable. Simulations will investigate team strength, matchup extremes, and dominant strategies. Per-monster, per-type, and matchup performance targets belong in Section 7, where their measurement limits can be defined.

Report actual counts alongside percentages. A small tester group can reveal problems, but a high satisfaction percentage alone cannot establish that the game works for a wider audience. Tester availability remains unconfirmed.

### 1.5 Implementation-facing commitments

Content will use structured monster, move, type, and moveset records. Effects will refer to a small shared catalog of rule operations, such as dealing damage or changing Speed. The later schemas must specify required fields and legal values.

The same starting state, submitted choices, rules version, and random seed must reproduce the same match. A random seed is the recorded starting value used to generate repeatable random results. Record team offers, redraws, choices, action results, and the content version so later balance changes do not obscure what happened.

The implementation budget assumes one hobbyist developer using AI assistance. V1 human tests use live private online matches and initially untimed choices. This phase produces the design document; engine, simulation harness, and playable interface follow in later phases.

### 1.6 Main uncertainties

- Four-monster teams may shorten matches at the cost of recovery opportunities. Measure whether an early knockout leaves meaningful decisions.
- Independent team generation can produce unfavorable matchups. A mulligan provides limited agency, but every eligible first offer still needs a credible plan.
- Critical hits may feel more disruptive late in a short match. Review outcomes where a critical changes a knockout or the winner.
- Full information may make some choices too obvious. Review repeated attack sequences and whether prediction and switching remain useful.
- Playtest goals and roster budgets remain hypotheses until observed in games.

## 2. Core battle loop and resolution protocol

Status: Approved as the V1 starting battle protocol. Numerical values are initial tuning values.

### 2.1 Match setup and information

1. Generate the two teams independently. Each player sees only their own first offer.
2. Each player commits KEEP or REDRAW. REDRAW immediately replaces the entire offer with another eligible team and is automatically final. Each player has one redraw. Neither decision nor the opposing team is revealed before both commitments are complete.
3. Reveal both final teams: monster stats, types, moves and their rules, maximum and current Health, and move-use limits. Discarded offers remain hidden from the opponent during the match but are recorded for analysis.
4. Each player secretly selects a lead from their four monsters. Reveal both leads together. Lead selection consumes no combat turn or move use.

All monsters begin at maximum Health with full move uses and no effects. There are no entry effects in V1.

During battle, both players see all finalized-team information, current Health and uses, effects and remaining durations, active monsters, and knocked-out monsters. Opponent commitments and future random results remain private. The battle seed is recorded for replay and is not exposed during the match.

### 2.2 Normal choices and commitment

Each normal turn gives each player exactly one choice:

| Choice | Legal when | Result |
| --- | --- | --- |
| Use a known move | The active monster is alive and the move has at least one use remaining | Queue that active monster using that move. |
| Use the fallback attack | No known damaging move has uses remaining | Queue an unlimited-use weak damaging attack. Remaining utility moves are still selectable. Its numbers belong in Section 4. |
| Switch | The destination is an alive monster on the player's bench | Replace the active monster; this is the player's entire action. |

A damaging move is one whose data specifies positive attack power. Every authored set must contain at least one such move; stricter set constraints belong in Section 6.

There is no pass action. Invalid choices are rejected privately and do not count as commitments. A valid commitment is final. Neither player sees the opponent's choice before both commit. Submission order never affects combat order.

A combat turn is counted when both normal choices commit. Lead selection and forced replacement do not increase that count.

### 2.3 Resolution sequence

| Phase | Exact operation |
| --- | --- |
| 1. Voluntary switches | Apply every submitted switch together. Incoming monsters cannot also use a move this turn. |
| 2. Queue order | Order submitted moves by higher priority, then higher effective Speed. If both are equal, use one recorded 50/50 roll to choose the first actor. |
| 3. First move | If its actor is still alive and active, spend one use and resolve the move completely. Process knockouts and check the result. |
| 4. Second move | If the match continues and its actor is still alive and active, spend one use and resolve it completely. Process knockouts and check the result. |
| 5. End-of-turn effects | Collect all due effects on living active monsters, apply due Health changes together, then process knockouts and expire effects. Check the result. |
| 6. Limit and replacement | If no result exists and this was turn 60, declare a draw. Otherwise obtain needed replacements, then open the next normal turn. |

Move priority is a fixed integer in the move record, initially restricted to -1, 0, or +1. Ordinary moves use 0. Voluntary switches always occur before moves, including +1 moves.

Effective Speed means the stat after current modifiers, with rounding defined in Section 3. Capture ordering Speed once in phase 2. A Speed change during a move affects ordering on later turns; it does not reorder this turn. Other move calculations use the current state when the move executes, so an earlier defense change can affect a later attack.

Roll a Speed tie only when two queued moves actually tie in both priority and Speed. Two switches need no order roll. Critical rolls occur only for executed damaging actions, according to Section 3.

### 2.4 Switching and the bench

- A voluntary switch costs the player's normal action. There is no additional Health or move-use cost.
- An opponent-targeted move targets the monster active when that move executes. If the opponent switches, their incoming monster receives the attack.
- Health, remaining move uses, and persistent statuses stay with each monster through a switch.
- Switching clears the outgoing monster's temporary stat changes and short defensive effects. These benefits do not transfer to the incoming monster.
- Benched monsters receive no periodic damage, healing, or other end-of-turn effects. Their persistent-status durations pause; Section 4 defines exact timer values.
- There is no passive recovery on switching or on the bench.

V1 uses voluntary switches and knockout replacements only. Move-triggered switches, forced switches, reactive decisions between queued moves, and revival are deferred to keep the turn protocol small.

### 2.5 Move execution and knockouts

Bind a queued move to its original actor, not to the team's active position. It can never be inherited by a replacement monster.

Spend one use when a legal actor begins its move. A move that produces no effect, such as healing at full Health, still spends its use. A move canceled because its actor was knocked out spends no use and makes no critical roll. The fallback has unlimited uses.

Resolve effects in the order declared by the shared move rules in Section 4. Health is clamped between zero and maximum Health. At zero Health, a monster is knocked out permanently for this match: cancel its queued action, remove temporary effects, and skip any remaining effects that require it to be alive. No effect restores a knocked-out monster.

Finish the current move's applicable effects before checking the match result. If a victory or draw is established, resolution stops immediately; no later move, end-of-turn effect, or replacement occurs. For example, knocking out the opposing last monster wins before the winner's scheduled periodic damage.

For end-of-turn Health changes, collect every due effect from the same pre-phase state and apply the resulting changes together. One monster being knocked out by periodic damage does not cancel the other monster's already-due damage. Health effects occur before duration expiry; any rules for newly applied effects and duration decrement belong in Section 4.

### 2.6 Forced replacements

After end-of-turn resolution and the turn-limit check, each player with a knocked-out active monster and surviving teammates must select a replacement.

| Situation | Procedure |
| --- | --- |
| Only one side needs a replacement | That player chooses an alive benched monster. The opponent takes no action. |
| Both sides need replacements | Both choose secretly; reveal and place both replacements together. |
| A side has only one possible replacement | Select it automatically. If both sides need replacements, keep it hidden until the other replacement is committed. |

Replacement consumes no combat turn or move use and does not grant an attack. All surviving active monsters remain in place. Periodic effects do not tick during the replacement gate. The next normal turn opens only when both sides have a living active monster.

### 2.7 Results, limits, and interrupted play

| Condition | Result |
| --- | --- |
| Exactly one team has any living monsters after an action or simultaneous end-of-turn batch | That team wins. |
| Both teams have no living monsters after the same action or end-of-turn batch | Draw. |
| Both teams still have living monsters after the end of turn 60 | Draw. |
| A player resigns during a choice gate | That player loses. |
| A session is abandoned or cannot resume after a connection interruption | Mark interrupted, record the state and reason, and report separately from combat wins and draws. |

A result, once established, is final. Team knockout results take precedence over the turn cap. A cap draw uses no Health or surviving-monster score. Review every cap draw as a pacing or progress failure.

The fallback prevents move exhaustion from leaving a player with no legal attack. Repeated switching or other loops are bounded by the cap. There is no decision timer in the initial private playtest build. On a disconnection, finish any already-committed resolution and pause at the next choice gate; preserve private commitments for resumption.

### 2.8 Illustrative traces

Damage amounts here illustrate timing only; they are not derived balance values.

| Situation | Resolution |
| --- | --- |
| Player A selects an attack; Player B switches to a monster with 80 Health; the attack deals 24 damage | The switch occurs first. The incoming monster ends the attack at 56 Health and gets no move that turn. |
| A faster monster deals lethal damage to the slower monster before its selected attack | The slower monster's attack is canceled without spending a use. Its player replaces it after end-of-turn effects, if the match continues. |
| Both last monsters have 4 Health and each has 4 periodic damage due at turn end | Both due damage effects apply together; both teams are exhausted and the result is a draw. |
| A monster knocks out the opponent's last monster while having lethal periodic damage scheduled | Its team wins immediately after the move; the end-of-turn phase does not occur. |


## 3. Stats, damage, and the type system

Status: Approved as the V1 starting stats, damage rules, and elemental type chart. All ranges, multipliers, powers, and example values are initial tuning values.

### 3.1 Base stats and scaling

Every monster has six positive integer base stats. A base stat is the value stored in its content record, before battle effects.

| Stat | Data field | Initial base range | Purpose |
| --- | --- | --- | --- |
| Maximum Health | max_health | 100–140 | Starting Health and the knockout threshold. Current Health ranges from 0 to this maximum. |
| Force | force | 40–100 | Strength of bodily and material attacks. |
| Guard | guard | 50–100 | Defense against Force damage. |
| Spirit | spirit | 40–100 | Strength of supernatural and ritual attacks. |
| Ward | ward | 50–100 | Defense against Spirit damage. |
| Speed | speed | 40–100 | Move order within the same priority. |

There are no levels, growth rolls, or individual stat variation. Each monster's approved content record supplies its fixed base stats. Role budgets and allocation rules belong in Section 5; strength calibration belongs in Sections 5–6.

Battle effects can modify Force, Guard, Spirit, Ward, and Speed. Maximum Health stays fixed.

For any modified stat X:

$$
X_{\mathrm{effective}}
=\max\left(1,\left\lfloor X_{\mathrm{base}}\prod_i m_i\right\rfloor\right).
$$

Here, the m values are the active stat multipliers permitted by Section 4. Multiply them together before rounding down once. For example, Ward 60 with a 5/4 multiplier becomes Ward 75; Force 90 with that multiplier becomes Force 112.

Use exact fractions rather than rounded decimals in rule data. Allowed modifiers, stacking, and durations remain to be defined in Section 4. Ordering Speed is captured once per turn as approved in Section 2.

### 3.2 Damage categories

| Category | Attacker stat A | Defender stat F | Meaning |
| --- | --- | --- | --- |
| Force | Effective Force | Effective Guard | Bodily or material damage. |
| Spirit | Effective Spirit | Effective Ward | Supernatural or ritual damage. |
| Utility | None | None | Applies an effect without direct attack damage; power is zero. |

Category and type are separate properties. Any of the six types can use either damage category. A move declares exactly one category and, if damaging, one attack type.

### 3.3 Direct damage formula

For an executed damaging move against a living opposing active monster:

$$
d_{\mathrm{raw}}=P\frac{A}{A+F}MTCR,
\qquad
D=\max\left(1,\left\lfloor d_{\mathrm{raw}}\right\rfloor\right).
$$

| Symbol | Exact meaning |
| --- | --- |
| P | Move power. Initial authored attacks use 40–80; utility uses 0. The weak fallback's power is defined separately in Section 4. |
| A | Effective attacking stat selected by the category. |
| F | Effective defending stat selected by the category. |
| M | Matching-type bonus: 6/5 if the move's type matches its user's type; otherwise 1. |
| T | Type effectiveness from the chart: 3/2, 1, or 2/3. |
| C | Critical multiplier: 5/4 on a critical, otherwise 1. |
| R | Active short defensive effect's final damage multiplier; otherwise 1. V1 permits one such effect at a time. Section 4 defines its magnitude and duration. Its value must be greater than 0 and at most 1. |
| D | Computed direct damage, before limiting it to the target's remaining Health. |

Calculate A and F as effective integer stats first. Then multiply every damage factor before rounding damage down once. Never round a neutral or non-critical intermediate damage value and multiply it afterward.

New Health is max(0, current Health − D). Actual Health removed is min(current Health, D). Record computed damage and actual Health removed separately so overkill does not inflate damage metrics.

The minimum of one applies only to valid direct damaging moves. Utility moves deal no direct damage. Periodic status damage and healing use their own percentage rules in Section 4 and receive no matching-type, effectiveness, or critical multiplier.

The fallback has no type: M = 1 and T = 1 against every monster. Its category and power are specified in Section 4.

### 3.4 Why this formula

The ratio A/(A+F) gives bounded, diminishing returns. Equal attacking and defending stats allow half the move's power through before the other multipliers. Doubling A from 80 to 160 against F = 80 changes that fraction from 1/2 to 2/3, increasing damage by about 33%.

This reduces the payoff from extreme stat gaps and helps constrain setup. It also means a 25% attack-stat increase is weaker than a 25% direct-damage increase: from equal stats, it raises damage by about 11%. A standalone setup move therefore needs an appropriate additional benefit, stronger modifier, or duration to justify spending an action; Section 4 must account for this.

With equal attacking and defending stats, power 65, and a matching type:

| Matchup | Normal damage | Hits to knock out 120 Health, without healing |
| --- | --- | --- |
| Favorable | 58 | 3 |
| Neutral | 39 | 4 |
| Resisted | 26 | 5 |

These are reference cases, not promises for every monster. Actual pacing depends on stats, switching, utility, and canceled actions.

Within the proposed base-stat and power ranges, an unmodified neutral matching-type critical has a maximum computed damage of 80, below the minimum starting Health of 100. Favorable criticals or prepared stat changes can still knock out a fragile monster from full Health; track those events.

### 3.5 Accuracy, criticals, and randomness

- All V1 moves have 100% accuracy against legal targets. There are no accuracy rolls or accuracy/evasion modifiers.
- Ordinary damage has no random range.
- Each executed damaging action against a living target makes exactly one uniform integer draw from 0 through 35. A result of 0 is a critical: chance 1/36.
- Each damaging move has one damage hit in V1. Criticals do not multiply status damage, healing, duration, or stat changes.
- Criticals use the defender's current Guard or Ward and any defensive damage reduction. They do not bypass modifiers.
- Secondary effects are guaranteed when their stated conditions are met; there are no random effect chances.
- Canceled moves make no critical draw. Utility moves make no critical draw.
- Speed ties use the separate recorded 50/50 rule from Section 2. Team generation uses recorded randomness defined in Section 6.

The two sources of in-battle uncertainty are critical hits and exact move-order ties. Record outcomes for replay. The low per-action critical chance still produces criticals in many matches; review knockout thresholds rather than relying only on average damage.

### 3.6 Elemental types and their identities

The user-selected type names, data IDs, and effectiveness relationships below are approved as the V1 starting type system.

| Type / data ID | Represents | Favorable against |
| --- | --- | --- |
| Fire / fire | Flame, heat, and combustion | Air, Dark |
| Air / air | Currents, pressure, and turbulence | Water, Light |
| Earth / earth | Stone, soil, and grounded mass | Fire, Light |
| Water / water | Flow, liquid pressure, and erosion | Fire, Earth |
| Dark / dark | Shadow, decay, and draining stillness | Air, Earth |
| Light / light | Radiance, clarity, and purification | Water, Dark |

Fire draws fuel from Air and illuminates Dark; Air stirs Water and scatters Light; Earth smothers Fire and blocks Light; Water quenches Fire and erodes Earth; Dark stills Air and decays Earth; Light disperses Water through radiant heat and drives back Dark.

The less literal interactions use the setting's fantasy logic. Keep these relations visible during play so learning the chart does not depend on guessing from the labels.

These types support folklore, industrial, and surreal creature origins. A monster has one type in V1. Types modify direct damage only; utilities and persistent statuses have no type immunities.

### 3.7 Complete effectiveness chart

Read the attacking move's row against the target monster's column. The fractions are exact: 3/2 = 1.5×; 2/3 must not be stored as 0.67. All multipliers are initial tuning values.

| Attack type / Target type | Fire | Air | Earth | Water | Dark | Light |
| --- | --- | --- | --- | --- | --- | --- |
| Fire | 1 | 3/2 | 2/3 | 2/3 | 3/2 | 1 |
| Air | 2/3 | 1 | 1 | 3/2 | 2/3 | 3/2 |
| Earth | 3/2 | 1 | 1 | 2/3 | 2/3 | 3/2 |
| Water | 3/2 | 2/3 | 3/2 | 1 | 1 | 2/3 |
| Dark | 2/3 | 3/2 | 3/2 | 1 | 1 | 2/3 |
| Light | 1 | 2/3 | 2/3 | 3/2 | 3/2 | 1 |

Every attack row has two favorable targets, two resisted targets, and two neutral targets. Every defensive column has two weaknesses, two resistances, and two neutral relationships. Self-matchups are neutral. The neutral cross-type pairs are Fire/Light, Air/Earth, and Water/Dark. There are no immunities.

Equal row and column counts establish a common starting budget. Coverage relationships are not identical for every type, and monster stats, move access, and team composition can still create dominance. Simulation and human tests must measure those effects.

A known coverage risk is Fire plus Air: together their favorable targets are Air, Water, Dark, and Light, and no target resists both. Author sets with constrained off-type power and access in Sections 4–6. Apply the same coverage check to every eligible two-type attack combination.

### 3.8 Worked numerical examples

Example 1 — neutral Force attack:

- A Fire monster uses a Fire Force move with power 65.
- Effective Force = 80; the opposing Fire monster's effective Guard = 80.
- Matching bonus M = 6/5; self-type matchup T = 1; no critical C = 1; no defensive effect R = 1.

$$
D=\left\lfloor65\frac{80}{80+80}\frac65\right\rfloor
=\lfloor39\rfloor=39.
$$

A target at 120 Health falls to 81. Four such hits knock it out if nothing else changes.

Example 2 — favorable Spirit critical against boosted Ward:

- A Water monster uses a Water Spirit move with power 70 against an Earth monster.
- Effective Spirit = 90. The target has base Ward 60 and a 5/4 Ward modifier, so effective Ward = 75.
- Matching bonus M = 6/5; favorable matchup T = 3/2; critical C = 5/4; no additional defensive effect R = 1.

$$
D=\left\lfloor70\frac{90}{90+75}\frac65\frac32\frac54\right\rfloor
=\left\lfloor\frac{945}{11}\right\rfloor=85.
$$

A target at 100 Health falls to 15. Without the critical, damage is floor(756/11) = 68, leaving 32 Health. Without the Ward modifier, the critical would deal floor(94.5) = 94. The critical preserves the benefit of the defender's Ward change.

The Ward modifier in this example illustrates formula behavior; the move catalog will define which moves grant it and for how long.


## 4. Moves, resources, statuses, and temporary effects

Status: Approved as the V1 starting move catalogue, resources, statuses, and effect rules. Every value and catalogue entry remains an initial tuning choice.

### 4.1 Move structure and resources

A monster knows four distinct authored moves. Each known move has its own remaining-use counter, initialized to its maximum at match start. Uses do not recover during a match, on switching, or on the bench.

The V1 catalogue contains 24 authored moves plus the universal fallback family. Core attacks have 10 uses, quick attacks 8, and utility moves 2–4. All have 100% accuracy and deterministic effects when their requirements are met.

Move roles are content labels, not extra rules: core damage, finishing, coverage, pressure, tempo setup, defense, healing, and cleanup. Coverage means an attack whose type differs from its user's type.

Spend one use when the original living active actor starts the move, as approved in Section 2. An ineffective heal, unnecessary cleanup, or refresh still spends its use. An exhausted move cannot be selected. A canceled actor spends no use.

### 4.2 Damage catalogue: twelve core attacks

Every core attack below has power 65, priority 0, 10 uses, target opposing active, and exactly one direct-damage effect. Its category is the column it appears in. Each may be assigned only to monsters of the matching type.

| Type | Force move ID / name | Spirit move ID / name |
| --- | --- | --- |
| Fire | M01 / Coalspur Strike | M02 / Hearthflare |
| Air | M03 / Gale Hook | M04 / Skycoil |
| Earth | M05 / Cairn Hammer | M06 / Fault Hymn |
| Water | M07 / Rill Lash | M08 / Undertide |
| Dark | M09 / Shade Rake | M10 / Dusk Thread |
| Light | M11 / Halo Ram | M12 / Dawn Weave |

### 4.3 Six quick attacks

Every quick attack has power 40, priority +1, 8 uses, target opposing active, and exactly one direct-damage effect. Authored sets may use them as matching-type finishers or off-type coverage.

| ID | Name | Type | Category |
| --- | --- | --- | --- |
| M13 | Cinder Flick | Fire | Force |
| M14 | Draft Jab | Air | Force |
| M15 | Pebble Sign | Earth | Spirit |
| M16 | Spray Rune | Water | Spirit |
| M17 | Gloom Nick | Dark | Force |
| M18 | Ray Pin | Light | Spirit |

The category split is a content choice, not a restriction on which damage categories an element can use. Both categories already exist for every element in the core catalogue.

Only these power-40 attacks may be assigned off-type in V1. No authored set has more than one off-type attack. At equal attacking and defending stats, a favorable off-type quick attack deals 30 damage, while a neutral matching-type core attack deals 39. Coverage provides a useful alternative to resistance without automatically replacing the core attack.

### 4.4 Six utility moves

All utilities have category utility, no attack type, power 0, and 100% accuracy. Effects execute in the listed order.

| ID / name | Priority | Uses | Exact effects |
| --- | --- | --- | --- |
| M19 / Hearthstitch | 0 | 2 | Restore floor(maximum Health / 4) to self, capped at maximum Health. |
| M20 / Ashen Ledger | 0 | 4 | Apply Fray to the opposing active monster with 3 end phases remaining. |
| M21 / Weightbind | 0 | 4 | Apply Tethered to the opposing active monster with 4 end phases remaining. |
| M22 / Kindled Oath | 0 | 3 | Give self temporary Force ×2, Spirit ×2, and Speed ×5/4. Each modifier lasts 4 active end phases. |
| M23 / Lantern Brace | +1 | 4 | Give self Guard ×5/4 and Ward ×5/4 for 4 active end phases; then apply final direct-damage multiplier R = 1/2 for 2 active end phases. |
| M24 / Clearwake Rite | +1 | 3 | Remove Fray and Tethered from self; then remove all temporary stat modifiers from the opposing active monster. |

Clearwake Rite does not heal, remove the opponent's persistent statuses, or remove its separate R damage-reduction effect. It removes stat modifiers such as Kindled Oath's attack/Speed boosts and Lantern Brace's Guard/Ward boosts. Speed order remains the snapshot captured before moves, even when modifiers are removed.

Kindled Oath's ×2 attack stats give about 33% more damage at equal original attack and defense. For example, an equal-stat matching-type power-65 attack rises from 39 damage to 52. The action cost, short duration, switching reset, and Clearwake Rite provide counterplay. Reapplication does not multiply the boost again.

Lantern Brace deliberately buys time through two layers: stronger defense stats and a shorter damage reduction. Against an otherwise equal-stat neutral power-65 attack, it reduces damage from 39 to 17 while both layers are active. Fray bypasses both layers. Healing and bracing cannot appear together on one V1 set.

### 4.5 The two persistent statuses

Persistent means retained through switching, not permanent for the match. Each status occupies its own record; both may coexist.

| Status ID / name | Effect | Initial duration | Removal |
| --- | --- | --- | --- |
| fray / Fray | At each active end phase, lose max(1, floor(maximum Health / 8)). Ignores type, defense stats, R, and criticals. | 3 active end phases, including the application turn | Expiry or Clearwake Rite |
| tethered / Tethered | Multiply Speed by 1/2. Does not prevent actions or switching. | 4 active end phases, including the application turn | Expiry or Clearwake Rite |

At 120 maximum Health, Fray deals 15 per tick and 45 over all three ticks. At maximum Health 100 and 140, the tick values are 12 and 17.

Reapplying a status replaces its remaining duration with the full duration and updates its recorded source. It creates no second copy and no extra tick. This is a refresh, not an immediate damage effect.

Persistent statuses remain attached when their recipient switches out. Their timers pause and Fray deals no damage on the bench. A voluntary switch-in with retained Fray makes that monster eligible for the current turn's end tick. A knockout replacement enters after cleanup and first becomes eligible at the following turn's end.

A status remains on its recipient even if the original source switches or is knocked out. Store the source for damage attribution, not as a condition for the effect to function.

### 4.6 Temporary modifiers and stacking

The temporary effects are Kindled Oath's stat modifiers, Lantern Brace's stat modifiers, and its separate R effect. They apply immediately, last only while active, and clear when their owner switches out or is knocked out.

- Store at most one temporary modifier for each of Force, Guard, Spirit, Ward, and Speed.
- Applying a modifier replaces that stat's previous temporary modifier and resets its duration. Repeated ×2 modifiers remain ×2.
- Store at most one R damage-reduction effect. Repeated bracing resets R to 1/2 and its duration; it never becomes 1/4.
- Persistent-status modifiers multiply with temporary stat modifiers before the single rounding step from Section 3.
- For example, base Speed 85 under Kindled Oath and Tethered becomes floor(85 × 5/4 × 1/2) = 53.
- Removing a status removes its modifier immediately. Removing a temporary modifier leaves persistent statuses in place.
- None of these changes reorder the already-queued moves in the current turn.

### 4.7 Shared duration clock

A duration of N means N active end-phase processing passes, including the application turn's end phase. All active timed effects use this convention.

At each end phase:

1. Snapshot the living active monsters and their current effects.
2. Collect due Fray Health losses from that snapshot and apply them simultaneously, using Section 2's knockout handling.
3. Decrease remaining end phases by one for every captured timed effect whose record still exists.
4. Remove effects at zero; recalculate effective stats as needed.
5. Check the match result, then the turn cap, then handle replacements.

Newly applied Fray ticks during that turn's cleanup. New temporary effects also decrement then. A monster already knocked out before the phase is excluded. Only captured active effects advance; bench effects do not.

| Effect applied during turn T | Active lifespan if its owner stays in |
| --- | --- |
| Fray, duration 3 | Ticks at ends of T, T+1, T+2; then expires. |
| Tethered, duration 4 | Changes displayed Speed immediately; affects move order on T+1, T+2, T+3; expires at end of T+3. |
| Kindled Oath modifiers, duration 4 | Apply immediately; usable on the three later normal turns; expire at end of T+3. |
| Brace stat modifiers, duration 4 | Protect immediately once the move resolves; last through T+3. |
| Brace R effect, duration 2 | Protects after application on T and through T+1; expires at end of T+1. |

Priority +1 helps Lantern Brace precede normal attacks, but another +1 move can precede it through Speed or a tie roll. A canceled bracing action grants no effects.

### 4.8 Universal fallback

Bare Resolve is available only when every known damaging move has zero uses remaining. Remaining utility moves stay selectable.

| Property | Value |
| --- | --- |
| Power | 20 |
| Type | None; M = 1 and T = 1 against every monster |
| Priority | 0 |
| Uses | Unlimited |
| Effect | One ordinary direct-damage hit, with the normal 1/36 critical chance |
| Category | Force if base Force is at least base Spirit; otherwise Spirit |

The category is fixed at match setup and uses its corresponding current effective stats during execution. The engine selects one of two ordinary data records, F01 / Bare Resolve (Force) or F02 / Bare Resolve (Spirit); only that monster's variant is offered. These are two records for one fallback action, outside the 24 authored moves and outside the known four-move set.

The fallback has no self-damage. Its purpose is to keep exhausted teams able to make progress.

### 4.9 V1 set safeguards and move-design rules

Apply these to the generator's authored-set profile:

- Four distinct authored moves; at least two damaging moves and at least one matching-type core attack.
- Core attacks match the monster's type. Only quick attacks can be off-type; at most one off-type attack per set.
- Hearthstitch and Lantern Brace are mutually exclusive within a set.
- Initial team recommendation for Section 6: at most one Hearthstitch user and at most one Lantern Brace user per team. The generator will define how these caps combine with role requirements.
- All utility access is explicitly authored in the monster/set data; the generator does not draw arbitrary utilities from the catalogue.

A move should have a useful situation and a visible cost: weaker power for priority/coverage, an action spent preparing a boost, limited healing, or limited cleanup. At full information, a move that is routinely the best action across unrelated positions needs retuning.

Watch especially for Kindled Oath becoming a mandatory opener, Fray dominating neutral openings or causing mirror draws, Clearwake Rite becoming mandatory on every set, and repeated bracing extending matches beyond the target. Check access and set combinations as well as numerical strength.

All direct attacks in this initial catalogue have no secondary effects. Compound utility moves demonstrate deterministic effect lists without adding chance-based triggers.

### 4.10 Data schema and shared effect operations

Each move is one structured record. IDs are stable when display names or tuning values change.

| Field | Required definition |
| --- | --- |
| id | Unique string, M01–M24 for authored moves; F01/F02 for fallback variants. |
| name | Display name. |
| type | One of fire, air, earth, water, dark, light; null for utilities and fallback. |
| category | force, spirit, or utility. |
| power | Nonnegative integer; 65 for core, 40 for quick, 0 for utility, 20 for fallback. |
| accuracy | Integer 100 in V1. |
| priority | Integer -1, 0, or +1; current catalogue uses 0 and +1. |
| max_uses | Positive integer for authored moves; null for unlimited fallback. |
| roles | List of descriptive content labels, such as coverage or healing. |
| effects | Ordered list of shared operations with targets and parameters. |

Supported targets are self and opponent_active. Every effect skips a target that is no longer alive. Effects use the current state at their point in the list. No move targets a benched monster.

| Shared operation | Parameters / behavior |
| --- | --- |
| deal_direct_damage | Use the move's category, power, and type in Section 3's formula; only one occurrence per damaging move. |
| restore_health_fraction | Target and exact fraction of maximum Health; floor once and cap the actual healing. |
| lose_health_fraction | Recipient and exact fraction of maximum Health; floor once, minimum one, cap actual loss. Used by Fray at end phase; ignores direct-damage multipliers. |
| apply_status | Target and status ID; copy the status definition's default duration, record source, refresh the one existing instance. |
| apply_stat_modifier | Target, stat, exact multiplier, and duration in active end phases; replace that stat's temporary modifier. |
| apply_damage_reduction | Target, exact R multiplier, and active-end-phase duration; replace the one R record. |
| remove_statuses | Target and list of status IDs; delete matching persistent status records. |
| clear_stat_modifiers | Target; delete temporary Force/Guard/Spirit/Ward/Speed modifier records, preserving statuses and R. |

Fractions use integer numerator/denominator pairs with positive denominators. Status definitions store ID, name, default duration, stat modifiers, end-phase effects, and the switching/clock policies above.

Each active timed-effect record stores its kind/key, recipient, source player and monster slot, parameters, and remaining end phases. The effect key is the status ID for persistent statuses, the stat for temporary stat modifiers, or the one R key for damage reduction. This supplies refresh/replacement behavior without rules keyed to a move's display name.

Represent a monster's chosen fallback ID in its battle record. The generation/authoring constraints belong to content validation; the shared operation interpreter supplies the battle behavior.

### 4.11 Field conditions, abilities, and held items

Global field effects, entry hazards, abilities, and held items are deferred for V1. The assigned teams, authored sets, stats, types, and utilities supply the initial Random Battles experience.

This keeps balance diagnoses focused on moves, monster stats, and generation, and keeps the turn protocol free of passive or entry-trigger exceptions. Sections 5 and 8 can reserve optional content fields for later abilities/items; they are empty in V1. No new combat behavior is implied by those future fields.


## 5. Monster roster, stat budgets, and authored sets

Status: Approved as a tentative V1 roster and set design, subject to later adjustment. Every stat, set, allocation weight, and eligibility rule remains an initial tuning choice.

### 5.1 Roster scope

V1 contains 12 single-type monsters: two each of Fire, Air, Earth, Water, Dark, and Light. Each monster has two pre-authored four-move sets, giving 24 monster-set entries. The 24 shared moves remain the catalogue from Section 4.

A monster-set entry is one species with one particular move assignment. Players receive that assignment; they never choose between its sets. Both sets use the same species stats, type, and appearance. Set names help describe the supplied plan and have no mechanical effect.

This size gives each type more than one stat profile without making content breadth the playtest's focus. Every type has a monster whose higher attack stat is Force and one whose higher attack stat is Spirit. Bellmane also has a useful second attack category.

### 5.2 Role archetypes

Archetypes describe useful plans, not additional battle rules. One monster or set may serve several roles.

| Archetype | Tools | Intended cost or vulnerability |
| --- | --- | --- |
| Fast attacker | High Speed and a strong main attack; sometimes priority damage | Lower Health leaves little room for an unfavorable exchange. |
| Bruiser | A strong attack with more Health or Guard than a fast attacker | Moderate or low Speed means it may take damage before acting. |
| Mixed-category attacker | Both matching-type core categories with usable Force and Spirit | Pays for a second attack stat; lacks the specialist's maximum main attack or defenses. |
| Control attacker | Fray, Tethered, or Clearwake Rite alongside reliable damage | Utility spends an attacking opportunity; effects expire, refresh without stacking, or can be removed. |
| Defensive attacker | Guard/Ward and finite bracing alongside damaging moves | Defense must support a knockout plan; Fray bypasses it and switching clears temporary benefits. |
| Recovery attacker | Two finite healing uses alongside reliable damage | Healing takes an action and may restore less than the incoming hit; no bracing on the same set. |

Speed and damage categories vary within the roster; no type has an exclusive role. Air's two monsters are deliberately fast; Light's are more durable. These theme-driven differences still require per-type performance checks.

### 5.3 Weighted stat-allocation budget

Use a weighted allocation budget because a rarely used second attack stat contributes less than a main attack, and separate defenses each answer only one category.

For base stats, let A_hi = max(Force, Spirit) and A_lo = min(Force, Spirit). Define the authoring budget:

$$
B = H + A_{\mathrm{hi}} + \frac{A_{\mathrm{lo}}}{4}
    + \frac{Guard + Ward}{2} + \frac{Speed}{2}.
$$

H is maximum Health. Use exact quarter-point arithmetic; B is a content-validation value and never enters the damage formula. For integer validation, compute 4B = 4H + 4A_hi + A_lo + 2Guard + 2Ward + 2Speed: target 1320, eligible range 1300–1340. Do not round the budget.

| Component | Initial allocation weight |
| --- | --- |
| Maximum Health | 1 per stat point |
| Higher attack stat | 1 per stat point |
| Lower attack stat | 1/4 per stat point |
| Guard | 1/2 per stat point |
| Ward | 1/2 per stat point |
| Speed | 1/2 per stat point |

Target B = 330, with an initial eligible range of 325–335. Base stats must also stay within Section 3's approved ranges. These weights are an authoring heuristic: a consistent way to compare allocations before playtests. They are not measured conversion rates between stats.

Two allocation examples:

- Coalspindle: 110 + 100 + 40/4 + (70+60)/2 + 90/2 = 330.
- Cairnox: 140 + 85 + 40/4 + (85+65)/2 + 40/2 = 330.

Their equal budgets allow different plans: Coalspindle acts earlier and hits harder; Cairnox has more Health and Guard. Utility access, move categories, type relationships, and knockout thresholds still affect their actual strength.

No extra budget is assigned to types or individual moves in this first pass. Equal chart counts do not establish equal type strength, and a linear price would miss utility combinations. Evaluate each monster-set entry as well as the species aggregate. If healing or bracing makes a set too strong, tune its access, stats, or shared move values using match evidence.

### 5.4 Original roster and base stats

All creatures start within the Lantern Marches setting. Their origin is descriptive content stored separately from combat type.

| ID / name | Type | Stat role | Creature premise |
| --- | --- | --- | --- |
| N01 / Coalspindle | Fire | Fast Force attacker | A soot-and-wicker creature born from the ritual of banking a hearth before sleep; it runs on jointed firewood legs. |
| N02 / Hearthmoth | Fire | Durable Spirit attacker | A folded festival-paper creature whose ember-patterned wings glow with wishes left beside household fires. |
| N03 / Ribbonrook | Air | Fastest Force attacker | A road-sign ribbon given a birdlike body by travelers' farewell songs; its trailing knots point toward home. |
| N04 / Chimekite | Air | Fast Spirit attacker | A living weather kite with a ring of floating ceramic chimes, awakened by a town's first spring procession. |
| N05 / Cairnox | Earth | Slow, durable Force attacker | A moving cairn with branch antlers, born when generations add stones to mark a safe mountain crossing. |
| N06 / Rootwrit | Earth | Spirit control; alternate Force attack | A root-bound clay figure carrying leaf-shaped tablets, formed from vows buried beneath an old boundary tree. |
| N07 / Rillhorn | Water | Force bruiser | A stream creature with a curved hollow horn and stepping-stone feet, born from the promise to keep a ford open. |
| N08 / Wellwisp | Water | Durable Spirit attacker | A suspended bead of water inside a walking rope-and-bucket frame, awakened by wishes spoken into a village well. |
| N09 / Knellbadger | Dark | Force control; high Guard | A squat burrowing creature with a silent bell-shaped carapace, born from the solemn counting of names at dusk. |
| N10 / Duskquill | Dark | Fast Spirit attacker | An ink-bodied creature with floating quills for limbs, formed from unfinished stories hidden away at night. |
| N11 / Bellmane | Light | Mixed-category attacker | A four-legged lantern guardian with a mane of luminous bell ribbons, born from a community's vow to guide lost travelers. |
| N12 / Glimmerscribe | Light | Slow Spirit control; high Ward | A walking bundle of translucent scrolls with a hovering lamp for a head, awakened by records of promises kept. |

Health below is maximum Health. Every value is a fixed base stat; sets have no stat overrides.

| ID / name | Health | Force | Guard | Spirit | Ward | Speed | Budget B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| N01 / Coalspindle | 110 | 100 | 70 | 40 | 60 | 90 | 330 |
| N02 / Hearthmoth | 125 | 50 | 65 | 85 | 90 | 65 | 332.5 |
| N03 / Ribbonrook | 105 | 95 | 65 | 50 | 70 | 100 | 330 |
| N04 / Chimekite | 110 | 40 | 65 | 95 | 80 | 85 | 330 |
| N05 / Cairnox | 140 | 85 | 85 | 40 | 65 | 40 | 330 |
| N06 / Rootwrit | 125 | 65 | 85 | 80 | 70 | 60 | 328.75 |
| N07 / Rillhorn | 125 | 90 | 75 | 40 | 60 | 75 | 330 |
| N08 / Wellwisp | 130 | 50 | 60 | 90 | 80 | 55 | 330 |
| N09 / Knellbadger | 130 | 85 | 90 | 40 | 70 | 50 | 330 |
| N10 / Duskquill | 105 | 40 | 65 | 100 | 70 | 95 | 330 |
| N11 / Bellmane | 120 | 85 | 70 | 80 | 70 | 70 | 330 |
| N12 / Glimmerscribe | 135 | 40 | 75 | 80 | 90 | 45 | 330 |

All 12 base Speed values are distinct. That reduces order ties between different unmodified species; opposing copies and battle modifiers can still create ties under Section 2's rule.

### 5.5 All 24 authored sets

Move IDs refer to Section 4's catalogue. Each row is the complete four-move assignment. Its plan describes options, not a required opening sequence.

| Set ID | Monster / set name | Four move IDs | Intended plan |
| --- | --- | --- | --- |
| N01-A | Coalspindle / Ember Pursuit | M01, M13, M14, M24 | Three attacks offer normal-speed damage, finishing, and limited Air coverage; clear disruptive effects. |
| N01-B | Coalspindle / Vow of Sparks | M01, M13, M22, M20 | Prepare an attacking window or use Fray to pressure a durable switch-in. |
| N02-A | Hearthmoth / Hearthkeeper | M02, M16, M19, M24 | Recover after favorable exchanges; Water coverage improves attacks into Earth. |
| N02-B | Hearthmoth / Ash Courier | M02, M16, M20, M21 | Use Fray and slower opposing Speed to create a later attacking opportunity. |
| N03-A | Ribbonrook / Road Scout | M03, M14, M13, M24 | Act first at normal priority and remove disruption; Fire coverage helps against Dark. |
| N03-B | Ribbonrook / Tailwind Vow | M03, M14, M13, M22 | Trade a preparation action for stronger attacks; retain two finishing types. |
| N04-A | Chimekite / High Chime | M04, M18, M22, M24 | Create a Spirit attacking window while retaining an answer to opposing boosts and statuses. |
| N04-B | Chimekite / Crosscurrent | M04, M18, M20, M21 | Pressure switches and slow faster threats; Light coverage helps against Dark. |
| N05-A | Cairnox / Stone Shelter | M05, M13, M20, M23 | Use finite bracing to buy time for Fray and core damage; Fire coverage helps against Dark. |
| N05-B | Cairnox / Patient Bell | M05, M14, M21, M24 | Slow moderate-speed opponents, clear disruption, and use Air coverage against Water. |
| N06-A | Rootwrit / Binding Script | M06, M18, M21, M24 | Change later move order and remove disruption; Light coverage helps against Dark. |
| N06-B | Rootwrit / Holding Ground | M06, M05, M20, M23 | Brace while applying pressure; choose Force against opponents whose Guard is sufficiently lower than Ward. |
| N07-A | Rillhorn / Ford Runner | M07, M13, M21, M24 | Control later Speed and attack through the more useful type; Fire coverage helps against Air. |
| N07-B | Rillhorn / Rising Horn | M07, M14, M22, M20 | Prepare stronger attacks or punish a durable switch; Air coverage helps against Light. |
| N08-A | Wellwisp / Wellkeeper | M08, M16, M19, M24 | Take favorable exchanges, spend bounded recovery, and finish with matching-type priority. |
| N08-B | Wellwisp / Eroding Mark | M08, M15, M20, M21 | Apply pressure or change Speed; Earth coverage helps against Light. |
| N09-A | Knellbadger / Toll Collector | M09, M17, M20, M24 | Use high Guard to stay active while pressuring Health; clear status or setup threats. |
| N09-B | Knellbadger / Closed Gate | M09, M17, M21, M23 | Buy a finite defensive window and slow opponents enough to threaten an earlier knockout. |
| N10-A | Duskquill / Night Courier | M10, M15, M20, M24 | Use fast Spirit damage with cleanup; Earth coverage helps against both Fire and Light. |
| N10-B | Duskquill / Ink Oath | M10, M15, M22, M20 | Prepare an attacking window or pressure a switch; lacks immediate cleanup. |
| N11-A | Bellmane / Open Bell | M11, M12, M18, M24 | Select the damage category that deals more damage, then finish or remove disruption. |
| N11-B | Bellmane / Ringing Vow | M11, M12, M18, M22 | Prepare both damage categories and exploit whichever defense is lower. |
| N12-A | Glimmerscribe / Ward Script | M12, M16, M20, M23 | Use high Ward and finite bracing while Fray advances the battle; Water coverage helps against Earth. |
| N12-B | Glimmerscribe / Clear Script | M12, M18, M21, M24 | Slow moderate-speed threats, clear disruption, and finish with matching-type priority. |

Both sets initially have relative selection weight 1. Section 6 will define selection under team constraints; these weights do not promise equal realized frequencies after constraints are applied.

Every set includes a matching-type core attack using the species' higher base attack stat. Rootwrit's Holding Ground also offers its weaker Force category; Bellmane's two sets offer both categories. No set relies on an attack stat of 40 as its main damage source.

#### Derived set roles

Derive these tags from move records after loading content. They describe capability and can be checked by the generator; they do not grant effects. A tag alone does not establish that using its move is a good action.

| Role tag | Exact capability test | Sets with the capability |
| --- | --- | --- |
| direct | At least three damaging moves | 5 |
| mixed | Both matching-type core damage categories | 3 |
| setup | Kindled Oath / M22 | 6 |
| pressure | Ashen Ledger / M20 | 11 |
| speed_control | Weightbind / M21 | 8 |
| healing | Hearthstitch / M19 | 2 |
| brace | Lantern Brace / M23 | 4 |
| cleanup | Clearwake Rite / M24 | 12 |
| coverage | At least one off-type quick attack | 16 |
| priority_damage | At least one quick attack | 23 |

A set may carry several tags. The direct tag identifies sets with at least three attacks. Every set can deal direct damage. The mixed tag describes move access, while the stat table determines how useful the weaker category is.

Healing appears only on Hearthmoth-A and Wellwisp-A. Bracing appears only on Cairnox-A, Rootwrit-B, Knellbadger-B, and Glimmerscribe-A. Their alternative sets provide different tools; species identity alone does not imply a healing or bracing user.

The team caps recommended in approved Section 4 apply to the selected sets, not all sets a species could have received. Exact team eligibility and role requirements belong in Section 6.

### 5.6 Category choices and knockout-threshold checks

Mixed attacks are useful when defense differences outweigh the attack-stat difference. For example, Bellmane against a neutral target with Guard 90 and Ward 50:

- Halo Ram: floor(65 × 85/(85+90) × 6/5) = 37 damage.
- Dawn Weave: floor(65 × 80/(80+50) × 6/5) = 48 damage.

Bellmane's lower Spirit therefore gives the better attack in that position. This is a category choice; typing remains the same.

Small stat changes can change the number of attacks required. Against defense 80, a neutral matching-type core attack deals 39 at attack 80 and 40 at attack 85. Against 120 Health, that crosses from four hits to three. Check actual thresholds whenever stats, power, healing, or boosts change.

Initial arithmetic checks used all 12 attackers against all 12 roster targets, selecting each attacker's higher-stat matching-type core. Each matchup group contains 48 attacker-target pairs, including same-species pairs.

| Matchup | Normal damage range | Hits from full Health |
| --- | --- | --- |
| Favorable | 55–71 | 2–3 |
| Neutral | 36–48 | 3–4 |
| Resisted | 25–32 | 4–6 |

These are isolated repeated-hit calculations with no criticals, boosts, healing, statuses, switching, or retaliatory attacks. They establish starting damage thresholds, not match length or win rates.

Checking every assigned damaging move against every roster target gives 636 single-hit cases, counting repeated move assignments across sets. Maximum unboosted normal damage is 71; maximum unboosted critical damage is 89. None knocks out a full-Health roster target in one hit. Kindled Oath, prior damage, and Fray can change knockout thresholds during a battle.

### 5.7 Structured content schemas

A species record defines shared content. A set record assigns four moves. A battle instance is one copy of a species occupying one player's team slot.

| Monster field | Required definition |
| --- | --- |
| id | Stable unique string, N01–N12. |
| name | Display name. |
| type | Exactly one of fire, air, earth, water, dark, light. |
| stats | Object containing integer max_health, force, guard, spirit, ward, speed. |
| origin_tag | Descriptive origin; folklore in this roster. Has no battle effect. |
| concept | Short creature description. |
| design_tags | Descriptive archetypes for authoring; do not substitute for derived set capabilities. |
| set_ids | Exactly two existing set IDs whose monster_id matches this species. |
| eligible_for_v1 | Boolean; true for all 12 starting monsters. |
| selection_weight | Positive integer; initial value 1 for each species, interpreted by Section 6's generator. |

Compute budget B from the authoritative stats. Optional presentation metadata may later reference art without changing combat behavior.

| Set field | Required definition |
| --- | --- |
| id | Stable unique string, such as N01-A. |
| monster_id | Existing species ID. |
| name | Display name of the authored set. |
| move_ids | Ordered list of four distinct authored move IDs; order controls presentation only. |
| selection_weight | Positive integer; initial value 1. |
| role_tags | Derived capability tags from the tests in Section 5.5. Recompute and validate when moves change. |

Example species entry, shown as structured data:

~~~json
{
  "id": "N01",
  "name": "Coalspindle",
  "type": "fire",
  "stats": {
    "max_health": 110,
    "force": 100,
    "guard": 70,
    "spirit": 40,
    "ward": 60,
    "speed": 90
  },
  "origin_tag": "folklore",
  "concept": "A soot-and-wicker creature born from the ritual of banking a hearth before sleep.",
  "design_tags": ["fast_attacker", "force_attacker"],
  "set_ids": ["N01-A", "N01-B"],
  "eligible_for_v1": true,
  "selection_weight": 1
}
~~~

Example authored set:

~~~json
{
  "id": "N01-A",
  "monster_id": "N01",
  "name": "Ember Pursuit",
  "move_ids": ["M01", "M13", "M14", "M24"],
  "selection_weight": 1,
  "role_tags": ["direct", "cleanup", "coverage", "priority_damage"]
}
~~~

Keep content records unchanged during battles. Each team-slot instance has its own current Health, remaining move uses, persistent statuses, temporary effects, and chosen fallback ID. Identify the instance by player and slot, not species ID: opposing teams may both contain Coalspindle.

Store monster_id, set_id, and content version with generated teams and match records. All records in one battle use the same content version. Section 6 will define reproducible selection and starting-state capture.

There are no V1 ability/item records attached to these species or sets. Future origin tags, art, abilities, and items can extend the content schema through versioned rules without requiring new species-specific engine code.

### 5.8 Authoring validation and strength calibration

Reject an invalid V1 content bundle before generating teams. Validate:

- Unique species, set, move, and status IDs within their namespaces; valid cross-references.
- Exactly 12 eligible species, two per type, and exactly two sets per species.
- Integer stats within Section 3's ranges; allocation budget 325–335.
- Four distinct authored moves per set; at least two damaging moves.
- At least one matching-type core attack using the higher base attack stat; either category qualifies on an exact Force/Spirit tie.
- Every core attack matches the species' type; at most one off-type attack, which must be a quick attack.
- No Hearthstitch/Brace combination in a set; capability tags agree with assigned moves.
- Fallback category derives from base Force/Spirit as approved; F01/F02 never count among the known four moves.
- Species and set weights are positive integers; no set-specific stat overrides.

The allocation budget is the first filter. Later bot and human evidence will calibrate actual strength. Diagnose by monster-set entry first: an overperforming set may need different utility or coverage without weakening that species' other set.

Initial tuning order is set access, small stat changes, then shared move values when a problem appears across several users. Recheck damage thresholds after each change. Adjust generation constraints when a problem depends on several otherwise reasonable sets appearing together.

Use fixed, published content stats for every match. If a tested improvement needs a revised budget range or stat range, record that change in a new content revision. Selection weights control variety; lowering a strong set's frequency does not correct its strength when it appears.

Section 6 specifies final eligibility constraints and the independent-team algorithm. Section 7 defines balance targets, sampling, bots, and human tests.

## 6. Independent random-team generation and mulligans

Status: Approved as the initial playtest design. Constraints, thresholds, and audit targets remain initial tuning choices. Section 5's roster, stats, and sets remain tentative starting content.

### 6.1 Generation contract and fairness limits

Generate opposing teams independently under one shared profile. Neither player's draw reads the opposing offer, final team, redraw decision, lead, skill estimate, or prior result. Cross-team duplicates and identical teams are allowed.

Each player receives four distinct species and one complete authored set per species. Use the fixed stats from the selected content version. Players inspect their own offer and either keep it or make one blind full-team redraw.

The initial system aims for equal opportunity and usable tools. Independence cannot guarantee equal winning chances for every pairing. Type coverage and utility safeguards reduce severe gaps; bots and humans must measure the remaining matchup influence.

The generator uses the same sampling method for both players. It does not adjust a team in response to its opponent or apply a hidden per-match strength multiplier.

### 6.2 Exact eligibility constraints

Apply every rule below to the selected four species/set pairs.

| Rule | Initial requirement | Purpose |
| --- | --- | --- |
| Team size | Exactly 4 | Approved battle format. |
| Species duplicates | None within a team | Four distinct choices and plans. |
| Type diversity | At least 3 distinct types; at most 2 monsters of one type | Avoid a whole team sharing the same narrow type coverage. |
| Authored sets | One valid Section 5 set per selected species | Prevent unusable random move combinations. |
| Force coverage | At least 1 credible matching-type Force core user | Attack Guard when Ward is stronger. |
| Spirit coverage | At least 1 credible matching-type Spirit core user | Attack Ward when Guard is stronger. |
| Cleanup | At least 1 Clearwake Rite user | Guarantee a direct answer to statuses and temporary stat boosts. |
| Healing | At most 1 Hearthstitch user | Bound repeated recovery across the team. |
| Bracing | At most 1 Lantern Brace user | Bound repeated defensive windows across the team. |
| Speed plan | At least 1 monster with base Speed at least 85, Weightbind, or Kindled Oath | Supply a route to changing or winning move order alongside priority attacks. |

Count a monster once for each capability it possesses. A set with both credible core categories counts toward both category requirements.

Credible category coverage means the set knows that matching-type core category and its corresponding base attack is at least 4/5 of the species' higher attack stat:

$$
5A_{\mathrm{category}} \geq 4\max(Force,Spirit).
$$

Use integer multiplication for this test. Rootwrit-B's Force 65 qualifies against Spirit 80; both Bellmane sets qualify in both categories. A weak off-type finisher does not satisfy the core-category requirement.

Three distinct types guarantee that no target type resists all the starting team's matching-type core attacks: each defensive chart column resists only two attacking types. That property supplies attack coverage; it does not guarantee safe switches or favorable battle states.

Healing and bracing are optional. Aggressive, controlled, and durable teams can all pass. No additional cap on Fray, setup users, or fast monsters is imposed initially. Review those patterns through match evidence before adding constraints.

#### Capability metadata

Keep sampling rules driven by content roles. Core attacks M01–M12 carry core_damage; quick attacks M13–M18 carry priority_damage. The utilities carry healing, pressure, speed_control, setup, brace, and cleanup respectively.

For each selected set, derive its type, credible core categories, role flags, and Speed-plan flag from the move records and species stats. Do not use display names in battle or generation logic. Recompute these values when content changes.

The Speed-plan requirement is already implied by the other caps for this particular roster, but is explicitly checked so later set revisions retain that safeguard.

### 6.3 Build a finite eligible catalogue

Build the catalogue once when a content/profile version loads. Enumeration means listing every possible assignment and checking it.

1. Run Section 5's content validation. In the initial uniform profile, all species and set selection_weight fields must equal 1.
2. Sort eligible species by their ASCII IDs. Enumerate every unordered choice of four distinct species.
3. For each species group, enumerate the choices of one eligible authored set per member.
4. Evaluate every eligibility predicate from Section 6.2. Keep only assignments that pass all of them.
5. Sort the four set IDs within each retained assignment. Join them with a plus sign to form its TeamKey, such as N01-A+N04-B+N08-A+N11-B.
6. Sort retained entries by ASCII TeamKey. Check that keys are unique. Store the member IDs and derived capabilities with each entry.
7. Audit species/set incidence and possible redraws before allowing match setup.

IDs used in TeamKeys contain uppercase ASCII letters, digits, and hyphens, and exclude the plus delimiter. TeamKey identifies the species/set assignment; slot order does not create a different team.

The current roster has:

$$
\binom{12}{4}\times2^4=495\times16=7{,}920
$$

candidate assignments. Applying the proposed constraints leaves 6,109 eligible assignments across 470 distinct species groups.

These counts come from exhaustive content enumeration, not match simulations. A valid assignment has not thereby been shown to win about half its matches.

Set the initial enumeration limit to 100,000 candidate assignments. If a content/profile version exceeds that limit, reject that generator profile at startup and revise its sampling method explicitly. This keeps later roster expansion from silently creating an expensive startup operation.

A catalogue must contain at least two entries, include every eligible species and authored set somewhere, and give every first offer at least one legal redraw. Failure is a content/profile error: refuse match setup and report the failed audit. Never silently drop constraints or substitute an invalid team.

Fewer than 1,000 eligible entries triggers a variety review. It is an audit alert, not an automatic weakening of the rules.

### 6.4 Sample an offer and assign slots

For a first offer:

1. Let N be the eligible catalogue size.
2. Draw one uniform integer from 0 through N−1 using that player's offer-0 team stream.
3. Select that catalogue entry. Monsters and sets are already assigned together.
4. Start from its four members in set-ID order. Shuffle them uniformly into slots 0–3 using the separate offer-0 order stream.
5. Resolve each member's species stats, type, four moves, full use counts, and fallback category. Start at maximum Health with no effects.
6. Show only the owning player their complete offer.

For the shuffle, process positions i = 3, 2, 1. At each position, draw j uniformly from 0 through i and swap members i and j. This gives all 24 slot orders the same chance. Slot order helps prevent presentation position from favoring one species; it does not select the lead.

Every initial eligible assignment has probability 1/6,109. Every ordered first-offer layout has probability 1/146,616.

The V1 profile uses uniform catalogue sampling. The schema's weight fields remain 1; a later weighted mode can change offer variety within the generator module. Its probability rules must be specified before nonuniform weights are enabled. A frequency change does not correct an overpowered set's strength when drawn.

An example eligible team is Coalspindle-A, Chimekite-B, Wellwisp-A, and Bellmane-B: four types, both credible categories, cleanup, one healer, no bracer, and several Speed plans. It receives no special selection preference.

### 6.5 Blind redraw policy

Keep the approved one-redraw, mandatory-replacement policy. Add an initial guarantee that at least two species change.

When a player commits REDRAW:

1. Record that player's first-offer species set.
2. Filter the eligible catalogue to assignments sharing at most two species with that offer.
3. Preserve the catalogue's TeamKey order within this filtered list.
4. Draw uniformly from that list using the player's offer-1 team stream.
5. Shuffle slots using the offer-1 order stream and initialize the entire replacement team afresh.
6. Replace the first offer automatically. The player cannot return to it or redraw again.

The whole team is replaced, including movesets for returning species. Zero, one, or two species may return. A specific unwanted monster can therefore reappear; the replacement is not guaranteed stronger.

Every current first offer has 5,614–5,864 permissible redraw assignments. Check this property again after any content/profile change.

The redraw is conditioned only on its owner's discarded species. It never consults the opponent. The filtered pool size can differ between first offers, so redraw offers have a different distribution from raw first offers; player preferences further change the distribution of retained teams.

Show the owning player the four species, stats, and complete moves before KEEP/REDRAW. Explain: one full-team redraw, at least two new species, replacement final. Neither opponent information nor a preview of the replacement is available before commitment.

Both private commitments must complete before final teams are revealed and leads are chosen, following Section 2. A player's redraw must not advance the opponent's offer stream or either battle stream.

### 6.6 Strength calibration and keeping decisions relevant

No levels or individual stat rolls are used. Approved species stats remain fixed within a content version, and the two sets of a species share those stats.

The weighted allocation budget is a starting authoring tool. Actual calibration happens through:

| Observed problem | Initial tuning response |
| --- | --- |
| One set repeatedly dominates while its sibling is reasonable | Change that set's utility or coverage access. |
| Both sets of a species overperform across many opponents | Adjust its stats; recheck all knockout thresholds and catalogue membership. |
| Several users of a shared move overperform | Adjust that move's power, resource limit, duration, or magnitude. |
| A combination of otherwise reasonable sets causes a recurring problem | Add or revise a global composition constraint and audit the resulting offer frequencies. |
| Only a particular matchup is highly unfavorable | Review coverage, type relationships, and available counterplay; measure repeated paired games. |

Apply revisions to all future matches using the new version. Finish and replay existing matches using their original snapshot. A change must not depend on the particular opponent a player has drawn.

Useful starting tools are guaranteed damage in both categories, three-type coverage, bounded defenses, one cleanup answer, weak priority finishers, and full final-team information. Players can then make lead, switching, resource, and timing decisions with visible consequences.

A mulligan supplies limited agency and can reward recognizing a team plan. It is not sufficient evidence of fair first offers. Track discarded teams and players' reasons, as well as retained teams and their results.

For human tests, include rematches with the same final teams swapped between players, using a fresh battle seed and no new draw. Those are controlled playtest fixtures. They help distinguish player decisions from assignment advantage. Section 7 will define the sampling and interpretation.

### 6.7 Reproducible random draws

A seed is a saved starting value that reproduces random results. A stream is a separately named sequence: drawing from one stream leaves the others unchanged.

Use RNG algorithm ID hmac-sha256-counter-u32-v1. This is the game's versioned draw convention built on the standard HMAC-SHA256 primitive. HMAC is a keyed hash function: it turns a key and message into a deterministic digest. Use a standard library implementation of the primitive; verify it against [RFC 4231's test vectors](https://www.rfc-editor.org/rfc/rfc4231). The HMAC definition is in [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104). The wrapper below is our game rule, not a recipe prescribed by those RFCs.

The authoritative match process creates a fresh 256-bit master seed using its platform's cryptographic random source. Store it as 64 lowercase hexadecimal characters; decode it to the original 32 bytes before use. Keep it private during the match. Offline simulations may supply a fixed seed explicitly.

| Stream labels | Draw purpose |
| --- | --- |
| team:p0:offer0, team:p1:offer0 | Initial assignment index |
| team:p0:offer1, team:p1:offer1 | Conditional redraw index |
| order:p0:offer0, order:p1:offer0 | Initial slot shuffle |
| order:p0:offer1, order:p1:offer1 | Redraw slot shuffle |
| battle:tie | Exact priority/Speed ties |
| battle:critical | Executed direct-damage critical checks |
| bot:p0, bot:p1 | Reserved for simulation policies that make random choices |

ASCII is the fixed character encoding used here for IDs and message text. A digest is a hash function's fixed-length byte output. Derive each stream key as HMAC-SHA256(master_seed_bytes, ASCII("mb-rng-v1|" + stream_label)). Keep the complete 32-byte result as that stream's key.

Each stream has a counter starting at zero. For each candidate random word:

1. Compute HMAC-SHA256(stream_key, ASCII("draw|" + decimal_counter)). Decimal has no leading zeros; all messages have no trailing newline or terminating zero byte.
2. Read the first four digest bytes as an unsigned 32-bit integer u, most significant byte first. Discard the remaining bytes.
3. Advance that stream's counter by one, including when a word is rejected below.

Hash counters range from 0 through 2^32−1. After the last word, the next-counter value is 2^32 and any further draw is an engine error. An accepted last word remains valid. An engine error is recorded separately from competitive outcomes.

To draw UniformInt(n), where 1 ≤ n ≤ 2^32:

$$
L=n\left\lfloor\frac{2^{32}}{n}\right\rfloor.
$$

Reject u ≥ L and draw the next word from the same stream. Otherwise return u modulo n, the remainder after division by n. This rejection step avoids giving some values extra chances when n does not divide 2^32.

For example, n = 36 accepts u < 4,294,967,292, leaving exactly the same number of accepted words for each critical-check result. Only result 0 is a critical. For a tie, draw n = 2: result 0 orders player p0 first; result 1 orders player p1 first.

Call each stream only for its declared event. Canceled attacks, utilities, unequal move orders, lead choices, and deterministic replacements consume no battle draw. Battle resolution uses the draw timing already approved in Sections 2–3.

#### Reference fixture for later implementation

This fixture fixes the current catalogue and draw convention. It is diagnostic data, not a match simulation.

Master seed: 000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f.

Hash the sorted catalogue keys as ASCII joined by newline characters with no trailing newline, using SHA256. The expected digest is 751e069bf4a158725ce6d9b403296764f314ac0e5fe438959d3af71972832bc2.

Indices below are zero-based. Every listed team draw accepts counter 0.

| Event | Pool size | Index | Expected TeamKey |
| --- | --- | --- | --- |
| p0 first offer | 6,109 | 5,675 | N05-B+N08-B+N09-B+N11-A |
| p1 first offer | 6,109 | 5,297 | N04-B+N07-B+N09-A+N12-B |
| p0 redraw | 5,708 | 968 | N01-A+N07-A+N08-A+N10-A |
| p1 redraw | 5,693 | 812 | N01-A+N05-B+N07-A+N10-B |

The p0 offer-0 shuffle draws j = 3, 2, 1 and leaves its canonical order unchanged. The p1 offer-0 shuffle draws j = 3, 1, 0 and yields slot order N09-A, N04-B, N07-B, N12-B.

At counter 0, battle:tie produces u = 3,938,245,556 and result 0; battle:critical produces u = 1,687,204,336 and result 4. Those streams remain untouched by all four offer draws and slot shuffles.

A content revision may change catalogue keys or counts. Give its snapshot a new content version and update its catalogue fixture; preserve this fixture for replaying the original version.

### 6.8 Baseline frequencies and audit targets

Uniform eligible-team sampling creates unequal species and set incidence because capabilities affect how many teams pass the constraints.

The exact current first-offer appearance probabilities are:

| Species | Chance of appearing in a first offer | Set A share, conditional on that species appearing |
| --- | --- | --- |
| N01 / Coalspindle | 35.41% | 52.61% |
| N02 / Hearthmoth | 32.51% | 48.89% |
| N03 / Ribbonrook | 35.34% | 52.62% |
| N04 / Chimekite | 34.62% | 52.62% |
| N05 / Cairnox | 31.22% | 38.02% |
| N06 / Rootwrit | 30.84% | 60.51% |
| N07 / Rillhorn | 35.41% | 52.61% |
| N08 / Wellwisp | 32.51% | 48.89% |
| N09 / Knellbadger | 30.94% | 62.12% |
| N10 / Duskquill | 34.74% | 52.64% |
| N11 / Bellmane | 36.24% | 52.48% |
| N12 / Glimmerscribe | 30.23% | 37.14% |

Set B takes the remaining conditional share. These are catalogue-derived probabilities before human mulligans, not observed usage or win rates.

| Audit | Initial target or action |
| --- | --- |
| Invalid assigned teams | Zero |
| Missing eligible species or authored sets | Zero; refuse a broken content/profile version |
| First offer with no redraw options | Zero |
| Species first-offer incidence | 25–40% each; review outliers |
| Either authored set's conditional incidence | 35–65% for its species; review outliers |
| First offers reported to have no workable plan | Below 10%, as approved in Section 1 |
| Large matchup advantages | Initial goal: fewer than 5% of sampled pairs have an estimated favored-team score of at least 75%, after follow-up probes |
| Replay mismatch | Zero when content/rules versions, seed, and committed actions agree |

Frequency targets flag variety concerns; they do not certify balance. Review content and constraints before changing sampling weights.

For the initial matchup screen, sample 1,000 independent team pairs from the first-offer distribution. A bot policy is its rule for choosing leads and actions. Use the same policy on both sides for 32 games per pair, 16 in each player orientation, with fresh battle seeds. Score wins as 1, draws as 1/2, and losses as 0 for a fixed team; p is its total score divided by games played, and favored score is max(p, 1−p).

Report simultaneous-knockout draws and turn-cap draws separately. Every cap draw receives a stall review; a score near 50% does not excuse repeated draws. Section 7 will set the draw-rate targets.

Pairs with screening favored score at least 65% receive a fresh 128-game follow-up probe, 64 per orientation; use that fresh batch for the confirmation estimate. Also follow up a random 10% of unflagged pairs to check missed advantages. Bots receive the same observable battle information as humans, excluding seeds, future draws, and opposing pending actions. This is a provisional screen: sampling noise and bot weaknesses can create or conceal apparent advantages. Report confirmed flags and the unflagged audit separately; Section 7 will define uncertainty and the estimate of how often large advantages occur. The matchup target guides global tuning and never gates a particular pair's draw.

Audit raw first offers separately from redraw offers and retained teams. A useful redraw does not excuse a poor first-offer pool.

### 6.9 Match records and provider interface

A rules version identifies battle behavior; a content version identifies the immutable stats, moves, types, statuses, and generator profile snapshot. Replay requires the original versions.

The generator returns a team assignment: content version, generator profile ID, offer index, canonical TeamKey, and four ordered members. Each member supplies slot_index, monster_id, and set_id. The authoritative match process resolves these IDs into full battle instances using that content snapshot.

The battle engine operates on resolved instances. It receives the same form whether a team came from this generator, a controlled test fixture, or a future team builder. Generation eligibility remains a separate policy layer.

Record privately:

| Record | Required data |
| --- | --- |
| Reproduction identity | Match ID, rules version, content version/snapshot reference, generator profile ID, RNG algorithm ID, catalogue hash, master seed |
| Offers | Player, offer index, TeamKey, ordered species/set IDs, relevant selection and shuffle draw counters/results |
| Commitments | KEEP/REDRAW, timestamp, final assignment, secret lead choice once submitted |
| Generation diagnostics | Candidate/eligible counts, predicate failure counts, species/set incidence, redraw option counts |
| Battle trace | Committed actions, draw stream/counter/bound/result, resolved effects, actual Health changes, knockouts, and final outcome |
| Human feedback | First-offer rating, redraw reason when used, final-team rating, and post-match answers |

Player-visible offers contain only the owner's team before reveal. Seeds, future draws, opposing commitments, and discarded offers are absent from those payloads during the match.

Log each consumed random word's stream, counter, u, draw bound, and rejection flag, plus the result when accepted. UI ordering, network submission timing, and one player's redraw must not affect unrelated streams.

### 6.10 Generator profile as structured data

The initial profile can be stored as the following record. Capability predicates and catalogue construction use the shared definitions above.

~~~json
{
  "id": "v1-independent-4",
  "sampling_mode": "uniform_eligible_catalog",
  "team_size": 4,
  "min_unique_types": 3,
  "max_monsters_per_type": 2,
  "min_category_users": {"force": 1, "spirit": 1},
  "credible_attack_ratio": {"numerator": 4, "denominator": 5},
  "min_role_users": {"cleanup": 1},
  "max_role_users": {"healing": 1, "brace": 1},
  "require_speed_plan": true,
  "fast_speed_threshold": 85,
  "redraw_limit": 1,
  "redraw_min_new_species": 2,
  "candidate_enumeration_limit": 100000,
  "minimum_catalog_entries": 2,
  "catalog_variety_alert_below": 1000,
  "rng_algorithm": "hmac-sha256-counter-u32-v1"
}
~~~

Changing these values creates a new generator profile/content version and rebuilds the catalogue. Increasing roster size or introducing weighted sampling changes the provider; it does not alter action resolution.

## 7. Balance framework, simulation, human tests, and MVP readiness

Status: Approved as the initial playtest design. All sample sizes, review bands, and acceptance thresholds remain initial values. No bot matches or human playtests have been run; the Section 6 catalogue counts are enumeration results.

### 7.1 What remains before a playable MVP

All eight design sections are approved. Section 7 defines the evidence to collect; Section 8 addresses the risks, unresolved implementation choices, and future hooks. The design phase is complete; the remaining MVP work is implementation and testing.

A first playable MVP is a small, reliable private online battle that can produce useful playtest records. A successful V1 evaluation comes later: it requires evidence that the decisions are enjoyable and the assignments reasonably fair.

| Remaining implementation work | Minimum result |
| --- | --- |
| Structured content and rules engine | Load the approved records; generate offers; resolve every action, effect, replacement, and result through one shared engine. |
| Automated harness and replays | Run scripted situations and seeded bot matches without a UI; reproduce saved matches; summarize failures and outcomes. |
| Private two-player interface | Join a private match, inspect and redraw teams, commit secret leads/actions, switch, inspect effects/resources, and see a readable result and battle log. Placeholder art is sufficient. |
| End-to-end verification | Check two-player secrecy, reconnect behavior, complete matches, and usable records. |

Initial first-playable acceptance gate:

- All 20 rule scenarios below pass, along with the Section 6 catalogue, redraw, and reference-random-draw checks.
- Complete 1,000 seeded smoke matches: 400 R/R, 300 R/S with 150 in each orientation, and 300 S/S. A smoke match checks basic operation. Require zero exceptions, illegal states, invalid assignments, or replay mismatches. These simple policies do not establish balance.
- Complete five ordinary human matches with at least two people. Include KEEP/KEEP, a redraw by each player separately, and REDRAW/REDRAW across the sample. Review switching, effects, replacement, and final-result flows across the matches and curated fixtures.
- Check two controlled interruptions: before both choices commit, and after both commit. Follow Section 2's pause/resume behavior; pending choices remain private and no committed resolution is lost.

Do not require the larger balance campaign or polished art before these first matches. Errors that change legal choices, reveal a secret commitment, or prevent completion block wider testing.

| Scenario ID | Required rule check |
| --- | --- |
| C01 | Ordinary equal-priority moves execute in captured Speed order. |
| C02 | Higher priority beats higher Speed; exact ties use the recorded tie draw. |
| C03 | A voluntary switch precedes a +1 attack; that attack hits the incoming monster. |
| C04 | Two switches resolve together; neither incoming monster also attacks. |
| C05 | A Speed change does not reorder already queued moves. |
| C06 | An earlier defense change affects a later attack's damage. |
| C07 | A knocked-out queued actor spends no use and makes no critical draw. |
| C08 | An executed ineffective utility move still spends its use. |
| C09 | A direct knockout of the last opponent ends resolution before scheduled Fray. |
| C10 | Simultaneous final Fray knockouts produce a draw. |
| C11 | Single and double replacement gates grant no extra turn or attack; sole replacements stay hidden until the gate closes. |
| C12 | Switching retains Health, uses, and statuses; clears temporary benefits; bench status counters pause. |
| C13 | Fray ticks on application, lasts three active end phases, and refreshes without stacking. |
| C14 | Tethered affects later ordering, lasts four active end phases, and coexists with Fray. |
| C15 | Kindled Oath and Lantern Brace have their exact modifier, reduction, and expiry timings. |
| C16 | Clearwake Rite removes only its specified effects and preserves opposing Fray, Tethered, and R. |
| C17 | Hearthstitch rounds its heal down and clamps Health to maximum; it cannot revive. |
| C18 | Bare Resolve appears only after all known damaging uses are exhausted, even if utilities remain. |
| C19 | Formula examples, matching/type modifiers, critical damage, and rounding match Section 3 exactly. |
| C20 | Turn 60 still checks combat victory before a cap draw; submission arrival order cannot change identical committed choices and seeds. |

These are interaction checks, not twenty copies of individual move definitions. Keep them as saved input states, choices, seeds, and expected results.

### 7.2 Metrics and what they mean

A team score is 1 for a win, 1/2 for a combat draw, and 0 for a loss. Report wins, simultaneous-knockout draws, cap draws, resignations, interruptions, and engine errors separately. Competitive balance samples exclude interrupted/error sessions and controlled debugging resignations.

A containing-team score measures the performance of teams assigned a species, set, or type. It is not that monster's personal duel win rate. Teammates and matchups influence it. Count a type once per team even when two members share it; if both opposing teams contain a species, both team records contribute.

| Metric | Exact measurement | Initial target or review trigger |
| --- | --- | --- |
| Species and set performance | Mean containing-team score, using retained teams; analyze each set before its species aggregate | Review outside 45–55%; prioritize outside 40–60% when supported by enough independent fixtures. |
| Type performance | Mean containing-team score for each type | Review outside 45–55%; inspect composition and sets before changing the chart. |
| Assignment incidence | First-offer appearances divided by team offers; conditional set incidence among offers containing its species | Section 6 targets: species 25–40%, either set 35–65%. Retained-team incidence is separate. |
| Deployment and lead choice | Ever deployed, or chosen as lead, divided by matches where that retained member was available | Descriptive; there is no player-selected team pick rate in this format. |
| Mulligans | Redraw decisions divided by ordinary first offers, with reasons and discarded/final-team IDs | Descriptive; investigate any species/set associated with “no workable plan.” |
| Move use | Choices divided by decision gates where that action was legal; also record executions, canceled choices, and uses spent | Review utility selection below 5% or above 50% after 200 legal opportunities under T or humans; niche tools need contextual review. |
| Health contribution | Actual direct/periodic Health removed, healing restored, and knockout credit by source | Descriptive; exclude overkill and healing beyond maximum Health. |
| Human match duration | Initial offer to result; separate review, choice, and resolution time | Median 5–10 minutes; report raw and pause-excluded time for interrupted sessions separately. |
| Battle length | Completed normal turns, by outcome and policy | Typical 20–30 turns; inspect the full distribution, especially cap draws. Bot wall time measures compute cost, not human pace. |
| Draws | Combat draws divided by completed competitive matches, separated by cause | Aim below 5% total and below 1% cap draws; every cap draw receives review. |
| Comeback rate | Wins by the first side to trail uniquely in living-monster count by turn 10, while still having at least two living monsters | Review outside 20–40% in equal-policy or similarly skilled matches. Count a match once; report eligible matches and draws. |
| Seat advantage | Mean p0 team score with assignments and policies balanced across seats | Aim 48–52%; inspect uncertainty before attributing bias to the engine. |
| First-action advantage | Team score of the side executing the match's first damaging action; also record priority and Speed | Descriptive, not a 50% requirement: acting first is a purchased stat/move benefit. Submission arrival order must confer zero advantage. |
| Severe assignment advantage | Estimated fraction of independent pairs where one team scores at least 75% under T/T, averaging both orientations | Section 6 goal below 5%; use the follow-up procedure below. |
| Critical impact | Critical frequency and cases where a critical changes an immediate knockout threshold | Expect 1/36 per executed damaging action; compare observed counts with sample uncertainty. |

For the comeback metric, inspect stable states after end-of-turn cleanup, before new choices. A tied living count does not create an eligible trail; skip an already decided result. This measures recovery from a surviving disadvantage, not victories after a final simultaneous knockout.

Do not rank strength from tiny samples. Before making a strength claim, collect at least 400 containing-team records drawn from at least 200 independently sampled pair fixtures. Still report smaller samples as observations.

Matches sharing a team-pair fixture are correlated: they reuse the same composition. Estimate uncertainty by resampling whole fixtures, not individual monsters or games. For the main simulation report, draw the same number of fixtures with replacement 2,000 times, retain all games inside each sampled fixture, recompute the metric, and report the 2.5th and 97.5th percentiles. This gives an approximate 95% uncertainty band. A band overlapping a target boundary calls for more evidence, not an automatic nerf.

Keep content versions, bot-policy versions, and test modes separate. Do not pool selectively followed-up difficult pairs into ordinary per-species win rates.

### 7.3 Three small bot policies

All policies receive only legal actions and player-visible state. They cannot inspect pending opposing commitments, the match seed, or future random draws. The harness uses the same action resolver as human matches.

Use stable action keys: move:<move_id> for moves, including fallback, and switch:<slot_index> for switches, with slot indices 0–3. Compare these strings in ASCII order to resolve an otherwise exact policy tie; legal-action lists use this ordering before random sampling. Lead and replacement keys are their decimal slot indices. Each random policy uses its own Section 6 bot stream.

| Policy | Action rule | Purpose |
| --- | --- | --- |
| R: legal random | Uniformly choose among legal moves and switches; uniformly choose legal leads/replacements | Exercise varied legal paths; deliberately weak. |
| S: strike | Choose the available damaging action with greatest noncritical actual Health removal against the current opponent. Ties: higher priority, more remaining uses, then stable key. Never voluntarily switch or use utility. | Cheap attack baseline and smoke testing. |
| T: tactical forecast | Evaluate all current own/opposing legal-action pairs through a four-turn forecast; choose the action with the best score defined below | Initial balance screen that can consider switching, setup, statuses, and cleanup. |

Fallback is available to these policies only under the normal resource rule. It does not compete with unexhausted known attacks.

S and T use the same simple lead/replacement helper. For candidate m and each relevant opposing monster t, let D(m,t) be the largest computed noncritical damage from an available attack, using the current state; here use computed damage rather than clamping to current Health. Score the candidate by:

candidate score = mean over t of [floor(100 × D(m,t) / maximum Health(t)) − floor(100 × D(t,m) / maximum Health(m))] + floor(10 × current Health(m) / maximum Health(m)).

Use the visible opposing active monster as the target if it is alive. For simultaneous leads or simultaneous replacements, use all opposing living monsters instead; pending choices remain secret. Compare averages as exact fractions and break ties by slot index. This helper considers offensive exchange and remaining Health without claiming to find the optimal lead.

T's forecast is precisely bounded:

1. For every legal first-action pair (a,b), clone the observed state and resolve one turn.
2. Continue for three more normal turns, with both sides using S and its replacement helper. Stop a branch if a result occurs. Required replacements do not consume forecast turns.
3. Assume no criticals in forecasts. At every exact Speed tie, evaluate both orders and average their values with equal weight. Forecasts never consume live match randomness.
4. A terminal win has value +10,000, loss −10,000, and draw 0 from T's perspective. Otherwise use: 1,000 × (own living count − opposing living count) + sum of floor(100 × Health/max Health) over own members − that sum over opposing members.
5. For each a, calculate u(a,b), the expected final value across tie branches. Score a as [mean over all legal b of u(a,b) + minimum over b of u(a,b)] / 2. Choose the highest score, then the stable key.

The mean term avoids planning only against the worst imaginable response; the minimum term discourages obvious traps. These are bot tuning choices, not new battle rules.

Each side has at most seven normal actions: four moves and three switches. At most 49 first-action pairs and four rounds of binary tie branches require at most 1,470 turn resolutions per T decision. Usually far fewer are needed. Forecasts are offline state copies, so correctness comes before optimization.

T is not expert play: later turns use attacks only, it does not search entire games, and its evaluation favors preserving monsters. It can miss repeated utility plans and clever sequences. Confirm suspicious results with another policy and human replay review.

### 7.4 Simulation campaign after the first playable gate

A fixture is a saved pair of independently generated teams plus the configuration needed to repeat its games. Use raw first offers and KEEP on both sides in the main bot campaign; this tests the underlying pool. Human retained-team results measure mulligan behavior separately.

| Stage | Initial sample | Interpretation |
| --- | --- | --- |
| Correctness | Twenty scenarios, catalogue/reference checks, and 1,000 R/S smoke matches from 7.1 | First-playable gate; zero engine/replay failures. |
| Policy comparison | 1,000 pair fixtures: two seat orientations each for S/S and T/T; 250 of those pairs also receive all four S/T policy-to-team and seat arrangements | 5,000 matches total. Use T/T for primary species/set/type estimates; keep other policies separate. |
| Matchup screen | The Section 6 sample: 1,000 fresh pairs, 32 T/T games per pair, 16 per orientation | Flag favored score 65% or higher; also track draws and length. |
| Matchup confirmation | Fresh 128 games for every flagged pair and a uniform random 10% of unflagged pairs; 64 per orientation | Estimate large advantages with fresh evidence and check what the screen missed. |
| Exploit probes | Saved attack, switch, setup, status, cleanup, Brace, and exhaustion scripts against S and T | Seek reproducible progress denial and counters; successful scripts become fixtures. |

Use fresh battle seeds for all games. When a policy changes, comparisons require the same configuration or a clearly labeled new campaign.

For the unflagged audit, sample without replacement, rounding the 10% count upward. Let F be the screened flagged group, U the number unflagged, and m the audit sample size. In fresh confirmation batches, flag a pair's point estimate if either fixed team's score is at least 75%. The estimated fraction of large advantages is:

[number of such pairs in F + (U/m) × number in the unflagged audit] / 1,000.

If U is zero, omit the second term. This weighting prevents the deliberately oversampled suspicious pairs from inflating the apparent frequency. Report flagged-group and audit counts alongside the estimate.

For each confirmed batch, separately resample its 64 scores within each orientation 2,000 times and average the two orientation means. Using the fixed team's score p, classify the resulting interval:

- Entirely at or beyond 75%, or entirely at or below 25%: strong evidence of a large advantage under this policy.
- Entirely between 25% and 75%: no large advantage established by this probe.
- Crossing either boundary: unresolved; extend only that pair to 512 total fresh confirmation games, balanced by orientation. Remaining overlap stays unresolved.

The weighted point estimate is a screening result, not proof of the true population rate. Report unresolved cases and how the estimate changes if they fall on either side of the boundary. A low observed flag rate with large uncertainty does not establish the below-5% goal.

No result here filters one team's offer based on its opponent. Correct an unhealthy pool globally through content or generator-profile revisions.

### 7.5 Risk triggers and tuning order

| Risk | Evidence to inspect | First tuning levers |
| --- | --- | --- |
| Stall or infinite switching | Repeated complete battle positions; cap draws; slow windows; human stalled reports | Defensive duration/uses, status access, healing allowance, and switch incentives. A finite attack resource does not stop resource-free switching. |
| Hard counters | Fresh 75%+ assignment probes and replayed inability to make progress | Set coverage or credible category access, then type chart only if the problem is broad. |
| Snowballing | Low comeback rate, early knockout deciding ordinary games, setup remaining safe after counters exhaust | Setup duration/uses, cleanup access, speed-control access; verify player skill and matchup first. |
| Mandatory utility | Utility dominates choices across varied states; teams without it consistently suffer | Effect strength, priority, duration, uses, and roster access. |
| Unused utility | Low selection with enough genuine opportunities | Clarity and suitable sets before numerical buffs; T may miss the intended sequence. |
| Excessive randomness | Critical-dependent knockout thresholds and outcome changes in paired probes | Damage thresholds and critical multiplier before changing the user-selected 1/36 rate. |
| Seat or engine bias | p0 advantage, arrival-order differences, reference/replay failures | Fix resolution, secrecy, or sampling before touching combat balance. |
| Unequal sets | One authored set dominates while the other remains weak | Tune that set's move access before a species-wide stat change. |

For loop diagnostics, compare active slots, all Health and uses, statuses/timers, and temporary effects. Ignore turn number and RNG counters when looking for repeated positions. Flag three occurrences within twelve turns for review; this does not introduce a new automatic draw rule.

A slow-window flag covers six consecutive turns with no knockout, net combined Health loss below 10% of both teams' combined starting maximum Health, and at least eight of the twelve choices being switches, Hearthstitch, or Lantern Brace. It is a replay-review signal, not a player penalty.

A 1/36 critical rate is low per attack but not necessarily rare per match: with forty executed attacks, the chance of at least one critical is about 67.6%. Track whether criticals remove useful decisions, rather than simply whether any occur.

Run 1,000 paired T/T matches from identical initial teams and seeds: normal rules versus a diagnostic no-critical variant that still consumes every applicable critical draw. Recompute policy choices from each evolving state. If winners differ in more than 10%, review replays and knockout thresholds. This measures sensitivity to the critical rule, not proof that a single roll decided each match. The diagnostic variant never enters ordinary playtest results.

Tune in this order: verify rules and policy behavior; isolate set, species, shared move, or composition causes; change one or two related levers; assign a new content/rules/profile version as applicable; rerun affected fixtures and the main comparison sample.

Initial adjustment steps: 5 Health, 5 attack/defense, 2–5 Speed, 5 move power, 1 move use, or 1 active-phase duration. These are suggested step sizes, not mandatory increments. Recheck rounded damage, hits to knockout, and Speed ties every time. Strong sets appearing less often remain strong; selection weights address variety rather than fixing strength.

### 7.6 Human playtest plan

Assumption for the first structured pilot: twelve testers, six newcomers and six experienced battler players, arranged into six similarly skilled pairs. Availability is still open. If only two to six testers are available, start with a debugging pilot and report the limited sample plainly.

Give a rules introduction lasting at most ten minutes and one unscored practice match per pair. Then ask five rules questions: priority versus Speed; who an attack hits after a switch; what happens to Fray on the bench; what happens to temporary buffs on switching; and whether a knocked-out queued actor spends a use. Passing is at least four correct; record each misconception.

Each pair plays four recorded games:

| Game | Assignment and purpose |
| --- | --- |
| 1 | Ordinary independent offers and optional blind redraws. Observe team understanding and actual match pace. |
| 2 | Swap Game 1's retained teams between players, with a fresh battle seed and no offers/redraws. Compare decisions under reversed assignment. |
| 3 | New ordinary offers and redraws. Check learning and a different matchup. |
| 4 | Swap Game 3's retained teams with a fresh seed. Repeat the controlled comparison. |

This produces twelve ordinary matches and twelve controlled rematches, plus six practice matches. Analyze the modes separately. A swapped outcome does not alone prove team advantage: learning, luck, and familiarity also changed.

During ordinary games, observe silently where possible. Record requests for help and coaching; do not ask survey questions while the match timer runs. Note unclear move/status displays, time spent inspecting teams, repeated actions, apparent loss of agency after a knockout, switch prediction, and reactions to criticals.

Before a player commits KEEP/REDRAW, collect a brief first-offer assessment: “I can see a workable plan” yes/no and one-sentence plan. Include this time in team review; ask extended redraw reasons after the result. Record final-team assessment separately. The ordinary-match timer still runs from initial offer to result, as approved in Section 1.

After the result, each player independently provides:

- Decision interest from 1 to 5 and whether they want another match.
- Whether the match felt stalled, and the sequence responsible.
- One choice they believe mattered, a legal alternative, and the opponent response they anticipated.
- Any confusing rule, overwhelming display, or critical that felt unfair.

An observer checks that the described alternative was legal and plausibly affected position; it need not be proven winning. Both players must provide such a choice for the Section 1 useful-choice criterion.

For a stronger initial evaluation, aim for sixty ordinary matches on one stable version, with participation spread across the available group. Report tester counts as well as match counts; many games by the same two people do not establish broad appeal. Review feedback every eight to twelve ordinary matches; fix blocking faults promptly, but keep changed-version results separate.

### 7.7 V1 success, failure, and recorded evidence

Preserve Section 1's initial learning criteria:

| Question | Initial success criterion |
| --- | --- |
| Interest | At least 70% of testers rate interest 4/5 or higher and want another match. Report per-tester results; do not let frequent players count as multiple testers. |
| Understanding | At least 80% of newcomers answer four of five questions correctly after the introduction and practice. |
| Meaningful choices | In at least 75% of ordinary completed matches, both players identify a plausible impactful decision. |
| Usable first offers | Fewer than 10% of ordinary first offers are reported as having no workable plan; review every reported offer. |
| Progress | Fewer than 10% of ordinary matches are called stalled by either player; review every reproducible resource-free denial of progress. |
| Pace | Ordinary-match median 5–10 minutes, with typical battles of 20–30 turns. |

For interest, use each tester's rating and replay preference after their final ordinary game of the stable-version session. Keep individual post-game ratings for diagnosing changes. Report ordinary and controlled-match feedback separately.

Also inspect the simulation review bands from 7.2 and the assignment-advantage probe; passing a bot score target cannot compensate for boring human games. Below-target human results require another focused iteration, even if the engine is correct.

A reproducible crash, invalid choice, information leak, replay mismatch, or resource-free strategy that reliably forces cap draws is an implementation/rules failure that blocks broader testing. A small pilot missing an enjoyment target is useful negative evidence, not a precise population estimate. If uncertainty remains large, mark V1 inconclusive and gather more varied evidence rather than declaring it balanced.

The minimum analysis record joins match ID, rules/content/profile/policy versions, fixture/test mode, seat and participant IDs, offers/redraws/retained sets, turns, timestamped choice gates, submitted and executed actions, Health changes and sources, critical/tie events, final result, interruptions, and survey responses. Use participant IDs rather than real names in reports. The replay remains the source of truth; derived summaries can be rebuilt.

Still open: tester availability, whether T's forecast exposes the important strategies, and how the initial target bands fit observed play. Section 8 lists these risks and future extensions; no game implementation is authorized by approving this document.

## 8. Risks, open questions, and future extensions

Status: Approved as the initial playtest design. Sections 1–8 form the approved design baseline; balance remains to be tested. Future experiments are explicitly separate from the initial rules.

### 8.1 Freeze the first playable scope

Build the approved four-versus-four singles format with twelve species, twenty-four authored sets, the shared move catalogue, two statuses, and independent offers with one blind redraw. Preserve fixed stats, full final-team visibility, secret simultaneous commitments, and reproducible results.

The first interface needs clear text, basic monster illustrations or placeholders, and a readable battle record. Accounts, matchmaking, rankings, spectator tools, campaigns, progression, animated attacks, abilities, held items, additional types, and player-built teams are deferred. Their absence does not prevent the V1 learning goals.

Finish the Section 7 first-playable gate before expanding content. A proposed change must explain which observed problem it addresses, which records or rules change, and what evidence would count as improvement. Adding monsters to hide an unhealthy mechanic makes diagnosis harder.

### 8.2 Risk register and responses

The risks below are hypotheses. Their presence in this register does not mean an exploit has already been demonstrated.

| Risk | Why the current design is exposed | Evidence and response |
| --- | --- | --- |
| Assignment outweighs decisions | Independent generation can pair strong coverage against poor answers; a blind redraw cannot inspect that matchup | Use fresh matchup probes and swapped-team human games. Improve weak sets or global constraints. Preserve independent draws; any alternative allocation mode requires a separate design decision. |
| Resource-free switching prolongs play | Switching spends an action but no move use or Health; finite move resources alone cannot stop mutually repeated switches | Review repeated positions, slow windows, and cap draws. Seek a strategy that reliably forces stalled results against an opponent trying to win. Test a rules revision only if reproduced. |
| An early knockout snowballs | Losing a member removes coverage and reduces safe switches; priority attacks can cancel the slower actor's action | Review comeback counts and early-knockout replays. Tune setup, priority damage, or counter access when the cause is shared; do not add automatic comeback bonuses. |
| Coverage or cleanup becomes mandatory | Equal type-chart counts do not equal equal practical coverage. Fire/Air access and Clearwake availability may outperform their nominal costs | Compare coverage groups, sets, and move choices. Every V1 team already has cleanup; inspect dependence on its user and what happens after that user is knocked out. Tune access or the threat itself if one solution dominates. |
| The stat budget misprices power | Speed thresholds, rounded damage, and utility access are nonlinear; two equal-budget species can differ substantially | Treat the budget as an authoring filter. Compare set-level outcomes and knockout thresholds before revising it. |
| Defensive combinations dominate | Lantern Brace, Fray, healing, and switching may create stronger sequences than isolated move calculations suggest | Run scripted sequences against S/T and human opponents. Adjust duration, uses, or access before adding new counters to the roster. |
| Randomness feels decisive | A modest critical can still cross a knockout threshold and cancel an action; exact Speed ties add another source | Inspect critical-sensitive replays and the paired diagnostic study. Keep the approved 1/36 chance initially; stronger intervention requires measured evidence and a rules revision. |
| Bots give false confidence | T uses a short forecast and attack-only continuations; it may overlook utility chains or long-term resource plans | Compare policies and human findings. A strategy beating T is evidence about that policy and a lead for testing, not proof of dominant human play. |
| The tiny roster becomes repetitive | Twelve species help diagnosis but limit novelty, and generation safeguards can concentrate certain sets | Compare raw/retained incidence and tester reports. Adjust redundant constraints or set variety before increasing roster size. |
| Effects are hard to understand | Active-phase timers, paused bench statuses, and benefits cleared on switching have different rules | Test the five-question rules check and inspect display confusion. Improve wording and feedback before changing a rule merely because its presentation was unclear. |
| Simulation costs delay human testing | T evaluates many copied states; the full campaign is much larger than the smoke gate | Benchmark an initial 100 T/T games. Record matches per minute and typical/worst decision cost. Run cheap correctness checks and the first human build before the full campaign. |

The most serious design tradeoff is independence versus reliably close matches. Keep independence for V1 as approved. If the fresh probes and human games show frequent severe disadvantages, revise the content/profile and test again. If global tuning cannot resolve the issue, explicitly reconsider the format rather than claiming the mulligan has solved fairness.

If resource-free switch loops become reproducible, one possible later experiment is a limit of two consecutive voluntary switches per player. Under that experimental rule, a third consecutive switch is illegal; committing a legal move resets the player's count, even if that move is later canceled by knockout. Forced replacements neither increment nor reset it. This would discourage loops but also remove legitimate defensive choices and make forced attacking turns predictable. It is not part of initial V1 and must receive separate approval before use.

### 8.3 Minimal implementation contract

Approved primary language: TypeScript. Use it for the battle engine, team generator, live match logic, bot policies, simulation harness, replay verification, and application logic. Keep the shared rules module independent of UI, database, and hosting APIs so the live game and offline tools import the same implementation. Content remains structured data as specified in Sections 4–6.

Keep one battle resolver for human matches, smoke tests, tactical forecasts, and replays. It consumes resolved team instances and legal choices; it does not read UI state or generate content based on the opponent. Offline forecasts use copies and their specified diagnostic draw behavior.

Use a host process as the authority for live matches: it holds the seed, validates choices, resolves actions, and supplies each player's permitted view. A permitted view is the subset of match data that player may see. Before final-team reveal, provide only their own offer; afterwards provide the approved public battle information. Pending opposing choices, discarded opposing offers, and the live seed remain private. Hiding a field visually while sending it to the opponent's client does not preserve secrecy.

Recommended submission convention:

| Field or rule | Required behavior |
| --- | --- |
| Match and player identity | Bind each submission to one match and its authorized player seat. |
| Gate ID | Give each new input gate a strictly increasing integer ID. Offer decisions, leads, normal turns, and required replacement choices each identify their gate; gate IDs are separate from combat-turn count. |
| Choice | Submit one of that player's currently legal choices. Validate against the gate's state. |
| First valid submission | Store it as the final commitment, following Section 2. |
| Identical retry | Acknowledge the stored commitment without applying it again or drawing more randomness. |
| Different retry for a committed gate | Reject privately; the first valid choice remains final. |
| Stale or invalid input | Reject privately. A recorded identical retry may still receive its original acknowledgement after the gate closes. |
| Resolution | Start exactly once when all required commitments exist; only the authority advances live RNG streams. |

For a single-player replacement gate, only that player's input is required. Automatic sole replacements follow Section 2 and do not expose a simultaneous replacement early.

On reconnect, restore the player's permitted current view and their own commitment status. Finish already committed resolution and pause at the next gate as approved. If the original match cannot resume, classify it as interrupted. V1 has no automatic decision-timeout win. Process-restart recovery may be added later; losing a host process must produce a recorded interruption rather than an invented combat result.

The prototype display must show monster types and base/effective stats, active and benched Health, remaining move uses, move type/category/priority, effects and current counters, knocked-out members, and whether the player's choice is committed. Label bench status counters as paused and explain that switching clears temporary benefits. Include plain-language effect descriptions and a type-chart reference. Art may add identity, but it cannot replace these rules cues.

### 8.4 Decisions that remain open

These items do not require guessing combat behavior. Resolve them at the milestone shown.

| Open item | Recommended starting point | Resolve when |
| --- | --- | --- |
| UI/server framework, runtime, and hosting | TypeScript is approved as the primary language. Choose compatible supporting tools the developer can maintain; the shared resolver must run offline and in the live authority. Prefer one application over multiple services for the private pilot. | At the start of implementation, before creating the project. |
| Deployment and live-state persistence | Support private match access and reconnect while the host remains live. Record interrupted sessions if recovery is unavailable. | Before the first online test. |
| Tester availability | Two people suffice for the first-playable gate; twelve is the preferred structured pilot. Preserve counts if fewer are available. | Before scheduling the human pilot. |
| T's usefulness and compute cost | Implement the approved policy, benchmark 100 games, and retain its policy version. Any shorter forecast or changed heuristic is a separately labeled policy. | Before the larger balance campaign. |
| Actual tuning values and review bands | Begin with the approved numbers; revise against repeatable engine, bot, and human evidence. | During stable-version test cycles. |
| Whether four-member teams provide enough recovery | Inspect early-knockout and comeback evidence before testing another team size. | After the first structured pilot. |

Keep empirical unknowns open until evidence exists. There is no need to decide future abilities, extra types, team-building legality, or additional themes before producing the MVP.

### 8.5 Future team building without replacing the battle engine

The team provider supplies selected members and moves; the battle engine resolves those members. Keep these responsibilities separate.

| Layer | V1 input | Future extension |
| --- | --- | --- |
| Content definitions | Species, stats, moves, types, effects, and authored sets | Versioned allowed move pools, additional content, and optional presentation metadata. |
| Format validation | Four slots, legal known moves, fixed stats, and the V1 content restrictions | A named player-built format with explicit roster, set, and move-combination rules. |
| Team provider | Independent eligible-catalogue sampling and blind redraws | A player-submitted roster/sets validated before the match. |
| Instance creation | Resolve IDs to fresh Health, uses, and effect state | The same operation after either provider succeeds. |
| Battle resolution | Choices, damage, effects, switching, and results | Reused unchanged while the combat rules remain the same. |

The lowest-cost first team-building extension lets players choose four distinct species and one approved A/B set for each. It keeps fixed stats and the existing combat rules. It needs new selection/validation screens and its own balance study, rather than changes to damage or action resolution.

Free move selection is a later step. Define allowed move pools and explicit combination restrictions; do not assume all four-move combinations are legal just because each move exists. Decide separately whether Random Battles role safeguards also belong in the player-built format. Restrictions that make assigned teams usable may unnecessarily constrain deliberate player strategies.

Record format ID and version with each match and replay. Random-generated and player-built modes share mechanics where possible, but their performance data stay separate. The existing TeamKey convention belongs to its generator catalogue; it need not dictate how a future free-move roster is serialized.

### 8.6 Other extensions and their limits

| Extension | Useful hook now | Design work required later |
| --- | --- | --- |
| Broader monster themes | Stable species IDs and optional origin/presentation tags; setting changes need not alter combat stats | Add industrial or surreal origins alongside Lantern Marches creatures, with original visual and narrative content. |
| More species or authored sets | Content snapshots, capability predicates, and profile validation | Recheck incidence, constraints, redraw variety, and matchups. Section 6's 100,000-candidate limit means large rosters may require a new sampling method. |
| Larger teams | Team-provider/instance boundaries and format-specific validation | Retest length, replacement choices, role caps, comeback opportunities, and generator cost. Do not simply change four to six everywhere. |
| Abilities or held items | Stable effect operations and declared battle phases | Define trigger timing, ordering, stacking, and visibility explicitly. New effect handlers may be necessary. |
| New or dual types | Versioned chart and type references | Specify the complete chart and multiplier combination rules, then recheck coverage. Current equal counts are not a guarantee for expanded systems. |
| Global fields or entry effects | Explicit action/end-phase boundaries | Define duration, ownership, switching interaction, damage timing, and simultaneous knockout behavior. |
| Competitive clocks or hidden sets | Choice gates and player-specific views | Define timeout/results or information rules and rerun learning/balance tests. These alter the experience. |

Do not build a general scripting language or a large trigger framework for hypothetical abilities in V1. Add reusable operations when actual content needs them. A future team builder can reuse the battle engine; a future mechanic with new timing may require engine changes.

### 8.7 Design handoff and next phase

The eight-section GDD is complete as the initial implementation specification. Its remaining open items are engineering choices and empirical questions with defined next steps.

The implementation handoff consists of the approved rules, content tables/schemas, generator profile, reference draws, interaction scenarios, replay requirements, and first-playable acceptance gate. Build in this order: content/validation and resolver; cheap bots, smoke tests, and replays; private two-player interface; end-to-end checks; then the tactical policy and larger balance campaign.

No game code has been created in this design phase. The design baseline is approved; implementation begins when the user requests that phase.

## Decisions Log

“Approved” below means approved as the V1 starting point. Numerical values are tunable. Detailed behavior that is not specified here remains open for its designated section.

| ID | Status | Decision |
| --- | --- | --- |
| D01 | Approved | Produce a GDD first. V1 tests core-loop enjoyment and balance using original authored content; familiar elemental type names are the user-selected exception. |
| D02 | Approved | The Lantern Marches is the V1 setting. Future versions may broaden monster origins into industrial and surreal themes. |
| D03 | Approved | Two players; singles battles; teams and movesets assigned by the generator; no pre-battle team building. |
| D04 | Approved — initial values | Four monsters per team; four moves per monster. |
| D05 | Approved | Simultaneous secret choices; Speed and priority determine resolution order. Exact order and switching rules belong in Section 2. |
| D06 | Approved | Both finalized teams and complete movesets are visible after mulligans finish. |
| D07 | Approved | Generate opposing teams independently under the same eligibility constraints. |
| D08 | Approved — initial value | One optional full-team mulligan per player before opposing-team reveal. The new team replaces the old team automatically. |
| D09 | Approved | No duplicates within a team; opposing teams may share monsters. |
| D10 | Approved — initial values | Six types; single-type monsters; effectiveness multipliers 1.5×, 1×, and ⅔×; no type immunities. |
| D11 | Approved | Health, Speed, two attack stats, and two corresponding defenses; fixed stats without levels. |
| D12 | Approved — initial values | Fixed ordinary damage; critical chance 1/36 per damaging action; critical multiplier 1.25×; criticals use normal defenses. Accuracy and any other random rules require explicit definition. |
| D13 | Approved — initial values | Twelve monsters, two per type; two authored sets per monster; twenty-four shared moves. |
| D14 | Approved — initial values | Ordinary attacks typically have 8–12 uses. Provide a weak fallback attack when resources cannot support another move. Exact availability belongs in Section 4. |
| D15 | Approved — initial values | Healing restores 25% maximum Health, has two uses, and appears at most once per moveset. |
| D16 | Approved | Stat boosts are temporary. Exact magnitudes, duration, stacking, and switching interactions belong in Section 4. |
| D17 | Approved — initial scope | Two statuses: gradual damage and reduced Speed. Global field effects are deferred. Exact status rules belong in Section 4. |
| D18 | Approved | Abilities and held items are deferred. |
| D19 | Approved — initial targets | Matches target 5–10 minutes and typically 20–30 turns; battles should consistently progress toward victory. |
| D20 | Approved | Mixed-experience audience; depth emphasizes prediction and positioning, with modest combinations of effects. |
| D21 | Approved | Live private online human tests; initially untimed choices; one hobbyist developer using AI assistance. |
| D22 | Approved | Data-driven content and reproducible random outcomes; future team building should use the same battle engine and content records. |
| D23 | Approved — initial targets | Section 1 pillars, evaluation thresholds, and measurement definitions. |
| D24 | Open | Tester availability, supporting framework/runtime/hosting choices, and empirical balance questions in Section 8; each has a defined milestone for resolution. Primary language is approved in D74. |
| D25 | Approved | Private KEEP/REDRAW commitments, simultaneous team reveal, and secret simultaneous lead selection. |
| D26 | Approved — initial values | Switches precede moves; fixed move priorities -1/0/+1; ordering Speed captured once; equal-priority equal-Speed moves use a recorded 50/50 tie roll. |
| D27 | Approved | Switching retains Health, uses, and persistent statuses; clears temporary benefits; persistent status timers pause on the bench, which receives no end-of-turn effects. |
| D28 | Approved | Use spent only when a move starts, including ineffective moves; canceled actors spend no use; fallback available when all known damaging moves are exhausted. |
| D29 | Approved | Victory checked after each complete action or simultaneous end-of-turn batch; due periodic damage applies together; no revival. |
| D30 | Approved | Knockout replacements occur between normal turns; simultaneous secret replacement when both sides need one; no extra attack or turn count. |
| D31 | Approved — initial value | Sixty-turn cap produces a draw; no score-based tiebreak. Initial choices are untimed; interrupted sessions are reported separately. |
| D32 | Approved | Defer move-triggered switches, forced switches, reactive mid-turn choices, and revival in V1. |
| D33 | Approved — initial values | Stat names and ranges: Health 100–140; Force/Spirit 40–100; Guard/Ward 50–100; Speed 40–100. Effective stats use exact multipliers and one rounding step. |
| D34 | Approved — initial values | Direct damage is max(1, floor(P × A/(A+F) × M × T × C × R)); matching-type bonus 6/5; authored damaging powers 40–80; utility power zero. |
| D35 | Approved — initial values | Revised elemental effectiveness chart: two advantages, two resisted matchups, and two neutral entries in every row and column; neutral self-matchups; no immunities. |
| D36 | Approved | All moves have 100% accuracy; no random damage range or secondary-effect chances; one hit and one 1/36 critical draw per executed damaging action. |
| D37 | Approved | Section 4 defines exact modifiers and stacking, status timing, final defensive reduction, and fallback category/power. |
| D38 | Approved — user revision | Type names and IDs: Fire/fire, Air/air, Earth/earth, Water/water, Dark/dark, Light/light; updated Section 3 is approved. |
| D39 | Approved — initial values | Catalogue: 12 matching-type-only core attacks at power 65/priority 0/10 uses; 6 quick attacks at power 40/priority +1/8 uses; 6 utility moves. Off-type access is limited to one quick attack per set. |
| D40 | Approved — initial values | Fray loses 1/8 maximum Health for 3 active end phases; Tethered halves Speed for 4 active end phases. They can coexist, refresh without stacking, and pause on the bench. |
| D41 | Approved — initial values | Kindled Oath doubles Force/Spirit and raises Speed by 25% for 4 end phases. Lantern Brace raises Guard/Ward by 25% for 4 phases and halves direct damage for 2. Temporary effects clear on exit. |
| D42 | Approved | Active end-phase counters include the application turn. One temporary modifier per stat and one R effect; reapplication replaces/refreshes rather than multiplies. |
| D43 | Approved — initial safeguards | Hearthstitch heals 25% twice; it cannot share a set with Lantern Brace. Recommended team caps are one Hearthstitch user and one Brace user, to be formalized in Section 6. |
| D44 | Approved — initial values | Clearwake Rite has priority +1 and 3 uses; removes both own statuses and opposing temporary stat modifiers, preserving opposing statuses and R. |
| D45 | Approved | Bare Resolve has power 20, no type, priority 0, unlimited uses, and a category fixed from higher base Force/Spirit (ties Force); two data variants implement one fallback action. |
| D46 | Approved | Move/effect schemas use ordered shared operations and timed records; field effects, abilities, and items stay deferred. |
| D47 | Approved — tentative initial content | Twelve original species with the stats in Section 5.4 and two complete authored sets each; no set-specific stat overrides. |
| D48 | Approved — initial values | Allocation budget B = Health + higher attack + lower attack/4 + (Guard+Ward)/2 + Speed/2; target 330, eligible range 325–335; threshold and matchup checks remain necessary. |
| D49 | Approved — starting design | Each set includes a matching-type core using the higher base attack stat; Rootwrit-B and both Bellmane sets also offer the alternate core category. |
| D50 | Approved — initial values | Species and set relative selection weights start at 1; capability tags derive from move access; generation will enforce selected-set constraints. |
| D51 | Approved — starting design | Species/set/battle-instance records are separate; retain species ID, set ID, and content version; stats stay fixed across matches within a version. |
| D52 | Approved — starting design | Diagnose and calibrate monster-set strength before species aggregates; tune access, stats, shared moves, or composition constraints, then recheck knockout thresholds. Selection frequency is a variety lever. |
| D53 | Approved — starting design | Enumerate unordered four-species/set assignments, validate, sort unique TeamKeys, sample uniformly, then shuffle slots; initial weights remain 1. Current pool: 6,109 of 7,920 candidates. |
| D54 | Approved — initial values | At least three types, both credible core categories at 4/5 attack ratio, one cleanup user, at most one healer and one bracer, and one Speed plan via Speed 85+, Weightbind, or Kindled Oath. |
| D55 | Approved — initial value | One blind mandatory full-team redraw changes at least two species; sample from the eligible pool conditioned only on the owner's first species set. |
| D56 | Approved — starting design | Versioned HMAC-SHA256 counter draws, separate offer/order/tie/critical/bot streams, unbiased bounded-integer rejection, private 256-bit seed, and catalogue/reference fixtures. |
| D57 | Approved — initial audit targets | Raw first-offer incidence targets: species 25–40%, either conditional set 35–65%; invalid assignments, missing content, dead redraws, and replay mismatches zero. |
| D58 | Approved — initial probe targets | Sample 1,000 pairs with 32-game screens, fresh 128-game follow-ups for 65%+ favored score and a random 10% of unflagged pairs; initial goal below 5% large advantages at 75%+. No opponent-dependent filtering. |
| D59 | Approved — starting design | Separate team provider from battle resolution; archive content/rules/profile/RNG identity, all offers, commitments, draw traces, outcomes, and first/final-team feedback. |
| D60 | Approved — initial gates | First playable MVP requires twenty interaction scenarios, generator/reference checks, 1,000 R/S smoke matches, five ordinary human matches with two people, and two interruption checks; larger balance studies follow. |
| D61 | Approved — initial review bands | Containing-team scores diagnose species/set/type strength; distinguish offered, retained, deployed, and chosen usage. Report uncertainty by whole pair fixtures and keep versions/policies/modes separate. |
| D62 | Approved — initial policies | Define legal-random R, attack-only S, and four-turn tactical-forecast T; all share the resolver and public information, without pending choices or live RNG access. |
| D63 | Approved — initial sampling | Run 5,000 policy-comparison games, then the approved matchup screen and fresh confirmations; weight the unflagged audit, report uncertainty, and extend unresolved probes to 512 games. |
| D64 | Approved — initial safeguards | Review repeated positions, slow windows, critical sensitivity, hard counters, snowballing, mandatory utilities, and set differences; tune a small number of global/versioned levers at a time. |
| D65 | Approved — initial playtest plan | Preferred twelve-tester pilot yields twelve ordinary games and twelve swapped-team rematches; aim for sixty ordinary matches per stable version before broader evaluation. Availability remains open. |
| D66 | Approved — evaluation approach | Apply approved Section 1 learning goals to ordinary play; separate reliable first-playable operation from later evidence of fun/balance, and label underpowered studies inconclusive. |
| D67 | Approved — scope | Freeze the approved private online four-member format and starting content; defer account/ladder/progression/content-expansion systems until after the first-playable gate. |
| D68 | Approved — implementation contract | Use one shared resolver and a live authority with player-specific views; give input gates unique increasing IDs and acknowledge identical retries without repeating effects or random draws. |
| D69 | Approved — presentation | Show Health, move resources/rules, effects/counters, paused bench statuses, knockouts, and own commitment status clearly; placeholders are sufficient for first tests. |
| D70 | Approved — risk response | Treat matchup luck, stall, snowballing, coverage, defense, bot limits, and repetition as testable risks. The two-consecutive-switch limit is a future experiment, excluded from initial V1 and requiring separate approval. |
| D71 | Approved — future team building | Keep content, format validation, team providers, instance creation, and battle resolution separate; an initial player-built format can choose species and A/B sets without changing combat. |
| D72 | Approved — future hooks | Extend themes through presentation tags and content through versioned schemas; new timing/types/abilities may need engine changes. Do not prebuild speculative scripting/trigger infrastructure. |
| D73 | Approved — handoff | The eight-section design baseline is complete; select engineering stack and recruit testers at their milestones. Implementation remains a separate requested phase. |
| D74 | Approved — user selection | TypeScript is the primary implementation language for the battle engine, generator, live match/application logic, bots, simulations, and replay verification. Reuse one rules module across the live game and offline tools. |

## Approved document outline

| Section | Contents | Approval status |
| --- | --- | --- |
| 1 | Design brief, setting, pillars, playtest goals, and Decisions Log | Approved |
| 2 | Battle protocol: choices, visibility, priority, Speed, switching, knockouts, victory, draws, and limits | Approved |
| 3 | Stats, damage formulas and rounding, worked examples, and full elemental type chart | Approved |
| 4 | Move catalog and rules, resources, effects, statuses, healing, setup, and abilities/items rationale | Approved |
| 5 | Original roster, role archetypes, stat budgets, authored sets, and structured data schemas | Approved as tentative starting content |
| 6 | Independent team generation, constraints, strength calibration, mulligans, and random seeds | Approved |
| 7 | Balance metrics, bot simulations, human playtest plan, tuning levers, and success/failure criteria | Approved |
| 8 | Risks, open questions, and future extensions including team building | Approved |
