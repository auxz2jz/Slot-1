# Relic of Emberwood — v26

An original top-down action-adventure inspired by the structure and feel of classic 8-bit exploration games without using copyrighted maps, sprites, music, characters, or other game assets.

## Current build

- 10×10 overworld: 100 connected outdoor screens
- Multiple biomes with unique palettes, animated ambience, roads, landmarks, and regional enemy mixes
- 20 interiors, including two multi-room dungeons
- Ancient Gate dungeon and Sunken Archive dungeon
- Original Ember Hamlet village, NPC dialogue, shop, secrets, bomb walls, push stones, stairs, caves, locked gates, and final shrine
- Sword combat, full-health sword wave, shield blocking, bombs, Wind Disc, keys, rupees, health upgrades, bomb capacity upgrade, and Pearl Edge sword upgrade
- Multiple enemy archetypes plus distinct dungeon/final bosses
- Boss health bars, telegraphed attacks, unique projectile patterns, trails, hit sparks, footsteps, and water effects
- Title screen, original procedural chiptune-style ambience, vibration feedback, gamepad support, autosave, save migration, and offline/PWA cache
- 512×480 high-density pixel-art backing canvas while preserving 256×240 gameplay coordinates
- Temporary secret-development indicators remain enabled for testing

## Controls

- Move: analog touch stick / arrows / WASD / gamepad left stick
- A: sword / confirm / talk near NPC
- B: selected item
- ITEM: cycle Bomb / Wind Disc once owned
- MAP: overworld or dungeon map
- NEW: erase save and start over

## Development note

The save schema intentionally remains version 17 so later visual/content releases can preserve existing progress without unnecessary save migrations. The v26 release is layered over the stable engine so visual and content improvements can continue without destabilizing save data.
