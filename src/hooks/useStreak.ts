import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streakData, isLoading } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_study_date')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Check if streak is active (studied today or yesterday)
  const isStreakActive = () => {
    if (!streakData?.last_study_date) return false;
    const lastStudy = new Date(streakData.last_study_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return lastStudy >= yesterday;
  };

  // Check if user studied today
  const studiedToday = () => {
    if (!streakData?.last_study_date) return false;
    const lastStudy = new Date(streakData.last_study_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastStudy.setHours(0, 0, 0, 0);
    return lastStudy.getTime() === today.getTime();
  };

  return {
    currentStreak: streakData?.current_streak ?? 0,
    longestStreak: streakData?.longest_streak ?? 0,
    lastStudyDate: streakData?.last_study_date,
    isStreakActive: isStreakActive(),
    studiedToday: studiedToday(),
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['streak', user?.id] }),
  };
}
