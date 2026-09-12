#include "game_state.h"
#include <string.h>

void ember_state_mark_explored(EmberGameState *state, uint8_t screen_id) {
    if(!state || screen_id >= EMBER_WORLD_COUNT) return;
    state->explored[screen_id >> 5] |= 1u << (screen_id & 31);
}

bool ember_state_is_explored(const EmberGameState *state, uint8_t screen_id) {
    if(!state || screen_id >= EMBER_WORLD_COUNT) return false;
    return (state->explored[screen_id >> 5] & (1u << (screen_id & 31))) != 0;
}

void ember_state_new_game(EmberGameState *state) {
    if(!state) return;
    memset(state, 0, sizeof(*state));
    state->version = EMBER_SAVE_VERSION;
    state->screen_id = EMBER_START_SCREEN;
    state->hp = 3;
    state->max_hp = 3;
    state->max_magic = 32;
    state->magic = state->max_magic;
    state->bombs = 3;
    state->outfit_flags = EMBER_OUTFIT_TRAVELER;
    ember_state_mark_explored(state, state->screen_id);
}

void ember_state_enter_screen(EmberGameState *state, uint8_t screen_id) {
    if(!state || screen_id >= EMBER_WORLD_COUNT) return;
    state->screen_id = screen_id;
    ember_state_mark_explored(state, screen_id);
}

void ember_state_gain_shard(EmberGameState *state) {
    if(!state || state->shards >= 8) return;
    state->shards++;
    /* Preserve the browser game's later progression rule: every second shard
       grants a maximum-heart step, capped here at the existing 12-heart target. */
    if((state->shards & 1u) == 0 && state->max_hp < 12) {
        state->max_hp++;
        state->hp = state->max_hp;
    }
}
