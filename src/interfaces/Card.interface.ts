interface Card {
  instanceId?: number;
  name: string;
  cost: number;
  power: number;
  type: 'hero' | 'token';
}
