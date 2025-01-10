export class DisplayUI {
  private context: CanvasRenderingContext2D;
  constructor($canvas: HTMLCanvasElement) {
    this.context = $canvas.getContext("2d")!;
  }

  render(array: (0 | 1)[][]) {
    const context = this.context;
    const width = context.canvas.width;
    const prevHeight = context.canvas.height;

    if (width !== prevHeight) {
      // make square
      context.canvas.height = width;
    }

    // reset canvas
    if (context.reset) {
      context.reset();
    } else {
      context.clearRect(0, 0, width, width);
      context.resetTransform();
      context.beginPath();
    }

    const maxX = (array[0] ?? []).length;
    const maxY = array.length;

    const n = Math.max(maxX, maxY);
    const cellSize = width / n;

    context.fillStyle = "#212529";
    for (let j = 0; j < maxY; j++) {
      const row = array[j];
      const jMultCell = j * cellSize;
      for (let i = 0; i < maxX; i++) {
        if (row[i] === 1) {
          context.rect(i * cellSize, jMultCell, cellSize, cellSize);
        }
      }
    }

    context.fill();
  }
}
