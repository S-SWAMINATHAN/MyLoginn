import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";
import { cpuScheduling, diskScheduling, pageReplacement } from "./technical/generated";

const basics: RawQ[] = [
  m("What is the main function of an operating system?", ["To manage hardware resources and provide services to programs", "To compile programs", "To browse the internet", "To design hardware"], "The OS manages CPU, memory, storage and devices and offers system calls."),
  m("The core part of an OS that stays in memory is the:", ["Kernel", "Shell", "Compiler", "BIOS"], "The kernel runs in privileged mode and manages resources."),
  m("A system call is:", ["A request from a program to the kernel for a service", "A function inside an application", "A hardware interrupt only", "A shell command"], "e.g. read(), write(), fork()."),
  m("Which OS type gives each user a small time slice in rotation?", ["Time-sharing OS", "Batch OS", "Real-time OS", "Single-user OS"], "Time-sharing (multitasking) systems switch rapidly between users or tasks."),
  m("An OS that must respond within strict time limits is a:", ["Real-time OS", "Batch OS", "Distributed OS", "Network OS"], "Hard real-time systems (e.g. airbag controllers) have strict deadlines."),
  m("What is booting?", ["Loading the operating system into memory when the computer starts", "Installing software", "Shutting down", "Updating drivers"], "The firmware loads a boot loader, which loads the kernel."),
  m("What is the difference between user mode and kernel mode?", ["Kernel mode has full access to hardware; user mode is restricted", "User mode is faster", "Kernel mode is for games", "There is no difference"], "Mode switching protects the system from faulty programs."),
];

const process: RawQ[] = [
  m("A process is:", ["A program in execution", "A program stored on disk", "A thread", "A file"], "A process has its own address space, registers and resources."),
  m("Which data structure stores information about a process (state, registers, PID)?", ["Process Control Block (PCB)", "Page table", "File table", "Inode"], "The OS keeps one PCB per process."),
  m("Which is NOT a standard process state?", ["Compiled", "Ready", "Running", "Waiting (blocked)"], "Typical states: new, ready, running, waiting, terminated."),
  m("Switching the CPU from one process to another is called a:", ["Context switch", "Page fault", "Interrupt", "System call"], "The OS saves one process's state and restores another's."),
  m("A thread differs from a process in that threads of the same process:", ["Share the same address space", "Have separate memory spaces", "Cannot run concurrently", "Have no stack"], "Threads share code and data but have their own stacks and registers."),
  m("In Unix, which system call creates a new process?", ["fork()", "exec()", "wait()", "exit()"], "fork() duplicates the calling process; exec() replaces its program."),
  m2("A process that has finished but whose parent has not yet called wait() is a:", ["Zombie process", "Orphan process", "Daemon", "Idle process"], "Its PCB entry remains until the parent collects the exit status."),
  m("Inter-process communication can use:", ["Pipes, message queues and shared memory", "Only files", "Only interrupts", "Only the stack"], "These mechanisms let processes exchange data."),
];

const schedulingTheory: RawQ[] = [
  m("Which scheduling algorithm can cause starvation of long jobs?", ["Shortest Job First", "First Come First Served", "Round Robin", "None of these"], "Short jobs keep arriving and the long job may wait indefinitely; ageing solves this."),
  m("Round Robin scheduling is designed for:", ["Time-sharing systems", "Batch systems only", "Real-time systems only", "Single-tasking systems"], "Each process gets a time quantum in turn."),
  m("The convoy effect is associated with:", ["FCFS", "SJF", "Round Robin", "Priority scheduling"], "Short processes wait behind one long process in FCFS."),
  m("Turnaround time is:", ["Completion time − arrival time", "Burst time − waiting time", "Waiting time + arrival time", "Completion time − burst time"], "Waiting time = turnaround time − burst time."),
];

const sync: RawQ[] = [
  m("A critical section is:", ["A part of code that accesses shared resources and must not run concurrently", "The first line of a program", "A protected memory area", "A hardware component"], "Only one process should execute its critical section at a time."),
  m("Which conditions must a correct critical-section solution satisfy?", ["Mutual exclusion, progress and bounded waiting", "Speed, size and simplicity", "Deadlock and starvation", "Paging and segmentation"], "These three requirements define a correct solution."),
  m("A semaphore is:", ["An integer variable accessed only through atomic wait (P) and signal (V) operations", "A type of process", "A memory page", "A file lock only"], "Counting and binary semaphores control access to resources."),
  m("A race condition occurs when:", ["The result depends on the unpredictable order of execution of concurrent operations", "Two processes run at the same speed", "A process runs too fast", "The CPU overheats"], "Proper synchronisation removes race conditions."),
  m("Which classical problem involves processes sharing a fixed-size buffer?", ["Producer–consumer (bounded buffer)", "Dining philosophers", "Readers–writers", "Sleeping barber"], "Producers must wait when the buffer is full; consumers when it is empty."),
  m("A mutex is best described as:", ["A lock allowing only one thread into a critical section at a time", "A counting semaphore with any value", "A scheduling algorithm", "A type of interrupt"], "Mutex = mutual exclusion lock."),
];

const deadlocks: RawQ[] = [
  m("Which is NOT one of the four necessary conditions for deadlock?", ["Preemption", "Mutual exclusion", "Hold and wait", "Circular wait"], "The four conditions are mutual exclusion, hold and wait, no preemption and circular wait."),
  m("The Banker's algorithm is used for deadlock:", ["Avoidance", "Detection", "Prevention by breaking circular wait", "Recovery"], "It grants requests only if the system stays in a safe state."),
  m("A safe state means:", ["There is an order in which all processes can complete", "No process is running", "Deadlock has occurred", "All resources are free"], "Unsafe states may (not must) lead to deadlock."),
  m("Ordering resources and requesting them in increasing order prevents deadlock by eliminating:", ["Circular wait", "Mutual exclusion", "Hold and wait", "No preemption"], "No cycle can form if resources are always requested in a fixed order."),
  m("Which graph is used to detect deadlock with single-instance resources?", ["Wait-for graph", "Precedence graph", "Gantt chart", "Call graph"], "A cycle in the wait-for graph means deadlock."),
  m2("Three processes each need 2 units of a resource to finish. What is the minimum number of units that guarantees no deadlock?", ["4", "3", "6", "5"], "With n processes each needing k units, n(k − 1) + 1 units avoid deadlock: 3 × 1 + 1 = 4.", { check: "3*(2-1)+1" }),
];

const memory: RawQ[] = [
  m("Paging eliminates which type of fragmentation?", ["External fragmentation", "Internal fragmentation", "Both", "Neither"], "Fixed-size frames avoid external fragmentation but may waste space inside the last page."),
  m("Which hardware unit translates logical addresses to physical addresses?", ["MMU (Memory Management Unit)", "ALU", "Cache controller", "DMA controller"], "The MMU uses page tables (with a TLB cache)."),
  m("The TLB is:", ["A small cache of recent page-table entries", "A type of RAM", "A disk buffer", "A scheduling queue"], "The Translation Lookaside Buffer speeds up address translation."),
  m2("A system has 4 KB pages and a 32-bit logical address. How many bits are used for the page offset?", ["12", "20", "10", "32"], "4 KB = 2¹² bytes, so 12 bits are the offset (and 20 bits the page number).", { check: "12" }),
  m2("With a 32-bit logical address and 4 KB pages, how many entries does a single-level page table have?", ["2^20 (about 1 million)", "2^12", "2^32", "4096"], "Page number bits = 32 − 12 = 20, so 2²⁰ entries."),
  m("Segmentation divides memory into:", ["Variable-sized logical units such as code, data and stack", "Equal fixed-size frames", "Disk sectors", "Cache lines"], "Segments match the program's logical structure."),
  m("Which placement strategy allocates the smallest hole that is big enough?", ["Best fit", "First fit", "Worst fit", "Next fit"], "Best fit minimises leftover space per allocation."),
];

const virtualMemory: RawQ[] = [
  m("Virtual memory allows:", ["Programs larger than physical memory to run", "Faster CPUs", "More disk space", "Encryption of RAM"], "Only the needed pages are kept in RAM; others are on disk."),
  m("A page fault occurs when:", ["A referenced page is not in physical memory", "A page is modified", "The disk is full", "A process ends"], "The OS loads the page from disk."),
  m("Thrashing is:", ["Excessive paging that leaves the CPU mostly idle", "Rapid context switching", "A disk crash", "A memory leak"], "Too little memory per process causes constant page faults."),
  m("Belady's anomaly can occur with which replacement algorithm?", ["FIFO", "LRU", "Optimal", "None"], "With FIFO, more frames can sometimes cause more page faults."),
  m("Which page replacement algorithm gives the minimum possible page faults?", ["Optimal (replace the page used furthest in the future)", "FIFO", "LRU", "Random"], "Optimal is a benchmark; it needs future knowledge."),
  m("Demand paging means:", ["Pages are loaded only when they are referenced", "All pages are loaded at start", "Pages are never swapped", "Pages are fixed in memory"], "Lazy loading reduces memory use and start-up time."),
];

const fileSystems: RawQ[] = [
  m("In Unix-like systems, file metadata (size, owner, block pointers) is stored in an:", ["Inode", "FAT", "Superblock only", "Directory entry only"], "Directory entries map names to inode numbers."),
  m("Which allocation method keeps a file in consecutive disk blocks?", ["Contiguous allocation", "Linked allocation", "Indexed allocation", "FAT"], "Contiguous allocation is fast but suffers from external fragmentation."),
  m("What does the file permission rwxr-xr-- mean for 'others'?", ["Read only", "Read and execute", "No permissions", "Full permissions"], "The last three characters (r--) are for others."),
  m("In chmod 754, what permissions does the group get?", ["Read and execute", "Read, write and execute", "Read only", "Write only"], "7 = rwx (owner), 5 = r-x (group), 4 = r-- (others)."),
  m("A journaling file system improves:", ["Recovery and consistency after crashes", "Storage capacity", "CPU speed", "Network speed"], "Changes are logged before being applied."),
  m("Which file system is commonly used by Windows today?", ["NTFS", "ext4", "APFS", "HFS+"], "ext4 is common on Linux; APFS on macOS."),
];

const disk: RawQ[] = [
  m("Which disk scheduling algorithm moves the head in one direction servicing requests, then reverses?", ["SCAN (elevator)", "FCFS", "SSTF", "Random"], "C-SCAN instead jumps back to the start without servicing on the return."),
  m("SSTF disk scheduling may cause:", ["Starvation of far requests", "Belady's anomaly", "Deadlock", "Thrashing"], "Requests far from the head may wait a long time."),
  m("Disk access time is made up of:", ["Seek time + rotational latency + transfer time", "CPU time + I/O time", "Boot time + load time", "Only seek time"], "Seek and rotation usually dominate."),
  m("RAID 1 provides:", ["Mirroring", "Striping without redundancy", "Striping with parity", "Compression"], "RAID 0 stripes; RAID 5 stripes with distributed parity."),
];

const linux: RawQ[] = [
  m("Which Linux command lists files in a directory?", ["ls", "cd", "pwd", "cat"], "ls lists; cd changes directory; pwd prints it; cat shows file contents."),
  m("Which command shows the current working directory?", ["pwd", "cwd", "dir", "where"], "pwd = print working directory."),
  m("Which command displays running processes?", ["ps", "ls", "top -u only", "proc"], "ps lists processes; top shows them live."),
  m("Which command searches for text inside files?", ["grep", "find", "locate", "sort"], "grep 'pattern' file prints matching lines."),
  m("What does the pipe operator | do?", ["Sends the output of one command as input to another", "Runs commands in the background", "Redirects output to a file", "Comments a line"], "e.g. ls | grep txt."),
  m("Which command changes file permissions?", ["chmod", "chown", "chgrp", "umask"], "chown changes the owner."),
  m("What does sudo do?", ["Runs a command with superuser (root) privileges", "Switches directory", "Shuts down the system", "Installs Linux"], "sudo executes as another user, usually root."),
  m("Which symbol runs a command in the background?", ["&", "|", ">", ";"], "Appending & runs the command in the background."),
];

const subject: RawSubject = {
  "os-basics": topic(basics, { intro: "An operating system manages hardware and provides services to programs: process, memory, file, device and security management." }),
  "process-management": topic(process, { intro: "A process is a program in execution with its own address space. The OS tracks it in a Process Control Block and moves it between states: new, ready, running, waiting and terminated." }),
  "cpu-scheduling": topic([...cpuScheduling, ...schedulingTheory], { intro: "The CPU scheduler chooses which ready process runs next.", formulas: [{ h: "Algorithms", points: ["FCFS: in order of arrival (non-preemptive)", "SJF: shortest burst first (optimal average waiting time); SRTF is its preemptive form", "Priority: highest priority first (ageing prevents starvation)", "Round Robin: each process gets a time quantum in turn"] }, { h: "Measures", points: ["Turnaround time = completion − arrival", "Waiting time = turnaround − burst", "Response time = first run − arrival"] }] }),
  "process-synchronization": topic(sync, { intro: "Concurrent processes sharing data need synchronisation to avoid race conditions: locks, semaphores, monitors and condition variables." }),
  deadlocks: topic(deadlocks, { intro: "A deadlock is a set of processes each waiting for a resource held by another.", formulas: [{ h: "Necessary conditions", points: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"] }, { h: "Handling", points: ["Prevention (break a condition)", "Avoidance (Banker's algorithm, safe states)", "Detection and recovery", "Ignoring (ostrich algorithm)"] }] }),
  "memory-management": topic(memory, { intro: "Memory management allocates RAM to processes using contiguous allocation, paging or segmentation, with address translation by the MMU." }),
  "virtual-memory": topic([...pageReplacement, ...virtualMemory], { intro: "Virtual memory keeps only needed pages in RAM. On a page fault the OS loads the page, replacing another if memory is full.", formulas: [{ h: "Page replacement", points: ["FIFO: replace the oldest page (suffers Belady's anomaly)", "LRU: replace the least recently used page", "Optimal: replace the page used furthest in the future (minimum faults)"] }] }),
  "file-systems": topic(fileSystems, { intro: "File systems organise data on storage with directories, metadata (inodes or FAT entries), allocation methods and permissions." }),
  "disk-scheduling": topic([...diskScheduling, ...disk], { intro: "Disk scheduling orders I/O requests to reduce head movement.", formulas: [{ h: "Algorithms", points: ["FCFS: in arrival order", "SSTF: nearest request next", "SCAN/C-SCAN: sweep across the disk", "LOOK/C-LOOK: sweep only as far as the last request"] }] }),
  "linux-basics": topic(linux, { intro: "Linux is a Unix-like OS. The shell runs commands such as ls, cd, pwd, cp, mv, rm, grep, find, chmod, ps and kill; pipes and redirection combine them." }),
};
export default subject;
