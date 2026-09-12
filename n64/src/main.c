#include <libdragon.h>
#include <t3d/t3d.h>
#include <math.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

#define FB_COUNT 3
#define MAX_DRAWS 192
#define MAT_COUNT 11
#define TAU 6.2831853071795864769f

enum {
    MAT_GRASS,
    MAT_DIRT,
    MAT_GREEN,
    MAT_GREEN_DARK,
    MAT_SKIN,
    MAT_HAIR,
    MAT_LEATHER,
    MAT_BOOT,
    MAT_METAL,
    MAT_GOLD,
    MAT_ENEMY
};

typedef enum {
    ACT_FREE,
    ACT_ROLL,
    ACT_SIDEHOP,
    ACT_BACKFLIP,
    ACT_ATTACK1,
    ACT_ATTACK2,
    ACT_ATTACK3
} Action;

typedef enum {
    EN_IDLE,
    EN_APPROACH,
    EN_STRAFE,
    EN_BLOCK,
    EN_WINDUP,
    EN_ATTACK,
    EN_HURT,
    EN_DEAD
} EnemyState;

typedef struct {
    float x, z;
    float speed;
    float yaw;
    float hp;
    Action action;
    float action_t;
    int combo;
    bool queued_attack;
    float invuln;
    float walk_phase;
} Player;

typedef struct {
    float x, z;
    float yaw;
    int hp;
    EnemyState state;
    float timer;
    int strafe_dir;
    bool attack_hit;
    float hurt;
} Enemy;

typedef struct {
    float x, z, r;
} CircleObstacle;

typedef struct {
    float x, z, hx, hz;
} BoxObstacle;

static Player player;
static Enemy enemy;
static bool locked_target = false;
static float cam_yaw = 3.14159265f;
static float cam_dist = 58.0f;
static fm_vec3_t cam_pos = {{0, 28, 58}};
static fm_vec3_t cam_target = {{0, 8, 0}};

static T3DVertPacked *cube_verts[MAT_COUNT];
static T3DVertPacked *oct_verts[MAT_COUNT];
static rspq_block_t *cube_dpl[MAT_COUNT];
static rspq_block_t *oct_dpl[MAT_COUNT];
static T3DMat4FP *draw_mats = NULL;
static int frame_idx = 0;
static int draw_cursor = 0;
static T3DViewport viewport;

static const uint32_t MAT_RGBA[MAT_COUNT] = {
    RGBA32(75, 118, 58, 255),
    RGBA32(151, 119, 76, 255),
    RGBA32(54, 111, 55, 255),
    RGBA32(34, 74, 39, 255),
    RGBA32(224, 166, 112, 255),
    RGBA32(126, 76, 35, 255),
    RGBA32(110, 70, 39, 255),
    RGBA32(67, 42, 28, 255),
    RGBA32(201, 201, 184, 255),
    RGBA32(189, 155, 75, 255),
    RGBA32(135, 57, 48, 255)
};

static const CircleObstacle tree_obs[] = {
    {-42,-42,6}, {44,-36,6}, {-51,12,6}, {48,21,6},
    {-43,52,6}, {43,53,6}, {-69,-7,6}, {69,-13,6}
};
static const BoxObstacle box_obs[] = {
    {-48,-67,15,12}
};

static inline float clampf(float v, float lo, float hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}
static inline float approachf(float v, float target, float step) {
    if (v < target) return fminf(v + step, target);
    return fmaxf(v - step, target);
}
static float angle_diff(float a, float b) {
    float d = fmodf((b - a) + 3.14159265f, TAU);
    if (d < 0) d += TAU;
    return d - 3.14159265f;
}
static float angle_approach(float a, float b, float rate) {
    return a + angle_diff(a,b) * clampf(rate,0,1);
}
static float dist2(float ax, float az, float bx, float bz) {
    float dx=ax-bx, dz=az-bz;
    return sqrtf(dx*dx + dz*dz);
}
static float terrain_height(float x, float z) {
    float h = 0.0f;
    if (z > 22.0f) h += clampf((z-22.0f)*0.10f, 0.0f, 5.0f);
    if (x < -24.0f && z > 5.0f) h += clampf((-x-24.0f)*0.06f, 0.0f, 3.0f);
    return h;
}
static float curved_stick_speed(float magnitude) {
    float raw = clampf(magnitude,0,80) - 20.0f;
    if (raw <= 0.0f) return 0.0f;
    float t = 1.0f - cosf((raw * 450.0f) * (TAU / 65536.0f));
    return fminf(6.0f, ((t*t*30.0f)+7.0f)*0.14f);
}

static void vert_set(T3DVertPacked *buf, int i, int16_t x, int16_t y, int16_t z, uint32_t rgba, uint16_t norm) {
    T3DVertPacked *p = &buf[i >> 1];
    if ((i & 1) == 0) {
        p->posA[0]=x; p->posA[1]=y; p->posA[2]=z; p->rgbaA=rgba; p->normA=norm;
    } else {
        p->posB[0]=x; p->posB[1]=y; p->posB[2]=z; p->rgbaB=rgba; p->normB=norm;
    }
}

static void build_cube_geom(T3DVertPacked *v, uint32_t c) {
    const int16_t p[6][4][3] = {
        {{-1,-1, 1},{ 1,-1, 1},{ 1, 1, 1},{-1, 1, 1}},
        {{ 1,-1,-1},{-1,-1,-1},{-1, 1,-1},{ 1, 1,-1}},
        {{ 1,-1, 1},{ 1,-1,-1},{ 1, 1,-1},{ 1, 1, 1}},
        {{-1,-1,-1},{-1,-1, 1},{-1, 1, 1},{-1, 1,-1}},
        {{-1, 1, 1},{ 1, 1, 1},{ 1, 1,-1},{-1, 1,-1}},
        {{-1,-1,-1},{ 1,-1,-1},{ 1,-1, 1},{-1,-1, 1}},
    };
    const fm_vec3_t n[6] = {
        {{0,0,1}},{{0,0,-1}},{{1,0,0}},{{-1,0,0}},{{0,1,0}},{{0,-1,0}}
    };
    for(int f=0;f<6;f++) {
        uint16_t norm=t3d_vert_pack_normal(&n[f]);
        for(int q=0;q<4;q++) {
            int i=f*4+q;
            vert_set(v,i,p[f][q][0],p[f][q][1],p[f][q][2],c,norm);
        }
    }
}
static void build_oct_geom(T3DVertPacked *v, uint32_t c) {
    const int16_t p[6][3]={{0,1,0},{1,0,0},{0,0,1},{-1,0,0},{0,0,-1},{0,-1,0}};
    for(int i=0;i<6;i++) {
        fm_vec3_t n={{(float)p[i][0],(float)p[i][1],(float)p[i][2]}};
        fm_vec3_norm(&n,&n);
        vert_set(v,i,p[i][0],p[i][1],p[i][2],c,t3d_vert_pack_normal(&n));
    }
    vert_set(v,6,0,-1,0,c,t3d_vert_pack_normal(&(fm_vec3_t){{0,-1,0}}));
}
static rspq_block_t *make_cube_dpl(T3DVertPacked *v) {
    rspq_block_begin();
    t3d_vert_load(v,0,24);
    for(int f=0;f<6;f++) {
        int b=f*4;
        t3d_tri_draw(b,b+1,b+2);
        t3d_tri_draw(b+2,b+3,b);
    }
    t3d_tri_sync();
    return rspq_block_end();
}
static rspq_block_t *make_oct_dpl(T3DVertPacked *v) {
    static const int tri[8][3]={{0,1,2},{0,2,3},{0,3,4},{0,4,1},{5,2,1},{5,3,2},{5,4,3},{5,1,4}};
    rspq_block_begin();
    t3d_vert_load(v,0,6);
    for(int i=0;i<8;i++) t3d_tri_draw(tri[i][0],tri[i][1],tri[i][2]);
    t3d_tri_sync();
    return rspq_block_end();
}
static void init_primitives(void) {
    for(int m=0;m<MAT_COUNT;m++) {
        cube_verts[m]=malloc_uncached(sizeof(T3DVertPacked)*12);
        oct_verts[m]=malloc_uncached(sizeof(T3DVertPacked)*4);
        build_cube_geom(cube_verts[m],MAT_RGBA[m]);
        build_oct_geom(oct_verts[m],MAT_RGBA[m]);
        cube_dpl[m]=make_cube_dpl(cube_verts[m]);
        oct_dpl[m]=make_oct_dpl(oct_verts[m]);
    }
}

static void draw_prim(bool oct, int mat, float x,float y,float z,float sx,float sy,float sz,float rx,float ry,float rz) {
    if(draw_cursor>=MAX_DRAWS) return;
    T3DMat4FP *m=&draw_mats[(frame_idx*MAX_DRAWS)+draw_cursor++];
    float scale[3]={sx,sy,sz};
    float rot[3]={rx,ry,rz};
    float pos[3]={x,y,z};
    t3d_mat4fp_from_srt_euler(m,scale,rot,pos);
    t3d_matrix_set(m,true);
    rspq_block_run(oct?oct_dpl[mat]:cube_dpl[mat]);
}
static void box_draw(int mat,float x,float y,float z,float sx,float sy,float sz,float rx,float ry,float rz) {
    draw_prim(false,mat,x,y,z,sx,sy,sz,rx,ry,rz);
}
static void oct_draw(int mat,float x,float y,float z,float sx,float sy,float sz,float rx,float ry,float rz) {
    draw_prim(true,mat,x,y,z,sx,sy,sz,rx,ry,rz);
}

static bool circle_collide(float x,float z,float r,float *nx,float *nz,float *push) {
    for(size_t i=0;i<sizeof(tree_obs)/sizeof(tree_obs[0]);i++) {
        float dx=x-tree_obs[i].x, dz=z-tree_obs[i].z;
        float d=sqrtf(dx*dx+dz*dz), min=tree_obs[i].r+r;
        if(d<min) {
            if(d<0.001f){dx=1;dz=0;d=1;}
            *nx=dx/d;*nz=dz/d;*push=min-d;return true;
        }
    }
    for(size_t i=0;i<sizeof(box_obs)/sizeof(box_obs[0]);i++) {
        float cx=clampf(x,box_obs[i].x-box_obs[i].hx,box_obs[i].x+box_obs[i].hx);
        float cz=clampf(z,box_obs[i].z-box_obs[i].hz,box_obs[i].z+box_obs[i].hz);
        float dx=x-cx,dz=z-cz,d=sqrtf(dx*dx+dz*dz);
        if(d<r) {
            if(d<0.001f){dx=0;dz=1;d=1;}
            *nx=dx/d;*nz=dz/d;*push=r-d;return true;
        }
    }
    return false;
}
static void move_player(float dx,float dz) {
    float nx=clampf(player.x+dx,-84,84), nz=player.z;
    float ax,az,push;
    if(circle_collide(nx,nz,2.7f,&ax,&az,&push)){nx+=ax*push;nz+=az*push;}
    player.x=nx;player.z=nz;
    nx=player.x;nz=clampf(player.z+dz,-88,88);
    if(circle_collide(nx,nz,2.7f,&ax,&az,&push)){nx+=ax*push;nz+=az*push;}
    player.x=nx;player.z=nz;
}

static void start_attack(void) {
    if(player.action>=ACT_ATTACK1) { player.queued_attack=true; return; }
    if(player.action!=ACT_FREE) return;
    player.action=ACT_ATTACK1; player.action_t=.34f; player.combo=0; player.queued_attack=false;
}
static void next_attack(void) {
    player.combo=(player.combo+1)%3;
    player.action=(Action)(ACT_ATTACK1+player.combo);
    player.action_t=.34f; player.queued_attack=false;
}
static void start_dodge(float sx,float sy,float mag) {
    if(player.action!=ACT_FREE) return;
    if(locked_target) {
        if(mag>24.0f && fabsf(sx)>34.0f){player.action=ACT_SIDEHOP;player.action_t=.34f;}
        else if(sy<-15.0f || mag<18.0f){player.action=ACT_BACKFLIP;player.action_t=.48f;}
        else {player.action=ACT_ROLL;player.action_t=.46f;}
    } else if(mag>55.0f) {
        player.action=ACT_ROLL;player.action_t=.46f;
    }
    if(player.action!=ACT_FREE) player.invuln=player.action_t*.70f;
}
static float line_point_dist(float ax,float az,float bx,float bz,float px,float pz) {
    float vx=bx-ax,vz=bz-az,wx=px-ax,wz=pz-az;
    float c=vx*vx+vz*vz,t=c>0?clampf((wx*vx+wz*vz)/c,0,1):0;
    float qx=ax+vx*t,qz=az+vz*t;
    return dist2(qx,qz,px,pz);
}
static void attack_hit_check(void) {
    if(player.action<ACT_ATTACK1 || enemy.hp<=0 || enemy.hurt>0) return;
    float total=.34f, t=1.0f-(player.action_t/total);
    if(t<.27f || t>.70f) return;
    float spread=(t-.27f)/(.43f);
    float offset=-1.15f + spread*2.3f;
    if(player.combo==1) offset=-1.55f+spread*3.1f;
    if(player.combo==2) offset= 1.50f-spread*3.0f;
    float sword_yaw=player.yaw+offset;
    float bx=player.x+sinf(player.yaw)*3.1f;
    float bz=player.z+cosf(player.yaw)*3.1f;
    float tx=bx+sinf(sword_yaw)*9.5f;
    float tz=bz+cosf(sword_yaw)*9.5f;
    if(line_point_dist(bx,bz,tx,tz,enemy.x,enemy.z)<4.0f) {
        if(enemy.state==EN_BLOCK) {player.action_t=fminf(player.action_t,.12f);enemy.timer=.35f;return;}
        enemy.hp--; enemy.hurt=.28f; enemy.state=enemy.hp>0?EN_HURT:EN_DEAD;
        float a=atan2f(enemy.x-player.x,enemy.z-player.z);
        enemy.x+=sinf(a)*5.0f; enemy.z+=cosf(a)*5.0f;
    }
}
static void update_player(float dt, joypad_inputs_t in, joypad_buttons_t pressed) {
    float sx=in.stick_x,sy=in.stick_y,mag=sqrtf(sx*sx+sy*sy);
    mag=fminf(mag,80.0f);
    float target_yaw=enemy.hp>0?atan2f(enemy.x-player.x,enemy.z-player.z):player.yaw;

    locked_target = in.btn.z && enemy.hp>0 && dist2(player.x,player.z,enemy.x,enemy.z)<82.0f;
    if(pressed.b) start_attack();
    if(pressed.a) start_dodge(sx,sy,mag);

    player.invuln=fmaxf(0,player.invuln-dt);
    if(player.action_t>0) player.action_t=fmaxf(0,player.action_t-dt);

    float tick=dt*20.0f;
    if(player.action==ACT_ROLL) {
        float r=fmaxf(3.0f,curved_stick_speed(mag)*1.5f);
        move_player(sinf(player.yaw)*r*tick,cosf(player.yaw)*r*tick);
    } else if(player.action==ACT_SIDEHOP) {
        int dir=sx<0?-1:1;
        player.yaw=angle_approach(player.yaw,target_yaw,0.55f);
        move_player(cosf(target_yaw)*dir*5.0f*tick,-sinf(target_yaw)*dir*5.0f*tick);
    } else if(player.action==ACT_BACKFLIP) {
        player.yaw=angle_approach(player.yaw,target_yaw,0.55f);
        move_player(-sinf(target_yaw)*5.3f*tick,-cosf(target_yaw)*5.3f*tick);
    } else if(player.action>=ACT_ATTACK1) {
        player.speed=approachf(player.speed,0.0f,1.5f*tick);
        if(locked_target) player.yaw=angle_approach(player.yaw,target_yaw,0.7f);
    } else if(locked_target) {
        player.yaw=angle_approach(player.yaw,target_yaw,clampf(dt*12.0f,0,1));
        float mx=sx/80.0f,my=sy/80.0f,sp=6.0f;
        float rx=cosf(target_yaw),rz=-sinf(target_yaw);
        float fx=sinf(target_yaw),fz=cosf(target_yaw);
        move_player((rx*mx*.62f+fx*my*.52f)*sp*tick,
                    (rz*mx*.62f+fz*my*.52f)*sp*tick);
        player.speed=sp*fminf(1.0f,mag/80.0f)*.62f;
    } else {
        float target=curved_stick_speed(mag);
        if(target>0) {
            float a=atan2f(sx,sy)+cam_yaw;
            player.yaw=angle_approach(player.yaw,a,clampf(dt*10.0f,0,1));
            float step=(target>=player.speed?2.0f:1.5f)*tick;
            player.speed=approachf(player.speed,target,step);
            move_player(sinf(a)*player.speed*tick,cosf(a)*player.speed*tick);
        } else {
            player.speed=approachf(player.speed,0,8.0f*tick);
        }
    }
    if(player.action!=ACT_FREE && player.action_t<=0) {
        if(player.action>=ACT_ATTACK1 && player.queued_attack) next_attack();
        else {player.action=ACT_FREE;player.queued_attack=false;}
    }
    player.walk_phase += dt*fmaxf(.5f,player.speed)*4.1f;
    attack_hit_check();
}

static void update_enemy(float dt) {
    if(enemy.hp<=0){enemy.state=EN_DEAD;return;}
    enemy.hurt=fmaxf(0,enemy.hurt-dt);
    enemy.timer=fmaxf(0,enemy.timer-dt);
    float dx=player.x-enemy.x,dz=player.z-enemy.z,d=sqrtf(dx*dx+dz*dz);
    float yaw=atan2f(dx,dz);enemy.yaw=yaw;
    if(enemy.hurt>0){enemy.state=EN_HURT;return;}
    if(enemy.state==EN_HURT){enemy.state=EN_STRAFE;enemy.timer=.4f;}
    if(enemy.state==EN_IDLE && d<65){enemy.state=EN_APPROACH;enemy.timer=.6f;}
    if(enemy.state==EN_APPROACH) {
        if(d>17){enemy.x+=sinf(yaw)*1.2f*dt*20;enemy.z+=cosf(yaw)*1.2f*dt*20;}
        else {enemy.state=EN_STRAFE;enemy.timer=.6f;enemy.strafe_dir=(rand()&1)?1:-1;}
    } else if(enemy.state==EN_STRAFE) {
        enemy.x+=cosf(yaw)*enemy.strafe_dir*.8f*dt*20;
        enemy.z-=sinf(yaw)*enemy.strafe_dir*.8f*dt*20;
        if(player.action>=ACT_ATTACK1 && d<19 && (rand()%100)<12){enemy.state=EN_BLOCK;enemy.timer=.32f;}
        else if(enemy.timer<=0){enemy.state=d<16?EN_WINDUP:EN_APPROACH;enemy.timer=enemy.state==EN_WINDUP?.28f:.5f;enemy.attack_hit=false;}
    } else if(enemy.state==EN_BLOCK) {
        if(enemy.timer<=0){enemy.state=EN_STRAFE;enemy.timer=.45f;}
    } else if(enemy.state==EN_WINDUP) {
        if(enemy.timer<=0){enemy.state=EN_ATTACK;enemy.timer=.30f;enemy.attack_hit=false;}
    } else if(enemy.state==EN_ATTACK) {
        if(!enemy.attack_hit && enemy.timer<.20f && enemy.timer>.08f && d<13.5f) {
            enemy.attack_hit=true;
            if(player.invuln<=0){player.hp=fmaxf(0,player.hp-1);player.invuln=.70f;player.speed=0;}
        }
        if(enemy.timer<=0){enemy.state=EN_STRAFE;enemy.timer=.5f;}
    }
}

static bool camera_blocked(float ax,float az,float bx,float bz) {
    for(size_t i=0;i<sizeof(tree_obs)/sizeof(tree_obs[0]);i++)
        if(line_point_dist(ax,az,bx,bz,tree_obs[i].x,tree_obs[i].z)<tree_obs[i].r+2.0f) return true;
    for(int s=1;s<10;s++) {
        float t=s/10.0f,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
        for(size_t i=0;i<sizeof(box_obs)/sizeof(box_obs[0]);i++)
            if(x>box_obs[i].x-box_obs[i].hx-2 && x<box_obs[i].x+box_obs[i].hx+2 &&
               z>box_obs[i].z-box_obs[i].hz-2 && z<box_obs[i].z+box_obs[i].hz+2) return true;
    }
    return false;
}
static void update_camera(float dt) {
    float fx=player.x,fz=player.z,desired_yaw=player.yaw;
    float fov=60.0f,desired_dist=58.0f;
    if(locked_target) {
        fx=(player.x+enemy.x)*.5f;fz=(player.z+enemy.z)*.5f;
        desired_yaw=atan2f(enemy.x-player.x,enemy.z-player.z);
        fov=50.0f;desired_dist=52.0f;
    }
    cam_yaw=angle_approach(cam_yaw,desired_yaw,clampf(dt*(locked_target?6.0f:3.5f),0,1));
    float d=desired_dist;
    while(d>25) {
        float bx=fx-sinf(cam_yaw)*d,bz=fz-cosf(cam_yaw)*d;
        if(!camera_blocked(fx,fz,bx,bz))break;
        d-=4.0f;
    }
    cam_dist += (d-cam_dist)*clampf(dt*7.0f,0,1);
    float target_y=terrain_height(fx,fz)+9.0f;
    fm_vec3_t want_pos={{fx-sinf(cam_yaw)*cam_dist,target_y+(locked_target?23.0f:27.0f),fz-cosf(cam_yaw)*cam_dist}};
    float miny=terrain_height(want_pos.v[0],want_pos.v[2])+5;
    if(want_pos.v[1]<miny)want_pos.v[1]=miny;
    float k=clampf(dt*8.0f,0,1);
    for(int i=0;i<3;i++)cam_pos.v[i]+=(want_pos.v[i]-cam_pos.v[i])*k;
    fm_vec3_t want_target={{fx,target_y,fz}};
    for(int i=0;i<3;i++)cam_target.v[i]+=(want_target.v[i]-cam_target.v[i])*clampf(dt*10.0f,0,1);
    t3d_viewport_set_projection(&viewport,T3D_DEG_TO_RAD(fov),5.0f,320.0f);
    t3d_viewport_look_at(&viewport,&cam_pos,&cam_target,&(fm_vec3_t){{0,1,0}});
}

static void draw_hero(void) {
    float y=terrain_height(player.x,player.z);
    float walk=(player.action==ACT_FREE?clampf(player.speed/6.0f,0,1):0);
    float sw=sinf(player.walk_phase)*.65f*walk;
    float body_bob=fabsf(sinf(player.walk_phase))*.45f*walk;
    float root_rx=0,root_rz=0;
    if(player.action==ACT_ROLL) root_rx=sinf((1-player.action_t/.46f)*3.14159265f)*1.05f;
    if(player.action==ACT_BACKFLIP) root_rx=-sinf((1-player.action_t/.48f)*3.14159265f)*.95f;
    if(player.action==ACT_SIDEHOP) root_rz=sinf((1-player.action_t/.34f)*3.14159265f)*.34f;

    box_draw(MAT_GREEN_DARK,player.x,y+6.1f+body_bob,player.z,2.5f,1.5f,1.9f,root_rx,player.yaw,root_rz);
    box_draw(MAT_GREEN,player.x,y+10.3f+body_bob,player.z,3.3f,3.0f,2.0f,root_rx,player.yaw,root_rz);
    box_draw(MAT_LEATHER,player.x,y+8.2f+body_bob,player.z,3.5f,.45f,2.1f,root_rx,player.yaw,root_rz);
    oct_draw(MAT_SKIN,player.x,y+15.0f+body_bob,player.z,2.4f,2.5f,2.2f,0,player.yaw,0);

    float fx=sinf(player.yaw),fz=cosf(player.yaw),rx=cosf(player.yaw),rz=-sinf(player.yaw);
    box_draw(MAT_HAIR,player.x-fx*1.2f,y+16.2f+body_bob,player.z-fz*1.2f,2.4f,.8f,1.5f,0,player.yaw,0);
    box_draw(MAT_GREEN_DARK,player.x-fx*2.8f,y+17.1f+body_bob,player.z-fz*2.8f,1.5f,.7f,3.0f,-.18f,player.yaw,0);
    box_draw(MAT_SKIN,player.x+fx*2.15f,y+15.0f+body_bob,player.z+fz*2.15f,.35f,.35f,.55f,0,player.yaw,0);
    box_draw(MAT_HAIR,player.x+rx*2.7f,y+15.0f+body_bob,player.z+rz*2.7f,.65f,.28f,1.05f,0,player.yaw,0);
    box_draw(MAT_HAIR,player.x-rx*2.7f,y+15.0f+body_bob,player.z-rz*2.7f,.65f,.28f,1.05f,0,player.yaw,0);

    float armSwing=-sw*.45f;
    for(int side=-1;side<=1;side+=2) {
        float sxp=player.x+rx*4.0f*side,szp=player.z+rz*4.0f*side;
        float swing=(side<0?armSwing:-armSwing);
        box_draw(MAT_GREEN,sxp,y+10.7f+body_bob,szp,1.0f,2.6f,1.1f,swing,player.yaw,0);
        box_draw(MAT_SKIN,sxp+fx*sinf(swing)*1.5f,y+7.9f+body_bob,szp+fz*sinf(swing)*1.5f,.85f,2.2f,.9f,swing,player.yaw,0);
    }
    for(int side=-1;side<=1;side+=2) {
        float hipx=player.x+rx*1.55f*side,hipz=player.z+rz*1.55f*side;
        float ls=side<0?sw:-sw;
        box_draw(MAT_LEATHER,hipx,y+4.0f,hipz,1.25f,2.5f,1.35f,ls*.55f,player.yaw,0);
        box_draw(MAT_BOOT,hipx+fx*sinf(ls*.55f)*1.2f,y+1.4f,hipz+fz*sinf(ls*.55f)*1.2f,1.3f,1.6f,1.7f,ls*.35f,player.yaw,0);
    }
    box_draw(MAT_GREEN_DARK,player.x-fx*2.25f,y+10.8f,player.z-fz*2.25f,2.6f,3.0f,.55f,0,player.yaw,0);
    box_draw(MAT_GOLD,player.x-fx*2.85f,y+10.8f,player.z-fz*2.85f,.7f,.7f,.35f,0,player.yaw,0);

    float swordOff=.35f;
    if(player.action>=ACT_ATTACK1) {
        float t=1-player.action_t/.34f;
        swordOff=-1.15f+clampf((t-.18f)/.60f,0,1)*2.30f;
        if(player.combo==1)swordOff=-1.55f+clampf((t-.18f)/.60f,0,1)*3.10f;
        if(player.combo==2)swordOff=1.50f-clampf((t-.18f)/.60f,0,1)*3.00f;
    }
    float swordYaw=player.yaw+swordOff;
    float handx=player.x+rx*4.2f+fx*2.0f,handz=player.z+rz*4.2f+fz*2.0f;
    box_draw(MAT_GOLD,handx,y+8.4f,handz,1.8f,.35f,.5f,0,swordYaw,0);
    box_draw(MAT_METAL,handx+sinf(swordYaw)*5.2f,y+8.5f,handz+cosf(swordYaw)*5.2f,.48f,.32f,5.2f,0,swordYaw,0);
}

static void draw_enemy(void) {
    if(enemy.hp<=0)return;
    float y=terrain_height(enemy.x,enemy.z);
    float fx=sinf(enemy.yaw),fz=cosf(enemy.yaw),rx=cosf(enemy.yaw),rz=-sinf(enemy.yaw);
    float bob=(enemy.state==EN_STRAFE||enemy.state==EN_APPROACH)?fabsf(sinf(get_ticks_ms()*.006f))*.35f:0;
    box_draw(MAT_ENEMY,enemy.x,y+7.2f+bob,enemy.z,4.0f,4.7f,3.0f,0,enemy.yaw,0);
    oct_draw(MAT_ENEMY,enemy.x,y+13.0f+bob,enemy.z,3.1f,3.0f,2.8f,0,enemy.yaw,0);
    box_draw(MAT_GOLD,enemy.x+rx*2.5f+fx*2.7f,y+13.5f+bob,enemy.z+rz*2.5f+fz*2.7f,.35f,.35f,.35f,0,enemy.yaw,0);
    box_draw(MAT_GOLD,enemy.x-rx*2.5f+fx*2.7f,y+13.5f+bob,enemy.z-rz*2.5f+fz*2.7f,.35f,.35f,.35f,0,enemy.yaw,0);
    float armR=enemy.state==EN_WINDUP?-1.0f:(enemy.state==EN_ATTACK?.8f:0);
    box_draw(MAT_ENEMY,enemy.x+rx*4.7f,y+8.7f+bob,enemy.z+rz*4.7f,1.1f,3.3f,1.2f,armR,enemy.yaw,0);
    box_draw(MAT_LEATHER,enemy.x+rx*5.2f+fx*2.0f,y+7.0f+bob,enemy.z+rz*5.2f+fz*2.0f,.8f,.8f,5.2f,armR,enemy.yaw,0);
    box_draw(MAT_ENEMY,enemy.x-rx*4.5f,y+8.7f+bob,enemy.z-rz*4.5f,1.1f,3.3f,1.2f,0,enemy.yaw,0);
    box_draw(MAT_METAL,enemy.x-rx*5.4f+fx*.4f,y+9.0f+bob,enemy.z-rz*5.4f+fz*.4f,.5f,3.6f,3.0f,0,enemy.yaw,0);
    box_draw(MAT_LEATHER,enemy.x+rx*1.8f,y+2.9f,enemy.z+rz*1.8f,1.4f,2.9f,1.4f,0,enemy.yaw,0);
    box_draw(MAT_LEATHER,enemy.x-rx*1.8f,y+2.9f,enemy.z-rz*1.8f,1.4f,2.9f,1.4f,0,enemy.yaw,0);
    if(locked_target) {
        float spin=get_ticks_ms()*.004f;
        box_draw(MAT_GOLD,enemy.x+cosf(spin)*5.0f,y+18.0f,enemy.z+sinf(spin)*5.0f,1.1f,.25f,.25f,0,spin,0);
        box_draw(MAT_GOLD,enemy.x-cosf(spin)*5.0f,y+18.0f,enemy.z-sinf(spin)*5.0f,1.1f,.25f,.25f,0,spin,0);
    }
}

static void draw_world(void) {
    box_draw(MAT_GRASS,0,-1.2f,0,100,1.0f,100,0,0,0);
    box_draw(MAT_DIRT,0,.05f,-2,10,.35f,100,0,0,0);
    box_draw(MAT_DIRT,-47,terrain_height(-47,-67)+7,-67,15,7,12,0,0,0);
    box_draw(MAT_LEATHER,-47,terrain_height(-47,-67)+15,-67,18,3,15,0,.785f,0);
    for(size_t i=0;i<sizeof(tree_obs)/sizeof(tree_obs[0]);i++) {
        float x=tree_obs[i].x,z=tree_obs[i].z,y=terrain_height(x,z);
        box_draw(MAT_LEATHER,x,y+6,z,2.0f,6,2.0f,0,0,0);
        oct_draw(MAT_GREEN_DARK,x,y+16,z,9,12,9,0,0,0);
        oct_draw(MAT_GREEN,x,y+24,z,6.5f,9,6.5f,0,0,0);
    }
    const float rocks[][2]={{24,-8},{34,-4},{-28,35},{29,42},{-15,-33}};
    for(size_t i=0;i<sizeof(rocks)/sizeof(rocks[0]);i++) {
        float x=rocks[i][0],z=rocks[i][1],y=terrain_height(x,z);
        oct_draw(MAT_METAL,x,y+2.0f,z,3.5f,2.7f,3.2f,0,(float)i,0);
    }
}

int main(void) {
    debug_init_isviewer();
    debug_init_usblog();
    display_init(RESOLUTION_320x240,DEPTH_16_BPP,FB_COUNT,GAMMA_NONE,FILTERS_RESAMPLE_ANTIALIAS);
    rdpq_init();
    joypad_init();
    timer_init();
    t3d_init((T3DInitParams){});
    viewport=t3d_viewport_create_buffered(FB_COUNT);
    rdpq_text_register_font(FONT_BUILTIN_DEBUG_MONO,rdpq_font_load_builtin(FONT_BUILTIN_DEBUG_MONO));
    draw_mats=malloc_uncached(sizeof(T3DMat4FP)*FB_COUNT*MAX_DRAWS);
    init_primitives();

    player=(Player){.x=0,.z=32,.speed=0,.yaw=3.14159265f,.hp=8,.action=ACT_FREE};
    enemy=(Enemy){.x=0,.z=-30,.yaw=0,.hp=8,.state=EN_IDLE,.timer=.5f,.strafe_dir=1};

    uint8_t ambient[4]={62,67,58,255};
    uint8_t sun_color[4]={220,204,166,255};
    fm_vec3_t sun_dir={{-0.45f,0.82f,0.35f}};
    fm_vec3_norm(&sun_dir,&sun_dir);

    uint64_t last=get_ticks_us();

    while(1) {
        uint64_t now=get_ticks_us();
        float dt=(now-last)/1000000.0f;last=now;
        if(dt>.05f)dt=.05f;

        joypad_poll();
        joypad_inputs_t in=joypad_get_inputs(JOYPAD_PORT_1);
        joypad_buttons_t pressed=joypad_get_buttons_pressed(JOYPAD_PORT_1);

        update_player(dt,in,pressed);
        update_enemy(dt);
        update_camera(dt);

        frame_idx=(frame_idx+1)%FB_COUNT;
        draw_cursor=0;

        rdpq_attach(display_get(),display_get_zbuf());
        t3d_frame_start();
        t3d_viewport_attach(&viewport);
        t3d_screen_clear_color(RGBA32(91,128,145,255));
        t3d_screen_clear_depth();

        rdpq_mode_combiner(RDPQ_COMBINER_SHADE);
        t3d_light_set_ambient(ambient);
        t3d_light_set_directional(0,sun_color,&sun_dir);
        t3d_light_set_count(1);
        t3d_state_set_drawflags(T3D_FLAG_SHADED|T3D_FLAG_DEPTH);

        draw_world();
        draw_enemy();
        draw_hero();

        const char *state_name=player.action==ACT_FREE?"FREE":
            player.action==ACT_ROLL?"ROLL":
            player.action==ACT_SIDEHOP?"SIDE":
            player.action==ACT_BACKFLIP?"BACK":"ATTACK";
        rdpq_text_printf(NULL,FONT_BUILTIN_DEBUG_MONO,8,12,
            "RELIC OF EMBERWOOD  N64");
        rdpq_text_printf(NULL,FONT_BUILTIN_DEBUG_MONO,8,222,
            "HP %.0f  FOE %d  %s %s",player.hp,enemy.hp,locked_target?"Z-LOCK":"FREE",state_name);
        rdpq_text_printf(NULL,FONT_BUILTIN_DEBUG_MONO,8,232,
            "B sword  A evade  Z target   %.1f FPS",display_get_fps());

        rdpq_detach_show();
    }
    return 0;
}
