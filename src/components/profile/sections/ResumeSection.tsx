import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Upload, FileText, RefreshCw, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import * as pdfjsLib from "pdfjs-dist";

// Use legacy build worker that works better in browser environments
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ParsedResumeData {
  name?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  experience_years?: number;
  education_level?: string;
  about?: string;
  profile_summary?: string;
  work_history?: Array<{
    company: string;
    role: string;
    duration?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    is_current?: boolean;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
    specialization?: string;
    grade?: string;
  }>;
  internships?: Array<{
    company: string;
    role: string;
    duration?: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description?: string;
    skills_used?: string[];
  }>;
  languages?: Array<{
    language: string;
    proficiency?: string;
  }>;
  certifications?: string[];
  accomplishments?: Array<{
    title: string;
    description?: string;
    issuing_org?: string;
  }>;
}

const ResumeSection = () => {
  const { t } = useTranslation();
  const { profile, updateProfile, refetch } = useCandidateProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = () => {
    if (profile?.resume_url) {
      updateFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      console.log("Extracted PDF text length:", fullText.length);
      console.log("Extracted PDF text preview:", fullText.substring(0, 500));
      
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      return extractTextFromPDF(file);
    }
    
    // For Word documents, read as text (basic support)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    // Get the current user's ID for the file path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Delete old resume if it exists
    if (profile?.resume_url) {
      try {
        const oldPath = profile.resume_url.split('/resumes/')[1];
        if (oldPath) {
          await supabase.storage.from('resumes').remove([oldPath]);
        }
      } catch (e) {
        console.log("Could not delete old resume:", e);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const saveEducation = async (candidateId: string, education: ParsedResumeData['education']) => {
    if (!education || education.length === 0) return;

    for (const edu of education) {
      const degreeLevel = mapDegreeToLevel(edu.degree);
      
      await supabase.from('candidate_education').insert({
        candidate_id: candidateId,
        degree_level: degreeLevel,
        course: edu.degree,
        university: edu.institution,
        specialization: edu.specialization || null,
        passing_year: edu.year ? parseInt(edu.year) : null,
        grade_value: edu.grade || null,
        is_highest: false,
      });
    }
  };

  const saveEmployment = async (candidateId: string, workHistory: ParsedResumeData['work_history']) => {
    if (!workHistory || workHistory.length === 0) return;

    for (const work of workHistory) {
      await supabase.from('candidate_employment').insert({
        candidate_id: candidateId,
        company_name: work.company,
        designation: work.role,
        description: work.description || null,
        is_current: work.is_current || false,
        start_date: work.start_date || null,
        end_date: work.end_date || null,
      });
    }
  };

  const saveInternships = async (candidateId: string, internships: ParsedResumeData['internships']) => {
    if (!internships || internships.length === 0) return;

    for (const intern of internships) {
      await supabase.from('candidate_internships').insert({
        candidate_id: candidateId,
        company_name: intern.company,
        role: intern.role,
        description: intern.description || null,
      });
    }
  };

  const saveProjects = async (candidateId: string, projects: ParsedResumeData['projects']) => {
    if (!projects || projects.length === 0) return;

    for (const project of projects) {
      await supabase.from('candidate_projects').insert({
        candidate_id: candidateId,
        title: project.title,
        description: project.description || null,
        skills_used: project.skills_used || [],
      });
    }
  };

  const saveLanguages = async (candidateId: string, languages: ParsedResumeData['languages']) => {
    if (!languages || languages.length === 0) return;

    for (const lang of languages) {
      await supabase.from('candidate_languages').insert({
        candidate_id: candidateId,
        language: lang.language,
        proficiency: lang.proficiency || 'intermediate',
        can_read: true,
        can_write: true,
        can_speak: true,
      });
    }
  };

  const saveAccomplishments = async (candidateId: string, accomplishments: ParsedResumeData['accomplishments'], certifications?: string[]) => {
    if (accomplishments && accomplishments.length > 0) {
      for (const acc of accomplishments) {
        await supabase.from('candidate_accomplishments').insert({
          candidate_id: candidateId,
          type: 'accomplishment',
          title: acc.title,
          description: acc.description || null,
          issuing_org: acc.issuing_org || null,
        });
      }
    }

    if (certifications && certifications.length > 0) {
      for (const cert of certifications) {
        await supabase.from('candidate_accomplishments').insert({
          candidate_id: candidateId,
          type: 'certification',
          title: cert,
        });
      }
    }
  };

  const mapDegreeToLevel = (degree: string): string => {
    const lowerDegree = degree.toLowerCase();
    if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) return 'doctorate';
    if (lowerDegree.includes('master') || lowerDegree.includes('mba') || lowerDegree.includes('m.tech') || lowerDegree.includes('m.sc')) return 'master';
    if (lowerDegree.includes('bachelor') || lowerDegree.includes('b.tech') || lowerDegree.includes('b.sc') || lowerDegree.includes('b.e') || lowerDegree.includes('bca') || lowerDegree.includes('bba')) return 'bachelor';
    if (lowerDegree.includes('associate') || lowerDegree.includes('diploma')) return 'associate';
    if (lowerDegree.includes('high school') || lowerDegree.includes('12th') || lowerDegree.includes('hsc') || lowerDegree.includes('10th') || lowerDegree.includes('ssc')) return 'high_school';
    return 'other';
  };

  const parseAndSaveResume = async (fileContent: string, resumeUrl: string) => {
    if (!profile?.id) {
      toast.error("Profile not found. Please refresh the page.");
      return;
    }

    if (!fileContent || fileContent.trim().length < 100) {
      toast.error("Could not extract text from resume. Please upload a different file.");
      return;
    }

    setIsParsing(true);
    try {
      const response = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: fileContent },
      });

      if (response.error) {
        console.error("Parse function error:", response.error);
        toast.error("Failed to parse resume. Please try again.");
        return;
      }

      const parsedData: ParsedResumeData = response.data?.data;
      
      if (!parsedData) {
        toast.error("Could not extract data from resume. The file may be corrupted.");
        return;
      }

      // Update the main profile with parsed data - ONLY include fields that have values
      const profileUpdate: Record<string, unknown> = {
        resume_url: resumeUrl,
        resume_text: fileContent, // Store extracted text for reliable re-parsing
      };

      // Only add fields if they have actual values from the resume
      if (parsedData.name) profileUpdate.full_name = parsedData.name;
      if (parsedData.headline) profileUpdate.headline = parsedData.headline;
      if (parsedData.location) profileUpdate.location = parsedData.location;
      if (parsedData.skills && parsedData.skills.length > 0) profileUpdate.skills = parsedData.skills;
      if (typeof parsedData.experience_years === 'number') profileUpdate.experience_years = parsedData.experience_years;
      if (parsedData.education_level) profileUpdate.education_level = parsedData.education_level;
      if (parsedData.about || parsedData.profile_summary) {
        profileUpdate.profile_summary = parsedData.profile_summary || parsedData.about;
        profileUpdate.about = parsedData.about || parsedData.profile_summary;
      }

      await updateProfile.mutateAsync(profileUpdate);

      // Save related data to respective tables - only if arrays have data
      const savePromises = [];
      if (parsedData.education && parsedData.education.length > 0) {
        savePromises.push(saveEducation(profile.id, parsedData.education));
      }
      if (parsedData.work_history && parsedData.work_history.length > 0) {
        savePromises.push(saveEmployment(profile.id, parsedData.work_history));
      }
      if (parsedData.internships && parsedData.internships.length > 0) {
        savePromises.push(saveInternships(profile.id, parsedData.internships));
      }
      if (parsedData.projects && parsedData.projects.length > 0) {
        savePromises.push(saveProjects(profile.id, parsedData.projects));
      }
      if (parsedData.languages && parsedData.languages.length > 0) {
        savePromises.push(saveLanguages(profile.id, parsedData.languages));
      }
      if ((parsedData.accomplishments && parsedData.accomplishments.length > 0) || 
          (parsedData.certifications && parsedData.certifications.length > 0)) {
        savePromises.push(saveAccomplishments(profile.id, parsedData.accomplishments, parsedData.certifications));
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateEmployment'] });
      queryClient.invalidateQueries({ queryKey: ['candidateInternships'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['candidateLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['candidateAccomplishments'] });
      await refetch();

      toast.success("Resume parsed and profile updated successfully!");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse resume. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const resumeUrl = await uploadToStorage(file);
      
      // Extract text and parse
      const fileContent = await extractTextFromFile(file);
      
      // Update profile with resume URL first
      await updateProfile.mutateAsync({ resume_url: resumeUrl });
      
      toast.success("Resume uploaded successfully!");
      
      // Then parse and fill profile
      await parseAndSaveResume(fileContent, resumeUrl);
      
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const handleReParse = async () => {
    if (!profile?.id) {
      toast.error("Profile not found. Please refresh the page.");
      return;
    }

    if (!profile?.resume_url && !profile?.resume_text) {
      toast.error("No resume found. Please upload a resume first.");
      return;
    }

    setIsParsing(true);
    try {
      let resumeContent = "";
      
      // First, try to use stored resume_text (most reliable)
      if (profile.resume_text && profile.resume_text.trim().length >= 100) {
        console.log("Using stored resume text for re-parse");
        resumeContent = profile.resume_text;
      } else if (profile.resume_url) {
        // Fallback: try to fetch from storage using signed URL
        console.log("Fetching resume from storage...");
        
        try {
          // Extract the file path from the URL
          const urlParts = profile.resume_url.split('/resumes/');
          if (urlParts.length < 2) {
            throw new Error("Invalid resume URL format");
          }
          
          const filePath = decodeURIComponent(urlParts[1]);
          console.log("Resume file path:", filePath);
          
          // Download the file using Supabase storage (works for private buckets)
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('resumes')
            .download(filePath);
          
          if (downloadError) {
            console.error("Storage download error:", downloadError);
            throw new Error("Could not download resume file");
          }
          
          if (!fileData) {
            throw new Error("Resume file is empty");
          }
          
          // Extract text from the downloaded blob
          const arrayBuffer = await fileData.arrayBuffer();
          
          // Check if it's a PDF
          const isPDF = profile.resume_url.toLowerCase().endsWith('.pdf') || 
                       fileData.type === 'application/pdf';
          
          if (isPDF) {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
              resumeContent += pageText + "\n\n";
            }
          } else {
            // For Word docs, try to read as text
            const textDecoder = new TextDecoder();
            resumeContent = textDecoder.decode(arrayBuffer);
          }
          
          console.log("Extracted resume text length:", resumeContent.length);
          
          // Store the extracted text for future re-parses
          if (resumeContent.trim().length >= 100) {
            await updateProfile.mutateAsync({ resume_text: resumeContent });
          }
        } catch (fetchError) {
          console.error("Error fetching resume from storage:", fetchError);
          toast.error("Resume file not found. Please upload your resume again.");
          setIsParsing(false);
          return;
        }
      }

      if (!resumeContent || resumeContent.trim().length < 100) {
        toast.error("Could not extract text from resume. Please upload a new resume.");
        setIsParsing(false);
        return;
      }

      const response = await supabase.functions.invoke('parse-resume', {
        body: { 
          resumeText: resumeContent,
          resumeUrl: profile.resume_url,
          candidateId: profile.id,
        },
      });

      if (response.error) {
        console.error("Parse function error:", response.error);
        toast.error("Failed to parse resume. Please try again.");
        setIsParsing(false);
        return;
      }

      const parsedData: ParsedResumeData = response.data?.data;
      
      if (!parsedData) {
        toast.error("Could not extract data from resume.");
        setIsParsing(false);
        return;
      }

      // Update profile - only with fields that have actual values
      const profileUpdate: Record<string, unknown> = {};

      if (parsedData.name) profileUpdate.full_name = parsedData.name;
      if (parsedData.headline) profileUpdate.headline = parsedData.headline;
      if (parsedData.location) profileUpdate.location = parsedData.location;
      if (parsedData.skills && parsedData.skills.length > 0) profileUpdate.skills = parsedData.skills;
      if (typeof parsedData.experience_years === 'number') profileUpdate.experience_years = parsedData.experience_years;
      if (parsedData.education_level) profileUpdate.education_level = parsedData.education_level;
      if (parsedData.about || parsedData.profile_summary) {
        profileUpdate.profile_summary = parsedData.profile_summary || parsedData.about;
        profileUpdate.about = parsedData.about || parsedData.profile_summary;
      }

      if (Object.keys(profileUpdate).length > 0) {
        await updateProfile.mutateAsync(profileUpdate);
      }

      // Save related data - only if arrays have data
      const savePromises = [];
      if (parsedData.education && parsedData.education.length > 0) {
        savePromises.push(saveEducation(profile.id, parsedData.education));
      }
      if (parsedData.work_history && parsedData.work_history.length > 0) {
        savePromises.push(saveEmployment(profile.id, parsedData.work_history));
      }
      if (parsedData.internships && parsedData.internships.length > 0) {
        savePromises.push(saveInternships(profile.id, parsedData.internships));
      }
      if (parsedData.projects && parsedData.projects.length > 0) {
        savePromises.push(saveProjects(profile.id, parsedData.projects));
      }
      if (parsedData.languages && parsedData.languages.length > 0) {
        savePromises.push(saveLanguages(profile.id, parsedData.languages));
      }
      if ((parsedData.accomplishments && parsedData.accomplishments.length > 0) || 
          (parsedData.certifications && parsedData.certifications.length > 0)) {
        savePromises.push(saveAccomplishments(profile.id, parsedData.accomplishments, parsedData.certifications));
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateEmployment'] });
      queryClient.invalidateQueries({ queryKey: ['candidateInternships'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['candidateLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['candidateAccomplishments'] });
      await refetch();

      toast.success("Profile updated from resume!");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to re-parse resume. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t("candidate.profile.sections.resume.title", "Resume")}
        </h2>
      </div>

      {profile?.resume_url ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground flex items-center gap-2">
                {t("candidate.profile.resumeUploaded", "Resume uploaded")}
                <CheckCircle className="w-4 h-4 text-green-500" />
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("candidate.profile.sections.resume.lastUpdated", "Last Updated")}: {profile.updated_at ? format(new Date(profile.updated_at), "dd MMM yyyy") : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              disabled={isUploading}
              onClick={() => updateFileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading
                ? t("candidate.profile.uploading", "Uploading...")
                : t("candidate.profile.sections.resume.updateResume", "Update Resume")}
            </Button>
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={isUploading}
            />
            <Button variant="outline" onClick={handleReParse} disabled={isParsing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isParsing ? "animate-spin" : ""}`} />
              {isParsing
                ? t("candidate.profile.parsing", "Parsing...")
                : t("candidate.profile.reParse", "Re-parse")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Re-parse will extract information from your resume and auto-fill your profile sections.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            {t("candidate.profile.uploadResumePrompt", "Upload your resume to complete your profile")}
          </p>
          <Button 
            disabled={isUploading || isParsing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading
              ? t("candidate.profile.uploading", "Uploading...")
              : isParsing 
              ? t("candidate.profile.parsing", "Parsing...")
              : t("candidate.profile.sections.resume.uploadResume", "Upload Resume")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-3">
            {t("candidate.profile.sections.resume.supportedFormats", "Supported formats: PDF, DOC, DOCX (Max 5MB)")}
          </p>
          <p className="text-xs text-primary mt-2">
            Your resume will be automatically parsed to fill your profile!
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
