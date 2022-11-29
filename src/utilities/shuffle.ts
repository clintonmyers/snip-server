const shuffle = (deck: Card[]): Card[] => {
  const unshuffled = deck;
  const shuffled: Card[] = [];
  while (unshuffled.length) {
    const i = randomIndex(unshuffled);
    const item = unshuffled.splice(i, 1)[0];
    shuffled.push(item);
  }
  return shuffled;
};
