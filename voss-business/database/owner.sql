CREATE TABLE IF NOT EXISTS voss_owner_login (
  id integer PRIMARY KEY CHECK(id=1), attempts integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO voss_owner_login(id) VALUES(1) ON CONFLICT DO NOTHING;
ALTER TABLE voss_owner_login ENABLE ROW LEVEL SECURITY;
