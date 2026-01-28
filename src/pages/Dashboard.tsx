import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { SubjectCard } from '@/components/SubjectCard';
import { CreateSubjectDialog } from '@/components/CreateSubjectDialog';
import { AIAssistant } from '@/components/AIAssistant';
import { 
  BookOpen, 
  Plus, 
  LogOut, 
  Loader2,
  GraduationCap
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { subjects, isLoading, createSubject, updateSubject, deleteSubject } = useSubjects();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<typeof subjects[0] | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<typeof subjects[0] | null>(null);

  // Fetch lesson counts for each subject
  const { data: lessonCounts = {} } = useQuery({
    queryKey: ['lesson-counts', subjects.map(s => s.id)],
    queryFn: async () => {
      if (subjects.length === 0) return {};
      
      const counts: Record<string, { total: number; completed: number }> = {};
      
      for (const subject of subjects) {
        const { data } = await supabase
          .from('lessons')
          .select('is_completed')
          .eq('subject_id', subject.id);
        
        const lessons = data || [];
        counts[subject.id] = {
          total: lessons.length,
          completed: lessons.filter(l => l.is_completed).length,
        };
      }
      
      return counts;
    },
    enabled: subjects.length > 0,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const totalLessons = Object.values(lessonCounts).reduce((acc, c) => acc + c.total, 0);
  const completedLessons = Object.values(lessonCounts).reduce((acc, c) => acc + c.completed, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl hero-gradient">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold">LearnFlow</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h2>
          <p className="text-muted-foreground">
            Track your learning progress across all your subjects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subjects.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg success-gradient">
                <GraduationCap className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedLessons}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-semibold">Your Subjects</h3>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Subject
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl animate-fade-in">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your learning journey by adding your first subject
            </p>
            <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <div 
                key={subject.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <SubjectCard
                  subject={subject}
                  lessonCount={lessonCounts[subject.id]?.total || 0}
                  completedCount={lessonCounts[subject.id]?.completed || 0}
                  onSelect={() => navigate(`/subject/${subject.id}`)}
                  onEdit={() => setEditingSubject(subject)}
                  onDelete={() => setDeletingSubject(subject)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Subject Dialog */}
      <CreateSubjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (data) => {
          await createSubject.mutateAsync(data);
        }}
      />

      {/* Edit Subject Dialog */}
      {editingSubject && (
        <CreateSubjectDialog
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          onSubmit={async (data) => {
            await updateSubject.mutateAsync({ id: editingSubject.id, ...data });
            setEditingSubject(null);
          }}
          initialData={editingSubject}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSubject} onOpenChange={() => setDeletingSubject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingSubject?.name}" and all its lessons.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingSubject) {
                  await deleteSubject.mutateAsync(deletingSubject.id);
                  setDeletingSubject(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
