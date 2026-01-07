import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, RefreshCw, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";

type ResetStep = "email" | "otp" | "new-password" | "success";

interface PasswordResetFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

const PasswordResetFlow = ({ onBack, onComplete }: PasswordResetFlowProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const emailSchema = z.string().trim().email(t("auth.emailInvalid")).max(255, t("validation.emailInvalid"));
  const passwordSchema = z.string().min(6, t("auth.passwordTooShort")).max(72, t("validation.passwordTooLong"));

  useEffect(() => {
    if (step === "otp" && countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, step]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("send-password-reset-otp", {
        body: { email: email.trim() },
      });

      if (response.error) {
        let errorData: { error?: string } | null = null;
        if (response.error instanceof FunctionsHttpError) {
          try {
            const errorContext = response.error.context;
            if (errorContext && typeof errorContext.json === "function") {
              errorData = await errorContext.json();
            }
          } catch {
            errorData = response.data;
          }
        } else {
          errorData = response.data;
        }
        const errorMessage = errorData?.error || "Failed to send reset code. Please try again.";
        toast.error(errorMessage);
        return;
      }

      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }

      toast.success("If an account exists with this email, a reset code has been sent.");
      setStep("otp");
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error("Send OTP error:", err);
      toast.error("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setStep("new-password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("reset-password", {
        body: {
          email: email.trim(),
          otp,
          newPassword,
        },
      });

      if (response.error) {
        let errorData: { error?: string } | null = null;
        if (response.error instanceof FunctionsHttpError) {
          try {
            const errorContext = response.error.context;
            if (errorContext && typeof errorContext.json === "function") {
              errorData = await errorContext.json();
            }
          } catch {
            errorData = response.data;
          }
        } else {
          errorData = response.data;
        }
        const errorMessage = errorData?.error || "Failed to reset password. Please try again.";
        toast.error(errorMessage);
        
        // If OTP is invalid or expired, go back to OTP step
        if (errorMessage.includes("OTP") || errorMessage.includes("expired")) {
          setOtp("");
          setStep("otp");
        }
        return;
      }

      if (response.data?.error) {
        toast.error(response.data.error);
        if (response.data.error.includes("OTP") || response.data.error.includes("expired")) {
          setOtp("");
          setStep("otp");
        }
        return;
      }

      toast.success("Password reset successfully!");
      setStep("success");
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await supabase.functions.invoke("send-password-reset-otp", {
        body: { email: email.trim() },
      });

      if (response.error || response.data?.error) {
        toast.error("Failed to resend code. Please try again.");
        return;
      }

      toast.success("A new code has been sent to your email");
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Email step
  if (step === "email") {
    return (
      <form onSubmit={handleSendOTP} className="space-y-6">
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your email and we'll send you a code to reset your password.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-email">{t("auth.email")}</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>
    );
  }

  // OTP step
  if (step === "otp") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep("email")}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
          <p className="text-muted-foreground">We've sent a 6-digit code to</p>
          <p className="font-medium text-foreground mt-1">{email}</p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button onClick={handleVerifyOTP} variant="hero" className="w-full" disabled={otp.length !== 6}>
          Continue
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Resend in <span className="font-medium text-foreground">{countdown}s</span>
            </p>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Check your spam folder if you don't see the email in your inbox.
        </p>
      </div>
    );
  }

  // New password step
  if (step === "new-password") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep("otp")}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Create New Password</h1>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
        </div>

        <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    );
  }

  // Success step
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
        <p className="text-muted-foreground">Your password has been successfully reset. You can now sign in with your new password.</p>
      </div>

      <Button onClick={onComplete} variant="hero" className="w-full">
        Back to Sign In
      </Button>
    </div>
  );
};

export default PasswordResetFlow;
