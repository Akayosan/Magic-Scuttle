import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, TrendingUp, ShoppingBag, Tag } from "lucide-react";
import type { NFTActivity as NFTActivityType } from "@shared/schema";

export default function NFTActivity() {
  const { data: activities, isLoading } = useQuery<NFTActivityType[]>({
    queryKey: ["/api/nft/activity"],
  });

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mint":
      case "minted":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "sale":
      case "sold":
        return <ShoppingBag className="w-5 h-5 text-primary" />;
      case "list":
      case "listed":
        return <Tag className="w-5 h-5 text-info" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "mint":
      case "minted":
        return <Badge className="bg-success/20 text-success border-success/30">{type}</Badge>;
      case "sale":
      case "sold":
        return <Badge className="bg-primary/20 text-primary border-primary/30">{type}</Badge>;
      case "list":
      case "listed":
        return <Badge className="bg-info/20 text-info border-info/30">{type}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-6 py-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="heading-activity">
          NFT Activity
        </h1>
        <p className="text-muted-foreground">
          Real-time feed of NFT sales, listings, and mints
        </p>
      </div>

      {/* Activity Feed */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted/50 animate-pulse rounded-lg"
                data-testid="skeleton-activity"
              />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-card-border hover-elevate active-elevate-2 transition-all"
                data-testid={`activity-${activity.id}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  {getActivityIcon(activity.activityType)}
                </div>

                {/* NFT Image Placeholder */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0" />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityBadge(activity.activityType)}
                    <span className="font-medium truncate">
                      Token #{activity.tokenId}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {activity.from && (
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {activity.from.slice(2, 4)}
                          </AvatarFallback>
                        </Avatar>
                        <code className="text-xs">
                          {activity.from.slice(0, 6)}...{activity.from.slice(-4)}
                        </code>
                      </div>
                    )}
                    
                    {activity.from && activity.to && (
                      <span className="text-muted-foreground/50">→</span>
                    )}
                    
                    {activity.to && (
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {activity.to.slice(2, 4)}
                          </AvatarFallback>
                        </Avatar>
                        <code className="text-xs">
                          {activity.to.slice(0, 6)}...{activity.to.slice(-4)}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Time */}
                <div className="flex-shrink-0 text-right">
                  {activity.price && (
                    <div
                      className="font-mono font-semibold text-lg mb-1"
                      data-testid={`price-${activity.id}`}
                    >
                      {activity.price} ETH
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Activity className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground">
              NFT activity will appear here as transactions happen
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
