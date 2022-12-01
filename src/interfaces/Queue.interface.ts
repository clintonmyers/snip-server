interface Queue {
  [playerId: number]: {
    gameId: string | null;
    player: Player;
  };
}
