interface TurnInput {
  [turn: number]: {
    [playerId: number]: Action[];
  };
}
