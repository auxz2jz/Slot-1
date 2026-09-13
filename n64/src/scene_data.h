#ifndef EMBERWOOD_SCENE_DATA_H
#define EMBERWOOD_SCENE_DATA_H

#include <stdint.h>
#include "world.h"

#define EMBER_SCENE_MAX_PROPS 30

typedef enum {
    EMBER_PROP_TREE,
    EMBER_PROP_ROCK,
    EMBER_PROP_RUIN,
    EMBER_PROP_GRAVE,
    EMBER_PROP_REED,
    EMBER_PROP_STUMP,
    EMBER_PROP_HOUSE,
    EMBER_PROP_WELL,
    EMBER_PROP_GATE,
    EMBER_PROP_PILLAR
} EmberScenePropType;

typedef struct {
    EmberScenePropType type;
    float x;
    float z;
    float sx;
    float sy;
    float sz;
    float yaw;
} EmberSceneProp;

int ember_scene_overworld_props(uint8_t screen_id, EmberSceneProp *out, int capacity);
void ember_scene_sky_rgba(EmberBiome biome, uint8_t rgba[4]);

#endif
