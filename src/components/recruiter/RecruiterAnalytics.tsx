import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
} from "lucide-react";
import { Job } from "@/hooks/useRecruiterJobs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRecruiterProfile } from "@/hooks/useRecruiterProfile";

interface RecruiterAnalyticsProps {
  jobs: Job[];
}

const COLORS = ["hsl(var(--primary))", "#22c55e", "#ef4444", "#f59e0b", "#6366f1"];

const RecruiterAnalytics = ({ jobs }: RecruiterAnalyticsProps) => {
  const { profile } = useRecruiterProfile();

  // Fetch all applications for recruiter's jobs
  const { data: applications = [] } = useQuery({
    queryKey: ["recruiterAnalyticsApplications", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const jobIds = jobs.map((j) => j.id);
      if (jobIds.length === 0) return [];

      const { data, error } = await supabase
        .from("applications")
        .select("id, status, created_at, job_id")
        .in("job_id", jobIds)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && jobs.length > 0,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.is_active).length;
    const closedJobs = totalJobs - activeJobs;
    const totalApplications = applications.length;

    const statusCounts = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const shortlisted = statusCounts["shortlisted"] || 0;
    const rejected = statusCounts["rejected"] || 0;
    const hired = statusCounts["hired"] || 0;
    const inReview = statusCounts["in_review"] || 0;
    const interview = statusCounts["interview"] || 0;
    const applied = statusCounts["applied"] || 0;

    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      shortlisted,
      rejected,
      hired,
      inReview,
      interview,
      applied,
    };
  }, [jobs, applications]);

  // Applications per job data
  const applicationsPerJob = useMemo(() => {
    return jobs
      .map((job) => ({
        name: job.title.length > 20 ? job.title.substring(0, 20) + "..." : job.title,
        applications: applications.filter((a) => a.job_id === job.id).length,
        active: job.is_active,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 8);
  }, [jobs, applications]);

  // Status distribution data
  const statusDistribution = useMemo(() => {
    return [
      { name: "Applied", value: stats.applied, color: COLORS[0] },
      { name: "Shortlisted", value: stats.shortlisted, color: COLORS[1] },
      { name: "Interview", value: stats.interview, color: COLORS[4] },
      { name: "Hired", value: stats.hired, color: "#22c55e" },
      { name: "Rejected", value: stats.rejected, color: COLORS[2] },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Applications over time (last 30 days)
  const applicationsOverTime = useMemo(() => {
    const last30Days: Record<string, number> = {};
    const now = new Date();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      last30Days[key] = 0;
    }

    // Count applications per day
    applications.forEach((app) => {
      const date = new Date(app.created_at).toISOString().split("T")[0];
      if (last30Days[date] !== undefined) {
        last30Days[date]++;
      }
    });

    return Object.entries(last30Days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      applications: count,
    }));
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {stats.activeJobs} Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.closedJobs} Closed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stats.applied} New
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.shortlisted}</p>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                {stats.interview} In Interview
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.hired}</p>
                <p className="text-sm text-muted-foreground">Hired</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                {stats.rejected} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Applications Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={applicationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No application data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No applications yet
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Per Job */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applications by Job</CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsPerJob.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationsPerJob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="applications"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No jobs posted yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterAnalytics;
