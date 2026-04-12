import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FileStack, Users, Trophy, XCircle, Plus } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { JobTable } from '@/components/JobTable';
import { ApplicationsBarChart } from '@/components/charts/ApplicationsBarChart';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyApplicationData, StatusDistribution, JobApplication } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetchWithAuth("/jobs/");
        const data = await response.json();
        setJobs(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ✅ Basic Metrics
  const totalApplications = filteredJobs.length;
  const applied = filteredJobs.filter(j => j.status === 'applied').length;
  const oa = filteredJobs.filter(j => j.status === 'oa').length;
  const interviews = filteredJobs.filter(j => j.status === 'interview').length;
  const offers = filteredJobs.filter(j => j.status === 'offer').length;
  const rejections = filteredJobs.filter(j => j.status === 'rejected').length;

  // ✅ Advanced Metrics
  const successRate = totalApplications > 0 ? ((offers / totalApplications) * 100).toFixed(1) : "0";
  const conversionRate = interviews > 0 ? ((offers / interviews) * 100).toFixed(1) : "0";

  const statCards = [
    { title: 'Total Applications', value: totalApplications, icon: FileStack, variant: 'primary' as const },
    { title: 'Interviews', value: interviews, icon: Users, variant: 'warning' as const },
    { title: 'Offers', value: offers, icon: Trophy, variant: 'success' as const },
    { title: 'Rejections', value: rejections, icon: XCircle, variant: 'danger' as const },
  ];

  // ✅ Full Status Distribution (including OA)
  const statusData: StatusDistribution[] = [
    { status: 'applied', count: applied, color: '#3b82f6' },
    { status: 'oa', count: oa, color: '#6366f1' }, // 🔥 NEW
    { status: 'interview', count: interviews, color: '#f59e0b' },
    { status: 'offer', count: offers, color: '#10b981' },
    { status: 'rejected', count: rejections, color: '#ef4444' },
  ];

  // ✅ Monthly grouping
  const monthlyMap: Record<string, number> = {};

  filteredJobs.forEach(job => {
    const date = new Date(job.dateApplied + 'T00:00:00'); // Ensure consistent timezone handling
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  });

  const monthlyData: MonthlyApplicationData[] = Object.keys(monthlyMap)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // 🔥 FIXED ORDER
    .map(key => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month));
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        applications: monthlyMap[key],
      };
    });

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/add-job">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Link>
        </Button>
      </div>

      {/* ✅ Existing Cards (unchanged) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      {/* 🔥 Advanced Metrics (NO STYLE CHANGE — simple text) */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <p>Success Rate: <span className="font-semibold text-primary">{successRate}%</span></p>
        <p>Interview → Offer: <span className="font-semibold text-primary">{conversionRate}%</span></p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationsBarChart data={monthlyData} />
        <StatusPieChart data={statusData} />
      </div>

      {/* Filters (unchanged) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 w-full sm:w-1/2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 w-full sm:w-1/4"
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="oa">Online Assessment</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <JobTable jobs={filteredJobs} limit={5} />
        </CardContent>
      </Card>
    </div>
  );
}