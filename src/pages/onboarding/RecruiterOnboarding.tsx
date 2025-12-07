import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruiterProfile, RecruiterProfileInput } from "@/hooks/useRecruiterProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Building2, MapPin, Globe, Users, Phone, Mail, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5000+ employees",
];

const industries = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "E-commerce",
  "Manufacturing",
  "Education",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Retail",
  "Telecommunications",
  "Other",
];

const RecruiterOnboarding = () => {
  const navigate = useNavigate();
  const { user, role, profile: userProfile } = useAuth();
  const { profile, isLoading, createProfile, updateProfile } = useRecruiterProfile();

  const [formData, setFormData] = useState<RecruiterProfileInput>({
    company_name: "",
    company_website: "",
    company_location: "",
    company_size: "",
    industry: "",
    about: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role && role !== "recruiter") {
      navigate("/dashboard/candidate");
    }
  }, [role, navigate]);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/dashboard/recruiter");
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        contact_name: prev.contact_name || userProfile.name || "",
        contact_email: prev.contact_email || userProfile.email || "",
      }));
    }
  }, [userProfile]);

  const updateField = (field: keyof RecruiterProfileInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name?.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    if (!formData.contact_name?.trim() || !formData.contact_email?.trim()) {
      toast.error("Please enter contact details");
      return;
    }

    setIsSaving(true);
    try {
      const profileData: RecruiterProfileInput = {
        ...formData,
        onboarding_completed: true,
      };

      if (profile) {
        await updateProfile.mutateAsync(profileData);
      } else {
        await createProfile.mutateAsync(profileData);
      }

      toast.success("Company profile created!");
      navigate("/dashboard/recruiter");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Steel<span className="gradient-text">Jobs</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Set Up Your Company Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to start posting jobs and finding candidates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="w-5 h-5 text-primary" />
              Company Information
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="e.g., Acme Corporation"
                  value={formData.company_name || ""}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_website">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company_website"
                    placeholder="https://www.example.com"
                    value={formData.company_website || ""}
                    onChange={(e) => updateField("company_website", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_location">Headquarters Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company_location"
                    placeholder="e.g., Mumbai, India"
                    value={formData.company_location || ""}
                    onChange={(e) => updateField("company_location", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  value={formData.company_size || ""}
                  onValueChange={(value) => updateField("company_size", value)}
                >
                  <SelectTrigger>
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry || ""}
                  onValueChange={(value) => updateField("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About Company</Label>
              <Textarea
                id="about"
                placeholder="Tell candidates about your company, culture, and what makes it a great place to work..."
                value={formData.about || ""}
                onChange={(e) => updateField("about", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="w-5 h-5 text-primary" />
              Contact Information
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact_name"
                    placeholder="Your name"
                    value={formData.contact_name || ""}
                    onChange={(e) => updateField("contact_name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.contact_email || ""}
                    onChange={(e) => updateField("contact_email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact_phone"
                    placeholder="+91 98765 43210"
                    value={formData.contact_phone || ""}
                    onChange={(e) => updateField("contact_phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h3 className="font-semibold text-foreground mb-4">What you'll get:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Post unlimited job listings",
                "Access candidate database",
                "Track applications in real-time",
                "AI-powered candidate matching",
                "Bulk email candidates",
                "Analytics & insights",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Complete Setup & Continue"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default RecruiterOnboarding;
