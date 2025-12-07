import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Send, Users } from "lucide-react";
import { useSendEmail, EMAIL_TEMPLATES, EmailRecipient } from "@/hooks/useEmailCandidates";
import { useRecruiterProfile } from "@/hooks/useRecruiterProfile";

interface EmailCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: EmailRecipient[];
  jobId?: string;
  jobTitle?: string;
}

const EmailCandidateModal = ({
  isOpen,
  onClose,
  recipients,
  jobId,
  jobTitle,
}: EmailCandidateModalProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { profile } = useRecruiterProfile();
  const sendEmail = useSendEmail();

  const isBulk = recipients.length > 1;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setBody("");
      setSelectedTemplate("");
    }
  }, [isOpen]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES[templateId as keyof typeof EMAIL_TEMPLATES];
    if (template) {
      // Replace placeholders with actual values where available
      let newSubject = template.subject
        .replace(/\{\{companyName\}\}/g, profile?.company_name || "{{companyName}}")
        .replace(/\{\{jobTitle\}\}/g, jobTitle || "{{jobTitle}}");
      
      let newBody = template.body
        .replace(/\{\{companyName\}\}/g, profile?.company_name || "{{companyName}}")
        .replace(/\{\{recruiterName\}\}/g, profile?.contact_name || "Hiring Team")
        .replace(/\{\{jobTitle\}\}/g, jobTitle || "{{jobTitle}}");

      // For single recipient, also replace candidate name
      if (!isBulk && recipients[0]) {
        newSubject = newSubject.replace(/\{\{candidateName\}\}/g, recipients[0].name || "Candidate");
        newBody = newBody.replace(/\{\{candidateName\}\}/g, recipients[0].name || "Candidate");
      }

      setSubject(newSubject);
      setBody(newBody);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;

    await sendEmail.mutateAsync({
      recipients,
      subject,
      body,
      templateId: selectedTemplate || undefined,
      jobId: jobId || undefined,
    });

    onClose();
  };

  const validRecipients = recipients.filter(r => r.email);
  const invalidCount = recipients.length - validRecipients.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {isBulk ? "Send Bulk Email" : "Send Email"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipients */}
          <div className="space-y-2">
            <Label>To</Label>
            {isBulk ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{validRecipients.length} recipients</span>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {invalidCount} without email
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {validRecipients.slice(0, 10).map((r, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {r.name || r.email}
                    </Badge>
                  ))}
                  {validRecipients.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{validRecipients.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <Input
                value={recipients[0]?.email || "No email available"}
                disabled
                className="bg-muted/50"
              />
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or write custom message" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message"
              rows={12}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {"{{candidateName}}"}, {"{{companyName}}"}, {"{{jobTitle}}"}, {"{{recruiterName}}"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sendEmail.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim() || validRecipients.length === 0 || sendEmail.isPending}
          >
            {sendEmail.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {isBulk ? `to ${validRecipients.length}` : "Email"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCandidateModal;
