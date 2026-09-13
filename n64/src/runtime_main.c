#include <libdragon.h>
#include <stdarg.h>
#include "world.h"
#include "game_state.h"
#include "dungeons.h"
#include "interiors.h"

/*
 * Runtime bridge for the existing tested first-milestone arena.
 * main.c remains intact and authoritative for movement/combat/rendering. We
 * intercept controller polling and HUD text so the long-form native world can
 * grow around that working controller/camera/combat implementation.
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

typedef enum {
    RUNTIME_OVERWORLD,
    RUNTIME_DUNGEON,
    RUNTIME_INTERIOR
} RuntimeLocation;

static EmberGameState runtime_state;
static EmberScreenInfo runtime_screen;
static RuntimeLocation runtime_location=RUNTIME_OVERWORLD;
static EmberDungeonId runtime_dungeon_id=EMBER_DUNGEON_GATE;
static EmberInteriorId runtime_interior_id=EMBER_INTERIOR_GROTTO;
static uint8_t runtime_room=0;
static uint16_t runtime_room_cleared[EMBER_DUNGEON_COUNT];
static uint16_t runtime_room_rewarded[EMBER_DUNGEON_COUNT];
static uint8_t runtime_key_gate_unlocked=0;
static uint16_t runtime_interior_cleared=0;
static uint16_t runtime_interior_rewarded=0;
static uint32_t runtime_world_cleared[(EMBER_WORLD_COUNT+31)/32];
static uint32_t runtime_world_rewarded[(EMBER_WORLD_COUNT+31)/32];
static bool runtime_ready=false;
static bool runtime_cup_latch=false;
static bool runtime_cdown_latch=false;
static int runtime_transition_cooldown=0;
static float runtime_prev_x=0.0f;
static float runtime_prev_z=0.0f;
static const char *runtime_notice="";
static int runtime_notice_frames=0;

static bool bit100_get(const uint32_t *bits,uint8_t id) {
    return (bits[id>>5]&(1u<<(id&31)))!=0;
}
static void bit100_set(uint32_t *bits,uint8_t id) {
    bits[id>>5]|=1u<<(id&31);
}
static void runtime_set_notice(const char *text,int frames) {
    runtime_notice=text?text:"";
    runtime_notice_frames=frames;
}

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

static int runtime_miniboss_hp(EmberMiniboss miniboss) {
    switch(miniboss) {
        case EMBER_MINIBOSS_STONE_SENTINEL:return 10;
        case EMBER_MINIBOSS_TIDE_GUARDIAN:return 11;
        case EMBER_MINIBOSS_BRIAR_GOLEM:return 10;
        case EMBER_MINIBOSS_PRISM_KNIGHT:return 11;
        case EMBER_MINIBOSS_TEMPEST_DJINN:return 11;
        case EMBER_MINIBOSS_MAGMA_BEAST:return 12;
        case EMBER_MINIBOSS_DUSK_STALKER:return 11;
        case EMBER_MINIBOSS_CROWN_WARDEN:return 13;
        default:return 0;
    }
}

static void runtime_spawn_overworld_enemy(void) {
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
    enemy=(Enemy){.x=ex,.z=ez,.yaw=0,.hp=8,.state=EN_IDLE,.timer=.5f,.strafe_dir=(seed&1)?1:-1};
    locked_target=false;
}

static void runtime_spawn_dungeon_enemy(void) {
    const EmberDungeonDef *d=ember_dungeon_get(runtime_dungeon_id);
    const EmberDungeonRoom *r=ember_dungeon_room(runtime_dungeon_id,runtime_room);
    if(!d||!r) return;
    uint16_t bit=(uint16_t)(1u<<runtime_room);
    if(runtime_room_cleared[runtime_dungeon_id]&bit) {
        enemy=(Enemy){.x=0,.z=-25,.yaw=0,.hp=0,.state=EN_DEAD,.timer=0,.strafe_dir=1};
        locked_target=false;
        return;
    }
    int hp=3+(runtime_room%3);
    if(r->flags&EMBER_ROOM_MINIBOSS) hp=runtime_miniboss_hp(r->miniboss);
    if(r->flags&EMBER_ROOM_BOSS) hp=d->boss_hp?d->boss_hp:8;
    enemy=(Enemy){.x=0,.z=-28,.yaw=0,.hp=hp,.state=EN_IDLE,.timer=.5f,.strafe_dir=(runtime_room&1)?1:-1};
    locked_target=false;
}

static void runtime_spawn_interior_enemy(void) {
    const EmberInteriorDef *in=ember_interior_get(runtime_interior_id);
    uint16_t bit=(uint16_t)(1u<<runtime_interior_id);
    if(!in || in->enemy_count==0 || (runtime_interior_cleared&bit)) {
        enemy=(Enemy){.x=0,.z=-25,.yaw=0,.hp=0,.state=EN_DEAD,.timer=0,.strafe_dir=1};
        locked_target=false;
        return;
    }
    int hp=3+in->enemy_count;
    if(in->enemies[0]==EMBER_INTERIOR_ENEMY_WARDEN) hp=8;
    enemy=(Enemy){.x=0,.z=-28,.yaw=0,.hp=hp,.state=EN_IDLE,.timer=.5f,.strafe_dir=1};
    locked_target=false;
}

static void runtime_spawn_location_enemy(void) {
    if(runtime_location==RUNTIME_DUNGEON) runtime_spawn_dungeon_enemy();
    else if(runtime_location==RUNTIME_INTERIOR) runtime_spawn_interior_enemy();
    else runtime_spawn_overworld_enemy();
}

static void runtime_apply_dungeon_reward(EmberReward reward) {
    switch(reward) {
        case EMBER_REWARD_SHARD: ember_state_gain_shard(&runtime_state); break;
        case EMBER_REWARD_SMALL_KEY: if(runtime_state.small_keys<9) runtime_state.small_keys++; break;
        case EMBER_REWARD_SUN_BOW: runtime_state.item_flags|=EMBER_ITEM_SUN_BOW; break;
        case EMBER_REWARD_VERDANT_RING: runtime_state.ring_flags|=EMBER_RING_VERDANT; break;
        case EMBER_REWARD_MASTER_KEY: runtime_state.item_flags|=EMBER_ITEM_MASTER_KEY; break;
        case EMBER_REWARD_STORM_BOOTS: runtime_state.item_flags|=EMBER_ITEM_STORM_BOOTS; break;
        case EMBER_REWARD_MIRROR_SHIELD: runtime_state.item_flags|=EMBER_ITEM_MIRROR_SHIELD; break;
        case EMBER_REWARD_EMBER_ROD: runtime_state.item_flags|=EMBER_ITEM_EMBER_ROD; break;
        case EMBER_REWARD_EMBER_OUTFIT: runtime_state.outfit_flags|=EMBER_OUTFIT_EMBER; break;
        case EMBER_REWARD_MOON_RING: runtime_state.ring_flags|=EMBER_RING_MOON; break;
        case EMBER_REWARD_SHADOW_OUTFIT: runtime_state.outfit_flags|=EMBER_OUTFIT_SHADOW; break;
        case EMBER_REWARD_GUARDIAN_RING: runtime_state.ring_flags|=EMBER_RING_GUARDIAN; break;
        case EMBER_REWARD_TIDE_OUTFIT: runtime_state.outfit_flags|=EMBER_OUTFIT_TIDE; break;
        case EMBER_REWARD_PEARL_EDGE: runtime_state.item_flags|=EMBER_ITEM_PEARL_EDGE; break;
        case EMBER_REWARD_MAGIC_VESSEL:
            if(runtime_state.max_magic<64) runtime_state.max_magic=(uint8_t)(runtime_state.max_magic+16);
            runtime_state.magic=runtime_state.max_magic;
            break;
        case EMBER_REWARD_RELIC: runtime_state.quest_flags|=0x80000000u; break;
        default: break;
    }
    if(runtime_state.hp>player.hp) player.hp=runtime_state.hp;
}

static void runtime_apply_interior_reward(EmberInteriorReward reward) {
    switch(reward) {
        case EMBER_INTERIOR_REWARD_SHARD: ember_state_gain_shard(&runtime_state); break;
        case EMBER_INTERIOR_REWARD_RUPEES_20:
            runtime_state.rupees=(uint16_t)(runtime_state.rupees+20); break;
        case EMBER_INTERIOR_REWARD_HEART_CONTAINER:
            if(runtime_state.max_hp<14) runtime_state.max_hp++;
            runtime_state.hp=runtime_state.max_hp; break;
        case EMBER_INTERIOR_REWARD_BOMB_BAG:
            runtime_state.item_flags|=EMBER_ITEM_BOMBS;
            runtime_state.bombs=(uint8_t)(runtime_state.bombs+4); break;
        case EMBER_INTERIOR_REWARD_RUPEES_50:
            runtime_state.rupees=(uint16_t)(runtime_state.rupees+50); break;
        case EMBER_INTERIOR_REWARD_WIND_DISC:
            runtime_state.item_flags|=EMBER_ITEM_WIND_DISC; break;
        case EMBER_INTERIOR_REWARD_RELIC:
            runtime_state.quest_flags|=0x80000000u; break;
        default: break;
    }
    if(runtime_state.hp>player.hp) player.hp=runtime_state.hp;
}

static void runtime_process_clear(void) {
    if(enemy.hp>0) return;
    if(runtime_location==RUNTIME_OVERWORLD) {
        uint8_t s=runtime_state.screen_id;
        if(!bit100_get(runtime_world_cleared,s)) {
            bit100_set(runtime_world_cleared,s);
            if(s==65 && !bit100_get(runtime_world_rewarded,s)) {
                bit100_set(runtime_world_rewarded,s);
                if(runtime_state.small_keys<9) runtime_state.small_keys++;
                runtime_set_notice("A small key appears - acquired!",120);
            }
        }
    } else if(runtime_location==RUNTIME_DUNGEON) {
        uint16_t bit=(uint16_t)(1u<<runtime_room);
        if(!(runtime_room_cleared[runtime_dungeon_id]&bit)) {
            runtime_room_cleared[runtime_dungeon_id]|=bit;
            const EmberDungeonRoom *r=ember_dungeon_room(runtime_dungeon_id,runtime_room);
            if(r && r->reward!=EMBER_REWARD_NONE && !(runtime_room_rewarded[runtime_dungeon_id]&bit)) {
                runtime_room_rewarded[runtime_dungeon_id]|=bit;
                runtime_apply_dungeon_reward(r->reward);
                runtime_set_notice(ember_reward_name(r->reward),120);
            }
        }
    } else {
        uint16_t bit=(uint16_t)(1u<<runtime_interior_id);
        if(!(runtime_interior_cleared&bit)) {
            runtime_interior_cleared|=bit;
            const EmberInteriorDef *in=ember_interior_get(runtime_interior_id);
            if(in && in->reward!=EMBER_INTERIOR_REWARD_NONE && !(runtime_interior_rewarded&bit)) {
                runtime_interior_rewarded|=bit;
                runtime_apply_interior_reward(in->reward);
                runtime_set_notice(ember_interior_reward_name(in->reward),120);
            }
        }
    }
}

static void runtime_place_after_transition(int dx,int dy) {
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
}

static void runtime_load_screen(uint8_t screen_id,int dx,int dy) {
    ember_state_enter_screen(&runtime_state,screen_id);
    ember_world_get(runtime_state.screen_id,&runtime_screen);
    runtime_location=RUNTIME_OVERWORLD;
    runtime_place_after_transition(dx,dy);
    runtime_spawn_overworld_enemy();
}

static void runtime_load_dungeon_room(uint8_t room,int dx,int dy) {
    runtime_room=room;
    runtime_place_after_transition(dx,dy);
    runtime_spawn_dungeon_enemy();
}

static bool runtime_pay_entry(EmberEntryMethod method) {
    if(method==EMBER_ENTRY_OPEN || method==EMBER_ENTRY_PUSH) return true;
    if(method==EMBER_ENTRY_BOMB) {
        if(runtime_state.bombs==0) {runtime_set_notice("A bomb is required",90);return false;}
        runtime_state.bombs--; return true;
    }
    if(method==EMBER_ENTRY_KEY) {
        if(runtime_state.item_flags&EMBER_ITEM_MASTER_KEY) return true;
        if(runtime_state.small_keys==0) {runtime_set_notice("A small key is required",90);return false;}
        runtime_state.small_keys--; return true;
    }
    if(method==EMBER_ENTRY_SHARDS) {
        if(runtime_state.shards<8) {runtime_set_notice("Eight Ember Shards are required",110);return false;}
        return true;
    }
    return false;
}

static void runtime_try_enter(void) {
    if(runtime_location!=RUNTIME_OVERWORLD) return;
    const EmberDungeonDef *d=runtime_dungeon_at_screen(runtime_state.screen_id);
    if(d) {
        if(!runtime_pay_entry(d->entry_method)) return;
        runtime_location=RUNTIME_DUNGEON;
        runtime_dungeon_id=d->id;
        runtime_room=0;
        player.x=0;player.z=70;player.speed=0;player.action=ACT_FREE;player.action_t=0;
        runtime_prev_x=player.x;runtime_prev_z=player.z;runtime_transition_cooldown=12;
        runtime_spawn_dungeon_enemy();
        runtime_set_notice(d->name,90);
        return;
    }
    const EmberInteriorDef *in=ember_interior_at_screen(runtime_state.screen_id,false);
    if(in) {
        if(!runtime_pay_entry(in->entry_method)) return;
        runtime_location=RUNTIME_INTERIOR;
        runtime_interior_id=in->id;
        player.x=0;player.z=65;player.speed=0;player.action=ACT_FREE;player.action_t=0;
        runtime_prev_x=player.x;runtime_prev_z=player.z;runtime_transition_cooldown=12;
        runtime_spawn_interior_enemy();
        runtime_set_notice(in->name,90);
    }
}

static void runtime_exit_to_overworld(void) {
    runtime_location=RUNTIME_OVERWORLD;
    player.x=0;player.z=45;player.speed=0;player.action=ACT_FREE;player.action_t=0;
    runtime_prev_x=player.x;runtime_prev_z=player.z;runtime_transition_cooldown=15;
    runtime_spawn_overworld_enemy();
    runtime_set_notice(runtime_screen.title,70);
}

static void runtime_try_exit(void) {
    if(runtime_location==RUNTIME_INTERIOR) {
        runtime_exit_to_overworld();
    } else if(runtime_location==RUNTIME_DUNGEON) {
        if(runtime_room==0) runtime_exit_to_overworld();
        else runtime_set_notice("Return to the entry room to leave",90);
    }
}

static bool runtime_dungeon_key_edge(const EmberDungeonDef *d,uint8_t a,uint8_t b) {
    return d && ((a==d->locked_from_room&&b==d->locked_to_room) ||
                 (b==d->locked_from_room&&a==d->locked_to_room));
}

static bool runtime_allow_dungeon_edge(uint8_t from,uint8_t to) {
    const EmberDungeonDef *d=ember_dungeon_get(runtime_dungeon_id);
    if(!d) return false;

    if(runtime_dungeon_key_edge(d,from,to)) {
        uint8_t mask=(uint8_t)(1u<<runtime_dungeon_id);
        if(!(runtime_key_gate_unlocked&mask)) {
            if(runtime_state.item_flags&EMBER_ITEM_MASTER_KEY) runtime_key_gate_unlocked|=mask;
            else if(runtime_state.small_keys>0) {runtime_state.small_keys--;runtime_key_gate_unlocked|=mask;}
            else {runtime_set_notice("The dungeon gate needs a key",90);return false;}
        }
    }

    if(to==d->boss_room) {
        if(runtime_dungeon_id==EMBER_DUNGEON_CITADEL) {
            if(!ember_dungeon_trials_cleared(runtime_dungeon_id,runtime_room_cleared[runtime_dungeon_id])) {
                runtime_set_notice("The Royal Seal trials are incomplete",100);return false;
            }
        } else if(from==d->clear_gate_room && to==d->clear_gate_to_room) {
            uint16_t from_bit=(uint16_t)(1u<<from);
            if(!(runtime_room_cleared[runtime_dungeon_id]&from_bit)) {
                runtime_set_notice("Defeat the Upper Hall guardians",90);return false;
            }
            if(!ember_dungeon_trials_cleared(runtime_dungeon_id,runtime_room_cleared[runtime_dungeon_id])) {
                runtime_set_notice("The rune trials are incomplete",90);return false;
            }
        }
    }
    return true;
}

static void runtime_try_edge_transition(float moved_x,float moved_z) {
    if(runtime_transition_cooldown>0 || player.action!=ACT_FREE) return;
    int dx=0,dy=0;
    if(player.x<=-83.5f && moved_x<-.02f) dx=-1;
    else if(player.x>=83.5f && moved_x>.02f) dx=1;
    else if(player.z<=-87.5f && moved_z<-.02f) dy=-1;
    else if(player.z>=87.5f && moved_z>.02f) dy=1;
    if(!dx&&!dy) return;

    if(runtime_location==RUNTIME_OVERWORLD) {
        int next=ember_world_neighbor(runtime_state.screen_id,dx,dy);
        if(next>=0) runtime_load_screen((uint8_t)next,dx,dy);
        return;
    }
    if(runtime_location==RUNTIME_DUNGEON) {
        int next=ember_dungeon_neighbor(runtime_dungeon_id,runtime_room,dx,dy);
        if(next>=0 && runtime_allow_dungeon_edge(runtime_room,(uint8_t)next))
            runtime_load_dungeon_room((uint8_t)next,dx,dy);
        else {
            if(dx<0)player.x=-80;else if(dx>0)player.x=80;
            if(dy<0)player.z=-84;else if(dy>0)player.z=84;
            player.speed=0;
            runtime_prev_x=player.x;runtime_prev_z=player.z;
        }
    }
}

static void runtime_respawn(void) {
    runtime_state.hp=runtime_state.max_hp;
    ember_state_enter_screen(&runtime_state,EMBER_START_SCREEN);
    ember_world_get(runtime_state.screen_id,&runtime_screen);
    runtime_location=RUNTIME_OVERWORLD;
    player.x=0.0f;player.z=32.0f;player.yaw=3.14159265f;player.speed=0.0f;
    player.hp=runtime_state.hp;player.action=ACT_FREE;player.action_t=0.0f;
    player.invuln=1.0f;player.queued_attack=false;locked_target=false;
    runtime_transition_cooldown=20;runtime_prev_x=player.x;runtime_prev_z=player.z;
    runtime_spawn_overworld_enemy();
    runtime_set_notice("You awaken at Ember Meadow",100);
}

static void runtime_init(void) {
    ember_state_new_game(&runtime_state);
    ember_world_get(runtime_state.screen_id,&runtime_screen);
    player.hp=runtime_state.hp;
    runtime_prev_x=player.x;runtime_prev_z=player.z;
    runtime_ready=true;
}

static void ember_runtime_joypad_poll(void) {
    joypad_poll();
    if(!runtime_ready) runtime_init();

    joypad_inputs_t raw=joypad_get_inputs(JOYPAD_PORT_1);
    bool cup=raw.btn.c_up;
    bool cdown=raw.btn.c_down;

    if(runtime_notice_frames>0) runtime_notice_frames--;
    runtime_process_clear();

    if(cup&&!runtime_cup_latch) runtime_try_enter();
    if(cdown&&!runtime_cdown_latch) runtime_try_exit();
    runtime_cup_latch=cup;
    runtime_cdown_latch=cdown;

    if(player.hp<=0.0f) {runtime_respawn();return;}

    int hp=(int)(player.hp+0.01f);
    if(hp<0) hp=0;
    if(hp>runtime_state.max_hp) hp=runtime_state.max_hp;
    runtime_state.hp=(uint8_t)hp;

    float moved_x=player.x-runtime_prev_x;
    float moved_z=player.z-runtime_prev_z;
    if(runtime_transition_cooldown>0) runtime_transition_cooldown--;
    else runtime_try_edge_transition(moved_x,moved_z);

    runtime_prev_x=player.x;
    runtime_prev_z=player.z;
}

static rdpq_textmetrics_t ember_runtime_text_printf(
    const rdpq_textparms_t *parms,uint8_t font_id,float x0,float y0,const char *fmt,...)
{
    va_list args;
    va_start(args,fmt);
    rdpq_textmetrics_t result=rdpq_text_vprintf(parms,font_id,x0,y0,fmt,args);
    va_end(args);

    if(runtime_ready && y0<=13.0f) {
        if(runtime_location==RUNTIME_OVERWORLD) {
            rdpq_text_printf(NULL,font_id,8,22,"%02u  %s  [%s]",
                runtime_state.screen_id,runtime_screen.title,ember_world_biome_name(runtime_screen.biome));
            const EmberDungeonDef *d=runtime_dungeon_at_screen(runtime_state.screen_id);
            const EmberInteriorDef *in=ember_interior_at_screen(runtime_state.screen_id,false);
            if(d) rdpq_text_printf(NULL,font_id,8,32,"C-Up: %s  [%s]",d->name,runtime_entry_method_name(d->entry_method));
            else if(in) rdpq_text_printf(NULL,font_id,8,32,"C-Up: %s  [%s]",in->name,runtime_entry_method_name(in->entry_method));
            else if(runtime_screen.landmark!=EMBER_LANDMARK_NONE)
                rdpq_text_printf(NULL,font_id,8,32,"Landmark: %s",ember_world_landmark_name(runtime_screen.landmark));
        } else if(runtime_location==RUNTIME_DUNGEON) {
            const EmberDungeonDef *d=ember_dungeon_get(runtime_dungeon_id);
            const EmberDungeonRoom *r=ember_dungeon_room(runtime_dungeon_id,runtime_room);
            rdpq_text_printf(NULL,font_id,8,22,"%s  room %u/%u",d?d->name:"Dungeon",runtime_room+1,d?d->room_count:0);
            if(r) rdpq_text_printf(NULL,font_id,8,32,"%s",r->name);
        } else {
            const EmberInteriorDef *in=ember_interior_get(runtime_interior_id);
            rdpq_text_printf(NULL,font_id,8,22,"INTERIOR");
            if(in) rdpq_text_printf(NULL,font_id,8,32,"%s",in->name);
        }
        if(runtime_notice_frames>0 && runtime_notice[0])
            rdpq_text_printf(NULL,font_id,8,42,"%s",runtime_notice);
    }
    return result;
}
