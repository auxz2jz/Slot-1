#ifndef EMBERWOOD_GAME_STATE_H
#define EMBERWOOD_GAME_STATE_H

#include <stdint.h>
#include <stdbool.h>
#include "world.h"

#define EMBER_SAVE_VERSION 1u

enum {
    EMBER_ITEM_BOMBS      = 1u << 0,
    EMBER_ITEM_SUN_BOW    = 1u << 1,
    EMBER_ITEM_WIND_DISC  = 1u << 2,
    EMBER_ITEM_EMBER_ROD  = 1u << 3,
    EMBER_ITEM_MIRROR_SHIELD = 1u << 4,
    EMBER_ITEM_STORM_BOOTS   = 1u << 5,
    EMBER_ITEM_PEARL_EDGE    = 1u << 6,
    EMBER_ITEM_MASTER_KEY    = 1u << 7
};

enum {
    EMBER_RING_VERDANT  = 1u << 0,
    EMBER_RING_GUARDIAN = 1u << 1,
    EMBER_RING_MOON     = 1u << 2,
    EMBER_RING_HUNTER   = 1u << 3
};

enum {
    EMBER_OUTFIT_TRAVELER = 1u << 0,
    EMBER_OUTFIT_TIDE     = 1u << 1,
    EMBER_OUTFIT_EMBER    = 1u << 2,
    EMBER_OUTFIT_SHADOW   = 1u << 3
};

typedef struct {
    uint32_t version;
    uint8_t screen_id;
    uint8_t hp;
    uint8_t max_hp;
    uint8_t magic;
    uint8_t max_magic;
    uint16_t rupees;
    uint8_t bombs;
    uint8_t shards;
    uint8_t small_keys;
    uint8_t heart_fragments;
    uint32_t item_flags;
    uint32_t ring_flags;
    uint32_t outfit_flags;
    uint32_t dungeon_flags;
    uint32_t quest_flags;
    uint32_t explored[(EMBER_WORLD_COUNT + 31) / 32];
} EmberGameState;

void ember_state_new_game(EmberGameState *state);
void ember_state_mark_explored(EmberGameState *state, uint8_t screen_id);
bool ember_state_is_explored(const EmberGameState *state, uint8_t screen_id);
void ember_state_enter_screen(EmberGameState *state, uint8_t screen_id);
void ember_state_gain_shard(EmberGameState *state);

#endif
