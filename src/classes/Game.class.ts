class Game {
  constructor(players: Player[]) {
    this.setup(players);
  }

  public startTime = Date.now();

  private gs: GameState;

  private turnInput: TurnInput = {};

  private turnOutput: TurnOutput = {};

  private setup = (players: Player[]) => {
    // Randomly order the players for going first and second
    const randomized = [...shuffle(players)];
    this.gs.firstPlayer = randomized[0].id;
    this.gs.secondPlayer = randomized[1].id;

    // Set up each player's initial game state
    randomized.map((p, i) => {
      this.gs[p.id] = {
        // Shuffle the deck
        deck: shuffle([...p.deck]),
        hand: [],
        board: [[], [], []],
        // Flag for who goes first, should this stay or change each turn?
        first: !!i,
        energy: 1,
      };
      // Draw 3 cards to start
      this.drawCards(p.id, 3);

      // Generate Initial Locations
      this.setupLocations();

      this.gs.turn = 1;
      this.gs.maxTurns = 6;

      this.setTime(0);
      console.log('Game is generated!');
      console.log(this.gs);
      // Send data to clients
    });
  };

  // Used for swapping player order after every turn
  private swapPlayerOrder = () => {
    const oldFirst = this.gs.firstPlayer;
    const oldSecond = this.gs.secondPlayer;
    this.gs.firstPlayer = oldSecond;
    this.gs.secondPlayer = oldFirst;
  };

  private drawCards = (id: number, qty = 1) => {
    [this.gs[id].hand, this.gs[id].deck] = drawMany(
      [...this.gs[id].hand],
      [...this.gs[id].deck],
      qty,
    );
  };

  private setupLocations = () => {
    this.gs.locations = [
      generateLocation(),
      { id: -1, name: 'Secret' },
      { id: -1, name: 'Secret' },
    ];
  };

  private revealLocationOnTurn = (turn: number): void => {
    if (turn <= this.gs.locations.length) {
      this.generateLocationByIndex(turn - 1);
    }
  };

  private generateLocationByIndex = (i: number): void => {
    this.gs.locations[i] = generateLocation();
  };

  private handleTurnStart = (turn: number) => {
    this.swapPlayerOrder();
    this.setEnergy(turn);
    this.setTime(turn);
    this.revealLocationOnTurn(turn);
    // Send current data
  };

  // Set available energy equal to turn number
  private setEnergy = (turn: number) => {
    this.gs[this.gs.firstPlayer].energy = turn;
    this.gs[this.gs.secondPlayer].energy = turn;
  };

  // Set start time and max time available for turn.
  // End time is set when both players end their turn.
  private setTime = (turn: number) => {
    // On turn 0, set offset to 10 seconds instead of 30
    const maxOffset = turn ? 30000 : 10000;
    this.gs.turns[turn].startTime = Date.now();
    this.gs.turns[turn].maxTime = Date.now() + maxOffset;
  };

  // Method to be called when a player submits their turn actions
  public endTurn = ({ playerId, turn, actions }: PlayerTurn): void => {
    // Verify that the submission is for the correct turn
    if (turn === this.gs.turn) {
      this.turnInput[turn][playerId] = actions;
    }

    if (this.turnHasNotBeenProcessed(turn)) {
      if (this.bothPlayersHaveSubmitted(turn)) {
        this.handleTurnEnd();
      }
    }
  };

  // Check to see if a certain turn has already been processed
  private turnHasNotBeenProcessed = (turn: number): boolean => {
    return !this.turnOutput[turn].length;
  };

  // Check to see if both players have submitted their actions for a given turn
  private bothPlayersHaveSubmitted = (turn: number): boolean => {
    const turnInputs = this.turnInput[turn];
    const submittedTurns = Object.keys(turnInputs).length;
    return submittedTurns === 2;
  };

  private handleAction = (
    turn: number,
    gs: GameState,
    action: Action,
  ): GameState => {
    if (action.type === 'play') {
      this.playCard(action.playerId, action.instanceId, action.endLoc);
    } else if (action.type === 'move') {
      // Verify card can be moved
      // Move card
    }
    return { ...this.gs };
  };

  playCard = (playerId: number, instanceId: number, endLoc: LocationIndex) => {
    const spacesUsed = this.gs[playerId].board[endLoc].length;
    // Checking if a space is available at that location. MAX 4 per location per side
    if (spacesUsed < 4) {
      const hand = [...this.gs[playerId].hand];
      const card = hand.filter((c) => c.instanceId === instanceId)[0];
      const playerEnergy = this.gs[playerId].energy;
      // Determine if the player has enough resources to play the card
      if (card.cost <= playerEnergy) {
        // Add card to end location
        this.gs[playerId].board[endLoc].push(card);
        // Remove card from hand
        this.gs[playerId].hand = hand.filter(
          (c) => c.instanceId !== instanceId,
        );
      }
    }
  };

  private handleTurnEnd = () => {
    const turn = this.gs.turn;
    // Gather and order player actions
    const firstPlayerActions = this.turnInput[turn][this.gs.firstPlayer];
    const secondPlayerActions = this.turnInput[turn][this.gs.secondPlayer];
    const actions: Action[] = [...firstPlayerActions, ...secondPlayerActions];

    this.turnOutput[turn] = [];

    // Handle each action in order and output new board state
    actions.forEach((action) => {
      // If this is the first action of the turn, use the current game state ${gs}
      // Otherwise, use the game state generated after the previous action
      const length = this.turnOutput[turn].length;
      const lastGS = length
        ? this.turnOutput[turn][length - 1].gameState
        : { ...this.gs };
      this.handleAction(turn, lastGS, action);
    });

    // Set board state to the state after all actions have been resolved
    const actionSummary = this.turnOutput[turn];
    const finalIndex = actionSummary.length - 1;
    if (finalIndex > -1) {
      this.gs = { ...actionSummary[finalIndex].gameState };
    }

    this.gs.turn += 1;

    if (this.gs.turn > this.gs.maxTurns) {
      this.endGame();
    }

    // SEND GAME STATE TO USERS
  };

  private endGame = () => {
    console.log('end game');
  };
}
