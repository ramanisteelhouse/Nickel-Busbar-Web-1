-- Per-product SEO copy. Generated content, reviewed by hand — re-runnable.
--
-- Targets "H type nickel strips price per kg" on the ten H type products, where the phrase is
-- true. The other seven are a plain nickel strip, a copper busbar, three zig-zag patterns and
-- two custom items: giving those the H type phrase would be false on the page and would put
-- seventeen URLs in competition for one query, so each targets what it actually is.
--
-- The category-level phrase belongs to /h-type-nickel-strip (see src/lib/landingPages.ts).
-- These pages carry the per-SKU long-tail and reinforce it.
--
-- Columns are created by the add_product_seo_columns migration (also in setup.sql).

update public.products set
  seo_heading = '18650 2P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 18650 2P, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 18650 2P H type strip in pure nickel.', 'Strip is slit to your 18650 pack pitch and hole pattern before despatch. Bulk and export lots are quoted separately — send your cell layout or pack drawing for an exact figure.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '18650 2P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-18650-2p-h-type';

update public.products set
  seo_heading = '18650 2P Fuse Type H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 18650 2P fuse-type, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 18650 2P fuse-type H type strip in pure nickel.', 'Strip is slit to your 18650 pack pitch and hole pattern before despatch. Bulk and export lots are quoted separately — send your cell layout or pack drawing for an exact figure.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '18650 2P Fuse Type H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-18650-2p-h-type-fuse-type';

update public.products set
  seo_heading = '18650 3P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 18650 3P, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 18650 3P H type strip in pure nickel.', 'Strip is slit to your 18650 pack pitch and hole pattern before despatch. Bulk and export lots are quoted separately — send your cell layout or pack drawing for an exact figure.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '18650 3P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-18650-3p-h-type';

update public.products set
  seo_heading = '18650 4P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 18650 4P, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 18650 4P H type strip in pure nickel.', 'Strip is slit to your 18650 pack pitch and hole pattern before despatch. Bulk and export lots are quoted separately — send your cell layout or pack drawing for an exact figure.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '18650 4P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-18650-4p-h-type';

update public.products set
  seo_heading = '18650 Honeycomb H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 18650 2P honeycomb fuse-type, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 18650 2P honeycomb fuse-type H type strip in pure nickel.', 'Strip is slit to your 18650 pack pitch and hole pattern before despatch. Bulk and export lots are quoted separately — send your cell layout or pack drawing for an exact figure.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '18650 Honeycomb H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-fuse-type-18650-2p-h-type-honeycomb';

update public.products set
  seo_heading = '21700 2P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 21700 2P, 0.20mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.20mm 21700 2P H type strip in pure nickel.', '21700 packs carry more current per cell, so thickness and fuse geometry are matched to your discharge rating rather than sold to a fixed section. Send your pack drawing for an exact quotation.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '21700 2P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '21700 Nickel Strip Price']::text[]
where slug = 'ni-21700-2p-h-type-v3';

update public.products set
  seo_heading = '21700 2P Precision H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 21700 2P precision-slit, 0.20mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.20mm 21700 2P precision-slit H type strip in pure nickel.', '21700 packs carry more current per cell, so thickness and fuse geometry are matched to your discharge rating rather than sold to a fixed section. Send your pack drawing for an exact quotation.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '21700 2P Precision H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '21700 Nickel Strip Price']::text[]
where slug = '21700-2p-h-type-precision';

update public.products set
  seo_heading = '21700 4P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 21700 4P, 0.20mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.20mm 21700 4P H type strip in pure nickel.', '21700 packs carry more current per cell, so thickness and fuse geometry are matched to your discharge rating rather than sold to a fixed section. Send your pack drawing for an exact quotation.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '21700 4P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '21700 Nickel Strip Price']::text[]
where slug = 'ni-21700-4p-h-type';

update public.products set
  seo_heading = '21700 Double Fuse H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 21700 2P double-fuse, 0.20mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.20mm 21700 2P double-fuse H type strip in pure nickel.', '21700 packs carry more current per cell, so thickness and fuse geometry are matched to your discharge rating rather than sold to a fixed section. Send your pack drawing for an exact quotation.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '21700 Double Fuse H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '21700 Nickel Strip Price']::text[]
where slug = 'ni-fuse-type-21700-2p-h-type-double-fuse';

update public.products set
  seo_heading = '32650 2P H Type Nickel Strip Price Per Kg',
  seo_meta_description = 'H Type Nickel Strips Price Per Kg: {price} for 32650 2P, 0.15mm pure nickel. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. H Type Nickel Strips Price Per Kg depends on thickness, width, pitch and order quantity — this is the standard rate for the 0.15mm 32650 2P H type strip in pure nickel.', 'Large-format cells need a wider tab and a heavier strip section, so the rate moves with pitch and current rating. Send your cell layout and we quote the exact strip for it.']::text[],
  seo_keywords = array['H Type Nickel Strips Price Per Kg', '32650 2P H Type Nickel Strip', 'H Type Nickel Strip Price', 'H Type Nickel Strip', '32650 Nickel Strip Price']::text[]
where slug = 'ni-32650-2p-h-type';

update public.products set
  seo_heading = 'Pure Nickel Strip Price Per Kg',
  seo_meta_description = 'Pure nickel strip price per kg: {price} for plain 99.8%+ nickel strip, 0.1mm to 1.0mm. Ramani Steel House, Mumbai — MTC on despatch, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. Pure nickel strip price per kg moves with thickness and width — this is the standard rate for plain 99.8%+ nickel strip in the 0.1mm to 1.0mm range.', 'Plain strip is supplied in coil or cut lengths and slit to your width before despatch. Bulk and export lots are quoted separately against quantity and specification.']::text[],
  seo_keywords = array['Pure Nickel Strip Price Per Kg', 'Pure Nickel Strip Price', 'Plain Nickel Strip', 'Nickel Strip Price Per Kg', '99.8% Pure Nickel Strip']::text[]
where slug = 'Plain-Nickel-Strips';

update public.products set
  seo_heading = 'Copper Busbar Price Per Kg',
  seo_meta_description = 'Copper busbar price per kg: {price}. Copper busbar for battery packs and switchgear from Ramani Steel House, Mumbai — PAN India supply and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. Copper busbar price per kg moves with section, temper and order quantity, and with the copper reference rate on the day of quotation.', 'Busbar is cut, punched and finished to your drawing. Send the section and hole pattern you need and Ramani Steel House will quote against your exact specification.']::text[],
  seo_keywords = array['Copper Busbar Price Per Kg', 'Copper Busbar Price', 'Copper Busbar Manufacturer India', 'Battery Pack Copper Busbar']::text[]
where slug = 'Copper-Busbar';

update public.products set
  seo_heading = '18650 Zig-Zag Honeycomb Nickel Strip Price Per Kg',
  seo_meta_description = 'Zig-zag nickel strip price per kg: {price} for 18650 2P honeycomb fuse-type strip, 0.15mm pure nickel. Ramani Steel House, Mumbai — PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. Zig-zag nickel strip price per kg depends on thickness, pitch and fuse geometry — this is the standard rate for the 0.15mm 18650 2P honeycomb pattern.', 'The zig-zag honeycomb pattern absorbs cell-to-cell expansion that a straight tab transfers into the weld. Send your 18650 pack layout for an exact quotation.']::text[],
  seo_keywords = array['Zig Zag Nickel Strip Price Per Kg', 'Zig Zag Nickel Strip', '18650 Honeycomb Nickel Strip', 'Fuse Type Nickel Strip Price']::text[]
where slug = 'ni-fuse-type-18650-2p-zig-zag-honeycomb';

update public.products set
  seo_heading = '32700 Zig-Zag Nickel Strip Price Per Kg',
  seo_meta_description = '32700 zig-zag nickel strip price per kg: {price} for 2P honeycomb fuse-type strip in 0.20mm pure nickel. Ramani Steel House, Mumbai — PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. This is the standard rate for the 0.20mm 32700 2P zig-zag honeycomb strip; zig-zag nickel strip price per kg moves with pitch, thickness and quantity.', '32700 LiFePO4 packs run heavier continuous current than 18650 packs, so the fuse section is sized against your discharge rating. Send your cell layout for an exact figure.']::text[],
  seo_keywords = array['Zig Zag Nickel Strip Price Per Kg', '32700 Nickel Strip Price', '32700 Nickel Strip', 'LiFePO4 Nickel Strip']::text[]
where slug = 'ni-fuse-type-32700-2p-zig-zag-honeycomb';

update public.products set
  seo_heading = '18650 Zig-Zag Nickel Strip Price Per Kg',
  seo_meta_description = '18650 zig-zag nickel strip price per kg: {price} for 2P no-fuse strip, 0.20mm x 44mm, 19mm CD. Ramani Steel House, Mumbai — PAN India supply and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. This is the rate for the 0.20mm x 44mm no-fuse zig-zag strip at 19mm cell distance; zig-zag nickel strip price per kg moves with width, pitch and quantity.', 'A no-fuse zig-zag strip carries full pack current without a deliberate weak point, for designs that handle protection at the BMS instead. Send your layout for an exact quotation.']::text[],
  seo_keywords = array['Zig Zag Nickel Strip Price Per Kg', '18650 Zig Zag Nickel Strip', 'No Fuse Nickel Strip', '18650 Nickel Strip Price']::text[]
where slug = 'ni-18650-2p-zig-zag-no-fuse-type';

update public.products set
  seo_heading = 'Custom Nickel Strip Price Per Kg',
  seo_meta_description = 'Custom nickel strip price per kg: {price} for 0.20mm x 40mm strip at 34mm CD. Custom slitting and pitch from Ramani Steel House, Mumbai — PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. Custom nickel strip price per kg is set by thickness, width, pitch and order quantity — this is the rate for 0.20mm x 40mm strip at 34mm cell distance.', 'Any width from 2mm to 50mm and any thickness from 0.10mm to 0.50mm can be slit to your drawing. Send the pattern you need and Ramani Steel House will quote it.']::text[],
  seo_keywords = array['Custom Nickel Strip Price Per Kg', 'Custom Nickel Strip', 'Custom Slit Nickel Strip', 'Nickel Strip Price Per Kg']::text[]
where slug = 'ni-customizable';

update public.products set
  seo_heading = 'Custom Cut Nickel Strip Price Per Kg',
  seo_meta_description = 'Custom cut nickel strip price per kg: {price} for 0.15mm pure nickel cut to your pattern. Mumbai manufacturer — MTC supplied, PAN India and export.',
  seo_paragraphs = array['{name} is priced at {price} per kg. Custom cut nickel strip price per kg depends on thickness, width and the complexity of the hole pattern — this is the rate for 0.15mm pure nickel.', 'Cut-to-pattern strip suits prototype and short-run packs where a stock pitch does not fit. Send a drawing or a sample and Ramani Steel House will quote against it.']::text[],
  seo_keywords = array['Custom Cut Nickel Strip Price Per Kg', 'Custom Nickel Strip', 'Nickel Strip Cut To Size', 'Prototype Nickel Strip']::text[]
where slug = 'ni-custom-custom';
