/* v37 labyrinth/world-structure pass */
const V37_VERSION='37';

/* --- Quiet pickups and small pottery break effects --- */
const _v37UpdateDrops=updateDrops;
updateDrops=function(){
  const fxStart=effects.length;
  _v37UpdateDrops();
  if(effects.length>fxStart){
    const keep=effects.slice(fxStart).filter(f=>f.kind!=='spark');
    effects.splice(fxStart,effects.length-fxStart,...keep);
  }
};
hitPots=function(){
  if(!insideKey||!INTERIORS[insideKey]?.dungeon)return;
  const sw=swordLine();if(!sw)return;
  const f=ROOM_FEATURES[insideKey];if(!f)return;
  for(let i=0;i<f.pots.length;i++){
    const [tx,ty]=f.pots[i],token=potToken(i);if(G.taken.has(token))continue;
    const px=tx*T+8,py=ty*T+8;
    if(segmentDistance(px,py,...sw)<10){
      G.taken.add(token);effects.push({kind:'potBreak',x:px,y:py,t:0});
      const r=(hashN(token)+G.screenSteps)%4;
      state().drops.push({x:px,y:py,type:r===0?'heart':r===1?'magic':'rupee',value:r>1?1:6});
      sfx('hit');saveGame();
    }
  }
};

/* --- Ember Candle: an early utility item for burning hidden routes --- */
if(!B_ITEMS.includes('emberCandle'))B_ITEMS.push('emberCandle');
ITEM_LABEL.emberCandle='EMBER CANDLE';
ITEM_REWARD_LABEL.emberCandle='Ember Candle';

function v37RoomState(key){
  if(!G.interiorStates[key])G.interiorStates[key]=roomState(INTERIORS[key].enemies||[],17000+Object.keys(INTERIORS).indexOf(key));
}
function addV37Interior(key,name,screen,x0,y0,reward=null){
  INTERIORS[key]={name,enemies:[],reward,dungeon:false,exit:'cave',returnId:screen,returnX:x0*T,returnY:Math.min(192,(y0+2)*T)};
}
WORLD[53].objects=WORLD[53].objects.filter(o=>!(o.x===3&&o.y===3));
WORLD[53].objects.push({x:3,y:3,type:'dungeonGate'});
PORTALS['53:3:3']={inside:'emberNook',method:'open',entrance:'cave'};
LANDMARKS[53]='Hermit Nook';
addV37Interior('emberNook','Hermit Nook',53,3,3,null);

const V37_BURN_CAVES=[
  {screen:24,x:4,y:4,key:'brushCave0',name:'Briar Cache',reward:'rupees50'},
  {screen:72,x:11,y:9,key:'brushCave1',name:'Rootbound Hollow',reward:'heartContainer'},
  {screen:86,x:5,y:4,key:'brushCave2',name:'Powder Burrow',reward:'bombBag'},
  {screen:39,x:11,y:5,key:'brushCave3',name:'Old Pilgrim Cave',reward:'rupees20'}
];
for(const c of V37_BURN_CAVES){
  WORLD[c.screen].objects=WORLD[c.screen].objects.filter(o=>!(o.x===c.x&&o.y===c.y));
  WORLD[c.screen].objects.push({x:c.x,y:c.y,type:'burnBush'});
  PORTALS[`${c.screen}:${c.x}:${c.y}`]={inside:c.key,method:'open',entrance:'cave'};
  addV37Interior(c.key,c.name,c.screen,c.x,c.y,c.reward);
}
function ensureV37States(){
  if(!G)return;
  v37RoomState('emberNook');
  for(const c of V37_BURN_CAVES)v37RoomState(c.key);
}
ensureV37States();
const _v37NewGame=newGame;
newGame=function(clear=false){_v37NewGame(clear);ensureV37States()};
const _v37LoadGame=loadGame;
loadGame=function(){const ok=_v37LoadGame();if(ok)ensureV37States();return ok};
const _v37EnterInterior=enterInterior;
enterInterior=function(key){
  _v37EnterInterior(key);ensureV37States();
  if(key==='emberNook'&&!G.taken.has('v37:emberCandle')&&!state().drops.some(d=>!d.got&&d.type==='emberCandle')){
    state().drops.push({x:128,y:104,type:'emberCandle',key:'v37:emberCandle'});
    say('A warm ember glows on the old altar.',120);
  }
};

const _v37BaseSolid=baseSolid;
baseSolid=function(i,tx,ty){
  const o=objectAt(i,tx,ty);
  if(o?.type==='burnBush')return !G.taken.has(`burnbush:${worldKey(i,tx,ty)}`);
  return _v37BaseSolid(i,tx,ty);
};

const _v37GridNeighbor=neighbor;
const V37_OPEN_EDGES=new Set();
const V37_SECRET_EDGES=new Set();
function v37Edge(a,b){return a<b?`${a}-${b}`:`${b}-${a}`}
function v37GridNeighbors(i){const out=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=_v37GridNeighbor(i,dx,dy);if(n!=null)out.push(n)}return out}
(function buildV37Topology(){
  const seen=new Set([54]),stack=[54];
  while(stack.length){
    const cur=stack[stack.length-1];
    const choices=v37GridNeighbors(cur).filter(n=>!seen.has(n)).sort((a,b)=>(hashN(`maze:${cur}:${a}`)%100000)-(hashN(`maze:${cur}:${b}`)%100000));
    if(!choices.length){stack.pop();continue}
    const n=choices[0];V37_OPEN_EDGES.add(v37Edge(cur,n));seen.add(n);stack.push(n);
  }
  if(typeof ROADS!=='undefined')for(const [i,dirs] of ROADS.entries())for(const [dx,dy] of dirs){const n=_v37GridNeighbor(i,dx,dy);if(n!=null)V37_OPEN_EDGES.add(v37Edge(i,n))}
  for(const [a,b] of [[53,54],[44,54],[54,55],[54,64],[43,53]])V37_OPEN_EDGES.add(v37Edge(a,b));
  const candidates=[];
  for(let i=0;i<WORLD.length;i++)for(const [dx,dy] of [[1,0],[0,1]]){const n=_v37GridNeighbor(i,dx,dy);if(n!=null&&!V37_OPEN_EDGES.has(v37Edge(i,n)))candidates.push([i,n])}
  candidates.sort((a,b)=>(hashN('loop:'+v37Edge(...a))%100000)-(hashN('loop:'+v37Edge(...b))%100000));
  for(const [a,b] of candidates.slice(0,22))V37_OPEN_EDGES.add(v37Edge(a,b));
  const secrets=candidates.filter(([a,b])=>!V37_OPEN_EDGES.has(v37Edge(a,b))).sort((a,b)=>(hashN('secret:'+v37Edge(...a))%100000)-(hashN('secret:'+v37Edge(...b))%100000));
  for(const [a,b] of secrets.slice(0,12))V37_SECRET_EDGES.add(v37Edge(a,b));
})();
neighbor=function(i,dx,dy){
  const n=_v37GridNeighbor(i,dx,dy);if(n==null)return null;
  const e=v37Edge(i,n);
  if(V37_OPEN_EDGES.has(e)||G?.taken?.has('burnedge:'+e))return n;
  return null;
};
function v37SecretFromScreen(screen){
  const out=[];
  for(const e of V37_SECRET_EDGES){const [a,b]=e.split('-').map(Number);if(a!==screen&&b!==screen)continue;const to=a===screen?b:a,dx=(to%WW)-(screen%WW),dy=((to/WW)|0)-((screen/WW)|0);out.push({edge:e,to,dx,dy})}
  return out;
}
function v37EdgeBushPoint(s){
  if(s.dx>0)return{x:247,y:120};if(s.dx<0)return{x:9,y:120};if(s.dy>0)return{x:128,y:231};return{x:128,y:9};
}

function v37BurnTarget(){
  if(insideKey)return null;
  const cx=x+8,cy=y+8,fx=Math.cos(face),fy=Math.sin(face);
  for(const o of WORLD[id].objects){
    if(o.type!=='burnBush')continue;const token=`burnbush:${worldKey(id,o.x,o.y)}`;if(G.taken.has(token))continue;
    const px=o.x*T+8,py=o.y*T+8,vx=px-cx,vy=py-cy,m=Math.hypot(vx,vy)||1;
    if(m<48&&(vx/m)*fx+(vy/m)*fy>.25)return{type:'cave',token,x:px,y:py};
  }
  for(const s of v37SecretFromScreen(id)){
    if(G.taken.has('burnedge:'+s.edge))continue;const p=v37EdgeBushPoint(s),vx=p.x-cx,vy=p.y-cy,m=Math.hypot(vx,vy)||1;
    if(m<54&&(vx/m)*fx+(vy/m)*fy>.20)return{type:'edge',token:'burnedge:'+s.edge,x:p.x,y:p.y};
  }
  return null;
}
function useEmberCandle(){
  if(!G.items.has('emberCandle'))return say('You do not have the Ember Candle.');
  if(G.magic<1)return say('Not enough magic.');
  G.magic=Math.max(0,G.magic-1);
  const tx=x+8+Math.cos(face)*18,ty=y+8+Math.sin(face)*18;
  effects.push({kind:'candleFlame',x:tx,y:ty,t:0});
  const target=v37BurnTarget();
  if(target){G.taken.add(target.token);effects.push({kind:'bushBurn',x:target.x,y:target.y,t:0});sfx('secret');say(target.type==='edge'?'A hidden trail opens!':'The brush burns away, revealing a cave!',130);saveGame()}
  for(const e of state().enemies)if(e.hp>0&&Math.hypot(e.x+7-tx,e.y+7-ty)<22)damageEnemy(e,1,face);
}
const _v37UseB=useBItem;
useBItem=function(){if(G.selected==='emberCandle')useEmberCandle();else _v37UseB()};

const V37_LAYOUTS={
 verdant:{coords:[[2,5],[1,5],[3,5],[2,4],[0,5],[4,5],[2,3],[0,4],[4,4],[2,2],[0,3],[3,2]],edges:[[0,1],[0,2],[0,3],[1,4],[4,7],[7,10],[2,5],[5,8],[3,6],[6,9],[9,11]]},
 crystal:{coords:[[1,5],[1,4],[2,5],[1,3],[0,3],[2,3],[1,2],[0,2],[2,2],[1,1],[0,1],[2,1]],edges:[[0,1],[0,2],[1,3],[3,4],[3,5],[3,6],[4,7],[5,8],[6,9],[9,10],[9,11]]},
 storm:{coords:[[2,6],[2,5],[3,6],[2,4],[1,4],[3,4],[2,3],[1,3],[3,3],[2,2],[2,1],[3,2]],edges:[[0,1],[0,2],[1,3],[3,4],[3,5],[3,6],[4,7],[5,8],[6,9],[9,10],[9,11]]},
 cinder:{coords:[[0,5],[1,5],[1,4],[2,4],[3,4],[3,3],[2,3],[1,3],[0,3],[2,2],[1,2],[3,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[6,9],[9,10],[9,11]]},
 moon:{coords:[[2,4],[1,4],[3,4],[2,3],[0,4],[4,4],[2,2],[1,2],[3,2],[2,1],[1,1],[3,1]],edges:[[0,1],[1,4],[0,2],[2,5],[0,3],[3,6],[6,7],[6,8],[6,9],[9,10],[9,11]]},
 citadel:{coords:[[2,5],[2,4],[1,4],[3,4],[1,3],[2,3],[3,3],[3,2]],edges:[[0,1],[1,2],[1,3],[2,4],[3,6],[1,5],[5,6],[5,7]]}
};
function v37Direction(a,b){const dx=b[0]-a[0],dy=b[1]-a[1];if(Math.abs(dx)>Math.abs(dy))return dx>0?'R':'L';return dy>0?'D':'U'}
function applyV37Layout(prefix,layout){
  const count=layout.coords.length;
  for(let i=0;i<count;i++){const k=prefix+i;DUNGEON_COORDS[k]=layout.coords[i];DUNGEON_LINKS[k]={}}
  for(const [a,b] of layout.edges){const ka=prefix+a,kb=prefix+b,da=v37Direction(layout.coords[a],layout.coords[b]),db=opposite(da);DUNGEON_LINKS[ka][da]=kb;DUNGEON_LINKS[kb][db]=ka}
  if(typeof V35_DUNGEONS!=='undefined'){const d=V35_DUNGEONS.find(v=>v.id===prefix);if(d)d.coords=layout.coords.slice()}
}
for(const [p,l] of Object.entries(V37_LAYOUTS))applyV37Layout(p,l);

const V37_DUNGEON_SECRETS={};
function addDungeonSecret(a,b,method){
  const pa=DUNGEON_COORDS[a],pb=DUNGEON_COORDS[b];if(!pa||!pb)return;const da=v37Direction(pa,pb),db=opposite(da),token=`v37secret:${[a,b].sort().join('|')}`;
  (V37_DUNGEON_SECRETS[a]??={})[da]={to:b,method,token};(V37_DUNGEON_SECRETS[b]??={})[db]={to:a,method,token};
}
addDungeonSecret('verdant3','verdant7','candle');
addDungeonSecret('crystal6','crystal8','bomb');
addDungeonSecret('storm6','storm8','bomb');
addDungeonSecret('cinder3','cinder6','candle');
addDungeonSecret('moon7','moon10','bomb');

const _v37DungeonLink=dungeonLink;
dungeonLink=function(dir){
  const normal=_v37DungeonLink(dir);if(normal)return normal;
  const s=V37_DUNGEON_SECRETS[insideKey]?.[dir];if(s&&G.taken.has(s.token))return s.to;
  return null;
};
function v37NearDungeonWall(dir,bx,by){if(dir==='L')return bx<38;if(dir==='R')return bx>218;if(dir==='U')return by<38;return by>202}
function v37UnlockDungeonSecret(method,bx,by){
  if(!insideKey)return false;const sec=V37_DUNGEON_SECRETS[insideKey]||{};
  for(const [dir,s] of Object.entries(sec))if(s.method===method&&!G.taken.has(s.token)&&v37NearDungeonWall(dir,bx,by)){
    G.taken.add(s.token);sfx('secret');effects.push({kind:method==='bomb'?'wallBreak':'bushBurn',x:bx,y:by,t:0});say(method==='bomb'?'A hidden wall collapses!':'Hidden roots burn away!',120);saveGame();return true
  }
  return false;
}
const _v37Explode=explode;
explode=function(b){const wasInside=!!insideKey;_v37Explode(b);if(wasInside)v37UnlockDungeonSecret('bomb',b.x,b.y)};
const _v37Candle=useEmberCandle;
useEmberCandle=function(){const bx=x+8+Math.cos(face)*22,by=y+8+Math.sin(face)*22;if(insideKey&&G.magic>=1&&v37UnlockDungeonSecret('candle',bx,by)){G.magic--;effects.push({kind:'candleFlame',x:bx,y:by,t:0});return}_v37Candle()};

const V37_ROOM_SHAPE={};
for(const d of [...DUNGEON_DEFS,{p:'citadel'}]){
  const max=d.p==='citadel'?8:12;
  for(let i=0;i<max;i++){const k=d.p+i,r=hashN('shape:'+k)%7;V37_ROOM_SHAPE[k]=i===0||i===max-1?'large':r<2?'small':r<4?'wide':r<6?'tall':'large'}
}
function v37ShapeBounds(shape){return shape==='small'?{l:48,r:207,t:48,b:191}:shape==='wide'?{l:16,r:239,t:48,b:191}:shape==='tall'?{l:48,r:207,t:16,b:223}:null}
const _v37SolidPixel=solidPixel;
solidPixel=function(px,py){
  if(insideKey&&INTERIORS[insideKey]?.dungeon){const bounds=v37ShapeBounds(V37_ROOM_SHAPE[insideKey]);if(bounds){const passH=py>=96&&py<=160,passV=px>=96&&px<=160,L=dungeonLink('L'),R=dungeonLink('R'),U=dungeonLink('U'),D=dungeonLink('D');if(px<bounds.l&&!(L&&passH))return true;if(px>bounds.r&&!(R&&passH))return true;if(py<bounds.t&&!(U&&passV))return true;if(py>bounds.b&&!(D&&passV))return true}}
  return _v37SolidPixel(px,py);
};

const V37_VARIANTS={field:['thornling','fieldRunner'],forest:['mossBoar','leafWisp'],ridge:['stoneCrab','ridgeArcher'],marsh:['mireLeech','bogSpitter'],shadow:['duskWisp','shadeKnight'],ruin:['bronzeSentry','ruinCrawler'],ash:['emberImp','coalHound'],highland:['galeHawk','cliffRam']};
function v37VariantFor(screen,index){const bi=WORLD[screen]?.bi||'field',list=V37_VARIANTS[bi]||V37_VARIANTS.field;return list[(hashN(`variant:${screen}:${index}`)%list.length)]}
function applyV37EnemyVariants(){
  if(!G?.worldStates)return;
  for(let i=0;i<WORLD.length;i++){const R=G.worldStates[i];if(!R)continue;for(let j=0;j<R.enemies.length;j++){const e=R.enemies[j];if(!e||e.type==='warden')continue;e.v37Variant=v37VariantFor(i,j);if(!e.v37Boosted){if(['stoneCrab','shadeKnight','bronzeSentry','cliffRam'].includes(e.v37Variant))e.hp+=1;e.v37Boosted=true;e.v37Timer=30+(hashN(e.id)%70)}}}
}
applyV37EnemyVariants();
const _v37Respawn=typeof respawnWorldEnemies==='function'?respawnWorldEnemies:null;
if(_v37Respawn)respawnWorldEnemies=function(i){_v37Respawn(i);const R=G.worldStates[i];if(R)for(let j=0;j<R.enemies.length;j++){const e=R.enemies[j];e.v37Variant=v37VariantFor(i,j);e.v37Boosted=true;e.v37Timer=30+(hashN(e.id)%70)}};
const _v37Enemies=updateEnemies;
updateEnemies=function(){
  _v37Enemies();
  if(insideKey)return;
  for(const e of state().enemies){if(e.hp<=0||!e.v37Variant)continue;e.v37Timer=(e.v37Timer||40)-1;if(e.v37Timer>0)continue;e.v37Timer=50+(hashN(e.id+':'+G.screenSteps)%80);
    const vx=x+8-(e.x+7),vy=y+8-(e.y+7),m=Math.hypot(vx,vy)||1;
    if(['bogSpitter','ridgeArcher','bronzeSentry','emberImp','duskWisp'].includes(e.v37Variant)){
      const sp=e.v37Variant==='ridgeArcher'?1.65:e.v37Variant==='emberImp'?1.45:1.25;
      waves.push({x:e.x+7,y:e.y+7,vx:vx/m*sp,vy:vy/m*sp,life:90,enemy:true,kind:'v37:'+e.v37Variant});
    }else if(['mossBoar','fieldRunner','coalHound','cliffRam'].includes(e.v37Variant)&&m<100){
      const nx=e.x+vx/m*4,ny=e.y+vy/m*4;if(enemyCanMove(nx,ny)){e.x=nx;e.y=ny}
    }
  }
};

const _v37Objective=objective;
objective=function(){const base=_v37Objective()||'';return `${base}${base?' · ':''}Secret trails ${[...G.taken].filter(t=>t.startsWith('burnedge:')).length}/${V37_SECRET_EDGES.size}`};
