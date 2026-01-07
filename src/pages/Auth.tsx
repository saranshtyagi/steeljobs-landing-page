import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Users, Building2, ArrowLeft, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import EmailOTPVerification from "@/components/auth/EmailOTPVerification";
import PasswordResetFlow from "@/components/auth/PasswordResetFlow";

type AuthMode = "signin" | "signup" | "role-select" | "otp-verification" | "admin-invite" | "forgot-password";
type AppRole = "recruiter" | "candidate";

interface AdminInviteState {
  token: string;
  email: string;
  existingUser: boolean;
  isProcessing: boolean;
  processed: boolean;
}

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const initialMode = inviteToken ? "admin-invite" : (searchParams.get("mode") === "signup" ? "role-select" : "signin");

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [adminInvite, setAdminInvite] = useState<AdminInviteState | null>(
    inviteToken ? { token: inviteToken, email: "", existingUser: false, isProcessing: true, processed: false } : null
  );

  const emailSchema = z.string().trim().email(t("auth.emailInvalid")).max(255, t("validation.emailInvalid"));
  const passwordSchema = z.string().min(6, t("auth.passwordTooShort")).max(72, t("validation.passwordTooLong"));
  const nameSchema = z.string().trim().min(1, t("auth.nameRequired")).max(100, t("validation.nameTooLong"));

  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();

  // Process admin invite token
  useEffect(() => {
    if (inviteToken && adminInvite?.isProcessing && !adminInvite?.processed) {
      processAdminInvite(inviteToken);
    }
  }, [inviteToken]);

  const processAdminInvite = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-invite", {
        body: { inviteToken: token, action: "accept" },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Invalid or expired invitation");
        setMode("signin");
        setAdminInvite(null);
        return;
      }

      if (data.existingUser) {
        // User already exists and has been promoted to admin
        toast.success("You've been granted admin access! Please sign in.");
        setEmail(data.email);
        setMode("signin");
        setAdminInvite({ ...adminInvite!, email: data.email, existingUser: true, isProcessing: false, processed: true });
      } else {
        // New user - needs to sign up
        setEmail(data.email);
        setAdminInvite({ ...adminInvite!, email: data.email, existingUser: false, isProcessing: false, processed: true });
      }
    } catch (err) {
      console.error("Error processing invite:", err);
      toast.error("Failed to process invitation");
      setMode("signin");
      setAdminInvite(null);
    }
  };

  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate");
      }
    }
  }, [user, role, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error(t("auth.invalidCredentials"));
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(t("auth.signedInSuccessfully"));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("send-otp", {
        body: {
          email: email.trim(),
          name: name.trim(),
        },
      });

      // Handle edge function errors properly
      if (response.error) {
        let errorData: { error?: string; userExists?: boolean } | null = null;

        // Try to get the JSON body from FunctionsHttpError
        if (response.error instanceof FunctionsHttpError) {
          try {
            // The context contains the Response object
            const errorContext = response.error.context;
            if (errorContext && typeof errorContext.json === 'function') {
              errorData = await errorContext.json();
            }
          } catch {
            // If parsing fails, try response.data as fallback
            errorData = response.data;
          }
        } else {
          // For other error types, check response.data
          errorData = response.data;
        }

        // Check if user already exists
        if (errorData?.userExists) {
          toast.error(errorData.error || "An account with this email already exists. Please sign in instead.");
          setMode("signin");
          setIsLoading(false);
          return;
        }

        // Show the actual error message if available
        const errorMessage = errorData?.error || "Failed to send verification code. Please try again.";
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Check for error in successful response (shouldn't happen but just in case)
      if (response.data?.error) {
        if (response.data.userExists) {
          toast.error(response.data.error);
          setMode("signin");
        } else {
          toast.error(response.data.error);
        }
        setIsLoading(false);
        return;
      }

      toast.success("Verification code sent to your email!");
      setMode("otp-verification");
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    // User is now authenticated, redirect will happen via useEffect
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInvite) return;

    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Sign up with admin role
      const { error } = await signUp(adminInvite.email, password, name.trim(), "admin" as any);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      // Mark invite as accepted
      await supabase.functions.invoke("admin-invite", {
        body: { inviteToken: adminInvite.token, action: "accept" },
      });

      toast.success("Admin account created! You can now sign in.");
      setMode("signin");
      setEmail(adminInvite.email);
    } catch (err: any) {
      console.error("Admin signup error:", err);
      toast.error("Failed to create admin account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setMode("signup");
  };

  const renderRoleSelect = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("auth.createAccount")}</h1>
        <p className="text-muted-foreground">{t("auth.chooseRole")}</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => handleRoleSelect("recruiter")}
          className="group relative p-6 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all duration-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{t("auth.imRecruiter")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.recruiterDescription")}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect("candidate")}
          className="group relative p-6 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all duration-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{t("auth.imJobSeeker")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.jobSeekerDescription")}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">
            {t("auth.signIn")}
          </button>
        </p>
      </div>
    </div>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode("role-select")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {selectedRole === "recruiter" ? t("auth.createRecruiterAccount") : t("auth.createCandidateAccount")}
        </h1>
        <p className="text-muted-foreground">{t("auth.enterDetails")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.fullName")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("auth.fullNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
        {isLoading ? t("auth.creatingAccount") : t("hero.createAccount")}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <button type="button" onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">
            {t("auth.signIn")}
          </button>
        </p>
      </div>
    </form>
  );

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("auth.welcomeBack")}</h1>
        <p className="text-muted-foreground">{t("auth.signInToAccount")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <button
              type="button"
              onClick={() => setMode("forgot-password")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
        {isLoading ? t("auth.signingIn") : t("common.signIn")}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.dontHaveAccount")}{" "}
          <button
            type="button"
            onClick={() => setMode("role-select")}
            className="text-primary hover:underline font-medium"
          >
            {t("auth.createOne")}
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <a href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">SteelJobs</span>
          </a>
          <h2 className="text-2xl font-semibold mb-4">{t("auth.whereTalentMeets")}</h2>
          <p className="text-primary-foreground/80">{t("auth.joinThousands")}</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Steel<span className="gradient-text">Jobs</span>
            </span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
            {mode === "admin-invite" && adminInvite && (
              adminInvite.isProcessing ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Processing Invitation</h1>
                  <p className="text-muted-foreground">Please wait while we verify your admin invitation...</p>
                </div>
              ) : !adminInvite.existingUser ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Admin Invitation</h1>
                    <p className="text-muted-foreground">Create your admin account to access the control panel</p>
                  </div>
                  <form onSubmit={handleAdminSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">{t("auth.fullName")}</Label>
                      <Input
                        id="admin-name"
                        type="text"
                        placeholder={t("auth.fullNamePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">{t("auth.email")}</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminInvite.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email is set by the invitation</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.passwordPlaceholder")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={errors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Create Admin Account
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              ) : null
            )}
            {mode === "role-select" && renderRoleSelect()}
            {mode === "signup" && renderSignUpForm()}
            {mode === "signin" && renderSignInForm()}
            {mode === "forgot-password" && (
              <PasswordResetFlow
                onBack={() => setMode("signin")}
                onComplete={() => setMode("signin")}
              />
            )}
            {mode === "otp-verification" && selectedRole && (
              <EmailOTPVerification
                email={email.trim()}
                name={name.trim()}
                password={password}
                role={selectedRole}
                onBack={() => setMode("signup")}
                onVerified={handleOTPVerified}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
