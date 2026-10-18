import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "dc-circuits": T("DC circuits analyse steady currents with Ohm's law, Kirchhoff's laws and series–parallel combinations.", [
    m2("Three resistors of 2 Ω, 3 Ω and 5 Ω in series have total resistance:", ["10 Ω", "0.97 Ω", "30 Ω", "5 Ω"], "Series resistances add: 2 + 3 + 5 = 10 Ω.", { check: "2+3+5" }),
    m2("A 12 V battery drives current through a 4 Ω resistor. The current is:", ["3 A", "48 A", "0.33 A", "16 A"], "I = V/R = 12/4 = 3 A.", { check: "12/4" }),
    m2("The power dissipated in a 10 Ω resistor carrying 2 A is:", ["40 W", "20 W", "5 W", "200 W"], "P = I²R = 4 × 10 = 40 W.", { check: "2**2*10" }),
    m("In a parallel circuit, the voltage across each branch is:", ["The same", "Different", "Zero", "Proportional to resistance"], "Currents divide; voltage is common."),
    m("The resistance of a conductor increases with:", ["Length", "Cross-sectional area", "Decreasing temperature for metals", "Conductivity"], "R = ρL/A: resistance rises with length and falls with area."),
  ]),
  "ac-fundamentals": T("AC circuits involve sinusoidal voltages and currents with phase relationships between them.", [
    m("The RMS value of a sinusoidal voltage with peak Vm is:", ["Vm/√2", "Vm/2", "Vm√2", "2Vm/π"], "The average over a half cycle is 2Vm/π."),
    m("In a purely inductive circuit, current:", ["Lags voltage by 90°", "Leads voltage by 90°", "Is in phase", "Lags by 180°"], "In a purely capacitive circuit current leads by 90°."),
    m("Power factor is the cosine of the angle between:", ["Voltage and current", "Two voltages", "Two currents", "Real and reactive power only"], "PF = cos φ = P/S, real power divided by apparent power."),
    m("At resonance in a series RLC circuit:", ["XL = XC and impedance is minimum", "XL = 0", "Current is minimum", "Impedance is maximum"], "f₀ = 1/(2π√(LC))."),
    m("The frequency of the AC supply in India is:", ["50 Hz", "60 Hz", "100 Hz", "25 Hz"], "The USA uses 60 Hz."),
  ]),
  "magnetism-and-electromagnetism": T("Magnetism and electromagnetism link electric currents with magnetic fields and induced voltages.", [
    m("Faraday's law states that induced EMF is proportional to:", ["The rate of change of magnetic flux linkage", "The flux itself", "The current", "The resistance"], "e = −N dΦ/dt."),
    m("Lenz's law gives the:", ["Direction of induced current", "Magnitude of induced EMF", "Value of resistance", "Speed of a motor"], "The induced current opposes the change causing it."),
    m("Fleming's left-hand rule is used for:", ["Motors", "Generators", "Transformers", "Batteries"], "The right-hand rule is used for generators."),
    m("The unit of magnetic flux is the:", ["Weber", "Tesla", "Henry", "Gauss"], "Tesla is flux density (Wb/m²)."),
    m("Hysteresis loss in a magnetic material is reduced by using:", ["Silicon steel", "Copper", "Aluminium", "Cast iron"], "Soft magnetic materials have narrow hysteresis loops."),
  ]),
  transformers: T("A transformer transfers AC power between circuits by mutual induction, changing voltage levels.", [
    m("A transformer works on the principle of:", ["Mutual induction", "Self induction only", "Electrostatics", "Thermionic emission"], "It works only with AC (changing flux)."),
    m2("A transformer has 200 primary turns and 50 secondary turns. With 240 V on the primary, the secondary voltage is:", ["60 V", "960 V", "120 V", "240 V"], "V₂ = V₁ × N₂/N₁ = 240 × 50/200 = 60 V.", { check: "240*50/200" }),
    m("The core of a transformer is laminated to reduce:", ["Eddy current losses", "Copper losses", "Hysteresis only", "Voltage"], "Thin insulated laminations limit eddy currents."),
    m("The open-circuit test on a transformer measures:", ["Core (iron) losses", "Copper losses", "Efficiency directly", "Insulation"], "The short-circuit test measures copper losses."),
    m("Maximum efficiency of a transformer occurs when:", ["Copper loss equals iron loss", "Load is zero", "Copper loss is zero", "Iron loss is maximum"], "Variable losses equal constant losses."),
  ]),
  "dc-machines": T("DC machines convert electrical energy to mechanical (motors) or mechanical to electrical (generators) using a commutator.", [
    m("The commutator in a DC generator converts:", ["Alternating EMF in the armature into DC at the terminals", "DC to AC", "Mechanical to electrical energy", "Voltage to current"], "It reverses connections as the armature rotates."),
    m("Which DC motor has the highest starting torque?", ["Series motor", "Shunt motor", "Separately excited motor", "Permanent magnet motor"], "It is used in traction and cranes."),
    m("A DC series motor should never be started:", ["Without load", "With load", "Slowly", "With a starter"], "Its speed can become dangerously high without load."),
    m("Back EMF in a DC motor:", ["Opposes the applied voltage", "Adds to the supply", "Is zero when running", "Increases current"], "Eb = V − IaRa."),
    m("The speed of a DC shunt motor can be increased by:", ["Reducing the field current (field weakening)", "Increasing the field current", "Reducing supply voltage", "Adding load"], "Speed N ∝ 1/Φ, so weakening the field increases speed."),
  ]),
  "induction-motors": T("Three-phase induction motors are the workhorses of industry, running slightly below synchronous speed.", [
    m2("The synchronous speed of a 4-pole motor on a 50 Hz supply is:", ["1500 rpm", "3000 rpm", "1000 rpm", "750 rpm"], "Ns = 120f/P = 120 × 50/4 = 1500 rpm.", { check: "120*50/4" }),
    m("Slip of an induction motor is:", ["(Ns − N)/Ns", "N/Ns", "Ns/N", "Ns − N"], "Typical full-load slip is 2–5%."),
    m("The rotor of a squirrel-cage motor has:", ["Short-circuited bars", "Slip rings", "A commutator", "Permanent magnets"], "Slip-ring motors allow external rotor resistance."),
    m("A single-phase induction motor is not self-starting because:", ["Its single winding produces a pulsating, not rotating, field", "It has no rotor", "Its slip is zero", "It has a commutator"], "Auxiliary windings or capacitors create a starting torque."),
    m("Star–delta starters are used to:", ["Reduce starting current", "Increase speed", "Reverse direction", "Improve power factor"], "Starting in star reduces phase voltage by √3."),
  ]),
  "synchronous-machines": T("Synchronous machines run at synchronous speed and are used as alternators in power stations and as motors.", [
    m("Alternators in power stations are:", ["Synchronous generators", "Induction generators", "DC generators", "Transformers"], "They produce AC at grid frequency."),
    m("A synchronous motor runs at:", ["Constant synchronous speed regardless of load", "Speed that varies with load", "Zero speed", "Double synchronous speed"], "It is not self-starting."),
    m("An over-excited synchronous motor operates at:", ["Leading power factor", "Lagging power factor", "Zero power factor only", "Unity power factor only"], "It can be used as a synchronous condenser."),
    m("The conditions for parallel operation of alternators include equal:", ["Voltage, frequency and phase sequence", "Speed only", "Size", "Current only"], "Synchronising checks these before closing the breaker."),
    m("Damper windings in synchronous machines help:", ["Suppress hunting and help starting", "Increase voltage", "Reduce cost", "Cool the machine"], "Hunting is oscillation about synchronous speed."),
  ]),
  "power-systems": T("Power systems generate, transmit and distribute electrical energy.", [
    m("Electric power is transmitted at high voltage to:", ["Reduce I²R losses", "Increase current", "Reduce insulation", "Increase frequency"], "Higher voltage means lower current for the same power."),
    m("Which power plant has the lowest running cost?", ["Hydroelectric", "Diesel", "Gas turbine", "Coal thermal"], "Water is free, though capital cost is high."),
    m("The Ferranti effect is a rise in:", ["Receiving-end voltage on a lightly loaded long line", "Current on short lines", "Frequency", "Losses"], "It is caused by line capacitance."),
    m("Corona occurs in transmission lines due to:", ["Ionisation of air around conductors at high voltage", "Low current", "Underground cables", "Low frequency"], "It causes power loss and noise."),
    m("Load factor is:", ["Average load / maximum demand", "Maximum demand / connected load", "Energy / time", "Power / voltage"], "A higher load factor reduces generation cost."),
  ]),
  "power-electronics": T("Power electronics uses semiconductor switches to convert and control electrical power.", [
    m("An SCR is turned on by:", ["A gate pulse when forward biased", "Removing gate current", "Reverse biasing", "Light only"], "Once on, it stays on until current falls below holding current."),
    m("A converter that changes DC to AC is an:", ["Inverter", "Rectifier", "Chopper", "Cycloconverter"], "Rectifiers convert AC to DC; choppers DC to DC."),
    m("A chopper is used for:", ["DC to DC conversion", "AC to DC", "DC to AC", "AC to AC frequency change"], "It controls DC motor speed."),
    m("IGBT combines the advantages of:", ["MOSFET (easy gate drive) and BJT (low conduction loss)", "Diode and SCR", "Triac and diac", "Relay and fuse"], "It is used in inverters and drives."),
    m("A TRIAC can conduct:", ["In both directions", "In one direction only", "Only DC", "Only at high frequency"], "It is used in AC dimmers and fan regulators."),
  ]),
  "measurements-and-instruments": T("Electrical instruments measure voltage, current, power, energy and resistance.", [
    m("An ammeter is connected:", ["In series with the load", "In parallel with the load", "Across the supply", "To earth"], "A voltmeter is connected in parallel."),
    m("A moving-iron instrument can measure:", ["Both AC and DC", "Only DC", "Only AC", "Only resistance"], "PMMC instruments measure DC only."),
    m("A megger is used to measure:", ["Insulation resistance", "Low resistance", "Current", "Power factor"], "It applies a high DC test voltage."),
    m("An energy meter measures:", ["Electrical energy in kWh", "Power factor", "Voltage", "Frequency"], "1 unit = 1 kWh."),
    m("Two-wattmeter method is used to measure:", ["Three-phase power", "Single-phase power only", "Resistance", "Energy"], "Total power = W₁ + W₂."),
  ]),
  "switchgear-and-protection": T("Switchgear and protection isolate faults quickly to protect equipment and people.", [
    m("A fuse protects a circuit against:", ["Overcurrent", "Low voltage", "Low frequency", "High power factor"], "It melts when current exceeds its rating."),
    m("Which circuit breaker uses SF₆ gas?", ["SF₆ circuit breaker", "Air-blast breaker", "Oil circuit breaker", "Vacuum breaker"], "SF₆ has excellent arc-quenching properties."),
    m("A Buchholz relay protects:", ["Oil-immersed transformers", "Generators", "Transmission lines", "Motors"], "It detects gas from internal faults."),
    m("An earth leakage circuit breaker (ELCB/RCCB) protects mainly against:", ["Electric shock due to leakage current", "Overvoltage", "Lightning", "Overspeed"], "It trips on current imbalance."),
    m("Lightning arresters protect equipment from:", ["Surges and overvoltages", "Overcurrent", "Undervoltage", "Overheating"], "They divert surges to earth."),
  ]),
  "utilization-of-electrical-energy": T("Utilisation covers electric heating, welding, illumination, traction and drives.", [
    m("The unit of luminous flux is the:", ["Lumen", "Lux", "Candela", "Watt"], "Illuminance is in lux (lumen/m²)."),
    m("Which lamp has the highest luminous efficacy among these?", ["LED", "Incandescent", "Halogen", "Candle"], "LEDs give more lumens per watt."),
    m("Induction heating is used for:", ["Heating conducting materials by eddy currents", "Heating insulators", "Room heating only", "Cooking with flames"], "Dielectric heating is used for insulators."),
    m("Electric traction in Indian Railways mostly uses:", ["25 kV, 50 Hz AC", "1.5 kV DC only", "440 V AC", "110 V DC"], "Overhead 25 kV AC is standard on main lines."),
    m("Regenerative braking:", ["Returns energy to the supply while braking", "Wastes energy as heat", "Uses mechanical friction only", "Stops the motor instantly"], "Used in electric trains and EVs."),
  ]),
};
export default subject;
