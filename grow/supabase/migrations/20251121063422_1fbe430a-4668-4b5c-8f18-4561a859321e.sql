-- Enhance contacts table with segmentation and marketing fields
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'lead',
ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS preferred_contact_method text DEFAULT 'email',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS annual_revenue text,
ADD COLUMN IF NOT EXISTS job_function text,
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS pain_points text[],
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_email_opened_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_email_clicked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_email_opens integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_email_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_messages_sent integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_messages_received integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_visits integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_website_visit_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS conversion_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_lifetime_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_deal_size numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_profiles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bounce_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS complaint_count integer DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_temperature ON public.contacts(lead_temperature);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON public.contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_industry ON public.contacts(industry);
CREATE INDEX IF NOT EXISTS idx_contacts_last_activity ON public.contacts(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_contacts_marketing_consent ON public.contacts(marketing_consent);

-- Create contact_activities table for detailed engagement tracking
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- email_open, email_click, form_submit, page_view, etc.
  activity_data jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_type ON public.contact_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_at ON public.contact_activities(created_at);

ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their contact activities"
  ON public.contact_activities
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_activities.contact_id 
    AND contacts.user_id = auth.uid()
  ));

-- Create lead_forms table for lead capture
CREATE TABLE IF NOT EXISTS public.lead_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of form fields configuration
  settings jsonb DEFAULT '{}'::jsonb, -- Form settings (redirect, email notifications, etc.)
  is_active boolean DEFAULT true,
  embed_code text,
  submissions_count integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_forms_user_id ON public.lead_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_forms_is_active ON public.lead_forms(is_active);

ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lead forms"
  ON public.lead_forms
  FOR ALL
  USING (auth.uid() = user_id);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.lead_forms(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  submission_data jsonb NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text DEFAULT 'new', -- new, processed, converted
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_id ON public.form_submissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view submissions for their forms"
  ON public.form_submissions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lead_forms 
    WHERE lead_forms.id = form_submissions.form_id 
    AND lead_forms.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit forms"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create contact_scores table for lead scoring
CREATE TABLE IF NOT EXISTS public.contact_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  score_type text NOT NULL, -- engagement, fit, intent, etc.
  score_value integer NOT NULL DEFAULT 0,
  score_factors jsonb DEFAULT '{}'::jsonb, -- Breakdown of what contributed to score
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contact_id, score_type)
);

CREATE INDEX IF NOT EXISTS idx_contact_scores_contact_id ON public.contact_scores(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_scores_type ON public.contact_scores(score_type);

ALTER TABLE public.contact_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scores for their contacts"
  ON public.contact_scores
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_scores.contact_id 
    AND contacts.user_id = auth.uid()
  ));

-- Add trigger for lead_forms updated_at
CREATE TRIGGER update_lead_forms_updated_at
  BEFORE UPDATE ON public.lead_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();