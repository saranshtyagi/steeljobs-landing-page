import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminStats } from "@/hooks/useAdminData";
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  UserPlus,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  loading?: boolean;
}) => (
  <Card className="bg-slate-900 border-slate-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      <Icon className="w-5 h-5 text-slate-500" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-24 bg-slate-800" />
      ) : (
        <>
          <div className="text-2xl font-bold text-white">{value}</div>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">{trend}</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">
            Platform analytics and key metrics at a glance
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="All registered accounts"
            loading={isLoading}
          />
          <StatCard
            title="Candidates"
            value={stats?.totalCandidates || 0}
            icon={UserCheck}
            description="Job seekers on platform"
            loading={isLoading}
          />
          <StatCard
            title="Recruiters"
            value={stats?.totalRecruiters || 0}
            icon={Building2}
            description="Active companies"
            loading={isLoading}
          />
          <StatCard
            title="Jobs Posted"
            value={stats?.totalJobs || 0}
            icon={Briefcase}
            description="Total job listings"
            loading={isLoading}
          />
        </div>

        {/* Growth Stats */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">User Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="New Today"
              value={stats?.newUsersToday || 0}
              icon={UserPlus}
              loading={isLoading}
            />
            <StatCard
              title="Last 7 Days"
              value={stats?.newUsersWeek || 0}
              icon={TrendingUp}
              loading={isLoading}
            />
            <StatCard
              title="Last 30 Days"
              value={stats?.newUsersMonth || 0}
              icon={Activity}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">User Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Users</span>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-800" />
                  ) : (
                    <span className="text-green-400 font-semibold">
                      {stats?.activeUsers || 0}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Inactive Users</span>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-800" />
                  ) : (
                    <span className="text-red-400 font-semibold">
                      {stats?.inactiveUsers || 0}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Applications</span>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-800" />
                  ) : (
                    <span className="text-blue-400 font-semibold">
                      {stats?.totalApplications || 0}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <Users className="w-5 h-5 text-slate-400" />
                  <span className="text-white">Manage Users</span>
                </Link>
                <Link
                  to="/admin/candidates"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <UserCheck className="w-5 h-5 text-slate-400" />
                  <span className="text-white">View Candidates</span>
                </Link>
                <Link
                  to="/admin/logs"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span className="text-white">View Activity Logs</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
