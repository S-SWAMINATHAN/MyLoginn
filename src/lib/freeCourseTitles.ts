const FREE_COURSE_TERMS: Record<string, string> = {
  "python-fundamentals": "Essentials",
  "java-fundamentals": "Core Concepts",
  "javascript-fundamentals": "Basics",
  "html-fundamentals": "Foundations",
  "css-fundamentals": "Principles",
  "sql-fundamentals": "Essentials",
  "c-fundamentals": "Rudiments",
  "cpp-fundamentals": "First Principles",
  "php-fundamentals": "Nuts and Bolts",
  "react-fundamentals": "Core Concepts",
  "mysql-fundamentals": "Foundations",
};

export function getFreeCourseTerm(slug: string): string | undefined {
  return FREE_COURSE_TERMS[slug];
}

export function getCourseDisplayTitle(slug: string, title: string): string {
  const term = getFreeCourseTerm(slug);
  return term && / Fundamentals$/i.test(title)
    ? title.replace(/ Fundamentals$/i, ` ${term}`)
    : title;
}
