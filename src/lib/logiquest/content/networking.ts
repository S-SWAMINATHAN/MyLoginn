import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";
import { subnetting } from "./technical/generated";

const basics: RawQ[] = [
  m("A network that covers a single building or campus is a:", ["LAN", "WAN", "MAN", "PAN"], "Local Area Networks span a limited area; WANs span countries."),
  m("Which topology connects every device to a central device?", ["Star", "Bus", "Ring", "Mesh"], "In a star topology all nodes connect to a central switch or hub."),
  m("In a full mesh of n devices, how many links are needed?", ["n(n − 1)/2", "n", "n − 1", "2n"], "Every pair of devices is connected directly."),
  m2("How many links does a full mesh of 6 devices need?", ["15", "30", "6", "12"], "6 × 5 / 2 = 15.", { check: "6*5//2" }),
  m("Which transmission mode allows data in both directions at the same time?", ["Full duplex", "Half duplex", "Simplex", "Multiplex"], "A telephone call is full duplex; a walkie-talkie is half duplex."),
  m("Bandwidth is measured in:", ["bits per second", "hertz only", "bytes", "packets"], "Data rate is expressed in bps (kbps, Mbps, Gbps)."),
  m("Which device works at the physical layer and simply repeats the signal?", ["Repeater/hub", "Router", "Switch", "Gateway"], "Hubs and repeaters regenerate signals without inspecting addresses."),
  m("What is latency?", ["The time taken for data to travel from source to destination", "The amount of data sent per second", "The number of errors", "The size of a packet"], "Latency is delay; throughput is the rate of successful delivery."),
  m("Which protocol suite does the internet use?", ["TCP/IP", "OSI", "IPX/SPX", "NetBEUI"], "The internet is built on the TCP/IP protocol suite."),
];

const osi: RawQ[] = [
  m("How many layers does the OSI model have?", ["7", "5", "4", "6"], "Physical, Data Link, Network, Transport, Session, Presentation, Application."),
  m("Which OSI layer is responsible for routing packets between networks?", ["Network layer", "Data link layer", "Transport layer", "Session layer"], "The network layer (layer 3) handles logical addressing and routing."),
  m("Which OSI layer provides end-to-end reliability and flow control?", ["Transport layer", "Network layer", "Session layer", "Physical layer"], "TCP operates at the transport layer (layer 4)."),
  m("MAC addresses are used at which layer?", ["Data link layer", "Network layer", "Transport layer", "Application layer"], "Layer 2 uses physical (MAC) addresses for frames."),
  m("Encryption, compression and data format translation belong to the:", ["Presentation layer", "Session layer", "Application layer", "Transport layer"], "The presentation layer (layer 6) handles representation of data."),
  m("The unit of data at the transport layer (TCP) is called a:", ["Segment", "Frame", "Packet", "Bit"], "Segment (transport), packet (network), frame (data link), bits (physical)."),
  m("Which layer establishes, manages and terminates sessions between applications?", ["Session layer", "Transport layer", "Presentation layer", "Application layer"], "The session layer (layer 5) manages dialogues."),
  m2("A router operates at which OSI layer?", ["Layer 3", "Layer 2", "Layer 1", "Layer 4"], "Routers forward packets using IP addresses (network layer)."),
];

const tcpip: RawQ[] = [
  m("How many layers does the TCP/IP (internet) model usually have?", ["4", "7", "5", "3"], "Link (network access), Internet, Transport and Application."),
  m("Which TCP/IP layer corresponds to the OSI network layer?", ["Internet layer", "Transport layer", "Application layer", "Link layer"], "IP works at the internet layer."),
  m("Which protocol maps an IP address to a MAC address on a LAN?", ["ARP", "DNS", "DHCP", "ICMP"], "ARP (Address Resolution Protocol) resolves IPv4 addresses to MAC addresses."),
  m("The ping command uses which protocol?", ["ICMP", "TCP", "UDP", "ARP"], "ping sends ICMP Echo Request messages."),
  m("How many bits are in an IPv6 address?", ["128", "32", "64", "48"], "IPv4 uses 32 bits; IPv6 uses 128 bits."),
  m("How many bits are in a MAC address?", ["48", "32", "64", "128"], "MAC addresses are 48 bits, usually written as six hex pairs."),
  m("Which field in the IP header prevents packets from circulating forever?", ["TTL (Time To Live)", "Checksum", "Version", "Flags"], "Each router decrements TTL; the packet is discarded at 0."),
];

const ipAddressing: RawQ[] = [
  m("Which of these is a private IPv4 address?", ["192.168.1.10", "8.8.8.8", "172.32.0.5", "11.0.0.1"], "Private ranges: 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31) and 192.168.0.0/16."),
  m("What is 127.0.0.1?", ["The loopback address", "A broadcast address", "The default gateway", "A multicast address"], "127.0.0.0/8 is reserved for loopback (the local host)."),
  m("Which address range is used for multicast?", ["224.0.0.0 to 239.255.255.255", "10.0.0.0 to 10.255.255.255", "192.168.0.0 to 192.168.255.255", "0.0.0.0 to 0.255.255.255"], "Class D addresses are multicast."),
  m("What does APIPA (169.254.x.x) indicate on a Windows host?", ["The host could not obtain an address from DHCP", "The host has a static public address", "The host is a router", "The host is on IPv6"], "Automatic Private IP Addressing is used when DHCP fails."),
  m("What is NAT used for?", ["Translating private addresses to public addresses", "Encrypting traffic", "Resolving names", "Assigning MAC addresses"], "Network Address Translation lets many private hosts share public addresses."),
  m("How is the IPv6 loopback address written?", ["::1", "127.0.0.1", "FF00::", "0::0::1"], "::1 is the IPv6 loopback address."),
];

const devices: RawQ[] = [
  m("Which device forwards frames based on MAC addresses?", ["Switch", "Hub", "Router", "Repeater"], "A switch learns MAC addresses and forwards frames only to the right port."),
  m("Which device connects different networks and forwards packets by IP address?", ["Router", "Switch", "Hub", "Bridge"], "Routers work at the network layer."),
  m("Each port of a switch is a separate:", ["Collision domain", "Broadcast domain", "Subnet", "VLAN by default"], "Switches split collision domains; routers split broadcast domains."),
  m("A device that connects networks using different protocols is a:", ["Gateway", "Hub", "Repeater", "Modem"], "Gateways translate between different protocol architectures."),
  m("What does a modem do?", ["Converts digital data to analog signals and back", "Routes packets", "Switches frames", "Assigns IP addresses"], "MOdulator–DEModulator."),
  m("A firewall's main function is to:", ["Filter traffic according to security rules", "Speed up the network", "Assign IP addresses", "Convert signals"], "Firewalls permit or block traffic based on rules."),
  m("Which device regenerates a weak signal to extend cable length?", ["Repeater", "Router", "Switch", "Firewall"], "Repeaters work at the physical layer."),
];

const routing: RawQ[] = [
  m("Which routing protocol is a distance-vector protocol that uses hop count?", ["RIP", "OSPF", "BGP", "IS-IS"], "RIP's metric is hop count with a maximum of 15."),
  m("OSPF is a:", ["Link-state routing protocol", "Distance-vector protocol", "Path-vector protocol", "Static route"], "OSPF uses Dijkstra's shortest path first algorithm."),
  m("Which protocol routes traffic between autonomous systems on the internet?", ["BGP", "RIP", "OSPF", "EIGRP"], "BGP is the exterior gateway protocol of the internet."),
  m("What is the default route in IPv4?", ["0.0.0.0/0", "255.255.255.255/32", "127.0.0.0/8", "192.168.0.0/16"], "The default route matches any destination not in the table."),
  m("A static route is:", ["Manually configured by an administrator", "Learned automatically from neighbours", "Used only in IPv6", "Always preferred over everything"], "Static routes do not adapt to failures automatically."),
  m("What is the maximum hop count in RIP before a route is considered unreachable?", ["15 (16 = unreachable)", "255", "8", "100"], "RIP treats 16 hops as infinity."),
  m2("Routing tables choose a route by:", ["Longest prefix match", "Shortest prefix match", "Random selection", "Alphabetical order"], "The most specific matching prefix wins."),
];

const switching: RawQ[] = [
  m("What is a VLAN?", ["A logical grouping of switch ports into a separate broadcast domain", "A wireless LAN", "A virtual router", "A VPN tunnel"], "VLANs segment a switch into multiple logical networks."),
  m("Which standard adds VLAN tags to Ethernet frames?", ["IEEE 802.1Q", "IEEE 802.11", "IEEE 802.3u", "IEEE 802.15"], "802.1Q inserts a 4-byte tag carrying the VLAN ID."),
  m("A port that carries traffic for multiple VLANs between switches is a:", ["Trunk port", "Access port", "Console port", "Mirror port"], "Access ports belong to one VLAN; trunks carry many."),
  m("Which protocol prevents loops in switched networks?", ["Spanning Tree Protocol (STP)", "ARP", "VTP", "DHCP"], "STP blocks redundant paths to prevent broadcast storms."),
  m("How does a switch learn which port a device is on?", ["From the source MAC address of incoming frames", "From the destination IP address", "From DHCP", "From DNS"], "It records source MAC → port in its MAC address table."),
  m("Communication between two different VLANs requires:", ["A router or a layer-3 switch", "A hub", "A repeater", "Nothing extra"], "Inter-VLAN routing is needed because VLANs are separate networks."),
];

const appProtocols: RawQ[] = [
  m("Which protocol translates domain names to IP addresses?", ["DNS", "DHCP", "FTP", "SMTP"], "The Domain Name System resolves names like example.com."),
  m("Which protocol automatically assigns IP addresses to hosts?", ["DHCP", "DNS", "ARP", "SNMP"], "Dynamic Host Configuration Protocol."),
  m("HTTPS uses which default port?", ["443", "80", "21", "25"], "HTTP 80, HTTPS 443, FTP 21, SMTP 25, SSH 22, DNS 53."),
  m("Which protocol is used to send email between servers?", ["SMTP", "POP3", "IMAP", "HTTP"], "SMTP sends mail; POP3 and IMAP retrieve it."),
  m("SSH uses port:", ["22", "23", "21", "443"], "Telnet uses 23; SSH (secure) uses 22."),
  m("DNS queries normally use which transport protocol and port?", ["UDP port 53", "TCP port 80", "UDP port 67", "TCP port 25"], "DNS uses UDP 53 (TCP 53 for large responses and zone transfers)."),
  m("Which HTTP status code means 'Not Found'?", ["404", "200", "500", "301"], "2xx success, 3xx redirect, 4xx client error, 5xx server error."),
  m("Which HTTP method is used to submit data to create a resource?", ["POST", "GET", "HEAD", "OPTIONS"], "POST sends a body to be processed; GET retrieves."),
];

const transport: RawQ[] = [
  m("Which transport protocol is connection-oriented and reliable?", ["TCP", "UDP", "IP", "ICMP"], "TCP provides ordered, reliable delivery with acknowledgements."),
  m("Which protocol is preferred for live video or online gaming?", ["UDP", "TCP", "FTP", "SMTP"], "UDP has lower latency; occasional loss is acceptable."),
  m("How does TCP establish a connection?", ["Three-way handshake: SYN, SYN-ACK, ACK", "Two-way handshake", "Four-way handshake: SYN, ACK, FIN, ACK", "No handshake"], "Connection teardown uses FIN/ACK in four steps."),
  m("A port number is a:", ["16-bit number identifying an application endpoint", "32-bit address of a host", "48-bit hardware address", "8-bit protocol number"], "Ports range from 0 to 65535."),
  m("What is the purpose of TCP's sliding window?", ["Flow control — limiting unacknowledged data in transit", "Encryption", "Routing", "Addressing"], "The receiver advertises how much data it can accept."),
  m2("Which mechanism does TCP use to react to network congestion?", ["Slow start and congestion avoidance", "Longest prefix match", "Spanning tree", "ARP caching"], "TCP grows and shrinks its congestion window based on loss and acknowledgements."),
];

const wireless: RawQ[] = [
  m("Which IEEE standard family defines Wi-Fi?", ["802.11", "802.3", "802.15", "802.1Q"], "802.3 is Ethernet; 802.15 covers Bluetooth/PAN."),
  m("Which Wi-Fi security protocol is the most secure of these?", ["WPA3", "WEP", "WPA", "Open"], "WEP is broken; WPA3 is the current standard."),
  m("What is an SSID?", ["The name of a wireless network", "A MAC address", "An encryption key", "A frequency"], "The Service Set Identifier names the WLAN."),
  m("Bluetooth is typically used for a:", ["Personal Area Network (PAN)", "Wide Area Network", "Metropolitan Area Network", "Storage Area Network"], "PANs connect devices around one person."),
  m("Which two frequency bands are most common for Wi-Fi?", ["2.4 GHz and 5 GHz", "900 MHz and 1.8 GHz", "60 GHz and 100 GHz", "AM and FM"], "Wi-Fi 6E also adds 6 GHz."),
  m("Wireless LANs use which access method to avoid collisions?", ["CSMA/CA", "CSMA/CD", "Token passing", "ALOHA only"], "Collision Avoidance is used because radios cannot detect collisions while transmitting."),
];

const security: RawQ[] = [
  m("What does a VPN provide?", ["An encrypted tunnel over a public network", "Faster internet", "A static IP only", "Virus removal"], "VPNs protect traffic between endpoints across untrusted networks."),
  m("A DDoS attack aims to:", ["Make a service unavailable by overwhelming it with traffic", "Steal passwords silently", "Encrypt files for ransom", "Guess Wi-Fi keys"], "Distributed denial of service floods targets from many sources."),
  m("Phishing is:", ["Tricking users into revealing information via fake messages or sites", "Scanning ports", "Sniffing Wi-Fi", "Breaking encryption mathematically"], "Phishing is social engineering."),
  m("Which uses a public key and a private key?", ["Asymmetric encryption", "Symmetric encryption", "Hashing", "Encoding"], "Examples: RSA, ECC. Symmetric encryption (AES) uses one shared key."),
  m("What does a digital certificate bind together?", ["A public key and an identity, signed by a certificate authority", "A password and a username", "A MAC and an IP address", "Two private keys"], "Certificates let browsers verify HTTPS sites."),
  m("Which attack intercepts communication between two parties?", ["Man-in-the-middle", "Brute force", "SQL injection", "Denial of service"], "The attacker relays (and may alter) messages between victims."),
  m("Hashing is used for passwords because:", ["It is one-way, so stored hashes do not reveal passwords", "It is reversible", "It compresses data", "It is fast to reverse"], "Salted, slow hashes (bcrypt, Argon2) are recommended."),
];

const subject: RawSubject = {
  "networking-basics": topic(basics, { intro: "A computer network connects devices to share data and resources. Networks are classified by size (PAN, LAN, MAN, WAN) and topology (bus, star, ring, mesh, tree, hybrid)." }),
  "osi-model": topic(osi, { intro: "The OSI reference model has seven layers.", formulas: [{ h: "Layers (top to bottom)", points: ["7 Application — HTTP, FTP, SMTP, DNS", "6 Presentation — encryption, compression, formats", "5 Session — dialogue control", "4 Transport — TCP/UDP, segments, ports", "3 Network — IP, routing, packets", "2 Data link — MAC, switches, frames", "1 Physical — bits, cables, hubs"] }] }),
  "tcp-ip-model": topic(tcpip, { intro: "The TCP/IP model has four layers: Link, Internet (IP, ICMP, ARP), Transport (TCP, UDP) and Application (HTTP, DNS, …)." }),
  "ip-addressing": topic(ipAddressing, { intro: "An IPv4 address has 32 bits written as four octets. Classful ranges: A 1–126, B 128–191, C 192–223, D (multicast) 224–239, E 240–255.", formulas: [{ h: "Special addresses", points: ["Private: 10/8, 172.16/12, 192.168/16", "Loopback: 127.0.0.0/8; IPv6 ::1", "APIPA: 169.254.0.0/16", "Limited broadcast: 255.255.255.255"] }] }),
  subnetting: topic(subnetting, { intro: "Subnetting divides a network by borrowing host bits for the network part.", formulas: [{ h: "Formulas", points: ["Mask /n has n leading 1-bits", "Usable hosts = 2^(32 − n) − 2", "Number of subnets when borrowing b bits = 2^b", "Network address = IP AND mask; broadcast = network with all host bits 1"], example: "192.168.10.77/26: block size 64, so the network is 192.168.10.64 and the broadcast 192.168.10.127; 62 usable hosts." }] }),
  "network-devices": topic(devices, { intro: "Hubs and repeaters (layer 1), bridges and switches (layer 2), routers (layer 3), and gateways and firewalls connect and protect networks." }),
  routing: topic(routing, { intro: "Routing chooses paths for packets. Routes are static or learned with protocols: distance-vector (RIP), link-state (OSPF, IS-IS) or path-vector (BGP)." }),
  "switching-and-vlans": topic(switching, { intro: "Switches forward frames by MAC address. VLANs create separate broadcast domains on the same switches; trunks carry multiple VLANs; STP prevents loops." }),
  "application-layer-protocols": topic(appProtocols, { intro: "Common protocols and ports: HTTP 80, HTTPS 443, FTP 20/21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67/68, POP3 110, IMAP 143, SNMP 161." }),
  "transport-layer": topic(transport, { intro: "TCP gives reliable, ordered, connection-oriented delivery with flow and congestion control; UDP is connectionless and lightweight." }),
  "wireless-networks": topic(wireless, { intro: "Wireless LANs follow IEEE 802.11 (Wi-Fi), use CSMA/CA and should be secured with WPA2/WPA3." }),
  "network-security": topic(security, { intro: "Network security protects confidentiality, integrity and availability with firewalls, encryption, VPNs, authentication and monitoring." }),
};
export default subject;
