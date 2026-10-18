import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "electronic-devices-and-circuits": T("Electronic devices (diodes, BJTs, FETs) and the basic circuits built from them.", [
    m("In a forward-biased PN junction diode:", ["The depletion region narrows and current flows easily", "The depletion region widens", "No current flows", "Only reverse saturation current flows"], "Reverse bias widens the depletion region."),
    m("The cut-in voltage of a silicon diode is about:", ["0.7 V", "0.3 V", "1.5 V", "5 V"], "Germanium is about 0.3 V."),
    m("A Zener diode is mainly used as a:", ["Voltage regulator", "Rectifier", "Amplifier", "Oscillator"], "It operates in reverse breakdown."),
    m("A BJT has:", ["Three terminals: emitter, base and collector", "Two terminals", "Four terminals", "Gate, source and drain"], "FETs have gate, source and drain."),
    m("A MOSFET is a:", ["Voltage-controlled device", "Current-controlled device", "Passive device", "Two-terminal device"], "Its gate draws almost no current."),
    m("The ripple factor of a full-wave rectifier is about:", ["0.48", "1.21", "0.1", "2.0"], "A half-wave rectifier's is about 1.21."),
  ]),
  "analog-electronics": T("Analog electronics covers amplifiers, feedback, op-amps and oscillators.", [
    m("An ideal op-amp has:", ["Infinite input impedance and zero output impedance", "Zero input impedance", "Zero gain", "Infinite output impedance"], "It also has infinite open-loop gain and bandwidth."),
    m2("The gain of an inverting op-amp amplifier with Rf = 100 kΩ and Rin = 10 kΩ is:", ["-10", "10", "11", "-11"], "Gain = −Rf/Rin = −10.", { check: "-100/10" }),
    m("Negative feedback in an amplifier:", ["Reduces gain but improves stability and bandwidth", "Increases gain", "Causes oscillation", "Reduces bandwidth"], "It also reduces distortion."),
    m("An oscillator needs:", ["Positive feedback with loop gain of at least 1 (Barkhausen criterion)", "Negative feedback", "No feedback", "A rectifier"], "Loop phase shift must be 0° or 360°."),
    m("Class A amplifiers have a maximum theoretical efficiency of about:", ["25% (resistive load) or 50% (transformer-coupled)", "78.5%", "100%", "90%"], "Class B push-pull reaches 78.5%."),
  ]),
  "network-analysis": T("Network analysis applies circuit laws and theorems to find currents and voltages.", [
    m("Kirchhoff's current law is based on conservation of:", ["Charge", "Energy", "Power", "Flux"], "KVL is based on conservation of energy."),
    m("Thevenin's theorem replaces a network by:", ["A voltage source in series with a resistance", "A current source in parallel with a resistance", "A single resistance", "A capacitor"], "Norton's theorem uses a current source with a parallel resistance."),
    m("Maximum power is transferred to a load when the load resistance equals:", ["The source (Thevenin) resistance", "Zero", "Infinity", "Twice the source resistance"], "Efficiency is then 50%."),
    m2("Two 6 Ω resistors in parallel have an equivalent resistance of:", ["3 Ω", "12 Ω", "6 Ω", "1.5 Ω"], "R = (6 × 6)/(6 + 6) = 3 Ω.", { check: "6*6/(6+6)" }),
    m("The time constant of an RC circuit is:", ["RC", "R/C", "C/R", "1/RC"], "It is the time to reach about 63% of the final value."),
  ]),
  "signals-and-systems": T("Signals and systems studies how systems respond to signals in time and frequency domains.", [
    m("A system is linear if it satisfies:", ["Superposition (additivity and homogeneity)", "Causality", "Stability", "Time invariance"], "Linearity and time invariance are separate properties."),
    m("The Fourier transform converts a signal from:", ["The time domain to the frequency domain", "Analog to digital", "Continuous to discrete only", "Voltage to current"], "The Laplace transform generalises it."),
    m("According to the sampling theorem, the sampling rate must be at least:", ["Twice the highest frequency in the signal", "Equal to the highest frequency", "Half the highest frequency", "Ten times the bandwidth"], "This minimum is the Nyquist rate."),
    m("A causal system's output depends on:", ["Present and past inputs only", "Future inputs", "Only future outputs", "Nothing"], "Real-time systems must be causal."),
    m("The Z-transform is used for:", ["Discrete-time signals and systems", "Continuous signals only", "Mechanical systems", "Power systems only"], "It is the discrete counterpart of the Laplace transform."),
  ]),
  "analog-communication": T("Analog communication transmits information by modulating a carrier's amplitude, frequency or phase.", [
    m("In amplitude modulation, the carrier's ____ varies with the message.", ["Amplitude", "Frequency", "Phase", "Wavelength only"], "FM varies the frequency."),
    m("FM is less affected by noise than AM because:", ["Noise mainly affects amplitude", "FM uses less bandwidth", "FM has no carrier", "FM uses lower frequencies"], "A limiter removes amplitude noise."),
    m("The modulation index of AM must be:", ["Less than or equal to 1 to avoid distortion", "Greater than 2", "Exactly 0", "Negative"], "Over-modulation causes envelope distortion."),
    m("Bandwidth of a conventional AM signal is:", ["Twice the highest message frequency", "Equal to the message frequency", "Half the carrier frequency", "Infinite"], "It has two sidebands."),
    m("A superheterodyne receiver converts the received signal to a fixed:", ["Intermediate frequency (IF)", "Audio frequency only", "Carrier frequency", "DC level"], "In AM receivers IF is typically 455 kHz."),
  ]),
  "digital-communication": T("Digital communication transmits data as discrete symbols using sampling, quantisation and digital modulation.", [
    m("PCM stands for:", ["Pulse Code Modulation", "Phase Carrier Modulation", "Pulse Carrier Method", "Power Control Mode"], "Sampling, quantising and encoding an analog signal."),
    m("In ASK, FSK and PSK the information changes the carrier's:", ["Amplitude, frequency and phase respectively", "Phase, amplitude and frequency", "Only amplitude", "Only frequency"], "QAM varies both amplitude and phase."),
    m("Shannon's channel capacity formula is:", ["C = B log₂(1 + S/N)", "C = 2B", "C = B × S/N", "C = log(B)"], "Capacity grows with bandwidth and signal-to-noise ratio."),
    m("Quantisation error is reduced by:", ["Increasing the number of quantisation levels (bits)", "Reducing the sampling rate", "Adding noise", "Using AM"], "Each extra bit improves SNR by about 6 dB."),
    m("Which multiple-access technique gives each user a unique code?", ["CDMA", "TDMA", "FDMA", "SDMA"], "TDMA uses time slots; FDMA frequency bands."),
  ]),
  microprocessors: T("Microprocessors execute instructions; the 8085 and 8086 are classic examples studied in courses.", [
    m("The 8085 is a(n):", ["8-bit microprocessor", "16-bit microprocessor", "32-bit microprocessor", "4-bit microprocessor"], "The 8086 is a 16-bit processor."),
    m("The 8085 has an address bus of:", ["16 bits (64 KB addressable)", "8 bits", "20 bits", "32 bits"], "The 8086 has a 20-bit address bus (1 MB)."),
    m("The program counter holds:", ["The address of the next instruction", "The current data", "The stack top", "The result of the ALU"], "The stack pointer holds the top of the stack."),
    m("Which flag is set when the result of an operation is zero?", ["Zero flag", "Carry flag", "Sign flag", "Parity flag"], "The carry flag indicates a carry out of the MSB."),
    m("DMA allows:", ["Peripherals to transfer data to memory without the CPU", "Faster CPU clock", "More registers", "Interrupt masking"], "Direct Memory Access frees the CPU."),
  ]),
  "control-systems": T("Control systems regulate outputs using feedback; analysis uses transfer functions, time and frequency response.", [
    m("A closed-loop system uses:", ["Feedback from the output", "No feedback", "Only an input", "Random control"], "Open-loop systems have no feedback."),
    m("The transfer function is the ratio of:", ["Laplace transform of output to that of input (zero initial conditions)", "Output to input in time", "Input to output", "Power to voltage"], "It characterises a linear time-invariant system."),
    m("A system is stable if all poles of its closed-loop transfer function lie:", ["In the left half of the s-plane", "On the imaginary axis", "In the right half", "At the origin"], "The Routh–Hurwitz criterion tests this."),
    m("A PID controller combines:", ["Proportional, integral and derivative actions", "Power, input and data", "Pole, impulse and delay", "Phase, inertia and damping"], "Integral action removes steady-state error."),
    m("The Bode plot shows:", ["Magnitude and phase against frequency", "Poles and zeros only", "Time response", "Root locus"], "Gain and phase margins are read from it."),
  ]),
  "electromagnetic-fields": T("Electromagnetic field theory is based on Maxwell's equations and describes waves, transmission lines and antennas.", [
    m("Maxwell's equations unify:", ["Electricity and magnetism", "Gravity and magnetism", "Heat and light", "Sound and electricity"], "They predict electromagnetic waves."),
    m("Gauss's law relates electric flux through a closed surface to:", ["The enclosed charge", "The current", "The magnetic field", "Resistance"], "Gauss's law: total electric flux Φ = Q/ε₀ for the enclosed charge Q."),
    m("The characteristic impedance of free space is about:", ["377 Ω", "50 Ω", "75 Ω", "1 Ω"], "η₀ = √(μ₀/ε₀) ≈ 377 Ω."),
    m("A standing wave ratio (VSWR) of 1 indicates:", ["A perfectly matched line", "Total reflection", "An open circuit", "A short circuit"], "Higher VSWR means more reflection."),
    m("Skin effect causes AC current to flow mainly:", ["Near the surface of a conductor", "At the centre", "Uniformly", "Only in insulators"], "It increases with frequency."),
  ]),
  "measurements-and-instrumentation": T("Measurements and instrumentation covers accuracy, errors, meters, bridges and transducers.", [
    m("A Wheatstone bridge measures:", ["Medium resistance", "Inductance", "Capacitance only", "Frequency"], "A Kelvin double bridge measures low resistance."),
    m("A CRO (oscilloscope) is used to:", ["Display and measure waveforms", "Measure resistance only", "Store energy", "Generate power"], "It plots voltage against time."),
    m("A thermocouple converts:", ["Temperature difference into voltage", "Pressure into resistance", "Light into current", "Sound into voltage"], "It works on the Seebeck effect."),
    m("Accuracy refers to:", ["Closeness of a measurement to the true value", "Repeatability of readings", "Smallest detectable change", "Range of the instrument"], "Precision refers to repeatability."),
    m("An LVDT measures:", ["Linear displacement", "Temperature", "Flow", "Humidity"], "Linear Variable Differential Transformer."),
  ]),
};
export default subject;
