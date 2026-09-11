/* v36-r3: render movement/combat effects separately from bomb explosions */
const _effectBombExplosion=drawExplosion;
drawExplosion=function(f){
  if(f&&f.kind==='step'){
    const age=f.t||0;
    if(f.biome==='water'){
      ctx.save();ctx.globalAlpha=Math.max(0,.32-age*.025);ctx.strokeStyle='#b9e8f2';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(f.x,f.y,3+age*.28,1.2+age*.10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }else{
      const a=Math.max(0,.30-age*.028);circle(f.x-2,f.y,1.1,'#d5c6a0',a);circle(f.x+2,f.y+.5,.9,'#b9aa86',a*.8);
    }
    return;
  }
  if(f&&f.kind==='hitSpark'){
    const age=f.t||0,a=Math.max(0,.9-age*.09),r=2+age*.7;for(let i=0;i<4;i++){const an=i*Math.PI/2;line(f.x+Math.cos(an)*1.5,f.y+Math.sin(an)*1.5,f.x+Math.cos(an)*r,f.y+Math.sin(an)*r,'#fff0a0',1,a)}return;
  }
  if(f&&f.kind==='spark'){
    const age=f.t||0,a=Math.max(0,.8-age*.07);for(let i=0;i<5;i++){const an=i*1.257+age*.12;circle(f.x+Math.cos(an)*(3+age*.35),f.y+Math.sin(an)*(3+age*.35),1,'#ffe5a0',a)}return;
  }
  if(f&&f.kind==='burst'){
    const age=f.t||0,a=Math.max(0,.65-age*.055);for(let i=0;i<7;i++){const an=i*.897;circle(f.x+Math.cos(an)*(2+age*.6),f.y+Math.sin(an)*(2+age*.6),1.2,'#d8e0cf',a)}return;
  }
  if(f&&f.kind){return;}
  _effectBombExplosion(f);
};
