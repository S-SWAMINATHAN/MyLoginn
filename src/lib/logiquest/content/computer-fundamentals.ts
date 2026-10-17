import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";
import { numberSystems } from "./technical/generated";

const basics: RawQ[] = [
  m("Who is known as the father of the computer?", ["Charles Babbage", "Alan Turing", "John von Neumann", "Bill Gates"], "Charles Babbage designed the Analytical Engine, a mechanical general-purpose computer."),
  m("The brain of the computer is the:", ["CPU", "RAM", "Hard disk", "Monitor"], "The Central Processing Unit executes instructions."),
  m("Which part of the CPU performs arithmetic and logical operations?", ["ALU", "Control unit", "Registers", "Cache"], "The Arithmetic Logic Unit does calculations and comparisons."),
  m("The control unit of the CPU:", ["Directs the operation of the processor and other components", "Stores data permanently", "Performs arithmetic", "Displays output"], "It fetches, decodes and coordinates execution of instructions."),
  m("What does IPO stand for in computing?", ["Input–Process–Output", "Internet Protocol Output", "Integrated Processing Order", "Initial Public Offering"], "Computers take input, process it and produce output."),
  m("A computer that processes continuous physical quantities is a(n):", ["Analog computer", "Digital computer", "Hybrid computer", "Supercomputer"], "Analog computers measure continuously varying data; digital computers use discrete values."),
  m("The fastest type of computer is the:", ["Supercomputer", "Mainframe", "Minicomputer", "Microcomputer"], "Supercomputers are used for weather forecasting, simulation and research."),
  m("Which type of computer is used by large organisations to process bulk data such as bank transactions?", ["Mainframe", "Microcomputer", "Embedded system", "Tablet"], "Mainframes support many simultaneous users and transactions."),
  m("The physical parts of a computer are called:", ["Hardware", "Software", "Firmware", "Data"], "Software is the set of programs; firmware is software stored in hardware (ROM)."),
];

const generations: RawQ[] = [
  m("First-generation computers used:", ["Vacuum tubes", "Transistors", "Integrated circuits", "Microprocessors"], "ENIAC and UNIVAC used vacuum tubes."),
  m("Second-generation computers used:", ["Transistors", "Vacuum tubes", "VLSI chips", "Artificial intelligence"], "Transistors replaced vacuum tubes in the late 1950s."),
  m("Integrated circuits were introduced in which generation?", ["Third", "Second", "Fourth", "First"], "ICs defined the third generation (1960s–70s)."),
  m("Fourth-generation computers are based on:", ["Microprocessors (VLSI)", "Vacuum tubes", "Transistors only", "Relays"], "The microprocessor put the whole CPU on one chip."),
  m("Which was one of the first general-purpose electronic digital computers?", ["ENIAC", "Pentium", "IBM PC", "Apple II"], "ENIAC was completed in 1945."),
  m("Fifth-generation computing is associated with:", ["Artificial intelligence and parallel processing", "Punched cards", "Vacuum tubes", "Magnetic drums"], "The fifth generation focuses on AI and advanced parallelism."),
  m("Which language was mainly used to program first-generation computers?", ["Machine language", "Python", "C", "Java"], "Programs were written in binary machine code."),
];

const hardware: RawQ[] = [
  m("The main circuit board of a computer is the:", ["Motherboard", "Processor", "Hard disk", "Power supply"], "The motherboard connects the CPU, memory and expansion cards."),
  m("Clock speed of a processor is measured in:", ["Hertz (GHz)", "Bytes", "Pixels", "Watts"], "A 3 GHz CPU completes three billion clock cycles per second."),
  m("A multi-core processor has:", ["Several processing units on one chip", "Several motherboards", "More RAM", "A larger hard disk"], "Each core can execute instructions independently."),
  m("Which component supplies regulated power to the computer?", ["SMPS (power supply unit)", "UPS only", "CPU", "Monitor"], "The switched-mode power supply converts AC mains to DC voltages."),
  m("A GPU is mainly designed for:", ["Graphics and highly parallel computations", "Storing files", "Network routing", "Printing"], "GPUs have thousands of small cores used for graphics and AI workloads."),
  m("Which port is commonly used today to connect monitors with both video and audio?", ["HDMI", "PS/2", "Serial", "VGA only"], "HDMI carries digital video and audio."),
  m("Which bus carries the addresses of memory locations?", ["Address bus", "Data bus", "Control bus", "USB"], "The address bus width determines how much memory can be addressed."),
];

const software: RawQ[] = [
  m("Software that manages the computer's hardware is called:", ["System software", "Application software", "Utility only", "Malware"], "Operating systems and device drivers are system software."),
  m("A word processor is an example of:", ["Application software", "System software", "Firmware", "An operating system"], "Application software helps users perform tasks."),
  m("Which program translates an entire high-level program into machine code before execution?", ["Compiler", "Interpreter", "Assembler", "Linker"], "An interpreter translates and executes line by line; an assembler translates assembly language."),
  m("Software that is free to use, study and modify, with its source code available, is:", ["Open-source software", "Proprietary software", "Shareware", "Freeware only"], "Examples: Linux, Firefox, LibreOffice."),
  m("A device driver is:", ["Software that lets the OS communicate with a hardware device", "A person who installs hardware", "A type of virus", "A cable"], "Drivers translate generic OS requests into device-specific commands."),
  m("Antivirus software is an example of:", ["Utility software", "Application suite", "Firmware", "Programming language"], "Utilities help maintain and protect the system."),
  m("Malware that demands payment to unlock files is called:", ["Ransomware", "Adware", "Spyware", "Worm"], "Ransomware encrypts data and demands a ransom."),
];

const memory: RawQ[] = [
  m("Which memory is volatile?", ["RAM", "ROM", "Hard disk", "Flash drive"], "RAM loses its contents when power is switched off."),
  m("Which is the fastest memory?", ["CPU registers", "Cache", "RAM", "Hard disk"], "Speed order: registers > cache > RAM > SSD > HDD."),
  m("1 kilobyte (KB) is equal to:", ["1024 bytes", "1000 bits", "1024 bits", "100 bytes"], "In binary units 1 KB = 2¹⁰ bytes (strictly 1 KiB)."),
  m("How many bits are in a byte?", ["8", "4", "16", "2"], "A nibble is 4 bits; a byte is 8 bits."),
  m("Which memory stores the BIOS/UEFI firmware?", ["ROM (flash)", "RAM", "Cache", "Registers"], "Firmware is kept in non-volatile ROM or flash."),
  m("Cache memory is placed between:", ["The CPU and main memory", "RAM and the hard disk", "The keyboard and CPU", "The monitor and GPU"], "Cache holds frequently used data to reduce memory access time."),
  m("Which storage device has no moving parts?", ["SSD", "HDD", "Floppy disk", "Magnetic tape"], "Solid-state drives use flash memory."),
  m2("How many bytes are in 2 MB (binary units)?", ["2,097,152", "2,000,000", "2,048", "1,048,576"], "1 MB = 1024 × 1024 = 1,048,576 bytes, so 2 MB = 2,097,152 bytes.", { check: "2*1024*1024" }),
];

const io: RawQ[] = [
  m("Which of these is an input device?", ["Scanner", "Printer", "Monitor", "Speaker"], "Scanners capture images as input."),
  m("Which of these is an output device?", ["Plotter", "Mouse", "Microphone", "Webcam"], "Plotters draw large-format output."),
  m("Which device reads the pencil marks on answer sheets?", ["OMR", "OCR", "MICR", "Barcode reader"], "Optical Mark Recognition detects marks in fixed positions."),
  m("Banks read cheque numbers with:", ["MICR", "OMR", "OCR", "Light pen"], "Magnetic Ink Character Recognition reads magnetic ink characters."),
  m("A touch screen is:", ["Both an input and an output device", "Only an input device", "Only an output device", "A storage device"], "It displays output and accepts touch input."),
  m("Resolution of a monitor is measured in:", ["Pixels", "Hertz", "Bits", "Dots per minute"], "e.g. 1920 × 1080 pixels."),
  m("Which printer is an impact printer?", ["Dot-matrix printer", "Laser printer", "Inkjet printer", "Thermal printer"], "Dot-matrix pins strike a ribbon on the paper."),
];

const internet: RawQ[] = [
  m("What does WWW stand for?", ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"], "The web was invented by Tim Berners-Lee in 1989."),
  m("What is a URL?", ["The address of a resource on the web", "A programming language", "An email protocol", "A web browser"], "Uniform Resource Locator, e.g. https://example.com/page."),
  m("Which of these is a web browser?", ["Mozilla Firefox", "Google Search", "Microsoft Word", "Windows"], "Browsers display web pages; search engines find them."),
  m("In an email address user@example.com, 'example.com' is the:", ["Domain name", "User name", "Protocol", "Port"], "The part after @ identifies the mail domain."),
  m("What does 'Bcc' mean in email?", ["Blind carbon copy — recipients are hidden from others", "Basic carbon copy", "Backup copy", "Bulk content copy"], "Bcc recipients are not visible to other recipients."),
  m("HTML is used to:", ["Structure web pages", "Style web pages", "Store databases", "Send email"], "HTML structures content; CSS styles it; JavaScript adds behaviour."),
  m("An ISP is:", ["An Internet Service Provider", "An Internal System Program", "An Input Signal Processor", "An Integrated Software Package"], "ISPs provide internet access."),
];

const msOffice: RawQ[] = [
  m("Which shortcut copies selected text in most Windows applications?", ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + Z"], "Ctrl + V pastes, Ctrl + X cuts, Ctrl + Z undoes."),
  m("In Microsoft Excel, which formula adds the values in cells A1 to A5?", ["=SUM(A1:A5)", "=ADD(A1:A5)", "=TOTAL(A1-A5)", "SUM(A1,A5)"], "Formulas start with = and ranges use a colon."),
  m("In Excel, the intersection of a row and a column is a:", ["Cell", "Sheet", "Workbook", "Range"], "A workbook contains sheets; sheets contain cells."),
  m("Which Excel function returns the largest value in a range?", ["MAX", "LARGE only", "TOP", "HIGH"], "=MAX(B2:B10)."),
  m("Which Microsoft Office application is mainly used for presentations?", ["PowerPoint", "Word", "Excel", "Access"], "PowerPoint creates slide shows."),
  m("Ctrl + Z is used to:", ["Undo the last action", "Redo", "Save", "Close"], "Ctrl + Y redoes."),
  m("In Excel, what does $A$1 represent?", ["An absolute cell reference", "A relative reference", "A currency value", "A named range"], "Dollar signs keep the row and column fixed when the formula is copied."),
  m("Mail merge in Word is used to:", ["Create personalised letters for many recipients from a data source", "Send email only", "Merge two documents", "Check spelling"], "Fields such as name and address are filled from a list."),
];

const abbreviations: RawQ[] = [
  m("What does RAM stand for?", ["Random Access Memory", "Read Access Memory", "Rapid Action Memory", "Run Access Module"], "RAM can be read and written in any order."),
  m("What does CPU stand for?", ["Central Processing Unit", "Central Program Unit", "Computer Processing Unit", "Control Processing Unit"], "The CPU executes instructions."),
  m("What does USB stand for?", ["Universal Serial Bus", "Universal System Bus", "Unified Serial Board", "User Serial Bus"], "USB connects peripherals."),
  m("What does BIOS stand for?", ["Basic Input/Output System", "Binary Input Output Software", "Basic Integrated Operating System", "Boot Input Output Sequence"], "BIOS (and its successor UEFI) initialises hardware at start-up."),
  m("What does HTTP stand for?", ["HyperText Transfer Protocol", "HighText Transfer Protocol", "HyperText Transmission Process", "Home Tool Transfer Protocol"], "HTTP is the protocol of the web."),
  m("What does PDF stand for?", ["Portable Document Format", "Printable Data File", "Public Document Format", "Personal Data Folder"], "Created by Adobe for device-independent documents."),
  m("What does ALU stand for?", ["Arithmetic Logic Unit", "Arithmetic Language Unit", "Advanced Logic Unit", "Array Logic Unit"], "The ALU performs calculations."),
  m("What does GUI stand for?", ["Graphical User Interface", "General User Interface", "Graphical Unified Input", "Guided User Interaction"], "GUIs use windows, icons and menus."),
  m("What does LAN stand for?", ["Local Area Network", "Large Area Network", "Linked Access Network", "Local Access Node"], "A LAN covers a small area such as an office."),
  m("What does SSD stand for?", ["Solid State Drive", "Super Speed Disk", "System Storage Device", "Static Storage Disk"], "SSDs use flash memory."),
];

const subject: RawSubject = {
  "computer-basics": topic(basics, { intro: "A computer accepts input, processes it according to instructions and produces output. Its main parts are the CPU (ALU + control unit + registers), memory, storage and input/output devices." }),
  "generations-of-computers": topic(generations, { intro: "Generations: 1st vacuum tubes (1940s–50s), 2nd transistors, 3rd integrated circuits, 4th microprocessors (VLSI), 5th artificial intelligence and parallel processing." }),
  "computer-hardware": topic(hardware, { intro: "Hardware includes the motherboard, CPU, memory, storage, power supply, expansion cards and peripherals connected through buses and ports." }),
  "computer-software": topic(software, { intro: "Software is divided into system software (OS, drivers, utilities), application software and programming tools (compilers, interpreters, assemblers)." }),
  "number-systems": topic(numberSystems, { intro: "Computers use binary (base 2). Octal (base 8) and hexadecimal (base 16) are compact ways to write binary.", formulas: [{ h: "Conversions", points: ["Decimal → base b: divide repeatedly by b and read remainders upwards", "Base b → decimal: sum of digit × b^position", "Binary ↔ octal: groups of 3 bits; binary ↔ hex: groups of 4 bits", "Two's complement of a negative number: invert the bits of its magnitude and add 1"] }] }),
  "memory-and-storage": topic(memory, { intro: "Memory hierarchy (fast to slow): registers, cache, RAM (primary, volatile), then secondary storage such as SSDs and hard disks (non-volatile).", formulas: [{ h: "Units", points: ["4 bits = 1 nibble, 8 bits = 1 byte", "1 KB = 1024 bytes, 1 MB = 1024 KB, 1 GB = 1024 MB, 1 TB = 1024 GB"] }] }),
  "input-and-output-devices": topic(io, { intro: "Input devices send data to the computer (keyboard, mouse, scanner, microphone, OMR, MICR); output devices present results (monitor, printer, speaker, plotter)." }),
  "internet-and-email": topic(internet, { intro: "The internet is a global network of networks; the web is a service on it made of linked pages accessed with browsers using HTTP/HTTPS." }),
  "ms-office": topic(msOffice, { intro: "Microsoft Office includes Word (documents), Excel (spreadsheets), PowerPoint (presentations), Outlook (email) and Access (databases)." }),
  "computer-abbreviations": topic(abbreviations, { intro: "Common abbreviations appear in almost every computer awareness test; learn them with what they do." }),
};
export default subject;
