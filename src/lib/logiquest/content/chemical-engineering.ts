import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "process-calculations": T("Process calculations use material and energy balances, units and gas laws.", [
    m("A material balance is based on:", ["Conservation of mass", "Conservation of momentum", "Ideal gas law", "Entropy increase"], "Input = output + accumulation (without reaction)."),
    m("One mole of an ideal gas at STP (0 °C, 1 atm) occupies:", ["22.4 litres", "1 litre", "24.8 litres", "11.2 litres"], "At 25 °C and 1 bar it is about 24.8 L."),
    m2("What is the molecular weight of water (H = 1, O = 16)?", ["18", "17", "16", "20"], "2 × 1 + 16 = 18.", { check: "2*1+16" }),
    m("Mole fraction of a component is:", ["Moles of component / total moles", "Mass / volume", "Moles / volume", "Mass of component / total mass"], "Mole fractions add up to 1."),
    m("Humidity is the amount of:", ["Water vapour in air", "Oxygen in water", "Salt in water", "CO₂ in air"], "Relative humidity compares it with saturation."),
  ]),
  "fluid-mechanics": T("Fluid mechanics for chemical engineers covers flow in pipes, pumps, flow measurement and fluidisation.", [
    m("A rotameter measures flow using:", ["A float in a tapered tube", "A pressure drop across an orifice", "Ultrasound", "A turbine"], "The float rises with flow rate."),
    m("Newtonian fluids have:", ["Viscosity independent of shear rate", "Viscosity that changes with shear rate", "No viscosity", "Infinite viscosity"], "Water and air are Newtonian; paint and blood are non-Newtonian."),
    m("Fluidisation occurs when:", ["Upward fluid drag supports the weight of particles in a bed", "Fluid flows downward", "Particles are fixed", "There is no flow"], "Fluidised beds give good mixing and heat transfer."),
    m("NPSH relates to:", ["Avoiding cavitation in pumps", "Pipe roughness", "Viscosity", "Flow measurement"], "Available NPSH must exceed required NPSH."),
    m("The Reynolds number is the ratio of:", ["Inertial forces to viscous forces", "Viscous to inertial forces", "Gravity to inertia", "Pressure to viscosity"], "Re = ρVD/μ."),
  ]),
  "heat-transfer": T("Heat transfer in process plants: conduction, convection, radiation, heat exchangers and evaporators.", [
    m("The overall heat-transfer coefficient accounts for:", ["All resistances between the two fluids, including the wall and fouling", "Only convection", "Only conduction", "Only radiation"], "1/U = sum of individual resistances."),
    m("LMTD is used in the design of:", ["Heat exchangers", "Distillation columns", "Pumps", "Reactors"], "Log Mean Temperature Difference."),
    m("A shell-and-tube heat exchanger with baffles improves:", ["Shell-side heat-transfer coefficient", "Pressure", "Fouling", "Tube length"], "Baffles direct flow across the tubes."),
    m("The Nusselt number represents:", ["Ratio of convective to conductive heat transfer", "Inertia to viscosity", "Momentum to thermal diffusivity", "Buoyancy to viscosity"], "Prandtl number relates momentum and thermal diffusivity."),
    m("Multiple-effect evaporators are used to:", ["Improve steam economy", "Increase pressure", "Cool liquids", "Mix solids"], "Vapour from one effect heats the next."),
  ]),
  "mass-transfer": T("Mass transfer separates mixtures: distillation, absorption, extraction, drying and more.", [
    m("Distillation separates components based on differences in:", ["Volatility (boiling points)", "Density", "Solubility", "Particle size"], "Relative volatility drives separation."),
    m("Fick's law relates to:", ["Molecular diffusion", "Heat conduction", "Fluid flow", "Radiation"], "Flux is proportional to the concentration gradient."),
    m("An azeotrope is a mixture that:", ["Boils at constant composition", "Cannot be heated", "Has no vapour pressure", "Separates easily by distillation"], "Ethanol–water forms an azeotrope near 95.6% ethanol."),
    m("Gas absorption typically uses a:", ["Packed column", "Rotary kiln", "Crusher", "Centrifuge"], "Liquid flows down over packing while gas flows up."),
    m("Liquid–liquid extraction separates components by differences in:", ["Solubility in two immiscible liquids", "Boiling point", "Particle size", "Magnetism"], "A solvent selectively dissolves one component."),
  ]),
  "chemical-engineering-thermodynamics": T("Thermodynamics for chemical engineers: equations of state, phase equilibria and reaction equilibria.", [
    m("The ideal gas equation is:", ["PV = nRT", "PV = constant always", "P = ρgh", "E = mc²"], "Real gases deviate at high pressure and low temperature."),
    m("Gibbs free energy change for a spontaneous process at constant T and P is:", ["Negative", "Positive", "Zero", "Infinite"], "ΔG = ΔH − TΔS."),
    m("Raoult's law applies to:", ["Ideal solutions", "Real gases", "Solids", "Electrolytes only"], "pᵢ = xᵢPᵢ^sat."),
    m("At the critical point:", ["Liquid and vapour phases become indistinguishable", "The substance freezes", "Pressure is zero", "Entropy is zero"], "Above it, the fluid is supercritical."),
    m("The Clausius–Clapeyron equation relates:", ["Vapour pressure to temperature", "Volume to pressure", "Density to viscosity", "Heat to work"], "It uses the enthalpy of vaporisation."),
  ]),
  "chemical-reaction-engineering": T("Reaction engineering covers kinetics, rate laws and the design of reactors.", [
    m("The rate constant of a reaction depends mainly on:", ["Temperature", "Concentration", "Reactor volume", "Pressure only"], "Arrhenius equation: k = A e^(−E/RT)."),
    m("A CSTR has:", ["Uniform composition equal to the outlet", "Plug flow", "No mixing", "Batch operation"], "Continuous Stirred-Tank Reactor."),
    m("For the same conversion of a positive-order reaction, a PFR generally needs:", ["Less volume than a CSTR", "More volume than a CSTR", "Exactly the same volume", "No volume"], "A CSTR operates at the low outlet concentration."),
    m("A catalyst increases reaction rate by:", ["Lowering the activation energy", "Increasing the equilibrium constant", "Raising the temperature", "Being consumed"], "It does not change equilibrium."),
    m("Half-life of a first-order reaction is:", ["Independent of initial concentration", "Proportional to initial concentration", "Inversely proportional to concentration", "Always 1 hour"], "t½ = 0.693/k."),
  ]),
  "mechanical-operations": T("Mechanical operations handle solids: size reduction, screening, filtration, settling and mixing.", [
    m("Rittinger's law relates size-reduction energy to:", ["New surface area produced", "Volume", "Weight only", "Temperature"], "Kick's and Bond's laws are alternatives."),
    m("A ball mill reduces size mainly by:", ["Impact and attrition", "Cutting", "Heating", "Dissolving"], "Steel balls tumble with the material."),
    m("Filtration separates:", ["Solids from fluids using a porous medium", "Two gases", "Two liquids", "Ions"], "Filter aids improve cake permeability."),
    m("A cyclone separator removes:", ["Particles from gas streams using centrifugal force", "Dissolved salts", "Liquids from liquids", "Heat"], "Used for dust collection."),
    m("Screening separates particles by:", ["Size", "Density", "Colour", "Chemical composition"], "Mesh number indicates openings per inch."),
  ]),
  "process-control": T("Process control keeps variables such as temperature, pressure, level and flow at their set points.", [
    m("In a feedback control loop, the controller acts on the:", ["Error between set point and measured value", "Set point only", "Disturbance only", "Output only"], "Feedforward control acts on measured disturbances."),
    m("Integral action in a controller eliminates:", ["Steady-state offset", "Overshoot", "Noise", "Dead time"], "Derivative action reduces overshoot."),
    m("A control valve that closes on air failure is:", ["Air-to-open (fail-closed)", "Air-to-close", "Fail-open", "Manual"], "Fail-safe position is chosen for safety."),
    m("Dead time in a process is:", ["The delay before the output starts responding", "The time constant", "The settling time", "The sampling time"], "It makes control harder."),
    m("Cascade control uses:", ["One controller's output as another's set point", "No feedback", "Only manual control", "One sensor for all loops"], "It improves rejection of inner-loop disturbances."),
  ]),
  "petroleum-refining": T("Petroleum refining separates and converts crude oil into fuels and petrochemical feedstocks.", [
    m("The first major unit in a refinery is:", ["Atmospheric distillation", "Catalytic cracking", "Reforming", "Alkylation"], "Crude is separated into fractions by boiling range."),
    m("Catalytic cracking converts:", ["Heavy fractions into lighter, more valuable products like petrol", "Light gases into heavy oils", "Water into steam", "Petrol into crude"], "Fluid catalytic cracking (FCC) is widely used."),
    m("Catalytic reforming is used to increase the:", ["Octane number of naphtha", "Viscosity of oil", "Sulphur content", "Pour point"], "It produces aromatics and hydrogen."),
    m("Hydrodesulphurisation removes:", ["Sulphur compounds", "Water", "Nitrogen gas", "Carbon dioxide"], "Hydrogen converts sulphur to H₂S."),
    m("LPG mainly consists of:", ["Propane and butane", "Methane only", "Ethylene", "Hydrogen"], "Natural gas is mostly methane."),
  ]),
  "plant-economics": T("Plant economics evaluates costs, profitability and project decisions.", [
    m("Payback period is the time needed to:", ["Recover the initial investment from net cash flows", "Build the plant", "Pay all taxes", "Depreciate fully"], "Shorter payback is preferred."),
    m("Depreciation accounts for:", ["Loss of value of assets over time", "Raw material cost", "Labour cost", "Profit"], "Methods include straight-line and declining balance."),
    m("Fixed costs:", ["Do not change with production rate", "Vary directly with output", "Are zero at full capacity", "Include raw materials"], "Rent and depreciation are fixed; raw materials are variable."),
    m("The break-even point is where:", ["Total revenue equals total cost", "Profit is maximum", "Costs are zero", "Production stops"], "Above it the plant makes a profit."),
    m("Net present value (NPV) considers:", ["The time value of money", "Only total revenue", "Only fixed costs", "Inflation only"], "Positive NPV indicates a worthwhile project."),
  ]),
};
export default subject;
