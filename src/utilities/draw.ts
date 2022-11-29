const draw = (hand: Card[], deck: Card[]): [Card[], Card[]] => {
  if (hand.length > 6 || !deck.length) return [hand, deck];
  const [drawnCard, ...newDeck] = deck;
  const newHand = [...hand, drawnCard];
  return [newHand, newDeck];
};
