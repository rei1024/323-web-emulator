// assigned number is emulator internal.

/** Assembly: add xX,xY,xZ | Add: xZ = xX + xY; flag = overflow */
export const I_ADD = 0;

/** Assembly: sub xY,xX,xZ | Subtract: xZ = xY - xX; flag = xY >= xX */
export const I_SUB = 1;

/** Assembly: mul xX,xY,xZ | Multiply: xZ = xX * xY; flag = overflow */
export const I_MUL = 2;

/** Assembly: div xX,xY,xZ | Divide: xZ = xX / xY; flag = INZ. Division by 0 returns -1. */
export const I_DIV = 3;

/** Assembly: mod xX,xY,xZ | Modulus: xZ = xX % xY; flag = INZ. If xY is 0, xZ = xX. */
export const I_MOD = 4;

/** Assembly: shf xX,xY,xZ | Logical shift: xZ = xX shifted by xY (LSB 6 bits of xY are used). */
export const I_SHF = 5;

/** Assembly: rot xX,xY,xZ | Rotate: xZ = xX rotated by xY (LSB 6 bits of xY are used). */
export const I_ROT = 6;

/** Assembly: sha xX,xY,xZ | Arithmetic shift: xZ = xX shifted arithmetically by xY (LSB 6 bits of xY are used). */
export const I_SHA = 7;

/** Assembly: or xX,xY,xZ | Bitwise OR: xZ = xX | xY; flag = INZ */
export const I_OR = 8;

/** Assembly: and xX,xY,xZ | Bitwise AND: xZ = xX & xY; flag = INZ */
export const I_AND = 9;

/** Assembly: xor xX,xY,xZ | Bitwise XOR: xZ = xX ^ xY; flag = INZ */
export const I_XOR = 10;

/** Assembly: st xX,xY | Store: RAM[xY] = xX */
export const I_STR = 11;

/** Assembly: out xX,xY | Output: Write xX to I/O pin xY; flag set by peripheral. */
export const I_OUT = 12;

/** Assembly: jmp IMM16 | Jump to immediate: PC = IMM16 */
export const I_JMPI = 13;

/** Assembly: jf IMM16 | Jump if flag set: PC = IMM16 */
export const I_JFI = 14;

/** Assembly: jnf IMM16 | Jump if flag not set: PC = IMM16 */
export const I_JNFI = 15;

/** Assembly: ld IMM32,xZ | Load immediate: xZ = IMM32 */
export const I_LDI = 16;

/** Assembly: ld xY,xZ | Load from RAM: xZ = RAM[xY] */
export const I_LDR = 17;

/** Assembly: jmp xY | Jump to register: PC = xY */
export const I_JMPR = 18;

/** Assembly: jf xY | Jump to register if flag set: PC = xY */
export const I_JFR = 19;

/** Assembly: jnf xY | Jump to register if flag not set: PC = xY */
export const I_JNFR = 20;

/** Assembly: in xY,xZ | Input: Read word from I/O pin xY to xZ; flag set by peripheral. */
export const I_IN = 21;

/** Assembly: hlt | Halt: Stop the machine. */
export const I_HLT = 22;
