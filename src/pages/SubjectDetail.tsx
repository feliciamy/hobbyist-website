import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubjects } from '@/hooks/useSubjects';
import { useLessons, LessonLevel, Lesson } from '@/hooks/useLessons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LessonCard } from '@/components/LessonCard';
import { CreateLessonDialog } from '@/components/CreateLessonDialog';
import { AIAssistant } from '@/components/AIAssistant';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  BookOpen
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

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const { lessons, isLoading, createLesson, updateLesson, toggleComplete, deleteLesson } = useLessons(id);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [currentLevel, setCurrentLevel] = useState<LessonLevel>('beginner');

  const subject = subjects.find(s => s.id === id);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const lessonsByLevel = {
    beginner: lessons.filter(l => l.level === 'beginner'),
    intermediate: lessons.filter(l => l.level === 'intermediate'),
    advanced: lessons.filter(l => l.level === 'advanced'),
  };

  const levelProgress = {
    beginner: lessonsByLevel.beginner.length > 0 
      ? Math.round((lessonsByLevel.beginner.filter(l => l.is_completed).length / lessonsByLevel.beginner.length) * 100)
      : 0,
    intermediate: lessonsByLevel.intermediate.length > 0 
      ? Math.round((lessonsByLevel.intermediate.filter(l => l.is_completed).length / lessonsByLevel.intermediate.length) * 100)
      : 0,
    advanced: lessonsByLevel.advanced.length > 0 
      ? Math.round((lessonsByLevel.advanced.filter(l => l.is_completed).length / lessonsByLevel.advanced.length) * 100)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="text-3xl p-2 rounded-xl"
                style={{ backgroundColor: subject.color + '20' }}
              >
                {subject.icon}
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold">{subject.name}</h1>
                {subject.description && (
                  <p className="text-sm text-muted-foreground">{subject.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs 
          value={currentLevel} 
          onValueChange={(v) => setCurrentLevel(v as LessonLevel)}
          className="animate-fade-in"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="beginner" className="data-[state=active]:bg-background">
                Beginner
                <span className="ml-2 text-xs opacity-60">
                  {lessonsByLevel.beginner.length} • {levelProgress.beginner}%
                </span>
              </TabsTrigger>
              <TabsTrigger value="intermediate" className="data-[state=active]:bg-background">
                Intermediate
                <span className="ml-2 text-xs opacity-60">
                  {lessonsByLevel.intermediate.length} • {levelProgress.intermediate}%
                </span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-background">
                Advanced
                <span className="ml-2 text-xs opacity-60">
                  {lessonsByLevel.advanced.length} • {levelProgress.advanced}%
                </span>
              </TabsTrigger>
            </TabsList>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            ['beginner', 'intermediate', 'advanced'].map((level) => (
              <TabsContent key={level} value={level} className="mt-0">
                {lessonsByLevel[level as LessonLevel].length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-2xl">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      No {level} lessons yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add learning materials for this level
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessonsByLevel[level as LessonLevel].map((lesson, index) => (
                      <div 
                        key={lesson.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <LessonCard
                          lesson={lesson}
                          onToggleComplete={(isCompleted) => 
                            toggleComplete.mutate({ id: lesson.id, isCompleted })
                          }
                          onEdit={() => setEditingLesson(lesson)}
                          onDelete={() => setDeletingLesson(lesson)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))
          )}
        </Tabs>
      </main>

      {/* Create Lesson Dialog */}
      <CreateLessonDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (data) => {
          await createLesson.mutateAsync({
            subject_id: id!,
            ...data,
            level: currentLevel,
          });
        }}
      />

      {/* Edit Lesson Dialog */}
      {editingLesson && (
        <CreateLessonDialog
          open={!!editingLesson}
          onOpenChange={() => setEditingLesson(null)}
          onSubmit={async (data) => {
            await updateLesson.mutateAsync({ 
              id: editingLesson.id, 
              ...data 
            });
            setEditingLesson(null);
          }}
          initialData={{
            title: editingLesson.title,
            description: editingLesson.description || undefined,
            url: editingLesson.url || undefined,
            level: editingLesson.level,
            type: editingLesson.type,
            notes: editingLesson.notes || undefined,
          }}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLesson} onOpenChange={() => setDeletingLesson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingLesson?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingLesson) {
                  await deleteLesson.mutateAsync(deletingLesson.id);
                  setDeletingLesson(null);
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
      <AIAssistant subjectName={subject.name} />
    </div>
  );
}
