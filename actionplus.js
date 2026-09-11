/* v29 combat/action pass: charge-spin, magic effects, stronger feedback */
let chargeFrames=0,spinFrames=0,spinHits=new Set(),spinLatch=false;
const _v29Update=update;
update=function(){
 const A=KEYS.has('Space')||KEYS.has('Enter')||gpA;
 if(!titleOpen&&!mapOpen&&!inventoryOpen&&!slide){if(A&&attack<=0)chargeFrames=Math.min(75,chargeFrames+1);if(!A&&chargeFrames>=42&&!spinLatch){spinFrames=20;spinHits.clear();spinLatch=true;sfx('secret');screenShake=Math.max(screenShake,3)}if(A)spinLatch=false;if(!A&&chargeFrames<42)spinLatch=false;if(!A)chargeFrames=0}
 _v29Update();
 if(spinFrames>0){spinFrames--;const rad=27;for(const e of state().enemies){if(e.hp<=0||spinHits.has(e.id))continue;if(Math.hypot(e.x+7-(x+8),e.y+7-(y+8))<rad){spinHits.add(e.id);damageEnemy(e,G.taken.has('reward:tide5')?3:2,Math.atan2(e.y+7-y-8,e.x+7-x-8))}}}
};