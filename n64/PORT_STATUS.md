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
- GitHub Actions build that produces `relic_emberwood.z64`

## Content still to port from the existing Slot-1 game

The browser game remains in this repository and in Git history as the authoritative content/design source while these systems are moved to the cartridge engine:

- 10x10 / 100-screen overworld
- 88 interiors including 79 dungeon rooms
- Eight Ember Shards
- Seven major pre-final dungeons plus Ember Citadel
- Small keys and Master Key gates
- Rune trials
- Sun Bow, bombs, Wind Disc and Ember Rod
- Magic meter
- Mirror Shield, Storm Boots and Pearl Edge
- Verdant / Guardian / Moon / Hunter rings
- Traveler / Tide / Ember / Shadow outfits
- Maps and Compasses
- Heart Fragments and max-heart upgrades
- Pots, grass, spikes, pillars, secrets, shops and treasure chests
- Minibosses and all major bosses including the multi-phase final boss
- Ember Hamlet side quests
- Inventory/map/pause UI
- Native save format (EEPROM/Controller Pak decision during port)
- Sound effects and original music

## Controls in the current cartridge milestone

- Analog stick: move
- B: sword attack / combo
- A: roll; while Z-targeting, side input gives a side hop and backward/neutral gives a backflip
- Z: hold target lock when an enemy is in range

The web build is intentionally retained during the port so gameplay/content can be migrated without losing completed work.
