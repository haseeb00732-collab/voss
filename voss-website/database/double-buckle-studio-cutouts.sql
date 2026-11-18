-- Point the catalogue and checkout at the new transparent product cutouts.
BEGIN;
UPDATE voss_images SET studio_url = '/luxury-studio/double-buckle-flap-bag-black-front-studio-v3-960.webp', white_url = '/luxury-studio/double-buckle-flap-bag-black-front-studio-v3-960.webp', label = 'Front view', width = 960, height = 1200 WHERE product_slug = 'double-buckle-flap-bag' AND colour_key = 'black' AND position = 0;
UPDATE voss_images SET studio_url = '/luxury-studio/double-buckle-flap-bag-white-front-studio-v3-960.webp', white_url = '/luxury-studio/double-buckle-flap-bag-white-front-studio-v3-960.webp', label = 'Front view', width = 960, height = 1200 WHERE product_slug = 'double-buckle-flap-bag' AND colour_key = 'white' AND position = 0;
UPDATE voss_images SET studio_url = '/luxury-studio/double-buckle-flap-bag-dark-blue-interior-studio-v3-960.webp', white_url = '/luxury-studio/double-buckle-flap-bag-dark-blue-interior-studio-v3-960.webp', label = 'Interior view', width = 960, height = 1200 WHERE product_slug = 'double-buckle-flap-bag' AND colour_key = 'charcoal' AND position = 1;
COMMIT;
