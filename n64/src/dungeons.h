#ifndef EMBERWOOD_DUNGEONS_H
#define EMBERWOOD_DUNGEONS_H

#include <stdint.h>
#include <stdbool.h>

#define EMBER_DUNGEON_COUNT 8
#define EMBER_DUNGEON_ROOM_COUNT 79
#define EMBER_ROOM_NONE 0xFFu

typedef enum {
    EMBER_DUNGEON_GATE,
    EMBER_DUNGEON_TIDE,
    EMBER_DUNGEON_VERDANT,
    EMBER_DUNGEON_CRYSTAL,
    EMBER_DUNGEON_STORM,
    EMBER_DUNGEON_CINDER,
    EMBER_DUNGEON_MOON,
    EMBER_DUNGEON_CITADEL
} EmberDungeonId;

typedef enum {
    EMBER_ENTRY_OPEN,
    EMBER_ENTRY_KEY,
    EMBER_ENTRY_BOMB,
    EMBER_ENTRY_PUSH,
    EMBER_ENTRY_SHARDS
} EmberEntryMethod;

typedef enum {
    EMBER_REWARD_NONE,
    EMBER_REWARD_SHARD,
    EMBER_REWARD_SMALL_KEY,
    EMBER_REWARD_SUN_BOW,
    EMBER_REWARD_VERDANT_RING,
    EMBER_REWARD_MASTER_KEY,
    EMBER_REWARD_STORM_BOOTS,
    EMBER_REWARD_MIRROR_SHIELD,
    EMBER_REWARD_EMBER_ROD,
    EMBER_REWARD_EMBER_OUTFIT,
    EMBER_REWARD_MOON_RING,
    EMBER_REWARD_SHADOW_OUTFIT,
    EMBER_REWARD_GUARDIAN_RING,
    EMBER_REWARD_TIDE_OUTFIT,
    EMBER_REWARD_PEARL_EDGE,
    EMBER_REWARD_MAGIC_VESSEL,
    EMBER_REWARD_RELIC
} EmberReward;

typedef enum {
    EMBER_BOSS_NONE,
    EMBER_BOSS_WARDEN,
    EMBER_BOSS_ROOT_LORD,
    EMBER_BOSS_CRYSTAL_MAW,
    EMBER_BOSS_STORM_EYE,
    EMBER_BOSS_FORGE_LORD,
    EMBER_BOSS_MOON_KNIGHT,
    EMBER_BOSS_EMBER_SOVEREIGN
} EmberBoss;

typedef enum {
    EMBER_MINIBOSS_NONE,
    EMBER_MINIBOSS_STONE_SENTINEL,
    EMBER_MINIBOSS_TIDE_GUARDIAN,
    EMBER_MINIBOSS_BRIAR_GOLEM,
    EMBER_MINIBOSS_PRISM_KNIGHT,
    EMBER_MINIBOSS_TEMPEST_DJINN,
    EMBER_MINIBOSS_MAGMA_BEAST,
    EMBER_MINIBOSS_DUSK_STALKER,
    EMBER_MINIBOSS_CROWN_WARDEN
} EmberMiniboss;

enum {
    EMBER_ROOM_ENTRY       = 1u << 0,
    EMBER_ROOM_BOSS        = 1u << 1,
    EMBER_ROOM_MINIBOSS    = 1u << 2,
    EMBER_ROOM_MAP_CHEST   = 1u << 3,
    EMBER_ROOM_COMPASS     = 1u << 4,
    EMBER_ROOM_SUPPLY      = 1u << 5,
    EMBER_ROOM_TRIAL       = 1u << 6,
    EMBER_ROOM_CLEAR_GATE  = 1u << 7
};

typedef struct {
    uint8_t index;
    int8_t map_x;
    int8_t map_y;
    uint8_t flags;
    EmberReward reward;
    EmberMiniboss miniboss;
    const char *name;
} EmberDungeonRoom;

typedef struct {
    EmberDungeonId id;
    const char *key;
    const char *name;
    const char *theme;
    uint8_t entrance_screen;
    uint8_t entrance_x;
    uint8_t entrance_y;
    EmberEntryMethod entry_method;
    uint8_t room_count;
    uint8_t boss_room;
    EmberBoss boss;
    uint8_t boss_hp;
    uint8_t locked_from_room;
    uint8_t locked_to_room;
    uint8_t clear_gate_room;
    uint8_t clear_gate_to_room;
    uint16_t trial_mask;
    const EmberDungeonRoom *rooms;
} EmberDungeonDef;

const EmberDungeonDef *ember_dungeon_get(EmberDungeonId id);
const EmberDungeonRoom *ember_dungeon_room(EmberDungeonId id, uint8_t room_index);
int ember_dungeon_neighbor(EmberDungeonId id, uint8_t room_index, int dx, int dy);
bool ember_dungeon_trial_room(EmberDungeonId id, uint8_t room_index);
bool ember_dungeon_trials_cleared(EmberDungeonId id, uint16_t cleared_mask);
const char *ember_reward_name(EmberReward reward);
const char *ember_boss_name(EmberBoss boss);
const char *ember_miniboss_name(EmberMiniboss miniboss);

#endif
