import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Lock, Clock, Target } from "lucide-react";
import { Presale } from "@shared/schema";
import { formatDistance } from "date-fns";

interface PresaleCardProps {
  presale: Presale;
  onParticipate?: () => void;
  onViewDetails?: () => void;
}

export function PresaleCard({ presale, onParticipate, onViewDetails }: PresaleCardProps) {
  const now = Date.now();
  const hasStarted = now >= presale.startTime;
  const hasEnded = now >= presale.endTime;
  const isActive = hasStarted && !hasEnded && presale.isActive;
  
  const progress = (Number(presale.totalRaised) / Number(presale.hardCap)) * 100;
  const timeRemaining = hasEnded
    ? "Ended"
    : hasStarted
    ? formatDistance(presale.endTime, now, { addSuffix: true })
    : `Starts ${formatDistance(presale.startTime, now, { addSuffix: true })}`;

  const formatEth = (wei: string) => {
    return (Number(wei) / 1e18).toFixed(2);
  };

  return (
    <Card className="hover-elevate transition-shadow" data-testid={`card-presale-${presale.id}`}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold" data-testid="text-presale-name">
                {presale.tokenName}
              </h3>
              <p className="font-mono text-sm text-muted-foreground" data-testid="text-presale-symbol">
                {presale.tokenSymbol}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isActive && (
              <Badge variant="default" className="gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </Badge>
            )}
            {hasEnded && (
              <Badge variant="secondary">Ended</Badge>
            )}
            {!hasStarted && (
              <Badge variant="outline">Upcoming</Badge>
            )}
            {presale.isEncrypted && (
              <Badge variant="secondary" className="gap-1.5">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-medium" data-testid="text-presale-progress">
              {formatEth(presale.totalRaised)} / {formatEth(presale.hardCap)} ETH
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {progress.toFixed(1)}% of hard cap
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              Rate
            </div>
            <p className="font-mono text-sm font-medium" data-testid="text-presale-rate">
              {presale.rate} {presale.tokenSymbol}/ETH
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {hasEnded ? "Status" : "Time"}
            </div>
            <p className="text-sm font-medium" data-testid="text-presale-time">
              {timeRemaining}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Soft Cap</p>
            <p className="font-mono text-sm font-medium">{formatEth(presale.softCap)} ETH</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Contributors</p>
            <p className="font-mono text-sm font-medium" data-testid="text-presale-contributors">
              {presale.totalContributors}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t flex gap-2">
        {onViewDetails && (
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onViewDetails}
            data-testid="button-view-presale-details"
          >
            Details
          </Button>
        )}
        {onParticipate && isActive && (
          <Button 
            className="flex-1" 
            onClick={onParticipate}
            data-testid="button-participate-presale"
          >
            Participate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
