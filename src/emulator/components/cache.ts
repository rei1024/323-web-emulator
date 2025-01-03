interface CacheLine {
  data: Uint16Array; // 32 hwords
  address: number;
}

export class Cache {
  // Array of 4 cache lines
  private lines: CacheLine[] = Array(4).fill(null).map(() => ({
    data: new Uint16Array(32),
    address: 0,
  }));
  // LRU order (array of 4 indices)
  private order: number[] = [0, 1, 2, 3];
}
