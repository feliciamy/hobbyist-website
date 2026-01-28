import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'article' | 'book' | 'course' | 'podcast' | 'exercise' | 'other';

export interface Lesson {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  url: string | null;
  level: LessonLevel;
  type: LessonType;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useLessons(subjectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', subjectId],
    queryFn: async () => {
      if (!user || !subjectId) return [];
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!user && !!subjectId,
  });

  const createLesson = useMutation({
    mutationFn: async (lesson: {
      subject_id: string;
      title: string;
      description?: string;
      url?: string;
      level?: LessonLevel;
      type?: LessonType;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          user_id: user.id,
          subject_id: lesson.subject_id,
          title: lesson.title,
          description: lesson.description || null,
          url: lesson.url || null,
          level: lesson.level || 'beginner',
          type: lesson.type || 'video',
          notes: lesson.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson added!');
    },
    onError: (error) => {
      toast.error('Failed to add lesson: ' + error.message);
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lesson> & { id: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
    onError: (error) => {
      toast.error('Failed to update lesson: ' + error.message);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success(variables.isCompleted ? 'Lesson completed! 🎉' : 'Lesson unmarked');
    },
    onError: (error) => {
      toast.error('Failed to update lesson: ' + error.message);
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete lesson: ' + error.message);
    },
  });

  return {
    lessons,
    isLoading,
    createLesson,
    updateLesson,
    toggleComplete,
    deleteLesson,
  };
}
