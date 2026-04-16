import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const variantStyles = {
  neutral: 'text-foreground',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  success: 'text-green-600',
};

export function KPICard({ label, value, subtitle, icon: Icon, variant = 'neutral', loading }) {
  if (loading) return <Skeleton className="h-32 w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn('text-3xl font-bold tabular-nums', variantStyles[variant])}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn('rounded-full p-2.5 bg-muted', variant === 'danger' && 'bg-red-50', variant === 'warning' && 'bg-yellow-50', variant === 'success' && 'bg-green-50')}>
              <Icon className={cn('h-5 w-5', variantStyles[variant])} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
