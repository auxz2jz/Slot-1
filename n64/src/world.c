#include "world.h"
#include <stddef.h>

static const char *const field_names[] = {"Greenfield","Windgrass","Fern Hollow","Sunmeadow","Foxglade","Clover Reach"};
static const char *const ridge_names[] = {"Stonecrest","High Ridge","Boulder Run","Graypass","Iron Hills"};
static const char *const marsh_names[] = {"Lakeward","Reedwater","Misty Shore","Blue Marsh","Riverbend"};
static const char *const shadow_names[] = {"Duskmere","Gravefen","Ash Hollow","Nightfield","Old Barrows"};
static const char *const ruin_names[] = {"Broken Court","Amber Ruins","Lost Rampart","Old Keep","Shattered Way"};
static const char *const forest_names[] = {"Pineveil","Mosswood","Cedar Reach","Deepgrove","Owlwood"};
static const char *const ash_names[] = {"Cinder Plain","Charred Reach","Ember Scar","Blackglass"};
static const char *const highland_names[] = {"Northwind","Sky Meadow","Cloudstep","Frostgrass"};

typedef struct { uint8_t a, b; } RoadEdge;
static const RoadEdge roads[] = {
    {54,44},{44,34},{34,24},{24,23},{23,22},
    {54,55},{55,56},{56,66},
    {66,56},{56,46},{46,36},{36,26},{26,16},{16,6},{6,7},{7,8},{8,9},
    {54,64},{64,74},{74,73},
    {74,84},{84,85},{85,86},{86,87},{87,88},
    {54,53},{53,52},{52,42},{42,32},{32,31},
    {52,51},{51,50},{50,40},
    {34,24},{24,14},{14,13},{13,12},
    {53,43},{43,44},{43,33}
};

static EmberBiome biome_for(uint8_t id) {
    int x=id%10, y=id/10;
    if(y<=1) return x<3?EMBER_BIOME_RIDGE:(x>6?EMBER_BIOME_ASH:EMBER_BIOME_HIGHLAND);
    if(x<=1) return EMBER_BIOME_MARSH;
    if(x>=8 && y>=5) return EMBER_BIOME_RUIN;
    if(y>=8) return EMBER_BIOME_SHADOW;
    if(x>=6 && y<=4) return EMBER_BIOME_FOREST;
    if(((x*3+y*5)%11)<2) return EMBER_BIOME_RIDGE;
    return EMBER_BIOME_FIELD;
}

static const char *generated_title(uint8_t id, EmberBiome b) {
    int x=id%10, y=id/10, n=x*7+y*11;
    switch(b) {
        case EMBER_BIOME_RIDGE: return ridge_names[n%5];
        case EMBER_BIOME_MARSH: return marsh_names[n%5];
        case EMBER_BIOME_SHADOW:return shadow_names[n%5];
        case EMBER_BIOME_RUIN:  return ruin_names[n%5];
        case EMBER_BIOME_FOREST:return forest_names[n%5];
        case EMBER_BIOME_ASH:   return ash_names[n%4];
        case EMBER_BIOME_HIGHLAND:return highland_names[n%4];
        default:return field_names[n%6];
    }
}

static const char *special_title(uint8_t id) {
    switch(id) {
        case 9:return "Ember Shrine"; case 12:return "Whispering Bluff";
        case 22:return "Wayfarer Crossroads"; case 31:return "Mossy Hollow";
        case 40:return "Reedwind Bank"; case 43:return "Ember Hamlet";
        case 44:return "Whisper Ridge"; case 45:return "Pinewatch";
        case 46:return "Bluewater"; case 54:return "Ember Meadow";
        case 55:return "Old Stone Road"; case 56:return "Amber Ruins";
        case 64:return "South Grove"; case 65:return "Grave Path";
        case 66:return "Ancient Gate"; case 73:return "Cinder Hollow";
        case 88:return "Old Barrow Field";
        default:return NULL;
    }
}

static EmberLandmark landmark_for(uint8_t id) {
    switch(id) {
        case 9:return EMBER_LANDMARK_SHRINE; case 12:return EMBER_LANDMARK_CACHE;
        case 22:return EMBER_LANDMARK_SHOP; case 31:return EMBER_LANDMARK_HEART;
        case 40:return EMBER_LANDMARK_WIND_DISC; case 43:return EMBER_LANDMARK_VILLAGE;
        case 46:return EMBER_LANDMARK_SUNKEN_ARCHIVE; case 55:return EMBER_LANDMARK_CAVE;
        case 56:return EMBER_LANDMARK_STAIRS; case 65:return EMBER_LANDMARK_KEY;
        case 66:return EMBER_LANDMARK_GATE; case 73:return EMBER_LANDMARK_BOMB_BAG;
        case 88:return EMBER_LANDMARK_BARROW;
        default:return EMBER_LANDMARK_NONE;
    }
}

void ember_world_get(uint8_t id, EmberScreenInfo *out) {
    if(!out) return;
    if(id>=EMBER_WORLD_COUNT) id=EMBER_START_SCREEN;
    EmberBiome b=biome_for(id);
    const char *s=special_title(id);
    *out=(EmberScreenInfo){.id=id,.x=(uint8_t)(id%10),.y=(uint8_t)(id/10),.biome=b,.landmark=landmark_for(id),.title=s?s:generated_title(id,b)};
}

int ember_world_neighbor(uint8_t id, int dx, int dy) {
    int x=id%10, y=id/10, nx=x+dx, ny=y+dy;
    if(nx<0||nx>=10||ny<0||ny>=10) return -1;
    return ny*10+nx;
}

bool ember_world_is_road_link(uint8_t a, uint8_t b) {
    for(size_t i=0;i<sizeof(roads)/sizeof(roads[0]);i++)
        if((roads[i].a==a&&roads[i].b==b)||(roads[i].a==b&&roads[i].b==a)) return true;
    return false;
}

const char *ember_world_biome_name(EmberBiome b) {
    static const char *const names[]={"Field","Ridge","Marsh","Shadow","Ruin","Forest","Ash","Highland"};
    return (unsigned)b<8?names[b]:"Field";
}
const char *ember_world_landmark_name(EmberLandmark l) {
    static const char *const names[]={"","Shrine","Cache","Shop","Heart","Cave","Stairs","Key","Gate","Bomb Bag","Barrow","Wind Disc","Sunken Archive","Village"};
    return (unsigned)l<14?names[l]:"";
}
