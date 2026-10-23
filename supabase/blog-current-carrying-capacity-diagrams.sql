-- Adds five explanatory diagrams to /blog/nickel-strip-current-carrying-capacity.
--
-- Run this in the Supabase SQL editor AFTER the diagram files are live. The SVGs ship in the
-- repository under public/img/blog/current-carrying-capacity/, and this script only adds the
-- <figure> blocks that point at them, so running it before the deploy would show broken images.
-- Check first:  https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-fuse-neck-how-it-works.svg
--
-- Each figure goes immediately before the next section's heading, i.e. at the end of the section
-- it illustrates. It is a no-op if the figures are already there, or if any of the five headings
-- is missing or appears more than once, so it cannot run twice or edit the wrong text.

update public.blog_posts
set content =
  replace(
  replace(
  replace(
  replace(
  replace(content,
    '<h2>Worked Example: Real 18650 Zig-Zag Strip Dimensions</h2>',
    $f1$<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-resistance-heat-temperature-chain.svg" alt="Four-step chain from nickel strip size to temperature: size sets area A, resistance R equals rho times L divided by A, heat P equals I squared times R, and temperature depends on how fast heat escapes" width="800" height="470" loading="lazy" decoding="async" />
<figcaption>From strip size to temperature. Steps 1&ndash;3 can be calculated on paper; step 4 needs a thermal test on your real assembly.</figcaption>
</figure>

<h2>Worked Example: Real 18650 Zig-Zag Strip Dimensions</h2>$f1$),
    '<h2>Surface Area Matters as Much as Cross-Section</h2>',
    $f2$<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-resistance-worked-example-18650-zig-zag.svg" alt="Worked example for a 0.20 mm by 44 mm nickel strip with a 19 mm current path: resistance about 0.205 milliohms and heat of 0.021, 0.082 and 0.185 watts at 10, 20 and 30 amps" width="800" height="580" loading="lazy" decoding="async" />
<figcaption>The worked example above, drawn out. The figures cover the strip body only; the two weld joints add more resistance.</figcaption>
</figure>

<h2>Surface Area Matters as Much as Cross-Section</h2>$f2$),
    '<h2>Continuous vs. Pulse Current: Why Duty Cycle Changes the Answer</h2>',
    $f3$<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-width-vs-thickness-cooling.svg" alt="A wide thin nickel strip compared with a narrow thick strip of the same 8.8 square millimetre cross-section: the wide strip has an 88.4 mm perimeter against 19.6 mm, about 4.5 times more surface for cooling" width="800" height="470" loading="lazy" decoding="async" />
<figcaption>Both strips hold the same cross-section of nickel, but the wide one exposes about 4.5 times more perimeter for heat to escape (illustrative geometry).</figcaption>
</figure>

<h2>Continuous vs. Pulse Current: Why Duty Cycle Changes the Answer</h2>$f3$),
    '<h2>One Thick Strip or Two Strips in Parallel?</h2>',
    $f4$<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-pulse-vs-continuous-current-heating.svg" alt="Schematic temperature curves: short current pulses with long rests stay below the safe limit, while the same peak current in longer or closer pulses builds up heat and crosses it" width="800" height="610" loading="lazy" decoding="async" />
<figcaption>Heating is instant, but temperature rise takes time, so duty cycle decides whether the same peak current is safe (schematic, not measured data).</figcaption>
</figure>

<h2>One Thick Strip or Two Strips in Parallel?</h2>$f4$),
    '<h2>H-Type vs Zig-Zag vs Honeycomb vs Plain Strip: A Practical Comparison</h2>',
    $f5$<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-fuse-neck-how-it-works.svg" alt="Diagram of a fuse-type nickel strip with a narrow neck that heats first and melts open when a cell short-circuits, before the fault can spread" width="800" height="540" loading="lazy" decoding="async" />
<figcaption>A fuse-type neck trades some current headroom for a built-in safety feature, and should be sized against your cell's fault current and BMS.</figcaption>
</figure>

<h2>H-Type vs Zig-Zag vs Honeycomb vs Plain Strip: A Practical Comparison</h2>$f5$),
  updated_at = now()
where slug = 'nickel-strip-current-carrying-capacity'
  and position('current-carrying-capacity/nickel-strip-' in content) = 0
  and (length(content) - length(replace(content, '<h2>Worked Example: Real 18650 Zig-Zag Strip Dimensions</h2>', ''))) = length('<h2>Worked Example: Real 18650 Zig-Zag Strip Dimensions</h2>')
  and (length(content) - length(replace(content, '<h2>Surface Area Matters as Much as Cross-Section</h2>', ''))) = length('<h2>Surface Area Matters as Much as Cross-Section</h2>')
  and (length(content) - length(replace(content, '<h2>Continuous vs. Pulse Current: Why Duty Cycle Changes the Answer</h2>', ''))) = length('<h2>Continuous vs. Pulse Current: Why Duty Cycle Changes the Answer</h2>')
  and (length(content) - length(replace(content, '<h2>One Thick Strip or Two Strips in Parallel?</h2>', ''))) = length('<h2>One Thick Strip or Two Strips in Parallel?</h2>')
  and (length(content) - length(replace(content, '<h2>H-Type vs Zig-Zag vs Honeycomb vs Plain Strip: A Practical Comparison</h2>', ''))) = length('<h2>H-Type vs Zig-Zag vs Honeycomb vs Plain Strip: A Practical Comparison</h2>')
returning slug,
  (length(content) - length(replace(content, '<figure>', ''))) / length('<figure>') as figures_in_post,
  (length(content) - length(replace(content, 'current-carrying-capacity/nickel-strip-', ''))) / length('current-carrying-capacity/nickel-strip-') as new_diagrams_added;
-- Expected: 1 row, new_diagrams_added = 5. Zero rows means a guard stopped it (already applied, or a heading changed).
