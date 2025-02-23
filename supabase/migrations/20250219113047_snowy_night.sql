/*
  # Add index to telegram_users table

  1. Changes
    - Add index on user_id column for faster lookups
    - Add index on telegram_id column for faster lookups
    - Add index on username column for faster searches

  2. Security
    - No changes to RLS policies
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS telegram_users_user_id_idx ON telegram_users (user_id);
CREATE INDEX IF NOT EXISTS telegram_users_telegram_id_idx ON telegram_users (telegram_id);
CREATE INDEX IF NOT EXISTS telegram_users_username_idx ON telegram_users (username);