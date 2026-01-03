import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRecruiterProfile } from "@/hooks/useRecruiterProfile";
import { useRequestPremiumAccess } from "@/hooks/useRequestPremiumAccess";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Crown, Users, Search, Mail, FileText, Loader2, CheckCircle } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
}

const PremiumGate = ({ children }: PremiumGateProps) => {
  const { profile, isLoading } = useRecruiterProfile();
  const { user } = useAuth();
  const requestPremium = useRequestPremiumAccess();
  const [requestSent, setRequestSent] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user has premium access, show the children
  if (profile?.has_premium_access) {
    return <>{children}</>;
  }

  const handleRequestPremium = async () => {
    if (!profile || !user?.email) return;

    await requestPremium.mutateAsync({
      recruiterName: profile.contact_name || "",
      recruiterEmail: user.email,
      companyName: profile.company_name,
      companyPhone: profile.contact_phone,
      recruiterId: profile.id,
    });
    setRequestSent(true);
  };

  const features = [
    {
      icon: Users,
      title: "Full Candidate Database",
      description: "Access all registered candidates with verified profiles",
    },
    {
      icon: Search,
      title: "Advanced Filters",
      description: "Filter by skills, experience, location, and salary expectations",
    },
    {
      icon: Mail,
      title: "Direct Communication",
      description: "Contact candidates directly via email",
    },
    {
      icon: FileText,
      title: "Resume Access",
      description: "Download resumes and create shortlists",
    },
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Premium Lock Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 text-center border-b border-border">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Premium Feature
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Unlock access to our comprehensive candidate database and find the perfect talent for your organization
            </p>
          </div>

          {/* Features Grid */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              What you'll get
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-xl p-6 border border-primary/20">
              {requestSent ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Our sales team will contact you within 24-48 business hours to discuss premium access options.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to find top talent?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get in touch with our sales team for pricing tailored to your hiring needs
                  </p>
                  <Button
                    onClick={handleRequestPremium}
                    disabled={requestPremium.isPending}
                    variant="hero"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {requestPremium.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Unlock Premium Access
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    A confirmation email will be sent to {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;
