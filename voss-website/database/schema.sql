-- Run once with `npm run db:setup`. Safe to rerun; promotion usage is preserved.
CREATE TABLE IF NOT EXISTS voss_products (
  slug text PRIMARY KEY, article text NOT NULL, name text NOT NULL,
  description text NOT NULL, category text NOT NULL,
  price_pkr integer NOT NULL CHECK(price_pkr > 0), active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS voss_variants (
  product_slug text NOT NULL REFERENCES voss_products(slug), colour_key text NOT NULL,
  colour_name text NOT NULL, hex text NOT NULL, active boolean NOT NULL DEFAULT true,
  PRIMARY KEY(product_slug, colour_key)
);
CREATE TABLE IF NOT EXISTS voss_images (
  product_slug text NOT NULL, colour_key text NOT NULL, position integer NOT NULL,
  studio_url text NOT NULL, white_url text NOT NULL, label text NOT NULL,
  width integer NOT NULL, height integer NOT NULL,
  PRIMARY KEY(product_slug, colour_key, position),
  FOREIGN KEY(product_slug, colour_key) REFERENCES voss_variants(product_slug, colour_key)
);
CREATE TABLE IF NOT EXISTS voss_promotions (
  code text PRIMARY KEY, used integer NOT NULL DEFAULT 0 CHECK(used >= 0),
  maximum integer NOT NULL CHECK(maximum >= used)
);
INSERT INTO voss_promotions(code, maximum) VALUES ('FIRST30', 30) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS voss_orders (
  id uuid PRIMARY KEY, reference text UNIQUE NOT NULL,
  idempotency_key uuid UNIQUE NOT NULL, request_hash text NOT NULL,
  customer_name text NOT NULL, phone text NOT NULL, email text,
  address text NOT NULL, city text NOT NULL, province text NOT NULL, postcode text,
  notes text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'received'
    CHECK(status IN ('received','confirmed','shipped','delivered','cancelled')),
  payment_method text NOT NULL CHECK(payment_method IN ('cod')),
  subtotal_pkr integer NOT NULL CHECK(subtotal_pkr > 0),
  delivery_pkr integer NOT NULL CHECK(delivery_pkr >= 0),
  total_pkr integer NOT NULL CHECK(total_pkr = subtotal_pkr + delivery_pkr),
  promotion_code text REFERENCES voss_promotions(code),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS voss_orders_phone_created ON voss_orders(phone, created_at);
CREATE TABLE IF NOT EXISTS voss_order_items (
  order_id uuid NOT NULL REFERENCES voss_orders(id), product_slug text NOT NULL,
  colour_key text NOT NULL, name text NOT NULL, colour_name text NOT NULL,
  image_url text NOT NULL, quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 20),
  unit_price_pkr integer NOT NULL CHECK(unit_price_pkr > 0),
  PRIMARY KEY(order_id, product_slug, colour_key)
);
-- Private schema: use a server connection only. Never expose tables through a browser key.
ALTER TABLE voss_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_promotions ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS voss_order_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES voss_orders(id), old_status text NOT NULL, new_status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE voss_order_history ENABLE ROW LEVEL SECURITY;

