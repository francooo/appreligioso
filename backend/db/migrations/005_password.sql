ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

UPDATE users SET email_verified = true WHERE google_id IS NOT NULL;
