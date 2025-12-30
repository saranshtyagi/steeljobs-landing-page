import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CalendarIcon, Check, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditBasicInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalStep = "edit" | "email-otp";

const EditBasicInfoModal = ({ open, onOpenChange }: EditBasicInfoModalProps) => {
  const { t } = useTranslation();
  const { profile: authProfile, user } = useAuth();
  const { profile, updateProfile } = useCandidateProfile();

  const [step, setStep] = useState<ModalStep>("edit");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    location: "",
    mobile_number: "",
    gender: "",
    date_of_birth: "",
    profile_summary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Email OTP state
  const [emailOtp, setEmailOtp] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    if (open && profile) {
      setFormData({
        full_name: profile.full_name || authProfile?.name || "",
        email: user?.email || authProfile?.email || "",
        location: profile.location || "",
        mobile_number: profile.mobile_number || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        profile_summary: profile.profile_summary || "",
      });
      setErrors({});
      setStep("edit");
      setEmailOtp("");
      setPendingEmail("");
    }
  }, [open, profile, authProfile, user]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Validate mobile number format: +91 followed by exactly 10 digits
  const isValidMobile = (mobile: string): boolean => {
    const mobileRegex = /^\+91[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle mobile number input with +91 prefix
  const handleMobileChange = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    
    if (!cleaned.startsWith("+91")) {
      if (cleaned.startsWith("91") && cleaned.length > 2) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("+")) {
        cleaned = "+91" + cleaned.slice(1).replace(/^\d{0,2}/, "");
      } else if (cleaned.length > 0 && !cleaned.startsWith("+")) {
        cleaned = "+91" + cleaned.replace(/^91/, "");
      }
    }
    
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13);
    }
    
    setFormData(prev => ({ ...prev, mobile_number: cleaned }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "City/Location is required";
    }
    
    if (formData.mobile_number && !isValidMobile(formData.mobile_number)) {
      newErrors.mobile_number = "Enter a valid 10-digit mobile number starting with +91";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const currentEmail = user?.email || authProfile?.email || "";
    const newEmail = formData.email.trim().toLowerCase();
    const emailChanged = newEmail !== currentEmail.toLowerCase();

    // If email changed, send OTP for verification
    if (emailChanged) {
      await sendEmailOtp(newEmail);
      return;
    }

    // No email change, just save the profile data
    await saveProfileData();
  };

  const sendEmailOtp = async (email: string) => {
    setIsSendingOtp(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) throw error;

      setPendingEmail(email);
      setStep("email-otp");
      setResendCountdown(60);
      toast.success(`Verification code sent to ${email}`);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: emailOtp,
        type: "email_change",
      });

      if (error) throw error;

      toast.success("Email updated successfully");
      await saveProfileData();
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    await sendEmailOtp(pendingEmail);
  };

  const saveProfileData = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name.trim(),
        location: formData.location.trim(),
        mobile_number: formData.mobile_number || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        profile_summary: formData.profile_summary.trim() || null,
      });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date_of_birth: format(date, "yyyy-MM-dd") }));
    }
    setDatePickerOpen(false);
  };

  const handleBack = () => {
    setStep("edit");
    setEmailOtp("");
  };

  if (step === "email-otp") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify New Email</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Verification code sent to</p>
                <p className="font-medium">{pendingEmail}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enter 6-digit code</Label>
              <InputOTP
                value={emailOtp}
                onChange={setEmailOtp}
                maxLength={6}
                className="justify-center"
              >
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

            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {resendCountdown}s
                </p>
              ) : (
                <Button variant="link" onClick={handleResendOtp} disabled={isSendingOtp}>
                  {isSendingOtp ? "Sending..." : "Resend code"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button 
              onClick={handleVerifyEmailOtp} 
              disabled={emailOtp.length !== 6 || isVerifyingEmail}
            >
              {isVerifyingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="fullName"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={errors.full_name ? "border-destructive" : ""}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={cn("pr-10", errors.email && "border-destructive")}
                placeholder="your@email.com"
              />
              {isValidEmail(formData.email) && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            {formData.email.toLowerCase() !== (user?.email || authProfile?.email || "").toLowerCase() && 
              formData.email.trim() && isValidEmail(formData.email) && (
              <p className="text-xs text-amber-600">
                Changing email will require OTP verification
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="relative">
              <Input
                id="mobile"
                value={formData.mobile_number}
                onChange={(e) => handleMobileChange(e.target.value)}
                onFocus={() => {
                  if (!formData.mobile_number) {
                    setFormData(prev => ({ ...prev, mobile_number: "+91" }));
                  }
                }}
                className={cn("pr-10", errors.mobile_number && "border-destructive")}
                placeholder="+91 9876543210"
                maxLength={13}
              />
              {isValidMobile(formData.mobile_number) && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.mobile_number && (
              <p className="text-sm text-destructive">{errors.mobile_number}</p>
            )}
          </div>

          {/* Location/City */}
          <div className="space-y-2">
            <Label htmlFor="location">City/Location <span className="text-destructive">*</span></Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className={errors.location ? "border-destructive" : ""}
              placeholder="e.g., Mumbai, Maharashtra"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_of_birth
                    ? format(new Date(formData.date_of_birth), "dd MMM yyyy")
                    : "Select your birthday"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Profile Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Profile Summary</Label>
            <Textarea
              id="summary"
              value={formData.profile_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, profile_summary: e.target.value }))}
              placeholder="Write a brief summary about yourself, your experience, and career goals..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.profile_summary.length} characters
              {formData.profile_summary.length < 50 && formData.profile_summary.length > 0 && 
                " (minimum 50 recommended)"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending || isSendingOtp}>
            {updateProfile.isPending || isSendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBasicInfoModal;
