import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useRecommendedJobs } from "@/hooks/useJobs";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Bookmark, 
  Sparkles, 
  CheckCircle2,
  Clock
} from "lucide-react";

const DashboardStats = () => {
  const { t } = useTranslation();
  const { data: applications } = useMyApplications();
  const { data: savedJobs } = useSavedJobs();
  const { data: recommendedJobs } = useRecommendedJobs();

  const appliedCount = applications?.filter(a => a.status === "applied").length || 0;
  const shortlistedCount = applications?.filter(a => a.status === "shortlisted").length || 0;
  const hiredCount = applications?.filter(a => a.status === "hired").length || 0;

  const stats = [
    {
      label: t("candidate.stats.applied", "Applied"),
      value: appliedCount,
      icon: FileText,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: t("candidate.stats.shortlisted", "Shortlisted"),
      value: shortlistedCount,
      icon: Clock,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: t("candidate.stats.hired", "Hired"),
      value: hiredCount,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-100",
    },
    {
      label: t("candidate.stats.savedJobs", "Saved Jobs"),
      value: savedJobs?.length || 0,
      icon: Bookmark,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: t("candidate.stats.recommendations", "Recommendations"),
      value: recommendedJobs?.length || 0,
      icon: Sparkles,
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
