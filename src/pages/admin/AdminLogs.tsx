import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useLoginLogs, useActivityLogs } from "@/hooks/useAdminData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { data: loginLogs, isLoading: loginLoading } = useLoginLogs();
  const { data: activityLogs, isLoading: activityLoading } = useActivityLogs();

  const successfulLogins = loginLogs?.filter((l) => l.success).length || 0;
  const failedLogins = loginLogs?.filter((l) => !l.success).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Logs & Activity</h1>
          <p className="text-slate-400 mt-1">
            Monitor user activity and system events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Logins
              </CardTitle>
              <LogIn className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loginLogs?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Successful
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{successfulLogins}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Failed Attempts
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{failedLogins}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Activity Events
              </CardTitle>
              <Activity className="w-5 h-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {activityLogs?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Login Logs
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">IP Address</TableHead>
                    <TableHead className="text-slate-400">User Agent</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        Loading logs...
                      </TableCell>
                    </TableRow>
                  ) : loginLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        No login logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    loginLogs?.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-slate-800 hover:bg-slate-900/50"
                      >
                        <TableCell className="text-white">{log.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.success
                                ? "bg-green-600/20 text-green-400 border-green-600/30"
                                : "bg-red-600/20 text-red-400 border-red-600/30"
                            }
                          >
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {log.ip_address || "Unknown"}
                        </TableCell>
                        <TableCell className="text-slate-400 max-w-[200px] truncate">
                          {log.user_agent || "Unknown"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {format(new Date(log.login_at), "MMM d, HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="text-slate-400">Action</TableHead>
                    <TableHead className="text-slate-400">Entity Type</TableHead>
                    <TableHead className="text-slate-400">Entity ID</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                        Loading logs...
                      </TableCell>
                    </TableRow>
                  ) : activityLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityLogs?.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-slate-800 hover:bg-slate-900/50"
                      >
                        <TableCell className="text-white">{log.action}</TableCell>
                        <TableCell className="text-slate-400">
                          {log.entity_type || "-"}
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono text-xs">
                          {log.entity_id || "-"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
