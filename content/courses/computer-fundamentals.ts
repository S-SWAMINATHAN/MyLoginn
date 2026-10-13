import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "computer-fundamentals", title: "Computer Fundamentals", category: "IT Foundations", track: "essential-it-skills", level: "Beginner", weeks: 2,
  description: "Understand how computers work: hardware components, the CPU, memory and storage, how data is represented in binary, input and output devices, software types and how a program runs, with no prior IT knowledge needed.",
  audience: "Absolute beginners, school and college students and career changers starting an IT career.",
  objectives: ["Name the main hardware components and what each does", "Explain how the CPU, RAM and storage work together", "Convert between decimal and binary and describe bits, bytes and text encoding", "Distinguish system software, application software and firmware", "Describe what happens from pressing power to running an app", "Choose sensible computer specifications for a task"],
  tags: ["Computer Basics", "Hardware", "Binary", "IT Foundations"], relatedSlugs: ["operating-systems-fundamentals", "networking-fundamentals"],
  modules: [
    { title: "Hardware", summary: "The physical parts of a computer.", lessons: [
      L("Inside a computer: the main components", 13,
`## The big picture

A computer is a machine that **takes input, processes it, stores it and produces output**. Every computer, from a phone to a data-centre server, follows this model.

## Main components

| Component | Job | Everyday analogy |
|---|---|---|
| **CPU (processor)** | Executes instructions | The brain |
| **RAM (memory)** | Fast, temporary workspace for running programs | A desk |
| **Storage (SSD or HDD)** | Permanent storage of files and programs | A filing cabinet |
| **Motherboard** | Connects all parts | The road network |
| **GPU** | Handles graphics and parallel maths | A specialist artist |
| **Power supply** | Converts mains power to usable voltages | The heart |
| **Cooling** | Removes heat | Air conditioning |

## Input, output and ports

- **Input devices:** keyboard, mouse, touchscreen, microphone, camera, scanner.
- **Output devices:** monitor, speakers, printer, headphones.
- **Ports:** USB-A, USB-C, HDMI, Ethernet, audio jack, Thunderbolt connect devices to the computer.

## Types of computers

Desktop, laptop, tablet, smartphone, server, workstation, embedded systems (in cars and appliances), and supercomputers. They differ in size, power, portability and price, but share the same basic parts.

## Practice

Open your computer's system information (on Windows search "System Information", on macOS "About This Mac") and note the processor, memory and storage sizes.`,
        [q("Which component is the computer's temporary working space for running programs?", ["Hard disk", "RAM", "Motherboard", "Power supply"], 1, "RAM is the fast, temporary workspace for active programs and data."), q("Which device is an output device?", ["Keyboard", "Microphone", "Monitor", "Scanner"], 2, "A monitor displays output; the others send input."), q("The motherboard's role is to:", ["Store files permanently", "Connect and let all components communicate", "Cool the CPU", "Print documents"], 1, "It is the main circuit board that connects every component.")],
        ["A computer takes input, processes it, stores data and produces output using a few key components.", "Like an office: the CPU is the worker, RAM the desk, storage the cabinet.", [["Process", "CPU and GPU", "Execute instructions"], ["Remember", "RAM and storage", "Temporary and permanent"], ["Connect", "Motherboard and ports", "Move data between parts"]], "Know what each part does to understand performance and troubleshooting.", ["CPU processes", "RAM is temporary", "Storage is permanent"], "Confusing storage size with memory size when buying a computer."]),
      L("The CPU, memory and storage in detail", 14,
`## The CPU

The **CPU (central processing unit)** executes instructions in a repeating cycle: **fetch** an instruction from memory, **decode** it, **execute** it, then store the result.

Key specifications:

- **Clock speed** (GHz): billions of cycles per second. Higher is faster for the same design, but not the only factor.
- **Cores:** independent processing units. A 4-core CPU can work on four tasks at once.
- **Threads:** a core can handle two threads with hyper-threading (SMT).
- **Cache:** tiny, very fast memory on the CPU (L1, L2, L3) that holds frequently used data.

## RAM

**RAM (random access memory)** holds the programs and data in use now. It is **volatile**: when power is off, its contents are lost. More RAM lets you keep more programs open without slowing down. When RAM is full, the operating system moves data to disk (**swap or paging file**), which is much slower.

## Storage

| Type | How it works | Speed | Notes |
|---|---|---|---|
| **HDD** | Spinning magnetic disks | Slow | Cheap, large, fragile |
| **SSD (SATA)** | Flash memory, no moving parts | Fast | Common upgrade |
| **NVMe SSD** | Flash over PCIe | Very fast | Modern laptops and PCs |

Storage is **non-volatile**: files stay when power is off.

## The memory hierarchy

Speed and cost decrease down this list while capacity grows: **CPU registers, cache, RAM, SSD, HDD, network or cloud storage**. Computers keep what they need now in the faster, smaller levels.

## Practice

A student's laptop has 4 GB RAM and a slow HDD and feels sluggish with many browser tabs. Suggest the two most effective upgrades and explain why.`,
        [q("Which memory is lost when power is switched off?", ["SSD", "HDD", "RAM", "NVMe drive"], 2, "RAM is volatile."), q("A CPU with 8 cores can:", ["Run only one task", "Work on several tasks at once", "Store 8 TB", "Run without RAM"], 1, "Multiple cores process several tasks in parallel."), q("The fetch-decode-execute cycle describes:", ["How a CPU runs instructions", "How a printer works", "How Wi-Fi works", "How a screen refreshes"], 0, "The CPU repeatedly fetches, decodes and executes instructions.")],
        ["The CPU runs instructions from RAM while storage keeps data permanently.", "Like a chef (CPU) using a counter (RAM) while ingredients stay in the pantry (storage).", [["CPU", "Fetch, decode, execute", "Cores and clock speed"], ["RAM", "Fast and volatile", "Programs in use"], ["Storage", "Slow and permanent", "SSD faster than HDD"]], "Faster layers are smaller and costlier, so computers move data between them.", ["More RAM helps multitasking", "SSDs beat HDDs for speed", "Cache speeds the CPU"], "Believing a higher GHz number alone makes a CPU better."]),
      L("Choosing a computer for a task", 12,
`## Match hardware to need

| Use case | Priorities | Suggested starting point |
|---|---|---|
| **Study, browsing, documents** | Battery, price, 8 GB RAM, SSD | Mid-range laptop, 8 GB RAM, 256 GB SSD |
| **Programming and web development** | RAM, SSD, good CPU | 16 GB RAM, 512 GB SSD, 6+ cores |
| **Data analysis and VMs** | RAM, many cores | 16 to 32 GB RAM |
| **Video editing and design** | CPU, GPU, RAM, colour-accurate display | 32 GB RAM, dedicated GPU |
| **Gaming** | GPU first, then CPU and fast SSD | Dedicated GPU, 16 GB RAM |
| **Server or home lab** | Reliability, RAM, storage, network | Many cores, ECC memory if possible |

## Reading a specification line

"Intel Core i5, 16 GB DDR4, 512 GB NVMe SSD, 15.6-inch FHD, 1.7 kg, 8 hours battery" tells you: a mid-range processor, enough memory for multitasking, fast storage, a Full HD screen, moderate weight and reasonable battery life.

## Other factors

- **Operating system** support for the software you need.
- **Ports** and Wi-Fi standard (Wi-Fi 6 or 6E).
- **Upgradability:** can you add RAM or storage later?
- **Warranty and service** availability.
- **Total cost of ownership**, not just the purchase price.

## Maintaining a computer

Keep the system updated, back up data (3-2-1 rule: three copies, two media types, one off-site), avoid blocking vents, and use antivirus and a firewall.

## Practice

A friend wants a laptop for Python programming and Zoom classes with a ₹55,000 budget. List the five specifications you would insist on.`,
        [q("Which specification matters most for video editing?", ["Printer type", "CPU, GPU and RAM", "Mouse colour", "Keyboard layout only"], 1, "Editing is heavy on processing and graphics power and memory."), q("The 3-2-1 backup rule means:", ["3 copies, 2 media types, 1 off-site", "3 disks, 2 PCs, 1 phone", "3 days, 2 weeks, 1 month", "3 passwords, 2 users, 1 admin"], 0, "Keep three copies of data on two kinds of media, with one stored off-site."), q("Why consider upgradability when buying?", ["To add RAM or storage later and extend the life of the device", "To change the logo", "To avoid updates", "It does not matter"], 0, "Upgradable machines can stay useful longer.")],
        ["Pick hardware by what you do with the computer, not by the biggest numbers.", "Like choosing a vehicle: a delivery van and a sports car are both fine for different jobs.", [["Need", "Study, code, edit, game", "Define the task"], ["Match", "RAM, CPU, GPU, storage", "Prioritise the right part"], ["Maintain", "Updates and backups", "3-2-1 rule"]], "Right-sizing hardware saves money and frustration.", ["Programming needs RAM and SSD", "Check upgradability", "Back up with 3-2-1"], "Overspending on a gaming GPU for a student who only writes documents."]),
    ] },
    { title: "Data, Software and Starting Up", summary: "Binary, software types and what happens at power on.", lessons: [
      L("Binary, bits and bytes", 15,
`## Why binary

Computers use electrical circuits that are either **on or off**. We write these two states as **1 and 0**. Everything (numbers, text, images, music) is stored as patterns of ones and zeros.

## Units

| Unit | Size |
|---|---|
| **Bit** | One binary digit |
| **Byte** | 8 bits |
| **KB** | 1,024 bytes |
| **MB** | 1,024 KB |
| **GB** | 1,024 MB |
| **TB** | 1,024 GB |

(Storage makers often use 1,000 instead of 1,024, which is why a "500 GB" drive shows as about 465 GB in the operating system.)

## Binary to decimal

Each position is a power of two, from the right: 1, 2, 4, 8, 16, 32, 64, 128.

\`\`\`
1011 (binary) = 1x8 + 0x4 + 1x2 + 1x1 = 11 (decimal)
\`\`\`

## Decimal to binary

Repeatedly divide by 2 and read the remainders from bottom to top.

\`\`\`
13 / 2 = 6 remainder 1
 6 / 2 = 3 remainder 0
 3 / 2 = 1 remainder 1
 1 / 2 = 0 remainder 1   ->  13 = 1101
\`\`\`

## Text and other data

- **ASCII** maps characters to numbers: "A" is 65 (01000001). **Unicode (UTF-8)** extends this to every language, including Tamil and emoji.
- **Images** are grids of pixels, each with colour numbers (red, green, blue 0 to 255).
- **Hexadecimal** (base 16, digits 0-9 and A-F) is a compact way to write binary: 255 decimal = FF.

## Practice

Convert 45 to binary and 10010 to decimal, then compute how many bytes a 3-character ASCII word needs.`,
        [q("How many bits are in a byte?", ["4", "8", "16", "32"], 1, "A byte is 8 bits."), q("What is 1011 in binary as a decimal number?", ["9", "10", "11", "13"], 2, "8 + 0 + 2 + 1 = 11."), q("Which encoding can represent Tamil text and emoji?", ["Unicode (UTF-8)", "Plain Morse", "Only ASCII", "Binary coded decimal only"], 0, "Unicode covers virtually all writing systems and emoji.")],
        ["Computers store everything as ones and zeros, grouped into bytes.", "Like a row of light switches: each pattern of on and off means a number or a letter.", [["Bit", "A 0 or 1", "Smallest unit"], ["Byte", "8 bits", "256 values"], ["Encode", "Numbers, text, images", "ASCII, Unicode, pixels"]], "All data is binary patterns with an agreed meaning.", ["8 bits make a byte", "Convert with powers of two", "Unicode supports every language"], "Mixing up bits and bytes when reading speeds and file sizes."]),
      { ...L("Challenge: decimal to binary", 12,
`## Your task

Practise the division method in code. Write a program that reads a non-negative whole number and prints its binary form.

## Rules

- Read one integer from the input.
- Print its binary representation **without** a leading \`0b\` prefix.
- For 0 print \`0\`.

Try to use the repeated division method from the lesson rather than only a built-in, and check your answer on paper for a small number like 13 (which is 1101).`,
        [q("13 in binary is:", ["1011", "1101", "1110", "1001"], 1, "13 = 8 + 4 + 1 = 1101."), q("Reading remainders for binary conversion goes:", ["Top to bottom", "Bottom to top", "Random", "Only the first"], 1, "The last remainder is the most significant bit, so read from the bottom up."), q("What is the binary of 0?", ["0", "1", "00 only", "Not possible"], 0, "Zero is written 0.")],
        ["Divide by two repeatedly and collect the remainders to get the binary digits.", "Like peeling a number into powers of two, one layer at a time.", [["Divide", "n divided by 2", "Keep the remainder"], ["Collect", "Remainders in order", "Read bottom to top"], ["Print", "The binary string", "Handle zero"]], "A loop of divide and remainder converts any whole number.", ["Use n % 2 for the bit", "Use n // 2 to continue", "Handle 0 separately"], "Forgetting to reverse the collected remainders."]),
        challenge: pyChallenge("Decimal to binary", "Read one non-negative integer and print its binary representation without any prefix. For 0 print 0.", "n = int(input())\n# build the binary string using repeated division by 2\n",
          [{ input: "13", expected: "1101" }, { input: "0", expected: "0" }, { input: "255", expected: "11111111", hidden: true }, { input: "64", expected: "1000000", hidden: true }],
          ["Handle n == 0 first.", "Use a while loop: bit = n % 2, then n //= 2.", "Build the string by putting each new bit in front."],
          "n = int(input())\nif n == 0:\n    print(0)\nelse:\n    bits = ''\n    while n > 0:\n        bits = str(n % 2) + bits\n        n //= 2\n    print(bits)",
          "Each pass takes the remainder as the next bit (placed in front) and halves the number until it reaches zero.") },
      L("Software types and how a computer starts", 14,
`## Types of software

| Type | Purpose | Examples |
|---|---|---|
| **System software** | Runs the machine and provides services | Operating system (Windows, Linux, macOS, Android), device drivers, utilities |
| **Application software** | Helps users do tasks | Browser, Word, Excel, games, WhatsApp |
| **Programming software** | Helps developers build software | Compilers, interpreters, editors, debuggers |
| **Firmware** | Software stored in hardware | BIOS/UEFI, router firmware |
| **Middleware** | Connects applications | Message queues, databases |

## Open source and proprietary

**Open-source software** (Linux, Firefox, VS Code) has publicly available source code with a licence that allows use and modification. **Proprietary software** (Windows, Microsoft Office) is owned by a company with licence terms. **Freeware** is free to use; **SaaS** is software delivered as a subscription service over the web.

## What happens when you press the power button

1. **Power on:** the power supply feeds the motherboard.
2. **Firmware (BIOS or UEFI)** starts and runs **POST (power-on self-test)** to check CPU, memory and devices.
3. The firmware finds a **boot device** and loads the **bootloader**.
4. The bootloader loads the **operating system kernel** into RAM.
5. The OS starts services, loads drivers and shows the login screen.
6. You open an application: the OS copies the program from storage into RAM and the CPU begins executing it.

## Compiled and interpreted programs

A **compiler** converts source code into machine code before running (C, Go). An **interpreter** executes code line by line at run time (Python, JavaScript). Many languages mix both, using a virtual machine (Java).

## Practice

Classify each: Ubuntu, Google Chrome, GCC, the BIOS, VS Code, and say whether each is system, application, programming software or firmware.`,
        [q("What is the first software step after power on?", ["The browser opens", "Firmware runs POST and finds a boot device", "A game loads", "The printer starts"], 1, "Firmware initialises hardware and starts the boot process."), q("Which is system software?", ["An operating system", "A spreadsheet", "A game", "A web page"], 0, "Operating systems manage hardware and services."), q("Which language style runs code line by line at run time?", ["Compiled only", "Interpreted", "Hardware", "Binary only"], 1, "Interpreters execute code as it runs.")],
        ["Software ranges from firmware and operating systems to applications, and a boot sequence loads them in order.", "Like opening a shop: wiring first, then the manager, then the staff serving customers.", [["Firmware", "BIOS or UEFI, POST", "Starts the hardware"], ["Operating system", "Kernel, drivers, services", "Runs the machine"], ["Applications", "Loaded into RAM", "Used by people"]], "Layers of software each prepare the next layer.", ["Firmware starts first", "The OS loads next", "Apps run in RAM"], "Thinking the operating system and the hardware are the same thing."]),
    ] },
  ],
  final: [
    q("Which component is the computer's brain?", ["CPU", "RAM", "Monitor", "Cable"], 0, "The CPU executes instructions."),
    q("RAM is best described as:", ["Volatile working memory", "Permanent storage", "A display", "A network card"], 0, "Contents vanish without power."),
    q("Which is non-volatile storage?", ["SSD", "RAM", "CPU cache", "Registers"], 0, "SSDs keep data without power."),
    q("Which is typically fastest storage?", ["NVMe SSD", "HDD", "Tape", "CD"], 0, "NVMe over PCIe is very fast."),
    q("A byte is:", ["8 bits", "4 bits", "10 bits", "16 bits"], 0, "Eight bits."),
    q("Binary 1010 equals:", ["8", "9", "10", "12"], 2, "8 + 2 = 10."),
    q("Decimal 6 in binary is:", ["101", "110", "111", "100"], 1, "4 + 2 = 110."),
    q("Which encoding covers Tamil and emoji?", ["Unicode", "Only ASCII", "Morse", "None"], 0, "Unicode."),
    q("Which is application software?", ["A spreadsheet", "BIOS", "A device driver", "The kernel"], 0, "Spreadsheets help users do tasks."),
    q("Firmware is:", ["Software stored in hardware such as BIOS", "A web browser", "A game", "A spreadsheet"], 0, "Firmware lives on the device."),
    q("POST stands for:", ["Power-on self-test", "Program output system test", "Primary operating system task", "Portable online storage tool"], 0, "A hardware check at startup."),
    q("Which is open-source?", ["Linux", "Windows", "Proprietary game", "Closed firmware only"], 0, "Linux source code is public."),
    q("Which are input devices? (select all that apply)", ["Keyboard", "Microphone", "Scanner", "Speaker"], [0, 1, 2], "Speakers are output."),
    q("The 3-2-1 backup rule means:", ["3 copies, 2 media, 1 off-site", "3 PCs, 2 phones, 1 cloud", "3 hours, 2 days, 1 week", "3 users"], 0, "A resilient backup strategy."),
    q("A compiler:", ["Converts source code to machine code before running", "Plays music", "Connects to Wi-Fi", "Prints pages"], 0, "Compilation happens before execution."),
  ],
  project: { title: "Capstone: specify a computer", brief: "Choose three people (a student, a video editor, a small shop owner). For each, recommend a computer with CPU, RAM, storage, display and OS, explain each choice in one sentence, estimate a budget, and add a backup plan following the 3-2-1 rule." },
});
