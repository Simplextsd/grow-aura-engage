-- Create lead sources table to track where leads come from
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL, -- 'facebook', 'instagram', 'whatsapp', 'website', 'manual'
  source_campaign TEXT,
  source_ad_id TEXT,
  source_form_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead sources
CREATE POLICY "Users can manage their lead sources"
  ON public.lead_sources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = lead_sources.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Create segments table for audience segmentation
CREATE TABLE IF NOT EXISTS public.segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store filter criteria
  is_dynamic BOOLEAN DEFAULT true, -- Dynamic segments auto-update
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- RLS policies for segments
CREATE POLICY "Users can manage their own segments"
  ON public.segments
  FOR ALL
  USING (auth.uid() = user_id);

-- Create segment_contacts junction table
CREATE TABLE IF NOT EXISTS public.segment_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(segment_id, contact_id)
);

-- Enable RLS
ALTER TABLE public.segment_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for segment_contacts
CREATE POLICY "Users can manage segment contacts"
  ON public.segment_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.segments
      WHERE segments.id = segment_contacts.segment_id
      AND segments.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_sources_contact_id ON public.lead_sources(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_platform ON public.lead_sources(source_platform);
CREATE INDEX IF NOT EXISTS idx_segments_user_id ON public.segments(user_id);
CREATE INDEX IF NOT EXISTS idx_segment_contacts_segment_id ON public.segment_contacts(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_contacts_contact_id ON public.segment_contacts(contact_id);

-- Add trigger for segments updated_at
CREATE TRIGGER update_segments_updated_at
  BEFORE UPDATE ON public.segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();