interface PlayerTurn {
  gameId: number;
  playerId: number;
  turn: number;
  actions: Action[];
}
