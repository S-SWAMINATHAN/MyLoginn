import { L, mk, q } from "./_helpers";

export default mk({
  slug: "operating-systems-fundamentals", title: "Operating Systems Fundamentals", category: "IT Foundations", track: "essential-it-skills", level: "Beginner", weeks: 3,
  description: "Learn what an operating system does: processes and threads, scheduling, memory management, file systems, I/O and device drivers, users and permissions, and how Windows, Linux and macOS differ.",
  audience: "IT beginners, aspiring developers, testers and support engineers who need a solid base before Linux, cloud and DevOps topics.",
  prereq: "Computer Fundamentals is recommended.",
  objectives: ["Explain the main responsibilities of an operating system", "Describe processes, threads and CPU scheduling", "Explain virtual memory, paging and why RAM size matters", "Describe how files, directories and permissions are organised", "Explain the difference between kernel space and user space and system calls", "Compare Windows, Linux and macOS for common tasks"],
  tags: ["Operating Systems", "Processes", "Memory", "File Systems", "Linux", "Windows"], prerequisiteSlugs: ["computer-fundamentals"], relatedSlugs: ["windows-and-linux-fundamentals", "command-line-and-shell-basics"],
  modules: [
    { title: "What an Operating System Does", lessons: [
      L("Roles of an operating system", 12,
`## The manager of the computer

An **operating system (OS)** sits between applications and hardware. Applications do not talk to the disk or the screen directly; they ask the OS, which shares the hardware safely among all programs.

## Core responsibilities

1. **Process management:** start, run, pause and end programs; share the CPU.
2. **Memory management:** give each program memory and keep programs from reading each other's data.
3. **File system management:** organise data on storage as files and folders.
4. **Device management:** control keyboards, disks, printers and network cards through **drivers**.
5. **Security and access control:** users, passwords and permissions.
6. **User interface:** a **GUI** (windows and icons) or **CLI** (command line).
7. **Networking:** connect to other machines and manage connections.

## The kernel

The **kernel** is the core of the OS. It runs in a privileged mode with full hardware access. Everything else (the desktop, shells, applications) runs in **user space** with limited rights. If an app crashes, the kernel keeps the system running.

## System calls

When a program wants to read a file or open a network connection it makes a **system call**, a controlled request to the kernel. Examples: \`open\`, \`read\`, \`write\`, \`fork\`, \`exec\`.

## Common operating systems

| OS | Typical use |
|---|---|
| **Windows** | Desktops, laptops, many business apps |
| **macOS** | Apple computers, creative work and development |
| **Linux** | Servers, cloud, developers, embedded devices |
| **Android** | Phones and tablets (Linux-based) |
| **iOS / iPadOS** | Apple phones and tablets |

## Practice

List three things that would go wrong if every program could directly write to any part of the disk or memory.`,
        [q("Which software component runs with full hardware access?", ["An application", "The kernel", "A browser tab", "A game"], 1, "The kernel runs in privileged mode."), q("A program asks the kernel to read a file using a:", ["Driver update", "System call", "Shortcut", "Macro"], 1, "System calls are the controlled interface to kernel services."), q("Which OS is most common on servers and cloud machines?", ["Linux", "iOS", "Android only", "DOS"], 0, "Linux dominates servers and cloud infrastructure.")],
        ["The OS shares the hardware safely among all programs and gives them simple services.", "Like a building manager who gives each tenant space, keys and utilities without letting them interfere.", [["Manage", "CPU, memory, files, devices", "Fair and safe sharing"], ["Protect", "Users and permissions", "Kernel versus user space"], ["Serve", "System calls and UI", "GUI or command line"]], "The kernel is the trusted core; everything else asks it politely.", ["The OS manages resources", "Apps use system calls", "The kernel is privileged"], "Believing applications control the hardware directly."]),
      L("Processes, threads and scheduling", 15,
`## Programs and processes

A **program** is a file with instructions. A **process** is a program that is running, with its own **memory, open files and state**. Two windows of a browser may be two processes.

## Process states

New, **Ready** (waiting for the CPU), **Running** (on the CPU), **Waiting/Blocked** (waiting for input or disk), **Terminated**. The OS moves processes between these states many times a second.

## Threads

A **thread** is a path of execution inside a process. Threads of the same process **share memory**, so they communicate easily but can interfere with each other. A browser may use one thread for the page and others for downloads.

## CPU scheduling

With few CPU cores and many processes, the **scheduler** decides who runs next. Common ideas:

- **Time slicing (round robin):** each process runs for a short slice (milliseconds), then the next gets a turn, so they appear to run together.
- **Priorities:** important or interactive tasks get the CPU sooner.
- **Preemption:** the OS can interrupt a running process to run a more urgent one.

## Context switching

When the CPU changes process, the OS saves the current state and loads the next. This takes time, so too many processes can lower performance.

## Common problems

- **Deadlock:** two processes each wait for a resource the other holds, so neither proceeds.
- **Starvation:** a low-priority process never gets the CPU.
- **Race condition:** results depend on the unpredictable order of operations on shared data.

## Seeing processes

Windows: Task Manager. Linux and macOS: \`top\`, \`htop\` or \`ps aux\`. You can see CPU use, memory use and each process's ID (PID).

## Practice

Open your task manager. Identify the process using the most memory, and the number of processes running.`,
        [q("What is a process?", ["A file on disk", "A running program with its own memory and state", "A CPU core", "A folder"], 1, "A process is an executing program instance."), q("Threads of the same process:", ["Share memory", "Never communicate", "Run on different computers", "Have separate address spaces always"], 0, "Sharing memory makes communication easy but needs care."), q("Two processes each waiting for a resource held by the other is:", ["Preemption", "Deadlock", "Time slicing", "Caching"], 1, "That circular wait is a deadlock.")],
        ["Processes are running programs, threads run inside them, and the scheduler shares CPU time.", "Like one cashier serving many customers in short turns so everyone feels served.", [["Process", "A running program", "Own memory and state"], ["Thread", "Path inside a process", "Shares process memory"], ["Scheduler", "Chooses who runs", "Time slices and priorities"]], "Switching quickly between tasks creates the illusion of doing many things at once.", ["Processes have own memory", "Threads share memory", "Schedulers use time slices"], "Opening too many heavy programs and not noticing CPU and memory pressure."]),
      L("Memory management and virtual memory", 15,
`## What the OS must do with RAM

- Give each process the memory it needs.
- **Isolate** processes so one cannot read or corrupt another.
- Reclaim memory when processes end.
- Handle running out of RAM gracefully.

## Virtual memory

Each process sees its own **virtual address space**, as if it had large, continuous memory. The OS and hardware map these virtual addresses to **physical RAM**. Benefits: isolation, the ability to run programs larger than RAM and simpler programming.

## Paging

Memory is divided into fixed-size blocks called **pages** (commonly 4 KB). Pages not recently used can be moved to disk in the **swap space or page file**. When a process needs a page that is on disk, a **page fault** occurs and the OS loads it back. Disk is far slower than RAM, so heavy swapping makes a system crawl, called **thrashing**.

## Stack and heap

- The **stack** holds function calls and local variables; it grows and shrinks automatically.
- The **heap** holds dynamically allocated memory; programs allocate and (in languages without garbage collection) must free it.

## Common memory problems

| Problem | Meaning |
|---|---|
| **Memory leak** | A program keeps allocating memory it no longer uses, so usage keeps growing |
| **Out of memory** | The system cannot satisfy requests; the OS may kill a process |
| **Buffer overflow** | Writing beyond a buffer's end, a classic security flaw |

## Choosing RAM

For most people 8 GB is the minimum, 16 GB is comfortable for development and many browser tabs, and servers size memory to their workload. Adding RAM is the best fix when swap usage is constantly high.

## Practice

A machine with 4 GB RAM runs five applications needing 1.5 GB each. Explain what the OS does and what the user experiences.`,
        [q("What is a page fault?", ["A broken disk", "A needed page is not in RAM and must be loaded from disk", "A screen error", "A virus"], 1, "The OS loads the missing page from swap or file."), q("Constant heavy swapping that slows the system is called:", ["Caching", "Thrashing", "Booting", "Compiling"], 1, "Thrashing means the OS spends most time moving pages."), q("A program that keeps allocating memory it no longer uses has a:", ["Memory leak", "Deadlock", "Page table", "Driver bug only"], 0, "Unreleased memory causes growing usage over time.")],
        ["Virtual memory gives each process its own space, mapped to RAM and disk by the OS.", "Like hotel rooms: guests think each room is theirs while the manager decides which real room is used.", [["Isolate", "Virtual address space", "Processes cannot see each other"], ["Page", "4 KB blocks", "Moved between RAM and disk"], ["Pressure", "Swap and thrashing", "Add RAM to fix"]], "Memory management keeps programs safe and the system running when RAM is limited.", ["Virtual memory isolates processes", "Swapping is slow", "Leaks grow over time"], "Ignoring constant swapping and blaming the CPU for slowness."]),
    ] },
    { title: "Files, Users and Platforms", lessons: [
      L("File systems and storage", 14,
`## What a file system does

A **file system** organises data on a disk as **files** (named data) and **directories/folders** (containers), tracks where data sits and stores information such as size, owner, permissions and timestamps.

## Common file systems

| File system | Used by | Notes |
|---|---|---|
| **NTFS** | Windows | Permissions, large files, journaling |
| **FAT32 / exFAT** | USB drives, SD cards | Wide compatibility; FAT32 limits files to 4 GB |
| **ext4** | Linux | Reliable default, journaling |
| **APFS** | macOS and iOS | Snapshots, encryption |
| **XFS, Btrfs, ZFS** | Servers and storage systems | Scale, snapshots |

## Paths

- **Absolute path:** starts from the root: \`C:\\Users\\Asha\\Documents\\notes.txt\` (Windows), \`/home/asha/documents/notes.txt\` (Linux).
- **Relative path:** from the current directory: \`documents/notes.txt\`, \`../photos\`.

Windows uses backslashes and drive letters; Linux and macOS use forward slashes and a single root \`/\`.

## Key ideas

- **Journaling** records changes before applying them, so the file system recovers after a crash.
- **Mounting** attaches a storage device to the directory tree.
- **Links:** a **hard link** is another name for the same data; a **symbolic link** is a pointer to a path.
- **Fragmentation:** files stored in pieces; matters for HDDs but not for SSDs.

## Backups and safety

Deleting a file usually only removes its entry; data may remain until overwritten. Use encryption (BitLocker, FileVault, LUKS) for sensitive data and regular backups.

## Practice

Write the absolute and relative path from /home/asha to /home/asha/projects/web/index.html and one relative path back to /home/asha/downloads.`,
        [q("Which file system is the usual choice on Windows?", ["ext4", "NTFS", "APFS", "XFS"], 1, "NTFS is the standard Windows file system."), q("A relative path is:", ["Always starting from the root", "A location described from the current directory", "A virus", "A drive letter"], 1, "Relative paths depend on the current working directory."), q("What does journaling help with?", ["Faster typing", "Recovering consistently after a crash", "Bigger screens", "Cheaper disks"], 1, "The journal lets the file system repair itself.")],
        ["File systems organise data into files and folders and keep track of where everything is.", "Like a library catalogue that records every book and its shelf.", [["Organise", "Files and directories", "Names, sizes, owners"], ["Locate", "Absolute and relative paths", "Root or current folder"], ["Protect", "Journaling and backups", "Recover after failure"]], "Choose the right file system for compatibility and reliability.", ["Know NTFS, ext4, APFS", "Understand path types", "Back up important data"], "Formatting a USB drive in a file system the target device cannot read."]),
      L("Users, permissions and security basics", 14,
`## Users and groups

An OS identifies who is acting. Each **user account** has a name, a password or other credential and rights. **Groups** collect users so permissions can be assigned together. An **administrator (Windows) or root (Linux/macOS)** can change anything, so use it only when needed (**principle of least privilege**).

## Permissions on Linux and macOS

Each file has an owner, a group and three permission sets: **read (r), write (w), execute (x)** for **owner, group and others**.

\`\`\`
-rwxr-xr--  1 asha staff  1200 Oct 13 notes.sh
 ^^^ owner can read, write, execute
    ^^^ group can read, execute
       ^^^ others can read only
\`\`\`

Numeric form: r=4, w=2, x=1, so \`rwxr-xr--\` is **754**. Change with \`chmod 754 notes.sh\`; change owner with \`chown\`.

## Permissions on Windows

Windows uses **Access Control Lists (ACLs)**: each file or folder lists users and groups with rights such as Read, Write, Modify and Full control. **User Account Control (UAC)** asks before an app makes administrative changes.

## Authentication and security habits

- Use **strong, unique passwords** and a password manager.
- Turn on **multi-factor authentication (MFA)**.
- Keep the OS and apps **updated**.
- Use a **firewall** and trusted **antivirus or endpoint protection**.
- **Encrypt** laptops and phones.
- Do not run unknown software as administrator.

## Practice

Explain what permission value 640 gives to the owner, the group and others, and whether it suits a file with private notes shared with a team.`,
        [q("The permission value 754 means:", ["Owner rwx, group r-x, others r--", "Everyone can write", "Only the owner can read", "No one can execute"], 0, "7 = rwx, 5 = r-x, 4 = r--."), q("The principle of least privilege says:", ["Everyone should be administrator", "Give only the access needed for the task", "Never use passwords", "Share one account"], 1, "Limit rights to reduce damage from mistakes or attacks."), q("Which is a good account security habit?", ["Reusing one password", "Enabling multi-factor authentication", "Disabling updates", "Sharing passwords"], 1, "MFA adds a second proof of identity.")],
        ["Users, groups and permissions decide who can read, change or run each file.", "Like keys in an office: each person gets only the keys they need.", [["Identify", "Users and groups", "Who is acting"], ["Permit", "r, w, x or ACLs", "Owner, group, others"], ["Protect", "Least privilege and MFA", "Updates and encryption"]], "Tight permissions and good habits limit what mistakes and attackers can do.", ["Use least privilege", "Know rwx and numbers", "Turn on MFA"], "Running everyday work as the administrator or root user."]),
      L("Windows, Linux and macOS compared", 13,
`## Side by side

| Area | Windows | Linux | macOS |
|---|---|---|---|
| **Licence** | Proprietary | Mostly open source | Proprietary (built on Unix) |
| **Typical use** | Business PCs, gaming, enterprise software | Servers, cloud, development, embedded | Creative work, development, Apple ecosystem |
| **File system** | NTFS | ext4, XFS, others | APFS |
| **Command line** | PowerShell, cmd | Bash, zsh | zsh (Bash-like) |
| **Package install** | Installers, winget | apt, dnf, pacman | Homebrew, App Store |
| **Customisation** | Moderate | Very high | Limited |
| **Software availability** | Widest desktop apps | Strong for server and dev tools | Strong creative and dev apps |

## Linux distributions

Linux is a kernel; **distributions** package it with tools: **Ubuntu** and **Debian** (beginner and server friendly), **Fedora** and **RHEL** (enterprise), **Arch** (do-it-yourself), **Alpine** (tiny, used in containers).

## Choosing for a career

- **Support and desktop IT:** Windows plus basic Linux.
- **Development:** any, but Linux or macOS give a Unix-like shell; Windows offers **WSL (Windows Subsystem for Linux)**.
- **DevOps, cloud and security:** Linux is essential.
- **QA:** know all three for compatibility testing.

## Virtual machines and dual boot

You can try other systems safely with a **virtual machine** (VirtualBox, VMware, Hyper-V) or **dual boot** (two OSes on one machine). Always back up first.

## Practice

Install Ubuntu in a virtual machine or enable WSL, and run \`uname -a\` and \`lsb_release -a\` (or \`cat /etc/os-release\`) to see your system details.`,
        [q("Which OS family is built on a Unix foundation and uses APFS?", ["Windows", "macOS", "Android only", "DOS"], 1, "macOS is Unix-based and uses APFS."), q("What is Ubuntu?", ["A Linux distribution", "A browser", "A CPU", "A file system"], 0, "Ubuntu is a popular Linux distribution."), q("Why use a virtual machine to try Linux?", ["It lets you experiment safely without changing your main OS", "It speeds up the CPU", "It removes the need for RAM", "It is required by law"], 0, "VMs isolate experiments from your main system.")],
        ["Windows, Linux and macOS share ideas but differ in licences, tools and typical uses.", "Like three car brands: all drive, each suits different roads and drivers.", [["Windows", "Business and gaming", "Widest desktop apps"], ["Linux", "Servers and cloud", "Open source, distributions"], ["macOS", "Creative and development", "Unix-based"]], "Learn the basics of all three; specialise by career path.", ["Linux is essential for DevOps", "WSL brings Linux to Windows", "VMs are safe for practice"], "Assuming one operating system is best for every task."]),
    ] },
  ],
  final: [
    q("Which part of the OS has full hardware access?", ["Kernel", "A browser", "A game", "A shortcut"], 0, "Kernel mode is privileged."),
    q("A program requests OS services through:", ["System calls", "Wallpapers", "Cables", "Passwords"], 0, "System calls."),
    q("A process is:", ["A running program with its own memory", "A folder", "A disk", "A cable"], 0, "A program in execution."),
    q("Threads in one process:", ["Share memory", "Cannot share anything", "Run in other computers", "Are the same as files"], 0, "They share the process's memory."),
    q("Time slicing lets the OS:", ["Share one CPU among many processes", "Increase RAM", "Delete files", "Install drivers"], 0, "Short turns create the illusion of parallelism."),
    q("Deadlock is:", ["Processes waiting on each other forever", "A fast boot", "A file type", "A virus"], 0, "Circular waiting."),
    q("A page fault occurs when:", ["A needed page is not in RAM", "The keyboard fails", "A file is renamed", "The screen turns off"], 0, "The page must be loaded from disk."),
    q("Excessive swapping that slows a system is called:", ["Thrashing", "Caching", "Compiling", "Mounting"], 0, "Thrashing."),
    q("Which is Windows' default file system?", ["NTFS", "ext4", "APFS", "XFS"], 0, "NTFS."),
    q("A symbolic link is:", ["A pointer to another path", "A copy of the file", "A virus", "A driver"], 0, "It points to a path."),
    q("Permission 644 gives others:", ["Read only", "Read and write", "Execute only", "Nothing"], 0, "6 = rw- owner, 4 = r-- group, 4 = r-- others."),
    q("The principle of least privilege means:", ["Grant only the access needed", "Everyone is admin", "No passwords", "Share accounts"], 0, "Minimise rights."),
    q("Which are good security habits? (select all that apply)", ["Use MFA", "Keep software updated", "Reuse one password everywhere", "Encrypt laptops"], [0, 1, 3], "Reusing a password is poor practice."),
    q("Linux is most common on:", ["Servers and cloud", "Only gaming consoles", "Only printers", "Only calculators"], 0, "It dominates servers and cloud."),
    q("WSL allows:", ["Running a Linux environment on Windows", "Printing faster", "Editing photos", "Making calls"], 0, "Windows Subsystem for Linux."),
  ],
  project: { title: "Capstone: explore an OS", brief: "In a virtual machine or WSL, document five commands that show processes, memory, disk use, users and file permissions. For each, paste the output, explain what it means, and write a short comparison of how the same task is done on Windows." },
});
