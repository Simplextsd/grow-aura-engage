-- Fix campaign_contacts table: Add explicit policies to block unauthorized modifications
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view campaign contacts" ON public.campaign_contacts;
END $$;

-- Recreate with all CRUD operations explicitly defined
CREATE POLICY "Users can view their campaign contacts"
ON public.campaign_contacts
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can insert campaign contacts"
ON public.campaign_contacts
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update their campaign contacts"
ON public.campaign_contacts
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can delete their campaign contacts"
ON public.campaign_contacts
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));