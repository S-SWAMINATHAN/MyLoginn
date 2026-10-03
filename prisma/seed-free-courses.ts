import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const courses = [
  {
    title: "Python Fundamentals", slug: "python-fundamentals", category: "Programming Languages",
    description: "Learn Python from the beginning with clear explanations, small programs, and practical examples.",
    durationWeeks: 4, imageColor: "#3776ab", tags: ["FREE", "Fundamentals", "Python", "Beginner"],
    syllabus: ["Introduction to Python", "Setup and first program", "Syntax and indentation", "Output and comments", "Variables and naming", "Data types and type checking", "Numbers and conversions", "Strings", "Operators", "Conditions", "Loops", "Functions", "Modules", "Files and error handling", "Beginner practice programs"],
  },
  {
    title: "Java Fundamentals", slug: "java-fundamentals", category: "Programming Languages",
    description: "Build a strong Java foundation by learning syntax, variables, decisions, loops, methods, and simple objects.",
    durationWeeks: 5, imageColor: "#ed8b00", tags: ["FREE", "Fundamentals", "Java", "Beginner"],
    syllabus: ["Introduction to Java", "JDK and setup", "Your first Java program", "Syntax and variables", "Data types", "Operators and strings", "Reading input", "Conditions and switch", "For, while, and do-while loops", "Arrays", "Methods", "Classes and objects", "Exception fundamentals", "Beginner practice programs"],
  },
  {
    title: "JavaScript Fundamentals", slug: "javascript-fundamentals", category: "Programming Languages",
    description: "Learn the JavaScript basics used to make web pages interactive, from values and functions to the DOM.",
    durationWeeks: 4, imageColor: "#f7df1e", tags: ["FREE", "Fundamentals", "JavaScript", "Beginner"],
    syllabus: ["Introduction and setup", "Syntax", "Variables with let and const", "Data types", "Strings and numbers", "Operators", "Conditions and switch", "Loops", "Functions", "Arrays", "Objects", "DOM introduction", "Basic events", "Beginner practice programs"],
  },
  {
    title: "HTML Fundamentals", slug: "html-fundamentals", category: "Web Technologies",
    description: "Create your first web pages with HTML structure, links, images, lists, forms, and semantic elements.",
    durationWeeks: 3, imageColor: "#e34f26", tags: ["FREE", "Fundamentals", "HTML", "Beginner"],
    syllabus: ["Introduction to HTML", "Document structure", "Doctype, head, and body", "Headings and paragraphs", "Links", "Images and alt text", "Lists", "Tables", "Forms and inputs", "Buttons", "Semantic elements", "Build a simple webpage"],
  },
  {
    title: "CSS Fundamentals", slug: "css-fundamentals", category: "Web Technologies",
    description: "Style webpages with selectors, color, spacing, typography, the box model, Flexbox, and responsive basics.",
    durationWeeks: 3, imageColor: "#1572b6", tags: ["FREE", "Fundamentals", "CSS", "Beginner"],
    syllabus: ["Introduction to CSS", "Adding CSS to a page", "Selectors", "Colors and backgrounds", "Text and fonts", "Borders", "Margin and padding", "The box model", "Width and height", "Display and positioning", "Flexbox basics", "Responsive design basics", "Style a simple webpage"],
  },
  {
    title: "SQL Fundamentals", slug: "sql-fundamentals", category: "Database",
    description: "Learn the core SQL commands for reading, filtering, and changing data in relational tables.",
    durationWeeks: 3, imageColor: "#336791", tags: ["FREE", "Fundamentals", "SQL", "Beginner"],
    syllabus: ["Introduction to SQL and databases", "Tables and rows", "SELECT", "WHERE", "ORDER BY", "INSERT", "UPDATE and DELETE", "NULL values", "AND and OR", "LIKE, IN, and BETWEEN", "Aggregate functions", "GROUP BY", "Basic JOIN concepts", "Practice queries"],
  },
  {
    title: "C Fundamentals", slug: "c-fundamentals", category: "Programming Languages",
    description: "Start programming in C with simple examples covering data, decisions, repetition, functions, and arrays.",
    durationWeeks: 5, imageColor: "#5c6bc0", tags: ["FREE", "Fundamentals", "C", "Beginner"],
    syllabus: ["Introduction and setup", "Your first C program", "Syntax", "Variables and data types", "Constants and operators", "Input and output", "Conditions and switch", "For, while, and do-while loops", "Arrays", "Strings", "Functions", "Pointers introduction", "Structures introduction", "Basic programs"],
  },
  {
    title: "C++ Fundamentals", slug: "cpp-fundamentals", category: "Programming Languages",
    description: "Learn C++ foundations with approachable lessons on input, decisions, loops, functions, and basic classes.",
    durationWeeks: 5, imageColor: "#00599c", tags: ["FREE", "Fundamentals", "C++", "Beginner"],
    syllabus: ["Introduction and setup", "Your first C++ program", "Syntax", "Variables and data types", "Input and output", "Operators", "Conditions", "Loops", "Arrays and strings", "Functions", "References basics", "Classes and objects introduction", "Constructors basics", "Basic practice programs"],
  },
];

async function main() {
  let added = 0;
  for (const item of courses) {
    const existing = await prisma.course.findUnique({ where: { slug: item.slug }, select: { id: true } });
    if (existing) continue;
    await prisma.course.create({
      data: {
        ...item,
        level: "Fundamentals",
        instructor: "MyLoginn Learning Team",
        instructorTitle: "Free beginner course",
        price: 0,
        rating: 0,
        studentsCount: 0,
        tags: JSON.stringify(item.tags),
        syllabus: JSON.stringify(item.syllabus),
        featured: false,
      },
    });
    added += 1;
  }
  console.log(`Free fundamentals courses added: ${added}; already present: ${courses.length - added}.`);
}

main().catch((error) => {
  console.error("Could not seed free fundamentals courses:", error instanceof Error ? error.message : "Unknown database error");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
