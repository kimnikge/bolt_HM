/*
  # Add subscription and Telegram integration

  1. New Tables
    - `subscription_tiers` - Defines available subscription plans
    - `seller_subscriptions` - Tracks seller subscriptions
    - `banners` - Manages advertising banners
    - `telegram_users` - Stores Telegram user data
    - `analytics_events` - Tracks platform analytics

  2. Changes
    - Add subscription tier limitations to sellers table
    - Add Telegram integration fields
    - Add banner placement tracking

  3. Security
    - Enable RLS on all new tables
    - Add appropriate access policies
*/

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  max_products integer NOT NULL,
  max_contact_methods integer NOT NULL,
  max_banners integer NOT NULL,
  features jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create seller_subscriptions table
CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) NOT NULL,
  tier_id uuid REFERENCES subscription_tiers(id) NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) NOT NULL,
  image_url text NOT NULL,
  link_url text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  placement text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  telegram_id text NOT NULL UNIQUE,
  username text,
  first_name text,
  last_name text,
  language_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  seller_id uuid REFERENCES sellers(id),
  product_id uuid REFERENCES products(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add subscription fields to sellers
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS contact_methods jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS telegram_chat_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS max_products integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS max_contact_methods integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_banners integer DEFAULT 0;

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Subscription tiers policies
CREATE POLICY "Subscription tiers are viewable by everyone"
  ON subscription_tiers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage subscription tiers"
  ON subscription_tiers FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Seller subscriptions policies
CREATE POLICY "Sellers can view their own subscriptions"
  ON seller_subscriptions FOR SELECT
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can manage subscriptions"
  ON seller_subscriptions FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Banners policies
CREATE POLICY "Banners are viewable by everyone"
  ON banners FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Sellers can manage their own banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

-- Telegram users policies
CREATE POLICY "Users can view their own Telegram data"
  ON telegram_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own Telegram data"
  ON telegram_users FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Analytics events policies
CREATE POLICY "Only admins can view analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Events can be created by authenticated users"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, price, max_products, max_contact_methods, max_banners, features) VALUES
  ('Standard', 0, 3, 1, 0, '{"can_store_contacts": 10}'),
  ('Professional', 10000, 10, 3, 1, '{"can_store_contacts": 10, "promotional_banner": true}'),
  ('Maximum', 25000, -1, -1, 3, '{"can_store_contacts": 10, "promotional_banner": true, "unlimited_products": true}')
ON CONFLICT DO NOTHING;

-- Add updated_at triggers
CREATE TRIGGER update_seller_subscriptions_updated_at
  BEFORE UPDATE ON seller_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_telegram_users_updated_at
  BEFORE UPDATE ON telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();