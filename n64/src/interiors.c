#include "interiors.h"
#include <stddef.h>

#define E0 EMBER_INTERIOR_ENEMY_NONE
#define EW EMBER_INTERIOR_ENEMY_WALKER
#define EH EMBER_INTERIOR_ENEMY_HOPPER
#define ES EMBER_INTERIOR_ENEMY_SHRUB
#define EB EMBER_INTERIOR_ENEMY_BAT
#define EK EMBER_INTERIOR_ENEMY_KNIGHT
#define EV EMBER_INTERIOR_ENEMY_WARDEN

static const EmberInteriorDef interiors[EMBER_INTERIOR_COUNT] = {
    {
        .id=EMBER_INTERIOR_GROTTO,.key="grotto",.name="Buried Grotto",
        .entrance_screen=55,.entrance_x=3,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,.entrance_kind="cave",
        .return_screen=55,.return_x=48,.return_y=176,.enemy_count=3,.enemies={EB,EW,EH,E0},
        .reward=EMBER_INTERIOR_REWARD_SHARD,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_LOWER_RUINS,.key="lower",.name="Lower Ruins",
        .entrance_screen=56,.entrance_x=11,.entrance_y=10,.entry_method=EMBER_ENTRY_PUSH,.entrance_kind="stairs",
        .return_screen=56,.return_x=176,.return_y=192,.enemy_count=3,.enemies={EK,ES,EW,E0},
        .reward=EMBER_INTERIOR_REWARD_SHARD,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_SHOP,.key="shop",.name="Mira's Supply Cave",
        .entrance_screen=22,.entrance_x=8,.entrance_y=4,.entry_method=EMBER_ENTRY_OPEN,.entrance_kind="shop",
        .return_screen=22,.return_x=128,.return_y=96,.enemy_count=0,.enemies={E0,E0,E0,E0},
        .reward=EMBER_INTERIOR_REWARD_NONE,.shop=true,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_LEGACY_SHRINE,.key="shrine",.name="Ember Shrine",
        .entrance_screen=9,.entrance_x=8,.entrance_y=2,.entry_method=EMBER_ENTRY_SHARDS,.entrance_kind="door",
        .return_screen=9,.return_x=128,.return_y=64,.enemy_count=1,.enemies={EV,E0,E0,E0},
        .reward=EMBER_INTERIOR_REWARD_RELIC,.shop=false,.legacy_inactive=true
    },
    {
        .id=EMBER_INTERIOR_CACHE,.key="cache",.name="Whispering Cache",
        .entrance_screen=12,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,.entrance_kind="cave",
        .return_screen=12,.return_x=128,.return_y=176,.enemy_count=2,.enemies={EW,EH,E0,E0},
        .reward=EMBER_INTERIOR_REWARD_RUPEES_20,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_HEART_CAVE,.key="heartCave",.name="Mossheart Chamber",
        .entrance_screen=31,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_PUSH,.entrance_kind="stairs",
        .return_screen=31,.return_x=128,.return_y=176,.enemy_count=3,.enemies={ES,EW,EH,E0},
        .reward=EMBER_INTERIOR_REWARD_HEART_CONTAINER,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_BOMB_VAULT,.key="bombVault",.name="Cinder Powder Vault",
        .entrance_screen=73,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,.entrance_kind="cave",
        .return_screen=73,.return_x=128,.return_y=176,.enemy_count=3,.enemies={EW,EW,EH,E0},
        .reward=EMBER_INTERIOR_REWARD_BOMB_BAG,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_BARROW,.key="barrow",.name="Old Barrow Treasury",
        .entrance_screen=88,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_PUSH,.entrance_kind="stairs",
        .return_screen=88,.return_x=128,.return_y=176,.enemy_count=4,.enemies={EW,ES,EW,EH},
        .reward=EMBER_INTERIOR_REWARD_RUPEES_50,.shop=false,.legacy_inactive=false
    },
    {
        .id=EMBER_INTERIOR_WIND_CAVE,.key="windCave",.name="Reedwind Hollow",
        .entrance_screen=40,.entrance_x=8,.entrance_y=10,.entry_method=EMBER_ENTRY_BOMB,.entrance_kind="cave",
        .return_screen=40,.return_x=128,.return_y=176,.enemy_count=3,.enemies={ES,EH,EW,E0},
        .reward=EMBER_INTERIOR_REWARD_WIND_DISC,.shop=false,.legacy_inactive=false
    }
};

_Static_assert(sizeof(interiors)/sizeof(interiors[0]) == EMBER_INTERIOR_COUNT,
    "Native non-dungeon interior count must stay aligned with the browser design");

const EmberInteriorDef *ember_interior_get(EmberInteriorId id) {
    return (unsigned)id<EMBER_INTERIOR_COUNT ? &interiors[id] : NULL;
}

const EmberInteriorDef *ember_interior_at_screen(uint8_t screen_id, bool include_legacy) {
    for(unsigned i=0;i<EMBER_INTERIOR_COUNT;i++) {
        if(interiors[i].entrance_screen==screen_id && (include_legacy || !interiors[i].legacy_inactive))
            return &interiors[i];
    }
    return NULL;
}

const char *ember_interior_enemy_name(EmberInteriorEnemy enemy) {
    static const char *const names[]={"","Walker","Hopper","Shrub","Bat","Knight","Warden"};
    return (unsigned)enemy<sizeof(names)/sizeof(names[0]) ? names[enemy] : "";
}

const char *ember_interior_reward_name(EmberInteriorReward reward) {
    static const char *const names[]={"","Ember Shard","Ember Relic","20 Rupees","Heart Vessel","Bomb Bag","50 Rupees","Wind Disc"};
    return (unsigned)reward<sizeof(names)/sizeof(names[0]) ? names[reward] : "";
}
