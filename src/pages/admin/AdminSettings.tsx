import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Server, Database, Shield, Cloud } from "lucide-react";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">
            Platform health and configuration overview
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="w-5 h-5" />
                Platform Status
              </CardTitle>
              <CardDescription className="text-slate-400">
                Core services health check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Server</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Authentication</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">File Storage</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Info
              </CardTitle>
              <CardDescription className="text-slate-400">
                Storage and connection details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Provider</span>
                <span className="text-white">Lovable Cloud</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Region</span>
                <span className="text-white">Auto-managed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Encryption</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">RLS Policies</span>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Overview */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Overview
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current security configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-white">Authentication</h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>✓ Email/Password enabled</li>
                  <li>✓ Auto-confirm enabled</li>
                  <li>✓ Session management active</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Access Control</h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>✓ Role-based access (RBAC)</li>
                  <li>✓ Row-level security (RLS)</li>
                  <li>✓ Admin-only routes protected</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Data Protection</h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>✓ Data encrypted at rest</li>
                  <li>✓ HTTPS enforced</li>
                  <li>✓ Secure API endpoints</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Platform Features
            </CardTitle>
            <CardDescription className="text-slate-400">
              Active features and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-white mb-1">Job Listings</h4>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-white mb-1">Applications</h4>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-white mb-1">Resume Upload</h4>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-white mb-1">Email System</h4>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Note */}
        <Card className="bg-red-900/20 border-red-800/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-300">Admin Access Information</h4>
                <p className="text-sm text-red-400/80 mt-1">
                  This admin panel is hidden from normal users. Access is only available 
                  to users with the "admin" role. Admin routes are protected at both 
                  frontend and backend levels. Never share admin credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
