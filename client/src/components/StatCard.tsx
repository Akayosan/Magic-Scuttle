import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  const testId = `stat-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card className="p-6 hover-elevate transition-shadow" data-testid={`card-${testId}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground" data-testid={`label-${testId}`}>
            {title}
          </p>
          <p className="text-2xl font-bold font-mono" data-testid={`value-${testId}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground" data-testid={`desc-${testId}`}>
              {description}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3" data-testid={`icon-${testId}`}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
