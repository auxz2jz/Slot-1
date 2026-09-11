/* v39 Hand-Painted Asset Edition */
ctx.imageSmoothingEnabled=true;
const V39_ASSET={};
for(const [k,src] of Object.entries(window.V39_ASSET_SRC||{})){const im=new Image();im.decoding='async';im.src=src;V39_ASSET[k]=im}
function v39Ready(k){const im=V39_ASSET[k];return !!(im&&im.complete&&im.naturalWidth)}
function v39Draw(k,dx,dy,dw,dh,a=1){const im=V39_ASSET[k];if(!v39Ready(k))return false;ctx.save();ctx.globalAlpha=a;ctx.drawImage(im,dx,dy,dw,dh);ctx.restore();return true}
function v39Dir(){const cx=Math.cos(face),sy=Math.sin(face);if(Math.abs(cx)>Math.abs(sy))return cx>0?'hero_right':'hero_left';return sy>0?'hero_front':'hero_back'}
const _v39PrevHero=drawHero;
drawHero=function(){if(invuln&&((invuln/4)|0)%2)return;const key=v39Dir();if(!v39Ready(key))return _v39PrevHero();const moving=walk>0&&!attack,bob=moving?Math.sin(walk*.85)*.7:0,w=26,h=36,dx=x+8-w/2,dy=y+17-h+bob;if(typeof v38Shadow==='function')v38Shadow(x+8,y+16,7.5,2.4,.28);v39Draw(key,dx,dy,w,h);if(G.outfit&&G.outfit!=='traveler'){const tint=G.outfit==='emberTunic'?'rgba(190,55,35,.22)':G.outfit==='tideTunic'?'rgba(40,130,180,.22)':'rgba(95,65,150,.22)';ctx.save();ctx.globalCompositeOperation='source-atop';ctx.fillStyle=tint;ctx.fillRect(dx,dy,w,h);ctx.restore()}};
const V39_ENEMY_ASSET={thornling:'thornling',fieldRunner:'fieldRunner',mossBoar:'mossBoar',leafWisp:'leafWisp',stoneCrab:'stoneCrab',ridgeArcher:'ridgeArcher',bogSpitter:'bogSpitter',duskWisp:'duskWisp',shadeKnight:'shadeKnight',emberImp:'emberImp',coalHound:'coalHound'};
const V39_ENEMY_SIZE={thornling:[20,20],fieldRunner:[25,19],mossBoar:[30,23],leafWisp:[20,19],stoneCrab:[26,20],ridgeArcher:[23,24],bogSpitter:[23,21],duskWisp:[22,23],shadeKnight:[23,28],emberImp:[20,24],coalHound:[31,24]};
const _v39PrevEnemy=drawEnemy;
drawEnemy=function(e){const v=e.v37Variant||'',key=V39_ENEMY_ASSET[v];if(!key||!v39Ready(key)||e.maxHp)return _v39PrevEnemy(e);if(e.flash&&((e.flash/2)|0)%2)return;const s=V39_ENEMY_SIZE[v]||[22,22],w=s[0],h=s[1],bob=v.includes('Wisp')?Math.sin(performance.now()/180+e.x)*1.2:0;if(typeof v38Shadow==='function'&&!v.includes('Wisp'))v38Shadow(e.x+7,e.y+15,Math.max(5,w*.32),2,.22);v39Draw(key,e.x+7-w/2,e.y+14-h+bob,w,h)};
const _v39Tree=tree;tree=function(X,Y){const key=((X/16+Y/16+(typeof id==='number'?id:0))%3===0)?'tree_large':'tree_small';if(!v39Ready(key))return _v39Tree(X,Y);const large=key==='tree_large',w=large?30:27,h=large?39:36;if(typeof v38Shadow==='function')v38Shadow(X+8,Y+15,8,2.5,.22);v39Draw(key,X+8-w/2,Y+16-h,w,h)};
const _v39Rock=rock;rock=function(X,Y){const key=((X+Y)%32===0)?'rock_large':'rock_small';if(!v39Ready(key))return _v39Rock(X,Y);const big=key==='rock_large',w=big?20:16,h=big?18:14;if(typeof v38Shadow==='function')v38Shadow(X+8,Y+14,6,1.8,.18);v39Draw(key,X+8-w/2,Y+15-h,w,h)};
const _v39Cave=cave;cave=function(X,Y){if(!v39Ready('cave_asset'))return _v39Cave(X,Y);if(typeof v38Shadow==='function')v38Shadow(X+8,Y+15,9,2.2,.27);v39Draw('cave_asset',X-8,Y-13,32,30)};
if(typeof drawV37Brush==='function'){const _v39Brush=drawV37Brush;drawV37Brush=function(X,Y,edge=false){if(!v39Ready('burn_bush'))return _v39Brush(X,Y,edge);if(typeof v38Shadow==='function')v38Shadow(X+8,Y+15,7,2,.18);v39Draw('burn_bush',X-1,Y-3,18,18);if(edge&&typeof v38Glow==='function')v38Glow(X+8,Y+8,10,'#ef8a43',.15)}}
const _v39Title=typeof drawTitle==='function'?drawTitle:null;if(_v39Title)drawTitle=function(){_v39Title();ctx.fillStyle='#f0dca6';ctx.font='bold 5px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('v39 · HAND-PAINTED ASSET EDITION',128,238)};
