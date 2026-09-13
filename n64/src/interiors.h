#ifndef EMBERWOOD_INTERIORS_H
#define EMBERWOOD_INTERIORS_H

#include <stdint.h>
#include <stdbool.h>
#include "dungeons.h"

#define EMBER_INTERIOR_COUNT 9
#define EMBER_INTERIOR_MAX_ENEMIES 4

typedef enum {
    EMBER_INTERIOR_GROTTO,
    EMBER_INTERIOR_LOWER_RUINS,
    EMBER_INTERIOR_SHOP,
    EMBER_INTERIOR_LEGACY_SHRINE,
    EMBER_INTERIOR_CACHE,
    EMBER_INTERIOR_HEART_CAVE,
    EMBER_INTERIOR_BOMB_VAULT,
    EMBER_INTERIOR_BARROW,
    EMBER_INTERIOR_WIND_CAVE
} EmberInteriorId;

typedef enum {
    EMBER_INTERIOR_ENEMY_NONE,
    EMBER_INTERIOR_ENEMY_WALKER,
    EMBER_INTERIOR_ENEMY_HOPPER,
    EMBER_INTERIOR_ENEMY_SHRUB,
    EMBER_INTERIOR_ENEMY_BAT,
    EMBER_INTERIOR_ENEMY_KNIGHT,
    EMBER_INTERIOR_ENEMY_WARDEN
} EmberInteriorEnemy;

typedef enum {
    EMBER_INTERIOR_REWARD_NONE,
    EMBER_INTERIOR_REWARD_SHARD,
    EMBER_INTERIOR_REWARD_RELIC,
    EMBER_INTERIOR_REWARD_RUPEES_20,
    EMBER_INTERIOR_REWARD_HEART_CONTAINER,
    EMBER_INTERIOR_REWARD_BOMB_BAG,
    EMBER_INTERIOR_REWARD_RUPEES_50,
    EMBER_INTERIOR_REWARD_WIND_DISC
} EmberInteriorReward;

typedef struct {
    EmberInteriorId id;
    const char *key;
    const char *name;
    uint8_t entrance_screen;
    uint8_t entrance_x;
    uint8_t entrance_y;
    EmberEntryMethod entry_method;
    const char *entrance_kind;
    uint8_t return_screen;
    uint16_t return_x;
    uint16_t return_y;
    uint8_t enemy_count;
    EmberInteriorEnemy enemies[EMBER_INTERIOR_MAX_ENEMIES];
    EmberInteriorReward reward;
    bool shop;
    bool legacy_inactive;
} EmberInteriorDef;

const EmberInteriorDef *ember_interior_get(EmberInteriorId id);
const EmberInteriorDef *ember_interior_at_screen(uint8_t screen_id, bool include_legacy);
const char *ember_interior_enemy_name(EmberInteriorEnemy enemy);
const char *ember_interior_reward_name(EmberInteriorReward reward);

#endif
