import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface ReminderSettings {
  id: string;
  user_id: string;
  reminder_time: string;
  days_of_week: number[];
  is_enabled: boolean;
}

export function useReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reminder, isLoading } = useQuery({
    queryKey: ['reminder', user?.id],
    queryFn: async (): Promise<ReminderSettings | null> => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('study_reminders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsertReminder = useMutation({
    mutationFn: async (settings: Omit<ReminderSettings, 'id' | 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('study_reminders')
        .upsert({
          user_id: user.id,
          ...settings,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder', user?.id] });
      toast.success('Reminder settings saved!');
    },
    onError: (error) => {
      toast.error('Failed to save reminder settings');
      console.error(error);
    },
  });

  return {
    reminder,
    isLoading,
    upsertReminder,
  };
}
