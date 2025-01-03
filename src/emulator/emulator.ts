import { Cache } from "./components/cache.ts";
import { RAM } from "./components/ram.ts";
import { Registers } from "./components/registers.ts";

const band = (x: number, y: number) => x & y;
const bor = (x: number, y: number) => x | y;
const lshift = (x: number, bits: number) => x << bits;
const rshift = (x: number, bits: number) => x >>> bits; // Use unsigned right shift
const rrotate = (x: number, bits: number) => (x >>> bits) | (x << (32 - bits));
const lrotate = (x: number, bits: number) => (x << bits) | (x >>> (32 - bits));
const extract = (x: number, bit: number) => (x >>> bit) & 1;

interface Instruction {
  opcode: number;
  /** Registers, immediates, labels */
  operands: number[]; // Store operand values directly
}

function assemble(assemblyCode: string): Uint32Array {
  // ... (Lexing, parsing, symbol table creation) ...

  const machineCode: number[] = [];
  // ... (Code generation) ...

  return new Uint32Array(machineCode);
}

export class Emulator {
  /**
   * hword-based addresses
   */
  private pc = 256; // Starting address

  private registers = new Registers();
  private flag = false;
  private cache = new Cache();
  private ram = new RAM();

  constructor(machineCode: Uint32Array) {
    // Load machine code into RAM after column 0
    this.ram.setArray(machineCode, 128);
  }

  /**
   * @param instructionHWord 16 bit
   * @returns
   */
  private decodeInstruction(instructionHWord: number): Instruction {
    const opcode = rshift(instructionHWord, 12);
    const operands: number[] = [];

    // Extract operands based on the instruction format (you'll need to fill this in)
    // Example for a RRR instruction:
    operands.push(band(rshift(instructionHWord, 8), 0xF)); // Register 1
    operands.push(band(rshift(instructionHWord, 4), 0xF)); // Register 2
    operands.push(band(instructionHWord, 0xF)); // Register 3

    return { opcode, operands };
  }

  run() {
    while (true) {
      const instructionHWord = this.ram.get16(this.pc++);
      const instruction = this.decodeInstruction(instructionHWord);

      switch (instruction.opcode) {
        case 0x0: {
          // ADD
          this.registers.set(
            instruction.operands[2],
            this.registers.get(instruction.operands[0]) +
              this.registers.get(instruction.operands[1]),
          );
          break;
        }
        case 0x1: {
          // TODO
          break;
        }
        case 0xA: //OUT
          if (instruction.operands[0] == 14) {
            const data = this.registers.get(instruction.operands[1]);
            // TODO
            // for (let i = 0; i < 32; i++) {
            //   this.display[i] = extract(data, 31 - i);
            // }
            // this.updateDisplay();
          }
          break;
        case 0xE: // Various instructions (LD, JMP, JNF, JF, IN) - needs more decoding
          if (band(instructionHWord, 0xF00) == 0x100) {
            this.registers.set(
              instruction.operands[1],
              this.ram.get(this.pc++),
            );
          }
          if (band(instructionHWord, 0xF00) == 0x000) {
            this.pc = this.ram.get(this.pc);
          }
          break;
        case 0xee: // HLT
          return;
        default:
          console.warn(
            `Unimplemented opcode: 0x${instruction.opcode.toString(16)}`,
          );
      }
    }
  }
}
