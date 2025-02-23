/*
  # Add authentication tables and security features

  1. New Tables
    - `auth_attempts` - Track login attempts for rate limiting
    - `auth_sessions` - Store active sessions with "Remember Me" functionality
    - `auth_recovery_tokens` - Store password recovery tokens

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
    - Add rate limiting functions
*/

-- Create auth_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  ip_address text NOT NULL,
  attempt_date timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

-- Create auth_sessions table for "Remember Me"
CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  refresh_token text NOT NULL,
  device_info jsonb DEFAULT '{}',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create auth_recovery_tokens table
CREATE TABLE IF NOT EXISTS auth_recovery_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_recovery_tokens ENABLE ROW LEVEL SECURITY;

-- Auth attempts policies
CREATE POLICY "Users can view their own attempts"
  ON auth_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create attempts"
  ON auth_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Auth sessions policies
CREATE POLICY "Users can view their own sessions"
  ON auth_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions"
  ON auth_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Recovery tokens policies
CREATE POLICY "Users can view their own recovery tokens"
  ON auth_recovery_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage recovery tokens"
  ON auth_recovery_tokens FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_auth_attempts(
  p_user_id uuid,
  p_ip_address text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*)
  INTO attempt_count
  FROM auth_attempts
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND attempt_date > now() - interval '15 minutes'
    AND NOT success;

  -- Allow if less than 5 attempts
  RETURN attempt_count < 5;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_ip 
  ON auth_attempts(user_id, ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_date 
  ON auth_attempts(attempt_date);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user 
  ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token 
  ON auth_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_auth_recovery_tokens_user 
  ON auth_recovery_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_recovery_tokens_token 
  ON auth_recovery_tokens(token);