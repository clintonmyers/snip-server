interface GameState {
  [playerId: number]: {
    deck: Card[];
    hand: Card[];
    board: Card[][];
    first: boolean;
    energy: number;
  };
  locations: GameLocation[];
  turn: number;
  maxTurns: number;
  firstPlayer: number;
  secondPlayer: number;
  turns: {
    [turnNumber: number]: {
      startTime: number;
      endTime?: number;
      maxTime: number;
    };
  };
}
