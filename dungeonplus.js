/* v28 dungeon depth: traps, pillars, breakable pots, clear-gates, generic dungeon maps */
const ROOM_FEATURES={};
const CLEAR_GATES={};
function hashN(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
for(const k of Object.keys(INTERIORS).filter(k=>INTERIORS[k].dungeon)){
 const h=hashN(k),f={pillars:[],spikes:[],pots:[]};
 const pspots=[[5,5],[10,5],[5,9],[10,9],[7,6],[9,10]];
 for(let n=0;n<2+(h%2);n++){const p=pspots[(h+n*3)%pspots.length];if(!f.pillars.some(q=>q[0]===p[0]&&q[1]===p[1]))f.pillars.push(p)}
 const sspots=[[7,5],[9,5],[6,8],[10,8],[8,10]];if((h>>3)%3!==0)f.spikes.push(sspots[(h>>4)%sspots.length]);if((h>>7)%4===0)f.spikes.push(sspots[(h>>9)%sspots.length]);
 const pots=[[4,7],[12,7],[7,4],[9,11]];for(let n=0;n<2;n++)f.pots.push(pots[(h+n*2)%pots.length]);ROOM_FEATURES[k]=f;
}
for(const d of DUNGEON_DEFS){CLEAR_GATES[lockToken(d.p+'9',d.p+'11')]=d.p+'9'}
const _v28DungeonLink=dungeonLink;
dungeonLink=function(dir){const to=DUNGEON_LINKS[insideKey]?.[dir];if(!to)return null;const token=lockToken(insideKey,to),clearRoom=CLEAR_GATES[token];if(clearRoom&&G?.interiorStates?.[clearRoom]&&!G.interiorStates[clearRoom].cleared)return null;return _v28DungeonLink(dir)};
const _v28Solid=solidPixel;
solidPixel=function(px,py){if(insideKey&&INTERIORS[insideKey]?.dungeon){const tx=Math.floor(px/T),ty=Math.floor(py/T),f=ROOM_FEATURES[insideKey];if(f?.pillars?.some(p=>p[0]===tx&&p[1]===ty))return true}return _v28Solid(px,py)};
function potToken(i){return`pot:${insideKey}:${i}`}
function hitPots(){if(!insideKey||!INTERIORS[insideKey]?.dungeon)return;const sw=swordLine();if(!sw)return;const f=ROOM_FEATURES[insideKey];if(!f)return;for(let i=0;i<f.pots.length;i++){const [tx,ty]=f.pots[i],token=potToken(i);if(G.taken.has(token))continue;const px=tx*T+8,py=ty*T+8;if(segmentDistance(px,py,...sw)<10){G.taken.add(token);effects.push({kind:'burst',x:px,y:py,t:0});const r=(hashN(token)+G.screenSteps)%4;state().drops.push({x:px,y:py,type:r===0?'heart':r===1?'magic':'rupee',value:r>1?1:6});sfx('hit');saveGame()}}}
let spikeClock=0;
function applyRoomTraps(){if(!insideKey||!INTERIORS[insideKey]?.dungeon||invuln)return;const f=ROOM_FEATURES[insideKey];if(!f)return;const tx=Math.floor((x+8)/T),ty=Math.floor((y+8)/T);if(f.spikes.some(p=>p[0]===tx&&p[1]===ty)){spikeClock++;if(spikeClock>22){spikeClock=0;G.hp--;invuln=52;sfx('hit');buzz(25);say('Spikes!',45);if(G.hp<=0)playerDeath()}}else spikeClock=0}
const _v28Update=update;
update=function(){_v28Update();if(inventoryOpen||titleOpen||mapOpen||slide)return;hitPots();applyRoomTraps()};