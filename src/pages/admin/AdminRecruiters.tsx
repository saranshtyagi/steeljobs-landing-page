import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRecruiterInsights } from "@/hooks/useAdminData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Building2, Briefcase, CheckCircle, XCircle, Crown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminRecruiters = () => {
  const { data: recruiters, isLoading } = useRecruiterInsights();
  const queryClient = useQueryClient();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const togglePremiumMutation = useMutation({
    mutationFn: async ({ recruiterId, grantAccess }: { recruiterId: string; grantAccess: boolean }) => {
      const { data, error } = await supabase.functions.invoke("grant-premium-access", {
        body: { recruiterId, grantAccess },
      });

      if (error) throw error;
      return data;
    },
    onMutate: ({ recruiterId }) => {
      setTogglingIds((prev) => new Set(prev).add(recruiterId));
    },
    onSuccess: (_, { grantAccess, recruiterId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-recruiter-insights"] });
      toast.success(
        grantAccess 
          ? "Premium access granted. Notification email sent." 
          : "Premium access revoked."
      );
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(recruiterId);
        return next;
      });
    },
    onError: (error, { recruiterId }) => {
      toast.error("Failed to update premium access");
      console.error(error);
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(recruiterId);
        return next;
      });
    },
  });

  const handleTogglePremium = (recruiterId: string, currentStatus: boolean) => {
    togglePremiumMutation.mutate({ recruiterId, grantAccess: !currentStatus });
  };

  const totalRecruiters = recruiters?.length || 0;
  const premiumRecruiters = recruiters?.filter((r) => r.has_premium_access).length || 0;
  const withActiveJobs = recruiters?.filter((r) => r.active_jobs_count > 0).length || 0;
  const withNoJobs = recruiters?.filter((r) => r.jobs_count === 0).length || 0;
  const totalJobsPosted =
    recruiters?.reduce((acc, r) => acc + r.jobs_count, 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Recruiter Insights</h1>
          <p className="text-slate-400 mt-1">
            Company analytics and job posting statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Recruiters
              </CardTitle>
              <Building2 className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalRecruiters}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Premium Access
              </CardTitle>
              <Crown className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{premiumRecruiters}</div>
              <p className="text-xs text-slate-500">Can search candidates</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Jobs Posted
              </CardTitle>
              <Briefcase className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalJobsPosted}</div>
              <p className="text-xs text-slate-500">
                Avg: {totalRecruiters > 0 ? (totalJobsPosted / totalRecruiters).toFixed(1) : 0} per recruiter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                With Active Jobs
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{withActiveJobs}</div>
              <p className="text-xs text-slate-500">Currently hiring</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                No Activity
              </CardTitle>
              <XCircle className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{withNoJobs}</div>
              <p className="text-xs text-slate-500">No jobs posted yet</p>
            </CardContent>
          </Card>
        </div>

        {/* Recruiters Table */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Company</TableHead>
                <TableHead className="text-slate-400">Contact Email</TableHead>
                <TableHead className="text-slate-400">Total Jobs</TableHead>
                <TableHead className="text-slate-400">Active Jobs</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Premium Access</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Loading recruiters...
                  </TableCell>
                </TableRow>
              ) : recruiters?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    No recruiters found
                  </TableCell>
                </TableRow>
              ) : (
                recruiters?.map((recruiter) => (
                  <TableRow
                    key={recruiter.id}
                    className="border-slate-800 hover:bg-slate-900/50"
                  >
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center gap-2">
                        {recruiter.company_name}
                        {recruiter.has_premium_access && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {recruiter.contact_email || "Not set"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {recruiter.jobs_count}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {recruiter.active_jobs_count}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          recruiter.active_jobs_count > 0
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : recruiter.jobs_count > 0
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                            : "bg-slate-600/20 text-slate-400 border-slate-600/30"
                        }
                      >
                        {recruiter.active_jobs_count > 0
                          ? "Hiring"
                          : recruiter.jobs_count > 0
                          ? "Inactive"
                          : "No Jobs"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {togglingIds.has(recruiter.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                          <Switch
                            checked={recruiter.has_premium_access}
                            onCheckedChange={() =>
                              handleTogglePremium(recruiter.id, recruiter.has_premium_access)
                            }
                            className="data-[state=checked]:bg-yellow-500"
                          />
                        )}
                        <span className="text-xs text-slate-500">
                          {recruiter.has_premium_access ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(recruiter.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats footer */}
        <div className="text-sm text-slate-500">
          Showing {recruiters?.length || 0} recruiters
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRecruiters;
