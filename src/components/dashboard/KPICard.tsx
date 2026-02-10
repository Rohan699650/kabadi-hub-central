import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  onClick?: () => void;
  prefix?: string;
  description?: string;
  iconColor?: string;
}

const variantStyles = {
  default: 'bg-card hover:border-primary/30',
  success: 'bg-success/5 border-success/20 hover:border-success/40',
  warning: 'bg-warning/5 border-warning/20 hover:border-warning/40',
  info: 'bg-info/5 border-info/20 hover:border-info/40',
  destructive: 'bg-destructive/5 border-destructive/20 hover:border-destructive/40',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
  prefix,
  description,
  iconColor,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'kpi-card border',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="kpi-card-value mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p className={cn(
              'mt-2 text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from yesterday
            </p>
          )}
        </div>
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          iconStyles[variant]
        )}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
