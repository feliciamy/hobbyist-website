import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';

export type TimeRange = 'week' | 'month' | '3months';

interface CompletionData {
  date: string;
  count: number;
  label: string;
}

interface SubjectProgress {
  name: string;
  completed: number;
  total: number;
  color: string;
}

interface AnalyticsData {
  completionsByDay: CompletionData[];
  subjectProgress: SubjectProgress[];
  totalCompleted: number;
  totalLessons: number;
  completionRate: number;
  avgPerDay: number;
}

export function useAnalytics(timeRange: TimeRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id, timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (timeRange) {
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case '3months':
          startDate = subMonths(startOfMonth(now), 2);
          endDate = endOfMonth(now);
          break;
      }

      // Fetch all lessons with completion data
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, is_completed, completed_at, subject_id')
        .eq('user_id', user.id);

      if (lessonsError) throw lessonsError;

      // Fetch subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, color')
        .eq('user_id', user.id);

      if (subjectsError) throw subjectsError;

      // Filter completions within date range
      const completionsInRange = (lessons || []).filter(lesson => {
        if (!lesson.completed_at) return false;
        const completedDate = new Date(lesson.completed_at);
        return completedDate >= startDate && completedDate <= endDate;
      });

      // Generate completion data by day/week
      let completionsByDay: CompletionData[] = [];

      if (timeRange === '3months') {
        // Group by week for 3 months view
        const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
        completionsByDay = weeks.map(weekStart => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const count = completionsInRange.filter(lesson => {
            const completedDate = new Date(lesson.completed_at!);
            return completedDate >= weekStart && completedDate <= weekEnd;
          }).length;
          return {
            date: format(weekStart, 'yyyy-MM-dd'),
            label: format(weekStart, 'MMM d'),
            count,
          };
        });
      } else {
        // Group by day for week/month view
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        completionsByDay = days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const count = completionsInRange.filter(lesson => {
            const completedDate = format(new Date(lesson.completed_at!), 'yyyy-MM-dd');
            return completedDate === dayStr;
          }).length;
          return {
            date: dayStr,
            label: timeRange === 'week' ? format(day, 'EEE') : format(day, 'MMM d'),
            count,
          };
        });
      }

      // Calculate subject progress
      const subjectProgress: SubjectProgress[] = (subjects || []).map(subject => {
        const subjectLessons = (lessons || []).filter(l => l.subject_id === subject.id);
        return {
          name: subject.name,
          completed: subjectLessons.filter(l => l.is_completed).length,
          total: subjectLessons.length,
          color: subject.color || '#0D9488',
        };
      }).filter(s => s.total > 0);

      const totalCompleted = (lessons || []).filter(l => l.is_completed).length;
      const totalLessons = (lessons || []).length;
      const completionRate = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
      
      const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const avgPerDay = daysInRange > 0 ? +(completionsInRange.length / daysInRange).toFixed(1) : 0;

      return {
        completionsByDay,
        subjectProgress,
        totalCompleted,
        totalLessons,
        completionRate,
        avgPerDay,
      };
    },
    enabled: !!user,
  });
}
