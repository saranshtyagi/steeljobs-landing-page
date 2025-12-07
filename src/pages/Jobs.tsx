import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFilteredJobs, Job, JobFilters, EmploymentType, WorkMode, EducationLevel, SortOption } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleSaveJob, useIsJobSaved } from "@/hooks/useSavedJobs";
import { useApplicationStatus } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import {
  Loader2,
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not disclosed";
  if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
  return "Not disclosed";
};

const formatEmploymentType = (type: string): string => {
  const types: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    internship: "Internship",
    remote: "Remote",
  };
  return types[type] || type;
};

const formatWorkMode = (mode: string | null | undefined): string => {
  if (!mode) return "";
  const modes: Record<string, string> = {
    onsite: "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };
  return modes[mode] || mode;
};

const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) return diffHours <= 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Job Card Component
const JobCard = ({ job, onClick }: { job: Job; onClick: () => void }) => {
  const { user } = useAuth();
  const toggleSaveJob = useToggleSaveJob();
  const { data: isSaved, isLoading: savedLoading } = useIsJobSaved(job.id);
  const { data: applicationStatus } = useApplicationStatus(job.id);
  const hasApplied = !!applicationStatus;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleSaveJob.mutate(job.id);
  };

  const isHotJob = new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  return (
    <div
      className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
          {job.recruiter?.company_logo_url ? (
            <img src={job.recruiter.company_logo_url} alt={job.company_name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            job.company_name.substring(0, 2).toUpperCase()
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span>{job.company_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isHotJob && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="w-3 h-3" />
                  Hot
                </Badge>
              )}
              {hasApplied && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                  Applied
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {(job.experience_min || 0)}-{job.experience_max || "10+"}yrs
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
            {job.work_mode && (
              <Badge variant="outline" className="text-xs">
                {formatWorkMode(job.work_mode)}
              </Badge>
            )}
          </div>

          {job.skills_required && job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills_required.length - 5} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(job.created_at)}
            </span>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={toggleSaveJob.isPending || savedLoading}
                  className="h-8 w-8 p-0"
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button variant="hero" size="sm" className="gap-1">
                {hasApplied ? "View" : "Apply"}
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filters Sidebar Component
const FiltersSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
}: {
  filters: JobFilters;
  onFilterChange: (filters: Partial<JobFilters>) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}) => {
  const employmentTypes: { value: EmploymentType; label: string }[] = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
  ];

  const workModes: { value: WorkMode; label: string }[] = [
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
  ];

  const educationLevels: { value: EducationLevel; label: string }[] = [
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate" },
    { value: "bachelor", label: "Bachelor's" },
    { value: "master", label: "Master's" },
    { value: "doctorate", label: "Doctorate" },
  ];

  const postedWithinOptions = [
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
  ];

  const hasActiveFilters =
    filters.employmentTypes?.length ||
    filters.workModes?.length ||
    filters.educationLevels?.length ||
    filters.postedWithin ||
    filters.experienceMin !== undefined ||
    filters.experienceMax !== undefined ||
    filters.salaryMin ||
    filters.salaryMax;

  return (
    <div className={`space-y-6 ${isMobile ? "" : "sticky top-4"}`}>
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Active Filters</span>
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-muted-foreground">
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Employment Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Employment Type</Label>
        <div className="space-y-2">
          {employmentTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`emp-${type.value}`}
                checked={filters.employmentTypes?.includes(type.value)}
                onCheckedChange={(checked) => {
                  const current = filters.employmentTypes || [];
                  const updated = checked
                    ? [...current, type.value]
                    : current.filter((t) => t !== type.value);
                  onFilterChange({ employmentTypes: updated.length ? updated : undefined });
                }}
              />
              <Label htmlFor={`emp-${type.value}`} className="text-sm text-muted-foreground cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Work Mode</Label>
        <div className="space-y-2">
          {workModes.map((mode) => (
            <div key={mode.value} className="flex items-center space-x-2">
              <Checkbox
                id={`work-${mode.value}`}
                checked={filters.workModes?.includes(mode.value)}
                onCheckedChange={(checked) => {
                  const current = filters.workModes || [];
                  const updated = checked
                    ? [...current, mode.value]
                    : current.filter((m) => m !== mode.value);
                  onFilterChange({ workModes: updated.length ? updated : undefined });
                }}
              />
              <Label htmlFor={`work-${mode.value}`} className="text-sm text-muted-foreground cursor-pointer">
                {mode.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Experience: {filters.experienceMin ?? 0} - {filters.experienceMax ?? 15}+ years
        </Label>
        <div className="px-2">
          <Slider
            value={[filters.experienceMin ?? 0, filters.experienceMax ?? 15]}
            min={0}
            max={15}
            step={1}
            onValueChange={([min, max]) => {
              onFilterChange({
                experienceMin: min === 0 ? undefined : min,
                experienceMax: max === 15 ? undefined : max,
              });
            }}
          />
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Salary: ₹{((filters.salaryMin ?? 0) / 100000).toFixed(0)}L - ₹{((filters.salaryMax ?? 5000000) / 100000).toFixed(0)}L+
        </Label>
        <div className="px-2">
          <Slider
            value={[filters.salaryMin ?? 0, filters.salaryMax ?? 5000000]}
            min={0}
            max={5000000}
            step={100000}
            onValueChange={([min, max]) => {
              onFilterChange({
                salaryMin: min === 0 ? undefined : min,
                salaryMax: max === 5000000 ? undefined : max,
              });
            }}
          />
        </div>
      </div>

      {/* Education */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Education</Label>
        <div className="space-y-2">
          {educationLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`edu-${level.value}`}
                checked={filters.educationLevels?.includes(level.value)}
                onCheckedChange={(checked) => {
                  const current = filters.educationLevels || [];
                  const updated = checked
                    ? [...current, level.value]
                    : current.filter((l) => l !== level.value);
                  onFilterChange({ educationLevels: updated.length ? updated : undefined });
                }}
              />
              <Label htmlFor={`edu-${level.value}`} className="text-sm text-muted-foreground cursor-pointer">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Posted Within */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Posted Within</Label>
        <div className="space-y-2">
          {postedWithinOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`posted-${option.value}`}
                checked={filters.postedWithin === option.value}
                onCheckedChange={(checked) => {
                  onFilterChange({ postedWithin: checked ? (option.value as "24h" | "7d" | "30d") : undefined });
                }}
              />
              <Label htmlFor={`posted-${option.value}`} className="text-sm text-muted-foreground cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();

  const [filters, setFilters] = useState<JobFilters>(() => ({
    keywords: searchParams.get("q") || undefined,
    location: searchParams.get("location") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: 10,
    sortBy: (searchParams.get("sort") as SortOption) || "relevance",
  }));

  const { data, isLoading, error } = useFilteredJobs(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keywords) params.set("q", filters.keywords);
    if (filters.location) params.set("location", filters.location);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.sortBy && filters.sortBy !== "relevance") params.set("sort", filters.sortBy);
    setSearchParams(params, { replace: true });
  }, [filters.keywords, filters.location, filters.page, filters.sortBy, setSearchParams]);

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: 10, sortBy: "relevance" });
  };

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={filters.keywords ? `${filters.keywords} Jobs | SteelJobs.com` : "Steel, Power & Mining Jobs | SteelJobs.com"}
        description="Browse thousands of jobs in Steel, Power, and Mining industries. Find your next career opportunity with India's specialized industrial job portal."
        keywords="steel jobs, power sector jobs, mining jobs, industrial jobs, plant manager, metallurgy, engineering jobs India"
        canonicalUrl="https://steeljobs.com/jobs"
      />
      {/* Simple Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-narrow flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold gradient-text">
            SteelJobs
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="hero" size="sm" onClick={() => navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Header */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
        <div className="container-narrow py-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Job title, skills, or company"
                value={filters.keywords || ""}
                onChange={(e) => handleFilterChange({ keywords: e.target.value || undefined })}
                className="pl-11 h-12 text-base"
              />
            </div>
            <div className="relative flex-1 md:max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="City or state"
                value={filters.location || ""}
                onChange={(e) => handleFilterChange({ location: e.target.value || undefined })}
                className="pl-11 h-12 text-base"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="h-12 px-8">
              <Search className="w-5 h-5 mr-2" />
              Search Jobs
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container-narrow py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <FiltersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                        isMobile
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {data ? (
                    <>
                      Showing <span className="font-medium text-foreground">{data.jobs.length}</span> of{" "}
                      <span className="font-medium text-foreground">{data.totalCount}</span> jobs
                    </>
                  ) : (
                    "Loading jobs..."
                  )}
                </p>
              </div>

              <Select
                value={filters.sortBy || "relevance"}
                onValueChange={(value) => handleFilterChange({ sortBy: value as SortOption })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12 bg-destructive/10 rounded-xl">
                <p className="text-destructive mb-2">Failed to load jobs</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            )}

            {/* Jobs */}
            {data && data.jobs.length > 0 && (
              <div className="space-y-4">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {data && data.jobs.length === 0 && (
              <div className="text-center py-12 bg-muted/50 rounded-xl">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-2">No jobs found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                        className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setFilters((prev) => ({ ...prev, page }))}
                            isActive={filters.page === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(data.totalPages, (prev.page || 1) + 1) }))}
                        className={filters.page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Jobs;