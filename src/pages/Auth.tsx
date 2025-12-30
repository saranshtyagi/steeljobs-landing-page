import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Users, Building2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import EmailOTPVerification from "@/components/auth/EmailOTPVerification";

type AuthMode = "signin" | "signup" | "role-select" | "otp-verification";
type AppRole = "recruiter" | "candidate";

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "role-select" : "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const emailSchema = z.string().trim().email(t("auth.emailInvalid")).max(255, t("validation.emailInvalid"));
  const passwordSchema = z.string().min(6, t("auth.passwordTooShort")).max(72, t("validation.passwordTooLong"));
  const nameSchema = z.string().trim().min(1, t("auth.nameRequired")).max(100, t("validation.nameTooLong"));

  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role) {
      navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate");
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
      // Send OTP to email instead of regular signup
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(t("auth.emailAlreadyRegistered"));
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Verification code sent to your email!");
      setMode("otp-verification");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    // User is now authenticated, redirect will happen via useEffect
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
            {mode === "role-select" && renderRoleSelect()}
            {mode === "signup" && renderSignUpForm()}
            {mode === "signin" && renderSignInForm()}
            {mode === "otp-verification" && selectedRole && (
              <EmailOTPVerification
                email={email.trim()}
                name={name.trim()}
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
