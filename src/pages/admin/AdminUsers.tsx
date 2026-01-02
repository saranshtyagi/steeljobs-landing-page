import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers, useToggleUserStatus } from "@/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserX, UserCheck, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: users, isLoading, refetch } = useAdminUsers({ role: roleFilter, search });
  const { toggleStatus } = useToggleUserStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleStatus(userId, !currentStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: currentStatus ? "User Disabled" : "User Enabled",
        description: `User has been ${currentStatus ? "disabled" : "enabled"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      case "recruiter":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      case "candidate":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      default:
        return "bg-slate-600/20 text-slate-400 border-slate-600/30";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-1">
              View and manage all platform users
            </p>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="candidate">Candidates</SelectItem>
              <SelectItem value="recruiter">Recruiters</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
                <TableHead className="text-slate-400">Last Login</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user) => (
                  <TableRow key={user.id} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="text-white font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.is_active
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : "bg-red-600/20 text-red-400 border-red-600/30"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {user.last_login_at
                        ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.user_id, user.is_active)}
                        className={
                          user.is_active
                            ? "text-red-400 hover:text-red-300 hover:bg-red-600/10"
                            : "text-green-400 hover:text-green-300 hover:bg-green-600/10"
                        }
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats footer */}
        <div className="text-sm text-slate-500">
          Showing {users?.length || 0} users
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
