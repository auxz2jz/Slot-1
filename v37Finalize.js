/* v37 final lifecycle guard */
const _v37FinalNewGame=newGame;
newGame=function(clear=false){_v37FinalNewGame(clear);ensureV37States();applyV37EnemyVariants()};
const _v37FinalLoadGame=loadGame;
loadGame=function(){const ok=_v37FinalLoadGame();if(ok){ensureV37States();applyV37EnemyVariants()}return ok};

/* v38 illustrated renderer loads last so it cannot be overwritten by older graphics layers */
if(!document.querySelector('script[data-emberwood-v38]')){
  const v38=document.createElement('script');
  v38.src='v38Graphics.js?v=38r1';
  v38.dataset.emberwoodV38='1';
  document.body.appendChild(v38);
}
