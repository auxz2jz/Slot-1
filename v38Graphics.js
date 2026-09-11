/* v38 illustrated renderer: smooth high-resolution 2D art over the v37 game */
ctx.imageSmoothingEnabled=true;

function v38Hash(a,b=0,c=0){let n=(a*374761393+b*668265263+c*2147483647)|0;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295}
function v38Ellipse(x,y,rx,ry,color,a=1){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function v38RoundRect(x,y,w,h,r,fill,stroke=null,lw=1,a=1){ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}ctx.restore()}
function v38Poly(points,fill,stroke=null,lw=1,a=1){ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}ctx.restore()}
function v38Glow(x,y,r,color,a=.25){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function v38Shadow(x,y,rx=7,ry=2.6,a=.26){v38Ellipse(x,y,rx,ry,'#07110a',a)}

const V38_BIOME={
 field:['#6f9f4b','#86b85a','#4f7738','#d0b77a'],forest:['#466f3c','#598548','#2d5430','#b8aa72'],ridge:['#6e785b','#85866e','#525a48','#b5a680'],marsh:['#507c52','#679467','#365b45','#6ab6cf'],shadow:['#46524b','#5a655b','#303c38','#8e83aa'],ruin:['#68795a','#7f8768','#4f5b4c','#b4a582'],ash:['#67594b','#786653','#4d4138','#c37b55'],highland:['#748c5e','#8eaa70','#5b724b','#c7b582']
};

tile=function(X,Y,b){
 const p=V38_BIOME[b]||V38_BIOME.field;
 const g=ctx.createLinearGradient(X,Y,X,Y+16);g.addColorStop(0,p[1]);g.addColorStop(1,p[0]);ctx.fillStyle=g;ctx.fillRect(X,Y,16.2,16.2);
 const tx=(X/16)|0,ty=(Y/16)|0,n=v38Hash(tx,ty,(id||0));
 ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=p[2];ctx.lineWidth=.55;
 if(b==='field'||b==='highland'||b==='forest'){for(let i=0;i<3;i++){const xx=X+2+v38Hash(tx,ty,i)*12,yy=Y+5+v38Hash(ty,tx,i+4)*9;ctx.beginPath();ctx.moveTo(xx,yy+3);ctx.quadraticCurveTo(xx+1,yy,xx+2,yy-2);ctx.stroke()}}
 if(b==='marsh'){ctx.strokeStyle='#9ad7dd';ctx.globalAlpha=.28;ctx.beginPath();ctx.moveTo(X+2,Y+6);ctx.quadraticCurveTo(X+7,Y+4,X+13,Y+6);ctx.stroke()}
 if(n>.86&&(b==='field'||b==='highland')){v38Ellipse(X+5,Y+7,1.2,.8,'#f4de87',.75);v38Ellipse(X+10,Y+10,1,.7,'#e8a5b8',.7)}
 ctx.restore();
};

tree=function(X,Y){
 v38Shadow(X+8,Y+14,7,2.4,.25);
 const trunk=ctx.createLinearGradient(X+5,Y+8,X+11,Y+15);trunk.addColorStop(0,'#745137');trunk.addColorStop(1,'#443221');v38RoundRect(X+5.4,Y+7.8,5.2,7.5,1.4,trunk);
 const crown=ctx.createRadialGradient(X+6,Y+4,1,X+8,Y+7,10);crown.addColorStop(0,'#80b866');crown.addColorStop(.45,'#4b8b4a');crown.addColorStop(1,'#255a35');
 v38Ellipse(X+5.5,Y+7,6.5,5.8,crown);v38Ellipse(X+10.7,Y+7.5,5.7,5.3,crown);v38Ellipse(X+8,Y+3.8,6.4,5.6,crown);
 v38Ellipse(X+5.5,Y+3.7,2.2,1.4,'#a9d57f',.38);v38Ellipse(X+11,Y+6,1.5,1,'#b8df8c',.3);
};

rock=function(X,Y){
 v38Shadow(X+8,Y+13.2,6.5,2.2,.22);const g=ctx.createLinearGradient(X+3,Y+2,X+13,Y+14);g.addColorStop(0,'#a6a793');g.addColorStop(.5,'#747969');g.addColorStop(1,'#555b50');
 v38Poly([[X+2,Y+11],[X+3.5,Y+5],[X+7,Y+2],[X+12,Y+3.5],[X+14,Y+8],[X+12,Y+13],[X+5,Y+14]],g,'rgba(35,40,35,.45)',.8);
 ctx.save();ctx.strokeStyle='rgba(235,236,216,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(X+5,Y+5);ctx.lineTo(X+8,Y+3.8);ctx.lineTo(X+10,Y+4.8);ctx.stroke();ctx.restore();
};

water=function(X,Y){
 const g=ctx.createLinearGradient(X,Y,X,Y+16);g.addColorStop(0,'#4aa0bf');g.addColorStop(.55,'#2f82aa');g.addColorStop(1,'#205f88');ctx.fillStyle=g;ctx.fillRect(X,Y,16.2,16.2);
 const t=performance.now()/450;ctx.save();ctx.globalAlpha=.42;ctx.strokeStyle='#c9f2ff';ctx.lineWidth=.7;for(let i=0;i<2;i++){const yy=Y+5+i*6+Math.sin(t+i)*.8;ctx.beginPath();ctx.moveTo(X+1,yy);ctx.bezierCurveTo(X+5,yy-1,X+10,yy+1,X+15,yy);ctx.stroke()}ctx.restore();
};

ruin=function(X,Y){
 v38Shadow(X+8,Y+14,7,2.2,.2);const g=ctx.createLinearGradient(X,Y,X+16,Y+16);g.addColorStop(0,'#a39d85');g.addColorStop(1,'#686858');v38RoundRect(X+1.5,Y+2,13,12.5,2,g,'rgba(47,49,43,.55)',.7);
 ctx.save();ctx.strokeStyle='rgba(54,56,48,.48)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(X+4,Y+6);ctx.lineTo(X+12,Y+5);ctx.moveTo(X+6,Y+9);ctx.lineTo(X+11,Y+12);ctx.stroke();ctx.restore();
};

grave=function(X,Y){v38Shadow(X+8,Y+14,6,2,.22);const g=ctx.createLinearGradient(X+5,Y+2,X+10,Y+14);g.addColorStop(0,'#9ba19a');g.addColorStop(1,'#5c665f');v38RoundRect(X+4.5,Y+3,7,10.5,2.8,g,'rgba(45,49,46,.5)',.7);v38Ellipse(X+8,Y+3.8,3.6,2.6,'#9ba19a');ctx.save();ctx.strokeStyle='rgba(220,225,212,.45)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(X+8,Y+6);ctx.lineTo(X+8,Y+11);ctx.moveTo(X+6.5,Y+8);ctx.lineTo(X+9.5,Y+8);ctx.stroke();ctx.restore()};
reed=function(X,Y){ctx.save();for(let i=0;i<5;i++){const xx=X+2+i*3,h=7+(i%3)*2;ctx.strokeStyle=i%2?'#6f9657':'#87aa69';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(xx,Y+15);ctx.quadraticCurveTo(xx+1,Y+10,xx+(i%2?2:-1),Y+15-h);ctx.stroke()}ctx.restore()};

cave=function(X,Y){v38Shadow(X+8,Y+14,7,2.3,.28);const g=ctx.createLinearGradient(X,Y+2,X,Y+15);g.addColorStop(0,'#6e7168');g.addColorStop(1,'#3f433e');v38Poly([[X+1,Y+14],[X+2,Y+7],[X+5,Y+3],[X+11,Y+3],[X+14,Y+7],[X+15,Y+14]],g,'#30342f',.8);v38Ellipse(X+8,Y+11,5.5,5.2,'#07100d');v38Glow(X+8,Y+10,6,'rgba(84,118,99,.35)',.35)};
stairs=function(X,Y){const g=ctx.createLinearGradient(X,Y,X,Y+16);g.addColorStop(0,'#a89d83');g.addColorStop(1,'#5d5a50');v38RoundRect(X+1.5,Y+1.5,13,13,1.7,g,'rgba(45,45,40,.55)',.7);for(let i=0;i<5;i++){ctx.strokeStyle=i%2?'rgba(42,43,39,.7)':'rgba(225,215,187,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X+3+i*.7,Y+4+i*2);ctx.lineTo(X+13-i*.7,Y+4+i*2);ctx.stroke()}};

door=function(X,Y,open=false){v38Shadow(X+8,Y+14.5,6.5,2,.24);const stone=ctx.createLinearGradient(X+1,Y,X+15,Y+16);stone.addColorStop(0,'#918977');stone.addColorStop(1,'#4e4d45');v38RoundRect(X+1,Y+1,14,15,2,stone,'rgba(35,35,33,.55)',.8);if(open){v38RoundRect(X+4,Y+3,8,13,3,'#08100d');v38Glow(X+8,Y+9,6,'rgba(117,142,121,.18)',.4)}else{const wood=ctx.createLinearGradient(X+4,Y+3,X+12,Y+15);wood.addColorStop(0,'#8d673f');wood.addColorStop(1,'#513720');v38RoundRect(X+4,Y+3,8,12,2,wood,'#3b281b',.8);v38Ellipse(X+10.4,Y+9.2,.9,.9,'#e5c76a')}};

if(typeof drawV37Brush==='function')drawV37Brush=function(X,Y,edge=false){v38Shadow(X+8,Y+14,7,2,.2);for(let i=0;i<5;i++){const xx=X+3+i*2.5,yy=Y+10-(i%2)*3;ctx.save();ctx.strokeStyle='#3d6841';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(xx,Y+14);ctx.quadraticCurveTo(xx-1,yy,xx+(i%2?2:-2),Y+4+(i%3));ctx.stroke();ctx.restore();v38Ellipse(xx+(i%2?2:-2),Y+5+(i%3),2.3,1.7,i%2?'#4d8b50':'#66a15d')};if(edge)v38Glow(X+8,Y+9,9,'rgba(234,135,70,.18)',.28)};

function v38HeroColors(){const o=G.outfit||'traveler';return o==='emberTunic'?['#9e3f32','#d7684f']:o==='tideTunic'?['#247789','#55b6c7']:o==='shadowCloak'?['#493b70','#7a65a7']:['#2f7f4f','#58a969']}
drawHero=function(){
 if(invuln&&((invuln/4)|0)%2)return;const [body,light]=v38HeroColors(),cx=x+8,cy=y+9,dir=face;
 v38Shadow(cx,y+16,7.5,2.6,.30);ctx.save();ctx.translate(cx,cy);ctx.rotate(dir+Math.PI/2);
 const bg=ctx.createLinearGradient(-5,-2,5,10);bg.addColorStop(0,light);bg.addColorStop(1,body);v38Poly([[-5,1],[-4,9],[0,11],[4,9],[5,1],[3,-3],[-3,-3]],bg,'rgba(25,45,28,.45)',.7);
 v38Ellipse(-3.3,10,2.1,2.8,'#5a3a25');v38Ellipse(3.3,10,2.1,2.8,'#5a3a25');
 v38Ellipse(0,-5.3,4.6,4.2,'#e5bb88');v38Ellipse(-.4,-7.2,4.8,3.1,body);v38Poly([[-4,-7],[-7,-3],[-3,-4]],body);v38Ellipse(-1.5,-5.2,.65,.55,'#222');v38Ellipse(1.5,-5.2,.65,.55,'#222');
 ctx.save();ctx.translate(-6.5,2.5);ctx.rotate(-.18);v38Ellipse(0,0,3.8,5.5,'#775733');v38Ellipse(0,0,3.1,4.7,'#9a7445');v38Poly([[0,-3.1],[2.2,0],[0,3.1],[-2.2,0]],'#4d7b4c');ctx.restore();
 if(attack){ctx.save();ctx.translate(5,-.5);ctx.rotate(-.55);v38RoundRect(-.7,-1,1.4,7,.7,'#b99054');const sg=ctx.createLinearGradient(0,-10,0,0);sg.addColorStop(0,'#ffffff');sg.addColorStop(.45,'#dfe8e8');sg.addColorStop(1,'#8c9b9d');v38Poly([[-1,-10],[1,-10],[1.7,-2],[0,0],[-1.7,-2]],sg,'#6c7778',.45);ctx.restore()}
 ctx.restore();
 if(chargeFrames>10&&!attack){const p=Math.min(1,chargeFrames/42);ctx.save();ctx.strokeStyle=`rgba(255,232,145,${.18+p*.5})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(cx,cy,12+p*5,-Math.PI/2,-Math.PI/2+Math.PI*2*p);ctx.stroke();ctx.restore()}
};

function v38EnemyPalette(e){const v=e.v37Variant||e.type;const map={walker:['#d8d3c4','#868173'],knight:['#4f5660','#8a929b'],slime:['#3a9670','#79c48d'],bat:['#4f416b','#806aa2'],hopper:['#975b37','#d28a56'],shrub:['#27673b','#68ad60'],warden:['#786045','#b89465'],thornling:['#39733d','#79bd63'],fieldRunner:['#996c3d','#d6a667'],mossBoar:['#455c37','#80905c'],leafWisp:['#4f8a5b','#b5df8e'],stoneCrab:['#5f6462','#a4a79f'],ridgeArcher:['#556049','#c3b46f'],mireLeech:['#376b5b','#6caf8b'],bogSpitter:['#456d45','#9ccb72'],duskWisp:['#514774','#b69ee2'],shadeKnight:['#343444','#9188ad'],bronzeSentry:['#73523a','#c89a5b'],ruinCrawler:['#66604d','#afa58a'],emberImp:['#873d2d','#f48246'],coalHound:['#3b332f','#a36144'],galeHawk:['#647b83','#c0dce0'],cliffRam:['#696354','#cec19a']};return map[v]||['#665746','#bd9b65']}
function v38DrawEnemy(e){
 if(e.flash&&((e.flash/2)|0)%2)return;const [dark,light]=v38EnemyPalette(e),cx=e.x+7,cy=e.y+8,v=e.v37Variant||e.type;v38Shadow(cx,e.y+15,7,2.3,.25);
 if(e.maxHp){v38Glow(cx,cy,11,light,.18);v38Ellipse(cx,cy,7.8,8.8,dark);v38Ellipse(cx,cy-4.8,6.5,5.2,light);v38Ellipse(cx-2.2,cy-4.5,.9,.9,'#ffe285');v38Ellipse(cx+2.2,cy-4.5,.9,.9,'#ffe285');ctx.save();ctx.strokeStyle=light;ctx.lineWidth=1.5;for(let i=0;i<4;i++){const a=performance.now()/700+i*Math.PI/2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8);ctx.lineTo(cx+Math.cos(a)*11,cy+Math.sin(a)*11);ctx.stroke()}ctx.restore();return}
 if(['slime','stoneCrab','ruinCrawler','mireLeech','hopper'].includes(v)){v38Ellipse(cx,cy+2,7,5.8,dark);v38Ellipse(cx,cy-1,6,4.5,light);v38Ellipse(cx-2,cy-.5,.8,.8,'#fff0a1');v38Ellipse(cx+2,cy-.5,.8,.8,'#fff0a1');if(v==='stoneCrab'||v==='ruinCrawler'){for(let i=-1;i<=1;i+=2){ctx.save();ctx.strokeStyle=dark;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx+i*5,cy+2);ctx.lineTo(cx+i*9,cy+5);ctx.stroke();ctx.restore()}}return}
 if(['leafWisp','duskWisp','thornling','shrub'].includes(v)){v38Glow(cx,cy,8,light,.18);v38Ellipse(cx,cy,5.5,6,dark);for(let i=0;i<4;i++){const a=i*Math.PI/2-.4;v38Ellipse(cx+Math.cos(a)*6,cy-1+Math.sin(a)*5,2.8,1.7,light,.85)}v38Ellipse(cx-1.8,cy,.75,.75,'#ffe993');v38Ellipse(cx+1.8,cy,.75,.75,'#ffe993');return}
 if(v==='bat'||v==='galeHawk'){ctx.save();ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx-8,cy-7,cx-10,cy+2);ctx.quadraticCurveTo(cx-5,cy,cx,cy+4);ctx.quadraticCurveTo(cx+5,cy,cx+10,cy+2);ctx.quadraticCurveTo(cx+8,cy-7,cx,cy);ctx.fill();ctx.restore();v38Ellipse(cx,cy,3.2,4.2,dark);v38Ellipse(cx-1.1,cy-1,.6,.6,'#f3da75');v38Ellipse(cx+1.1,cy-1,.6,.6,'#f3da75');return}
 v38Ellipse(cx,cy+3,5.5,6.2,dark);v38Ellipse(cx,cy-3,4.4,4.2,light);v38Ellipse(cx-1.4,cy-3,.7,.7,'#f6db75');v38Ellipse(cx+1.4,cy-3,.7,.7,'#f6db75');ctx.save();ctx.strokeStyle=dark;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(cx-3,cy+7);ctx.lineTo(cx-4,cy+12);ctx.moveTo(cx+3,cy+7);ctx.lineTo(cx+4,cy+12);ctx.stroke();ctx.restore();
}
drawEnemy=function(e){v38DrawEnemy(e)};

function v38PickupHalo(x0,y0,c){v38Glow(x0,y0,7,c,.22);v38Ellipse(x0,y0,4.8,4.8,'rgba(255,255,255,.05)')}
drawDrops=function(){for(const d of state().drops){if(d.got)continue;const X=d.x,Y=d.y;v38Shadow(X,Y+6,5,1.7,.18);if(d.type==='heart'){v38PickupHalo(X,Y,'#ff6b70');ctx.save();ctx.fillStyle='#e94f58';ctx.beginPath();ctx.moveTo(X,Y+5);ctx.bezierCurveTo(X-8,Y-1,X-4,Y-7,X,Y-3);ctx.bezierCurveTo(X+4,Y-7,X+8,Y-1,X,Y+5);ctx.fill();ctx.restore()}else if(d.type==='rupee'){v38PickupHalo(X,Y,'#65d48a');v38Poly([[X,Y-6],[X+4,Y],[X,Y+6],[X-4,Y]],d.value===5?'#56c9d1':'#52b96e','#d8fff0',.55)}else if(d.type==='magic'){v38PickupHalo(X,Y,'#8a75ef');v38Ellipse(X,Y,3.8,5.2,'#6c59cf');v38Ellipse(X-1,Y-2,1.5,2,'#cfc6ff',.65)}else if(d.type==='key'){v38PickupHalo(X,Y,'#f0d46a');v38Ellipse(X,Y-3,3.2,3.2,'#e8c85a');ctx.save();ctx.strokeStyle='#e8c85a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X,Y+7);ctx.lineTo(X+4,Y+7);ctx.stroke();ctx.restore()}else if(d.type==='bomb'||d.type==='bomb3'){drawUnifiedBomb(X,Y,70,.68)}else if(d.type==='emberCandle'){v38PickupHalo(X,Y,'#ff8b50');v38RoundRect(X-1.4,Y-2,2.8,8,1,'#8e5d37');v38Glow(X,Y-5,5,'#ff8b50',.35);v38Ellipse(X,Y-5,2.5,4,'#f26d3d');v38Ellipse(X,Y-6.3,1.3,2.3,'#ffe07b')}else if(d.type==='shard'||d.type==='relic'){v38PickupHalo(X,Y,d.type==='relic'?'#fff0a0':'#ffb84e');v38Poly([[X,Y-7],[X+5,Y],[X,Y+7],[X-5,Y]],d.type==='relic'?'#fff1a6':'#f3a43e','#fff8da',.7)}else if(d.type==='heartContainer'){v38PickupHalo(X,Y,'#ff6b70');v38Ellipse(X-2,Y,4,4,'#e94f58');v38Ellipse(X+2,Y,4,4,'#e94f58');v38Poly([[X-6,Y],[X+6,Y],[X,Y+8]],'#e94f58')}else if(d.type==='bombBag'){v38PickupHalo(X,Y,'#d3a55e');v38RoundRect(X-5,Y-5,10,11,3,'#8a5d37','#d4aa6a',.7);ctx.fillStyle='#f3e5c0';ctx.font='bold 6px sans-serif';ctx.textAlign='center';ctx.fillText('B',X,Y+3)}else if(d.type==='windDisc'){v38PickupHalo(X,Y,'#9be0d6');ctx.save();ctx.strokeStyle='#9be0d6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,Y,5,0,Math.PI*1.6);ctx.stroke();ctx.restore()}else if(d.type==='rupeeChest'){v38PickupHalo(X,Y,'#f1d06a');v38RoundRect(X-7,Y-5,14,10,2,'#8b5d36','#e4b55d',.8);v38RoundRect(X-6,Y-6,12,4,2,'#a9753e','#e4b55d',.7)}else{const label=(typeof ITEM_REWARD_LABEL!=='undefined'&&ITEM_REWARD_LABEL[d.type])||d.type||'?';v38PickupHalo(X,Y,'#8fd0d8');v38RoundRect(X-6,Y-6,12,12,3,'#405b58','#a6d9d5',.8);ctx.fillStyle='#eefaf8';ctx.font='bold 5px sans-serif';ctx.textAlign='center';ctx.fillText(label.slice(0,1).toUpperCase(),X,Y+2)}}};

const _v38OldInterior=drawInterior;
drawInterior=function(){
 const info=INTERIORS[insideKey];if(!info)return _v38OldInterior();
 if(!info.dungeon){_v38OldInterior();return}
 const shape=(typeof V37_ROOM_SHAPE!=='undefined'&&V37_ROOM_SHAPE[insideKey])||'large',b=(typeof v37ShapeBounds==='function'&&v37ShapeBounds(shape))||{l:16,r:239,t:16,b:223};
 const theme=info.theme||'ruin',tc=(typeof v35Theme==='function'?v35Theme(theme):'#9e936f');
 ctx.fillStyle='#111512';ctx.fillRect(0,0,256,240);
 const floor=ctx.createLinearGradient(b.l,b.t,b.r,b.b);floor.addColorStop(0,'#57564d');floor.addColorStop(.5,'#454942');floor.addColorStop(1,'#343a36');v38RoundRect(b.l,b.t,b.r-b.l,b.b-b.t,5,floor,'rgba(184,169,127,.18)',1);
 ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#a9a18b';ctx.lineWidth=.5;for(let yy=b.t+12;yy<b.b;yy+=16){ctx.beginPath();ctx.moveTo(b.l+4,yy);ctx.lineTo(b.r-4,yy);ctx.stroke()}for(let xx=b.l+14;xx<b.r;xx+=24){ctx.beginPath();ctx.moveTo(xx,b.t+4);ctx.lineTo(xx,b.b-4);ctx.stroke()}ctx.restore();
 const links=DUNGEON_LINKS[insideKey]||{};const open=(dir)=>!!links[dir]||!!(typeof V37_DUNGEON_SECRETS!=='undefined'&&V37_DUNGEON_SECRETS[insideKey]?.[dir]&&G.taken.has(V37_DUNGEON_SECRETS[insideKey][dir].token));
 function wallDoor(dir){ctx.save();if(dir==='U'){v38RoundRect(108,b.t-1,40,12,4,'#141816','rgba(210,196,151,.25)',.8);v38Glow(128,b.t+6,12,tc,.09)}else if(dir==='D'){v38RoundRect(108,b.b-11,40,12,4,'#141816','rgba(210,196,151,.25)',.8);v38Glow(128,b.b-6,12,tc,.09)}else if(dir==='L'){v38RoundRect(b.l-1,100,12,40,4,'#141816','rgba(210,196,151,.25)',.8);v38Glow(b.l+6,120,12,tc,.09)}else{v38RoundRect(b.r-11,100,12,40,4,'#141816','rgba(210,196,151,.25)',.8);v38Glow(b.r-6,120,12,tc,.09)}ctx.restore()}
 for(const d of ['U','D','L','R'])if(open(d))wallDoor(d);
 const f=(typeof ROOM_FEATURES!=='undefined'&&ROOM_FEATURES[insideKey])||null;if(f){for(const p of f.pillars||[]){const X=p[0]*T+8,Y=p[1]*T+8;v38Shadow(X,Y+7,6,2,.25);const pg=ctx.createLinearGradient(X-4,Y-8,X+4,Y+8);pg.addColorStop(0,'#9c9683');pg.addColorStop(1,'#53554d');v38Ellipse(X,Y,4.2,8,pg);v38Ellipse(X,Y-7,5,2.1,'#aaa48f');v38Ellipse(X,Y+7,5,2,'#484b45')}for(let i=0;i<(f.pots||[]).length;i++){if(G.taken.has(`pot:${insideKey}:${i}`))continue;const [tx,ty]=f.pots[i],X=tx*T+8,Y=ty*T+8;v38Shadow(X,Y+5,4,1.4,.2);const pg=ctx.createLinearGradient(X-3,Y-5,X+3,Y+6);pg.addColorStop(0,'#b57b53');pg.addColorStop(1,'#764b33');v38Ellipse(X,Y,3.8,5.3,pg);v38RoundRect(X-4,Y-5,8,2,1,'#c99569')}for(const s of f.spikes||[]){const X=s[0]*T,Y=s[1]*T;for(let q=0;q<3;q++)v38Poly([[X+3+q*4,Y+12],[X+5+q*4,Y+5],[X+7+q*4,Y+12]],'#b9b9ad','#64675f',.5)}}
 if(typeof V35_CHESTS!=='undefined')for(const c of V35_CHESTS[insideKey]||[]){const X=c.x*T+8,Y=c.y*T+8,openC=typeof chestOpened==='function'&&chestOpened(c);v38Shadow(X,Y+6,6,1.8,.22);v38RoundRect(X-6,Y-3,12,8,2,openC?'#705036':'#9b6a3d','#d5af67',.8);if(!openC)v38RoundRect(X-5,Y-6,10,4,2,'#b77f46','#e1bd6c',.7)}
 if(theme==='cinder'||theme==='citadel'){for(const [lx,ly] of [[b.l+16,b.t+18],[b.r-16,b.t+18]]){v38Glow(lx,ly,16,'#ff7b42',.22);v38Ellipse(lx,ly,2.4,4.8,'#f0793d');v38Ellipse(lx,ly-2,1.2,2.3,'#ffe084')}}else if(theme==='tide'||theme==='crystal'){v38Glow((b.l+b.r)/2,(b.t+b.b)/2,70,theme==='tide'?'#5bbbc8':'#8fdced',.08)}else if(theme==='moon'||theme==='shadow'){v38Glow((b.l+b.r)/2,(b.t+b.b)/2,80,'#8e7bd0',.075)}
 if(typeof drawV37SecretWall==='function')drawV37SecretWall();if(typeof currentPuzzle==='function'){const p=currentPuzzle();if(p&&typeof drawPuzzleNode==='function'){for(let i=0;i<p.nodes.length;i++)drawPuzzleNode(p,p.nodes[i],i);if(typeof drawPuzzleGate==='function')drawPuzzleGate(p)}}
 if(info.shop&&typeof drawShop==='function')drawShop();
};

const _v38Draw=draw;
draw=function(){
 _v38Draw();
 if(typeof titleOpen!=='undefined'&&titleOpen)return;
 if(!mapOpen&&!inventoryOpen&&!slide){
   for(const b of bombObjs){v38Shadow(b.x,b.y+6,5.5,1.6,.25);const flash=b.fuse<20&&((b.fuse/3)|0)%2;v38Ellipse(b.x,b.y,5.6,5.6,flash?'#7f3540':'#222831');v38Ellipse(b.x-1.8,b.y-2,1.8,1.3,'#63717e',.45);ctx.save();ctx.strokeStyle='#8c6741';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(b.x+2,b.y-4);ctx.quadraticCurveTo(b.x+4,b.y-7,b.x+5,b.y-9);ctx.stroke();ctx.restore();v38Glow(b.x+5,b.y-9,3,flash?'#ff7840':'#f5c65f',.55)}
   const g=ctx.createRadialGradient(128,112,65,128,112,165);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,insideKey?'rgba(4,7,6,.30)':'rgba(9,20,11,.13)');ctx.fillStyle=g;ctx.fillRect(0,0,256,224);
   if(!insideKey){const sun=ctx.createLinearGradient(0,0,256,240);sun.addColorStop(0,'rgba(255,244,198,.07)');sun.addColorStop(.45,'rgba(255,255,255,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,256,224)}
 }
};
