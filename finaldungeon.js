/* v31 final dungeon: Ember Citadel, 8 rooms, final boss, magic vessel */
const FINAL_DEF={p:'citadel',name:'Ember Citadel',theme:'citadel'};
PORTALS['9:8:2'].inside='citadel0';LANDMARKS[9]='Ember Citadel';
const citCoords=[[1,3],[1,2],[0,2],[2,2],[0,1],[1,1],[2,1],[1,0]];
const citNames=['Ashen Threshold','Ember Hall','West Furnace','East Furnace','Crown Gallery','Heart Chamber','Royal Seal','Relic Sanctum'];
for(let i=0;i<8;i++){const k='citadel'+i;DUNGEON_INFO[k]=FINAL_DEF;DUNGEON_COORDS[k]=citCoords[i];INTERIORS[k]={name:`Ember Citadel - ${citNames[i]}`,enemies:i===7?['emberSovereign']:i===6?['knight','forgeLord']:i%2?['knight','bat','walker']:['walker','hopper','knight'],reward:i===7?'relic':null,dungeon:true,theme:'citadel',entry:i===0};if(i===0)Object.assign(INTERIORS[k],{exit:'door',returnId:9,returnX:128,returnY:64});}
const byCit=new Map(citCoords.map((p,i)=>[p.join(','),'citadel'+i]));
for(let i=0;i<8;i++){const [cx,cy]=citCoords[i],L={};for(const[d,dx,dy]of[['L',-1,0],['R',1,0],['U',0,-1],['D',0,1]]){const to=byCit.get([cx+dx,cy+dy].join(','));if(to)L[d]=to}DUNGEON_LINKS['citadel'+i]=L;}
SPECIAL_REWARDS.citadel5='magicVessel';
ITEM_REWARD_LABEL.magicVessel='Magic Vessel';
const _v31Enemy=enemy;
enemy=function(type,index,seed=0,worldId=null){const e=_v31Enemy(type,index,seed,worldId);if(type==='emberSovereign'){e.hp=e.maxHp=32;e.bossTimer=25}return e};
const _v31Acquire=acquireCustom;
acquireCustom=function(d){if(d.type==='magicVessel'){const token=d.key||'magicVessel';if(G.taken.has(token))return;G.taken.add(token);G.maxMagic=Math.min(64,G.maxMagic+16);G.magic=G.maxMagic;sfx('secret');say('Magic Vessel — maximum magic increased!',160);saveGame();return}_v31Acquire(d)};
const _v31Enemies=updateEnemies;
updateEnemies=function(){const R=state();for(const e of R.enemies){if(e.type!=='emberSovereign'||e.hp<=0)continue;e.bossTimer=(e.bossTimer??25)-1;if(e.bossTimer<=0){const rage=e.hp<=16;e.bossTimer=rage?20:31;const n=rage?12:8,spin=performance.now()/(rage?500:780);for(let j=0;j<n;j++){const a=spin+j*Math.PI*2/n;waves.push({x:e.x+7,y:e.y+7,vx:Math.cos(a)*(rage?1.8:1.45),vy:Math.sin(a)*(rage?1.8:1.45),life:125,enemy:true,kind:'emberSovereign'})}if(rage&&Math.random()<.45){for(let j=0;j<4;j++){const a=j*Math.PI/2;waves.push({x:e.x+7,y:e.y+7,vx:Math.cos(a)*2.2,vy:Math.sin(a)*2.2,life:90,enemy:true,kind:'emberSovereign'})}}}}_v31Enemies()};