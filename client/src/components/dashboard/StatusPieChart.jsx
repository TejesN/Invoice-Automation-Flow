import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABELS } from '@/lib/constants';

const STATUS_COLORS = {
  pending: '#94a3b8',
  partial: '#f59e0b',
  overdue: '#ef4444',
  paid: '#22c55e',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
      <p className="font-medium">{STATUS_LABELS[payload[0].name] || payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} invoice{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

export function StatusPieChart({ data, loading }) {
  if (loading) return <Skeleton className="h-64 w-full" />;

  const chartData = (data || []).map(d => ({ name: d.status, value: d.count }));

  if (!chartData.length) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={index} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={value => STATUS_LABELS[value] || value}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
