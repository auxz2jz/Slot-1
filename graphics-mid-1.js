/* v19 HD pixel-art visual layer */
rect=function(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
const _v18DrawWorld=drawWorld;
function drawAmbient(i,ox=0,oy=0){const b=WORLD[i].bi,t=performance.now()/1000;ctx.save();ctx.translate(ox,oy);ctx.beginPath();ctx.rect(0,0,256,240);ctx.clip();
  if(b==='forest'){
    for(let n=0;n<8;n++){const px=(n*47+i*13)%244+6,py=30+((n*31+i*17)%165),pulse=.25+.35*(.5+.5*Math.sin(t*2+n));circle(px+Math.sin(t*.7+n)*3,py+Math.cos(t*.5+n)*2,1.1,'#e8e58a',pulse)}
  }else if(b==='marsh'){
    for(let n=0;n<5;n++){const py=35+n*38+Math.sin(t*.3+n)*4;rectA(-20+(t*5+n*61)%310,py,65,5,'#c8d7cf',.045)}
    for(let n=0;n<5;n++){const px=(i*23+n*51)%250,py=50+((n*41+i*7)%145);rectA(px,py,7,1,'#d2f0ff',.18+.10*Math.sin(t*2+n))}
  }else if(b==='ash'){
    for(let n=0;n<14;n++){const px=(n*31+i*19+t*(5+n%3))%270-7,py=(n*53+i*11+t*(13+n%4))%250-5;rectA(px,py,1+(n%2),1+(n%3===0),'#b7a18a',.22)}
  }else if(b==='shadow'){
    for(let n=0;n<4;n++){const y0=55+n*43+Math.sin(t*.25+n)*5;rectA(-40+(t*3+n*88)%320,y0,95,7,'#b7c2b7',.035)}
  }else if(b==='highland'){
    for(let n=0;n<3;n++){const px=-55+((t*7+n*110+i*9)%360),py=35+n*52;rectA(px,py,46,5,'#e3ecd7',.035);rectA(px+12,py-3,28,4,'#e3ecd7',.025)}
  }else if(b==='field'){
    for(let n=0;n<7;n++){const px=(i*29+n*37)%250,py=32+((i*7+n*53)%180);circle(px+Math.sin(t+n)*2,py,0.65,'#f2e6a5',.30)}
  }else if(b==='ruin'||b==='ridge'){
    for(let n=0;n<6;n++){const px=(i*17+n*43)%248,py=(n*37+i*11)%215+12;rectA(px+Math.sin(t*.5+n)*2,py,1,1,b==='ruin'?'#c0b48f':'#d0c9a4',.14)}
  }
ctx.restore()}
drawWorld=function(i,ox=0,oy=0){_v18DrawWorld(i,ox,oy);drawAmbient(i,ox,oy)};

const _v18DrawInterior=drawInterior;
drawInterior=function(){_v18DrawInterior();const t=performance.now()/1000;for(let n=0;n<7;n++){const px=24+((n*41+insideKey.length*23)%210),py=35+((n*29+insideKey.length*17)%150);circle(px+Math.sin(t*.45+n)*2,py+Math.cos(t*.35+n),.7,'#d9c89a',.10)}if(INTERIORS[insideKey]?.dungeon){rectA(16,16,224,4,'#000',.10);rectA(16,220,224,4,'#000',.14)}};

drawHero=function(){if(invuln&&((invuln/4)|0)%2)return;const moving=(walk%10)>1,step=moving?(((walk/3)|0)%2?1:-1):0;let dir='D';const ax=Math.cos(face),ay=Math.sin(face);if(Math.abs(ax)>Math.abs(ay))dir=ax>0?'R':'L';else dir=ay>0?'D':'U';shadowBlob(x+8,y+15.1,11.5,3.7,.24);
  rect(x+4.1,y+12.2+step*.35,3.2,3.6,'#4b3220');rect(x+8.8,y+12.3-step*.35,3.2,3.6,'#4b3220');rect(x+4.6,y+11.5,2.2,1.5,'#b6a071');rect(x+9.3,y+11.5,2.2,1.5,'#b6a071');
  rect(x+3,y+7.1,10,5.7,'#236b43');rect(x+4,y+6.1,8,5.8,'#328856');rect(x+3.5,y+11.2,9,1.4,'#d9cfab');rect(x+7.5,y+11.1,1.2,1.6,'#8e6a35');rect(x+4.1,y+8,1.2,3.1,'#4da16a');
  if(dir==='L'){rect(x+1.6,y+7.2,3,4,'#deb585');rect(x+11.4,y+7.8,2.2,3,'#2a744a')}else if(dir==='R'){rect(x+11.4,y+7.2,3,4,'#deb585');rect(x+2.4,y+7.8,2.2,3,'#2a744a')}else{rect(x+1.8,y+7.8,2.5,3.7,'#deb585');rect(x+11.7,y+7.8,2.5,3.7,'#deb585')}
  rect(x+5,y+2.8,6,5.7,'#dfb481');rect(x+4.2,y+3.7,1.4,2.8,'#dfb481');rect(x+10.5,y+3.7,1.4,2.8,'#dfb481');rect(x+2.4,y+4.4,2.2,1.4,'#d9ad7b');rect(x+11.5,y+4.4,2.2,1.4,'#d9ad7b');rect(x+4.2,y+1.3,7.8,2.4,'#9b612f');rect(x+5,y+.6,6.4,1.7,'#b8783b');rect(x+3.8,y+2.2,2,2.4,'#a46832');
  if(dir==='D'){rect(x+6,y+5.2,1.2,1.2,'#202020');rect(x+9.1,y+5.2,1.2,1.2,'#202020');rect(x+7.3,y+7,1.8,.7,'#9c6a50')}else if(dir==='U'){rect(x+5.6,y+3.2,4.9,1.4,'#9b612f')}else if(dir==='L'){rect(x+5.2,y+5.1,1.2,1.2,'#202020');rect(x+4.2,y+6.7,2.1,.7,'#9c6a50')}else{rect(x+9.6,y+5.1,1.2,1.2,'#202020');rect(x+9.7,y+6.7,2.1,.7,'#9c6a50')}
  const cap='#2f7f4c';rect(x+4,y+.1,8,2,'#286b42');if(dir==='L'){rect(x+1.8,y+1.1,5,1.5,cap);rect(x+.8,y+1.8,2,1.1,'#245c38')}else if(dir==='R'){rect(x+9.2,y+1.1,5,1.5,cap);rect(x+13.2,y+1.8,2,1.1,'#245c38')}else{rect(x+3,y+1.2,10,1.5,cap);rect(x+6,y-.3,5,1.2,'#3b915a')}
};

drawEnemy=function(e){if(e.flash&&((e.flash/2)|0)%2)return;let X=e.x,Y=e.y;const tick=(performance.now()/110)|0;
 if(e.type==='walker'){const step=tick%2?1:-1;shadowBlob(X+7.5,Y+14.3,10.5,3.5,.24);rect(X+4,Y+2.2,8,5.2,'#d8d0bd');rect(X+5,Y+3.8,1.6,1.6,'#1d1d1d');rect(X+9.4,Y+3.8,1.6,1.6,'#1d1d1d');rect(X+6.1,Y+6.4,3.8,1,'#918978');rect(X+6.5,Y+7.5,3,6,'#eee4d2');rect(X+3,Y+8,10,1.6,'#eee4d2');rect(X+2.8,Y+9.5,2.2,3.2,'#d4ccba');rect(X+11,Y+9.5,2.2,3.2,'#d4ccba');rect(X+4,Y+12.5+step*.45,3.3,2.8,'#ddd5c3');rect(X+9,Y+12.5-step*.45,3.3,2.8,'#ddd5c3');rect(X+6,Y+11.5,4,1.5,'#a53c36');rect(X+5.1,Y+1.2,5.8,1.2,'#f2ead8');}
 else if(e.type==='shrub'){const blink=tick%9===0;shadowBlob(X+7.5,Y+14.2,11,3.4,.20);rect(X+2,Y+8,12,6,'#1d552a');rect(X+3,Y+5,10,6,'#327b3f');rect(X+5,Y+2.5,6,4,'#469652');rect(X+4,Y+4,3,2,'#5eaa60');rect(X+9,Y+4,3,2,'#287036');rect(X+5,Y+8.3,1.7,blink?.7:1.7,'#f2f4d8');rect(X+10,Y+8.3,1.7,blink?.7:1.7,'#f2f4d8');rect(X+6,Y+11,5,1.4,'#153f21');}
 else if(e.type==='warden'){const pulse=tick%2;shadowBlob(X+7.5,Y+14.5,12.5,4,.28);rect(X+2,Y+4,12,10,'#745f43');rect(X+3.5,Y+1.3,9,5,'#9d8562');rect(X+5,Y+5.5,2,2,pulse?'#ffd86b':'#ed9b50');rect(X+10,Y+5.5,2,2,pulse?'#ffd86b':'#ed9b50');rect(X+5,Y+10.3,7,2.8,'#513e2d');rect(X+.8,Y+7,2.3,5,'#886f50');rect(X+13,Y+7,2.3,5,'#886f50');rect(X+6,Y+.2,5,1.4,'#c0a77e');line(X+4,Y+8,X+13,Y+8,'#5d4a35',.8,.8);}
 else{const hop=e.timer%28>12?-2:0;Y+=hop;shadowBlob(X+7.5,Y+15,10.5,3.5,.20);rect(X+3,Y+6,10,7,'#84472f');rect(X+4,Y+3,8,4,'#af6845');rect(X+5,Y+2,2,2,'#c78358');rect(X+10,Y+2,2,2,'#c78358');rect(X+5,Y+7,1.8,1.8,'#f1dc7c');rect(X+9.2,Y+7,1.8,1.8,'#f1dc7c');rect(X+5,Y+10,2,2,'#5f2e20');rect(X+9,Y+10,2,2,'#5f2e20');rect(X+4,Y+13,3,2,'#603321');rect(X+10,Y+13,3,2,'#603321');}
};