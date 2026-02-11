
-- Summoner saves table
CREATE TABLE public.summoner_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 3),
  username TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  completed_trees INTEGER[] NOT NULL DEFAULT '{}',
  current_tree_index INTEGER,
  current_node_id TEXT,
  current_health INTEGER,
  max_health INTEGER,
  character_id TEXT,
  completed_nodes TEXT[] NOT NULL DEFAULT '{}',
  in_tree_instance BOOLEAN NOT NULL DEFAULT false,
  tree_nodes JSONB,
  stat_upgrades JSONB NOT NULL DEFAULT '{}',
  completed_tree_nodes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot_number)
);

ALTER TABLE public.summoner_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saves"
  ON public.summoner_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves"
  ON public.summoner_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves"
  ON public.summoner_saves FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON public.summoner_saves FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_summoner_saves_updated_at
  BEFORE UPDATE ON public.summoner_saves
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
