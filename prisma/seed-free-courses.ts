import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { extraCourses } from "../src/lib/extra-courses";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type SeedCourse = {
  title: string; slug: string; category: string; description: string; durationWeeks: number; imageColor: string; tags: string[]; syllabus: string[];
  pricing?: { price: number; originalPrice?: number; level: string; instructor?: string };
};

const courses: SeedCourse[] = [
  {
    title: "Python Essentials", slug: "python-fundamentals", category: "Programming Languages",
    description: "Learn Python from the beginning with clear explanations, small programs, and practical examples.",
    durationWeeks: 4, imageColor: "#3776ab", tags: ["FREE", "Essentials", "Python", "Beginner"],
    syllabus: ["Introduction to Python", "Setup and first program", "Syntax and indentation", "Output and comments", "Variables and naming", "Data types and type checking", "Numbers and conversions", "Strings", "Operators", "Conditions", "Loops", "Functions", "Modules", "Files and error handling", "Beginner practice programs"],
  },
  {
    title: "Java Core Concepts", slug: "java-fundamentals", category: "Programming Languages",
    description: "Build a strong Java foundation by learning syntax, variables, decisions, loops, methods, and simple objects.",
    durationWeeks: 5, imageColor: "#ed8b00", tags: ["FREE", "Core Concepts", "Java", "Beginner"],
    syllabus: ["Introduction to Java", "JDK and setup", "Your first Java program", "Syntax and variables", "Data types", "Operators and strings", "Reading input", "Conditions and switch", "For, while, and do-while loops", "Arrays", "Methods", "Classes and objects", "Exception fundamentals", "Beginner practice programs"],
  },
  {
    title: "JavaScript Basics", slug: "javascript-fundamentals", category: "Programming Languages",
    description: "Learn the JavaScript basics used to make web pages interactive, from values and functions to the DOM.",
    durationWeeks: 4, imageColor: "#f7df1e", tags: ["FREE", "Basics", "JavaScript", "Beginner"],
    syllabus: ["Introduction and setup", "Syntax", "Variables with let and const", "Data types", "Strings and numbers", "Operators", "Conditions and switch", "Loops", "Functions", "Arrays", "Objects", "DOM introduction", "Basic events", "Beginner practice programs"],
  },
  {
    title: "HTML Foundations", slug: "html-fundamentals", category: "Web Technologies",
    description: "Create your first web pages with HTML structure, links, images, lists, forms, and semantic elements.",
    durationWeeks: 3, imageColor: "#e34f26", tags: ["FREE", "Foundations", "HTML", "Beginner"],
    syllabus: ["Introduction to HTML", "Document structure", "Doctype, head, and body", "Headings and paragraphs", "Links", "Images and alt text", "Lists", "Tables", "Forms and inputs", "Buttons", "Semantic elements", "Build a simple webpage"],
  },
  {
    title: "CSS Principles", slug: "css-fundamentals", category: "Web Technologies",
    description: "Style webpages with selectors, color, spacing, typography, the box model, Flexbox, and responsive basics.",
    durationWeeks: 3, imageColor: "#1572b6", tags: ["FREE", "Principles", "CSS", "Beginner"],
    syllabus: ["Introduction to CSS", "Adding CSS to a page", "Selectors", "Colors and backgrounds", "Text and fonts", "Borders", "Margin and padding", "The box model", "Width and height", "Display and positioning", "Flexbox basics", "Responsive design basics", "Style a simple webpage"],
  },
  {
    title: "SQL Essentials", slug: "sql-fundamentals", category: "Database",
    description: "Learn the core SQL commands for reading, filtering, and changing data in relational tables.",
    durationWeeks: 3, imageColor: "#336791", tags: ["FREE", "Essentials", "SQL", "Beginner"],
    syllabus: ["Introduction to SQL and databases", "Tables and rows", "SELECT", "WHERE", "ORDER BY", "INSERT", "UPDATE and DELETE", "NULL values", "AND and OR", "LIKE, IN, and BETWEEN", "Aggregate functions", "GROUP BY", "Basic JOIN concepts", "Practice queries"],
  },
  {
    title: "C Rudiments", slug: "c-fundamentals", category: "Programming Languages",
    description: "Start programming in C with simple examples covering data, decisions, repetition, functions, and arrays.",
    durationWeeks: 5, imageColor: "#5c6bc0", tags: ["FREE", "Rudiments", "C", "Beginner"],
    syllabus: ["Introduction and setup", "Your first C program", "Syntax", "Variables and data types", "Constants and operators", "Input and output", "Conditions and switch", "For, while, and do-while loops", "Arrays", "Strings", "Functions", "Pointers introduction", "Structures introduction", "Basic programs"],
  },
  {
    title: "C++ First Principles", slug: "cpp-fundamentals", category: "Programming Languages",
    description: "Learn C++ foundations with approachable lessons on input, decisions, loops, functions, and basic classes.",
    durationWeeks: 5, imageColor: "#00599c", tags: ["FREE", "First Principles", "C++", "Beginner"],
    syllabus: ["Introduction and setup", "Your first C++ program", "Syntax", "Variables and data types", "Input and output", "Operators", "Conditions", "Loops", "Arrays and strings", "Functions", "References basics", "Classes and objects introduction", "Constructors basics", "Basic practice programs"],
  },
  {
    title: "PHP Nuts and Bolts", slug: "php-fundamentals", category: "Programming Languages",
    description: "Learn PHP for dynamic websites, form handling, object-oriented code, and database-backed applications.",
    durationWeeks: 5, imageColor: "#777bb4", tags: ["FREE", "Nuts and Bolts", "PHP", "Beginner"],
    syllabus: ["PHP introduction and setup", "Syntax, output, and variables", "Types, strings, and operators", "Conditions, loops, and functions", "Arrays and superglobals", "Forms and validation", "Files, sessions, and JSON", "Object-oriented PHP", "MySQL with prepared statements", "AJAX and XML", "Projects and practice"],
  },
  {
    title: "React Core Concepts", slug: "react-fundamentals", category: "Web Technologies",
    description: "Build interactive user interfaces with React components, JSX, props, state, hooks, forms, and routing.",
    durationWeeks: 5, imageColor: "#61dafb", tags: ["FREE", "Core Concepts", "React", "Beginner"],
    syllabus: ["React introduction and first app", "JSX and rendering", "Components and props", "Events, conditions, and lists", "Forms and controlled inputs", "Styling and routing", "React hooks", "Async data and context", "Accessibility and testing", "Projects and practice"],
  },
  {
    title: "MySQL Foundations", slug: "mysql-fundamentals", category: "Database",
    description: "Learn MySQL queries, relational database design, joins, indexes, safe updates, and practical data workflows.",
    durationWeeks: 4, imageColor: "#4479a1", tags: ["FREE", "Foundations", "MySQL", "Beginner"],
    syllabus: ["MySQL introduction and relational databases", "SELECT, filtering, and sorting", "Insert, update, and delete safely", "Aggregate functions and grouping", "Joins and subqueries", "Tables, keys, and constraints", "Indexes, views, and transactions", "Prepared statements and security", "MySQL functions and references", "Projects and practice"],
  },
];

// W3Schools-style tutorial courses (Bootstrap, jQuery, Excel, XML, Django, NumPy, Pandas, Node.js, DSA, TypeScript, AngularJS, Git, PostgreSQL, MongoDB, ASP.NET).
for (const course of extraCourses) {
  courses.push({
    title: course.title.replace(/ Fundamentals$/, ` ${course.term}`), slug: course.slug, category: course.category, description: course.description,
    durationWeeks: course.durationWeeks, imageColor: course.imageColor, syllabus: course.syllabus, pricing: course.pricing,
    tags: course.pricing ? ["Paid", course.languageName, course.pricing.level] : ["FREE", "Fundamentals", course.languageName, "Beginner"],
  });
}

async function main() {
  let added = 0;
  for (const item of courses) {
    const existing = await prisma.course.findUnique({ where: { slug: item.slug }, select: { id: true } });
    if (existing) continue;
    const { pricing, ...fields } = item;
    await prisma.course.create({
      data: {
        ...fields,
        level: pricing?.level ?? "Fundamentals",
        instructor: pricing?.instructor ?? "MyLoginn Learning Team",
        instructorTitle: pricing ? null : "Free beginner course",
        price: pricing?.price ?? 0,
        originalPrice: pricing?.originalPrice ?? null,
        rating: 0,
        studentsCount: 0,
        tags: JSON.stringify(item.tags),
        syllabus: JSON.stringify(item.syllabus),
        featured: false,
      },
    });
    added += 1;
  }
  console.log(`Tutorial courses added: ${added}; already present: ${courses.length - added}.`);
}

main().catch((error) => {
  console.error("Could not seed free fundamentals courses:", error instanceof Error ? error.message : "Unknown database error");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
