import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailOTPVerificationProps {
  email: string;
  name: string;
  role: "recruiter" | "candidate";
  onBack: () => void;
  onVerified: () => void;
}

const EmailOTPVerification = ({ email, name, role, onBack, onVerified }: EmailOTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error(error.message || "Invalid OTP. Please try again.");
        setOtp("");
        return;
      }

      if (data.user) {
        // Insert the user role
        const { error: roleError } = await supabase.from("user_roles").insert({ user_id: data.user.id, role });

        if (roleError) {
          console.error("Error inserting role:", roleError);
          toast.error("Error setting up account. Please try again.");
          return;
        }

        toast.success("Email verified successfully! Welcome to SteelJobs.");
        onVerified();
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to resend OTP");
        return;
      }

      toast.success("A new OTP has been sent to your email");
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h1>
        <p className="text-muted-foreground">We've sent a 6-digit verification code to</p>
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

      <Button onClick={handleVerifyOTP} variant="hero" className="w-full" disabled={isVerifying || otp.length !== 6}>
        {isVerifying ? "Verifying..." : "Verify Email"}
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
            {isResending ? "Sending..." : "Resend OTP"}
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
};

export default EmailOTPVerification;
