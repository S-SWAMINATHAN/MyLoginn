import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "cloud-computing-fundamentals", title: "Cloud Computing Fundamentals", category: "Cloud & DevOps", track: "cloud-devops", level: "Beginner", weeks: 3,
  description: "Understand cloud computing from the ground up: the five essential characteristics, IaaS, PaaS and SaaS, public, private and hybrid clouds, regions and availability zones, pricing, the shared responsibility model and how to choose a provider.",
  audience: "Students, developers, testers, support engineers and managers who want a vendor-neutral foundation before learning AWS, Azure or Google Cloud.",
  prereq: "Computer Fundamentals and Networking Fundamentals are helpful.",
  objectives: ["Define cloud computing and its five essential characteristics", "Compare IaaS, PaaS, SaaS and serverless with examples", "Describe public, private, hybrid and multi-cloud models", "Explain regions, availability zones and why they matter for resilience", "Estimate and control cloud costs using pay-as-you-go principles", "Explain the shared responsibility model and basic cloud security"],
  tags: ["Cloud Computing", "IaaS", "PaaS", "SaaS", "AWS", "Azure", "Google Cloud"], relatedSlugs: ["networking-fundamentals", "cybersecurity-fundamentals"],
  modules: [
    { title: "What the Cloud Is", lessons: [
      L("Cloud computing defined", 12,
`## The idea

**Cloud computing** is the on-demand delivery of computing resources (servers, storage, databases, networking, software and AI services) over the Internet, with **pay-as-you-go** pricing. Instead of buying and running your own data centre, you rent what you need from a provider such as **AWS, Microsoft Azure or Google Cloud**.

## Five essential characteristics (NIST)

1. **On-demand self-service:** you create resources yourself in minutes.
2. **Broad network access:** use them from anywhere over the network.
3. **Resource pooling:** the provider serves many customers from shared infrastructure.
4. **Rapid elasticity:** scale up or down quickly, even automatically.
5. **Measured service:** usage is metered and billed accordingly.

## Why organisations move to the cloud

| Benefit | Meaning |
|---|---|
| **Speed** | Launch a server or database in minutes |
| **Cost model** | Operating expense instead of large upfront hardware purchases |
| **Scalability** | Handle a sale-day spike without owning peak capacity |
| **Reliability** | Providers run many locations with redundancy |
| **Global reach** | Deploy near users around the world |
| **Innovation** | Ready-made AI, analytics and security services |

## Trade-offs

Costs can **grow unexpectedly** if unmanaged, you depend on the **provider and your Internet connection**, some data must stay in certain **countries by law**, and skills in cloud design and security are required.

## Cloud versus traditional hosting

Traditional: buy servers, install, maintain, replace. Cloud: provision, pay for use, delete when done. The shift is from **owning** to **renting capacity**.

## Practice

A college wants to host its admission portal, which is busy for two weeks a year. Explain three reasons the cloud suits this workload.`,
        [q("Which characteristic lets you add capacity quickly during a traffic spike?", ["Rapid elasticity", "Resource pooling", "Measured service only", "Broad access only"], 0, "Elasticity scales resources up or down on demand."), q("Pay-as-you-go pricing comes from:", ["Measured service", "On-demand self-service only", "Hardware ownership", "Fixed contracts only"], 0, "Usage is metered and billed."), q("A real risk of the cloud is:", ["Unexpected costs if not managed", "No Internet needed", "No security tools", "No scaling"], 0, "Unmonitored resources can run up bills.")],
        ["Cloud computing rents on-demand computing over the Internet and bills for what you use.", "Like electricity: you do not build a power station, you plug in and pay for the units used.", [["Rent", "On-demand and metered", "Pay for what you use"], ["Scale", "Rapid elasticity", "Grow and shrink"], ["Share", "Pooled infrastructure", "Provider runs it"]], "The cloud trades ownership for flexibility.", ["Five NIST characteristics", "Speed, scale, reach", "Watch costs"], "Leaving unused resources running and paying for them."]),
      L("Service models: IaaS, PaaS, SaaS and serverless", 14,
`## The stack and who manages what

| Layer | On-premises | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Application | You | You | You | **Provider** |
| Data | You | You | You | You (your content) |
| Runtime | You | You | **Provider** | Provider |
| Operating system | You | You | **Provider** | Provider |
| Virtualisation, servers, storage, network | You | **Provider** | Provider | Provider |

## IaaS: Infrastructure as a Service

You rent **virtual machines, storage and networks** and manage the OS and above. Maximum control and responsibility. Examples: **Amazon EC2, Azure Virtual Machines, Google Compute Engine**.

## PaaS: Platform as a Service

You deploy **code** and the platform runs it, patches the OS and scales it. Examples: **AWS Elastic Beanstalk, Azure App Service, Google App Engine, Heroku**.

## SaaS: Software as a Service

You use a **finished application** over the web by subscription. Examples: **Gmail, Microsoft 365, Salesforce, Zoom**.

## Serverless (FaaS)

You write **functions** that run when triggered (an upload, an HTTP request, a schedule) and pay **per execution**. There are still servers, but you do not manage them. Examples: **AWS Lambda, Azure Functions, Google Cloud Functions**. Great for event-driven, spiky workloads; watch execution time limits and cold starts.

## Containers and Kubernetes (a middle path)

**Containers** package an app with its dependencies; **Kubernetes** runs and scales many containers. Managed services (EKS, AKS, GKE) reduce the work.

## Choosing

- Need full control or lift-and-shift of legacy systems: **IaaS**.
- Want to focus on code: **PaaS** or **serverless**.
- Need a standard tool such as email or CRM: **SaaS**.

## Practice

Classify: Google Docs, a Linux server you rent, AWS Lambda, Azure App Service, Zoom.`,
        [q("Gmail is an example of:", ["IaaS", "PaaS", "SaaS", "On-premises"], 2, "A finished application delivered over the web is SaaS."), q("In IaaS who manages the operating system?", ["The customer", "The provider always", "Nobody", "The ISP"], 0, "IaaS gives you VMs; you manage the OS and above."), q("Serverless functions are typically billed:", ["Per execution", "Per year only", "Per desk", "Per cable"], 0, "You pay for runs and resources used.")],
        ["IaaS rents machines, PaaS runs your code, SaaS delivers finished software and serverless runs functions.", "Like food: buy ingredients (IaaS), use a meal kit (PaaS), order a finished meal (SaaS).", [["IaaS", "VMs, storage, network", "You manage the OS"], ["PaaS", "Platform for your code", "Provider manages the runtime"], ["SaaS", "Finished app", "You just use it"]], "The higher the service level, the less you manage and the less control you have.", ["IaaS gives control", "PaaS saves effort", "SaaS is ready to use"], "Choosing IaaS for a simple app and then spending weeks patching servers."]),
      L("Deployment models and global infrastructure", 13,
`## Deployment models

| Model | Description | Typical reason |
|---|---|---|
| **Public cloud** | Shared infrastructure owned by a provider | Speed, scale, cost |
| **Private cloud** | Dedicated to one organisation, on-premises or hosted | Control, strict compliance |
| **Hybrid cloud** | Public and private connected together | Keep sensitive data local, burst to public |
| **Multi-cloud** | Several public providers | Avoid lock-in, best-of-breed services |
| **Community cloud** | Shared by organisations with common needs | Government or research groups |

## Regions and availability zones

- A **region** is a geographic area with several data centres (for example Mumbai, Hyderabad, Singapore).
- An **availability zone (AZ)** is one or more separate data centres inside a region, with independent power and networking, connected by fast links.

Design for resilience by running across **at least two AZs**; a failure in one zone then does not take the application down. Use **multiple regions** for disaster recovery or to serve users globally.

## Edge and CDN

A **content delivery network (CDN)** caches content in many locations close to users, reducing delay and load. **Edge computing** runs code near users or devices.

## Data residency and compliance

Laws may require data to stay in a country or follow standards (India's data protection rules, GDPR, HIPAA, PCI DSS). Choose regions and services accordingly and document where data lives.

## Vendor lock-in

Deep use of one provider's special services makes moving costly. Reduce it with **open standards, containers, portable data formats and clear exit plans**, but accept some lock-in when the benefits are worth it.

## Practice

An e-commerce site serves mainly India with customers in Singapore. Propose regions, AZ usage and whether to use a CDN.`,
        [q("An availability zone is:", ["One or more separate data centres within a region", "A whole country", "A single server", "A virtual disk"], 0, "AZs are isolated data centre groups inside a region."), q("A hybrid cloud:", ["Connects public and private environments", "Uses only one data centre", "Has no network", "Is a mobile app"], 0, "It combines private and public resources."), q("Why spread an app across two AZs?", ["To survive the failure of one zone", "To reduce the app size", "To avoid users", "To remove backups"], 0, "Independent zones improve resilience.")],
        ["Clouds are public, private, hybrid or multi-cloud, and regions with several zones give resilience.", "Like a bank with branches in several buildings: one flood does not close everything.", [["Models", "Public, private, hybrid", "Match control and cost needs"], ["Regions", "Geographic areas", "Choose near users and laws"], ["Zones", "Independent data centres", "Spread for resilience"]], "Design for failure by using several zones, and respect data residency rules.", ["Use at least two AZs", "Check data residency", "Plan for lock-in"], "Running everything in a single zone and being surprised by an outage."]),
    ] },
    { title: "Using the Cloud Well", lessons: [
      L("Pricing, cost control and the shared responsibility model", 15,
`## How cloud pricing works

| Model | Description | Best for |
|---|---|---|
| **On-demand** | Pay by the second or hour with no commitment | Variable or new workloads |
| **Reserved / committed use** | Commit for 1 to 3 years for a discount | Steady workloads |
| **Spot / preemptible** | Spare capacity at deep discounts but can be reclaimed | Fault-tolerant batch jobs |
| **Free tier** | Limited free usage for learning | Practice and small projects |

You usually pay for **compute time, storage, data transfer out of the cloud, requests and managed service features**.

## Controlling cost

1. **Tag resources** by project and owner so you can see who spends what.
2. **Set budgets and alerts** before you start.
3. **Right-size** machines: use smaller instances if usage is low.
4. **Turn off or delete** unused resources (a forgotten VM or disk still bills).
5. Use **auto scaling** and **schedules** (shut dev environments at night).
6. Choose **cheaper storage tiers** for rarely used data.
7. Review the **billing dashboard** weekly. This discipline is called **FinOps**.

## Shared responsibility model

Security is shared:

- **The provider is responsible for security *of* the cloud:** physical data centres, hardware, the virtualisation layer and managed-service internals.
- **You are responsible for security *in* the cloud:** your data, identities and access, configuration, operating systems you manage, network rules and application code.

The most common cloud breaches are **customer misconfigurations**, such as a publicly readable storage bucket, an over-permissive access role or an exposed database.

## Basic cloud security habits

- Enable **MFA** and protect the root or owner account.
- Apply **least privilege** with IAM roles.
- **Encrypt** data at rest and in transit.
- Keep **logs** on and review them.
- Do **not hard-code secrets** in code; use a secrets manager.

## Practice

You start a free-tier VM for practice. List five steps to avoid a surprise bill and two security settings to check immediately.`,
        [q("Which statement matches the shared responsibility model?", ["The provider secures the cloud; you secure what you put in it", "The provider does everything", "You secure the data centre building", "No one is responsible"], 0, "Responsibilities are split between provider and customer."), q("Which pricing option gives a discount for a 1 to 3 year commitment?", ["Reserved or committed use", "On-demand", "Free tier", "Spot only"], 0, "Commitments lower the price for steady workloads."), q("A common cause of cloud data breaches is:", ["Customer misconfiguration such as public storage", "Solar flares", "Provider building fires only", "Too many users"], 0, "Misconfiguration is the leading cause.")],
        ["Pay for what you use, control it with budgets and tags, and secure your side of the shared responsibility model.", "Like renting an apartment: the owner maintains the building, but you lock your own door.", [["Price", "On-demand, reserved, spot", "Match the workload"], ["Control", "Tags, budgets, right-sizing", "Delete the unused"], ["Secure", "Shared responsibility", "Your data, access, config"]], "Cost and security both need ongoing attention.", ["Set budgets and alerts", "Avoid public buckets", "Use MFA and least privilege"], "Leaving a test environment running all month and not noticing the bill."]),
      { ...L("Choosing a provider and starting your cloud journey", 14,
`## The big three and others

| Provider | Strengths |
|---|---|
| **Amazon Web Services (AWS)** | Largest service catalogue and market share |
| **Microsoft Azure** | Deep integration with Microsoft products and enterprise identity |
| **Google Cloud (GCP)** | Data analytics, machine learning and Kubernetes |
| **Others** | Oracle Cloud, IBM Cloud, DigitalOcean, regional providers |

Core services have **equivalents** across providers:

| Need | AWS | Azure | Google Cloud |
|---|---|---|---|
| Virtual machines | EC2 | Virtual Machines | Compute Engine |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Managed SQL | RDS | Azure SQL | Cloud SQL |
| Functions | Lambda | Functions | Cloud Functions |
| Containers (Kubernetes) | EKS | AKS | GKE |
| Identity and access | IAM | Entra ID / RBAC | IAM |

## How to choose

Consider **existing skills**, **required services**, **pricing**, **regions and compliance**, **support**, **ecosystem and partners** and the cost of **switching later**.

## Learning path

1. Learn the concepts in this course.
2. Open a **free-tier account** with a billing alert.
3. Build a **simple static website**, then a **VM with a web server**, then a **database**.
4. Learn **IAM, networking and monitoring**.
5. Earn a **foundational certification** (AWS Cloud Practitioner, Azure AZ-900, Google Cloud Digital Leader).
6. Move on to **Linux, Docker, CI/CD and infrastructure as code**.

## Careers

Cloud engineer, DevOps engineer, solutions architect, site reliability engineer, cloud security engineer, FinOps analyst.

## A small exercise in code

Cloud bills are arithmetic on usage. The challenge estimates a monthly bill from hours and rates, the kind of quick check you would do before launching resources.`,
        [q("Which service is AWS's object storage?", ["S3", "EC2", "Lambda", "IAM"], 0, "S3 stores objects such as files and backups."), q("Azure's equivalent of AWS Lambda is:", ["Azure Functions", "Blob Storage", "Azure SQL", "AKS"], 0, "Azure Functions provides serverless functions."), q("A sensible first step when opening a cloud account is:", ["Set a billing alert", "Create 100 servers", "Share the password", "Disable MFA"], 0, "Alerts prevent surprise bills.")],
        ["The big providers offer similar services under different names, so learn concepts first.", "Like different phone brands: same ideas, different menus.", [["Compare", "AWS, Azure, Google Cloud", "Equivalent services"], ["Choose", "Skills, services, cost", "Region and compliance"], ["Learn", "Free tier and labs", "Billing alerts first"]], "Concepts transfer between clouds; pick one to practise.", ["Know service equivalents", "Set billing alerts", "Start with foundational certifications"], "Opening a cloud account without any budget or alert."]),
        challenge: pyChallenge("Estimate a cloud bill", "Read three numbers on separate lines: the number of virtual machines, the hours each runs in the month, and the price per VM-hour in rupees (a decimal). Print the total monthly cost rounded to 2 decimal places, formatted like 123.45.", "vms = int(input())\nhours = int(input())\nrate = float(input())\n# print the total cost with 2 decimals\n",
          [{ input: "2\n730\n1.5", expected: "2190.00" }, { input: "3\n100\n0.25", expected: "75.00" }, { input: "1\n24\n0.1", expected: "2.40", hidden: true }, { input: "10\n8\n12.75", expected: "1020.00", hidden: true }],
          ["Total = vms * hours * rate.", "Use an f-string with :.2f for two decimals.", "Convert the rate with float()."],
          "vms = int(input())\nhours = int(input())\nrate = float(input())\nprint(f'{vms * hours * rate:.2f}')",
          "Multiply machines by hours by rate and format to two decimal places.") },
    ] },
  ],
  final: [
    q("Cloud computing is:", ["On-demand computing resources over the Internet with metered billing", "Owning all hardware", "A type of weather", "A printer"], 0, "On-demand, metered."),
    q("Rapid elasticity means:", ["Scaling up and down quickly", "Fixed capacity", "No network", "One server only"], 0, "Scale on demand."),
    q("Gmail is:", ["SaaS", "IaaS", "PaaS", "On-premises"], 0, "Finished application."),
    q("In IaaS the customer manages:", ["The OS and above", "Nothing", "Only hardware", "Only power"], 0, "VMs are yours to manage."),
    q("PaaS is best when you:", ["Want to deploy code without managing servers", "Need to design chips", "Want email only", "Need a printer"], 0, "Platform runs your code."),
    q("Serverless functions are billed:", ["Per execution", "Per desk", "Per cable", "Per year only"], 0, "Pay per run."),
    q("A region contains:", ["Multiple availability zones", "A single cable", "One laptop", "No data centres"], 0, "Regions have several AZs."),
    q("Spreading across two AZs protects against:", ["Failure of one zone", "All laws", "High prices", "Slow users"], 0, "Resilience."),
    q("Hybrid cloud:", ["Connects public and private environments", "Is public only", "Is private only", "Is a phone"], 0, "Combination."),
    q("A CDN:", ["Caches content near users", "Prints documents", "Stores passwords", "Repairs servers"], 0, "Reduces latency."),
    q("Reserved pricing gives:", ["A discount for a time commitment", "Free usage forever", "No bill", "Unlimited scaling"], 0, "Commitment discount."),
    q("The shared responsibility model says:", ["Provider secures the cloud; you secure what you put in it", "Provider secures everything", "You secure buildings", "Nobody is responsible"], 0, "Split responsibilities."),
    q("Which are good cost controls? (select all that apply)", ["Budgets and alerts", "Tagging resources", "Deleting unused resources", "Leaving test VMs on"], [0, 1, 2], "Do not leave test VMs running."),
    q("A frequent cloud breach cause is:", ["Misconfiguration", "Sunlight", "Cable colour", "Keyboard type"], 0, "Public buckets and open access."),
    q("AWS's object storage service is:", ["S3", "EC2", "Lambda", "IAM"], 0, "S3."),
  ],
  project: { title: "Capstone: cloud proposal for a small business", brief: "Choose a small business (a clinic, a tuition centre or a shop). Propose a cloud solution: which workloads, which service models (IaaS, PaaS, SaaS, serverless), which provider and regions, expected monthly cost with assumptions, security responsibilities and a backup and disaster plan." },
});
