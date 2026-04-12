import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Link2, Building2, Briefcase, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';
import { JobApplication, JobStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { fetchWithAuth } from '@/utils/api';
import { useParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';


const statusOptions: { value: JobStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'oa', label: 'Online Assessment' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];


export function JobForm() {
  const { id } = useParams<{ id: string }>(); // ✅ changed
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobLink: '',
    dateApplied: new Date(), // ✅ FIXED
    resume: '',
    status: 'applied' as JobStatus,
    notes: '',
  });

  const [resumes, setResumes] = useState<any[]>([]);

  // ✅ Fetch resumes dynamically
  useEffect(() => {
    const fetchResumes = async () => {
      try {

        const response = await fetchWithAuth('/resumes/');


        const data = await response.json();
        console.log("RESUMES: ", data);
        setResumes(data.results || data);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };

    fetchResumes();
  }, []);

  // ✅ Fetch job if editing
  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await fetchWithAuth(`/jobs/${id}/`);

        const data = await response.json();

        console.log("JOB DATA: ", data);
        console.log("Selected Resume: ", formData.resume);
        console.log("Options: ", resumes.map(r => String(r.id)));

        setFormData({
          company: data.company || '',
          role: data.role || '',
          jobLink: data.jobLink || '',
          dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date(),
          resume: data.resumeId ? String(data.resumeId) : '',
          status: data.status || 'applied',
          notes: data.notes || '',
        });
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ URL validation
  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 🚀 FINAL SUBMIT (API BASED)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("FINAL PAYLOAD:", {
  company: formData.company,
  role: formData.role,
  jobLink: formData.jobLink,
  dateApplied: format(formData.dateApplied, 'yyyy-MM-dd'),
  status: formData.status,
  resumeId: formData.resume ? Number(formData.resume) : null,
  notes: formData.notes,
});

    if (!formData.company || !formData.role) {
      alert('Please fill required fields');
      return;
    }

    if (formData.jobLink && !isValidURL(formData.jobLink)) {
      alert('Invalid URL');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.error('No auth token found');
        return;
      }
      const response = await fetchWithAuth(
        id
          ? `/jobs/${id}/`
          : '/jobs/',
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company: formData.company,
            role: formData.role,
            jobLink: formData.jobLink, // ✅ FIXED
            dateApplied: formData.dateApplied ? format(formData.dateApplied, 'yyyy-MM-dd') : null, // ✅ FIXED
            status: formData.status,
            resumeId: formData.resume ? Number(formData.resume) : null,
            notes: formData.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save job');
      }

      toast({
        title: id ? 'Application updated!' : 'Application added!',
        description: `${formData.company} - ${formData.role}`,
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          {id ? 'Edit Job Application' : 'Add New Job Application'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="e.g., Google"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  placeholder="e.g., Software Engineer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Job Link */}
            <div className="space-y-2">
              <Label htmlFor="jobLink">Job Posting URL</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jobLink"
                  type="url"
                  placeholder="https://..."
                  value={formData.jobLink}
                  onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Applied */}
            <div className="space-y-2">
              <Label>Date Applied</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.dateApplied && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dateApplied, 'PPP')}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateApplied ? new Date(formData.dateApplied) : undefined}
                    onSelect= {(date) => {if (date) setFormData({ ...formData, dateApplied: date })}}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Resume Used */}
            <div className="space-y-2">
              <Label>Resume Used</Label>
              <Select
                value={formData.resume}
                onValueChange={(value) => setFormData({ ...formData, resume: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>

                <SelectContent className="bg-popover">
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={String(resume.id)}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                         {resume.file?.split('/').pop() || 'Resume ${resume.id}'}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Application Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: JobStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent className="bg-popover">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this application..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>

            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {id ? 'Update Application' : 'Save Application'}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}