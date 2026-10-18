import type { RawQ, RawSubject } from "../types";
import { m, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "building-materials": T("Building materials include stone, bricks, cement, lime, timber, steel and aggregates.", [
    m("The standard size of a modular brick in India is:", ["190 × 90 × 90 mm", "230 × 110 × 70 mm", "250 × 120 × 60 mm", "200 × 100 × 100 mm"], "With mortar it becomes 200 × 100 × 100 mm."),
    m("The main constituent responsible for the early strength of cement is:", ["Tricalcium silicate (C₃S)", "Dicalcium silicate (C₂S)", "Tricalcium aluminate", "Gypsum"], "C₂S contributes to later strength."),
    m("Gypsum is added to cement to:", ["Retard its setting time", "Increase strength", "Change colour", "Reduce cost"], "It prevents flash setting."),
    m("Seasoning of timber is done to:", ["Reduce its moisture content", "Increase its weight", "Change its colour", "Make it brittle"], "It improves strength and durability."),
    m("The initial setting time of ordinary Portland cement should be at least:", ["30 minutes", "10 minutes", "60 minutes", "600 minutes"], "Final setting time should not exceed 600 minutes."),
  ]),
  surveying: T("Surveying determines the relative positions of points on the earth's surface by measuring distances, angles and levels.", [
    m("The fundamental principle of surveying is to work from:", ["The whole to the part", "The part to the whole", "Left to right", "Top to bottom"], "This limits the accumulation of errors."),
    m("A theodolite is used to measure:", ["Horizontal and vertical angles", "Only distances", "Only levels", "Areas"], "A level measures elevation differences."),
    m("Contour lines that cross each other indicate:", ["An overhanging cliff", "A flat area", "A valley", "A ridge"], "Normally contour lines never cross."),
    m("The length of a Gunter's chain is:", ["66 feet", "100 feet", "20 metres", "30 metres"], "An engineer's chain is 100 feet."),
    m("Reduced level (RL) is the elevation of a point with respect to:", ["A datum (usually mean sea level)", "The instrument", "The ground", "The previous point"], "Levelling computes RLs."),
  ]),
  "soil-mechanics-and-foundation": T("Soil mechanics studies soil properties, strength, consolidation and bearing capacity for foundation design.", [
    m("The void ratio of a soil is the ratio of:", ["Volume of voids to volume of solids", "Volume of voids to total volume", "Weight of water to weight of solids", "Volume of water to volume of voids"], "Porosity is voids/total volume."),
    m("Atterberg limits relate to:", ["Consistency of fine-grained soils", "Strength of rock", "Permeability of sand", "Compaction of gravel"], "Liquid limit, plastic limit and shrinkage limit."),
    m("Darcy's law relates to:", ["Flow of water through soil", "Bearing capacity", "Consolidation only", "Shear strength"], "Darcy's law: v = ki, where k is permeability and i the hydraulic gradient."),
    m("A pile foundation is used when:", ["Suitable bearing strata are deep", "The soil at shallow depth is strong", "The load is very small", "The site is rocky at the surface"], "Piles transfer load to deeper strata."),
    m("The Proctor test is used to determine:", ["Optimum moisture content and maximum dry density", "Permeability", "Shear strength", "Liquid limit"], "It is a compaction test."),
  ]),
  "concrete-technology": T("Concrete technology covers the materials, mix design, workability and strength of concrete.", [
    m("The slump test measures concrete's:", ["Workability", "Compressive strength", "Durability", "Setting time"], "Higher slump means more workable concrete."),
    m("M20 concrete has a characteristic compressive strength of:", ["20 N/mm² at 28 days", "20 N/mm² at 7 days", "2 N/mm²", "200 N/mm²"], "Tested on 150 mm cubes."),
    m("Curing of concrete is done to:", ["Keep it moist so hydration continues", "Make it dry quickly", "Increase its weight", "Change its colour"], "Usually at least 7 days for OPC."),
    m("Increasing the water–cement ratio generally:", ["Reduces strength", "Increases strength", "Has no effect", "Increases durability"], "Abrams' law: strength falls as w/c rises."),
    m("The nominal mix ratio for M20 concrete is:", ["1 : 1.5 : 3", "1 : 2 : 4", "1 : 3 : 6", "1 : 1 : 2"], "M15 is 1 : 2 : 4; M25 is 1 : 1 : 2."),
  ]),
  "rcc-structures-design": T("Reinforced cement concrete combines concrete (strong in compression) with steel (strong in tension).", [
    m("Steel reinforcement in a simply supported beam is placed mainly in the:", ["Bottom (tension) zone", "Top zone", "Middle", "Sides only"], "Concrete is weak in tension."),
    m("The limit state method considers:", ["Safety (collapse) and serviceability", "Only working stress", "Only cost", "Only deflection"], "IS 456 uses limit state design."),
    m("Minimum clear cover for a slab under mild exposure (IS 456) is typically:", ["20 mm", "5 mm", "75 mm", "100 mm"], "Beams and columns need more cover."),
    m("Stirrups in beams resist:", ["Shear", "Bending only", "Torsion only", "Axial load only"], "They also hold longitudinal bars in place."),
    m("A one-way slab is one whose long span to short span ratio is:", ["Greater than 2", "Less than 2", "Exactly 1", "Less than 1"], "It bends mainly in the short direction."),
  ]),
  "steel-structure-design": T("Steel structures use rolled sections joined by bolts or welds, designed for strength and stability.", [
    m("The yield stress of common structural steel (E250) is:", ["250 N/mm²", "415 N/mm²", "500 N/mm²", "150 N/mm²"], "Fe 415 and Fe 500 are reinforcement grades."),
    m("Buckling is the main failure mode of:", ["Slender compression members", "Short tension members", "Bolts", "Welds"], "Euler's formula gives the critical load."),
    m("The slenderness ratio is:", ["Effective length / radius of gyration", "Length / area", "Area / length", "Load / length"], "Higher slenderness means lower buckling load."),
    m("A fillet weld is designed for:", ["Shear on its throat", "Bending only", "Compression only", "Torsion only"], "Throat thickness ≈ 0.7 × leg size."),
    m("Lacing and battening are used in:", ["Built-up columns", "Beams", "Foundations", "Slabs"], "They tie the components so they act together."),
  ]),
  "theory-of-structures": T("Theory of structures analyses forces, moments and deflections in beams, trusses and frames.", [
    m("A cantilever beam is fixed at:", ["One end and free at the other", "Both ends", "Neither end", "The middle"], "Maximum bending moment is at the fixed end."),
    m("The maximum bending moment of a cantilever of length L with a point load W at the free end is:", ["WL", "WL/2", "WL/4", "WL/8"], "It occurs at the fixed support."),
    m("A structure is statically determinate when:", ["Its reactions and internal forces can be found from equilibrium equations alone", "It has no supports", "It cannot carry loads", "It is a cantilever only"], "Indeterminate structures need compatibility conditions."),
    m("Members of an ideal truss carry:", ["Only axial forces", "Bending moments", "Torsion", "Shear only"], "Joints are assumed pinned and loads act at joints."),
    m("Castigliano's theorem is used to find:", ["Deflections", "Material strength", "Loads on columns only", "Soil pressure"], "Deflection = ∂U/∂P."),
  ]),
  hydraulics: T("Hydraulics deals with water flow in pipes and open channels.", [
    m("Manning's formula is used for flow in:", ["Open channels", "Pipes under pressure only", "Soils", "Pumps"], "V = (1/n) R^(2/3) S^(1/2)."),
    m("The Darcy–Weisbach equation calculates:", ["Head loss due to friction in pipes", "Flow in channels", "Pump power", "Water hammer"], "hf = fLV²/(2gD)."),
    m("A hydraulic jump occurs when flow changes from:", ["Supercritical to subcritical", "Subcritical to supercritical", "Laminar to turbulent", "Steady to unsteady"], "It dissipates energy."),
    m("Froude number less than 1 indicates:", ["Subcritical flow", "Supercritical flow", "Critical flow", "Laminar flow"], "Fr = 1 is critical flow."),
    m("Water hammer occurs when:", ["Flow in a pipe is suddenly stopped", "Flow is laminar", "Pipes are empty", "Pressure is constant"], "It causes a pressure surge."),
  ]),
  irrigation: T("Irrigation engineering supplies water to crops through canals, dams, wells and modern methods.", [
    m("Duty of water is the:", ["Area irrigated per unit discharge", "Depth of water applied", "Time of irrigation", "Canal capacity"], "Usually hectares per cumec."),
    m("Which irrigation method uses the least water?", ["Drip irrigation", "Flood irrigation", "Furrow irrigation", "Basin irrigation"], "Water is delivered directly to roots."),
    m("A weir is constructed:", ["Across a river to raise its water level", "Along a canal bank", "Under a road", "On a hilltop"], "Barrages have gates to control levels."),
    m("Waterlogging can be reduced by:", ["Providing drainage and lining canals", "Over-irrigation", "Blocking drains", "Planting no crops"], "It raises the water table and harms crops."),
    m("Kharif crops are sown in:", ["The monsoon season (June–July)", "Winter", "Spring", "Summer only"], "Rabi crops are sown in winter."),
  ]),
  "highway-engineering": T("Highway engineering covers road planning, geometric design, pavements and traffic.", [
    m("Super-elevation on curves is provided to:", ["Counteract centrifugal force", "Drain rainwater only", "Reduce cost", "Increase friction only"], "The outer edge is raised."),
    m("A flexible pavement is usually made of:", ["Bituminous layers over granular bases", "Cement concrete slabs", "Bricks only", "Steel plates"], "Rigid pavements are cement concrete."),
    m("The CBR test is used to evaluate:", ["The strength of subgrade soil", "Bitumen viscosity", "Traffic volume", "Concrete strength"], "California Bearing Ratio."),
    m("Camber in roads is provided for:", ["Drainage of rainwater", "Banking on curves", "Sight distance", "Reducing speed"], "The road surface slopes to the sides."),
    m("Stopping sight distance depends on:", ["Speed, reaction time and braking distance", "Road width only", "Lane markings", "Traffic signs only"], "It must be available on all roads."),
  ]),
  "railway-engineering": T("Railway engineering covers track, gauges, points and crossings, and signalling.", [
    m("The broad gauge in India has a width of:", ["1676 mm", "1435 mm", "1000 mm", "762 mm"], "Standard gauge is 1435 mm; metre gauge 1000 mm."),
    m("Sleepers in a railway track:", ["Hold rails to gauge and transfer load to ballast", "Carry signals", "Drain water", "Connect stations"], "They may be wooden, steel or concrete."),
    m("Coning of wheels helps:", ["Keep the train centred on the track and negotiate curves", "Increase speed", "Reduce weight", "Brake faster"], "It reduces wear and flange contact."),
    m("A gap left between rails for expansion is called:", ["An expansion gap", "A camber", "A cant", "A creep"], "Welded rails reduce such joints."),
    m("Cant on railway curves is the:", ["Raising of the outer rail", "Lowering of both rails", "Gauge widening", "Speed limit"], "It is the railway equivalent of super-elevation."),
  ]),
  "water-supply-engineering": T("Water supply engineering covers sources, treatment and distribution of drinking water.", [
    m("The process that removes suspended particles with alum is:", ["Coagulation and flocculation", "Disinfection", "Aeration", "Softening"], "Flocs then settle in sedimentation tanks."),
    m("Chlorination of water is done for:", ["Disinfection", "Removing hardness", "Removing colour only", "Adding minerals"], "It kills pathogens."),
    m("Hardness of water is caused mainly by:", ["Calcium and magnesium salts", "Sodium chloride", "Iron only", "Dissolved oxygen"], "Temporary hardness is removed by boiling."),
    m("The acceptable pH range of drinking water (BIS) is:", ["6.5–8.5", "4–5", "9–11", "1–3"], "IS 10500 specifies 6.5–8.5."),
    m("Slow sand filters remove impurities mainly by:", ["Biological action in the top layer (schmutzdecke)", "Chemical reaction", "High pressure", "Boiling"], "Rapid sand filters work mainly by straining."),
  ]),
  "waste-water-engineering": T("Waste water engineering covers collection, treatment and disposal of sewage.", [
    m("BOD measures:", ["Oxygen needed by microorganisms to decompose organic matter", "Total solids", "pH", "Colour"], "Biochemical Oxygen Demand, usually 5-day at 20 °C."),
    m("The activated sludge process is a:", ["Biological (secondary) treatment", "Primary treatment", "Physical screening", "Disinfection"], "Aerobic microbes digest organic matter."),
    m("Screening in sewage treatment removes:", ["Large floating materials", "Dissolved salts", "Bacteria", "Odour"], "It protects pumps and later units."),
    m("A septic tank is used for:", ["On-site treatment of household sewage", "Water softening", "Storing drinking water", "Rainwater harvesting"], "It provides anaerobic digestion and settling."),
    m("Sewers are designed to have self-cleansing velocity to:", ["Prevent deposition of solids", "Increase pressure", "Save pipes", "Reduce slope"], "Typically 0.6–0.9 m/s."),
  ]),
  "estimating-and-costing": T("Estimating and costing calculate quantities and costs of construction work.", [
    m("Earthwork is usually measured in:", ["Cubic metres", "Square metres", "Running metres", "Numbers"], "Plastering is measured in square metres."),
    m("A detailed estimate is prepared:", ["From detailed drawings, item by item", "Before any design", "From plinth area only", "From cube rate only"], "Approximate estimates use plinth area or cube rates."),
    m("Contingencies in an estimate are typically:", ["3–5% of the estimated cost", "50%", "0%", "25%"], "They cover unforeseen items."),
    m("Rate analysis determines:", ["The cost per unit of an item of work", "The total project duration", "The soil type", "The design load"], "It includes materials, labour, equipment and overheads."),
    m("Brickwork is usually measured in:", ["Cubic metres", "Kilograms", "Litres", "Square metres only"], "Thin partition walls may be measured in square metres."),
  ]),
};
export default subject;
