import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "cybersecurity-fundamentals", title: "Cybersecurity Fundamentals", category: "Cybersecurity", track: "cybersecurity", level: "Beginner", weeks: 3,
  description: "Learn the core ideas of cybersecurity: the CIA triad, common threats and attacks, passwords and multi-factor authentication, encryption and hashing, network and web security basics, secure habits, and how organisations respond to incidents.",
  audience: "Students, IT beginners, developers, testers and non-technical staff who want a clear, practical understanding of security.",
  prereq: "None. Networking Fundamentals helps with one module.",
  objectives: ["Explain confidentiality, integrity and availability with examples", "Recognise phishing, malware, social engineering and common web attacks", "Apply strong password and multi-factor authentication practice", "Explain encryption, hashing and digital certificates at a conceptual level", "Describe layered defence: firewalls, updates, least privilege and backups", "Describe the stages of incident response and report an incident"],
  tags: ["Cybersecurity", "CIA Triad", "Phishing", "Encryption", "Authentication"], relatedSlugs: ["http-https-dns-and-apis", "networking-fundamentals"],
  modules: [
    { title: "Security Foundations", lessons: [
      L("The CIA triad and security vocabulary", 12,
`## What cybersecurity protects

**Cybersecurity** is the practice of protecting systems, networks, applications and data from unauthorised access, damage or disruption. Its core goals are the **CIA triad**:

| Goal | Meaning | Example attack | Example defence |
|---|---|---|---|
| **Confidentiality** | Only authorised people can see data | Stolen customer database | Encryption, access control |
| **Integrity** | Data is accurate and unaltered | Changing a bank balance | Hashing, digital signatures, audit logs |
| **Availability** | Systems work when needed | Denial-of-service attack, ransomware | Redundancy, backups, DDoS protection |

## Key terms

- **Asset:** anything of value (data, servers, reputation).
- **Threat:** something that could cause harm (a hacker, malware, a flood).
- **Vulnerability:** a weakness (unpatched software, weak password).
- **Exploit:** a method that uses a vulnerability.
- **Risk:** the chance that a threat uses a vulnerability, multiplied by the impact.
- **Control (countermeasure):** something that reduces risk.
- **Attack surface:** all the places an attacker could try to get in.

## Types of controls

**Preventive** (firewalls, strong authentication), **detective** (logs, alerts, cameras), **corrective** (restoring from backups, patching) and **deterrent** (warning banners, policies).

## Defence in depth

No single control is perfect, so use **several layers**: policies and training, network security, endpoint protection, application security, data protection and monitoring.

## The people factor

Many breaches begin with a human mistake or trick. Awareness and clear reporting are as important as technology.

## Practice

For an online bookstore, list one asset, one threat, one vulnerability and one control for each part of the CIA triad.`,
        [q("Ransomware that locks files mainly attacks:", ["Availability (and often confidentiality)", "Only integrity", "Only the screen", "Nothing"], 0, "It makes data unavailable and often steals it too."), q("A weakness such as unpatched software is a:", ["Vulnerability", "Control", "Asset", "Backup"], 0, "A vulnerability is a weakness that can be exploited."), q("Defence in depth means:", ["Using several layers of controls", "One strong firewall only", "No monitoring", "Hiding the server"], 0, "Layered controls limit the impact when one fails.")],
        ["Security protects confidentiality, integrity and availability using layers of controls.", "Like protecting a house: locks, an alarm, a safe and insurance, not just one lock.", [["Goals", "Confidentiality, integrity, availability", "The CIA triad"], ["Risk", "Threat, vulnerability, impact", "What could go wrong"], ["Controls", "Prevent, detect, correct", "Layered defence"]], "Know what you protect, from whom and with which controls.", ["CIA triad", "Risk = likelihood x impact", "Use defence in depth"], "Relying on one tool and assuming you are safe."]),
      L("Threats and attacks you will meet", 15,
`## Malware

**Malware** is malicious software.

| Type | What it does |
|---|---|
| **Virus / worm** | Spreads by infecting files or across networks |
| **Trojan** | Pretends to be useful software |
| **Ransomware** | Encrypts files and demands payment |
| **Spyware / keylogger** | Secretly records activity and keystrokes |
| **Botnet** | A network of infected machines controlled remotely |
| **Rootkit** | Hides deep in the system |

## Social engineering and phishing

**Social engineering** manipulates people instead of breaking technology. **Phishing** uses fake emails, messages or sites to steal credentials. Variants: **spear phishing** (targeted), **smishing** (SMS), **vishing** (voice calls) and **business email compromise** (impersonating an executive or supplier).

Warning signs: urgency or threats, unexpected attachments, a mismatched sender address, links whose real destination differs from the text, requests for passwords, OTPs or payments.

## Network and web attacks (concepts)

- **Denial of service (DoS/DDoS):** overwhelm a service with traffic.
- **Man-in-the-middle:** secretly intercept communication (reduced by HTTPS).
- **Password attacks:** guessing, **brute force**, **credential stuffing** (reusing leaked passwords).
- **SQL injection and cross-site scripting (XSS):** exploiting poorly validated input in web apps.
- **Supply-chain attacks:** compromising a software supplier or library.
- **Insider threats:** misuse by employees or contractors.

## The attacker's typical path

Reconnaissance, initial access (often phishing or a vulnerability), privilege escalation, lateral movement, data theft or encryption, covering tracks. Defenders try to detect and stop each step.

## Legal and ethical note

Only test systems you own or have written permission to test. Unauthorised access is illegal (for example under the IT Act, 2000 in India).

## Practice

Find a phishing example from a public awareness site and list five warning signs it shows.`,
        [q("Reusing a leaked password on many sites enables:", ["Credential stuffing", "Defragmentation", "Load balancing", "Caching"], 0, "Attackers try leaked passwords against other services."), q("Which is a sign of phishing?", ["Urgent threat and a mismatched link", "A message from a known colleague about lunch", "A system update notice from the OS settings", "A newsletter you subscribed to"], 0, "Urgency and mismatched links are classic signs."), q("It is legal to test security on:", ["Systems you own or have written permission to test", "Any website", "Your neighbour's Wi-Fi", "A company you dislike"], 0, "Unauthorised testing is illegal.")],
        ["Attackers use malware, deception and weak configurations to get in.", "Like burglars: some pick locks, others simply knock and pretend to be the plumber.", [["Malware", "Viruses, ransomware, trojans", "Harmful software"], ["Phishing", "Fake messages", "Urgency and mismatched links"], ["Attacks", "DDoS, injection, stuffing", "Exploit systems and people"]], "Most attacks start with people or unpatched software.", ["Spot phishing signs", "Never reuse passwords", "Test only with permission"], "Clicking links in an urgent message without checking the real address."]),
    ] },
    { title: "Protecting Accounts, Data and Systems", lessons: [
      L("Passwords, multi-factor authentication and identity", 14,
`## Strong passwords

Length beats complexity. A long **passphrase** such as *"purple-tiger-lamp-river-92"* is easier to remember and harder to guess than *"P@ssw0rd!"*.

- Use **at least 14 to 16 characters** for important accounts.
- Use a **unique password for every account**.
- Use a **password manager** (such as Bitwarden or KeePass) to generate and store them.
- Never share passwords or reuse a work password elsewhere.
- Change a password if a breach exposes it; check breach lists with a trusted tool.

## Multi-factor authentication (MFA)

MFA combines two or more factors:

| Factor | Examples |
|---|---|
| **Something you know** | Password, PIN |
| **Something you have** | Phone authenticator app, hardware key, SMS code |
| **Something you are** | Fingerprint, face |

Strength order (best to weaker): **hardware security keys / passkeys**, **authenticator-app codes**, **SMS codes** (vulnerable to SIM-swap). Always enable MFA on email, banking, cloud and social accounts.

## Passkeys

**Passkeys** replace passwords with a cryptographic key pair stored on your device, unlocked by biometrics or PIN. They resist phishing because the key only works on the genuine site.

## Authentication, authorisation, accounting

- **Authentication:** proving who you are.
- **Authorisation:** what you may do.
- **Accounting (auditing):** recording what you did.

## Least privilege

Give people and programs only the access they need, for only as long as they need it. Review access when roles change.

## Practice

Set up a password manager, create a 16-character passphrase for your email and turn on an authenticator app.`,
        [q("Which password is generally strongest?", ["P@ssw0rd!", "A long unique passphrase of four or more random words", "Your birth date", "12345678"], 1, "Length and randomness matter most."), q("Which MFA method is most phishing-resistant?", ["SMS codes", "Hardware security keys or passkeys", "Security questions", "Email codes only"], 1, "Keys and passkeys are bound to the genuine site."), q("Authorisation answers:", ["What are you allowed to do?", "Who are you?", "When did you log in?", "Where are you?"], 0, "Authentication proves identity; authorisation sets permissions.")],
        ["Long unique passwords plus multi-factor authentication stop most account takeovers.", "Like a house key plus an alarm code: stealing one is not enough.", [["Know", "Unique passphrase", "Use a password manager"], ["Have", "Authenticator or key", "Second factor"], ["Limit", "Least privilege", "Only needed access"]], "Turn on MFA everywhere it is offered, starting with email.", ["Length beats complexity", "Never reuse passwords", "Prefer keys and passkeys"], "Using the same password for email and shopping sites."]),
      L("Encryption, hashing and certificates", 14,
`## Encryption

**Encryption** scrambles data so only someone with the right key can read it.

- **Symmetric encryption:** one shared key encrypts and decrypts (**AES**). Fast, used for bulk data.
- **Asymmetric encryption:** a **public key** encrypts and a **private key** decrypts, or the private key **signs** and the public key verifies (**RSA, ECC**). Used for key exchange and signatures.

**At rest** (disks, databases) and **in transit** (HTTPS/TLS) data should both be encrypted.

## Hashing

A **hash function** turns any input into a fixed-size fingerprint. It is **one-way** (you cannot reverse it) and a tiny change in input changes the output completely.

\`SHA-256("hello")\` always gives the same 64-hex-character result.

Uses: **verifying file integrity**, **storing passwords** and **digital signatures**.

## Storing passwords properly

Never store passwords in plain text or with plain fast hashes. Use a **slow, salted password hash** such as **bcrypt, scrypt or Argon2**. A **salt** is random data added per user so identical passwords have different hashes and precomputed tables ("rainbow tables") are useless.

## Digital signatures and certificates

A **digital signature** proves who created data and that it was not changed. A **certificate** ties a public key to an identity and is signed by a trusted **Certificate Authority**; this is how HTTPS verifies a website.

## Keys are the secret

Strong algorithms fail if keys leak. Protect keys with **hardware security modules or key vaults**, rotate them and never commit them to code repositories.

## Practice

Explain in two sentences why a website should store a salted bcrypt hash instead of your password, and what happens if its database leaks.`,
        [q("Which is one-way and used to verify file integrity?", ["Hashing", "Symmetric encryption", "A VPN", "A firewall"], 0, "Hashes cannot be reversed and reveal changes in data."), q("Why add a salt when hashing passwords?", ["So identical passwords have different hashes and rainbow tables fail", "To make passwords shorter", "To speed up logins", "To encrypt the database"], 0, "Unique salts defeat precomputed tables."), q("In asymmetric encryption, the private key is:", ["Kept secret by its owner", "Shared with everyone", "Printed on the website", "The same as the public key"], 0, "The private key must never be shared.")],
        ["Encryption hides data, hashing fingerprints it and certificates tie keys to identities.", "Like a locked box (encryption), a wax seal (hash) and a notary stamp (certificate).", [["Encrypt", "AES and RSA", "Key controls access"], ["Hash", "One-way fingerprints", "Integrity and passwords"], ["Certify", "CA-signed keys", "Authenticate websites"]], "Use slow, salted hashes for passwords and protect your keys.", ["Encrypt at rest and in transit", "Hashes cannot be reversed", "Never store plain passwords"], "Storing passwords with a fast, unsalted hash such as plain MD5."]),
      { ...L("Secure habits, updates and backups", 14,
`## Everyday defences

- **Install updates promptly** for the OS, browsers, apps and firmware; most attacks use known, already-fixed flaws.
- **Use security software** and keep a **firewall** on.
- **Be wary of links, attachments and downloads**; type addresses yourself or use bookmarks for banking.
- **Use official app stores** and avoid pirated software, which often contains malware.
- **Lock your screen** and **encrypt** laptops and phones.
- **Use a VPN** on untrusted networks, and prefer HTTPS sites.
- **Limit what you share** publicly; attackers research targets on social media.

## Backups beat ransomware

Follow the **3-2-1 rule**: three copies of data, on two different media, with one off-site or offline. **Test restores**, because an untested backup is only a hope.

## Wi-Fi at home

Change the router's default password, use **WPA3 or WPA2-AES**, disable WPS, keep the router firmware updated and use a separate guest network.

## Working safely at an organisation

- Follow the **acceptable use policy**.
- **Report suspicious emails** with the report button or to the security team; do not delete silently.
- **Never share credentials**, even with IT staff; legitimate teams do not ask for them.
- Handle **sensitive data** only in approved systems, and clear your desk.

## Mini exercise in code

Security checklists are easy to automate. The challenge below checks a password against a few basic rules, the kind of check a registration form applies before it stores a salted hash.`,
        [q("The 3-2-1 backup rule means:", ["3 copies, 2 media types, 1 off-site or offline", "3 passwords, 2 users, 1 admin", "3 firewalls, 2 routers, 1 modem", "3 days, 2 weeks, 1 month"], 0, "It protects against failure and ransomware."), q("What should you do with a suspicious email at work?", ["Report it to the security team", "Forward it to everyone", "Click the link to check", "Reply with your password"], 0, "Reporting helps protect the whole organisation."), q("Why install updates promptly?", ["They fix known vulnerabilities attackers exploit", "They change wallpaper", "They slow the device", "They delete files"], 0, "Many attacks use flaws that already have patches.")],
        ["Simple habits, updates and tested backups stop most everyday attacks.", "Like locking the door, keeping a spare key elsewhere and fixing a broken window quickly.", [["Patch", "Update everything", "Fixes known flaws"], ["Back up", "3-2-1 and test restores", "Beats ransomware"], ["Report", "Suspicious messages", "Protects everyone"]], "Consistent small habits give the biggest security gain.", ["Update promptly", "Test restores", "Report, do not hide, incidents"], "Never testing a backup until the day it is needed."]),
        challenge: pyChallenge("Check a password", "Read one password. Print 'strong' if it has at least 12 characters AND contains at least one lowercase letter, one uppercase letter and one digit. Otherwise print 'weak'.", "password = input()\n# check length and character types\n",
          [{ input: "Tiger-Lamp-River-92", expected: "strong" }, { input: "password123", expected: "weak" }, { input: "ShortA1", expected: "weak", hidden: true }, { input: "alllowercaseletters99", expected: "weak", hidden: true }, { input: "Abcdefghijk1", expected: "strong", hidden: true }],
          ["Check len(password) >= 12 first.", "Use any(c.islower() for c in password) and similar for isupper and isdigit.", "Combine all four conditions with and."],
          "password = input()\nlong_enough = len(password) >= 12\nhas_lower = any(c.islower() for c in password)\nhas_upper = any(c.isupper() for c in password)\nhas_digit = any(c.isdigit() for c in password)\nif long_enough and has_lower and has_upper and has_digit:\n    print('strong')\nelse:\n    print('weak')",
          "The password is strong only when it is long enough and contains lowercase, uppercase and a digit.") },
    ] },
    { title: "Responding to Incidents", lessons: [
      L("Incident response and reporting", 13,
`## What is an incident

A **security incident** is an event that threatens confidentiality, integrity or availability: a phishing click, malware infection, lost laptop, data leak, ransomware or unauthorised access.

## The incident response life cycle (NIST)

1. **Preparation:** policies, contacts, tools, backups and training before anything happens.
2. **Detection and analysis:** spot signs (alerts, user reports, unusual logins), decide whether it is real and how serious.
3. **Containment, eradication and recovery:** isolate affected systems, remove the cause (malware, compromised accounts), restore from clean backups and monitor.
4. **Post-incident activity:** document what happened, share lessons and improve controls.

## What to do if you suspect an incident

1. **Stay calm and stop** the action: do not keep clicking.
2. **Disconnect** the device from the network if you suspect malware (unplug Ethernet or turn off Wi-Fi), but **do not switch it off** unless told to.
3. **Report immediately** to the security or IT team with what you saw, the time and any messages.
4. **Do not delete evidence** or try to clean it yourself.
5. **Change passwords** from a clean device if credentials may be exposed.

## Logging and monitoring

Systems record **logs** (logins, errors, network connections). Tools such as **SIEM** collect logs and raise alerts. Fast detection reduces damage.

## Legal and communication aspects

Organisations may have to inform regulators and affected people after a data breach (for example, under India's Digital Personal Data Protection Act, 2023 and CERT-In directions). Communication should be **accurate, timely and coordinated**.

## Practice

Write a five-step response plan for a colleague who clicked a phishing link and entered their password.`,
        [q("What is the first thing to do if you suspect your laptop has malware?", ["Keep working", "Disconnect from the network and report it", "Install random cleaners", "Share the file widely"], 1, "Contain and report quickly, preserving evidence."), q("Which NIST phase involves lessons learned?", ["Preparation", "Post-incident activity", "Detection", "Containment"], 1, "Post-incident review improves future response."), q("Why should you not delete suspicious emails silently?", ["Reporting helps stop others from being tricked", "It breaks the mailbox", "Deleting is illegal", "It improves speed"], 0, "Security teams can warn others only if they know.")],
        ["Incidents are handled in phases: prepare, detect, contain and recover, then learn.", "Like fire safety: plan, spot the smoke, contain the fire and review how to prevent the next.", [["Prepare", "Policies and backups", "Before anything happens"], ["Respond", "Detect, contain, recover", "Isolate and report fast"], ["Learn", "Review and improve", "Fix the root cause"]], "Fast reporting and calm, documented steps reduce damage.", ["Report immediately", "Disconnect, do not destroy evidence", "Document lessons learned"], "Hiding a mistake because of embarrassment, which lets the damage grow."]),
    ] },
  ],
  final: [
    q("The CIA triad stands for:", ["Confidentiality, integrity, availability", "Control, identity, access", "Cyber, internet, analysis", "Code, input, authentication"], 0, "The three core goals."),
    q("A ransomware attack primarily threatens:", ["Availability and often confidentiality", "Only colours", "Only speed of typing", "Nothing"], 0, "Locks and steals data."),
    q("A weakness an attacker can use is a:", ["Vulnerability", "Backup", "Control", "Patch"], 0, "A vulnerability."),
    q("Defence in depth means:", ["Multiple layers of controls", "One tool", "No monitoring", "Obscurity"], 0, "Layers."),
    q("A sign of phishing is:", ["Urgent request and mismatched link", "A routine calendar invite", "An OS update in settings", "A known newsletter"], 0, "Classic signs."),
    q("Credential stuffing uses:", ["Leaked passwords tried on other sites", "A faster CPU", "A firewall", "Hardware keys"], 0, "Password reuse is dangerous."),
    q("Which is the best password approach?", ["Unique long passphrases with a manager", "One simple password", "Sharing with friends", "Writing on the monitor"], 0, "Unique and long."),
    q("Which MFA is most phishing-resistant?", ["Hardware keys or passkeys", "SMS", "Security questions", "Email only"], 0, "Bound to the genuine site."),
    q("Authorisation means:", ["What you are allowed to do", "Who you are", "When you left", "Where you work"], 0, "Permissions."),
    q("Hashing is:", ["One-way", "Reversible", "Only for images", "A type of cable"], 0, "Cannot be reversed."),
    q("A salt is added to:", ["Make identical passwords hash differently", "Shorten passwords", "Speed up logins", "Encrypt the disk"], 0, "Defeats rainbow tables."),
    q("The 3-2-1 backup rule is:", ["3 copies, 2 media, 1 off-site", "3 users, 2 admins, 1 router", "3 days, 2 weeks, 1 month", "3 keys, 2 locks, 1 door"], 0, "Resilient backups."),
    q("Which are good habits? (select all that apply)", ["Install updates promptly", "Use MFA", "Test restores", "Reuse one password"], [0, 1, 2], "Reuse is bad."),
    q("If you suspect malware you should:", ["Disconnect from the network and report", "Keep working", "Delete everything", "Share the file"], 0, "Contain and report."),
    q("Which NIST phase includes lessons learned?", ["Post-incident activity", "Preparation", "Detection", "Eradication"], 0, "Review and improve."),
  ],
  project: { title: "Capstone: personal security audit", brief: "Audit your own digital life: list your ten most important accounts, check each for a unique password, MFA and recovery options, review your device updates and backups, find one phishing example and explain its warning signs, and write a one-page incident response plan for a lost phone." },
});
