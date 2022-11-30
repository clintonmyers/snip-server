interface Action {
  playerId: number;
  instanceId: number;
  type: 'play' | 'move';
  startLoc: 'hand' | LocationIndex;
  endLoc: LocationIndex;
}
