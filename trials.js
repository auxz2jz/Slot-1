/* v34 dungeon trials: force exploration before boss wings */
const DUNGEON_TRIALS={};
for(const d of DUNGEON_DEFS){const token=lockToken(d.p+'9',d.p+'11');DUNGEON_TRIALS[token]=[d.p+'2',d.p+'4',d.p+'8'];}
DUNGEON_TRIALS[lockToken('citadel6','citadel7')]=['citadel2','citadel3','citadel6'];
const _v34DungeonLink=dungeonLink;
dungeonLink=function(dir){const to=DUNGEON_LINKS[insideKey]?.[dir];if(!to)return null;const token=lockToken(insideKey,to),need=DUNGEON_TRIALS[token];if(need&&!need.every(k=>G.interiorStates[k]?.cleared))return null;return _v34DungeonLink(dir)};