#include <libdragon.h>
#include <stdarg.h>
#include "world.h"
#include "game_state.h"
#include "dungeons.h"
#include "interiors.h"

/*
 * Runtime bridge for the existing tested first-milestone arena.
 * main.c remains intact and authoritative for movement/combat/rendering.  We
 * intercept only two external calls made by that file so the native long-form
 * world can be introduced without rewriting the working controller/camera code.
 */
static void ember_runtime_joypad_poll(void);
static rdpq_textmetrics_t ember_runtime_text_printf(
    const rdpq_textparms_t *parms, uint8_t font_id, float x0, float y0,
    const char *fmt, ...);

#define joypad_poll ember_runtime_joypad_poll
#define rdpq_text_printf ember_runtime_text_printf
#include "main.c"
#undef rdpq_text_printf
#undef joypad_poll

static EmberGameState runtime_state;
static EmberScreenInfo runtime_screen;
static bool runtime_ready=false;
static int runtime_transition_cooldown=0;
static float runtime_prev_x=0.0f;
static float runtime_prev_z=0.0f;

static const EmberDungeonDef *runtime_dungeon_at_screen(uint8_t screen_id) {
    for(int i=0;i<EMBER_DUNGEON_COUNT;i++) {
        const EmberDungeonDef *d=ember_dungeon_get((EmberDungeonId)i);
        if(d && d->entrance_screen==screen_id) return d;
    }
    return NULL;
}

static const char *runtime_entry_method_name(EmberEntryMethod method) {
    switch(method) {
        case EMBER_ENTRY_KEY:return "KEY";
        case EMBER_ENTRY_BOMB:return "BOMB";
        case EMBER_ENTRY_PUSH:return "PUSH";
        case EMBER_ENTRY_SHARDS:return "8 SHARDS";
        default:return "OPEN";
    }
}

static void runtime_spawn_screen_enemy(void) {
    if(runtime_state.screen_id==43) {
        enemy=(Enemy){.x=0,.z=-30,.yaw=0,.hp=0,.state=EN_DEAD,.timer=0,.strafe_dir=1};
        locked_target=false;
        return;
    }

    if(runtime_state.screen_id==EMBER_START_SCREEN) {
        enemy=(Enemy){.x=0,.z=-30,.yaw=0,.hp=8,.state=EN_IDLE,.timer=.5f,.strafe_dir=1};
        return;
    }

    int seed=runtime_state.screen_id;
    float ex=(float)(((seed*37)%75)-37);
    float ez=(float)(((seed*53)%70)-35);
    if(ex>-16.0f && ex<16.0f) ex += ex<0?-22.0f:22.0f;
    if(ez>-16.0f && ez<16.0f) ez += ez<0?-22.0f:22.0f;
    enemy=(Enemy){
        .x=ex,.z=ez,.yaw=0,.hp=8,.state=EN_IDLE,.timer=.5f,
        .strafe_dir=(seed&1)?1:-1
    };
    locked_target=false;
}

static void runtime_load_screen(uint8_t screen_id, int dx, int dy) {
    ember_state_enter_screen(&runtime_state,screen_id);
    ember_world_get(runtime_state.screen_id,&runtime_screen);

    if(dx<0) player.x=80.0f;
    else if(dx>0) player.x=-80.0f;
    if(dy<0) player.z=84.0f;
    else if(dy>0) player.z=-84.0f;

    player.speed=0.0f;
    player.action=ACT_FREE;
    player.action_t=0.0f;
    player.queued_attack=false;
    runtime_transition_cooldown=12;
    runtime_prev_x=player.x;
    runtime_prev_z=player.z;
    runtime_spawn_screen_enemy();
}

static void runtime_respawn(void) {
    runtime_state.hp=runtime_state.max_hp;
    ember_state_enter_screen(&runtime_state,EMBER_START_SCREEN);
    ember_world_get(runtime_state.screen_id,&runtime_screen);
    player.x=0.0f;
    player.z=32.0f;
    player.yaw=3.14159265f;
    player.speed=0.0f;
    player.hp=runtime_state.hp;
    player.action=ACT_FREE;
    player.action_t=0.0f;
    player.invuln=1.0f;
    player.queued_attack=false;
    locked_target=false;
    runtime_transition_cooldown=20;
    runtime_prev_x=player.x;
    runtime_prev_z=player.z;
    runtime_spawn_screen_enemy();
}

static void runtime_init(void) {
    ember_state_new_game(&runtime_state);
    ember_world_get(runtime_state.screen_id,&runtime_screen);
    player.hp=runtime_state.hp;
    runtime_prev_x=player.x;
    runtime_prev_z=player.z;
    runtime_ready=true;
}

static void ember_runtime_joypad_poll(void) {
    /* Call libdragon's real poll first; the macro is undefined at this point. */
    joypad_poll();

    if(!runtime_ready) runtime_init();

    if(player.hp<=0.0f) {
        runtime_respawn();
        return;
    }

    int hp=(int)(player.hp+0.01f);
    if(hp<0) hp=0;
    if(hp>runtime_state.max_hp) hp=runtime_state.max_hp;
    runtime_state.hp=(uint8_t)hp;

    float moved_x=player.x-runtime_prev_x;
    float moved_z=player.z-runtime_prev_z;

    if(runtime_transition_cooldown>0) {
        runtime_transition_cooldown--;
    } else if(player.action==ACT_FREE) {
        int dx=0,dy=0;
        if(player.x<=-83.5f && moved_x<-.02f) dx=-1;
        else if(player.x>=83.5f && moved_x>.02f) dx=1;
        else if(player.z<=-87.5f && moved_z<-.02f) dy=-1;
        else if(player.z>=87.5f && moved_z>.02f) dy=1;

        if(dx||dy) {
            int next=ember_world_neighbor(runtime_state.screen_id,dx,dy);
            if(next>=0) {
                runtime_load_screen((uint8_t)next,dx,dy);
                return;
            }
        }
    }

    runtime_prev_x=player.x;
    runtime_prev_z=player.z;
}

static rdpq_textmetrics_t ember_runtime_text_printf(
    const rdpq_textparms_t *parms, uint8_t font_id, float x0, float y0,
    const char *fmt, ...)
{
    va_list args;
    va_start(args,fmt);
    rdpq_textmetrics_t result=rdpq_text_vprintf(parms,font_id,x0,y0,fmt,args);
    va_end(args);

    if(runtime_ready && y0<=13.0f) {
        rdpq_text_printf(NULL,font_id,8,22,"%02u  %s  [%s]",
            runtime_state.screen_id,runtime_screen.title,
            ember_world_biome_name(runtime_screen.biome));

        const EmberDungeonDef *d=runtime_dungeon_at_screen(runtime_state.screen_id);
        const EmberInteriorDef *inside=ember_interior_at_screen(runtime_state.screen_id,false);
        if(d) {
            rdpq_text_printf(NULL,font_id,8,32,"%s  entrance: %s",
                d->name,runtime_entry_method_name(d->entry_method));
        } else if(inside) {
            rdpq_text_printf(NULL,font_id,8,32,"%s  entrance: %s",
                inside->name,runtime_entry_method_name(inside->entry_method));
        } else if(runtime_screen.landmark!=EMBER_LANDMARK_NONE) {
            rdpq_text_printf(NULL,font_id,8,32,"Landmark: %s",
                ember_world_landmark_name(runtime_screen.landmark));
        }
    }
    return result;
}
