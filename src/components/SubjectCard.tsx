import { Subject } from '@/hooks/useSubjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubjectCardProps {
  subject: Subject;
  lessonCount?: number;
  completedCount?: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubjectCard({ 
  subject, 
  lessonCount = 0, 
  completedCount = 0,
  onSelect, 
  onEdit, 
  onDelete 
}: SubjectCardProps) {
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  return (
    <Card 
      className="glass-card group cursor-pointer hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div 
            className="text-4xl p-3 rounded-xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: subject.color + '20' }}
          >
            {subject.icon}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl font-serif mt-3">{subject.name}</CardTitle>
        {subject.description && (
          <CardDescription className="line-clamp-2">{subject.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} / {lessonCount} lessons
            </span>
            <span className="font-medium" style={{ color: subject.color }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: subject.color }}
            />
          </div>
          <div className="flex items-center justify-end text-sm text-muted-foreground group-hover:text-primary transition-colors">
            <span>View curriculum</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
