import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "engineering-mechanics": T("Engineering mechanics studies forces and their effects on bodies at rest (statics) and in motion (dynamics).", [
    m("The resultant of two equal forces P acting at right angles is:", ["P√2", "2P", "P/2", "P"], "R = √(P² + P²) = P√2."),
    m("Lami's theorem applies to:", ["Three concurrent coplanar forces in equilibrium", "Any number of parallel forces", "Two forces only", "Moving bodies"], "Each force is proportional to the sine of the angle between the other two."),
    m("The moment of a force about a point equals:", ["Force × perpendicular distance from the point", "Force × time", "Force / distance", "Mass × acceleration"], "Its unit is N·m."),
    m("The coefficient of friction is the ratio of:", ["Limiting friction to normal reaction", "Normal reaction to friction", "Weight to mass", "Velocity to time"], "μ = F/N, where F is limiting friction and N the normal reaction."),
    m2("A body of mass 10 kg accelerates at 2 m/s². The net force on it is:", ["20 N", "5 N", "12 N", "0.2 N"], "F = ma = 10 × 2 = 20 N.", { check: "10*2" }),
    m("The centre of gravity of a uniform triangle lies at the:", ["Intersection of its medians (centroid)", "Midpoint of the base", "Apex", "Circumcentre"], "It is two-thirds of the way down each median from the vertex."),
  ]),
  "strength-of-materials": T("Strength of materials relates loads to stresses, strains and deformation in structural members.", [
    m("Stress is defined as:", ["Force per unit area", "Change in length per unit length", "Force × area", "Load × length"], "Strain is change in length per original length."),
    m("Young's modulus is the ratio of:", ["Normal stress to normal strain (within the elastic limit)", "Shear stress to shear strain", "Volumetric stress to volumetric strain", "Lateral strain to linear strain"], "The shear ratio gives the modulus of rigidity; volumetric gives the bulk modulus."),
    m("Hooke's law is valid up to the:", ["Limit of proportionality", "Ultimate stress", "Breaking point", "Yield point beyond"], "Stress is proportional to strain only up to the proportional limit."),
    m("Poisson's ratio is:", ["Lateral strain / longitudinal strain", "Longitudinal strain / lateral strain", "Stress / strain", "Shear stress / shear strain"], "For most metals it is about 0.25–0.35."),
    m("Maximum bending moment in a simply supported beam of span L with a central point load W is:", ["WL/4", "WL/8", "WL/2", "WL"], "For a uniformly distributed load w per unit length it is wL²/8."),
    m2("A bar of 100 mm² cross-section carries 10 kN in tension. The stress is:", ["100 N/mm²", "10 N/mm²", "1000 N/mm²", "1 N/mm²"], "σ = 10,000 N / 100 mm² = 100 N/mm² (MPa).", { check: "10000/100" }),
  ]),
  thermodynamics: T("Thermodynamics deals with energy, heat and work and the laws governing their conversion.", [
    m("The first law of thermodynamics is a statement of:", ["Conservation of energy", "Conservation of mass", "Increase of entropy", "Absolute zero"], "Q = ΔU + W."),
    m("The Kelvin–Planck statement belongs to the:", ["Second law of thermodynamics", "First law", "Zeroth law", "Third law"], "No engine can convert all heat from a single reservoir into work."),
    m("The zeroth law of thermodynamics is the basis of:", ["Temperature measurement", "Energy conservation", "Entropy", "Heat engines"], "Bodies in thermal equilibrium with a third body are in equilibrium with each other."),
    m("The efficiency of a Carnot engine depends on:", ["Source and sink temperatures only", "The working substance", "The engine size", "The pressure only"], "η = 1 − T₂/T₁ (absolute temperatures)."),
    m2("A Carnot engine works between 500 K and 300 K. Its efficiency is:", ["40%", "60%", "30%", "50%"], "η = 1 − 300/500 = 0.4.", { check: "(1-300/500)*100" }),
    m("A process in which no heat is transferred is:", ["Adiabatic", "Isothermal", "Isobaric", "Isochoric"], "Isothermal: constant temperature; isobaric: constant pressure; isochoric: constant volume."),
  ]),
  "fluid-mechanics": T("Fluid mechanics studies fluids at rest and in motion: pressure, buoyancy, flow and losses.", [
    m("Bernoulli's equation is based on conservation of:", ["Energy", "Mass", "Momentum", "Angular momentum"], "Pressure, kinetic and potential heads add to a constant along a streamline."),
    m("The continuity equation is based on conservation of:", ["Mass", "Energy", "Momentum", "Heat"], "A₁V₁ = A₂V₂ for incompressible flow."),
    m("Flow is laminar in a pipe when the Reynolds number is below about:", ["2000", "4000", "10000", "500"], "Above about 4000 the flow is turbulent."),
    m("Viscosity is the property of a fluid that resists:", ["Relative motion between its layers", "Compression", "Surface tension", "Heating"], "It is internal friction."),
    m("A venturimeter is used to measure:", ["Flow rate (discharge)", "Pressure only", "Viscosity", "Density"], "It uses the pressure drop in a converging section."),
    m("Pressure at a depth h in a liquid of density ρ is:", ["ρgh", "ρ/gh", "gh/ρ", "ρh"], "Hydrostatic pressure increases linearly with depth."),
  ]),
  "hydraulic-machines": T("Hydraulic machines convert fluid energy to mechanical energy (turbines) or vice versa (pumps).", [
    m("A Pelton wheel is a(n):", ["Impulse turbine", "Reaction turbine", "Centrifugal pump", "Axial flow pump"], "It is used for high heads."),
    m("A Francis turbine is a:", ["Mixed-flow reaction turbine", "Impulse turbine", "Pump", "Compressor"], "It suits medium heads."),
    m("A Kaplan turbine is best suited for:", ["Low heads and large flows", "Very high heads", "Small flows only", "Gas flow"], "It is an axial-flow reaction turbine with adjustable blades."),
    m("Cavitation in pumps is caused by:", ["Local pressure falling below the liquid's vapour pressure", "Excess speed only", "High temperature only", "Air leaks only"], "Vapour bubbles collapse and damage surfaces."),
    m("Priming of a centrifugal pump means:", ["Filling the pump casing and suction pipe with liquid before starting", "Lubricating the bearings", "Increasing speed", "Cleaning the impeller"], "Air in the casing prevents suction."),
  ]),
  "theory-of-machines": T("Theory of machines studies mechanisms, motion transmission, gears, cams, governors and balancing.", [
    m("A kinematic chain with four links and four turning pairs is a:", ["Four-bar chain", "Slider-crank chain", "Double slider chain", "Gear train"], "It is the basic mechanism."),
    m("The function of a flywheel is to:", ["Reduce speed fluctuations within a cycle", "Control mean speed over cycles", "Increase power", "Reduce friction"], "A governor controls mean speed with load changes."),
    m("Gears used to connect intersecting shafts are:", ["Bevel gears", "Spur gears", "Helical gears on parallel shafts", "Worm gears"], "Worm gears connect non-intersecting perpendicular shafts."),
    m("A cam follower's motion with minimum jerk is:", ["Cycloidal motion", "Uniform velocity", "Simple harmonic motion", "Uniform acceleration"], "Cycloidal motion has no sudden change in acceleration."),
    m("The velocity ratio of a gear pair equals:", ["Number of teeth on driven / number of teeth on driver", "Driver teeth / driven teeth × 2", "Module × teeth", "Pitch diameter sum"], "N₁/N₂ = T₂/T₁."),
  ]),
  "machine-design": T("Machine design selects materials, dimensions and safety factors so components carry their loads safely.", [
    m("Factor of safety is the ratio of:", ["Failure (ultimate or yield) stress to working stress", "Working stress to ultimate stress", "Load to area", "Strain to stress"], "It allows for uncertainty in loads and materials."),
    m("Which failure theory is generally used for ductile materials?", ["Maximum shear stress or distortion energy theory", "Maximum principal stress theory", "Maximum strain theory only", "Rankine's theory only"], "Rankine's maximum principal stress theory suits brittle materials."),
    m("A key is used to:", ["Transmit torque between a shaft and a hub", "Join two plates", "Reduce friction", "Seal a joint"], "Common types: sunk, saddle, Woodruff, feather."),
    m("Fatigue failure occurs under:", ["Repeated (fluctuating) loading", "Static loading", "High temperature only", "Impact only"], "Failure can occur below the static strength."),
    m("Ball bearings are an example of:", ["Rolling contact bearings", "Sliding contact bearings", "Journal bearings", "Thrust plates"], "They have low starting friction."),
  ]),
  "heat-transfer": T("Heat is transferred by conduction, convection and radiation.", [
    m("Fourier's law relates to heat transfer by:", ["Conduction", "Convection", "Radiation", "Boiling"], "q = −kA dT/dx."),
    m("Newton's law of cooling relates to:", ["Convection", "Conduction", "Radiation", "Evaporation"], "q = hA(Ts − T∞)."),
    m("The Stefan–Boltzmann law states that radiated energy is proportional to:", ["The fourth power of absolute temperature", "Absolute temperature", "The square of temperature", "The temperature difference"], "E = σT⁴, where σ is the Stefan–Boltzmann constant and T is absolute temperature."),
    m("Which has the highest thermal conductivity?", ["Silver", "Steel", "Water", "Air"], "Silver and copper conduct heat best; air is a good insulator."),
    m("A heat exchanger in which hot and cold fluids flow in opposite directions is:", ["Counter-flow", "Parallel-flow", "Cross-flow", "Regenerator"], "Counter-flow is the most effective arrangement."),
  ]),
  "ic-engines": T("Internal combustion engines burn fuel inside the cylinder to produce work.", [
    m("A four-stroke engine completes one power stroke in:", ["Two revolutions of the crankshaft", "One revolution", "Four revolutions", "Half a revolution"], "A two-stroke engine has one power stroke per revolution."),
    m("Petrol (SI) engines work on the:", ["Otto cycle", "Diesel cycle", "Rankine cycle", "Brayton cycle"], "Diesel (CI) engines work on the Diesel cycle."),
    m("Diesel engines ignite fuel by:", ["Heat of compression", "A spark plug", "A glow plug at all times", "A magneto"], "Compression ratios are typically 14–22."),
    m("Knocking in petrol engines is reduced by fuel with a high:", ["Octane number", "Cetane number", "Viscosity", "Flash point"], "Cetane number rates diesel ignition quality."),
    m("The function of a carburettor is to:", ["Mix air and fuel in the right proportion", "Ignite the fuel", "Cool the engine", "Lubricate the piston"], "Modern engines use fuel injection instead."),
  ]),
  "refrigeration-and-air-conditioning": T("Refrigeration removes heat from a low-temperature space and rejects it at a higher temperature.", [
    m("The coefficient of performance (COP) of a refrigerator is:", ["Refrigerating effect / work input", "Work input / refrigerating effect", "Heat rejected / work", "Always less than 1"], "COP can be greater than 1."),
    m("One ton of refrigeration is approximately:", ["3.5 kW", "1 kW", "10 kW", "0.5 kW"], "It is about 211 kJ/min, the rate of freezing one ton of water in a day."),
    m("Which component of a vapour-compression system lowers pressure?", ["Expansion valve", "Compressor", "Condenser", "Evaporator"], "The cycle: compressor → condenser → expansion valve → evaporator."),
    m("Heat is absorbed from the refrigerated space in the:", ["Evaporator", "Condenser", "Compressor", "Receiver"], "The refrigerant evaporates by absorbing heat."),
    m("Relative humidity is measured with a:", ["Psychrometer (wet and dry bulb thermometer)", "Barometer", "Manometer", "Pyrometer"], "The difference between wet- and dry-bulb readings gives humidity."),
  ]),
  "production-engineering": T("Production engineering covers manufacturing processes: casting, forming, machining and joining.", [
    m("The process of making a component by pouring molten metal into a mould is:", ["Casting", "Forging", "Rolling", "Machining"], "Sand casting is the most common method."),
    m("Which machine tool is mainly used to produce cylindrical surfaces?", ["Lathe", "Shaper", "Milling machine", "Planer"], "Turning on a lathe produces cylinders."),
    m("Welding that uses an electric arc between an electrode and the work is:", ["Arc welding", "Gas welding", "Resistance welding", "Thermit welding"], "Shielded metal arc welding is common."),
    m("Taylor's tool life equation is:", ["VTⁿ = C", "V = Tⁿ", "T = VC", "VT = n"], "V is cutting speed, T tool life, n and C constants."),
    m("Which process produces holes?", ["Drilling", "Turning", "Facing", "Knurling"], "Reaming and boring finish existing holes."),
  ]),
  "engineering-materials": T("Engineering materials include metals, alloys, polymers, ceramics and composites, chosen for their properties.", [
    m("Steel is an alloy of iron and:", ["Carbon", "Copper", "Zinc", "Tin"], "Carbon content is usually below 2%."),
    m("Cast iron contains carbon in the range of about:", ["2–4%", "0.1–0.5%", "6–8%", "Less than 0.05%"], "It is brittle but easy to cast."),
    m("Brass is an alloy of:", ["Copper and zinc", "Copper and tin", "Iron and carbon", "Aluminium and copper"], "Bronze is copper and tin."),
    m("Stainless steel resists corrosion mainly due to:", ["Chromium", "Carbon", "Manganese", "Sulphur"], "At least about 10.5% chromium forms a passive oxide layer."),
    m("Annealing is done to:", ["Soften metal and relieve internal stresses", "Harden the surface", "Increase brittleness", "Add carbon"], "It involves heating and slow cooling."),
    m("The ability of a material to be drawn into wires is:", ["Ductility", "Malleability", "Brittleness", "Hardness"], "Malleability is the ability to be hammered into sheets."),
  ]),
};
export default subject;
