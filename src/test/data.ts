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
 * Compiled by Lua
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

/**
 * movement-demo.323
 */
export const movementDemoAsm =
  `; Simple demonstration of moving a dot on the screen with the arrow keys.
; This is mostly intended as a simple example program for people trying to learn
; how to program the 323. The program is initialised by setting some registers,
; clearing the screen, drawing the dot, then entering the main loop.
;
; The main loop checks for keypresses and jumps to corresponding labels when the
; keys are pressed. Moving up or down just means rotating the register (x1) that
; holds the dot (this is the equivalent of a y coordinate), then re-drawing it.
; Moving left or right involves changing x2, the x coordinate, and drawing at
; the new location, but not before un-drawing it at the old location.

start:	ld 0x00008000,x1 ; x1 = cursor column
	ld 16,x2         ; x2 = x coord
	ld 31,x3
dl:	out x0,!0xe      ; clear screen
	out x3,!0xe
	sub x3,!1,x3
	jf dl
draw:	out x1,!0xe      ; draw dot
	out x2,!0xe

mloop:	in !0xd,x3
	xor x3,!-1,x0
	jnf left
	xor x3,!-2,x0
	jnf up
	xor x3,!-3,x0
	jnf right
	xor x3,!-4,x0
	jnf down
	jmp mloop

down:	rot x1,!1,x1
	jmp draw

up:	rot x1,!-1,x1
	jmp draw

left:	out x0,!0xe
	out x2,!0xe
	sub x2,!1,x2
	jmp draw

right:	out x0,!0xe
	out x2,!0xe
	add x2,!1,x2
	jmp draw
`;

/**
 * Compiled by Lua
 */
export const movementDemoMachineCode = new Uint32Array([
  0x8000e011,
  0xe0120000,
  0x00000010,
  0x001fe013,
  0xe01e0000,
  0x0000000e,
  0xe01ea0e1,
  0x0000000e,
  0xe01ea3e1,
  0x00000001,
  0xe0021e33,
  0xe01e0109,
  0x0000000e,
  0xe01ea1e1,
  0x0000000e,
  0xe01ea2e1,
  0x0000000d,
  0xe01ee3e3,
  0xffffffff,
  0xe001d3e0,
  0xe01e0149,
  0xfffffffe,
  0xe001d3e0,
  0xe01e0143,
  0xfffffffd,
  0xe001d3e0,
  0xe01e0157,
  0xfffffffc,
  0xe001d3e0,
  0xe000013d,
  0xe01e011f,
  0x00000001,
  0xe00081e1,
  0xe01e0117,
  0xffffffff,
  0xe00081e1,
  0xe01e0117,
  0x0000000e,
  0xe01ea0e1,
  0x0000000e,
  0xe01ea2e1,
  0x00000001,
  0xe0001e22,
  0xe01e0117,
  0x0000000e,
  0xe01ea0e1,
  0x0000000e,
  0xe01ea2e1,
  0x00000001,
  0xe00002e2,
  0x00000117,
]);

/**
 * I'm So Meta, Even This Acronym.323
 */
export const b3s23Asm =
  `; Yo dawg, I heard you like cellular automata, so we put a cellular automaton in
; your cellular automaton so you can simulate while you simulate.
; Remember that meme? No? Sorry.
;
; B3/S23 simulator, using bitwise operations to do 8 cells at a time. Gets about
; one column per second on my machine. Due to impatience, I used my emulator to
; test this (although I also ran it on the CPU proper once I knew it worked).

; x8 = array to read from
; x9 = array to write to

start:	ld @a1,x8
	ld @a2,x9
frame:	ld 31,x1              ; x1 = index of column (0 to 31)
col:	ld 3,x5               ; x5 = bit within nybble (used for rotates)
	xor x0,x0,x6          ; x6 = final accumulator
bit:	add x1,x8,x2          ; x2 = current column address in RAM
	ld x2,x3              ; x3 = current column data
	rot x3,x5,x3
	xor x0,x0,x4          ; x4 = neighbour count accumulator
	; Neighbour count:
	; CENTRE COLUMN
	; add N
	rot x3,!1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; add S
	rot x3,!-1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; COLUMN TO THE LEFT (WEST)
	sub x2,!1,x3
	ld x3,x3
	rot x3,x5,x3
	; add NW
	rot x3,!1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; add W
	and x3,!0x11111111,xD
	add x4,xD,x4
	; add SW
	rot x3,!-1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; COLUMN TO THE RIGHT (EAST)
	add x2,!1,x3
	ld x3,x3
	rot x3,x5,x3
	; add NE
	rot x3,!1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; add E
	and x3,!0x11111111,xD
	add x4,xD,x4
	; add SE
	rot x3,!-1,xD
	and xD,!0x11111111,xD
	add x4,xD,x4
	; Now we're done with the neighbour count.
	; Apply transition rule of B3/S23:
	ld x2,x3
	rot x3,x5,x3
	and x3,!0x11111111,x3
	or x3,x4,x4
	xor x4,!0x33333333,x4
	; Now we just need to check if each nybble is non-zero.
	and x4,!0xcccccccc,x3
	shf x3,!-2,x3
	or x3,x4,x4
	and x4,!0x22222222,x3
	shf x3,!-1,x3
	or x3,x4,x4
	and x4,!0x11111111,x4
	xor x4,!0x11111111,x4 ; Done. Now OR it into the final accumulator:
	sub x0,x5,x3
	rot x4,x3,x4
	or x4,x6,x6
	; Handle looping for bit:
	sub x5,!1,x5
	jf bit
	; Handle looping for col:
	add x1,x9,x2
	st x6,x2
	ld 0xe,xE
	out x6,xE
	out x1,xE
	sub x1,!1,x1
	jf col
	; Handle looping for frame:
	xor x8,x0,xE
	xor x9,x0,x8
	xor xE,x0,x9
	jmp frame

	; We use 2 alternating arrays; read from one and write to the other.
	; To simplify code, both arrays have 1 empty col. (word) on either side.
	align 2
	dw 0
a1:	dw 0
	dw 0
	dw 0x00000010
	dw 0x00000014
	dw 0x00000018
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
	dw 10
	dw 9
	dw 8
	dw 7
	dw 6
	dw 5
	dw 0
	dw 0
	dw 0
	dw 0x3000000
	dw 0x6000000
	dw 0x2000000
	dw 0
	dw 0
	dw 0
	dw 0
	dw 0
a2:	rep 0 33
`;

export const b3s23MachineCode = new Uint32Array([
  0x00d0e018,
  0xe0190000,
  0x000000f1,
  0x001fe011,
  0xe0150000,
  0x00000003,
  0x0182d006,
  0x8353e123,
  0xe01ed004,
  0x00000001,
  0xe01e83ed,
  0x11111111,
  0x04d4cded,
  0xffffe01e,
  0x83edffff,
  0x1111e01e,
  0xcded1111,
  0xe01e04d4,
  0x00000001,
  0xe1331e23,
  0xe01e8353,
  0x00000001,
  0xe01e83ed,
  0x11111111,
  0x04d4cded,
  0x1111e01e,
  0xc3ed1111,
  0xe01e04d4,
  0xffffffff,
  0xe01e83ed,
  0x11111111,
  0x04d4cded,
  0x0001e01e,
  0x02e30000,
  0x8353e133,
  0x0001e01e,
  0x83ed0000,
  0x1111e01e,
  0xcded1111,
  0xe01e04d4,
  0x11111111,
  0x04d4c3ed,
  0xffffe01e,
  0x83edffff,
  0x1111e01e,
  0xcded1111,
  0xe12304d4,
  0xe01e8353,
  0x11111111,
  0xb344c3e3,
  0x3333e01e,
  0xd4e43333,
  0xcccce01e,
  0xc4e3cccc,
  0xfffee01e,
  0x73e3ffff,
  0xe01eb344,
  0x22222222,
  0xe01ec4e3,
  0xffffffff,
  0xb34473e3,
  0x1111e01e,
  0xc4e41111,
  0x1111e01e,
  0xd4e41111,
  0x84341503,
  0xe01eb466,
  0x00000001,
  0xe0021e55,
  0x0192010d,
  0xe01ea260,
  0x0000000e,
  0xa1e1a6e1,
  0x0001e01e,
  0x1e110000,
  0x0109e002,
  0xd908d80e,
  0xe000de09,
  0x00000106,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000010,
  0x00000014,
  0x00000018,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x0000000a,
  0x00000009,
  0x00000008,
  0x00000007,
  0x00000006,
  0x00000005,
  0x00000000,
  0x00000000,
  0x00000000,
  0x03000000,
  0x06000000,
  0x02000000,
]);

export const textAsm = `; Text rendering code.
; This file has a bunch of functions for handling text and a bitmapped display.
; They are each described by comments above their definition. Return addresses
; are in xC. The functions here follow the convention that they must leave the
; low registers (x1-x7) intact, but they are allowed to clobber the high
; registers (x8-xF). 3 example programs using this library are provided. Comment
; out the square numbers one and un-comment one of the other 2 to see them in
; action.

; It's relatively simple to write your own program to print out an integer
; sequence. Note, however, that the "str" command in the assembler currently
; only reliably supports upper-case letters, but not spaces or other symbols.

; MAIN PROGRAM -----------------------------------------------------------------

start:



	; HELLO WORLD (slow, be patient)
;	ld @str,x4
;	ld 13,x5
;	ld putc,x6
;	ld s1,xC
;	jmp strd
;s1:	ld end,xC
;	jmp flush



	; PRINT 2**32 - 1
;	ld -1,x1
;	ld s1,xC
;	jmp prud
;s1:	ld end,xC
;	jmp flush



	; PRINT SQUARE NUMBERS
	ld 2,x2
	ld 1,x4
	xor x4,x0,x5
	ld 63,x3 ; '\\n'
slp:	xor x5,x0,x1
	ld s1,xC
	jmp prud
s1:	add x2,x4,x4
	add x4,x5,x5
	xor x3,x0,x1
	ld s2,xC
	jmp putc
s2:	ld slp,xC
	jmp flush



end:	hlt

	align 2
str:	str HELLO, WORLD!

; RENDERING --------------------------------------------------------------------

	align 2
bmap:	rep 0 32

; Write contents of buffer (bmap) to display. No arguments.
flush:	ld 32,x9
	ld 1,x8
	ld @bmap,xD
	ld 0xe,xE
fl1:	sub x9,x8,x9
	add x9,xD,xA
	ld xA,xA
	out xA,xE
	out x9,xE
	xor x9,x0,x0
	jf fl1
	jmp xC

; Mask and set col.
; Sets col x1 to (previous value & x2) | x3.
; Does not update display.
mcol:	add x1,!@bmap,x8
	ld x8,x9
	and x2,x9,x9
	or x3,x9,x9
	st x9,x8
	jmp xC

; Draw character x1 at column x2, row x3. (0,0) is top left.
; UNCLOBBERED: xB, xD, xF
	align 2
glyph:	shf x1,!-1,x8
	add x8,!@glyphset,x8
	ld x8,x8
	and x1,!1,x9
	shf x9,!4,x9
	sub x0,x9,x9 ; negate x9
	; depending on LSB of x1, x9 is now either 0 or -16
	shf x8,x9,x8
	and x8,!0x7fff,x8
	; x8 now contains the character; cols are bits [0-4], [5-9] and [10-14]
	; where bit 0 is LSB
	shf x8,!-10,x9
	add x2,!@bmap,xA
	shf x9,x3,x9
	ld xA,xE
	or x9,xE,x9
	st x9,xA ; write first column
	add xA,!1,xA
	shf x8,!-5,x9
	and x9,!0x1f,x9
	shf x9,x3,x9
	ld xA,xE
	or x9,xE,x9
	st x9,xA
	add xA,!1,xA
	and x8,!0x1f,x9
	shf x9,x3,x9
	ld xA,xE
	or x9,xE,x9
	st x9,xA
	jmp xC

; string do
; Take string x4, length x5, and call function x6 which takes char arg in x1
; for now, x6 can clobber x2 and x3, in addition to high registers

; TODO: assembly equiv. of duff's device? loop is unrolled 5 times.
	align 2
strdR:	rep 0 1 ; strd() return address
strd:	st xC,!@strdR
	sub x5,!1,x5 ; test to see if we're done
	jnf sdend
strdw:	ld x4,x7
	; x7 has 5 chars; get them
	; first char of word
	and x7,!0x3f,x1
	ld sd1,xC
	jmp x6 ; TODO: DECLOBBIFY
sd1:	sub x5,!1,x5
	jnf sdend
	; then more or less repeat the above:
	shf x7,!-6,x7
	and x7,!0x3f,x1
	ld sd2,xC
	jmp x6
sd2:	sub x5,!1,x5
	jnf sdend
	shf x7,!-6,x7
	and x7,!0x3f,x1
	ld sd3,xC
	jmp x6
sd3:	sub x5,!1,x5
	jnf sdend
	shf x7,!-6,x7
	and x7,!0x3f,x1
	ld sd4,xC
	jmp x6
sd4:	sub x5,!1,x5
	jnf sdend
	shf x7,!-6,x7
	and x7,!0x3f,x1
	ld sd5,xC
	jmp x6
sd5:	sub x5,!1,x5
	jnf sdend
	; full word of 5 chars printed; do next char
	add x4,xE,x4 ; xE is still 1 from last sub instruction's pseudo-imm
	jmp strdw
sdend:	ld @strdR,xC
	ld xC,xC
	jmp xC

; USER-FACING CONSOLE FUNCTIONS ------------------------------------------------

	align 2
cursX:	rep 0 1
cursY:	rep 0 1

; print character x1
putc:	xor x2,x0,xD ; save x2 and x3 in xD and xF (un-clobbered by glyph())
	xor x3,x0,xF
	xor xC,x0,xB ; xB is also un-clobbered
	ld @cursX,x2
	ld x2,x2
	ld @cursY,x3
	ld x3,x3
	xor x1,!63,x0 ; x1 != NL
	jnf wrap      ; handle newline without printing it
	ld pc1,xC
	jmp glyph
pc1:	add x2,!4,x2 ; move on to next text column
	; but now we must check for overflow
	sub !29,x2,x0
	jf nowr
	; text wrapping
wrap:	xor x0,x0,x2
	add x3,!6,x3
	sub !26,x3,x0
	jf done
	; we reached the bottom; move entire bmap up by 6 pixels
	ld 32,x8
	ld 1,x9
	ld @bmap,xA
	ld -6,xC
pc2:	sub x8,x9,x8
	add xA,x8,xE ; x2 = addr of column
	ld xE,x3
	shf x3,xC,x3
	st x3,xE
	xor x8,x0,x0
	jf pc2
	ld 25,x3
nowr:	; no wrapping
done:	st x2,!@cursX
	st x3,!@cursY
	; restore x2 and x3
	xor xD,x0,x2
	xor xF,x0,xF ; re-invert to restore original value
	xor xF,x0,x3
	jmp xB

;011111
; 10101
; 01010 (first 2 letters as demonstration of glyph format)
;011111
; 00101
; 11111 = 0x7eaa7cbf
	align 2
glyphset:
	rep 0x7cbf0000 1 ; A,NUL
	rep 0x3a317eaa 1 ; CB
	rep 0x7eb57e2e 1 ; ED
	rep 0x3a2d7ca1 1 ; GF
	rep 0x47f17c9f 1 ; IH
	rep 0x7c9b220f 1 ; KJ
	rep 0x7c3e7e10 1 ; ML
	rep 0x3a2e7c5f 1 ; ON
	rep 0x3a3e7ca2 1 ; QP
	rep 0x4aa97cba 1 ; SR
	rep 0x3e0f07e1 1 ; UT
	rep 0x7d1f1f07 1 ; WV
	rep 0x0f836c9b 1 ; YX
	rep 0x410066b3 1 ; ,Z
	rep 0x41200200 1 ; ;.
	rep 0x08210220 1 ; ~:
	rep 0x4bf03a2e 1 ; 10
	rep 0x46aa66b2 1 ; 32
	rep 0x5ea91c9f 1 ; 54
	rep 0x07a33aad 1 ; 76
	rep 0x5aae2aaa 1 ; 98
	rep 0x45c001d1 1 ; )(
	rep 0x47e003f1 1 ; ][
	rep 0x02e006a2 1 ; !?
	rep 0x45441151 1 ; ><
	rep 0x08882082 1 ; \/
	rep 0x144511c4 1 ; *+
	rep 0x08222492 1 ; ^%
	rep 0x7ab00060 1 ; £'
	rep 0x10844210 1 ; -_
	rep 0x000003e0 1 ; SPC,|
	rep 0x00000000 1 ; NL,TAB

; PRINTING

; print unsigned decimal
; print x1 as an unsigned 32-bit integer in decimal
; max value 4,294,967,296 == 10 digits
	align 2
pdx1:	rep 0 1
pdx2:	rep 0 1
pdx3:	rep 0 1
pdx4:	rep 0 1
pdR:	rep 0 1

prud:	st x1,!@pdx1 ; save x1-x4, xC
	st x2,!@pdx2
	st x3,!@pdx3
	st x4,!@pdx4
	st xC,!@pdR
	ld 1000000000,x2 ; 1 billion
	ld 10,x3
	; ... also, make putc save x1-x3 (x2-x3?) ...
	xor x1,x0,x4
pdtrim:	sub x4,x2,x0 ; trim leading 0s
	jf pd1
	; divide x2 by 10, but enter main printing loop if x2 == 1
	; this means the number 0 is printed correctly; we avoid an infintie
	; loop, and also ensure that at least 1 digit (0) is printed
	div x2,x3,x2
	sub x2,x3,x0
	jf pdtrim
pd1:	div x4,x2,x1
	mod x4,x2,x4
	add x1,!32,x1 ; x1 += '0'
	ld pd2,xC
	jmp putc
pd2:	div x2,x3,x2 ; division sets flag if result is non-zero
	;xor x2,x0,x0
	jf pd1
pd3:	; done; restore x1-x4, xC
	ld @pdx1,x1 ; so fucking clusterfucked. needs to happen, though
	ld x1,x1    ; only good way to do this is with a macro
	ld @pdx2,x2
	ld x2,x2
	ld @pdx3,x3
	ld x3,x3
	ld @pdx4,x4
	ld x4,x4
	ld @pdR,xC
	ld xC,xC
	jmp xC
`;

/**
 * TODO: space character is wrong.
 */
export const textMachineCode = new Uint32Array([
  0x0002e012,
  0xe0140000,
  0x00000001,
  0xe013d405,
  0x0000003f,
  0xe01cd501,
  0x00000110,
  0x02cae000,
  0x04550244,
  0xe01cd301,
  0x00000118,
  0x0232e000,
  0x010ae01c,
  0xe0000000,
  0xeeee0164,
  0x0f30c148,
  0x123d7f5b,
  0x0002f10c,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x0020e019,
  0xe0180000,
  0x00000001,
  0x0092e01d,
  0xe01e0000,
  0x0000000e,
  0x09da1899,
  0xaae1e1aa,
  0xd900a9e1,
  0x0170e002,
  0xe01ee2c0,
  0x00000092,
  0xe18901e8,
  0xb399c299,
  0xe2c0a890,
  0xffffe01e,
  0x71e8ffff,
  0x0140e01e,
  0x08e80000,
  0xe01ee188,
  0x00000001,
  0xe01ec1e9,
  0x00000004,
  0x190979e9,
  0xe01e7898,
  0x00007fff,
  0xe01ec8e8,
  0xfffffff6,
  0xe01e78e9,
  0x00000092,
  0x793902ea,
  0xb9e9e1ae,
  0xe01eaa90,
  0x00000001,
  0xe01e0aea,
  0xfffffffb,
  0xe01e78e9,
  0x0000001f,
  0x7939c9e9,
  0xb9e9e1ae,
  0xe01eaa90,
  0x00000001,
  0xe01e0aea,
  0x0000001f,
  0x7939c8e9,
  0xb9e9e1ae,
  0xe2c0aa90,
  0x00000000,
  0x00e1e01e,
  0xaec00000,
  0x0001e01e,
  0x1e550000,
  0x0228e001,
  0xe01ee147,
  0x0000003f,
  0xe01cc7e1,
  0x000001d7,
  0xe01ee260,
  0x00000001,
  0xe0011e55,
  0xe01e0228,
  0xfffffffa,
  0xe01e77e7,
  0x0000003f,
  0xe01cc7e1,
  0x000001e9,
  0xe01ee260,
  0x00000001,
  0xe0011e55,
  0xe01e0228,
  0xfffffffa,
  0xe01e77e7,
  0x0000003f,
  0xe01cc7e1,
  0x000001fb,
  0xe01ee260,
  0x00000001,
  0xe0011e55,
  0xe01e0228,
  0xfffffffa,
  0xe01e77e7,
  0x0000003f,
  0xe01cc7e1,
  0x0000020d,
  0xe01ee260,
  0x00000001,
  0xe0011e55,
  0xe01e0228,
  0xfffffffa,
  0xe01e77e7,
  0x0000003f,
  0xe01cc7e1,
  0x0000021f,
  0xe01ee260,
  0x00000001,
  0xe0011e55,
  0x04e40228,
  0x01cee000,
  0x00e1e01c,
  0xe1cc0000,
  0x0000e2c0,
  0x00000000,
  0x00000000,
  0xd30fd20d,
  0xe012dc0b,
  0x00000117,
  0xe013e122,
  0x00000118,
  0xe01ee133,
  0x0000003f,
  0xe001d1e0,
  0xe01c0252,
  0x00000248,
  0x0182e000,
  0x0004e01e,
  0x02e20000,
  0x001de01e,
  0x12e00000,
  0x0274e002,
  0xe01ed002,
  0x00000006,
  0xe01e03e3,
  0x0000001a,
  0xe00213e0,
  0xe0180274,
  0x00000020,
  0x0001e019,
  0xe01a0000,
  0x00000092,
  0xfffae01c,
  0x1988ffff,
  0xe1e30a8e,
  0xae3073c3,
  0xe002d800,
  0xe0130269,
  0x00000019,
  0x0117e01e,
  0xae200000,
  0x0118e01e,
  0xae300000,
  0xdf0fdd02,
  0xe2b0df03,
  0x7cbf0000,
  0x3a317eaa,
  0x7eb57e2e,
  0x3a2d7ca1,
  0x47f17c9f,
  0x7c9b220f,
  0x7c3e7e10,
  0x3a2e7c5f,
  0x3a3e7ca2,
  0x4aa97cba,
  0x3e0f07e1,
  0x7d1f1f07,
  0x0f836c9b,
  0x410066b3,
  0x41200200,
  0x08210220,
  0x4bf03a2e,
  0x46aa66b2,
  0x5ea91c9f,
  0x07a33aad,
  0x5aae2aaa,
  0x45c001d1,
  0x47e003f1,
  0x02e006a2,
  0x45441151,
  0x08882082,
  0x144511c4,
  0x08222492,
  0x7ab00060,
  0x10844210,
  0x000003e0,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x0160e01e,
  0xae100000,
  0x0161e01e,
  0xae200000,
  0x0162e01e,
  0xae300000,
  0x0163e01e,
  0xae400000,
  0x0164e01e,
  0xaec00000,
  0xca00e012,
  0xe0133b9a,
  0x0000000a,
  0x1240d104,
  0x02ece002,
  0x13203232,
  0x02e5e002,
  0x44243421,
  0x0020e01e,
  0x01e10000,
  0x02f7e01c,
  0xe0000000,
  0x32320232,
  0x02ece002,
  0x0160e011,
  0xe1110000,
  0x0161e012,
  0xe1220000,
  0x0162e013,
  0xe1330000,
  0x0163e014,
  0xe1440000,
  0x0164e01c,
  0xe1cc0000,
  0x0000e2c0,
]);

export const sortMachineCode = new Uint32Array([
  0x01a0e011,
  0xe01c0000,
  0x00000128,
  0x01e0e01b,
  0xe01e0000,
  0x0000001f,
  0xe01401e2,
  0x0000000e,
  0xa341e123,
  0xe01ea241,
  0x00000001,
  0x11201e22,
  0x0110e002,
  0x001fe01e,
  0x01e20000,
  0x0127e01e,
  0xabe00000,
  0x0001e01e,
  0x0beb0000,
  0xeeeee2c0,
  0xe01e1123,
  0x00000001,
  0xe0011e30,
  0xe1130183,
  0x0001e01e,
  0x1e140000,
  0x0001e01e,
  0x02e50000,
  0x0001e01e,
  0x04e40000,
  0x1830e148,
  0x0138e001,
  0x0001e01e,
  0x1e550000,
  0x1390e159,
  0x0140e001,
  0xe0021540,
  0xa5800156,
  0xe01ea490,
  0x0000000e,
  0xa5e1a8e1,
  0xa4e1a9e1,
  0x0138e000,
  0x0001e01e,
  0x05ee0000,
  0xe01eabe0,
  0x00000001,
  0xab200beb,
  0x0001e01e,
  0x0beb0000,
  0xe01ed502,
  0x0000016f,
  0xe01eabe0,
  0x00000001,
  0xe0000beb,
  0xe01e0128,
  0x00000001,
  0xe1b21ebb,
  0x0001e01e,
  0x1ebb0000,
  0xe01ee1b1,
  0x00000183,
  0xe01eabe0,
  0x00000001,
  0xe0000beb,
  0xe01e0128,
  0x00000001,
  0xe1bc1ebb,
  0x1123e2c0,
  0x0001e01e,
  0x1e300000,
  0x0183e001,
  0xe01eab10,
  0x00000001,
  0xab200beb,
  0x0001e01e,
  0x0beb0000,
  0x01aae01e,
  0xabe00000,
  0x0001e01e,
  0x0beb0000,
  0xe01e1122,
  0xffffffff,
  0x012272e2,
  0x0189e000,
  0x0001e01e,
  0x1ebb0000,
  0xe01ee1b2,
  0x00000001,
  0xe1b11ebb,
  0x0002e01e,
  0x0beb0000,
  0x01cce01e,
  0xabe00000,
  0x0001e01e,
  0x0beb0000,
  0xe01e1123,
  0xffffffff,
  0x031173e3,
  0x0001e01e,
  0x01e10000,
  0x0189e000,
  0x0001e01e,
  0x1ebb0000,
  0xe01ee1b4,
  0x00000001,
  0xe1b11ebb,
  0xe01e1142,
  0xffffffff,
  0x012272e2,
  0x0001e01e,
  0x02e30000,
  0x001fe01e,
  0xc1e50000,
  0x01c0e01e,
  0x05e50000,
  0x01efe01c,
  0xd1060000,
  0xe000d407,
  0xe01e0206,
  0x0000001f,
  0xe01ec6e5,
  0x000001c0,
  0xe152b5e5,
  0xe01ea620,
  0x00000001,
  0xe01e06e6,
  0x00000001,
  0x167005e5,
  0x01f7e002,
  0x0183e000,
  0xe0011120,
  0x13400237,
  0x0239e001,
  0xe139e118,
  0xe0021890,
  0xa5800224,
  0x000ee01e,
  0xa8e10000,
  0x000ee01e,
  0xa5e10000,
  0x0001e01e,
  0x01e10000,
  0x0001e01e,
  0x05e50000,
  0x0206e000,
  0xe01ea590,
  0x0000000e,
  0xe01ea9e1,
  0x0000000e,
  0xe01ea5e1,
  0x00000001,
  0xe01e03e3,
  0x00000001,
  0xe00005e5,
  0xd3010206,
  0xe118d402,
  0xe01ea580,
  0x0000000e,
  0xe01ea8e1,
  0x0000000e,
  0xe01ea5e1,
  0x00000001,
  0xe01e01e1,
  0x00000001,
  0x112005e5,
  0x0239e002,
  0x0000e2c0,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000000,
  0x00000001,
  0x00000003,
  0x00000007,
  0x0000000f,
  0x0000001f,
  0x0000003f,
  0x0000007f,
  0x000000ff,
  0x000001ff,
  0x000003ff,
  0x000007ff,
  0x00000fff,
  0x00001fff,
  0x00003fff,
  0x00007fff,
  0x0000ffff,
  0x0001ffff,
  0x0003ffff,
  0x0007ffff,
  0x000fffff,
  0x001fffff,
  0x003fffff,
  0x007fffff,
  0x00ffffff,
  0x01ffffff,
  0x03ffffff,
  0x07ffffff,
  0x0fffffff,
  0x1fffffff,
  0x3fffffff,
  0x7fffffff,
  0xffffffff,
  0x00000fff,
  0x00007fff,
  0x0fffffff,
  0x003fffff,
  0x00001fff,
  0x0000ffff,
  0x07ffffff,
  0x00003fff,
  0x0000000f,
  0x000fffff,
  0xffffffff,
  0x01ffffff,
  0x0003ffff,
  0x3fffffff,
  0x001fffff,
  0x000001ff,
  0x000007ff,
  0x0007ffff,
  0x7fffffff,
  0x03ffffff,
  0x007fffff,
  0x0000007f,
  0x00000001,
  0x1fffffff,
  0x0000003f,
  0x000000ff,
  0x0000001f,
  0x00000007,
  0x000003ff,
  0x00ffffff,
  0x00000003,
  0x0001ffff,
  0xffffffff,
  0x7fffffff,
  0x3fffffff,
  0x1fffffff,
  0x0fffffff,
  0x07ffffff,
  0x03ffffff,
  0x01ffffff,
  0x00ffffff,
  0x007fffff,
  0x003fffff,
  0x001fffff,
  0x000fffff,
  0x0007ffff,
  0x0003ffff,
  0x0001ffff,
  0x0000ffff,
  0x00007fff,
  0x00003fff,
  0x00001fff,
  0x00000fff,
  0x000007ff,
  0x000003ff,
  0x000001ff,
  0x000000ff,
  0x0000007f,
  0x0000003f,
  0x0000001f,
  0x0000000f,
  0x00000007,
  0x00000003,
  0x00000001,
  0x00000fff,
  0x000007ff,
  0x0007ffff,
  0x0003ffff,
  0x03ffffff,
  0x001fffff,
  0x0000001f,
  0x00007fff,
  0x00003fff,
  0x0000003f,
  0x00000fff,
  0x7fffffff,
  0x03ffffff,
  0x007fffff,
  0x00000001,
  0x00000007,
  0x000003ff,
  0x00ffffff,
  0x00000001,
  0x1fffffff,
  0x00001fff,
  0x000000ff,
  0x000fffff,
  0x0fffffff,
  0x003fffff,
  0x001fffff,
  0x0000ffff,
  0x07ffffff,
  0x000001ff,
  0x00ffffff,
  0x00000003,
  0x0001ffff,
]);

export const sqrtMachineCode = new Uint32Array([
  0x0064e011,
  0xe01c0000,
  0x00000108,
  0x0111e000,
  0x000ee01e,
  0xa8e10000,
  0x000ee01e,
  0xa0e10000,
  0xe01aeeee,
  0x00008000,
  0xffffe019,
  0xd008ffff,
  0x288bba88,
  0xe2c1db10,
  0xe00111b0,
  0xda880120,
  0xda007a9a,
  0x0118e002,
  0x0000e2c0,
]);
