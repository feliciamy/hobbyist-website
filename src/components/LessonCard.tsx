import { Lesson, LessonType } from '@/hooks/useLessons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  GraduationCap,
  Headphones,
  Dumbbell,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const typeIcons: Record<LessonType, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  course: <GraduationCap className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
  other: <MoreVertical className="h-4 w-4" />,
};

const typeLabels: Record<LessonType, string> = {
  video: 'Video',
  article: 'Article',
  book: 'Book',
  course: 'Course',
  podcast: 'Podcast',
  exercise: 'Exercise',
  other: 'Other',
};

interface LessonCardProps {
  lesson: Lesson;
  onToggleComplete: (isCompleted: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LessonCard({ lesson, onToggleComplete, onEdit, onDelete }: LessonCardProps) {
  return (
    <Card 
      className={cn(
        "glass-card transition-all duration-300 group",
        lesson.is_completed && "opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={lesson.is_completed}
            onCheckedChange={(checked) => onToggleComplete(checked as boolean)}
            className="mt-1 h-5 w-5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-base line-clamp-1",
                  lesson.is_completed && "line-through text-muted-foreground"
                )}>
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {typeIcons[lesson.type]}
                <span>{typeLabels[lesson.type]}</span>
              </div>
              {lesson.url && (
                <a 
                  href={lesson.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open link
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
