/* v37 final lifecycle guard */
const _v37FinalNewGame=newGame;
newGame=function(clear=false){_v37FinalNewGame(clear);ensureV37States();applyV37EnemyVariants()};
const _v37FinalLoadGame=loadGame;
loadGame=function(){const ok=_v37FinalLoadGame();if(ok){ensureV37States();applyV37EnemyVariants()}return ok};
