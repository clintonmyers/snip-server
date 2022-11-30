const drawMany = (
  hand: Card[],
  deck: Card[],
  qty: number = 1,
): [Card[], Card[]] => {
  if (qty > 1) {
    drawMany(...draw(hand, deck), qty - 1);
  } else {
    return draw(hand, deck);
  }
};
