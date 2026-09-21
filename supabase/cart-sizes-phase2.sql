-- Phase 2 of the cart size change. RUN ONLY AFTER the build containing src/lib/stripSpec.ts is
-- live on nickelbusbar.com (check /version.json shows that commit).
--
-- Phase 1 (migration add_strip_size_to_cart_and_quote_items, already applied) added
-- cart_items.spec / spec_key and a unique index on (user_id, product_id, spec_key), but kept
-- the old UNIQUE (user_id, product_id): the previous build writes the cart with
-- ON CONFLICT (user_id, product_id), and removing the constraint it names would make every
-- signed-in cart save on the live site fail.
--
-- Until this runs, a signed-in buyer who puts the same product in the cart in two sizes gets a
-- failed server sync for that cart (their browser copy is unaffected). Running it before the
-- deploy breaks the old build instead. Hence: after, not before.

alter table public.cart_items
  drop constraint if exists cart_items_user_id_product_id_key;
