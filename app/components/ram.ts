import { create } from "../util/create.ts";

function split(u32: number) {
  return [u32 & 0xffff, u32 >>> 16];
}

export class RAMUI {
  private cells: HTMLElement[] = [];
  constructor(private $root: HTMLElement) {
  }

  initialize() {
    const $table = create("table");
    $table.classList.add("font-monospace");

    this.cells = [];

    for (let i = 0; i < 64; i++) {
      const $row = create("tr");
      const $td = create("td");
      for (let j = 0; j < 16; j++) {
        const $cell = create("span");
        this.cells.push($cell);
        $td.append($cell);
      }
      $row.append($td);

      $table.append($row);
    }

    this.$root.replaceChildren($table);
  }

  render(ram: number[]) {
    // console.log(ram);
    const hwords = ram.slice(128).flatMap((word) => split(word));
    const cells = this.cells;
    for (let i = 0; i < cells.length; i++) {
      const hword = hwords[i];
      if (hword == undefined) {
        return;
      }
      cells[i].textContent = hword.toString(16).toUpperCase().padStart(4, "0") +
        " ";
    }
  }
}
