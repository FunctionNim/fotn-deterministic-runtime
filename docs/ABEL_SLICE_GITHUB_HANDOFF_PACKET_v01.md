# ABEL SLICE GITHUB HANDOFF PACKET v0.1

Status: LOCKED / HANDOFF-READY AFTER QA ACCEPTANCE

Repository: FunctionNim/fotn-deterministic-runtime

## Purpose

This packet translates the locked Abel vertical slice planning sheets into a GitHub-ready implementation handoff. It should be used after the first QA script is accepted, not as permission to expand scope.

The handoff goal is to build one playable slice, not the full game.

## Active source sheets

Use these spreadsheet tabs as the active source of truth:

1. WORKBOOK_SUPERSESSION_AND_ACTIVE_CANON_INDEX_v01
2. ABEL_SLICE_SYMBOL_PACKET_PRODUCTION_TIER_LIST_v02
3. ABEL_SLICE_PLAYER_LOOP_START_MENU_v01
4. ABEL_SLICE_MAP_PACKET_v01
5. ABEL_SLICE_SYSTEM_HOOKS_v01
6. ABEL_SLICE_BUILD_ORDER_v02
7. ABEL_SLICE_FIRST_QA_SCRIPT_v03
8. BEAST_STARTER_ACQUISITION_WILDERNESS_GATE_FLOW_v01
9. BEAST_ENCOUNTER_HEX_FIELD_LAW_v01
10. WILDERNESS_CLASH_COMPANION_TUNING_TERRAIN_LAW_v02
11. WILDERNESS_CLASH_DEFEATED_BEAST_AGENT_OPTIONS_v03
12. WILDERNESS_CLASH_PRESSURE_GEM_CORRECTION_PATCH_v04

Superseded sheets must not override these. In particular, do not restore the old one-called-beast wilderness mode, Hollow/Sealed active terminology, or merchant Empty Gem starter rule.

## Slice scope

The first playable Abel slice contains:

- Start menu
- City of Abel center hub
- Three guild halls only
- One Brown Pyramid civilization node
- Plainlands around Abel
- Tall grass route
- Water pond route
- Tree line boundary
- Gathering spots
- One elite negative pressure patch
- Starter beast family choice
- Beast companion registration
- Merchant/trade path for two additional beasts
- Wilderness gate requiring three ready beasts
- Beast Encounter hex-field auto-battler
- Victory remnant choices
- Lockroom pressure encounter hook
- Unified rewards/storage/recovery loop
- Return to Abel and repeat

## Non-goals for this slice

Do not build these yet:

- All ten guilds
- Full city sprawl
- Full civilization economy
- Actual player-built guild construction
- Fourth typed/custom mission answer option
- Beast XP, beast levels, or evolution
- Full bestiary
- Multi-hex beasts
- Large/tiny beast classes
- Deep tactical manual battle commands
- Complex AI
- Full Lockroom campaign
- Final art polish before Tier 0 and Tier 1 symbol readability

## Critical active canon

### Beast acquisition

- The player chooses a starter family: Mountain, River, or Cloud.
- The exact starter beast is randomly selected from that family's starter-safe pool.
- The guild provides one starter Filled Pressure Gem / beast candidate.
- The player must obtain two more beasts through civilization missions, trades, or merchants before entering wilderness.
- Civilization merchants sell Filled Pressure Gems / beast candidates.
- Empty Pressure Gems mainly come from Orange creation and special sources.
- Beasts do not gain levels.

### Pressure gem terms

- Empty Pressure Gem = available vessel.
- Filled Pressure Gem = contains captured wilderness beast pressure / beast candidate.
- Released Gem = Filled Pressure Gem returned to empty state, usually from overflow/return handling.

### Defeated beast options

After a Beast Clash victory, defeated beast remnants are clickable.

- Universal option: Loot.
- Clay: recover companion health or ability count.
- Gray: capture defeated beast into Filled Pressure Gem.
- Orange: create Empty Pressure Gem.
- Gold Order: Memory Imprint / knowledge.

One remnant gives one outcome unless a future upgrade explicitly changes this.

### Beast Encounter field

- Central 37-hex board.
- Player beasts deploy from the left.
- Enemy beasts deploy from the right.
- Bottom tray shows up to five owned beast cards, with left/right arrows if more than five.
- Player may deploy up to three ready beasts.
- All beasts occupy one hex in this slice.
- Mountain enemies create Boulders.
- River enemies create Water Spots.
- Cloud enemies create Hollows.
- Obstacles cannot appear on deployment hexes.
- Generated maps must keep at least two traversable approach lanes.

### Gate rule

The wilderness gate opens only when the player has at least three registered ready beast companions.

Do not count:

- Unregistered Filled Pressure Gems
- Memory Imprints
- Exhausted beasts
- Captured-unavailable beasts

## Build order

### Phase 0 — Readiness Freeze

Confirm active canon and non-goals. Do not implement superseded rules.

### Phase 1 — Tier 0 Placeholder Symbols

Build readable placeholders for:

- Player marker
- Ground
- Walls/boundaries
- Open door
- Closed door
- Interact prompt
- Billboard
- Storage cabinet
- Quest board
- Guild marker
- Portal pad
- Wilderness gate
- Center Spire marker
- Hex tile
- Ally/enemy beast markers
- Deployment glow
- Boulder
- Water Spot
- Hollow
- Beast card
- Tray arrows
- Start Battle
- Leave Encounter

### Phase 2 — Start Menu and Save Shell

Build:

- New Journey
- Continue
- Options stub
- Gratitude screen
- Leave Abel / Quit
- New save initialization
- Last safe location

### Phase 3 — Abel Center Playable Hub

Build:

- Center Spire start room
- Center hub
- Billboard walk
- Storage cabinet
- Portal pad
- Open/closed doors
- Wilderness gate visual with dynamic 0/3 to 3/3 status

### Phase 4 — Three Guild Hall Skeletons

Build:

- Guild A/B/C maps
- Return portal
- Quest board
- Storage
- Starter beast station
- Companion registration/care station

### Phase 5 — Starter Beast Family Flow

Build:

- Mountain/River/Cloud family choice UI
- One random starter-safe Filled Pressure Gem from chosen family
- One-starter-only blocker
- Companion registration
- Ready count 1/3

### Phase 6 — Brown Pyramid Civilization Node

Build:

- Brown Pyramid exterior/interior
- Crafting station
- Quest board
- Merchant/trade spot
- Future build frame explanation

### Phase 7 — Starter Missions, Gathering, and Trade

Build:

- Quest accept
- Mission marker
- Three-choice question panel
- Gathering node
- Reward toast
- Merchant Filled Pressure Gem purchase/trade
- Two additional beast candidates

### Phase 8 — Wilderness Gate and Plainlands

Build:

- Dynamic gate check
- Abel Outskirts
- Tall Grass route
- Water Pond route
- Tree Line boundary
- Gathering pocket
- Return route

### Phase 9 — Beast Encounter Hex Field MVP

Build:

- 37-hex board
- Player side left / enemy side right
- Bottom five-card tray with arrows
- Deploy up to three ready beasts
- Start Battle button
- Enemy-family obstacles
- Simple auto-battle result

### Phase 10 — Victory Remnants and Beast Rewards

Build:

- Defeated remnant marker
- Loot option
- Clay recover option
- Gray capture option
- Orange create Empty Gem option
- Gold memory stub if applicable
- Reward cards
- One-outcome-per-remnant enforcement
- Loss gives no remnant choices

### Phase 11 — Lockroom Slice Hook

Build:

- Lockroom entry marker
- Distinct Lockroom transition
- One basic Lockroom combat scene/hook
- Result screen
- Reward/return

### Phase 12 — Unified Rewards, Storage, Recovery

Build:

- Reward pipeline
- Cap/full messages
- Storage persistence
- Companion exhausted/ready recovery
- Simple guild recovery
- Save/load after rewards

### Phase 13 — First Full Loop QA

Run the full QA script before calling implementation ready.

### Phase 14 — GitHub Implementation Follow-up

Only after QA acceptance, create implementation issues or branch tasks.

## Required QA before implementation acceptance

Use ABEL_SLICE_FIRST_QA_SCRIPT_v03.

Minimum pass set:

- Active canon check
- Tier 0 / Tier 1 symbol readability
- Start menu New Journey / Continue
- Abel Center first 5 minutes
- Three guild navigation
- Starter beast family choice
- Starter claim blocker
- Starter companion registration
- Brown Pyramid access
- Starter missions and three-choice question panel
- Gathering node
- Buy/earn two more beasts
- Wilderness gate block and unlock
- Plainlands return route
- Beast Encounter trigger
- Hex field terrain generation
- Deploy up to three beasts
- Start auto-battle
- Victory remnant choices
- Gray capture correctness
- Orange Empty Gem correctness
- Loss boundary
- Lockroom mode clarity
- Lockroom resolve and return
- Unified reward pipeline
- Storage persistence
- Companion recovery
- End-to-end full loop
- Save/load across milestones

GitHub implementation should remain blocked if P0/P1 tests are Open, Fail, or Blocked without an explicit waiver.

## Developer guardrails

- Prefer readable placeholders over polished art.
- Do not create a coin economy.
- Do not add beast levels.
- Do not add a fourth answer option.
- Do not expand to ten guilds.
- Do not build full construction yet.
- Do not mix Lockroom and Beast Clash signals.
- Do not let old superseded terminology leak into UI.
- Do not count unregistered gems or memory imprints as ready beasts.

## Suggested first implementation issue set

1. Create slice save state and start menu.
2. Create Tier 0 placeholder symbol registry.
3. Build Abel Center hub map.
4. Build three guild hall skeletons.
5. Build starter beast family choice and one-starter-only blocker.
6. Build companion registration and ready count.
7. Build Brown Pyramid node with crafting/trade stubs.
8. Build starter missions, gathering, and three-choice question panel.
9. Build wilderness gate check and plainlands map.
10. Build Beast Encounter 37-hex field and deployment tray.
11. Build simple auto-battle and result state.
12. Build victory remnant options and pressure gem corrections.
13. Build Lockroom entry hook and return.
14. Build unified reward/storage/recovery persistence.
15. Run first QA script and resolve blockers.

## Handoff completion rule

This handoff is complete when the repository contains this packet and the next implementation work can be traced back to active source sheets, build phases, and QA tests.
