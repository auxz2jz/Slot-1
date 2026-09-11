function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function rectA(x,y,w,h,color,a=1){ctx.save();ctx.globalAlpha=a;rect(x,y,w,h,color);ctx.restore()}
function line(x1,y1,x2,y2,color,w=1,a=1){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();ctx.restore()}
function circle(x,y,r,color,a=1){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function biomeColor(b){return b==='ridge'?'#6b7653':b==='shadow'?'#475248':b==='ruin'?'#6c7c5c':b==='marsh'?'#527a4b':b==='forest'?'#47723d':b==='ash'?'#665949':b==='highland'?'#72895b':'#5a8740'}
function tile(x,y,b){
  rect(x,y,16,16,biomeColor(b));
  const tx=x/16,ty=y/16,n=(tx*13+ty*7)%9,anim=((performance.now()/220)|0)%4;
  if(b==='field'){
    rect(x+2,y+12,12,2,'#4c7732'); rect(x+4,y+3,2,2,'#83a75a'); if(n<3)rect(x+10,y+6,1,1,'#d8ca70'); if(n===4)rect(x+6,y+9,2,1,'#89ad61');
  }else if(b==='forest'){
    rect(x+1,y+12,14,2,'#365f31'); rect(x+3,y+4,3,2,'#2d5a2c'); rect(x+9,y+8,2,2,'#5b8d52'); if(n===2)rect(x+12,y+3,1,2,'#89b66c');
  }else if(b==='ridge'){
    rect(x+2,y+12,12,2,'#57624a'); rect(x+3,y+4,3,2,'#8d9179'); rect(x+10,y+8,4,3,'#5a6250'); if(n===1||n===5)rect(x+7,y+6,2,2,'#72785f');
  }else if(b==='marsh'){
    rect(x,y,16,16,'#4f7345'); rect(x+1,y+13,14,2,'#3a5933'); rect(x+3+anim%2,y+7,7,3,'#2f6693'); rect(x+5,y+8,9,2,'#5fa0c7'); if(n<4)rect(x+11,y+3,1,8,'#6c8f51');
  }else if(b==='shadow'){
    rect(x,y,16,16,'#495246'); rect(x+1,y+12,14,2,'#3a4337'); rect(x+4,y+5,8,4,'#40483e'); if(n===3)rect(x+12,y+4,1,5,'#566154');
  }else if(b==='ruin'){
    rect(x,y,16,16,'#6a7859'); rect(x+2,y+12,12,2,'#546149'); rect(x+2,y+3,5,2,'#80856e'); rect(x+10,y+7,3,3,'#5c634f'); if(n===2)rect(x+7,y+5,2,1,'#8a9277');
  }else if(b==='ash'){
    rect(x,y,16,16,'#675949'); rect(x+1,y+12,14,2,'#51463a'); rect(x+5,y+8,5,2,'#494038'); if(n<3)rect(x+10,y+4,2,1,'#7b6d5b');
  }else if(b==='highland'){
    rect(x,y,16,16,'#718759'); rect(x+1,y+12,14,2,'#5f7348'); rect(x+3,y+4,3,2,'#93aa73'); rect(x+11,y+8,2,2,'#839a66');
  }
}
function shadowBlob(x,y,w=12,h=4,a=.24){ctx.save();ctx.fillStyle='rgba(0,0,0,'+a+')';ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function tree(x,y){shadowBlob(x+8,y+14,12,5,.22);rect(x+6,y+11,4,5,'#58422c');rect(x+2,y+6,12,7,'#214f2d');rect(x+3,y+3,10,6,'#2e6e3a');rect(x+5,y+1,6,4,'#3e8a4b');rect(x+4,y+8,2,2,'#74aa64');rect(x+9,y+5,2,2,'#5e9d59');rect(x+10,y+9,1,1,'#a9cf7e')}
function rock(x,y){shadowBlob(x+8,y+13,11,4,.20);rect(x+2,y+6,12,8,'#63675f');rect(x+4,y+3,8,5,'#878878');rect(x+6,y+2,4,2,'#a2a08f');rect(x+3,y+10,3,2,'#51574f');rect(x+10,y+9,2,2,'#6f746d')}
function water(x,y){const a=((performance.now()/180)|0)%3;rect(x,y,16,16,'#214f7a');rect(x+1,y+10,14,4,'#2d6f9e'); rect(x+2+a,y+4,5,2,'#7ec6e8'); rect(x+8-a,y+8,6,2,'#579ec9'); rect(x+4,y+12,4,1,'#9ed8ef');}
function ruin(x,y){shadowBlob(x+8,y+14,12,4,.18);rect(x+1,y+3,14,12,'#6f6a5a');rect(x+3,y+5,10,8,'#91896f');rect(x+4,y+2,8,3,'#b0a686');rect(x+5,y+8,2,2,'#6e6756');rect(x+9,y+10,2,2,'#79705c');line(x+3,y+9,x+12,y+9,'#5f584a',1,.7)}
function grave(x,y){shadowBlob(x+8,y+14,10,4,.2);rect(x+5,y+3,6,11,'#747a72');rect(x+4,y+6,8,7,'#666d66');rect(x+6,y+1,4,4,'#878d83');rect(x+7,y+7,2,5,'#93998f');rect(x+3,y+12,10,2,'#51584f')}
function reed(x,y){rect(x,y+11,16,5,'#355833');for(let i=0;i<4;i++){const ox=x+3+i*3,h=8+(i%2);rect(ox,y+4,1,h,'#6d954d');rect(ox+1,y+3+(i%3),1,h-2,'#84ab62')}rect(x+2,y+13,12,2,'#45693c')}
function cave(x,y){shadowBlob(x+8,y+14,13,4,.24);rect(x,y+2,16,14,'#403f38');rect(x+2,y+5,12,10,'#060707');rect(x+4,y+3,8,3,'#686a5d');rect(x+5,y+10,6,2,'#101312')}
function stairs(x,y){shadowBlob(x+8,y+14,10,4,.17);rect(x+1,y+1,14,14,'#6f6758');for(let i=0;i<5;i++){rect(x+3+i,y+4+i*2,10-i*2,2,i%2?'#4c493f':'#b7ae92')}line(x+3,y+4,x+12,y+4,'#d9d0b3',1,.7)}
function door(x,y,open=false){shadowBlob(x+8,y+14,10,4,.18);rect(x+2,y+1,12,15,open?'#151515':'#7c5330');if(!open){rect(x+4,y+3,8,11,'#5f3c24');rect(x+8,y+8,2,3,'#d9ba57');line(x+4,y+6,x+11,y+6,'#8e613c')}else{rect(x+4,y+3,8,11,'#0c0c0c');rect(x+5,y+4,6,9,'#151515')}}
function shopDoor(x,y){shadowBlob(x+8,y+14,11,4,.18);rect(x+2,y+2,12,14,'#171717');rect(x+4,y+1,8,3,'#8b6033');rect(x+5,y+5,6,9,'#232323');ctx.fillStyle='#f0cf64';ctx.font='8px monospace';ctx.fillText('$',x+6,y+11)}
function shrineGate(x,y,open){shadowBlob(x+8,y+14,11,4,.2);rect(x,y,16,16,'#463f38');rect(x+2,y+2,12,14,open?'#0b0b0b':'#302036');if(!open){rect(x+6,y+5,4,6,'#d06d38');rect(x+7,y+3,2,2,'#f5be5d');rect(x+5,y+12,6,2,'#6f4040')}else{rect(x+4,y+3,8,10,'#080808')}}
function worldAccent(i,tx,ty){const s=(i*97+tx*19+ty*23)%31,b=WORLD[i].bi;if((tx<1||tx>14||ty<1||ty>13))return; if(b==='field'||b==='highland'){if(s===1){rect(tx*T+7,ty*T+7,1,6,'#7db05f');rect(tx*T+5,ty*T+10,2,2,'#d7da7d');rect(tx*T+9,ty*T+9,2,2,'#f0b6ca')} if(s===2)rect(tx*T+4,ty*T+11,8,1,'#4f7536');}else if(b==='forest'){if(s===0)rect(tx*T+6,ty*T+11,3,2,'#709d57'); if(s===3)rect(tx*T+3,ty*T+12,10,1,'#2c552a');}else if(b==='marsh'){if(s===1){rect(tx*T+2,ty*T+13,12,1,'#44633b');rect(tx*T+12,ty*T+6,1,5,'#68895b')} if(s===4)circle(tx*T+6,ty*T+8,1.2,'#a5d7f2',.65);}else if(b==='shadow'){if(s===2)rect(tx*T+6,ty*T+12,4,1,'#313831'); if(s===5)rect(tx*T+11,ty*T+5,1,4,'#687160');}else if(b==='ash'){if(s===1)rect(tx*T+4,ty*T+12,8,1,'#52463b'); if(s===4)rect(tx*T+8,ty*T+7,2,1,'#84735f');}else if(b==='ruin'||b==='ridge'){if(s===0)rect(tx*T+5,ty*T+11,6,1,'#6c715c'); if(s===6)rect(tx*T+9,ty*T+5,2,2,'#8c907a');}}