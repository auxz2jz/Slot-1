#ifndef EMBERWOOD_WORLD_H
#define EMBERWOOD_WORLD_H

#include <stdint.h>
#include <stdbool.h>

#define EMBER_WORLD_W 10
#define EMBER_WORLD_H 10
#define EMBER_WORLD_COUNT 100
#define EMBER_START_SCREEN 54

typedef enum {
    EMBER_BIOME_FIELD,
    EMBER_BIOME_RIDGE,
    EMBER_BIOME_MARSH,
    EMBER_BIOME_SHADOW,
    EMBER_BIOME_RUIN,
    EMBER_BIOME_FOREST,
    EMBER_BIOME_ASH,
    EMBER_BIOME_HIGHLAND
} EmberBiome;

typedef enum {
    EMBER_LANDMARK_NONE,
    EMBER_LANDMARK_SHRINE,
    EMBER_LANDMARK_CACHE,
    EMBER_LANDMARK_SHOP,
    EMBER_LANDMARK_HEART,
    EMBER_LANDMARK_CAVE,
    EMBER_LANDMARK_STAIRS,
    EMBER_LANDMARK_KEY,
    EMBER_LANDMARK_GATE,
    EMBER_LANDMARK_BOMB_BAG,
    EMBER_LANDMARK_BARROW,
    EMBER_LANDMARK_WIND_DISC,
    EMBER_LANDMARK_SUNKEN_ARCHIVE,
    EMBER_LANDMARK_VILLAGE
} EmberLandmark;

typedef struct {
    uint8_t id;
    uint8_t x;
    uint8_t y;
    EmberBiome biome;
    EmberLandmark landmark;
    const char *title;
} EmberScreenInfo;

void ember_world_get(uint8_t id, EmberScreenInfo *out);
int ember_world_neighbor(uint8_t id, int dx, int dy);
bool ember_world_is_road_link(uint8_t a, uint8_t b);
const char *ember_world_biome_name(EmberBiome biome);
const char *ember_world_landmark_name(EmberLandmark landmark);

#endif
