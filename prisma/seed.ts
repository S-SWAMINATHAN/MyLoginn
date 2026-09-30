import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const mentorPassword = process.env.SEED_MENTOR_PASSWORD;
  const studentPassword = process.env.SEED_STUDENT_PASSWORD;

  if (!adminPassword || !mentorPassword || !studentPassword) {
    throw new Error("SEED_ADMIN_PASSWORD, SEED_MENTOR_PASSWORD, and SEED_STUDENT_PASSWORD are required to seed users.");
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const mentorPasswordHash = await bcrypt.hash(mentorPassword, 10);
  const studentPasswordHash = await bcrypt.hash(studentPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@myloginn.ai" },
    update: {},
    create: {
      name: "Meera Nair",
      email: "admin@myloginn.ai",
      phone: "+919876500001",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      emailVerified: true,
      avatarColor: "#6c4dff",
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: "mentor@myloginn.ai" },
    update: {},
    create: {
      name: "Rahul Verma",
      email: "mentor@myloginn.ai",
      phone: "+919876500002",
      passwordHash: mentorPasswordHash,
      role: "MENTOR",
      emailVerified: true,
      avatarColor: "#06b6d4",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@myloginn.ai" },
    update: {},
    create: {
      name: "Ananya Iyer",
      email: "student@myloginn.ai",
      phone: "+919876500003",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      emailVerified: true,
      avatarColor: "#f97316",
      grade: "10th Grade",
      board: "CBSE",
    },
  });

  const courses = [
    {
      title: "AI-Powered Digital Marketing Mastery",
      slug: "ai-digital-marketing-mastery",
      category: "Digital Marketing",
      level: "Intermediate",
      description: "Master AI-driven campaigns, SEO, and paid ads with hands-on live sessions.",
      longDescription:
        "A comprehensive program covering AI content generation, programmatic ad buying, marketing automation, and analytics-driven decision making. Includes live mentor sessions and a placement-ready portfolio.",
      instructor: "Kavya Reddy",
      instructorTitle: "Ex-Growth Lead, Flipkart",
      durationWeeks: 10,
      price: 14999,
      originalPrice: 24999,
      rating: 4.9,
      studentsCount: 8400,
      imageColor: "#6c4dff",
      tags: JSON.stringify(["AI", "SEO", "Ads", "Automation"]),
      syllabus: JSON.stringify([
        "Foundations of AI in Marketing",
        "SEO & Content Strategy with AI",
        "Paid Social & Programmatic Ads",
        "Marketing Automation & CRM",
        "Analytics, A/B Testing & Reporting",
        "Capstone Campaign & Placement Prep",
      ]),
      featured: true,
    },
    {
      title: "Machine Learning & Deep Learning Foundations",
      slug: "machine-learning-deep-learning-foundations",
      category: "AI & ML",
      level: "Beginner",
      description: "Learn machine learning and deep learning with Python, modern AI frameworks, practical datasets and portfolio projects.",
      longDescription:
        "Progress from Python, statistics and data preparation to supervised and unsupervised learning, neural networks, computer vision and transformer-based NLP. Work with scikit-learn, PyTorch and Hugging Face, compare model quality, and build deployable projects with responsible AI practices and mentor code reviews.",
      instructor: "Dr. Arjun Mehta",
      instructorTitle: "AI Researcher, IIT Alumnus",
      durationWeeks: 12,
      price: 17999,
      originalPrice: 27999,
      rating: 4.8,
      studentsCount: 6200,
      imageColor: "#06b6d4",
      tags: JSON.stringify(["Python", "scikit-learn", "PyTorch", "Hugging Face", "Deep Learning"]),
      syllabus: JSON.stringify([
        "Python, NumPy, pandas & ML mathematics",
        "Data preparation and supervised learning with scikit-learn",
        "Unsupervised learning, evaluation and model selection",
        "Neural networks and deep learning with PyTorch",
        "Computer vision, NLP and transformer models with Hugging Face",
        "Responsible AI, model deployment and capstone project",
      ]),
      featured: true,
    },
    {
      title: "Generative AI for Business Growth",
      slug: "generative-ai-business-growth",
      category: "AI & ML",
      level: "Advanced",
      description: "Apply LLMs and generative tools to automate workflows and scale operations.",
      longDescription:
        "Learn prompt engineering, RAG pipelines, AI agents, and how to deploy generative AI safely inside real business workflows.",
      instructor: "Priya Nambiar",
      instructorTitle: "Head of AI Product, SaaS Startup",
      durationWeeks: 8,
      price: 19999,
      originalPrice: 29999,
      rating: 4.9,
      studentsCount: 3100,
      imageColor: "#8874ff",
      tags: JSON.stringify(["LLMs", "Prompt Engineering", "Agents", "RAG"]),
      syllabus: JSON.stringify([
        "LLM Fundamentals",
        "Prompt Engineering Patterns",
        "RAG & Vector Databases",
        "Building AI Agents",
        "Deploying Responsibly",
        "Capstone Business Case",
      ]),
      featured: true,
    },
    {
      title: "Data Analytics & Visualization with AI",
      slug: "data-analytics-visualization-ai",
      category: "Data Analytics",
      level: "Beginner",
      description: "Turn raw data into clear insights with Excel, SQL, Python, dashboards and responsible AI-assisted analysis.",
      longDescription:
        "Learn an end-to-end analytics workflow: define useful questions, clean and validate data, query with SQL, analyze with Excel and Python, and communicate findings through clear dashboards. Practice pandas, visualization, and common BI workflows, with AI assistants for drafting queries, explaining code and exploring data. Verify AI-generated results, protect sensitive information and present a portfolio-ready business analysis.",
      instructor: "Kavya Reddy",
      instructorTitle: "Data & Growth Analytics Mentor",
      durationWeeks: 10,
      price: 14999,
      originalPrice: 22999,
      rating: 4.8,
      studentsCount: 0,
      imageColor: "#0ea5a4",
      tags: JSON.stringify(["Excel", "SQL", "Python", "pandas", "Power BI", "AI Analytics"]),
      syllabus: JSON.stringify([
        "Analytics foundations, data questions and spreadsheet skills",
        "SQL queries, joins, aggregation and data quality checks",
        "Python, pandas and exploratory data analysis",
        "Charts, dashboards and insight storytelling",
        "AI-assisted analysis, verification and privacy",
        "Business analytics capstone and portfolio presentation",
      ]),
      featured: false,
    },
    {
      title: "Internet of Things (IoT) & Smart Devices",
      slug: "iot-smart-devices",
      category: "IoT",
      level: "Beginner",
      description: "Build connected-device prototypes with sensors, microcontrollers, networking and cloud dashboards.",
      longDescription:
        "Explore the complete IoT pipeline by connecting sensors and actuators to a microcontroller, sending device data over common protocols, and presenting it in a cloud-connected dashboard. Practice embedded programming, MQTT, APIs, basic edge processing and device security. Use AI coding assistants to understand libraries and troubleshoot prototypes, then verify generated code against hardware behavior and safety requirements.",
      instructor: "Sandeep Kulkarni",
      instructorTitle: "Embedded Systems & Cloud Mentor",
      durationWeeks: 10,
      price: 16999,
      originalPrice: 24999,
      rating: 4.8,
      studentsCount: 0,
      imageColor: "#f59e0b",
      tags: JSON.stringify(["IoT", "Sensors", "ESP32", "MQTT", "Cloud", "Edge AI"]),
      syllabus: JSON.stringify([
        "IoT architecture, electronics and sensor fundamentals",
        "Microcontroller programming and device prototyping",
        "Connectivity, MQTT, APIs and messaging",
        "Cloud ingestion, dashboards and alerts",
        "Device security, reliability and edge computing",
        "Connected-device capstone project",
      ]),
      featured: false,
    },
    {
      title: "Prompt Engineering for Generative AI",
      slug: "prompt-engineering-generative-ai",
      category: "AI & ML",
      level: "Intermediate",
      description: "Write, test and improve prompts for text, research, coding and multimodal AI workflows.",
      longDescription:
        "Learn to work effectively with leading generative AI assistants, including ChatGPT, Claude and Gemini, plus research tools such as Perplexity and image-generation workflows. Practice clear instructions, context design, examples, structured outputs, tool use and evaluation. Build reusable prompts for analysis, writing, coding and multimodal tasks; compare model responses, reduce hallucinations through verification, and handle privacy, bias and attribution responsibly. Tool availability and features can change over time.",
      instructor: "Priya Nambiar",
      instructorTitle: "AI Product & Workflow Mentor",
      durationWeeks: 6,
      price: 11999,
      originalPrice: 17999,
      rating: 4.8,
      studentsCount: 0,
      imageColor: "#8b5cf6",
      tags: JSON.stringify(["Prompt Engineering", "ChatGPT", "Claude", "Gemini", "Perplexity", "Multimodal AI"]),
      syllabus: JSON.stringify([
        "How language and multimodal models respond to instructions",
        "Prompt structure, context, examples and reusable templates",
        "Research, analysis and structured output workflows",
        "Image, audio and multimodal prompting fundamentals",
        "Prompt testing, evaluation, safety and fact verification",
        "Cross-tool workflow portfolio project",
      ]),
      featured: false,
    },
    {
      title: "Advanced AI Tools & Workflow Automation",
      slug: "advanced-ai-tools-workflow-automation",
      category: "AI & ML",
      level: "Advanced",
      description: "Connect advanced AI assistants, coding agents, research and creative tools into reliable workflows.",
      longDescription:
        "A practical advanced program for building useful AI-enabled workflows across work and development. Compare leading assistants such as ChatGPT, Claude and Gemini; explore research tools, image and media generation, GitHub Copilot, Cursor and Claude Code; and connect model APIs, automation platforms, retrieval and agent-style tool use. Learn evaluation, human review, access controls, privacy, cost awareness and failure handling. Tool names are representative examples and may change as products evolve.",
      instructor: "Priya Nambiar",
      instructorTitle: "Head of AI Product, SaaS Startup",
      durationWeeks: 8,
      price: 19999,
      originalPrice: 29999,
      rating: 4.9,
      studentsCount: 0,
      imageColor: "#7c3aed",
      tags: JSON.stringify(["ChatGPT", "Claude", "Gemini", "Copilot", "Cursor", "AI Agents", "Automation"]),
      syllabus: JSON.stringify([
        "Model selection, capabilities and responsible use",
        "Research, writing and multimodal creative workflows",
        "AI coding assistants, agents and code review",
        "APIs, automation, retrieval and connected tools",
        "Evaluation, security, privacy and human oversight",
        "End-to-end AI workflow capstone",
      ]),
      featured: false,
    },
    {
      title: "Performance Marketing with AI Analytics",
      slug: "performance-marketing-ai-analytics",
      category: "Digital Marketing",
      level: "Intermediate",
      description: "Data-first performance marketing across Meta, Google, and WhatsApp channels.",
      longDescription:
        "Learn to plan, execute and optimize multi-channel campaigns using AI-powered analytics dashboards and attribution modeling.",
      instructor: "Kavya Reddy",
      instructorTitle: "Ex-Growth Lead, Flipkart",
      durationWeeks: 6,
      price: 9999,
      originalPrice: 15999,
      rating: 4.7,
      studentsCount: 5200,
      imageColor: "#22d3ee",
      tags: JSON.stringify(["Meta Ads", "Google Ads", "Analytics"]),
      syllabus: JSON.stringify([
        "Channel Strategy",
        "Meta & Google Ads Setup",
        "WhatsApp Marketing",
        "Attribution & Analytics",
        "Budget Optimization with AI",
      ]),
      featured: false,
    },
    {
      title: "Full-Stack Web Development Bootcamp",
      slug: "full-stack-web-development-bootcamp",
      category: "Development",
      level: "Beginner",
      description: "Ship production React, Node and database-backed apps from scratch.",
      longDescription:
        "Build and deploy complete web applications with JavaScript, TypeScript, React, Next.js, Node.js APIs and relational databases. Learn authentication, testing, accessibility, security and cloud deployment. Use AI coding assistants such as GitHub Copilot, Cursor and Claude Code to explore code, generate tests and speed up development while practicing review, debugging and secure handling of code and data. Finish with a production-style portfolio project.",
      instructor: "Sandeep Kulkarni",
      instructorTitle: "Senior Engineer, fintech unicorn",
      durationWeeks: 14,
      price: 21999,
      originalPrice: 32999,
      rating: 4.8,
      studentsCount: 4100,
      imageColor: "#5934f0",
      tags: JSON.stringify(["React", "Next.js", "Node.js", "TypeScript", "AI Coding Tools"]),
      syllabus: JSON.stringify([
        "JavaScript, TypeScript, Git & developer workflows",
        "React, Next.js, responsive UI & accessibility",
        "Node.js APIs, validation & integration",
        "SQL databases, data modeling & ORMs",
        "Authentication, security, testing & AI-assisted code review",
        "Cloud deployment and full-stack capstone",
      ]),
      featured: false,
    },
    {
      title: "AI Product Management Essentials",
      slug: "ai-product-management-essentials",
      category: "AI & ML",
      level: "Intermediate",
      description: "Ship AI-powered products with the right mix of strategy, UX and data.",
      longDescription:
        "For PMs and founders who want to responsibly scope, build and measure AI features — from discovery to post-launch iteration.",
      instructor: "Priya Nambiar",
      instructorTitle: "Head of AI Product, SaaS Startup",
      durationWeeks: 6,
      price: 12999,
      originalPrice: 18999,
      rating: 4.6,
      studentsCount: 1800,
      imageColor: "#a89dff",
      tags: JSON.stringify(["Product", "AI Strategy", "UX"]),
      syllabus: JSON.stringify([
        "AI Product Discovery",
        "Data & Model Scoping",
        "Designing Trustworthy AI UX",
        "Metrics that Matter",
        "Responsible Launch & Iteration",
      ]),
      featured: false,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({ where: { slug: course.slug }, update: course, create: course });
  }

  const tutors = [
    {
      name: "Sneha Kulkarni",
      subject: "Mathematics",
      bio: "10+ years teaching CBSE Mathematics with a focus on conceptual clarity and exam strategy.",
      qualification: "M.Sc Mathematics, B.Ed",
      experienceYears: 10,
      rating: 4.9,
      avatarColor: "#6c4dff",
      boards: JSON.stringify(["CBSE", "ICSE"]),
    },
    {
      name: "Vikram Rao",
      subject: "Physics",
      bio: "Makes physics intuitive with real-world demos and problem-solving frameworks.",
      qualification: "M.Sc Physics",
      experienceYears: 8,
      rating: 4.8,
      avatarColor: "#06b6d4",
      boards: JSON.stringify(["CBSE", "State Board"]),
    },
    {
      name: "Divya Menon",
      subject: "English",
      bio: "Specialist in grammar foundations, comprehension and creative writing for grades 1-10.",
      qualification: "M.A English Literature",
      experienceYears: 6,
      rating: 4.9,
      avatarColor: "#f97316",
      boards: JSON.stringify(["CBSE", "State Board", "ICSE"]),
    },
    {
      name: "Karthik Subramaniam",
      subject: "Computer Science",
      bio: "Teaches Python & CS fundamentals with project-based learning for middle & high schoolers.",
      qualification: "B.Tech CSE",
      experienceYears: 5,
      rating: 4.8,
      avatarColor: "#16a34a",
      boards: JSON.stringify(["CBSE"]),
    },
    {
      name: "Fatima Sheikh",
      subject: "Chemistry",
      bio: "Breaks down chemistry into simple visual models — loved for board exam prep.",
      qualification: "M.Sc Chemistry, B.Ed",
      experienceYears: 9,
      rating: 4.7,
      avatarColor: "#e11d48",
      boards: JSON.stringify(["CBSE", "State Board"]),
    },
  ];

  const tutorRecords = [];
  for (const tutor of tutors) {
    const existing = await prisma.tutor.findFirst({ where: { name: tutor.name } });
    tutorRecords.push(existing ?? (await prisma.tutor.create({ data: tutor })));
  }

  const internships = [
    {
      title: "AI/ML Engineering Intern",
      slug: "ai-ml-engineering-intern",
      company: "MyLoginn Labs",
      type: "IT",
      paid: true,
      stipend: 15000,
      location: "Remote",
      durationWeeks: 12,
      description: "Work on real ML pipelines supporting course recommendation and analytics systems.",
      requirements: JSON.stringify(["Python", "Basic ML knowledge", "Git"]),
      responsibilities: JSON.stringify([
        "Build and evaluate ML models",
        "Support data pipeline development",
        "Document experiments and results",
      ]),
      mentorName: "Dr. Arjun Mehta",
      mentorEmail: "arjun.mehta@myloginn.ai",
      applyDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      featured: true,
    },
    {
      title: "Frontend Development Intern",
      slug: "frontend-development-intern",
      company: "MyLoginn Labs",
      type: "IT",
      paid: true,
      stipend: 12000,
      location: "Bengaluru / Remote",
      durationWeeks: 10,
      description: "Ship real features for the MyLoginn learner dashboard using React and Next.js.",
      requirements: JSON.stringify(["JavaScript", "React basics", "CSS"]),
      responsibilities: JSON.stringify([
        "Build UI components",
        "Fix bugs and improve performance",
        "Collaborate with design & backend teams",
      ]),
      mentorName: "Sandeep Kulkarni",
      mentorEmail: "sandeep.kulkarni@myloginn.ai",
      applyDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      featured: true,
    },
    {
      title: "Digital Marketing Intern",
      slug: "digital-marketing-intern",
      company: "MyLoginn Labs",
      type: "Marketing",
      paid: false,
      stipend: null,
      location: "Remote",
      durationWeeks: 8,
      description: "Support live campaign execution across social, search and WhatsApp channels.",
      requirements: JSON.stringify(["Communication skills", "Basic marketing knowledge"]),
      responsibilities: JSON.stringify([
        "Assist with campaign setup",
        "Analyze performance reports",
        "Draft ad creative briefs",
      ]),
      mentorName: "Kavya Reddy",
      mentorEmail: "kavya.reddy@myloginn.ai",
      applyDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      featured: false,
    },
    {
      title: "Backend Engineering Intern",
      slug: "backend-engineering-intern",
      company: "MyLoginn Labs",
      type: "IT",
      paid: true,
      stipend: 14000,
      location: "Remote",
      durationWeeks: 12,
      description: "Build and harden REST APIs powering courses, internships and dashboards.",
      requirements: JSON.stringify(["Node.js or similar", "Databases", "REST APIs"]),
      responsibilities: JSON.stringify([
        "Design and implement API endpoints",
        "Write tests and documentation",
        "Pair with mentors on code review",
      ]),
      mentorName: "Sandeep Kulkarni",
      mentorEmail: "sandeep.kulkarni@myloginn.ai",
      applyDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
      featured: false,
    },
  ];

  for (const internship of internships) {
    await prisma.internship.upsert({
      where: { slug: internship.slug },
      update: internship,
      create: internship,
    });
  }

  const firstCourse = await prisma.course.findUnique({ where: { slug: courses[0].slug } });
  if (firstCourse) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: firstCourse.id } },
      update: {},
      create: { userId: student.id, courseId: firstCourse.id, progress: 42 },
    });
  }

  const existingProject = await prisma.project.findFirst({ where: { userId: student.id } });
  if (!existingProject) {
    await prisma.project.create({
      data: {
        userId: student.id,
        mentorId: mentor.id,
        title: "AI Campaign Analytics Dashboard",
        description: "Build a dashboard summarizing campaign performance using mock ad data.",
        status: "in_progress",
        progress: 60,
        feedback: "Great start on the data model — tighten up the chart legends next.",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      },
    });
  }

  const showcaseProjects = [
    {
      slug: "ai-resume-screener",
      title: "AI Resume Screener",
      student: "Ananya Rao",
      result: "Cut recruiter screening time by 70%",
      description:
        "A generative-AI tool that ranks resumes against a job description and drafts personalized rejection/interview notes.",
      tags: "AI & ML,Development",
      mentor: "Priya Nair",
    },
    {
      slug: "campus-cyber-audit",
      title: "Campus Network Security Audit",
      student: "Rohit Verma",
      result: "Found and patched 12 vulnerabilities",
      description:
        "A full penetration test and hardening plan for a college's public Wi-Fi and student portal login flow.",
      tags: "Cybersecurity",
      mentor: "Karthik Subramaniam",
    },
    {
      slug: "automated-test-suite",
      title: "Automated QA Suite for a Fintech App",
      student: "Sneha Iyer",
      result: "Reduced release regressions by 85%",
      description:
        "An end-to-end automated testing pipeline covering UI, API, and load testing, integrated into CI/CD.",
      tags: "Testing,Development",
      mentor: "Divya Menon",
    },
    {
      slug: "growth-campaign-dashboard",
      title: "Growth Marketing Analytics Dashboard",
      student: "Kabir Malhotra",
      result: "Improved ad spend ROI by 34%",
      description:
        "A real-time dashboard unifying spend, conversions, and WhatsApp funnel data for a D2C brand's marketing team.",
      tags: "Digital Marketing,Data Science",
      mentor: "Fatima Sheikh",
    },
    {
      slug: "smart-attendance-cloud",
      title: "Cloud-Native Smart Attendance",
      student: "Meera Krishnan",
      result: "Deployed to 4 campuses in 6 weeks",
      description:
        "A face-recognition attendance system built on serverless cloud infrastructure with autoscaling and offline sync.",
      tags: "Cloud Computing,AI & ML",
      mentor: "Karthik Subramaniam",
    },
    {
      slug: "portfolio-site-builder",
      title: "No-Code Portfolio Site Builder",
      student: "Yusuf Khan",
      result: "500+ student portfolios generated",
      description:
        "A drag-and-drop site builder that lets students publish a portfolio from their MyLoginn course progress.",
      tags: "Development,Digital Marketing",
      mentor: "Priya Nair",
    },
  ];

  for (const [i, p] of showcaseProjects.entries()) {
    await prisma.showcaseProject.upsert({
      where: { slug: p.slug },
      update: { ...p, sortOrder: i },
      create: { ...p, sortOrder: i },
    });
  }

  console.log("Seed complete:", {
    admin: admin.email,
    mentor: mentor.email,
    student: student.email,
    courses: courses.length,
    tutors: tutorRecords.length,
    internships: internships.length,
    showcaseProjects: showcaseProjects.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
