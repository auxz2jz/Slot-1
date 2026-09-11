/* v36 recovery: restore renderer helpers and presentation hooks lost in mixed v35/v36 deployment */
if(typeof rectA==='undefined') window.rectA=function(x,y,w,h,color,a=1){ctx.save();ctx.globalAlpha=a;rect(x,y,w,h,color);ctx.restore()};
if(typeof line==='undefined') window.line=function(x1,y1,x2,y2,color,w=1,a=1){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();ctx.restore()};
if(typeof circle==='undefined') window.circle=function(x,y,r,color,a=1){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()};
if(typeof shadowBlob==='undefined') window.shadowBlob=function(x,y,w=12,h=4,a=.24){ctx.save();ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill();ctx.restore()};
if(typeof frameBox==='undefined') window.frameBox=function(x,y,w,h){rect(x,y,w,h,'rgba(18,20,18,.90)');rect(x+2,y+2,w-4,h-4,'rgba(44,49,44,.92)');line(x+1,y+1,x+w-2,y+1,'#9a8d63');line(x+1,y+h-2,x+w-2,y+h-2,'#514a3a');line(x+1,y+1,x+1,y+h-2,'#9a8d63');line(x+w-2,y+1,x+w-2,y+h-2,'#514a3a')};
if(typeof drawBossBar==='undefined') window.drawBossBar=function(){};
if(typeof drawItemBadge==='undefined') window.drawItemBadge=function(){};
if(typeof drawTitle==='undefined') window.drawTitle=function(){rectA(0,0,256,240,'#07100c',.96);ctx.textAlign='center';ctx.fillStyle='#f4e4b7';ctx.font='bold 17px monospace';ctx.fillText('RELIC OF',128,102);ctx.fillStyle='#ef9b52';ctx.font='bold 23px monospace';ctx.fillText('EMBERWOOD',128,126);ctx.fillStyle='#9fc6b3';ctx.font='7px monospace';ctx.fillText('DUNGEON RITES EDITION',128,141);ctx.fillStyle='#ffe9b4';ctx.font='bold 9px monospace';ctx.fillText('PRESS A TO BEGIN',128,175)};
const _recoveryDraw=draw;
draw=function(){_recoveryDraw();if(typeof drawItemBadge==='function')drawItemBadge();if(typeof titleOpen!=='undefined'&&titleOpen&&typeof drawTitle==='function')drawTitle()};
