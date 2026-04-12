import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyApplicationData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ApplicationsBarChartProps {
  data: MonthlyApplicationData[];
}

export function ApplicationsBarChart({ data }: ApplicationsBarChartProps) {
  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Applications Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar 
                dataKey="applications" 
                fill="hsl(var(--primary))" 
                radius={[6, 6, 0, 0]}
                name="Applications"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
