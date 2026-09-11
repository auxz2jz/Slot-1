const _v24DrawBoss=draw;
draw=function(){_v24DrawBoss();drawWeaponPolish();drawBossBar()};
/* v26 motion/effect polish */
const _v25ExplosionFX=drawExplosion;
drawExplosion=function(f){if(f.kind==='step'){const p=f.t/18;if(f.biome==='water'||f.biome==='marsh'){ctx.strokeStyle=`rgba(156,220,235,${Math.max(0,.5-p*.5)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(f.x,f.y,2+f.t*.35,1+f.t*.12,0,0,Math.PI*2);ctx.stroke()}else{for(let n=0;n<3;n++){const a=n*2.1+f.t*.05,rr=1+f.t*.22;circle(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr*.45,1.1,n%2?'#b8a779':'#8e835f',Math.max(0,.24-p*.24))}}return}if(f.kind==='hitSpark'){const p=f.t/14;for(let n=0;n<6;n++){const a=n*Math.PI/3,rr=2+f.t*.55;line(f.x+Math.cos(a)*2,f.y+Math.sin(a)*2,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,'#fff1a8',1.3,Math.max(0,1-p))}circle(f.x,f.y,Math.max(0,3-f.t*.2),'#ffffff',Math.max(0,.55-p));return}_v25ExplosionFX(f)};
function drawProjectileTrails(){if(titleOpen||mapOpen)return;for(const z of waves){const speed=Math.hypot(z.vx,z.vy)||1,dx=z.vx/speed,dy=z.vy/speed;if(z.enemy){const col=z.kind==='ember'?'#e66139':z.kind==='tide'?'#60bdb1':'#b6a46f';for(let n=1;n<=3;n++)circle(z.x-dx*n*3,z.y-dy*n*3,Math.max(.5,2.6-n*.6),col,.20/n)}else{for(let n=1;n<=3;n++)circle(z.x-dx*n*3,z.y-dy*n*3,Math.max(.5,2.5-n*.55),'#fff0a3',.16/n)}}}
function drawTransitionFade(){if(titleOpen||mapOpen||!transitionCooldown||slide)return;const a=Math.min(.42,transitionCooldown/70);rectA(0,0,256,240,'#040605',a)}
const _v25DrawPolish=draw;
draw=function(){_v25DrawPolish();drawProjectileTrails();drawTransitionFade()};