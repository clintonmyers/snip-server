const shuffle = <T>(arr: T[]): T[] => {
  const unshuffled = arr;
  const shuffled: T[] = [];
  while (unshuffled.length) {
    const i = randomIndex(unshuffled);
    const item = unshuffled.splice(i, 1)[0];
    shuffled.push(item);
  }
  return shuffled;
};
