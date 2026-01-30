import { useStreak } from '@/hooks/useStreak';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StreakDisplay() {
  const { currentStreak, longestStreak, isStreakActive, studiedToday, isLoading } = useStreak();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg transition-all duration-300",
            isStreakActive 
              ? "bg-gradient-to-br from-orange-500 to-red-500 animate-pulse" 
              : "bg-muted"
          )}>
            <Flame className={cn(
              "h-6 w-6",
              isStreakActive ? "text-white" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className={cn(
              "text-3xl font-bold",
              isStreakActive && "text-orange-500"
            )}>
              {currentStreak}
            </p>
            <p className="text-sm text-muted-foreground">Day streak</p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">Best streak</p>
          </div>
        </div>

        {/* Today's Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            studiedToday ? "success-gradient" : "bg-muted"
          )}>
            <Calendar className={cn(
              "h-6 w-6",
              studiedToday ? "text-success-foreground" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className={cn(
              "text-lg font-semibold",
              studiedToday && "text-green-500"
            )}>
              {studiedToday ? "Done!" : "Not yet"}
            </p>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      {!studiedToday && currentStreak > 0 && (
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            🔥 Complete a lesson today to keep your {currentStreak}-day streak going!
          </p>
        </div>
      )}
      
      {studiedToday && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm text-green-600 dark:text-green-400">
            ✨ Great job! You've studied today. Keep up the momentum!
          </p>
        </div>
      )}
    </div>
  );
}
