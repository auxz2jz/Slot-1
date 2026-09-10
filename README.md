# Relic of Emberwood

An original NES-style top-down action-adventure prototype built as both a mobile-friendly web game and a foundation for a future NES ROM/cartridge version.

## Current build

- 10×10 overworld: 100 connected outdoor screens
- Screen-to-screen scrolling transitions
- 360-degree movement with touch, keyboard, and gamepad support
- Directional sword thrusts and full-health sword waves
- Shield blocking for frontal enemy projectiles
- Bombs with animated explosions, smoke, sparks, screen shake, and phone vibration
- Bombable cave entrances, push-stone stair entrances, keys, and locked doors
- 3 Ember Shards plus a final Ember Shrine encounter
- Multi-room Ancient Gate dungeon
- Rupees, heart drops, bombs, keys, permanent Heart Vessel upgrade, and Bomb Bag upgrade
- Supply shop with healing, bombs, and a permanent heart upgrade
- World map that reveals visited screens and landmarks
- Autosave using browser local storage
- Installable/offline PWA support
- NES-like procedural sound effects generated in the browser

## Controls

- Touch stick / Arrow keys / WASD / gamepad stick: move
- A button / Space / Enter / gamepad A: sword
- B button / Shift / gamepad B: place bomb
- MAP / M / gamepad Start or Select: world or dungeon map
- NEW: erase the current save and start over

## Current progression

The player starts in Ember Meadow near the center of the world. Three Ember Shards are found through a bomb-opened cave, a push-stone stair passage, and the multi-room Ancient Gate dungeon. After collecting all three, the Ember Shrine in the far northeast opens for the final encounter.

Several optional secret areas contain rupees and permanent upgrades. Old roads connect many important landmarks.

## Development note

The yellow `!` markers are temporary testing indicators for unopened secrets and progression gates. They are intentionally enabled during development and can be disabled when secret placement is finalized.

## Code layout

- `index.html` — page and mobile controls
- `core.js` — input, sound, world generation, landmarks, portals, and dungeon definitions
- `state.js` — movement, combat, enemies, progression, saving, shops, drops, secrets, and transitions
- `render.js` — terrain, sprites, effects, map, dungeon, and HUD rendering
- `manifest.json`, `sw.js`, `icon.svg` — installable/offline web-app support

The game uses original names, maps, sprites, and artwork while drawing inspiration from classic NES action-adventure design.
