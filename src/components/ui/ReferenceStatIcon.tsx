import Image from "next/image";
import courseTotal from "@/images/stat-icons/course-total.png";
import courseCertified from "@/images/stat-icons/course-certified.png";
import courseMentors from "@/images/stat-icons/course-mentors.png";
import courseHours from "@/images/stat-icons/course-hours.png";
import tutorVerified from "@/images/stat-icons/tutor-verified.png";
import tutorSubjects from "@/images/stat-icons/tutor-subjects.png";
import tutorRating from "@/images/stat-icons/tutor-rating.png";
import tutorSuccess from "@/images/stat-icons/tutor-success.png";
import developmentProjects from "@/images/stat-icons/development-projects.png";
import developmentClients from "@/images/stat-icons/development-clients.png";
import developmentStacks from "@/images/stat-icons/development-stacks.png";
import developmentRating from "@/images/stat-icons/development-rating.png";
import marketingRoas from "@/images/stat-icons/marketing-roas.png";
import marketingCampaigns from "@/images/stat-icons/marketing-campaigns.png";
import marketingIndustries from "@/images/stat-icons/marketing-industries.png";
import marketingEngagement from "@/images/stat-icons/marketing-engagement.png";

const icons = {
  "course-total": courseTotal,
  "course-certified": courseCertified,
  "course-mentors": courseMentors,
  "course-hours": courseHours,
  "tutor-verified": tutorVerified,
  "tutor-subjects": tutorSubjects,
  "tutor-rating": tutorRating,
  "tutor-success": tutorSuccess,
  "development-projects": developmentProjects,
  "development-clients": developmentClients,
  "development-stacks": developmentStacks,
  "development-rating": developmentRating,
  "marketing-roas": marketingRoas,
  "marketing-campaigns": marketingCampaigns,
  "marketing-industries": marketingIndustries,
  "marketing-engagement": marketingEngagement,
};

export type ReferenceStatIconName = keyof typeof icons;

export function ReferenceStatIcon({
  name,
  className = "h-16 w-16",
}: {
  name: ReferenceStatIconName;
  className?: string;
}) {
  return <Image src={icons[name]} alt="" aria-hidden width={86} height={86} className={`shrink-0 object-contain ${className}`} />;
}
