ALTER TABLE users ADD COLUMN IF NOT EXISTS tradition text;

CREATE TABLE IF NOT EXISTS intentions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  tag         text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz
);
CREATE INDEX IF NOT EXISTS intentions_user_idx ON intentions (user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS journal_entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  items      text[] NOT NULL DEFAULT '{}',
  mood       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_user_idx ON journal_entries (user_id, entry_date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS reminders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time       text NOT NULL CHECK (time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  label      text NOT NULL,
  days       text NOT NULL DEFAULT 'Todos os dias',
  enabled    boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reminders_user_idx ON reminders (user_id, time);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id      uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notify_prayer boolean NOT NULL DEFAULT true,
  notify_word   boolean NOT NULL DEFAULT true,
  notify_news   boolean NOT NULL DEFAULT false,
  sound         text NOT NULL DEFAULT 'Sino suave',
  vibration     boolean NOT NULL DEFAULT true,
  dnd           boolean NOT NULL DEFAULT false,
  dnd_start     text NOT NULL DEFAULT '22:00',
  dnd_end       text NOT NULL DEFAULT '06:00',
  city          text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('passagem', 'oracao', 'reflexao', 'plano')),
  key        text NOT NULL,
  title      text NOT NULL,
  subtitle   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, type, key)
);
CREATE INDEX IF NOT EXISTS saved_user_idx ON saved_items (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS reading_progress (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_key   text NOT NULL,
  plan_title text NOT NULL,
  step       integer NOT NULL DEFAULT 0,
  total      integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, plan_key)
);
