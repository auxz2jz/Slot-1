/* v33 graphics: layered grass, cut particles, subtle weather */
function grassSprite(tx,ty,i){const X=tx*T,Y=ty*T,seed=(i*11+tx*7+ty*5)%5;for(let n=0;n<5;n++){const x0=X+3+n*2+(seed%2),h=4+(n%3);line(x0,Y+14,x0+(n%2?1:-1),Y+14-h,n%2?'#6e9a4b':'#82ad58',1,.9)}if(seed===0){rect(X+5,Y+8,2,2,'#d6d06f');rect(X+10,Y+10,2,2,'#e0a4c3')}}
const _v33World=drawWorld;
drawWorld=function(i,ox=0,oy=0){_v33World(i,ox,oy);ctx.save();ctx.translate(ox,oy);for(let n=0;n<GRASS[i].length;n++){if(G.taken.has(`grass:${i}:${n}`))continue;const p=GRASS[i][n];grassSprite(p[0],p[1],i+n)}ctx.restore()};
const _v33Explosion=drawExplosion;
drawExplosion=function(f){if(f.kind==='grassCut'){const p=f.t/18;for(let n=0;n<7;n++){const a=n*.9,rr=2+f.t*.45;rectA(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr*.7,1.3,3,n%2?'#7eaa53':'#a0bf65',Math.max(0,.8-p))}return}_v33Explosion(f)};
const _v33Frame=draw;
draw=function(){_v33Frame();if(titleOpen||mapOpen||inventoryOpen||insideKey)return;const b=WORLD[id]?.bi,t=performance.now()/1000;if(b==='highland'){for(let n=0;n<5;n++){const px=(id*31+n*53+t*12)%256,py=28+(n*37)%150;rectA(px,py,4,1,'#e9efd4',.06)}}if(b==='ridge'){for(let n=0;n<4;n++){const px=(id*19+n*61+t*5)%256,py=40+(n*43)%130;circle(px,py,1,'#d9d0b5',.08)}}};