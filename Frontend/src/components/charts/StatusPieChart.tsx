import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StatusDistribution } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChartIcon } from 'lucide-react';

interface StatusPieChartProps {
  data: StatusDistribution[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${Math.round((value / total) * 100)}%)`,
                  name
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
