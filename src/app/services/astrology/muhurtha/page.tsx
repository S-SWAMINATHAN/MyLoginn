import { redirect } from "next/navigation";

// Old feature removed — replaced by /kalai-report (Kalai Magal-parity feature).
export default function Page() {
  redirect("/services/astrology/kalai-report");
}
