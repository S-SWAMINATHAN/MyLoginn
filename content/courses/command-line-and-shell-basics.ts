import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "command-line-and-shell-basics", title: "Command Line and Shell Basics", category: "IT Foundations", track: "essential-it-skills", level: "Beginner", weeks: 2,
  description: "Learn to work confidently in a terminal: navigating folders, managing files, viewing and searching text, pipes and redirection, permissions, environment variables, processes and a first shell script, with Bash, PowerShell and cmd comparisons.",
  audience: "Beginners, developers, testers and future DevOps or cloud engineers who need command-line skills for every IT role.",
  prereq: "Operating Systems Fundamentals is helpful but not required.",
  objectives: ["Navigate the file system with pwd, ls, cd and relative or absolute paths", "Create, copy, move, rename and delete files and folders safely", "View and search text with cat, less, head, tail and grep", "Combine commands with pipes and redirect output to files", "Read and change file permissions and use environment variables", "Write and run a simple Bash script with variables, conditions and loops"],
  tags: ["Command Line", "Bash", "Shell", "Linux", "PowerShell"], relatedSlugs: ["operating-systems-fundamentals", "windows-and-linux-fundamentals"],
  modules: [
    { title: "Moving Around and Managing Files", lessons: [
      L("Shells, terminals and your first commands", 12,
`## Terminal and shell

The **terminal** is the window; the **shell** is the program inside it that reads your commands and runs them. Common shells: **Bash** and **zsh** (Linux and macOS), **PowerShell** and **cmd** (Windows). On Windows you can also use **WSL** for a Linux shell, or **Git Bash**.

## Why learn the command line

- It is **faster** for repeated work and **scriptable**.
- Servers and cloud machines usually have **no graphical interface**.
- It is the basis of **automation, DevOps and testing tools**.

## Anatomy of a command

\`\`\`
command  -options  arguments
ls       -l        /home/asha
\`\`\`

Options change behaviour (\`-l\` long listing; \`--help\` explains). Many accept combined short flags like \`-la\`.

## First commands

| Task | Bash / zsh | PowerShell | cmd |
|---|---|---|---|
| Where am I? | \`pwd\` | \`Get-Location\` (alias \`pwd\`) | \`cd\` |
| List files | \`ls -la\` | \`Get-ChildItem\` (alias \`ls\`) | \`dir\` |
| Change folder | \`cd folder\` | \`cd folder\` | \`cd folder\` |
| Clear screen | \`clear\` | \`cls\` | \`cls\` |
| Help | \`man ls\`, \`ls --help\` | \`Get-Help Get-ChildItem\` | \`help dir\` |
| Show text | \`echo hello\` | \`Write-Output hello\` | \`echo hello\` |

## Useful habits

- Press **Tab** to autocomplete names.
- Press the **Up arrow** for previous commands; **Ctrl+R** searches history.
- **Ctrl+C** stops a running command.
- **Read before you press Enter**, especially for delete commands.

## Practice

Open a terminal, run \`pwd\`, \`ls\` and \`echo "Hello, shell"\`, then look up one new option with \`--help\`.`,
        [q("What is the shell?", ["The terminal window only", "The program that reads and runs your commands", "A file type", "A virus scanner"], 1, "The shell interprets commands; the terminal is the window."), q("Which key stops a running command in most terminals?", ["Ctrl+C", "Ctrl+Z only", "Alt+F4", "Esc"], 0, "Ctrl+C interrupts the foreground command."), q("Which command prints the current directory in Bash?", ["pwd", "cwd", "where", "path"], 0, "pwd means print working directory.")],
        ["The shell reads commands you type, runs them and shows the result.", "Like texting instructions to your computer instead of pointing at icons.", [["Type", "command options arguments", "ls -l folder"], ["Navigate", "pwd, ls, cd", "Know where you are"], ["Help", "man and --help", "Read before running"]], "A few commands plus Tab completion go a long way.", ["Use Tab to autocomplete", "Use --help", "Read before pressing Enter"], "Running commands copied from the internet without understanding them."]),
      L("Navigating and managing files and folders", 15,
`## Paths

- **Absolute path:** from the root: \`/home/asha/projects\` (Windows: \`C:\\Users\\Asha\\projects\`).
- **Relative path:** from where you are. \`.\` is the current folder, \`..\` is the parent, \`~\` is your home folder.

## Core commands (Bash)

\`\`\`bash
pwd                      # where am I
ls -la                   # list with details, including hidden files
cd projects              # go into a folder
cd ..                    # go up one level
cd ~                     # go home
mkdir -p web/css         # create folders (with parents)
touch notes.txt          # create an empty file
cp notes.txt backup.txt  # copy
cp -r web web-backup     # copy a folder
mv notes.txt docs/       # move
mv old.txt new.txt       # rename
rm notes.txt             # delete a file
rm -r web-backup         # delete a folder and its contents
\`\`\`

## Be careful with deletion

The command line has **no recycle bin**. \`rm -rf /\` style mistakes are real. Protect yourself:

- Use \`ls\` first to see exactly what a pattern matches.
- Use \`rm -i\` to be asked before each deletion.
- Never run \`sudo rm -rf\` on a path you have not double-checked.

## Wildcards

\`*\` matches any characters, \`?\` matches one character: \`ls *.txt\`, \`cp report-?.pdf backup/\`.

## PowerShell equivalents

\`New-Item -ItemType Directory web\`, \`New-Item notes.txt\`, \`Copy-Item\`, \`Move-Item\`, \`Remove-Item\`. Many Bash-like aliases (\`ls\`, \`cp\`, \`mv\`, \`rm\`) work in PowerShell too.

## Practice

Create a folder \`practice\` with sub-folders \`docs\` and \`images\`, create three text files in \`docs\`, copy the folder to \`practice-backup\`, rename one file and delete another.`,
        [q("What does 'cd ..' do?", ["Goes to the parent folder", "Deletes the folder", "Creates a folder", "Lists files"], 0, "Two dots mean the parent directory."), q("Which command copies a whole folder in Bash?", ["cp -r", "mv -r", "cat -r", "touch -r"], 0, "cp -r copies recursively."), q("Why be careful with rm?", ["It has no recycle bin, so deletion is permanent", "It is slow", "It needs a license", "It changes the colour"], 0, "Deleted files are not moved to a trash by default.")],
        ["Move with cd, create with mkdir and touch, and copy, move or delete with cp, mv and rm.", "Like filing papers with only a keyboard: precise, fast and unforgiving.", [["Move", "pwd, cd, ls", "Relative and absolute paths"], ["Make", "mkdir, touch", "Folders and files"], ["Change", "cp, mv, rm", "Copy, move, delete carefully"]], "Check what a command will affect before you run a delete.", ["Use ls before rm", "~ is home, .. is parent", "rm has no undo"], "Running rm with a wildcard without listing what it matches."]),
    ] },
    { title: "Working with Text, Pipes and Scripts", lessons: [
      L("Viewing, searching and filtering text", 15,
`## Viewing files

\`\`\`bash
cat notes.txt          # print the whole file
less app.log           # scroll through a large file (q to quit)
head -n 10 app.log     # first 10 lines
tail -n 20 app.log     # last 20 lines
tail -f app.log        # follow new lines as they arrive
wc -l app.log          # count lines
\`\`\`

## Searching with grep

\`\`\`bash
grep "ERROR" app.log           # lines containing ERROR
grep -i "error" app.log        # ignore case
grep -n "timeout" app.log      # show line numbers
grep -v "DEBUG" app.log        # lines NOT containing DEBUG
grep -r "TODO" src/            # search inside all files in a folder
grep -c "ERROR" app.log        # count matching lines
\`\`\`

## Sorting and uniqueness

\`\`\`bash
sort names.txt
sort -n numbers.txt           # numeric sort
sort names.txt | uniq         # remove adjacent duplicates
sort names.txt | uniq -c      # count each distinct line
cut -d, -f2 data.csv          # second comma-separated column
\`\`\`

## Finding files

\`\`\`bash
find . -name "*.log"          # files by name
find . -type f -size +10M     # files larger than 10 MB
\`\`\`

## PowerShell equivalents

\`Get-Content file\`, \`Select-String "ERROR" file\`, \`Get-Content file -Tail 20 -Wait\`, \`Sort-Object\`, \`Measure-Object\`.

## Practice

Given a log file, count how many lines contain "ERROR" and show the last five of them.`,
        [q("Which command shows lines NOT containing a word?", ["grep -v", "grep -c", "grep -i", "grep -n"], 0, "-v inverts the match."), q("Which command follows a log file as it grows?", ["tail -f", "head -f", "cat -f", "less -f only"], 0, "tail -f streams new lines."), q("What does 'wc -l' do?", ["Counts lines", "Lists files", "Copies files", "Changes permissions"], 0, "It prints the number of lines.")],
        ["Commands like cat, head, tail and grep let you read and search text quickly.", "Like using Ctrl+F across every file at once.", [["View", "cat, less, head, tail", "Read big files in parts"], ["Search", "grep options", "Match, ignore case, invert"], ["Summarise", "sort, uniq, wc", "Count and group"]], "Small tools that do one thing become powerful when combined.", ["grep finds lines", "tail -f follows logs", "sort and uniq count"], "Opening a huge log in an editor instead of using grep and tail."]),
      L("Pipes and redirection", 13,
`## Standard streams

Every program has **standard input (stdin)**, **standard output (stdout)** and **standard error (stderr)**. The shell can connect them to files or to other programs.

## Redirection

\`\`\`bash
ls > files.txt          # write output to a file (overwrite)
echo "more" >> files.txt # append
sort < names.txt        # read input from a file
command 2> errors.txt   # send error messages to a file
command > out.txt 2>&1  # send both output and errors to one file
\`\`\`

## Pipes

A **pipe** \`|\` sends one command's output into the next command's input.

\`\`\`bash
cat app.log | grep ERROR | wc -l          # how many errors
ls -l | sort -k5 -n | tail -n 5           # five largest files
history | grep git                          # earlier git commands
cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -nr | head
\`\`\`

The last line counts requests per IP address and shows the busiest ones.

## Command substitution and chaining

\`\`\`bash
echo "Today is $(date)"        # use a command's output inside another
mkdir app && cd app             # run the second only if the first succeeds
make test || echo "Tests failed" # run the second only if the first fails
\`\`\`

## PowerShell pipes objects

PowerShell passes **objects**, not plain text: \`Get-Process | Sort-Object CPU -Descending | Select-Object -First 5\`.

## Practice

Write a pipeline that lists the five most frequent words in a text file.`,
        [q("What does '>' do?", ["Redirects output to a file, replacing it", "Appends to a file", "Pipes to another command", "Deletes a file"], 0, "A single > overwrites the file."), q("What does '>>' do?", ["Appends output to a file", "Overwrites", "Reads input", "Runs in the background"], 0, "Double >> appends."), q("In 'cat a.log | grep ERROR', the pipe:", ["Sends cat's output into grep", "Writes to disk", "Deletes the log", "Starts a server"], 0, "The pipe connects stdout to stdin.")],
        ["Pipes join commands, and redirection sends output to files.", "Like an assembly line where each station passes its work to the next.", [["Pipe", "command | command", "Output becomes input"], ["Redirect", "> and >>", "Write or append to a file"], ["Chain", "&& and ||", "Run on success or failure"]], "Combine simple commands instead of writing big programs.", ["| connects commands", "> overwrites, >> appends", "2> captures errors"], "Using > when you meant >> and overwriting a log."]),
      L("Permissions, environment variables and processes", 14,
`## File permissions (Linux and macOS)

\`ls -l\` shows permissions such as \`-rwxr-xr--\`: owner **rwx**, group **r-x**, others **r--**. Read = 4, write = 2, execute = 1.

\`\`\`bash
chmod 755 script.sh      # owner rwx, group r-x, others r-x
chmod +x script.sh       # make executable
chmod u+w,g-w file.txt   # symbolic form
chown asha:staff file    # change owner and group
\`\`\`

\`sudo\` runs a command as the administrator. Use it only when needed and only with commands you understand.

## Environment variables

Variables that configure programs and the shell.

\`\`\`bash
echo $HOME               # your home folder
echo $PATH               # folders searched for commands
export APP_ENV=test      # set for this shell and its children
env | grep APP           # list matching variables
\`\`\`

PowerShell: \`$env:PATH\`, \`$env:APP_ENV = "test"\`. **Never put secrets in commands you share or in files you commit**; use a secrets manager or protected environment.

## The PATH

When you type \`python\`, the shell looks through the folders in \`$PATH\` in order. "Command not found" often means the program is not installed or its folder is not on the PATH.

## Processes

\`\`\`bash
ps aux | grep node       # find processes
top                      # live view (q to quit)
kill 4321                # ask a process to stop (PID 4321)
kill -9 4321             # force stop (last resort)
command &                # run in the background
jobs                     # background jobs in this shell
\`\`\`

Windows: \`tasklist\`, \`taskkill /PID 4321\`, or Task Manager.

## Practice

Create a script, make it executable, run it, then find it in the process list while it sleeps for 60 seconds.`,
        [q("What does chmod 755 give the group?", ["Read and execute", "Read and write", "Nothing", "Full write only"], 0, "5 = r-x."), q("What does the PATH variable hold?", ["Folders searched for commands", "Your password", "The date", "A file size"], 0, "The shell searches these folders for programs."), q("Which command forces a process to stop?", ["kill -9", "ls -9", "cat -9", "cd -9"], 0, "kill -9 sends SIGKILL.")],
        ["Permissions, environment variables and processes control who can do what and how programs run.", "Like keys, settings and workers: who may enter, how things are configured and what is running.", [["Permit", "chmod and chown", "rwx for owner, group, others"], ["Configure", "Environment variables", "PATH and app settings"], ["Run", "ps, top, kill", "Find and stop processes"]], "Understand these three to debug most 'it will not run' problems.", ["chmod +x makes scripts runnable", "Command not found often means PATH", "Prefer plain kill before kill -9"], "Making files world-writable (777) to 'fix' a permission error."]),
      { ...L("Your first Bash script", 15,
`## What a script is

A **shell script** is a text file of commands. Automating repeated tasks (backups, report generation, test runs) is where the command line pays off.

## A first script

\`\`\`bash
#!/bin/bash
# greet.sh: greet someone and show the date
name="\${1:-friend}"           # first argument, default "friend"
echo "Hello, $name!"
echo "Today is $(date +%A)"

for file in *.txt; do
  lines=$(wc -l < "$file")
  echo "$file has $lines lines"
done

if [ -f report.csv ]; then
  echo "Report found"
else
  echo "No report yet"
fi
\`\`\`

Run it:

\`\`\`bash
chmod +x greet.sh
./greet.sh Asha
\`\`\`

## Building blocks

- **Shebang** \`#!/bin/bash\` chooses the interpreter.
- **Variables:** \`name="Asha"\`, used as \`$name\` (no spaces around \`=\`).
- **Arguments:** \`$1\`, \`$2\`, \`$@\` (all), \`$#\` (count).
- **Conditions:** \`if [ -f file ]\` (file exists), \`-d\` directory, \`-z\` empty string, \`-eq\` equal numbers.
- **Loops:** \`for\`, \`while\`.
- **Exit codes:** \`echo $?\` shows the last command's status; **0 means success**.

## Good habits

- Quote variables: \`"$file"\` so names with spaces work.
- Add \`set -euo pipefail\` near the top so the script stops on errors and unset variables.
- Comment what and why, not obvious how.
- Test on sample data before running on real files.

## Practice

Write a script that takes a folder name, creates it if it does not exist and prints how many files it holds.`,
        [q("What does #!/bin/bash at the top of a script do?", ["Selects the interpreter that runs the script", "Deletes the script", "Makes it a comment only", "Encrypts it"], 0, "The shebang names the program that executes the file."), q("In Bash, an exit code of 0 means:", ["Success", "Failure", "Warning", "Timeout"], 0, "Zero is success; non-zero is an error."), q("Why quote variables like \"$file\"?", ["So names with spaces work correctly", "To make output colourful", "To speed up loops", "It is not needed"], 0, "Quoting prevents word splitting.")],
        ["A script is a saved list of commands with variables, conditions and loops.", "Like a recipe card: the shell follows each step so you do not retype them.", [["Start", "Shebang and variables", "#!/bin/bash"], ["Decide and repeat", "if and for", "Conditions and loops"], ["Report", "Exit codes", "0 means success"]], "Small scripts save hours; safe habits keep them from doing damage.", ["Quote variables", "Use set -euo pipefail", "Test on sample data first"], "Running a new script on real data before testing it."]),
        challenge: pyChallenge("Count words per line", "Read lines until a line equal to END appears (do not count END). For each line print the number of words it contains (words are separated by spaces). Print each count on its own line. This mirrors what 'wc -w' does for each line.", "while True:\n    line = input()\n    if line == 'END':\n        break\n    # print the word count of the line\n",
          [{ input: "hello world\none\nthe quick brown fox\nEND", expected: "2\n1\n4" }, { input: "a b c\nEND", expected: "3" }, { input: "\nonly words here\nEND", expected: "0\n3", hidden: true }],
          ["Use a loop that stops when the line is END.", "line.split() returns a list of words.", "Print len(line.split())."],
          "while True:\n    line = input()\n    if line == 'END':\n        break\n    print(len(line.split()))",
          "Loop over input lines until END; split each line on whitespace and print the number of pieces.") },
    ] },
  ],
  final: [
    q("The shell is:", ["The program that interprets commands", "Only the window", "A file system", "A browser"], 0, "The terminal hosts the shell."),
    q("Which command shows the current directory?", ["pwd", "ls", "cd", "mkdir"], 0, "Print working directory."),
    q("cd .. moves to:", ["The parent folder", "The home folder", "The root", "A new folder"], 0, "Two dots are the parent."),
    q("Which copies a folder recursively?", ["cp -r", "mv", "touch", "cat"], 0, "cp -r."),
    q("Why is rm risky?", ["No recycle bin", "It is slow", "It is paid", "It needs the Internet"], 0, "Deletion is permanent."),
    q("grep -v 'DEBUG' file shows:", ["Lines without DEBUG", "Only DEBUG lines", "Line numbers", "Counts"], 0, "Invert match."),
    q("tail -f is used to:", ["Follow a growing file", "Delete a file", "Rename a file", "Sort a file"], 0, "Live log viewing."),
    q("> redirects output and:", ["Overwrites the file", "Appends", "Pipes", "Deletes the program"], 0, "Single > truncates."),
    q(">> :", ["Appends", "Overwrites", "Reads", "Pipes"], 0, "Append."),
    q("A pipe | does what?", ["Sends output of one command to the next", "Writes to disk", "Stops a program", "Opens a file"], 0, "stdout to stdin."),
    q("chmod 644 gives others:", ["Read only", "Read and write", "Execute", "Nothing"], 0, "4 = read."),
    q("PATH is:", ["Folders searched for commands", "A password", "A date", "A printer"], 0, "Command lookup list."),
    q("Which signal stops a process forcibly?", ["kill -9", "ls", "cd", "echo"], 0, "SIGKILL."),
    q("In a script, $? shows:", ["The exit code of the last command", "The date", "The user", "The folder"], 0, "Zero is success."),
    q("Good script habits include: (select all that apply)", ["Quote variables", "Use set -euo pipefail", "Test on sample data", "Run first on production data"], [0, 1, 2], "Test safely first."),
  ],
  project: { title: "Capstone: a backup script", brief: "Write a Bash script that takes a source folder and a destination folder, creates a timestamped backup folder, copies the files, logs how many files were copied to a log file and prints a clear error if the source does not exist. Include the commands to make it executable and a sample run." },
});
