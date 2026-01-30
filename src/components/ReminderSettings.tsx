import { useState, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00',
];

export function ReminderSettings() {
  const { reminder, isLoading, upsertReminder } = useReminders();
  const [open, setOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  useEffect(() => {
    if (reminder) {
      setIsEnabled(reminder.is_enabled);
      setReminderTime(reminder.reminder_time);
      setSelectedDays(reminder.days_of_week);
    }
  }, [reminder]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    await upsertReminder.mutateAsync({
      is_enabled: isEnabled,
      reminder_time: reminderTime,
      days_of_week: selectedDays,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className={cn(
            "h-4 w-4",
            reminder?.is_enabled && "text-primary"
          )} />
          Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Study Reminders</DialogTitle>
          <DialogDescription>
            Set up daily reminders to keep your learning on track.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminder-toggle" className="text-base">
                  Enable reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified to study
                </p>
              </div>
              <Switch
                id="reminder-toggle"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            {isEnabled && (
              <>
                {/* Time Selector */}
                <div className="space-y-2">
                  <Label>Reminder time</Label>
                  <Select value={reminderTime} onValueChange={setReminderTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Days Selector */}
                <div className="space-y-2">
                  <Label>Days</Label>
                  <div className="flex gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "flex-1 py-2 px-1 text-sm font-medium rounded-lg transition-all",
                          selectedDays.includes(day.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Info Note */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 Tip: Consistent study times help build lasting habits. 
                We recommend morning sessions for better retention!
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={upsertReminder.isPending}
            >
              {upsertReminder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Reminder Settings
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
