import { useRecruiterJobs } from "@/hooks/useRecruiterJobs";
import { Briefcase, Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const RecruiterStats = () => {
  const { jobs } = useRecruiterJobs();

  const activeJobs = jobs.filter((j) => j.is_active).length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Jobs",
      value: jobs.length,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: Users,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Closed Jobs",
      value: jobs.length - activeJobs,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

export default RecruiterStats;
