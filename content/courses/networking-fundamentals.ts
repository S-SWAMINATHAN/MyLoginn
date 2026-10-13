import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "networking-fundamentals", title: "Networking Fundamentals", category: "Networking", track: "essential-it-skills", level: "Beginner", weeks: 3,
  description: "Learn how computer networks work: the OSI and TCP/IP models, IP addressing and subnetting, switches and routers, TCP and UDP, common protocols, Wi-Fi and the commands used to troubleshoot connectivity.",
  audience: "IT beginners, developers, testers, cloud and security learners who need a practical understanding of how data moves across networks.",
  prereq: "Computer Fundamentals is helpful.",
  objectives: ["Describe the layers of the OSI and TCP/IP models and what each does", "Explain IPv4 addressing, subnet masks and CIDR notation", "Describe the roles of switches, routers, firewalls and access points", "Explain the difference between TCP and UDP and name common ports", "Use ping, traceroute, ipconfig/ip and nslookup to troubleshoot", "Explain how a device gets an IP address with DHCP and how NAT works"],
  tags: ["Networking", "TCP/IP", "OSI", "IP Addressing", "Subnetting"], relatedSlugs: ["http-https-dns-and-apis", "computer-fundamentals"],
  modules: [
    { title: "How Networks Work", lessons: [
      L("Network types, devices and topologies", 13,
`## What a network is

A **network** connects devices so they can share data and resources. The Internet is a network of networks.

## Types by size

| Type | Area | Example |
|---|---|---|
| **PAN** | A person's devices | Bluetooth earphones to a phone |
| **LAN** | A building or campus | Office or home Wi-Fi and Ethernet |
| **MAN** | A city | A city fibre network |
| **WAN** | Countries and continents | The Internet, a company's branches linked by leased lines |

## Key devices

- **Network interface card (NIC):** connects a device; every NIC has a unique **MAC address**.
- **Switch:** connects devices inside a LAN and forwards frames to the right port using MAC addresses.
- **Router:** connects different networks and forwards **packets** using IP addresses; your home router links your LAN to your ISP.
- **Access point (AP):** provides Wi-Fi.
- **Firewall:** allows or blocks traffic by rules.
- **Modem:** converts the ISP's signal for the router.
- **Hub (obsolete):** repeats data to all ports.

## Topologies

**Star** (devices connect to a central switch, the most common), **bus**, **ring**, **mesh** (many links, resilient) and **hybrid**.

## Client-server and peer-to-peer

In **client-server**, clients request services from servers (web, email, files). In **peer-to-peer**, devices share directly with each other.

## Media

**Twisted-pair Ethernet** (Cat5e, Cat6), **fibre optic** (long distance and high speed) and **wireless** (Wi-Fi, cellular).

## Practice

Sketch your home network: list each device and say whether the router, switch or access point connects it.`,
        [q("Which device forwards traffic between different networks using IP addresses?", ["Switch", "Router", "Hub", "Cable"], 1, "Routers connect networks and route packets by IP."), q("A network covering a single office building is a:", ["PAN", "LAN", "WAN", "MAN"], 1, "A local area network covers a limited area like a building."), q("A MAC address identifies:", ["A network interface", "A website", "A router password", "A user's name"], 0, "Each NIC has a MAC address.")],
        ["Networks connect devices using switches inside a LAN and routers between networks.", "Like a city: switches are local streets, routers are the highways between towns.", [["LAN", "Local network", "Switches and Wi-Fi"], ["Router", "Between networks", "Uses IP addresses"], ["WAN", "Wide area", "The Internet"]], "Devices work at different layers with different addresses.", ["Switches use MAC addresses", "Routers use IP addresses", "Star topology is most common"], "Confusing a switch with a router."]),
      L("The OSI and TCP/IP models", 15,
`## Why layers

Networking is split into **layers**. Each layer has one job and talks to the layers above and below, so different technologies can be swapped without breaking everything.

## OSI model (7 layers)

| # | Layer | Job | Examples |
|---|---|---|---|
| 7 | **Application** | Services for user programs | HTTP, DNS, SMTP |
| 6 | **Presentation** | Formats, encryption, compression | TLS, JSON encoding |
| 5 | **Session** | Opens, manages and closes sessions | Sessions, RPC |
| 4 | **Transport** | End-to-end delivery, ports | TCP, UDP |
| 3 | **Network** | Addressing and routing | IP, ICMP |
| 2 | **Data link** | Delivery on one link, MAC addresses | Ethernet, Wi-Fi |
| 1 | **Physical** | Bits on the medium | Cables, radio signals |

Memory trick (top to bottom): **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.

## TCP/IP model (4 layers)

| TCP/IP layer | Covers OSI layers |
|---|---|
| **Application** | 5, 6, 7 |
| **Transport** | 4 |
| **Internet** | 3 |
| **Network access (link)** | 1, 2 |

The Internet runs on TCP/IP; OSI is mainly a teaching and troubleshooting reference.

## Encapsulation

Sending data adds a header at each layer going down: data becomes a **segment** (transport), a **packet** (network), a **frame** (data link) and finally **bits**. The receiver removes the headers going up.

## Troubleshooting by layer

Start at the bottom: *Is the cable or Wi-Fi connected (L1)? Is the link up (L2)? Do we have an IP and route (L3)? Is the port open (L4)? Does the application respond (L7)?*

## Practice

Place each in a layer: Ethernet, IP, TCP, HTTP, a fibre cable, TLS.`,
        [q("Which OSI layer is responsible for IP addressing and routing?", ["Transport", "Network", "Data link", "Application"], 1, "Layer 3 is the Network layer."), q("A TCP segment is wrapped in an IP header to become a:", ["Frame", "Packet", "Bit", "Message"], 1, "At the network layer data is a packet."), q("How many layers does the OSI model have?", ["4", "5", "7", "9"], 2, "OSI has seven layers.")],
        ["Layers split networking into small jobs, and each adds its own header as data travels down.", "Like sending a parcel: pack it, label it, put it in a van, and the road carries the van.", [["Top", "Application", "HTTP, DNS"], ["Middle", "Transport and network", "TCP, IP"], ["Bottom", "Link and physical", "Ethernet, cables"]], "Troubleshoot from the bottom layer up.", ["OSI has seven layers", "TCP/IP has four", "Encapsulation adds headers"], "Troubleshooting application errors before checking the cable or IP."]),
      L("TCP, UDP and common ports", 13,
`## Transport layer

The transport layer delivers data between **applications** on different hosts, identified by **port numbers** (0 to 65535).

## TCP

**Transmission Control Protocol** is **connection-oriented and reliable**:

- Sets up a connection with the **three-way handshake**: SYN, SYN-ACK, ACK.
- Numbers data, **acknowledges** it and **retransmits** lost segments.
- Delivers data **in order** and controls speed (**flow and congestion control**).

Used for web, email, file transfer and databases, where every byte matters.

## UDP

**User Datagram Protocol** is **connectionless and fast**: no handshake, no guarantee of delivery or order. Used for **video calls, live streaming, online games and DNS lookups**, where low delay matters more than perfection.

| | TCP | UDP |
|---|---|---|
| Connection | Yes | No |
| Reliable | Yes | No |
| Ordered | Yes | No |
| Overhead | Higher | Lower |
| Use | HTTP, SSH, email | Calls, games, DNS |

## Well-known ports

| Port | Service |
|---|---|
| 20/21 | FTP |
| 22 | SSH |
| 23 | Telnet (insecure) |
| 25 | SMTP (email send) |
| 53 | DNS |
| 67/68 | DHCP |
| 80 | HTTP |
| 110 / 143 | POP3 / IMAP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 3389 | RDP |

## Sockets

A **socket** is the combination of an IP address and a port, such as \`192.168.1.10:443\`. A connection is identified by source IP and port and destination IP and port.

## Practice

Choose TCP or UDP for: file download, live cricket stream, bank transfer, a multiplayer game, and say why.`,
        [q("TCP establishes a connection using:", ["A two-way ping", "A three-way handshake", "A DNS query", "A broadcast"], 1, "SYN, SYN-ACK, ACK."), q("Which protocol suits a live video call where speed matters more than perfect delivery?", ["TCP", "UDP", "FTP", "SMTP"], 1, "UDP has low overhead and no retransmission delay."), q("HTTPS uses port:", ["80", "21", "443", "25"], 2, "HTTPS defaults to TCP port 443.")],
        ["TCP is reliable and ordered; UDP is fast and light, and ports tell the OS which application gets the data.", "TCP is registered post with tracking; UDP is dropping a postcard in the box.", [["TCP", "Handshake, acknowledgements", "Reliable and ordered"], ["UDP", "No handshake", "Fast, may lose data"], ["Ports", "0 to 65535", "80 HTTP, 443 HTTPS, 22 SSH"]], "Choose the protocol by whether completeness or speed matters most.", ["TCP for correctness", "UDP for low delay", "Know the common ports"], "Using UDP for something that cannot tolerate lost data."]),
    ] },
    { title: "Addressing and Troubleshooting", lessons: [
      L("IPv4 addressing, subnet masks and CIDR", 16,
`## IPv4 addresses

An **IPv4 address** has 32 bits, written as four decimal numbers (octets) from 0 to 255: \`192.168.1.25\`. It has a **network part** and a **host part**, divided by the **subnet mask**.

## Subnet masks and CIDR

| Mask | CIDR | Meaning |
|---|---|---|
| 255.0.0.0 | /8 | 8 network bits |
| 255.255.0.0 | /16 | 16 network bits |
| 255.255.255.0 | /24 | 24 network bits, 8 host bits |

CIDR notation like \`192.168.1.0/24\` states the network and how many bits identify it.

## Counting hosts

With *h* host bits there are 2^h addresses; subtract 2 for the **network address** (all host bits 0) and the **broadcast address** (all host bits 1).

\`/24\`: host bits = 8, addresses = 256, usable hosts = **254** (192.168.1.1 to 192.168.1.254).
\`/26\`: host bits = 6, addresses = 64, usable hosts = **62**.

## Private address ranges (not routed on the Internet)

- **10.0.0.0/8**
- **172.16.0.0/12** (172.16.0.0 to 172.31.255.255)
- **192.168.0.0/16**

Special: **127.0.0.1** is **localhost** (loopback); **169.254.x.x** means a device could not get an address from DHCP.

## Default gateway

The **default gateway** is the router address a device uses to reach other networks, often the first address such as 192.168.1.1.

## IPv6

**IPv6** uses 128-bit addresses (such as \`2001:db8::1\`) to solve IPv4 exhaustion. Both are in use together.

## Practice

For 192.168.10.77/26 work out: the network address, the broadcast address and the usable host range.`,
        [q("How many usable host addresses are in a /24 network?", ["256", "254", "255", "512"], 1, "256 addresses minus network and broadcast leaves 254."), q("Which is a private IPv4 range?", ["8.8.8.0/24", "192.168.0.0/16", "100.1.1.0/24", "203.0.113.0/24"], 1, "192.168.0.0/16 is private (RFC 1918)."), q("127.0.0.1 is:", ["The default gateway", "The loopback address (localhost)", "A broadcast address", "A public DNS server"], 1, "It refers to the local machine.")],
        ["An IPv4 address has a network part and a host part, split by the subnet mask.", "Like a postcode and house number: the mask says where the postcode ends.", [["Address", "32 bits in four octets", "192.168.1.25"], ["Mask", "/24 means 24 network bits", "Defines the network"], ["Hosts", "2 to the power h minus 2", "Network and broadcast reserved"]], "CIDR tells you the size of a network at a glance.", ["/24 gives 254 hosts", "Know the private ranges", "Gateway reaches other networks"], "Forgetting that network and broadcast addresses are not usable hosts."]),
      { ...L("Challenge: how many usable hosts?", 12,
`## Your task

Subnet planning needs quick maths. Write a program that, given a CIDR prefix length for IPv4, prints the number of **usable host addresses**.

## Rules

- IPv4 has 32 bits in total.
- Host bits = 32 minus the prefix length.
- Usable hosts = 2^(host bits) minus 2.
- For /31 and /32 the formula would give 0 or negative; print \`0\` for any prefix of 31 or more.

Read one integer (the prefix length) and print the answer. Check /24 gives 254 before you submit.`,
        [q("A /26 network has how many usable hosts?", ["62", "64", "30", "126"], 0, "32-26 = 6 host bits, 64 addresses, 62 usable."), q("Host bits for /20 are:", ["12", "20", "8", "16"], 0, "32 - 20 = 12."), q("Why subtract 2 from the total addresses?", ["Network and broadcast addresses are reserved", "Two are lost on every cable", "To round numbers", "Routers use two"], 0, "The all-zero and all-one host addresses are reserved.")],
        ["Usable hosts come from the host bits: two to that power, minus the two reserved addresses.", "Like seats in a hall, minus the two reserved for staff.", [["Bits", "32 minus prefix", "Host bits"], ["Count", "2 to the host bits", "Total addresses"], ["Reserve", "Minus 2", "Network and broadcast"]], "Small prefixes give large networks and large prefixes give tiny ones.", ["Host bits = 32 - prefix", "Usable = 2^h - 2", "Handle /31 and /32"], "Printing a negative number for very small subnets."]),
        challenge: pyChallenge("Usable hosts in a subnet", "Read one integer, the IPv4 prefix length (0 to 32). Print the number of usable host addresses: 2 to the power (32 - prefix) minus 2. For prefix 31 or higher print 0.", "prefix = int(input())\n# compute usable hosts\n",
          [{ input: "24", expected: "254" }, { input: "26", expected: "62" }, { input: "30", expected: "2", hidden: true }, { input: "32", expected: "0", hidden: true }, { input: "16", expected: "65534", hidden: true }],
          ["Host bits = 32 - prefix.", "Use 2 ** host_bits.", "Use an if statement for prefixes of 31 or more."],
          "prefix = int(input())\nif prefix >= 31:\n    print(0)\nelse:\n    print(2 ** (32 - prefix) - 2)",
          "Compute the host bits, raise 2 to that power and subtract the network and broadcast addresses; tiny subnets print 0.") },
      L("DHCP, NAT, DNS and troubleshooting commands", 16,
`## DHCP

**DHCP (Dynamic Host Configuration Protocol)** automatically gives a device an **IP address, subnet mask, default gateway and DNS server**. The exchange is often remembered as **DORA**: Discover, Offer, Request, Acknowledge. Addresses are **leased** for a time.

## NAT

**Network Address Translation** lets many private devices share one public IP. The router rewrites the source address and port of outgoing packets and keeps a table to send replies to the right device. It conserves IPv4 addresses and hides internal addresses, but it is **not a firewall**.

## DNS in one line

**DNS** translates names such as \`example.com\` into IP addresses (covered in depth in the HTTP, HTTPS, DNS and APIs course).

## Troubleshooting toolkit

| Command | Windows | Linux / macOS | Use |
|---|---|---|---|
| Show IP settings | \`ipconfig /all\` | \`ip addr\` or \`ifconfig\` | Check address, gateway, DNS |
| Test reachability | \`ping 8.8.8.8\` | \`ping 8.8.8.8\` | Is the host reachable, how fast |
| Trace the path | \`tracert example.com\` | \`traceroute example.com\` | Where does it stop |
| DNS lookup | \`nslookup example.com\` | \`dig example.com\` | Check name resolution |
| Show connections | \`netstat -ano\` | \`ss -tulpn\` | Listening ports |
| Release and renew | \`ipconfig /renew\` | \`dhclient\` / NetworkManager | New DHCP lease |

## A systematic approach

1. **Ping 127.0.0.1**: is the network stack working?
2. **Ping your own IP**, then the **default gateway**: is the LAN fine?
3. **Ping 8.8.8.8**: can you reach the Internet by IP?
4. **Ping a name** like example.com: if it fails while the IP works, it is **DNS**.
5. Use traceroute to find where packets stop.

## Practice

A laptop can ping 8.8.8.8 but not google.com. State the likely problem and two commands to confirm it.`,
        [q("DHCP provides:", ["IP address, mask, gateway and DNS settings automatically", "Only passwords", "Only websites", "Only email"], 0, "DHCP configures hosts automatically."), q("If ping to 8.8.8.8 works but ping to google.com fails, the likely issue is:", ["DNS", "A broken cable", "The CPU", "The screen"], 0, "IP connectivity works, so name resolution fails."), q("NAT mainly allows:", ["Many private devices to share one public IP", "Faster typing", "Larger screens", "Free software"], 0, "It translates private to public addresses.")],
        ["DHCP gives addresses automatically, NAT shares one public address, and a few commands find the fault.", "Like a hotel desk that assigns rooms (DHCP) and uses one phone number for all guests (NAT).", [["Assign", "DHCP DORA", "Address, gateway, DNS"], ["Share", "NAT", "Private to public"], ["Test", "ping, traceroute, nslookup", "Work from near to far"]], "Test step by step from your own machine outward.", ["DORA for DHCP", "ping gateway then Internet then name", "Failures by name mean DNS"], "Restarting everything instead of testing each step."]),
    ] },
  ],
  final: [
    q("A router connects:", ["Different networks using IP", "Devices in one switch only", "Only printers", "Only monitors"], 0, "Routers forward between networks."),
    q("A switch forwards frames using:", ["MAC addresses", "Domain names", "Passwords", "Ports 80 only"], 0, "Layer 2 forwarding."),
    q("Which OSI layer handles ports and end-to-end delivery?", ["Transport", "Physical", "Data link", "Session only"], 0, "Layer 4."),
    q("Which layer deals with IP addresses?", ["Network", "Application", "Presentation", "Physical"], 0, "Layer 3."),
    q("Data at the transport layer is called a:", ["Segment", "Frame", "Packet", "Bit"], 0, "Segment (TCP) or datagram (UDP)."),
    q("TCP connection setup is:", ["Three-way handshake", "DNS query", "Broadcast", "Ping"], 0, "SYN, SYN-ACK, ACK."),
    q("Which is better for a live video call?", ["UDP", "TCP always", "FTP", "SMTP"], 0, "Low delay matters."),
    q("Port 443 is used by:", ["HTTPS", "FTP", "SMTP", "Telnet"], 0, "Secure web."),
    q("Port 22 is used by:", ["SSH", "HTTP", "DNS", "RDP"], 0, "Secure shell."),
    q("A /24 network has how many usable hosts?", ["254", "256", "255", "250"], 0, "256 minus 2."),
    q("Which is a private range?", ["10.0.0.0/8", "8.8.8.8/32", "1.1.1.1/32", "203.0.113.0/24"], 0, "RFC 1918."),
    q("127.0.0.1 is:", ["Localhost", "A public DNS", "The gateway", "A broadcast address"], 0, "Loopback."),
    q("DHCP DORA stands for:", ["Discover, Offer, Request, Acknowledge", "Deliver, Open, Route, Allow", "Domain, Object, Router, Address", "Data, Output, Read, Accept"], 0, "The four DHCP steps."),
    q("NAT allows:", ["Many private hosts to share a public IP", "Faster CPUs", "Free Wi-Fi", "Bigger disks"], 0, "Address translation."),
    q("Ping works to 8.8.8.8 but not to a domain name. Likely cause?", ["DNS problem", "Dead cable", "No power", "No IP"], 0, "Name resolution."),
  ],
  project: { title: "Capstone: design and document a small office network", brief: "Design a network for a 30-person office with a guest Wi-Fi: choose address ranges (CIDR) for staff, servers and guests, list devices (router, switch, access points, firewall), draw a diagram, explain DHCP and NAT, and write a five-step troubleshooting guide for 'the Internet is down'." },
});
