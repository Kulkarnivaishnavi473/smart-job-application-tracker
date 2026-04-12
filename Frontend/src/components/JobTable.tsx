import { Eye, Pencil, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JobApplication, JobStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JobTableProps {
  jobs: JobApplication[];
  limit?: number;
}

const statusConfig: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  applied: { label: 'Applied', variant: 'secondary' },
  oa: { label: 'Online Assessment', variant: 'outline' },
  interview: { label: 'Interview', variant: 'default' },
  offer: { label: 'Offer', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

const statusColors: Record<JobStatus, string> = {
  applied: 'bg-primary/10 text-primary border-primary/20',
  oa: 'bg-info/10 text-info border-info/20',
  interview: 'bg-warning/10 text-warning border-warning/20',
  offer: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function JobTable({ jobs, limit }: JobTableProps) {
  const navigate = useNavigate();
  const displayJobs = limit ? jobs.slice(0, limit) : jobs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Date Applied</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayJobs.map((job, index) => (
            <TableRow 
              key={job.id}
              className="animate-fade-in cursor-pointer hover:bg-muted/30"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <TableCell className="font-medium">{job.company}</TableCell>
              <TableCell className="text-muted-foreground">{job.role}</TableCell>
              <TableCell>
                <Badge className={cn('border', statusColors[job.status])}>
                  {statusConfig[job.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(job.dateApplied)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}/edit`);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
