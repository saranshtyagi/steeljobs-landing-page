import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "recruiter" | "candidate";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: AppRole;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
        return;
      }

      if (allowedRole && role && role !== allowedRole) {
        // Redirect to their correct dashboard if they have the wrong role
        navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate");
      }
    }
  }, [user, role, loading, allowedRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRole && role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
