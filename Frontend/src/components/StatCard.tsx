import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    iconBg: 'bg-secondary',
    iconColor: 'text-foreground',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-xl', styles.iconBg)}>
            <Icon className={cn('h-6 w-6', styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
