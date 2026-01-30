-- Add streak tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN longest_streak integer NOT NULL DEFAULT 0,
ADD COLUMN last_study_date date;

-- Create study reminders table
CREATE TABLE public.study_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_time TIME NOT NULL DEFAULT '09:00',
  days_of_week integer[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_enabled boolean NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT study_reminders_user_id_key UNIQUE (user_id)
);

-- Enable RLS on study_reminders
ALTER TABLE public.study_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_reminders
CREATE POLICY "Users can view their own reminders"
ON public.study_reminders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
ON public.study_reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
ON public.study_reminders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
ON public.study_reminders
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on study_reminders
CREATE TRIGGER update_study_reminders_updated_at
BEFORE UPDATE ON public.study_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update streak when lesson is completed
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_study_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
BEGIN
  -- Only process when lesson is marked as completed
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    -- Get current streak info
    SELECT last_study_date, current_streak, longest_streak
    INTO v_last_study_date, v_current_streak, v_longest_streak
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    -- Calculate new streak
    IF v_last_study_date IS NULL OR v_last_study_date < v_today - INTERVAL '1 day' THEN
      -- Start new streak
      v_current_streak := 1;
    ELSIF v_last_study_date = v_today - INTERVAL '1 day' THEN
      -- Continue streak
      v_current_streak := v_current_streak + 1;
    END IF;
    -- If same day, keep current streak
    
    -- Update longest streak if needed
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
    
    -- Update profile
    UPDATE public.profiles
    SET 
      current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_study_date = v_today
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on lessons table to update streak
CREATE TRIGGER update_streak_on_lesson_complete
AFTER UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streak();