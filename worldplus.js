/* v33 interactive world: cuttable grass and boss-health progression */
const GRASS={};
for(let i=0;i<WORLD.length;i++){const a=[];for(let n=0;n<7;n++){const tx=2+((i*7+n*5)%12),ty=2+((i*11+n*7)%10);if(!WORLD[i].objects.some(o=>o.x===tx&&o.y===ty)&&!(tx>=6&&tx<=9&&ty>=6&&ty<=9))a.push([tx,ty])}GRASS[i]=a}
function cutGrass(){if(insideKey)return;const sw=swordLine();if(!sw)return;for(let i=0;i<GRASS[id].length;i++){const [tx,ty]=GRASS[id][i],token=`grass:${id}:${i}`;if(G.taken.has(token))continue;const px=tx*T+8,py=ty*T+8;if(segmentDistance(px,py,...sw)<10){G.taken.add(token);effects.push({kind:'grassCut',x:px,y:py,t:0});const r=(id*17+i*13+G.screenSteps)%8;if(r===0)state().drops.push({x:px,y:py,type:'heart'});else if(r===1)state().drops.push({x:px,y:py,type:'magic',value:5});else if(r===2)state().drops.push({x:px,y:py,type:'rupee',value:1});saveGame()}}}
const _v33Drops=updateDrops;
updateDrops=function(){const before=G.shards;_v33Drops();if(G.shards>before&&G.shards%2===0&&G.maxHp<12){G.maxHp++;G.hp=G.maxHp;sfx('secret');say('Boss vitality absorbed — maximum health increased!',120);saveGame()}};
const _v33Update=update;
update=function(){_v33Update();if(!titleOpen&&!mapOpen&&!inventoryOpen&&!slide)cutGrass()};