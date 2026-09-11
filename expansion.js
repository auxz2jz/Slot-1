/* v27 full-length expansion: 8-shard quest, five 12-room dungeons, gear, magic, self-damaging bombs */
C.width=768;C.height=720;ctx.setTransform(3,0,0,3,0,0);ctx.imageSmoothingEnabled=false;
const SHARD_GOAL=8;
const B_ITEMS=['bomb','disc','sunBow','emberRod'];
const ITEM_LABEL={bomb:'BOMB',disc:'WIND DISC',sunBow:'SUN BOW',emberRod:'EMBER ROD'};
const ITEM_REWARD_LABEL={sunBow:'Sun Bow',verdantRing:'Verdant Ring',masterKey:'Master Key',stormBoots:'Storm Boots',mirrorShield:'Mirror Shield',emberRod:'Ember Rod',emberTunic:'Ember Tunic',moonRing:'Moon Ring',shadowCloak:'Shadow Cloak',tideTunic:'Tide Tunic',guardianRing:'Guardian Ring'};
const SPECIAL_REWARDS={gate2:'guardianRing',tide3:'tideTunic'};
const DUNGEON_LOCKS={};
const DUNGEON_INFO={};
const DUNGEON_COORDS={};
const DUNGEON_DEFS=[
 {p:'verdant',name:'Verdant Labyrinth',screen:27,x:8,y:3,method:'open',theme:'verdant',boss:'rootLord',main:'sunBow',side:'verdantRing'},
 {p:'crystal',name:'Crystal Mines',screen:11,x:8,y:10,method:'bomb',theme:'crystal',boss:'crystalMaw',main:'masterKey',side:null},
 {p:'storm',name:'Storm Bastion',screen:4,x:8,y:3,method:'key',theme:'storm',boss:'stormEye',main:'stormBoots',side:'mirrorShield'},
 {p:'cinder',name:'Cinder Forge',screen:18,x:8,y:10,method:'bomb',theme:'cinder',boss:'forgeLord',main:'emberRod',side:'emberTunic'},
 {p:'moon',name:'Moon Barrow',screen:97,x:8,y:10,method:'push',theme:'moon',boss:'moonKnight',main:'moonRing',side:'shadowCloak'}
];
function opposite(d){return d==='U'?'D':d==='D'?'U':d==='L'?'R':'L'}
function lockToken(a,b){return [a,b].sort().join('|')}
function addDungeon(def){
 const objType=def.method==='bomb'?'bombWall':def.method==='push'?'pushRock':def.method==='key'?'lockedGate':'dungeonGate';
 WORLD[def.screen].objects=WORLD[def.screen].objects.filter(o=>!(o.x===def.x&&o.y===def.y));WORLD[def.screen].objects.push({x:def.x,y:def.y,type:objType});
 PORTALS[`${def.screen}:${def.x}:${def.y}`]={inside:def.p+'0',method:def.method,entrance:def.method==='push'?'stairs':def.method==='bomb'?'cave':'door'};LANDMARKS[def.screen]=def.name;
 const coords=[[1,3],[0,3],[2,3],[1,2],[0,2],[2,2],[1,1],[0,1],[2,1],[1,0],[0,0],[2,0]], names=['Entry','Lower West','Lower East','Cross Hall','West Vault','East Vault','Inner Court','Rune Hall','Treasure Hall','Upper Hall','Sanctum','Boss Chamber'];
 for(let i=0;i<12;i++){const k=def.p+i;DUNGEON_COORDS[k]=coords[i];INTERIORS[k]={name:`${def.name} - ${names[i]}`,enemies:i===11?[def.boss]:i===6?['knight','walker','hopper']:i===8?['bat','slime','walker']:i%3===0?['walker','hopper','walker']:i%3===1?['knight','walker','shrub']:['bat','slime','hopper'],reward:null,dungeon:true,theme:def.theme,entry:i===0};if(i===0)Object.assign(INTERIORS[k],{exit:def.method==='push'?'stairs':def.method==='bomb'?'cave':'door',returnId:def.screen,returnX:def.x*T,returnY:Math.min(192,(def.y+2)*T)});DUNGEON_INFO[k]=def;}
 INTERIORS[def.p+'11'].reward='shard';SPECIAL_REWARDS[def.p+'6']=def.main;if(def.side)SPECIAL_REWARDS[def.p+'8']=def.side;SPECIAL_REWARDS[def.p+'5']='key';
 const byPos=new Map(coords.map((c,i)=>[c.join(','),def.p+i]));
 for(let i=0;i<coords.length;i++){const [cx,cy]=coords[i],k=def.p+i,L={};for(const [d,dx,dy] of [['L',-1,0],['R',1,0],['U',0,-1],['D',0,1]]){const to=byPos.get([cx+dx,cy+dy].join(','));if(to)L[d]=to}DUNGEON_LINKS[k]=L;}
 const a=def.p+'6',b=def.p+'9';if(DUNGEON_LINKS[a]?.U===b)DUNGEON_LOCKS[lockToken(a,b)]=true;
}
for(const d of DUNGEON_DEFS)addDungeon(d);
[[26,27],[12,11],[6,5],[5,4],[8,18],[87,97]].forEach(([a,b])=>roadPair(a,b));
SPECIAL_REWARDS.gate2='guardianRing';SPECIAL_REWARDS.tide3='tideTunic';
const _v27Enemy=enemy;
enemy=function(type,index,seed=0,worldId=null){const e=_v27Enemy(type,index,seed,worldId),hp={rootLord:16,crystalMaw:18,stormEye:16,forgeLord:20,moonKnight:18}[type];if(hp){e.hp=hp;e.maxHp=hp;e.bossTimer=35+index*3}return e};
const _v27BaseGame=baseGame;
baseGame=function(){const g=_v27BaseGame();g.magic=32;g.maxMagic=32;g.outfit='traveler';g.damageCount=0;return g};
const _v27Hydrate=hydrateSets;
hydrateSets=function(){_v27Hydrate();if(!G.items)G.items=new Set(['bomb']);if(!(G.items instanceof Set))G.items=new Set(G.items||['bomb'])};
function ensureNewInteriorStates(){for(const k in INTERIORS)if(!G.interiorStates[k])G.interiorStates[k]=roomState(INTERIORS[k].enemies,1000+Object.keys(INTERIORS).indexOf(k))}
function v27SavePayload(){return{version:34,hp:G.hp,maxHp:G.maxHp,bombs:G.bombs,maxBombs:G.maxBombs,keys:G.keys,rupees:G.rupees,shards:G.shards,items:[...G.items],selected:G.selected,open:[...G.open],moved:[...G.moved],unlocked:[...G.unlocked],positions:G.positions,taken:[...G.taken],visited:[...G.visited],screenSteps:G.screenSteps,final:G.final,magic:G.magic,maxMagic:G.maxMagic,outfit:G.outfit,damageCount:G.damageCount,id,insideKey,x,y}};
savePayload=v27SavePayload;
const _v27NewGame=newGame;
newGame=function(clear=false){_v27NewGame(clear);G.magic=G.maxMagic=32;G.outfit='traveler';G.damageCount=0;ensureNewInteriorStates();saveGame()};
loadGame=function(){try{const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem('emberwood_v16')||localStorage.getItem('emberwood_v15');if(!raw)return false;const s=JSON.parse(raw);if(![15,16,17,27,34].includes(s.version))return false;G=baseGame();hydrateSets();ensureNewInteriorStates();if(G.worldStates[54]?.enemies[0])G.worldStates[54].enemies[0].guaranteed='bomb3';Object.assign(G,{hp:s.hp??3,maxHp:s.maxHp??3,bombs:s.bombs??0,maxBombs:s.maxBombs??8,keys:s.keys??0,rupees:s.rupees??0,shards:s.shards??0,selected:s.selected||'bomb',positions:s.positions||{},screenSteps:s.screenSteps||0,final:!!s.final,magic:s.magic??32,maxMagic:s.maxMagic??32,outfit:s.outfit||'traveler',damageCount:s.damageCount||0});G.open=new Set(s.open||[]);G.moved=new Set(s.moved||[]);G.unlocked=new Set(s.unlocked||[]);G.taken=new Set(s.taken||[]);G.visited=new Set(s.visited||[54]);G.items=new Set(s.items||['bomb']);if(!G.items.has(G.selected)||!B_ITEMS.includes(G.selected))G.selected='bomb';id=s.id??54;insideKey=s.insideKey||'';if(insideKey&&!INTERIORS[insideKey])insideKey='';x=s.x??120;y=s.y??160;face=-Math.PI/2;walk=attack=invuln=transitionCooldown=0;attackLatch=bombLatch=false;bombObjs=[];waves=[];effects=[];message='Progress restored';messageTimer=80;push={key:'',frames:0};mapOpen=false;slide=null;shopCursor=0;screenShake=0;discs=[];lastSave=performance.now();saveGame();return true}catch(e){return false}};
const _v27PortalReady=portalReady;
portalReady=function(k,p){if(p.method==='shards')return G.shards>=SHARD_GOAL;return _v27PortalReady(k,p)};
const _v27BaseSolid=baseSolid;
baseSolid=function(i,tx,ty){const o=objectAt(i,tx,ty);if(o?.type==='finalGate')return G.shards<SHARD_GOAL;if(o?.type==='water'&&G?.outfit==='tideTunic')return false;return _v27BaseSolid(i,tx,ty)};
const _v27Unlock=unlockNearby;
unlockNearby=function(){if(insideKey)return;const tx=Math.floor((x+8)/T),ty=Math.floor((y+8)/T);for(const k in PORTALS){const p=PORTALS[k],[ri,px,py]=k.split(':').map(Number);if(ri===id&&p.method==='key'&&!G.unlocked.has(k)&&Math.abs(tx-px)+Math.abs(ty-py)<=1){if(G.items.has('masterKey')){G.unlocked.add(k);sfx('door');say('The Master Key opens the gate.');saveGame();return}if(G.keys>0){G.keys--;G.unlocked.add(k);sfx('door');say('The lock opens.');saveGame();return}}}};
const _v27DungeonLink=dungeonLink;
dungeonLink=function(dir){const to=DUNGEON_LINKS[insideKey]?.[dir];if(!to)return null;const token=lockToken(insideKey,to);if(DUNGEON_LOCKS[token]&&!G.items.has('masterKey')&&!G.unlocked.has('d:'+token))return null;return to};
function unlockDungeonNearby(){if(!insideKey||!INTERIORS[insideKey]?.dungeon)return;const raw=DUNGEON_LINKS[insideKey]||{};let dir=null;if(x<28&&raw.L)dir='L';else if(x>212&&raw.R)dir='R';else if(y<30&&raw.U)dir='U';else if(y>194&&raw.D)dir='D';if(!dir)return;const to=raw[dir],token=lockToken(insideKey,to);if(!DUNGEON_LOCKS[token]||G.unlocked.has('d:'+token)||G.items.has('masterKey'))return;if(G.keys>0){G.keys--;G.unlocked.add('d:'+token);sfx('door');say('A dungeon key turns in the lock.');saveGame()}else say('Locked — find a small key.',70)}
function itemDrop(x0,y0,type,key){state().drops.push({x:x0,y:y0,type,key})}
const _v27UpdateEnemies=updateEnemies;
updateEnemies=function(){const R=state();for(const e of R.enemies){if(e.hp<=0||!e.maxHp)continue;e.bossTimer=(e.bossTimer??45)-1;if(e.bossTimer>0)continue;e.bossTimer=38+Math.random()*32;const n=e.type==='forgeLord'?10:e.type==='stormEye'?8:e.type==='crystalMaw'?6:e.type==='rootLord'?7:8;const spin=(performance.now()/900)+(e.type==='moonKnight'?Math.PI/8:0);for(let j=0;j<n;j++){const a=spin+j*Math.PI*2/n,sp=e.type==='stormEye'?1.75:e.type==='forgeLord'?1.35:1.2;waves.push({x:e.x+7,y:e.y+7,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:110,enemy:true,kind:e.type})}}const beforeHp=G.hp;_v27UpdateEnemies();if(G.items.has('moonRing')&&G.hp<beforeHp){G.damageCount=(G.damageCount||0)+1;if(G.damageCount%3===0){G.hp=Math.min(G.maxHp,G.hp+1);say('Moon Ring softens the blow.',55)}}if(insideKey&&R.cleared){const reward=SPECIAL_REWARDS[insideKey],token='special:'+insideKey;if(reward&&!G.taken.has(token)&&!R.drops.some(d=>d.key===token&&!d.got)){itemDrop(128,104,reward,token);say(`${ITEM_REWARD_LABEL[reward]||reward} appears!`,110)}}};
function acquireCustom(d){const type=d.type,token=d.key||('item:'+type);if(G.taken.has(token))return;G.taken.add(token);if(type==='key'){G.keys++;say('Small key acquired.');return}G.items.add(type);if(B_ITEMS.includes(type))G.selected=type;if(type==='masterKey')say('MASTER KEY — locked gates no longer consume keys!',170);else if(type==='stormBoots')say('Storm Boots — movement speed increased!',140);else if(type==='mirrorShield')say('Mirror Shield — projectiles are easier to block!',140);else if(type==='emberTunic'){G.outfit='emberTunic';say('Ember Tunic — protects against your own bombs!',150)}else if(type==='shadowCloak'){G.outfit='shadowCloak';say('Shadow Cloak — swift and light.',140)}else if(type==='tideTunic'){G.outfit='tideTunic';say('Tide Tunic acquired.',120)}else if(type==='sunBow')say('Sun Bow acquired — uses magic.',140);else if(type==='emberRod')say('Ember Rod acquired — powerful magic fire.',150);else say(`${ITEM_REWARD_LABEL[type]||type} acquired!`,120)}
function customPickupNear(){for(const d of state().drops){if(d.got)continue;if(d.type==='key'&&d.key&&Math.hypot(x+8-d.x,y+8-d.y)<13){d.got=true;G.taken.add(d.key);G.keys++;sfx('pickup');say('Small key acquired.');saveGame();continue}if(!ITEM_REWARD_LABEL[d.type])continue;if(Math.hypot(x+8-d.x,y+8-d.y)<13){d.got=true;sfx('secret');buzz([18,25,18]);acquireCustom(d);saveGame()}}}
const _v27UpdateDrops=updateDrops;
updateDrops=function(){customPickupNear();_v27UpdateDrops()};
ownedItems=function(){return B_ITEMS.filter(i=>i==='bomb'||G.items.has(i))};
cycleItem=function(){if(!G||mapOpen)return;const a=ownedItems();if(a.length<2)return say('No other B-items yet.');G.selected=a[(a.indexOf(G.selected)+1)%a.length];say(`${ITEM_LABEL[G.selected]} selected.`);saveGame()};
function fireSunBow(){if(!G.items.has('sunBow'))return;if(G.magic<2)return say('Not enough magic.');G.magic-=2;waves.push({x:x+8+Math.cos(face)*16,y:y+8+Math.sin(face)*16,vx:Math.cos(face)*4.4,vy:Math.sin(face)*4.4,life:72,enemy:false,kind:'arrow',power:2});sfx('sword')}
function fireEmberRod(){if(!G.items.has('emberRod'))return;if(G.magic<5)return say('Not enough magic.');G.magic-=5;waves.push({x:x+8+Math.cos(face)*17,y:y+8+Math.sin(face)*17,vx:Math.cos(face)*3,vy:Math.sin(face)*3,life:90,enemy:false,kind:'fire',power:3});sfx('secret')}
const _v27UseB=useBItem;
useBItem=function(){if(G.selected==='sunBow')fireSunBow();else if(G.selected==='emberRod')fireEmberRod();else _v27UseB()};
const _v27Explode=explode;
explode=function(b){const dist=Math.hypot(x+8-b.x,y+8-b.y),safe=G.outfit==='emberTunic'||G.items.has('emberTunic');_v27Explode(b);if(dist<39&&!safe&&!invuln){G.hp--;invuln=58;screenShake=Math.max(screenShake,14);say('Your bomb blast hurts!',60);if(G.hp<=0)playerDeath()}};
const _v27UpdateWaves=updateWaves;
updateWaves=function(){for(const z of waves){z.x+=z.vx;z.y+=z.vy;z.life--;if(solidPixel(z.x,z.y)){z.life=0;continue}if(z.enemy){if(Math.hypot(x+8-z.x,y+8-z.y)<9){const vx=z.x-(x+8),vy=z.y-(y+8),m=Math.hypot(vx,vy)||1,dot=Math.cos(face)*(vx/m)+Math.sin(face)*(vy/m),shieldGate=G.items.has('mirrorShield')?-.05:.25;if(!attack&&dot>shieldGate){z.life=0;effects.push({x:z.x,y:z.y,t:18,small:true});sfx('shield')}else if(!invuln){G.hp--;invuln=55;z.life=0;sfx('hit');buzz(30);G.damageCount=(G.damageCount||0)+1;if(G.items.has('guardianRing')&&G.damageCount%4===0)G.hp=Math.min(G.maxHp,G.hp+1);if(G.items.has('moonRing')&&G.damageCount%3===0)G.hp=Math.min(G.maxHp,G.hp+1);if(G.hp<=0)playerDeath()}}}else{for(const e of state().enemies)if(z.life>0&&e.hp>0&&Math.hypot(e.x+7-z.x,e.y+7-z.y)<10){damageEnemy(e,z.power||1,Math.atan2(z.vy,z.vx));z.life=0}}}waves=waves.filter(z=>z.life>0)};
const _v27DropEnemy=dropEnemy;
dropEnemy=function(e){if(e.guaranteed)return _v27DropEnemy(e);const R=state(),roll=Math.random(),lucky=G.items.has('verdantRing');if(lucky&&roll<.28){R.drops.push({x:e.x+7,y:e.y+7,type:'heart'});return}if(roll<.12){R.drops.push({x:e.x+7,y:e.y+7,type:'magic',value:6});return}_v27DropEnemy(e)};
const _v27BasePickup=updateDrops;
updateDrops=function(){for(const d of state().drops){if(d.got||d.type!=='magic')continue;if(Math.hypot(x+8-d.x,y+8-d.y)<13){d.got=true;G.magic=Math.min(G.maxMagic,G.magic+(d.value||5));sfx('pickup');saveGame()}}customPickupNear();_v27UpdateDrops()};
function cycleOutfit(){const list=['traveler',...(G.items.has('tideTunic')?['tideTunic']:[]),...(G.items.has('emberTunic')?['emberTunic']:[]),...(G.items.has('shadowCloak')?['shadowCloak']:[])];G.outfit=list[(list.indexOf(G.outfit)+1)%list.length];say(`Outfit: ${G.outfit==='traveler'?'Traveler Green':ITEM_REWARD_LABEL[G.outfit]}`);saveGame()}
let inventoryOpen=false;
function toggleInventory(){if(!G)return;inventoryOpen=!inventoryOpen;if(inventoryOpen)mapOpen=false}
const gearBtn=document.querySelector('#gearBtn'),invBtn=document.querySelector('#invBtn');if(gearBtn)gearBtn.onclick=cycleOutfit;if(invBtn)invBtn.onclick=toggleInventory;
addEventListener('keydown',e=>{if(e.code==='KeyE')cycleOutfit();if(e.code==='KeyI')toggleInventory()});
const _v27Update=update;
update=function(){if(inventoryOpen)return;const oid=id,oin=insideKey,ox=x,oy=y;_v27Update();unlockDungeonNearby();if(G&&G.magic<G.maxMagic&&performance.now()%1000<18)G.magic=Math.min(G.maxMagic,G.magic+(G.outfit==='tideTunic'?.5:.2));if(G&&(G.items.has('stormBoots')||G.outfit==='shadowCloak')&&!slide&&!mapOpen&&!titleOpen&&oid===id&&oin===insideKey){const dx=x-ox,dy=y-oy;if(Math.hypot(dx,dy)>.1){const nx=x+dx*(G.items.has('stormBoots')?.18:.10),ny=y+dy*(G.items.has('stormBoots')?.18:.10);if(canMove(nx,y))x=nx;if(canMove(x,ny))y=ny}}};
objective=function(){if(G.final)return'Relic restored — explore freely';if(G.shards>=SHARD_GOAL)return'All 8 Ember Shards found — reach the northern Ember Shrine';return`Ember Shards ${G.shards}/${SHARD_GOAL} · explore dungeons for gear, keys, magic and relics`};
