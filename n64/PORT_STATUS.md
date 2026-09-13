# Relic of Emberwood — Nintendo 64 Port Status

This directory is the native N64 cartridge port of the existing Relic of Emberwood browser game.

## Technical target

- 320x240 N64 framebuffer
- libdragon preview toolchain
- Tiny3D native RSP/RDP 3D renderer
- Big-endian `.z64` ROM output
- Standard N64 controller input
- Original Emberwood art, characters, maps, music and names
- `Test.z64` / Ocarina of Time NTSC 1.2 is used only as a technical reference for presentation class and gameplay feel; Nintendo assets are not embedded in this project.

## Implemented in the first native milestone

- Native N64 boot/render loop
- Depth-buffered 3D geometry and directional/ambient lighting
- 320x240 presentation
- Analog-stick dead zone and curved speed response
- Free camera and hostile Z-target camera modes
- Ocarina-informed 60-degree free / 50-degree battle FOV split
- Camera obstacle shortening
- Player acceleration, deceleration and continuous facing
- Forward roll
- Z-target side hop and backflip
- Three-stage sword chain
- Sword reach tested along the animated blade path rather than a simple radial hit check
- Invulnerability window during evasive moves
- Terrain height response
- Tree/building collision
- Original low-poly Emberwood hero with tunic, head/hair, cap, limbs, shield and sword
- Original Ash Knight enemy with approach, strafe, block, windup, attack, hurt and death states
- GitHub Actions build that produces and verifies `relic_emberwood.z64`

## Native content/data foundation now ported

The cartridge project now also compiles portable C data for the original game's long-form structure. These modules are foundations for runtime integration; this section does not claim every room is already playable in 3D.

- 10x10 / 100-screen overworld topology, biome classification, named landmarks and road links
- Portable progression state for health, magic, rupees, bombs, eight Ember Shards, keys, items, rings, outfits, dungeon/quest flags and explored-screen tracking
- Eight-dungeon native catalog covering all 79 dungeon rooms:
  - Ancient Gate — 5 rooms
  - Sunken Archive — 6 rooms
  - Verdant Labyrinth — 12 rooms
  - Crystal Mines — 12 rooms
  - Storm Bastion — 12 rooms
  - Cinder Forge — 12 rooms
  - Moon Barrow — 12 rooms
  - Ember Citadel — 8 rooms
- Original dungeon entrance screens/methods and room-map coordinates
- Original major-boss identities and known HP values
- Eight miniboss placements and their reward rooms
- Native room metadata for maps, compasses and supply chests
- Small-key, main-item, side-item, shard, Pearl Edge, Magic Vessel and final Relic reward metadata
- Major-dungeon room-6 to room-9 key gates
- Major-dungeon boss-wing clear gates and room 2/4/8 trial requirements
- Ember Citadel room 2/3/6 final trial requirements

## Runtime/content work still to port

The browser game remains in this repository and in Git history as the authoritative content/design source while these systems are moved onto the cartridge engine:

- Connect the 100-screen overworld data to live 3D screen transitions, per-screen scenery/enemies and persistent state
- Connect all 79 dungeon-room definitions to playable 3D room loading/transitions
- Remaining 9 non-dungeon interiors so the full 88-interior count is represented at runtime
- Dungeon map/compass UI and persistent visited-room state
- Treasure-chest interaction and the eight hidden overworld Heart Fragment chests
- Small-key / Master Key gate runtime behavior and rune-trial enforcement
- Sun Bow, bombs, Wind Disc and Ember Rod runtime item systems
- Magic meter runtime use/recovery
- Mirror Shield, Storm Boots and Pearl Edge gameplay effects
- Verdant / Guardian / Moon / Hunter ring effects
- Traveler / Tide / Ember / Shadow outfit effects
- Pots, grass, spikes, pillars, secrets, shops and treasure chests
- Miniboss and major-boss combat implementations beyond the current Ash Knight foundation, including the multi-phase final boss
- Ember Hamlet NPCs and three side quests
- Inventory/map/pause UI
- Native save persistence (EEPROM/Controller Pak decision during port)
- Sound effects and original music

## Controls in the current cartridge milestone

- Analog stick: move
- B: sword attack / combo
- A: roll; while Z-targeting, side input gives a side hop and backward/neutral gives a backflip
- Z: hold target lock when an enemy is in range

The web build is intentionally retained during the port so gameplay/content can be migrated without losing completed work.
