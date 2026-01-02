import AdminLayout from "@/components/admin/AdminLayout";
import { useCandidateInsights } from "@/hooks/useAdminData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const AdminCandidates = () => {
  const { data: candidates, isLoading } = useCandidateInsights();

  const totalCandidates = candidates?.length || 0;
  const withResumes = candidates?.filter((c) => c.has_resume).length || 0;
  const activelyApplying = candidates?.filter((c) => c.applications_count > 0).length || 0;
  const avgCompletion = candidates?.length
    ? Math.round(
        candidates.reduce((acc, c) => acc + c.profile_completion, 0) / candidates.length
      )
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Insights</h1>
          <p className="text-slate-400 mt-1">
            Detailed analytics and information about job seekers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Candidates
              </CardTitle>
              <Users className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalCandidates}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                With Resumes
              </CardTitle>
              <FileText className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{withResumes}</div>
              <p className="text-xs text-slate-500">
                {totalCandidates > 0
                  ? `${Math.round((withResumes / totalCandidates) * 100)}% of total`
                  : "0%"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Actively Applying
              </CardTitle>
              <Send className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activelyApplying}</div>
              <p className="text-xs text-slate-500">Have submitted applications</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Avg. Profile Completion
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{avgCompletion}%</div>
              <Progress value={avgCompletion} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Candidates Table */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Resume</TableHead>
                <TableHead className="text-slate-400">Skills</TableHead>
                <TableHead className="text-slate-400">Applications</TableHead>
                <TableHead className="text-slate-400">Profile</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Loading candidates...
                  </TableCell>
                </TableRow>
              ) : candidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                candidates?.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="border-slate-800 hover:bg-slate-900/50"
                  >
                    <TableCell className="text-white font-medium">
                      {candidate.full_name || "Not set"}
                    </TableCell>
                    <TableCell className="text-slate-300">{candidate.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          candidate.has_resume
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : "bg-slate-600/20 text-slate-400 border-slate-600/30"
                        }
                      >
                        {candidate.has_resume ? "Uploaded" : "None"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {candidate.skills_count}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {candidate.applications_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={candidate.profile_completion}
                          className="w-16 h-1"
                        />
                        <span className="text-xs text-slate-400">
                          {candidate.profile_completion}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(candidate.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats footer */}
        <div className="text-sm text-slate-500">
          Showing {candidates?.length || 0} candidates
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCandidates;
