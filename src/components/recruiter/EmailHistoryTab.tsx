import { useState } from "react";
import { useEmailLogs, EmailLog } from "@/hooks/useEmailCandidates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Calendar, 
  Users, 
  Briefcase, 
  ChevronRight,
  Inbox
} from "lucide-react";
import { format } from "date-fns";

const EmailHistoryTab = () => {
  const { data: logs, isLoading } = useEmailLogs();
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No emails sent yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            When you send emails to candidates, they will appear here for your records.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {log.subject}
                    </h4>
                    {log.template_id && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        Template
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {log.sent_to_count} recipient{log.sent_to_count !== 1 ? "s" : ""}
                    </span>
                    {log.job && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {log.job.title}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Subject</h4>
                <p className="text-foreground">{selectedLog.subject}</p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sent:</span>{" "}
                  <span className="text-foreground">
                    {format(new Date(selectedLog.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Recipients:</span>{" "}
                  <span className="text-foreground">{selectedLog.sent_to_count}</span>
                </div>
                {selectedLog.job && (
                  <div>
                    <span className="text-muted-foreground">Job:</span>{" "}
                    <span className="text-foreground">{selectedLog.job.title}</span>
                  </div>
                )}
              </div>

              {/* Message Preview */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Message Preview</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedLog.body_preview}
                    {selectedLog.body_preview && selectedLog.body_preview.length >= 200 && "..."}
                  </p>
                </div>
              </div>

              {/* Recipients List */}
              {selectedLog.recipients && selectedLog.recipients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recipients</h4>
                  <ScrollArea className="h-40 rounded-lg border">
                    <div className="p-2 space-y-1">
                      {(selectedLog.recipients as any[]).map((recipient: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                        >
                          <span className="text-sm text-foreground">
                            {recipient.name || "Unknown"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {recipient.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailHistoryTab;
