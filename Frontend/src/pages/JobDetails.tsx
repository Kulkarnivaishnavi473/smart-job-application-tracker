import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  Calendar, 
  Link2, 
  FileText, 
  Edit, 
  Trash2,
  MessageSquare,
  Plus,
  ExternalLink
} from 'lucide-react';
import { JobApplication, JobStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/utils/api';
import { format } from 'date-fns';

const statusColors: Record<JobStatus, string> = {
  applied: 'bg-primary/10 text-primary border-primary/20',
  oa: 'bg-info/10 text-info border-info/20',
  interview: 'bg-warning/10 text-warning border-warning/20',
  offer: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabels: Record<JobStatus, string> = {
  applied: 'Applied',
  oa: 'Online Assessment',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

// ✅ removed jobs & setJobs props
export default function JobDetails() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
 

  // ✅ FETCH FROM BACKEND
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetchWithAuth(`/jobs/${id}/`);

        if (!response.ok) throw new Error("Job not found");

        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error(error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ DELETE FROM BACKEND
  const handleDelete = async () => {
    if (!job) return;

    try {
      await fetchWithAuth(`/jobs/${job.id}/`, {
        method: "DELETE",
      });

      toast({
        title: 'Application deleted',
        description: `${job.company} - ${job.role}`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !job) return;
    
    const updatedNotes = [...(job.interviewNotes || []), newNote];
    setJob({ ...job, interviewNotes: updatedNotes });
    setNewNote('');
    
    toast({
      title: 'Note added',
      description: 'Your interview note has been saved.',
    });
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Job application not found</p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-card animate-fade-in overflow-hidden">
        <div className="h-2 gradient-primary" />
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{job.company}</h1>
                <p className="text-muted-foreground">{job.role}</p>
              </div>
            </div>
            <Badge className={cn('border', statusColors[job.status])}>
              {statusLabels[job.status]}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/jobs/${job.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this application for {job.company}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
      </Card>

      {/* REST OF UI — EXACT SAME (unchanged) */}

      {/* Remaining UI unchanged (details grid, notes, interview notes) */}
      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Details */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date Applied</p>
                <p className="font-medium">{formatDate(job.dateApplied)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Resume Used</p>
                <p className="font-medium">{job.resume && job.resume.file ? (
  <a href={job.resume.file} target="_blank">
    {job.resume.file_name || job.resume.file.split('/').pop()}
  </a>
) : (
  'No Resume Linked'
)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Link2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Job Posting</p>
                <a 
                  href={job.jobLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
                >
                  View Posting
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">
              {job.notes || 'No notes added yet.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interview Notes Section */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interview Notes & History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Notes */}
          {job.interviewNotes && job.interviewNotes.length > 0 ? (
            <div className="space-y-3">
              {job.interviewNotes.map((note, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-muted/50 border animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <p className="text-foreground">{note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No interview notes yet. Add your first note below.
            </p>
          )}

          {/* Add New Note */}
          <div className="pt-4 border-t space-y-3">
            <Textarea
              placeholder="Add a new interview note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}