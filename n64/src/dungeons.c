#include "dungeons.h"
#include <stddef.h>

#define RF_ENTRY EMBER_ROOM_ENTRY
#define RF_BOSS EMBER_ROOM_BOSS
#define RF_MINI EMBER_ROOM_MINIBOSS
#define RF_MAP EMBER_ROOM_MAP_CHEST
#define RF_COMPASS EMBER_ROOM_COMPASS
#define RF_SUPPLY EMBER_ROOM_SUPPLY
#define RF_TRIAL EMBER_ROOM_TRIAL
#define RF_CLEAR EMBER_ROOM_CLEAR_GATE

#define ROOM(i,x,y,f,r,m,n) { (i), (x), (y), (f), (r), (m), (n) }

static const EmberDungeonRoom gate_rooms[] = {
    ROOM(0,1,3,RF_ENTRY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ancient Gate - Entry Hall"),
    ROOM(1,1,2,RF_MAP,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ancient Gate - North Hall"),
    ROOM(2,2,2,RF_MINI|RF_SUPPLY,EMBER_REWARD_GUARDIAN_RING,EMBER_MINIBOSS_STONE_SENTINEL,"Ancient Gate - Broken Gallery"),
    ROOM(3,2,3,RF_COMPASS,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ancient Gate - Sentinel Walk"),
    ROOM(4,3,3,RF_BOSS,EMBER_REWARD_SHARD,EMBER_MINIBOSS_NONE,"Ancient Gate - Relic Vault")
};

static const EmberDungeonRoom tide_rooms[] = {
    ROOM(0,1,4,RF_ENTRY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Sunken Archive - Flooded Entry"),
    ROOM(1,1,3,RF_MAP,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Sunken Archive - Silt Hall"),
    ROOM(2,2,3,RF_SUPPLY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Sunken Archive - Broken Stacks"),
    ROOM(3,2,2,RF_MINI,EMBER_REWARD_TIDE_OUTFIT,EMBER_MINIBOSS_TIDE_GUARDIAN,"Sunken Archive - Tide Gallery"),
    ROOM(4,1,2,RF_COMPASS,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Sunken Archive - Drowned Court"),
    ROOM(5,1,1,RF_BOSS,EMBER_REWARD_PEARL_EDGE,EMBER_MINIBOSS_NONE,"Sunken Archive - Pearl Vault")
};

#define DUNGEON12_ROOMS(title,main_reward,side_reward,mini_type) { \
    ROOM(0,1,3,RF_ENTRY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Entry"), \
    ROOM(1,0,3,RF_MAP,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Lower West"), \
    ROOM(2,2,3,RF_TRIAL,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Lower East"), \
    ROOM(3,1,2,0,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Cross Hall"), \
    ROOM(4,0,2,RF_COMPASS|RF_TRIAL,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - West Vault"), \
    ROOM(5,2,2,0,EMBER_REWARD_SMALL_KEY,EMBER_MINIBOSS_NONE,title " - East Vault"), \
    ROOM(6,1,1,RF_MINI,main_reward,mini_type,title " - Inner Court"), \
    ROOM(7,0,1,RF_SUPPLY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Rune Hall"), \
    ROOM(8,2,1,RF_TRIAL,side_reward,EMBER_MINIBOSS_NONE,title " - Treasure Hall"), \
    ROOM(9,1,0,RF_CLEAR,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Upper Hall"), \
    ROOM(10,0,0,0,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,title " - Sanctum"), \
    ROOM(11,2,0,RF_BOSS,EMBER_REWARD_SHARD,EMBER_MINIBOSS_NONE,title " - Boss Chamber") \
}

static const EmberDungeonRoom verdant_rooms[] = DUNGEON12_ROOMS(
    "Verdant Labyrinth", EMBER_REWARD_SUN_BOW, EMBER_REWARD_VERDANT_RING, EMBER_MINIBOSS_BRIAR_GOLEM);
static const EmberDungeonRoom crystal_rooms[] = DUNGEON12_ROOMS(
    "Crystal Mines", EMBER_REWARD_MASTER_KEY, EMBER_REWARD_NONE, EMBER_MINIBOSS_PRISM_KNIGHT);
static const EmberDungeonRoom storm_rooms[] = DUNGEON12_ROOMS(
    "Storm Bastion", EMBER_REWARD_STORM_BOOTS, EMBER_REWARD_MIRROR_SHIELD, EMBER_MINIBOSS_TEMPEST_DJINN);
static const EmberDungeonRoom cinder_rooms[] = DUNGEON12_ROOMS(
    "Cinder Forge", EMBER_REWARD_EMBER_ROD, EMBER_REWARD_EMBER_OUTFIT, EMBER_MINIBOSS_MAGMA_BEAST);
static const EmberDungeonRoom moon_rooms[] = DUNGEON12_ROOMS(
    "Moon Barrow", EMBER_REWARD_MOON_RING, EMBER_REWARD_SHADOW_OUTFIT, EMBER_MINIBOSS_DUSK_STALKER);

static const EmberDungeonRoom citadel_rooms[] = {
    ROOM(0,1,3,RF_ENTRY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - Ashen Threshold"),
    ROOM(1,1,2,RF_MAP,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - Ember Hall"),
    ROOM(2,0,2,RF_TRIAL,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - West Furnace"),
    ROOM(3,2,2,RF_TRIAL|RF_SUPPLY,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - East Furnace"),
    ROOM(4,0,1,RF_COMPASS,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - Crown Gallery"),
    ROOM(5,1,1,RF_MINI,EMBER_REWARD_MAGIC_VESSEL,EMBER_MINIBOSS_CROWN_WARDEN,"Ember Citadel - Heart Chamber"),
    ROOM(6,2,1,RF_TRIAL|RF_CLEAR,EMBER_REWARD_NONE,EMBER_MINIBOSS_NONE,"Ember Citadel - Royal Seal"),
    ROOM(7,1,0,RF_BOSS,EMBER_REWARD_RELIC,EMBER_MINIBOSS_NONE,"Ember Citadel - Relic Sanctum")
};

#define TRIAL_12 ((uint16_t)((1u<<2)|(1u<<4)|(1u<<8)))
#define TRIAL_CITADEL ((uint16_t)((1u<<2)|(1u<<3)|(1u<<6)))

static const EmberDungeonDef dungeons[EMBER_DUNGEON_COUNT] = {
    {
        .id=EMBER_DUNGEON_GATE,.key="gate",.name="Ancient Gate",.theme="ruin",
        .entrance_screen=66,.entrance_x=8,.entrance_y=2,.entry_method=EMBER_ENTRY_KEY,
        .room_count=5,.boss_room=4,.boss=EMBER_BOSS_WARDEN,.boss_hp=0,
        .locked_from_room=EMBER_ROOM_NONE,.locked_to_room=EMBER_ROOM_NONE,
        .clear_gate_room=EMBER_ROOM_NONE,.clear_gate_to_room=EMBER_ROOM_NONE,
        .trial_mask=0,.rooms=gate_rooms
    },
    {
        .id=EMBER_DUNGEON_TIDE,.key="tide",.name="Sunken Archive",.theme="tide",
        .entrance_screen=46,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,
        .room_count=6,.boss_room=5,.boss=EMBER_BOSS_WARDEN,.boss_hp=0,
        .locked_from_room=EMBER_ROOM_NONE,.locked_to_room=EMBER_ROOM_NONE,
        .clear_gate_room=EMBER_ROOM_NONE,.clear_gate_to_room=EMBER_ROOM_NONE,
        .trial_mask=0,.rooms=tide_rooms
    },
    {
        .id=EMBER_DUNGEON_VERDANT,.key="verdant",.name="Verdant Labyrinth",.theme="verdant",
        .entrance_screen=27,.entrance_x=8,.entrance_y=3,.entry_method=EMBER_ENTRY_OPEN,
        .room_count=12,.boss_room=11,.boss=EMBER_BOSS_ROOT_LORD,.boss_hp=16,
        .locked_from_room=6,.locked_to_room=9,.clear_gate_room=9,.clear_gate_to_room=11,
        .trial_mask=TRIAL_12,.rooms=verdant_rooms
    },
    {
        .id=EMBER_DUNGEON_CRYSTAL,.key="crystal",.name="Crystal Mines",.theme="crystal",
        .entrance_screen=11,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,
        .room_count=12,.boss_room=11,.boss=EMBER_BOSS_CRYSTAL_MAW,.boss_hp=18,
        .locked_from_room=6,.locked_to_room=9,.clear_gate_room=9,.clear_gate_to_room=11,
        .trial_mask=TRIAL_12,.rooms=crystal_rooms
    },
    {
        .id=EMBER_DUNGEON_STORM,.key="storm",.name="Storm Bastion",.theme="storm",
        .entrance_screen=4,.entrance_x=8,.entrance_y=3,.entry_method=EMBER_ENTRY_KEY,
        .room_count=12,.boss_room=11,.boss=EMBER_BOSS_STORM_EYE,.boss_hp=16,
        .locked_from_room=6,.locked_to_room=9,.clear_gate_room=9,.clear_gate_to_room=11,
        .trial_mask=TRIAL_12,.rooms=storm_rooms
    },
    {
        .id=EMBER_DUNGEON_CINDER,.key="cinder",.name="Cinder Forge",.theme="cinder",
        .entrance_screen=18,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,
        .room_count=12,.boss_room=11,.boss=EMBER_BOSS_FORGE_LORD,.boss_hp=20,
        .locked_from_room=6,.locked_to_room=9,.clear_gate_room=9,.clear_gate_to_room=11,
        .trial_mask=TRIAL_12,.rooms=cinder_rooms
    },
    {
        .id=EMBER_DUNGEON_MOON,.key="moon",.name="Moon Barrow",.theme="moon",
        .entrance_screen=97,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_PUSH,
        .room_count=12,.boss_room=11,.boss=EMBER_BOSS_MOON_KNIGHT,.boss_hp=18,
        .locked_from_room=6,.locked_to_room=9,.clear_gate_room=9,.clear_gate_to_room=11,
        .trial_mask=TRIAL_12,.rooms=moon_rooms
    },
    {
        .id=EMBER_DUNGEON_CITADEL,.key="citadel",.name="Ember Citadel",.theme="citadel",
        .entrance_screen=9,.entrance_x=8,.entrance_y=2,.entry_method=EMBER_ENTRY_SHARDS,
        .room_count=8,.boss_room=7,.boss=EMBER_BOSS_EMBER_SOVEREIGN,.boss_hp=32,
        .locked_from_room=EMBER_ROOM_NONE,.locked_to_room=EMBER_ROOM_NONE,
        .clear_gate_room=6,.clear_gate_to_room=7,
        .trial_mask=TRIAL_CITADEL,.rooms=citadel_rooms
    }
};

_Static_assert(5 + 6 + 12 + 12 + 12 + 12 + 12 + 8 == EMBER_DUNGEON_ROOM_COUNT,
    "Native dungeon room count must stay aligned with the 79-room browser design");

const EmberDungeonDef *ember_dungeon_get(EmberDungeonId id) {
    return (unsigned)id < EMBER_DUNGEON_COUNT ? &dungeons[id] : NULL;
}

const EmberDungeonRoom *ember_dungeon_room(EmberDungeonId id, uint8_t room_index) {
    const EmberDungeonDef *d=ember_dungeon_get(id);
    return d && room_index<d->room_count ? &d->rooms[room_index] : NULL;
}

int ember_dungeon_neighbor(EmberDungeonId id, uint8_t room_index, int dx, int dy) {
    const EmberDungeonDef *d=ember_dungeon_get(id);
    const EmberDungeonRoom *r=ember_dungeon_room(id,room_index);
    if(!d || !r || (dx==0 && dy==0) || (dx!=0 && dy!=0)) return -1;
    int tx=r->map_x+dx, ty=r->map_y+dy;
    for(uint8_t i=0;i<d->room_count;i++)
        if(d->rooms[i].map_x==tx && d->rooms[i].map_y==ty) return i;
    return -1;
}

bool ember_dungeon_trial_room(EmberDungeonId id, uint8_t room_index) {
    const EmberDungeonDef *d=ember_dungeon_get(id);
    return d && room_index<16 && (d->trial_mask & (uint16_t)(1u<<room_index)) != 0;
}

bool ember_dungeon_trials_cleared(EmberDungeonId id, uint16_t cleared_mask) {
    const EmberDungeonDef *d=ember_dungeon_get(id);
    return d && (cleared_mask & d->trial_mask) == d->trial_mask;
}

const char *ember_reward_name(EmberReward reward) {
    static const char *const names[] = {
        "","Ember Shard","Small Key","Sun Bow","Verdant Ring","Master Key",
        "Storm Boots","Mirror Shield","Ember Rod","Ember Outfit","Moon Ring",
        "Shadow Outfit","Guardian Ring","Tide Outfit","Pearl Edge","Magic Vessel","Ember Relic"
    };
    return (unsigned)reward < (sizeof(names)/sizeof(names[0])) ? names[reward] : "";
}

const char *ember_boss_name(EmberBoss boss) {
    static const char *const names[] = {
        "","Warden","Root Lord","Crystal Maw","Storm Eye","Forge Lord","Moon Knight","Ember Sovereign"
    };
    return (unsigned)boss < (sizeof(names)/sizeof(names[0])) ? names[boss] : "";
}

const char *ember_miniboss_name(EmberMiniboss miniboss) {
    static const char *const names[] = {
        "","Stone Sentinel","Tide Guardian","Briar Golem","Prism Knight",
        "Tempest Djinn","Magma Beast","Dusk Stalker","Crown Warden"
    };
    return (unsigned)miniboss < (sizeof(names)/sizeof(names[0])) ? names[miniboss] : "";
}
