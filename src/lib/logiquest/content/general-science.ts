import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const physics: RawQ[] = [
  m("The SI unit of force is the:", ["Newton", "Joule", "Watt", "Pascal"], "1 N = 1 kg·m/s²."),
  m("The speed of light in vacuum is approximately:", ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁵ km/s", "340 m/s"], "About 300,000 km/s; 340 m/s is roughly the speed of sound in air."),
  m("Which law states that every action has an equal and opposite reaction?", ["Newton's third law", "Newton's first law", "Newton's second law", "Law of gravitation"], "Forces always occur in pairs."),
  m("Sound cannot travel through:", ["Vacuum", "Water", "Steel", "Air"], "Sound needs a medium."),
  m("The rainbow is formed due to:", ["Dispersion, refraction and reflection of sunlight in raindrops", "Only reflection", "Diffraction only", "Polarisation"], "White light splits into its colours."),
  m("Ohm's law states that:", ["V = IR", "P = VI", "F = ma", "E = mc²"], "Voltage equals current times resistance."),
  m("Which mirror is used as a rear-view mirror in vehicles?", ["Convex mirror", "Concave mirror", "Plane mirror", "Cylindrical mirror"], "It gives a wider field of view."),
  m2("A body's mass is 60 kg on Earth. What is its mass on the Moon?", ["60 kg", "10 kg", "360 kg", "0 kg"], "Mass does not change; weight on the Moon is about one-sixth."),
  m("The unit of electric current is the:", ["Ampere", "Volt", "Ohm", "Coulomb"], "Voltage is in volts; resistance in ohms."),
];

const chemistry: RawQ[] = [
  m("The chemical formula of water is:", ["H₂O", "H₂O₂", "HO", "H₃O"], "Two hydrogen atoms and one oxygen atom."),
  m("The pH of pure water at 25 °C is:", ["7", "0", "14", "1"], "Below 7 is acidic; above 7 is basic."),
  m("Which gas is most abundant in Earth's atmosphere?", ["Nitrogen", "Oxygen", "Carbon dioxide", "Argon"], "About 78% nitrogen and 21% oxygen."),
  m("The chemical symbol of gold is:", ["Au", "Ag", "Gd", "Go"], "From Latin 'aurum'; Ag (argentum) is silver."),
  m("Common salt is chemically:", ["Sodium chloride", "Sodium carbonate", "Calcium chloride", "Potassium chloride"], "Common salt is sodium chloride, NaCl."),
  m("Which is the lightest element?", ["Hydrogen", "Helium", "Lithium", "Oxygen"], "Hydrogen has atomic number 1."),
  m("Rusting of iron requires:", ["Oxygen and water (moisture)", "Only oxygen", "Only water", "Carbon dioxide"], "Iron oxide (rust) forms in the presence of both."),
  m("The atomic number of an element is the number of:", ["Protons in its nucleus", "Neutrons", "Protons plus neutrons", "Electrons in the outer shell"], "Mass number = protons + neutrons."),
  m("Baking soda is:", ["Sodium bicarbonate", "Sodium chloride", "Calcium carbonate", "Sodium hydroxide"], "Baking soda is sodium bicarbonate, NaHCO₃; washing soda is sodium carbonate."),
];

const biology: RawQ[] = [
  m("The basic unit of life is the:", ["Cell", "Tissue", "Organ", "Atom"], "All living organisms are made of cells."),
  m("Which organelle is known as the powerhouse of the cell?", ["Mitochondria", "Ribosome", "Nucleus", "Golgi body"], "Mitochondria produce ATP through respiration."),
  m("Photosynthesis takes place in the:", ["Chloroplast", "Mitochondria", "Nucleus", "Vacuole"], "Chlorophyll captures light energy."),
  m("Which gas do plants release during photosynthesis?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], "They take in CO₂ and release O₂."),
  m("DNA stands for:", ["Deoxyribonucleic acid", "Dinucleic acid", "Deoxyribose nitrogen acid", "Double nucleic acid"], "DNA carries genetic information."),
  m("Which vitamin is produced in the skin in sunlight?", ["Vitamin D", "Vitamin C", "Vitamin A", "Vitamin K"], "Vitamin D helps calcium absorption."),
  m("Which disease is caused by deficiency of vitamin C?", ["Scurvy", "Rickets", "Night blindness", "Beriberi"], "Rickets: vitamin D; night blindness: vitamin A; beriberi: vitamin B1."),
  m("Malaria is caused by:", ["Plasmodium (a protozoan)", "A virus", "A bacterium", "A fungus"], "It is spread by female Anopheles mosquitoes."),
];

const humanBody: RawQ[] = [
  m("How many bones are there in an adult human body?", ["206", "212", "300", "196"], "Babies are born with about 270–300 bones, which fuse."),
  m("Which is the largest organ of the human body?", ["Skin", "Liver", "Lungs", "Brain"], "The liver is the largest internal organ."),
  m("Which blood group is called the universal donor?", ["O negative", "AB positive", "A positive", "B negative"], "AB positive is the universal recipient."),
  m("Insulin is produced by the:", ["Pancreas", "Liver", "Kidney", "Thyroid"], "Insulin regulates blood sugar."),
  m("Red blood cells are mainly produced in the:", ["Bone marrow", "Liver", "Spleen", "Heart"], "Red marrow produces blood cells."),
  m("The normal human body temperature is about:", ["37 °C", "40 °C", "35 °C", "98 °C"], "About 98.6 °F."),
  m("Which part of the brain controls balance and coordination?", ["Cerebellum", "Cerebrum", "Medulla", "Hypothalamus"], "The cerebrum handles thinking; the medulla controls breathing and heartbeat."),
  m("The smallest bone in the human body is the:", ["Stapes (in the ear)", "Femur", "Radius", "Patella"], "The femur (thigh bone) is the largest."),
  m("How many chambers does the human heart have?", ["4", "2", "3", "5"], "Two atria and two ventricles."),
];

const instruments: RawQ[] = [
  m("A barometer measures:", ["Atmospheric pressure", "Temperature", "Humidity", "Wind speed"], "Falling pressure often signals bad weather."),
  m("A hygrometer measures:", ["Humidity", "Pressure", "Altitude", "Sound"], "Relative humidity of air."),
  m("A seismograph records:", ["Earthquakes", "Rainfall", "Air pressure", "Heartbeats"], "It records ground vibrations."),
  m("An ammeter measures:", ["Electric current", "Voltage", "Resistance", "Power"], "A voltmeter measures voltage."),
  m("A lactometer is used to test the purity of:", ["Milk", "Water", "Honey", "Oil"], "It measures the density of milk."),
  m("A sphygmomanometer measures:", ["Blood pressure", "Body temperature", "Heart rate only", "Blood sugar"], "Readings are in mm of mercury."),
  m("An anemometer measures:", ["Wind speed", "Rainfall", "Humidity", "Earthquakes"], "A rain gauge measures rainfall."),
  m("A pyrometer measures:", ["Very high temperatures", "Low pressures", "Radioactivity", "Light intensity"], "Used in furnaces."),
];

const units: RawQ[] = [
  m("The SI unit of energy is the:", ["Joule", "Watt", "Newton", "Calorie"], "Watt is the unit of power (J/s)."),
  m("The SI unit of power is the:", ["Watt", "Joule", "Volt", "Ampere"], "1 W = 1 J/s."),
  m("The SI unit of pressure is the:", ["Pascal", "Bar", "Atmosphere", "Newton"], "1 Pa = 1 N/m²."),
  m("Light year is a unit of:", ["Distance", "Time", "Speed", "Light intensity"], "The distance light travels in one year."),
  m("The SI unit of temperature is the:", ["Kelvin", "Celsius", "Fahrenheit", "Rankine"], "0 K is absolute zero."),
  m("The unit of electrical resistance is the:", ["Ohm", "Volt", "Farad", "Henry"], "Farad: capacitance; henry: inductance."),
  m("One horsepower is approximately:", ["746 watts", "1000 watts", "100 watts", "550 watts"], "1 hp ≈ 746 W."),
  m("The unit of frequency is the:", ["Hertz", "Decibel", "Tesla", "Weber"], "Decibel measures sound level; tesla measures magnetic flux density."),
];

const space: RawQ[] = [
  m("Which is the largest planet in the Solar System?", ["Jupiter", "Saturn", "Earth", "Neptune"], "Jupiter is a gas giant."),
  m("Which planet is closest to the Sun?", ["Mercury", "Venus", "Earth", "Mars"], "Mercury has no moons."),
  m("Which planet is known for its prominent rings?", ["Saturn", "Jupiter", "Mars", "Venus"], "Other giants have faint rings too."),
  m("ISRO's headquarters is in:", ["Bengaluru", "Sriharikota", "Thiruvananthapuram", "Ahmedabad"], "Launches take place at Satish Dhawan Space Centre, Sriharikota."),
  m("India's Mars Orbiter Mission is also called:", ["Mangalyaan", "Chandrayaan", "Aditya", "Gaganyaan"], "Launched in 2013; reached Mars orbit in 2014."),
  m("Chandrayaan-3 landed near the Moon's:", ["South pole region", "North pole", "Equator", "Far side centre"], "It landed in August 2023, a first near the lunar south pole."),
  m("The hottest planet in the Solar System is:", ["Venus", "Mercury", "Mars", "Jupiter"], "Venus's thick CO₂ atmosphere traps heat."),
  m("A light year is about:", ["9.46 trillion km", "300,000 km", "150 million km", "1 billion km"], "150 million km is roughly the Earth–Sun distance (1 AU)."),
];

const environment: RawQ[] = [
  m("The ozone layer protects Earth from:", ["Ultraviolet radiation", "Infrared radiation", "Meteors", "Acid rain"], "Ozone absorbs most harmful UV-B and UV-C."),
  m("Which gas is the main contributor to the greenhouse effect from human activity?", ["Carbon dioxide", "Oxygen", "Nitrogen", "Argon"], "Methane and nitrous oxide are also important."),
  m("Chlorofluorocarbons (CFCs) are harmful mainly because they:", ["Deplete the ozone layer", "Cause earthquakes", "Increase oxygen", "Cause tides"], "The Montreal Protocol phased them out."),
  m("Acid rain is mainly caused by:", ["Sulphur dioxide and nitrogen oxides", "Carbon monoxide", "Oxygen", "Water vapour"], "They form sulphuric and nitric acids in the atmosphere."),
  m("Biodiversity hotspots in India include:", ["The Western Ghats and the Himalaya", "The Thar Desert only", "The Deccan Plateau only", "The Gangetic plains only"], "India has parts of four hotspots."),
  m("Which is a renewable source of energy?", ["Solar energy", "Coal", "Petroleum", "Natural gas"], "Wind, hydro and biomass are also renewable."),
  m("In a food chain, organisms that make their own food are called:", ["Producers", "Consumers", "Decomposers", "Predators"], "Plants are producers."),
  m("The Paris Agreement aims to limit global warming to well below:", ["2 °C above pre-industrial levels", "5 °C", "0.5 °C", "10 °C"], "With efforts to limit it to 1.5 °C."),
];

const subject: RawSubject = {
  physics: topic(physics, { intro: "Physics basics: units, laws of motion, light, sound and electricity." }),
  chemistry: topic(chemistry, { intro: "Chemistry basics: elements, compounds, formulas, acids and bases." }),
  biology: topic(biology, { intro: "Biology basics: cells, plants, vitamins and diseases." }),
  "human-body": topic(humanBody, { intro: "Facts about the human body's organs and systems." }),
  "scientific-instruments": topic(instruments, { intro: "Scientific instruments and what they measure." }),
  "units-and-measurements": topic(units, { intro: "SI units and common units of measurement." }),
  "space-science": topic(space, { intro: "The Solar System and India's space programme." }),
  "environment-and-ecology": topic(environment, { intro: "Environment and ecology: pollution, climate change, biodiversity and energy." }),
};
export default subject;
