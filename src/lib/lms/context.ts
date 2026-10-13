import { getCurrentUser } from "@/lib/auth";
import { getCourseAccess, getEntitlement } from "./entitlements";
import { decidePurchase } from "./payments";
import { loadLearnerState, loadStructure, type CourseStructure, type LearnerState } from "./state";

/** Everything a learner-facing server page needs about one LMS course, computed once per request. */
export async function loadLmsContext(slug: string) {
  const [user, structure] = await Promise.all([getCurrentUser(), loadStructure(slug)]);
  if (!structure) return null;
  const access = await getCourseAccess(user, structure.course);
  const preview = access.reason === "ok_admin";
  const state: LearnerState | null = user && access.allowed && !preview ? await loadLearnerState(user.id, structure) : null;
  const entitlement = user && structure.course.price > 0 ? await getEntitlement(user.id, structure.course.id) : null;
  const purchase = structure.course.price > 0
    ? decidePurchase({ price: structure.course.price, renewalPrice: structure.course.renewalPrice, validityDays: structure.course.validityDays }, entitlement)
    : null;
  return { user, structure, access, preview, state, entitlement, purchase };
}
export type LmsContext = NonNullable<Awaited<ReturnType<typeof loadLmsContext>>>;
export type { CourseStructure };
