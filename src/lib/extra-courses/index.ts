import type { ExtraCourse } from "./types";
import { bootstrapCourse } from "./bootstrap";
import { jqueryCourse } from "./jquery";
import { excelCourse } from "./excel";
import { xmlCourse } from "./xml";
import { djangoCourse } from "./django";
import { numpyCourse } from "./numpy";
import { pandasCourse } from "./pandas";
import { nodejsCourse } from "./nodejs";
import { dsaCourse } from "./dsa";
import { typescriptCourse } from "./typescript";
import { angularjsCourse } from "./angularjs";
import { gitCourse } from "./git";
import { postgresqlCourse } from "./postgresql";
import { mongodbCourse } from "./mongodb";
import { aspCourse } from "./asp";

export type { ExtraCourse } from "./types";

/** Free W3Schools-style tutorial courses added on top of the original eleven fundamentals courses. */
export const extraCourses: ExtraCourse[] = [
  bootstrapCourse, jqueryCourse, excelCourse, xmlCourse, djangoCourse, numpyCourse, pandasCourse, nodejsCourse,
  dsaCourse, typescriptCourse, angularjsCourse, gitCourse, postgresqlCourse, mongodbCourse, aspCourse,
];

const bySlug = new Map(extraCourses.map((course) => [course.slug, course]));

export const getExtraCourse = (slug: string) => bySlug.get(slug);

/** Matches a leading technology name in a topic title, e.g. "Bootstrap " or "Node.js ". */
export const extraTopicPrefix = new RegExp(`^(?:${extraCourses.map((course) => course.prefix).join("|")})\\s+`, "i");
