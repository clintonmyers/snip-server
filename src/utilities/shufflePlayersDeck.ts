const shufflePlayersDeck = (player: Player): Player => {
  return { deck: shuffle(player.deck), ...player };
};
