import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, role, signOut, loading, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    return role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container-narrow">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Steel<span className="gradient-text">Jobs</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.howItWorks")}
            </a>
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {loading ? (
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {getInitials(profile.name)}
                    </div>
                    <span className="font-medium text-foreground">{profile.name}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <User className="w-4 h-4 mr-2" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  {t("nav.signIn")}
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth?mode=signup")}>
                  {t("nav.getStarted")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-up">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">
                {t("nav.features")}
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">
                {t("nav.howItWorks")}
              </a>
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {user && profile ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-medium">
                        {getInitials(profile.name)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{profile.name}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <Button variant="heroOutline" onClick={() => navigate(getDashboardLink())}>
                      {t("nav.dashboard")}
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="text-destructive">
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate("/auth")}>
                      {t("nav.signIn")}
                    </Button>
                    <Button variant="hero" onClick={() => navigate("/auth?mode=signup")}>
                      {t("nav.getStarted")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
