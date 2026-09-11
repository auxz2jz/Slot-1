/* v36-r4 base visual guard: footsteps are never bomb effects; shared round-bomb art */
const _r4EarlyExplosion=drawExplosion;
drawExplosion=function(f){
  if(f&&f.kind==='step'){
    if(f.biome==='water'||f.biome==='marsh'){
      const age=f.t||0,a=Math.max(0,.34-age*.026);
      ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#b9e8f2';ctx.lineWidth=.8;
      ctx.beginPath();ctx.ellipse(f.x,f.y,2.5+age*.28,1+age*.10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    return;
  }
  _r4EarlyExplosion(f);
};
function drawUnifiedBomb(cx,cy,fuse=70,scale=1){
  const flash=fuse<20&&((fuse/3)|0)%2;
  circle(cx,cy,9*scale,'#15171b',1);
  circle(cx,cy,6.7*scale,flash?'#a33d43':'#22262c',1);
  circle(cx-2*scale,cy-2*scale,2*scale,'#6d7681',.48);
  line(cx+2*scale,cy-5*scale,cx+5*scale,cy-9*scale,'#8d6740',Math.max(1,1.4*scale),1);
  circle(cx+5.5*scale,cy-9.5*scale,1.4*scale,flash?'#ff9a3d':'#e7c86e',.95);
}
