import { redirect } from "next/navigation";

// Old feature removed — replaced by /kalai-matching (Kalai Magal-parity feature).
export default function Page() {
  redirect("/services/astrology/kalai-matching");
}
