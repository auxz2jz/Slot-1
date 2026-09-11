/* v21 presentation + audio systems */
let titleOpen=true,titleLatch=false,titlePulse=0,musicStep=0,musicNext=0,lastTrack='';
function trackKey(){if(insideKey)return INTERIORS[insideKey]?.dungeon?'dungeon':INTERIORS[insideKey]?.shop?'shop':'cave';return WORLD[id]?.bi||'field'}
const MUSIC={
 field:[262,330,392,330,294,349,440,349],forest:[220,277,330,277,247,294,370,294],ridge:[196,247,294,247,220,262,330,262],marsh:[175,220,262,220,196,247,294,247],shadow:[147,185,220,175,147,196,233,185],ruin:[196,233,294,233,175,220,262,220],ash:[165,208,247,196,165,220,262,208],highland:[294,370,440,370,330,392,494,392],dungeon:[131,165,196,165,123,147,185,147],cave:[147,175,220,175,131,165,196,165],shop:[330,392,494,392,349,440,523,440]
};
function musicTick(){if(!audioCtx||audioCtx.state!=='running'||titleOpen)return;const now=performance.now(),key=trackKey();if(key!==lastTrack){musicStep=0;musicNext=now;lastTrack=key}if(now<musicNext)return;const seq=MUSIC[key]||MUSIC.field,n=seq[musicStep%seq.length],root=seq[(musicStep+5)%seq.length]/2;tone(n,.12,'square',.006);if(musicStep%2===0)tone(root,.18,'triangle',.004,.015);musicStep++;musicNext=now+230}
const _v20Update=update;
update=function(){
  readGamepad();
  const A=KEYS.has('Space')||KEYS.has('Enter')||gpA;
  if(titleOpen){titlePulse++;if(A&&!titleLatch){titleOpen=false;initAudio();sfx('secret');message='Explore Emberwood';messageTimer=90}titleLatch=A;return}
  titleLatch=A;
  _v20Update();musicTick();
};
const _v20DamageEnemy=damageEnemy;
damageEnemy=function(e,amount=1,ang=face){const was=e.hp;_v20DamageEnemy(e,amount,ang);if(was>0&&e.hp<=0){effects.push({kind:'burst',x:e.x+7,y:e.y+7,t:0});screenShake=Math.max(screenShake,2)}};
const _v20UpdateDrops=updateDrops;
updateDrops=function(){const before=state().drops.filter(d=>!d.got).length;_v20UpdateDrops();const after=state().drops.filter(d=>!d.got).length;if(after<before)effects.push({kind:'spark',x:x+8,y:y+7,t:0})};

/* v24 NPC dialogue */
function nearbyNpc(){if(insideKey||id!==43)return null;const tx=Math.floor((x+8)/T),ty=Math.floor((y+8)/T);let best=null,bestD=99;for(const o of WORLD[id].objects){if(!o.type.startsWith('npc'))continue;const d=Math.abs(tx-o.x)+Math.abs(ty-o.y);if(d<bestD){best=o;bestD=d}}return bestD<=2?best:null}
function tryTalkNpc(){const o=nearbyNpc();if(!o)return false;const arr=NPC_TEXT[o.type]||['The traveler nods.'];let text=arr[(G.screenSteps+o.x+o.y)%arr.length];if(o.type==='npcElder'&&!G.taken.has('elderBlessing')){G.taken.add('elderBlessing');G.hp=G.maxHp;text='Elder Rowan blesses your journey. Your strength is restored.';sfx('secret');saveGame()}say(text,190);return true}
const _v23TrackKey=trackKey;
trackKey=function(){if(!insideKey&&id===43)return'shop';return _v23TrackKey()};

/* v26 movement + impact feedback */
let footFxTimer=0;
const _v25SystemsUpdate=update;
update=function(){const ox=x,oy=y,oldInside=insideKey,oldId=id;_v25SystemsUpdate();if(titleOpen||mapOpen||slide)return;if(footFxTimer>0)footFxTimer--;const moved=Math.hypot(x-ox,y-oy)>.25;if(moved&&footFxTimer<=0&&attack<11){const biome=insideKey?(INTERIORS[insideKey]?.theme==='tide'?'water':'stone'):(WORLD[id]?.bi||'field');effects.push({kind:'step',x:x+8,y:y+14,t:0,biome});footFxTimer=11}if(oldInside!==insideKey||oldId!==id)footFxTimer=8};
const _v25DamageEnemy=damageEnemy;
damageEnemy=function(e,amount=1,ang=face){const was=e.hp;_v25DamageEnemy(e,amount,ang);if(was>0&&e.hp>0)effects.push({kind:'hitSpark',x:e.x+7,y:e.y+7,t:0})};
