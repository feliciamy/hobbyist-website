import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useSubjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!user,
  });

  const createSubject = useMutation({
    mutationFn: async (subject: { name: string; description?: string; icon?: string; color?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: subject.name,
          description: subject.description || null,
          icon: subject.icon || '📚',
          color: subject.color || '#0D9488',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created!');
    },
    onError: (error) => {
      toast.error('Failed to create subject: ' + error.message);
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated!');
    },
    onError: (error) => {
      toast.error('Failed to update subject: ' + error.message);
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete subject: ' + error.message);
    },
  });

  return {
    subjects,
    isLoading,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
