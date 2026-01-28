import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { LessonLevel, LessonType } from '@/hooks/useLessons';

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    url?: string;
    level: LessonLevel;
    type: LessonType;
    notes?: string;
  }) => Promise<void>;
  initialData?: {
    title: string;
    description?: string;
    url?: string;
    level: LessonLevel;
    type: LessonType;
    notes?: string;
  };
  mode?: 'create' | 'edit';
}

export function CreateLessonDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create',
}: CreateLessonDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [level, setLevel] = useState<LessonLevel>(initialData?.level || 'beginner');
  const [type, setType] = useState<LessonType>(initialData?.type || 'video');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, url, level, type, notes });
      onOpenChange(false);
      if (mode === 'create') {
        setTitle('');
        setDescription('');
        setUrl('');
        setLevel('beginner');
        setType('video');
        setNotes('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {mode === 'create' ? 'Add new lesson' : 'Edit lesson'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a learning resource to your curriculum'
              : 'Update lesson details'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Hiragana Basics, First Position Scales"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this lesson"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (optional)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as LessonLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Personal Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Your notes about this lesson..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'create' ? 'Add Lesson' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
