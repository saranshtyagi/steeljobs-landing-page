import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Loader2, Trash2, Send, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

interface AdminInvite {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  email_id: string | null;
  email_status: string | null;
}

const emailSchema = z.string().email("Please enter a valid email address");

const AdminInviteSection = () => {
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdminInvite[];
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("admin-invite", {
        body: { email, action: "send" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setEmail("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from("admin_invites")
        .update({ status: "revoked" })
        .eq("id", inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
    onError: () => {
      toast.error("Failed to revoke invitation");
    },
  });

  const handleSendInvite = () => {
    setEmailError(null);
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }
    sendInviteMutation.mutate(email.trim());
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === "accepted") {
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      );
    }
    if (status === "revoked") {
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
          <XCircle className="w-3 h-3 mr-1" />
          Revoked
        </Badge>
      );
    }
    if (status === "expired" || isExpired) {
      return (
        <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
        <Mail className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getEmailStatusBadge = (emailStatus: string | null) => {
    if (emailStatus === "sent") {
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
          <Send className="w-3 h-3 mr-1" />
          Delivered
        </Badge>
      );
    }
    if (emailStatus === "failed") {
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
    if (emailStatus === "sending") {
      return (
        <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Sending
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
        <Clock className="w-3 h-3 mr-1" />
        Unknown
      </Badge>
    );
  };

  const pendingCount = invites?.filter(
    (i) => i.status === "pending" && new Date(i.expires_at) > new Date()
  ).length || 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Admin Invitations
          </CardTitle>
          <CardDescription className="text-slate-400">
            Invite new administrators to the platform
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Invite New Admin</DialogTitle>
              <DialogDescription className="text-slate-400">
                Send an invitation email to grant admin access. If the user already has a 
                candidate or recruiter account, their profile will be removed and they'll 
                become an admin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {emailError && (
                  <p className="text-sm text-red-400">{emailError}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={sendInviteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {sendInviteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {pendingCount > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
            <p className="text-sm text-yellow-400">
              {pendingCount} pending invitation{pendingCount !== 1 ? "s" : ""} awaiting response
            </p>
          </div>
        )}

        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Sender</TableHead>
                <TableHead className="text-slate-400">Email Status</TableHead>
                <TableHead className="text-slate-400">Invite Status</TableHead>
                <TableHead className="text-slate-400">Sent</TableHead>
                <TableHead className="text-slate-400">Expires</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : invites?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    No invitations sent yet
                  </TableCell>
                </TableRow>
              ) : (
                invites?.map((invite) => (
                  <TableRow
                    key={invite.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell className="text-white font-medium">
                      {invite.email}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <span className="font-medium">SteelJobs Admin</span>
                    </TableCell>
                    <TableCell>
                      {getEmailStatusBadge(invite.email_status)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invite.status, invite.expires_at)}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(invite.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(invite.expires_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {invite.status === "pending" && 
                       new Date(invite.expires_at) > new Date() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeInviteMutation.mutate(invite.id)}
                          disabled={revokeInviteMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInviteSection;
