#include "scene_data.h"
#include <math.h>

static uint32_t mix32(uint32_t x) {
    x += 0x9E3779B9u;
    x ^= x >> 16;
    x *= 0x21F0AAADu;
    x ^= x >> 15;
    x *= 0x735A2D97u;
    return x ^ (x >> 15);
}

static float signed_range(uint32_t seed, float range) {
    uint32_t v=mix32(seed);
    float t=(float)(v&0xFFFFu)/65535.0f;
    return (t*2.0f-1.0f)*range;
}

static void push_prop(EmberSceneProp *out,int cap,int *count,EmberScenePropType type,
                      float x,float z,float sx,float sy,float sz,float yaw) {
    if(!out||!count||*count>=cap) return;
    out[*count]=(EmberSceneProp){type,x,z,sx,sy,sz,yaw};
    (*count)++;
}

static void add_ring(uint8_t screen, EmberSceneProp *out,int cap,int *count,
                     EmberScenePropType type,int n,float radius,float size) {
    for(int i=0;i<n;i++) {
        uint32_t seed=(uint32_t)screen*131u+(uint32_t)i*977u+17u;
        float a=(float)i*(6.28318530718f/(float)n)+signed_range(seed,.18f);
        float r=radius+signed_range(seed^0x514u,7.0f);
        float x=sinf(a)*r;
        float z=cosf(a)*r;
        float s=size*(.78f+(float)(mix32(seed^0xA17u)&255u)/640.0f);
        push_prop(out,cap,count,type,x,z,s,s,s,(float)(mix32(seed)&1023u)*.0061359f);
    }
}

int ember_scene_overworld_props(uint8_t screen_id, EmberSceneProp *out, int capacity) {
    if(!out||capacity<=0) return 0;
    EmberScreenInfo info;
    ember_world_get(screen_id,&info);
    int count=0;

    switch(info.biome) {
        case EMBER_BIOME_FOREST:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_TREE,12,63.0f,1.05f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_STUMP,4,40.0f,.8f);
            break;
        case EMBER_BIOME_RIDGE:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_ROCK,12,58.0f,1.25f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_PILLAR,3,42.0f,.8f);
            break;
        case EMBER_BIOME_MARSH:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_REED,14,58.0f,.8f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_ROCK,4,43.0f,.65f);
            break;
        case EMBER_BIOME_SHADOW:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_GRAVE,10,57.0f,.9f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_STUMP,4,41.0f,.75f);
            break;
        case EMBER_BIOME_RUIN:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_RUIN,9,58.0f,1.0f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_PILLAR,5,40.0f,.9f);
            break;
        case EMBER_BIOME_ASH:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_STUMP,9,58.0f,1.0f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_ROCK,7,42.0f,1.1f);
            break;
        case EMBER_BIOME_HIGHLAND:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_ROCK,9,61.0f,1.1f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_TREE,5,48.0f,.8f);
            break;
        default:
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_TREE,7,61.0f,.9f);
            add_ring(screen_id,out,capacity,&count,EMBER_PROP_ROCK,4,43.0f,.8f);
            break;
    }

    if(screen_id==43) {
        push_prop(out,capacity,&count,EMBER_PROP_HOUSE,-34,-35,1.0f,1.0f,1.0f,.12f);
        push_prop(out,capacity,&count,EMBER_PROP_HOUSE, 34,-35,1.0f,1.0f,1.0f,-.10f);
        push_prop(out,capacity,&count,EMBER_PROP_WELL,0,8,1.0f,1.0f,1.0f,0);
    }
    if(screen_id==66 || screen_id==9 || screen_id==27 || screen_id==11 ||
       screen_id==4 || screen_id==18 || screen_id==97) {
        push_prop(out,capacity,&count,EMBER_PROP_GATE,0,-67,1.0f,1.0f,1.0f,0);
    }
    if(screen_id==46) {
        push_prop(out,capacity,&count,EMBER_PROP_GATE,0,62,.85f,.75f,.85f,3.14159265f);
    }
    return count;
}

void ember_scene_sky_rgba(EmberBiome biome, uint8_t rgba[4]) {
    if(!rgba) return;
    static const uint8_t skies[8][4]={
        {91,128,145,255}, /* field */
        {118,132,142,255},/* ridge */
        {83,112,119,255}, /* marsh */
        {55,57,78,255},   /* shadow */
        {120,103,91,255}, /* ruin */
        {72,111,105,255}, /* forest */
        {114,78,69,255},  /* ash */
        {120,150,164,255} /* highland */
    };
    unsigned i=(unsigned)biome<8?(unsigned)biome:0;
    for(int c=0;c<4;c++) rgba[c]=skies[i][c];
}
