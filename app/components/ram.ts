import { create } from "../util/create.ts";

function split(u32: number) {
  return [u32 & 0xffff, u32 >>> 16];
}

const WORD_OFFSET = 128;

const ROWS_PER_PAGE = 32;

const CHUNK = 16;

function renderHeader($h: HTMLElement, i: number) {
  $h.textContent = "0x" +
    (((CHUNK * i) + WORD_OFFSET * 2).toString(16).toUpperCase().padStart(
      4,
      "0",
    ));
}

export class RAMUI {
  private cells: HTMLElement[] = [];
  private headers: HTMLElement[] = [];

  private page = 0;
  constructor(
    private $root: HTMLElement,
    private $leftPage: HTMLButtonElement,
    private $rightPage: HTMLButtonElement,
  ) {
  }

  initialize() {
    this.cells = [];
    this.headers = [];
    this.page = 0;

    const $table = create("table");
    $table.classList.add("font-monospace");

    for (let i = 0; i < ROWS_PER_PAGE; i++) {
      const $row = create("tr");
      const $td = create("td");
      for (let j = 0; j < CHUNK; j++) {
        const $cell = create("span");
        $cell.style.marginRight = "8px";
        this.cells.push($cell);
        $td.append($cell);
      }
      const $th = create("th");
      this.headers.push($th);
      renderHeader($th, i);
      $th.style.paddingRight = "8px";
      $row.append($th, $td);

      $table.append($row);
    }

    this.$root.replaceChildren($table);
  }

  increment() {
    this.page++;
  }

  decrement() {
    this.page--;
  }

  render(ram: number[], pc: number) {
    this.$leftPage.disabled = this.page <= 0;

    const startWordAddress = WORD_OFFSET +
      this.page * ROWS_PER_PAGE * (CHUNK >> 1);
    const hwords = ram.slice(startWordAddress).flatMap((word) => split(word));

    this.$rightPage.disabled = hwords.length === 0;

    const cells = this.cells;
    for (let i = 0; i < cells.length; i++) {
      const hword = hwords[i];
      if (hword == undefined) {
        return;
      }
      const addr = startWordAddress * 2 + i;
      const cell = cells[i];
      if (pc === addr) {
        cell.style.backgroundColor = "#03dffc66";
      } else {
        cell.style.backgroundColor = "";
      }
      cell.textContent = hword.toString(16).toUpperCase().padStart(4, "0");
    }

    for (let i = 0; i < ROWS_PER_PAGE; i++) {
      renderHeader(this.headers[i], i + this.page * ROWS_PER_PAGE);
    }
  }
}
