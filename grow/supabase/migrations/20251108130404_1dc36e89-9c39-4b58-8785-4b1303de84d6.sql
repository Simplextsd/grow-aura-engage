-- Create travel packages table
CREATE TABLE public.travel_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  included_services TEXT[],
  category TEXT NOT NULL, -- e.g., 'adventure', 'luxury', 'family', 'honeymoon'
  max_travelers INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id),
  package_id UUID REFERENCES public.travel_packages(id),
  booking_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  travel_date DATE NOT NULL,
  return_date DATE,
  number_of_travelers INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create travelers table (for booking participants)
CREATE TABLE public.travelers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  passport_number TEXT,
  passport_expiry DATE,
  nationality TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create itineraries table
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.travel_packages(id),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  destinations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create itinerary items table
CREATE TABLE public.itinerary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIME,
  end_time TIME,
  activity_type TEXT, -- e.g., 'flight', 'hotel', 'activity', 'meal', 'transport'
  booking_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  best_time_to_visit TEXT,
  average_temperature TEXT,
  currency TEXT,
  language TEXT,
  visa_requirements TEXT,
  image_url TEXT,
  popular_attractions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI conversation history table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id),
  conversation_type TEXT NOT NULL, -- e.g., 'recommendation', 'itinerary', 'support'
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for travel_packages
CREATE POLICY "Users can manage their own packages" ON public.travel_packages
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can manage their own bookings" ON public.bookings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for travelers
CREATE POLICY "Users can manage travelers in their bookings" ON public.travelers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = travelers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Create RLS policies for itineraries
CREATE POLICY "Users can manage their own itineraries" ON public.itineraries
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for itinerary_items
CREATE POLICY "Users can manage their itinerary items" ON public.itinerary_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- Create RLS policies for destinations
CREATE POLICY "Users can manage their own destinations" ON public.destinations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for ai_conversations
CREATE POLICY "Users can manage their own AI conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_bookings_contact_id ON public.bookings(contact_id);
CREATE INDEX idx_bookings_package_id ON public.bookings(package_id);
CREATE INDEX idx_bookings_travel_date ON public.bookings(travel_date);
CREATE INDEX idx_travelers_booking_id ON public.travelers(booking_id);
CREATE INDEX idx_itineraries_booking_id ON public.itineraries(booking_id);
CREATE INDEX idx_itinerary_items_itinerary_id ON public.itinerary_items(itinerary_id);

-- Add triggers for updated_at
CREATE TRIGGER update_travel_packages_updated_at
  BEFORE UPDATE ON public.travel_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();