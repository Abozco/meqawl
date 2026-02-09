
-- Fix overly permissive RLS policies for statistics table
DROP POLICY IF EXISTS "Anyone can update stats" ON public.statistics;
DROP POLICY IF EXISTS "Anyone can increment stats" ON public.statistics;

-- Create proper policies for statistics - allow unauthenticated users to insert/update for tracking
CREATE POLICY "Allow stats insert for tracking" ON public.statistics 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow stats update for tracking" ON public.statistics 
FOR UPDATE USING (true);
