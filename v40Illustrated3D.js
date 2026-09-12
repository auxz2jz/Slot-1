/* Relic of Emberwood v40 — Illustrated 2.5D / continuous-facing renderer.
   Graphics-only layer: keeps all v39 gameplay, maps, collisions, saves and progression. */
(function(){
'use strict';
const TAU=Math.PI*2, A=Math.PI/2;
const norm=a=>{while(a<0)a+=TAU;while(a>=TAU)a-=TAU;return a};
const smooth=(a,b,t)=>a+(b-a)*t;
const rrect=(x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}};
const ell=(x,y,rx,ry,fill,a=1)=>{ctx.save();ctx.globalAlpha=a;ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.restore()};
const grad=(x0,y0,x1,y1,a,b)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
const shadow=(x,y,rx,ry=2,a=.22)=>{ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#07100a';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.restore()};
function imgReady(k){try{return typeof v39Ready==='function'&&v39Ready(k)}catch(e){return false}}
function paintImg(k,cx,foot,w,h,alpha=1,rot=0,flip=false){if(!imgReady(k))return false;ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,foot);ctx.rotate(rot);if(flip)ctx.scale(-1,1);ctx.drawImage(V39_ASSET[k],-w/2,-h,w,h);ctx.restore();return true}
function faceBlend(a){a=norm(a);const dirs=[['hero_right',0],['hero_front',A],['hero_left',Math.PI],['hero_back',3*A],['hero_right',TAU]];for(let i=0;i<4;i++){const p=dirs[i],q=dirs[i+1];if(a>=p[1]&&a<=q[1]){const t=(a-p[1])/(q[1]-p[1]);return[p[0],q[0],t]}}return['hero_right','hero_front',0]}

const oldHero=drawHero;
drawHero=function(){
 if(invuln&&((invuln/4)|0)%2)return;
 const [a,b,t]=faceBlend(norm(face));if(!imgReady(a)||!imgReady(b))return oldHero();
 const cx=x+8,fy=y+17,w=26,h=36,bob=(walk>0&&!attack)?Math.sin(walk*.84)*.75:0;
 shadow(cx,fy,7.6,2.2,.27);
 const yaw=(t-.5)*.10;
 paintImg(a,cx,fy+bob,w,h,1-t,-yaw);paintImg(b,cx,fy+bob,w,h,t,yaw);
 if(attack>0&&imgReady('hero_attack'))paintImg('hero_attack',cx+Math.cos(face)*2,fy+bob,w+4,h+2,.42,face-A);
};

const enemyArt={walker:'fieldRunner',hopper:'fieldRunner',shrub:'thornling',knight:'shadeKnight',slime:'mireLeech',bat:'duskWisp',thornling:'thornling',fieldRunner:'fieldRunner',mossBoar:'mossBoar',leafWisp:'leafWisp',stoneCrab:'stoneCrab',ridgeArcher:'ridgeArcher',mireLeech:'mireLeech',bogSpitter:'bogSpitter',duskWisp:'duskWisp',shadeKnight:'shadeKnight',ruinCrawler:'stoneCrab',emberImp:'emberImp',coalHound:'coalHound',galeHawk:'duskWisp',cliffRam:'mossBoar',bronzeSentry:'shadeKnight'};
const enemySize={thornling:[20,20],fieldRunner:[25,19],mossBoar:[30,23],leafWisp:[20,20],stoneCrab:[27,21],ridgeArcher:[23,25],mireLeech:[25,19],bogSpitter:[23,22],duskWisp:[22,23],shadeKnight:[24,29],emberImp:[21,25],coalHound:[31,24]};
const oldEnemy=drawEnemy;
function enemyFacing(e){if(Number.isFinite(e.vx)||Number.isFinite(e.vy))return Math.atan2(e.vy||0,e.vx||0);return [0,A,Math.PI,-A][(e.dir||0)&3]}
function vectorEnemy(e,kind){
 const cx=e.x+7,fy=e.y+15,ang=enemyFacing(e),s=e.maxHp?1.5:1,bob=['bat','slime','duskWisp','leafWisp'].includes(kind)?Math.sin(performance.now()/160+e.x)*1.2:0;
 shadow(cx,fy,7*s,2*s,.21);ctx.save();ctx.translate(cx,fy-9*s+bob);ctx.rotate(ang+A);
 const c=kind==='bat'?'#54436c':kind==='slime'?'#3d9f76':kind==='warden'?'#60482e':'#716753';
 ell(0,2*s,7*s,6*s,c);ell(-2*s,-1*s,2*s,1.5*s,'rgba(255,255,255,.25)');ell(-2.2*s,1*s,1*s,1*s,'#f5d76c');ell(2.2*s,1*s,1*s,1*s,'#f5d76c');ctx.restore();
}
drawEnemy=function(e){
 if(e.flash&&((e.flash/2)|0)%2)return;
 if(e.maxHp){const map={rootLord:'mossBoar',crystalMaw:'stoneCrab',stormEye:'duskWisp',forgeLord:'emberImp',moonKnight:'shadeKnight',emberSovereign:'coalHound',warden:'shadeKnight'},k=map[e.type]||'shadeKnight';if(imgReady(k)){const [w,h]=enemySize[k]||[30,30],cx=e.x+7,fy=e.y+16;shadow(cx,fy,10,2.8,.28);paintImg(k,cx,fy,w*1.45,h*1.45,1,enemyFacing(e)+A);return}return vectorEnemy(e,'warden')}
 const v=e.v37Variant||e.type,k=enemyArt[v];if(k&&imgReady(k)){const [w,h]=enemySize[k]||[23,23],cx=e.x+7,fy=e.y+15,bob=['duskWisp','leafWisp'].includes(k)?Math.sin(performance.now()/170+e.x)*1.2:0;if(!['duskWisp','leafWisp'].includes(k))shadow(cx,fy,Math.max(5,w*.30),2,.20);paintImg(k,cx,fy+bob,w,h,1,enemyFacing(e)+A);return}
 if(['bat','slime'].includes(e.type))return vectorEnemy(e,e.type);oldEnemy(e)
};

water=function(X,Y){ctx.fillStyle=grad(X,Y,X+16,Y+16,'#326f9e','#58a3c8');ctx.fillRect(X,Y,16,16);ctx.strokeStyle='rgba(218,249,255,.48)';ctx.lineWidth=.8;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(X+2+i*5,Y+5+i*5);ctx.quadraticCurveTo(X+7,Y+3+i*5,X+13,Y+5+i*5);ctx.stroke()}};
ruin=function(X,Y){shadow(X+8,Y+14,6,1.6,.16);rrect(X+1,Y+3,14,11,2,grad(X,Y,X,Y+15,'#aaa08c','#655f54'),'#cfc3aa');rrect(X+4,Y+5,8,6,1,'#817867');ctx.fillStyle='#5f574c';ctx.fillRect(X+10,Y+7,2,6)};
grave=function(X,Y){shadow(X+8,Y+14,5.5,1.5,.15);rrect(X+4,Y+2,8,12,4,grad(X,Y,X+12,Y+14,'#aeb8b4','#5f6968'),'#cbd4d0');ctx.fillStyle='#e0e7e3';ctx.fillRect(X+7.3,Y+5,1.4,6);ctx.fillRect(X+5.6,Y+7.1,4.8,1.2)};
reed=function(X,Y){shadow(X+8,Y+14,5,1.4,.12);for(let n=0;n<6;n++){ctx.strokeStyle=n%2?'#a7c873':'#719953';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(X+3+n*2,Y+15);ctx.quadraticCurveTo(X+1+n*2,Y+8,X+4+n*1.8,Y+3+n%3);ctx.stroke()}};
function house(X,Y){shadow(X+8,Y+15,11,2.5,.24);ctx.fillStyle='#8b613d';ctx.beginPath();ctx.moveTo(X-5,Y-4);ctx.lineTo(X+8,Y-14);ctx.lineTo(X+21,Y-4);ctx.closePath();ctx.fill();rrect(X-3,Y-4,22,17,3,grad(X,Y,X,Y+14,'#d9bd8d','#8c6443'),'#5f432e');rrect(X+5,Y+2,6,11,1.5,'#563924','#9c6b42');ell(X+1,Y+1,2,2,'#f7d26b',.75);ell(X+15,Y+1,2,2,'#f7d26b',.75)}
function npc(X,Y,tint,scale=.8){const cx=X+8,fy=Y+16,a=Math.atan2((y+8)-fy,(x+8)-cx),[p,q,t]=faceBlend(norm(a));if(imgReady(p)&&imgReady(q)){const w=22*scale,h=31*scale;shadow(cx,fy,5*scale,1.5,.16);paintImg(p,cx,fy,w,h,(1-t)*.98);paintImg(q,cx,fy,w,h,t*.98);ctx.save();ctx.globalCompositeOperation='source-atop';ctx.fillStyle=tint;ctx.fillRect(cx-w/2,fy-h,w,h);ctx.restore()}}
const oldWorld=drawWorld;
drawWorld=function(i,ox=0,oy=0){oldWorld(i,ox,oy);ctx.save();ctx.translate(ox,oy);for(const o of WORLD[i].objects){const X=o.x*T,Y=o.y*T;if(o.type==='house')house(X,Y);else if(o.type==='npcElder')npc(X,Y,'rgba(164,96,48,.20)',.86);else if(o.type==='npcScout')npc(X,Y,'rgba(57,146,96,.20)',.82);else if(o.type==='npcChild')npc(X,Y,'rgba(65,120,205,.20)',.68)}ctx.restore()};

drawPillar=function(tx,ty,theme){const X=tx*T,Y=ty*T,c=typeof colorForTheme==='function'?colorForTheme(theme):'#86775d';shadow(X+8,Y+15,6,2,.22);ctx.fillStyle=grad(X,Y,X+16,Y,'#4c4c49','#8c8a7d');ctx.fillRect(X+4,Y+4,8,10);ell(X+8,Y+4,5,2.5,'#aaa697');ell(X+8,Y+14,6,2.5,'#444742');ctx.fillStyle=c;ctx.globalAlpha=.65;ctx.fillRect(X+6,Y+6,2,6);ctx.globalAlpha=1};
drawSpikes=function(tx,ty){const X=tx*T,Y=ty*T,up=((performance.now()/220)|0)%2;for(let n=0;n<4;n++){const px=X+3+n*3,yy=Y+(up?7:10);ctx.fillStyle=grad(px,yy-4,px,yy+5,'#e4e3d4','#666a67');ctx.beginPath();ctx.moveTo(px,yy+5);ctx.lineTo(px+2,yy-4);ctx.lineTo(px+4,yy+5);ctx.fill()}};
drawPot=function(tx,ty,broken){if(broken)return;const X=tx*T,Y=ty*T;shadow(X+8,Y+14,5,1.4,.2);ctx.fillStyle=grad(X+3,Y+4,X+13,Y+14,'#c68a5d','#71452f');ctx.beginPath();ctx.ellipse(X+8,Y+9,5,6,0,0,TAU);ctx.fill();ell(X+8,Y+5,5,2,'#dca474');ell(X+8,Y+5,3,1.1,'#4a2f24')};
if(typeof drawChestSprite==='function')drawChestSprite=function(c){const X=c.x*T,Y=c.y*T,open=chestOpened(c),ready=chestReady(c);shadow(X+8,Y+14,7,2,.23);if(open){rrect(X+2,Y+9,12,6,2,'#7b4f2c','#e0b45c');ctx.save();ctx.translate(X+8,Y+7);ctx.rotate(-.35);rrect(-6,-3,12,5,2,'#996039','#e0b45c');ctx.restore()}else{rrect(X+2,Y+6,12,9,2,grad(X,Y,X,Y+15,ready?'#a9733d':'#5b5750',ready?'#674321':'#383734'),ready?'#e1bd63':'#777');ell(X+8,Y+10,1.5,2,'#f1d36f')}};

const oldDrops=drawDrops;
function gem(X,Y,c){shadow(X,Y+6,4,1,.13);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(X,Y-7);ctx.lineTo(X+5,Y);ctx.lineTo(X,Y+7);ctx.lineTo(X-5,Y);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.stroke()}
drawDrops=function(){oldDrops();for(const d of state().drops){if(d.got)continue;const X=d.x,Y=d.y;if(d.type==='magic'){ell(X,Y,4.2,5.5,'#7561d8');ell(X-1,Y-2,1.4,1.8,'#ddd5ff',.75)}else if(d.type==='shard'||d.type==='relic')gem(X,Y,d.type==='relic'?'#ffe28b':'#e38b45')}};

const oldExplosion=drawExplosion;
drawExplosion=function(f){const t=f.t||0;if(f.kind==='step'){if(f.biome==='water'){ctx.strokeStyle=`rgba(185,230,255,${Math.max(0,.65-t/25)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(f.x,f.y,3+t*.3,1.3+t*.12,0,0,TAU);ctx.stroke()}return}if(f.kind==='spark'){for(let i=0;i<4;i++){const a=i*A;ctx.strokeStyle='#ffe9a0';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(a)*(3+t*.2),f.y+Math.sin(a)*(3+t*.2));ctx.stroke()}return}if(f.kind==='hitSpark'){ell(f.x,f.y,Math.max(1,5-t*.25),Math.max(1,3-t*.15),'#fff0a5',.8);return}if(f.kind==='burst'){for(let i=0;i<5;i++){const a=i*TAU/5+t*.06,rr=2+t*.25;ctx.fillStyle=i%2?'#b27b56':'#7a5035';ctx.fillRect(f.x+Math.cos(a)*rr-1,f.y+Math.sin(a)*rr-1,2,2)}return}if(f.kind==='bushBurn'){for(let i=0;i<3;i++){const a=i*2.1+t*.08;ell(f.x+Math.cos(a)*4,f.y-Math.sin(a)*2-t*.15,2.5,4,'#ff873c',.65);ell(f.x+Math.cos(a)*4,f.y-Math.sin(a)*2-t*.15,1.2,2,'#ffe879',.8)}return}oldExplosion(f)};

const oldDraw=draw;
draw=function(){oldDraw();if(typeof titleOpen!=='undefined'&&titleOpen)return;if(mapOpen||inventoryOpen||slide)return;for(const b of bombObjs){shadow(b.x,b.y+6,5,1.5,.24);const flash=b.fuse<20&&((b.fuse/3)|0)%2;ell(b.x,b.y,5.6,5.6,flash?'#7e3842':'#222831');ell(b.x-1.8,b.y-2,1.8,1.2,'#64717e',.5);ctx.strokeStyle='#9b6a3c';ctx.beginPath();ctx.moveTo(b.x+2,b.y-4);ctx.quadraticCurveTo(b.x+4,b.y-7,b.x+5,b.y-9);ctx.stroke();ell(b.x+5,b.y-9,1.5,2.2,'#ffca68',.9)}for(const z of waves){const a=Math.atan2(z.vy,z.vx);ctx.save();ctx.translate(z.x,z.y);ctx.rotate(a);if(z.kind==='arrow'){ctx.strokeStyle='#e8c66d';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.stroke();ctx.fillStyle='#f4df9b';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(4,-2);ctx.lineTo(4,2);ctx.fill()}else if(z.kind==='fire'||String(z.kind||'').includes('ember')){ell(0,0,5,3,'#ff7038',.75);ell(1,0,2.5,1.8,'#ffe16d',.95)}else{ell(0,0,4,3,z.enemy?'#a7cf75':'#d8edaa',.75)}ctx.restore()}for(const d of discs){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(performance.now()/90);ctx.strokeStyle='#c8eee4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*1.6);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(3,-2);ctx.stroke();ctx.restore()}};
if(typeof drawTitle==='function'){const oldTitle=drawTitle;drawTitle=function(){oldTitle();ctx.fillStyle='#f0d8a5';ctx.font='bold 5px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('v40 · ILLUSTRATED 2.5D / CONTINUOUS FACING',128,233)}}
})();
