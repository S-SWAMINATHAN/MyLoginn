import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";
import { booleanEval, numberSystems } from "./technical/generated";

const codes: RawQ[] = [
  m("BCD represents each decimal digit with:", ["4 bits", "8 bits", "2 bits", "3 bits"], "Binary Coded Decimal encodes 0–9 in 4 bits each."),
  m2("What is the BCD code of the decimal number 59?", ["0101 1001", "0011 1011", "0101 1010", "0111 0011"], "5 = 0101 and 9 = 1001."),
  m("In Gray code, successive values differ in:", ["Exactly one bit", "Two bits", "All bits", "No bits"], "This avoids errors in encoders and counters."),
  m2("What is the Gray code of binary 1011?", ["1110", "1101", "1011", "0110"], "Gray = B XOR (B >> 1): 1011 XOR 0101 = 1110.", { check: "py:print(format(0b1011 ^ (0b1011 >> 1), '04b'))" }),
  m("Excess-3 code of a decimal digit is:", ["Its BCD value plus 3", "Its BCD value minus 3", "Three times its value", "Its Gray code"], "Excess-3 is self-complementing."),
  m("ASCII originally used how many bits per character?", ["7", "8", "16", "4"], "Extended ASCII uses 8 bits; Unicode needs more."),
  m("A parity bit is used for:", ["Error detection", "Error correction of all errors", "Compression", "Encryption"], "Even or odd parity detects single-bit errors."),
];

const gates: RawQ[] = [
  m("Which gate outputs 1 only when all inputs are 1?", ["AND", "OR", "NAND", "XOR"], "AND is true only if every input is true."),
  m("Which gates are called universal gates?", ["NAND and NOR", "AND and OR", "XOR and XNOR", "NOT and AND"], "Any logic function can be built from NAND gates alone, or NOR gates alone."),
  m("The output of an XOR gate is 1 when:", ["The inputs are different", "Both inputs are 1", "Both inputs are 0", "Any input is 1"], "XOR is 1 for an odd number of 1-inputs."),
  m("A NOT gate is also called an:", ["Inverter", "Buffer", "Adder", "Encoder"], "It outputs the complement of its input."),
  m("Which gate's output is 0 only when all inputs are 1?", ["NAND", "NOR", "AND", "XNOR"], "NAND = NOT(AND)."),
  m("XNOR outputs 1 when:", ["The inputs are equal", "The inputs differ", "Only one input is 1", "Never"], "XNOR is an equality detector."),
  m2("How many NAND gates are needed to make a NOT gate?", ["1", "2", "3", "4"], "Tie both NAND inputs together: NOT A = (A·A)̅."),
  m2("How many 2-input NAND gates are needed to build an AND gate?", ["2", "1", "3", "4"], "A NAND followed by a NAND used as an inverter."),
];

const boolean: RawQ[] = [
  m("According to De Morgan's theorem, (A + B)̅ equals:", ["A̅ · B̅", "A̅ + B̅", "A · B", "A + B"], "The complement of a sum is the product of the complements."),
  m("A + A·B simplifies to:", ["A", "B", "A·B", "A + B"], "Absorption law: A + AB = A(1 + B) = A."),
  m("A + A̅ equals:", ["1", "0", "A", "A̅"], "Complement law."),
  m("A · A̅ equals:", ["0", "1", "A", "A̅"], "A variable ANDed with its complement is 0."),
  m2("A + A̅·B simplifies to:", ["A + B", "A·B", "A", "B"], "A + A̅B = (A + A̅)(A + B) = A + B."),
  m2("How many cells does a 4-variable Karnaugh map have?", ["16", "8", "4", "32"], "2⁴ = 16 cells.", { check: "2**4" }),
  m("In a K-map, groups must contain a number of cells that is:", ["A power of two (1, 2, 4, 8 …)", "Any even number", "Exactly 4", "Any odd number"], "Larger groups give simpler terms."),
  m3("Simplify: A·B + A·B̅", ["A", "B", "A + B", "A·B"], "A·B + A·B̅ = A(B + B̅) = A."),
];

const combinational: RawQ[] = [
  m("A half adder produces:", ["Sum and carry from two bits", "Sum and carry from three bits", "Only a sum", "Only a carry"], "Sum = A ⊕ B, Carry = A·B."),
  m("A full adder adds:", ["Three bits (two inputs and a carry-in)", "Two bits only", "Four bits", "Two bytes"], "Sum = A ⊕ B ⊕ Cin."),
  m("A multiplexer with 8 data inputs needs how many select lines?", ["3", "8", "2", "4"], "2³ = 8, so three select lines choose one input."),
  m("A decoder with n inputs has up to how many outputs?", ["2ⁿ", "n", "n²", "2n"], "e.g. a 3-to-8 decoder."),
  m("Which circuit converts 2ⁿ input lines into an n-bit code?", ["Encoder", "Decoder", "Multiplexer", "Flip-flop"], "A priority encoder handles several active inputs."),
  m("A demultiplexer:", ["Sends one input to one of many outputs", "Selects one of many inputs", "Stores a bit", "Counts pulses"], "It is the reverse of a multiplexer."),
  m("Combinational circuits differ from sequential circuits because their outputs depend on:", ["Only the present inputs", "Present inputs and past states", "Only the clock", "Only previous outputs"], "Sequential circuits have memory."),
];

const flipflops: RawQ[] = [
  m("A flip-flop stores:", ["One bit", "One byte", "Four bits", "Nothing"], "It is the basic memory element of sequential circuits."),
  m("In an SR flip-flop, the input condition S = 1, R = 1 is:", ["Invalid (forbidden)", "Reset", "Set", "No change"], "Both outputs would try to be equal, which is not allowed."),
  m("A JK flip-flop with J = 1 and K = 1 will:", ["Toggle its output", "Set", "Reset", "Hold"], "J = K = 1 removes the SR forbidden state by toggling."),
  m("A D flip-flop's output on the clock edge equals:", ["The D input", "The complement of D", "Always 0", "Always 1"], "D = data (or delay) flip-flop."),
  m("A T flip-flop with T = 1 will:", ["Toggle on each clock edge", "Always hold", "Reset", "Set"], "T = toggle."),
  m("Which flip-flop is commonly used as a frequency divider by 2?", ["T flip-flop (or JK with J = K = 1)", "SR flip-flop", "Latch with enable 0", "D flip-flop with D = 0"], "Toggling each clock halves the frequency."),
  m("A latch differs from a flip-flop because a latch is:", ["Level-triggered", "Edge-triggered", "Not a memory element", "Always faster"], "Flip-flops change only on a clock edge."),
];

const counters: RawQ[] = [
  m2("How many flip-flops are needed for a mod-10 (decade) counter?", ["4", "10", "3", "5"], "2³ = 8 < 10 ≤ 2⁴ = 16, so 4 flip-flops.", { check: "4" }),
  m("In an asynchronous (ripple) counter:", ["Each flip-flop is clocked by the previous flip-flop's output", "All flip-flops share one clock", "No flip-flops are used", "Outputs never change"], "Ripple delays accumulate, limiting speed."),
  m("A synchronous counter:", ["Clocks all flip-flops simultaneously", "Uses no clock", "Is slower than a ripple counter", "Has only one flip-flop"], "It avoids cumulative ripple delay."),
  m2("A 4-bit binary counter counts from 0 to:", ["15", "16", "8", "4"], "2⁴ − 1 = 15.", { check: "2**4-1" }),
  m("A ring counter with n flip-flops has how many states?", ["n", "2ⁿ", "2n", "n²"], "A single 1 circulates through the n flip-flops."),
  m("A Johnson (twisted-ring) counter with n flip-flops has how many states?", ["2n", "n", "2ⁿ", "n + 1"], "Feeding back the inverted output doubles the states."),
];

const registers: RawQ[] = [
  m("A shift register is made of:", ["Flip-flops connected in a chain", "Logic gates only", "Capacitors", "Multiplexers only"], "Data shifts one position per clock pulse."),
  m("SIPO stands for:", ["Serial In, Parallel Out", "Single Input, Parallel Output", "Serial Input Processor Output", "Sequential In, Parallel Out"], "Other types: SISO, PISO, PIPO."),
  m2("How many clock pulses are needed to load 8 bits serially into an 8-bit shift register?", ["8", "1", "4", "16"], "One bit enters per clock pulse.", { check: "8" }),
  m("Shifting a binary number one place left (filling with 0) is equivalent to:", ["Multiplying by 2", "Dividing by 2", "Adding 1", "Inverting it"], "Shifting right divides by 2."),
  m("A universal shift register can:", ["Shift left, shift right and load in parallel", "Only shift right", "Only store one bit", "Only count"], "Mode-control inputs select the operation."),
];

const memories: RawQ[] = [
  m("Which memory must be refreshed periodically?", ["DRAM", "SRAM", "ROM", "Flash"], "DRAM stores bits as charge on capacitors that leak."),
  m("SRAM stores each bit using:", ["Flip-flops (latches)", "Capacitors", "Magnetic domains", "Fuses"], "SRAM is faster and needs no refresh, but is less dense."),
  m("EEPROM can be erased:", ["Electrically, byte by byte", "Only with UV light", "Never", "Only by replacing the chip"], "EPROM is erased with UV light."),
  m2("A memory has 12 address lines and 8 data lines. What is its capacity?", ["4 KB", "12 KB", "8 KB", "96 bytes"], "2¹² = 4096 locations × 1 byte = 4 KB.", { check: "2**12/1024" }),
  m("Cache memory is usually made of:", ["SRAM", "DRAM", "ROM", "Flash"], "SRAM's speed suits caches."),
];

const converters: RawQ[] = [
  m("An ADC converts:", ["Analog signals into digital values", "Digital values into analog signals", "AC into DC", "Binary into decimal"], "A DAC does the reverse."),
  m2("What is the resolution of an 8-bit ADC with a 5 V full-scale range (approximately)?", ["19.53 mV", "5 mV", "0.625 V", "39 mV"], "5 V / 2⁸ = 5 / 256 ≈ 0.01953 V = 19.53 mV.", { check: "5/256*1000" }),
  m("Which ADC type is the fastest?", ["Flash (parallel) ADC", "Successive approximation ADC", "Dual-slope ADC", "Counter-type ADC"], "Flash ADCs use 2ⁿ − 1 comparators."),
  m("A successive-approximation ADC with n bits needs how many clock cycles per conversion?", ["n", "2ⁿ", "1", "n²"], "It determines one bit per cycle."),
  m("Which DAC uses only two resistor values?", ["R-2R ladder", "Weighted resistor", "Flash", "Sigma-delta"], "The R-2R ladder is easy to manufacture accurately."),
];

const families: RawQ[] = [
  m("Which logic family has the lowest power consumption?", ["CMOS", "TTL", "ECL", "RTL"], "CMOS draws very little static current."),
  m("Which logic family is the fastest?", ["ECL", "CMOS", "TTL", "RTL"], "Emitter-coupled logic avoids transistor saturation."),
  m("Fan-out of a logic gate is:", ["The number of gate inputs it can drive", "Its power consumption", "Its delay", "The number of its inputs"], "Fan-in is the number of inputs a gate has."),
  m("Propagation delay is:", ["The time between an input change and the resulting output change", "The power supply voltage", "The noise margin", "The number of gates"], "Lower delay means faster circuits."),
  m("TTL stands for:", ["Transistor–Transistor Logic", "Twin Transistor Logic", "Timed Transistor Link", "Transistor Timing Logic"], "TTL uses bipolar junction transistors."),
];

const subject: RawSubject = {
  "number-systems-and-codes": topic([...numberSystems.slice(0, 14), ...codes], { intro: "Digital systems use binary numbers and codes such as BCD, Gray, Excess-3 and ASCII. Parity bits help detect errors." }),
  "logic-gates": topic(gates, { intro: "Basic gates: AND, OR, NOT; derived gates: NAND, NOR (universal), XOR and XNOR." }),
  "boolean-algebra": topic([...booleanEval, ...boolean], { intro: "Boolean algebra simplifies logic expressions.", formulas: [{ h: "Laws", points: ["A + 0 = A, A·1 = A, A + 1 = 1, A·0 = 0", "A + A = A, A·A = A, A + A̅ = 1, A·A̅ = 0", "Absorption: A + AB = A, A(A + B) = A", "De Morgan: (A + B)̅ = A̅·B̅, (A·B)̅ = A̅ + B̅", "A + A̅B = A + B"] }] }),
  "combinational-logic-circuits": topic(combinational, { intro: "Combinational circuits (adders, multiplexers, demultiplexers, encoders, decoders, comparators) have outputs that depend only on current inputs." }),
  "flip-flops": topic(flipflops, { intro: "Flip-flops (SR, JK, D, T) are edge-triggered one-bit memory elements; latches are level-triggered." }),
  counters: topic(counters, { intro: "Counters count clock pulses. Ripple (asynchronous) counters chain flip-flops; synchronous counters share one clock. n flip-flops give up to 2ⁿ states." }),
  "shift-registers": topic(registers, { intro: "Shift registers move data serially or in parallel: SISO, SIPO, PISO and PIPO." }),
  memories: topic(memories, { intro: "Semiconductor memories: RAM (SRAM, DRAM) and ROM (PROM, EPROM, EEPROM, flash). Capacity = 2^(address lines) × word size." }),
  "a-d-and-d-a-converters": topic(converters, { intro: "ADCs (flash, successive approximation, dual slope) and DACs (weighted resistor, R-2R ladder) connect digital systems to the analog world. Resolution = full scale / 2ⁿ." }),
  "logic-families": topic(families, { intro: "Logic families (RTL, DTL, TTL, ECL, CMOS) differ in speed, power, fan-out and noise margin." }),
};
export default subject;
