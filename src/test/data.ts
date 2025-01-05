/**
 * exp.323
 */
export const expAsm = `; An efficient method to compute exponents.

start:	ld 3,x1
	ld 10,x2
	ld end,xC
	jmp exp
end:	out x8,!0xe
	out x0,!0xe
	hlt

; Raise x1 to the power of x2, result in x8.
exp:	ld 1,x9      ; Bitmask.
	xor x0,x9,x8 ; Final result accumulator.
	xor x0,x1,xB ; x1 ** (2**n) accumulator.
	xor x0,x2,xA ; Exponent.
	ld -1,xE     ; Amount to shift xD by.
loop:	xor xA,x0,x0
	jnf xC
	and x9,xA,x0
	jnf nomul
	mul xB,x8,x8
nomul:	mul xB,xB,xB
	shf xA,xE,xA
	jmp loop
`;

/**
 * Compilied by lua
 */
export const expMachineCode = new Uint32Array([
  0x0003e011,
  0xe0120000,
  0x0000000a,
  0x010be01c,
  0xe0000000,
  0xe01e0114,
  0x0000000e,
  0xe01ea8e1,
  0x0000000e,
  0xeeeea0e1,
  0x0001e019,
  0xd0980000,
  0xd02ad01b,
  0xffffe01e,
  0xda00ffff,
  0xc9a0e2c1,
  0x0123e001,
  0x2bbb2b88,
  0xe0007aea,
  0x0000011d,
]);
