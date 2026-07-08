"use client";

import { EntityManager, type EntityConfig } from "@/components/admin/EntityManager";
import {
  courseConfig,
  categoryConfig,
  userConfig,
  mentorConfig,
  enrollmentConfig,
  internshipConfig,
  applicationConfig,
  projectConfig,
  tutoringConfig,
  leadConfig,
  paymentConfig,
} from "@/components/admin/entityConfigs";

const configs: Record<string, EntityConfig> = {
  courses: courseConfig,
  categories: categoryConfig,
  users: userConfig,
  mentors: mentorConfig,
  enrollments: enrollmentConfig,
  internships: internshipConfig,
  applications: applicationConfig,
  projects: projectConfig,
  tutoring: tutoringConfig,
  leads: leadConfig,
  payments: paymentConfig,
};

/** Server pages pass just the entity key; all config stays client-side. */
export function EntityScreen({ entity }: { entity: keyof typeof configs }) {
  return <EntityManager config={configs[entity]} />;
}
