-- Three new blog posts for nickelbusbar.com:
--   1. nickel-strip-overheating-melting-causes            (troubleshooting)
--   2. how-to-size-nickel-strip-for-battery-pack          (step-by-step, worked 13S4P example)
--   3. what-is-nickel-strip                               (pillar / definition page)
--
-- WHERE TO RUN THIS: Supabase project  fzrnezhbfyrpvudlsqny  (the one nickelbusbar.com reads from).
--   https://supabase.com/dashboard/project/fzrnezhbfyrpvudlsqny/sql/new
-- If this errors with  relation "public.blog_posts" does not exist  you are in a different project.
--
-- Safe to run twice: each insert is skipped if its slug already exists.
-- The first two posts embed diagram files that are already live on the site.

-- 1. blog_posts.id is an identity column. An earlier post was inserted with a hand-picked id, which
--    leaves the sequence behind it, so the next insert without an id could collide. Move the
--    sequence past the highest id first.
select setval(pg_get_serial_sequence('public.blog_posts', 'id'), (select coalesce(max(id), 1) from public.blog_posts));

-- 2. Post: why nickel strip overheats --------------------------------------------------------
insert into public.blog_posts
  (title, slug, excerpt, content, cover_image_url, cover_image_alt, status, meta_title, meta_description, published_at, faq_items)
select
  'Why Did My Nickel Strip Overheat or Melt? 5 Causes and How to Check Each',
  'nickel-strip-overheating-melting-causes',
  'Nickel almost never melts in a battery pack, but it can run hot. Where the hot spot is tells you why: five causes, and how to check each with a thermometer and a multimeter.',
  $c1$<p>When a nickel strip runs hot in a battery pack, the nickel is rarely the problem. The usual causes are a strip that is too small for the current, welds that carry more resistance than the strip itself, current peaks that were never in the sizing, or heat with nowhere to go. This guide takes the five causes in turn and shows how to tell them apart with a thermometer, a multimeter and one formula.</p>

<p><strong>The quick answer:</strong> look at <em>where</em> the strip is hottest. A hot spot at the welds, a strip that is hot along its whole length, and a hot narrow neck each point to a different cause.</p>

<h2>Does nickel strip actually melt?</h2>

<p>Almost never. Nickel melts above 1,400&nbsp;&deg;C, far above the temperatures at which cells and their insulation fail. What gives up first is everything around the strip: separators, insulation, heat-shrink, cell seals and the weld joint itself. So &ldquo;my strip overheated&rdquo; is the real problem to solve, long before &ldquo;my strip melted&rdquo;.</p>

<p>The exception is deliberate. A fuse-type strip has a narrowed neck designed to melt open under fault current. If a neck has opened, the strip did its job, and the question becomes why the current was that high.</p>

<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-resistance-heat-temperature-chain.svg" alt="Four-step chain from nickel strip size to temperature: size sets area A, resistance R equals rho times L divided by A, heat P equals I squared times R, and temperature depends on how fast heat escapes" width="800" height="470" loading="lazy" decoding="async" />
<figcaption>Every cause in this guide sits at one of these four steps. Steps 1&ndash;3 can be calculated; step 4 needs a thermal test.</figcaption>
</figure>

<h2>Read the hot spot first</h2>

<p>Put a thermocouple or thermal camera on the pack while it runs at its real load, and note which part of the interconnect is hottest.</p>

<table>
<thead>
<tr><th>Where it runs hottest</th><th>Most likely cause</th><th>First thing to check</th></tr>
</thead>
<tbody>
<tr><td>At the weld spots, with the strip between them cooler</td><td>Weak or inconsistent welds (cause 2)</td><td>Pull-test welds and measure the voltage drop across one joint under load</td></tr>
<tr><td>Evenly along the whole strip</td><td>Strip too small for the current (cause 1), or heat cannot escape (cause 4)</td><td>Recalculate with the narrowest cross-section; check potting, airflow and cell spacing</td></tr>
<tr><td>Only during acceleration or fast charge</td><td>Peak current missing from the sizing (cause 3)</td><td>Log the real current profile and compare it with the figure you sized for</td></tr>
<tr><td>At the narrow neck of a fuse-type or zig-zag strip</td><td>Neck too tight for the current, or normal fuse action (cause 5)</td><td>Compare the neck width with the current and with your BMS trip point</td></tr>
<tr><td>Everywhere, and resistance is higher than the calculation</td><td>Wrong material or grade (cause 5)</td><td>Check the material test certificate for grade, UNS number and purity</td></tr>
</tbody>
</table>

<h2>Cause 1: The strip is too small for the current</h2>

<p>Resistance depends on the strip's size: R = &rho; &times; L &divide; A, where A is thickness times width, L is the current path between welds, and &rho; is nickel's resistivity (about 9.5 x 10^-8 ohm-metres). Heat is P = I&sup2; &times; R. So halving the cross-section doubles the resistance and doubles the heat at the same current, while doubling the current quadruples the heat.</p>

<p>The strip in our <a href="/blog/nickel-strip-current-carrying-capacity">current-carrying capacity guide</a> (0.20 mm &times; 44 mm, with 19 mm between cell contacts) has a resistance of about 0.205 milliohms. At 30 A that is 0.185 W in the strip body. That is small, and for a well-sized strip it should be. The danger is the cross-section you forgot: holes, cut-outs and fuse necks all reduce it, and resistance is set by the narrowest point on the current path, not the full width of the strip.</p>

<p><strong>How to check:</strong> measure the narrowest cross-section on the actual part, recalculate R and P, and compare them with the temperature you measured. Our <a href="/calculator">calculator</a> handles the unit conversions.</p>

<h2>Cause 2: The welds are weaker than the strip</h2>

<p>Every spot weld is a joint with its own contact resistance, and that resistance is not in the strip formula. A poor weld can dissipate more heat than the whole stretch of strip beside it. That is why the signature of this cause is a hot spot at the weld while the strip between the welds stays cooler, sometimes with discolouration around the spot.</p>

<p>The usual reasons are surface oxidation from storage, too little weld energy or electrode force, a contaminated surface, or strip too thick for the welder settings (thicker strip needs more weld energy, which raises the risk of an inconsistent nugget).</p>

<p><strong>How to check:</strong> pull-test welds from the same batch, and measure the voltage drop across a single weld under load. Divide it by the current and you have that joint's resistance. If it is comparable to the strip's own resistance, or larger, the weld is your problem rather than the strip. See our guides on <a href="/blog/battery-spot-welding-tips-nickel-strip">spot welding tips</a>, <a href="/blog/nickel-strip-storage-handling-shelf-life">storage and oxidation</a> and <a href="/blog/common-nickel-strip-defects-battery-manufacturing">common defects</a>.</p>

<h2>Cause 3: The sizing ignored the peak</h2>

<p>Heat rises with the square of current, so a peak is worse than it looks: 40 A produces (40 &divide; 30)&sup2; = 1.78 times the heat of 30 A. Acceleration and fast charging produce exactly these peaks. Heating is instant, but temperature rise takes time, so what decides the outcome is the duty cycle: a short pulse followed by a long rest lets the heat escape, while the same peak held longer or repeated sooner does not.</p>

<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-pulse-vs-continuous-current-heating.svg" alt="Schematic temperature curves: short current pulses with long rests stay below the safe limit, while the same peak current in longer or closer pulses builds up heat and crosses it" width="800" height="610" loading="lazy" decoding="async" />
<figcaption>Same peak current, different duty cycle (schematic, not measured data).</figcaption>
</figure>

<p><strong>How to check:</strong> log the real current profile instead of using the nameplate figure, and size for the peak and the duty cycle together.</p>

<h2>Cause 4: The heat has nowhere to go</h2>

<p>Two identical strips can run at different temperatures purely because of their surroundings: potting compound, airflow, the temperature of the cells they touch, and how tightly the enclosure is packed. Shape matters too. A wide, thin strip exposes far more surface than a narrow, thick strip with the same cross-section, so for the same nickel, widening cools a joint better than thickening.</p>

<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-width-vs-thickness-cooling.svg" alt="A wide thin nickel strip compared with a narrow thick strip of the same 8.8 square millimetre cross-section: the wide strip has an 88.4 mm perimeter against 19.6 mm, about 4.5 times more surface for cooling" width="800" height="470" loading="lazy" decoding="async" />
<figcaption>Same cross-section, about 4.5 times the surface (illustrative geometry).</figcaption>
</figure>

<p><strong>How to check:</strong> compare the interconnect's temperature with the cells it touches. If the whole pack is warm and the strip is only slightly hotter, the fix is thermal design, not a bigger strip.</p>

<h2>Cause 5: The wrong material, or the wrong pattern for the job</h2>

<p>Two mistakes sit here.</p>

<ul>
<li><strong>Nickel-plated steel in place of pure nickel.</strong> Nickel-plated steel has higher resistance than pure nickel, so a strip that looks identical runs hotter at the same size. Ask for the grade and UNS number (Nickel 200 is N02200, Nickel 201 is N02201) and a material test certificate for the batch. See <a href="/blog/pure-nickel-strip-vs-nickel-plated-steel-strip">pure nickel vs nickel-plated steel strip</a>.</li>
<li><strong>A fuse-type pattern where current capacity matters.</strong> The narrowed neck of a <a href="/blog/fuse-type-vs-plain-nickel-strip">fuse-type strip</a> gives up current headroom on purpose. In a pack that needs to carry as much current as possible, a plain or H-type strip is the better choice.</li>
</ul>

<h2>How to find the cause for certain</h2>

<ol>
<li><strong>Measure temperature at four points under real load:</strong> at a weld, mid-strip, at any neck, and on a neighbouring cell.</li>
<li><strong>Calculate the strip's resistance</strong> from its narrowest cross-section, then measure the voltage drop along a clean stretch of strip at a known current. If measured and calculated resistance agree, the strip is behaving as designed.</li>
<li><strong>Measure the drop across a weld</strong> the same way. A weld that drops more voltage than the strip beside it is the heat source.</li>
<li><strong>Change one thing at a time</strong> (weld energy, strip width, potting) and measure again.</li>
</ol>

<p>Stop testing at full load if anything is hotter than the cell datasheet allows. A hot interconnect can also mean a faulty cell, and a pack that is still heating is not one to leave running.</p>

<h2>When the fix is a different strip</h2>

<p>If the numbers say the strip is too small, the options run from lowest to highest risk: widen it (it cools better and is not harder to weld the way thickening is), run strips in parallel at a thickness you can weld reliably, or move to a busbar-style link once the current outgrows strip. Our guides on <a href="/blog/nickel-strip-vs-nickel-busbar-differences">nickel strip vs nickel busbar</a> and <a href="/blog/nickel-strip-vs-copper-busbar-battery-interconnects">nickel strip vs copper busbar</a> cover that handover.</p>

<p>Ramani Steel House makes H-type, zig-zag, fuse-type and plain nickel strip in Mumbai (Nickel 201 for the patterned strip, Nickel 200 for plain), with material test certificates on request and a 5 kg minimum order. <a href="/products">Browse the catalogue</a>, or <a href="/contact">send your current, cell format and layout</a> and we will quote against them.</p>$c1$,
  'https://www.nickelbusbar.com/img/products/ni-18650-2p-zig-zag-no-fuse-type-nickel-strip.webp',
  'Ni 18650 2P zig-zag nickel strip interconnect, the strip used in the overheating worked examples - Ramani Steel House, nickel strip manufacturer in Mumbai, India',
  'published',
  'Nickel Strip Overheating: 5 Causes and How to Diagnose',
  'Nickel strip running hot in a battery pack? Five causes (undersized strip, weak welds, pulse peaks, poor cooling, wrong material) and how to tell them apart.',
  now(),
  $j1$[
    {"question": "Can a nickel strip actually melt in a battery pack?",
     "answer": "Only a deliberately narrowed fuse neck should. Nickel melts above 1,400 C, far above the temperatures at which cells and insulation fail, so overheating damages the rest of the pack long before the strip body melts."},
    {"question": "How hot is too hot for a nickel strip?",
     "answer": "There is no single figure for the strip. The limit is set by the weakest material next to it: the cell's rated temperature, the separators, the insulation and your own design limit. Use the cell datasheet and a validation test under real load."},
    {"question": "Why is the weld hotter than the strip?",
     "answer": "A weld has its own contact resistance, which is not in the strip formula. If a weld drops more voltage than the strip beside it at the same current, it dissipates more heat. Weld energy, electrode force and surface condition are the usual causes."},
    {"question": "Does a thicker nickel strip always run cooler?",
     "answer": "Not always. Thickness lowers resistance, but it adds less cooling surface than width does, and thicker strip is harder to weld consistently. Past a point, widening cools a joint better than thickening."},
    {"question": "Is a strip with an opened fuse neck faulty?",
     "answer": "No, it did its job. The neck is designed to open under fault current, so an opened neck points to a cell short or an overload. Find that cause before fitting a replacement strip."}
  ]$j1$::jsonb
where not exists (select 1 from public.blog_posts where slug = 'nickel-strip-overheating-melting-causes');

-- 3. Post: how to size nickel strip ---------------------------------------------------------
insert into public.blog_posts
  (title, slug, excerpt, content, cover_image_url, cover_image_alt, status, meta_title, meta_description, published_at, faq_items)
select
  'How to Size Nickel Strip for a Battery Pack: Step by Step, With a 13S4P Example',
  'how-to-size-nickel-strip-for-battery-pack',
  'There is no ampacity chart for nickel strip. Here is the method in seven steps, worked through for a 13S4P 18650 pack with real strip dimensions and the arithmetic shown.',
  $c2$<p>Sizing nickel strip comes down to one question: at the current your pack really draws, does the strip stay cool enough, at its welds as well as along its length? There is no single ampacity chart, because the answer depends on the strip's narrowest cross-section, the path length between cells, the welds and the duty cycle. This guide gives the method in seven steps and works it through for a 13S4P pack.</p>

<h2>The example pack (replace these with your own numbers)</h2>

<ul>
<li>13S4P: 13 groups in series, 4 cells in parallel per group, 18650 cells (52 cells in all)</li>
<li>Controller limit: 30 A continuous, 40 A peak</li>
<li>Nominal pack voltage: about 47 V (13 x 3.6 V)</li>
<li>Candidate strip: 44 mm wide with 19 mm between cell contacts, in 0.15 mm or 0.20 mm thickness (the strip dimensions are those of the zig-zag strip in our <a href="/blog/nickel-strip-current-carrying-capacity">current-carrying capacity guide</a>)</li>
</ul>

<p>These are illustrative assumptions. The point is the method, so swap in your own current, cell count and strip geometry.</p>

<h2>Step 1: Start from your real currents</h2>

<p>Take the continuous and peak current from the controller, charger and BMS limits, not from a cell's maximum rating. You need both: continuous current sets the steady temperature, and peak current sets the worst case. Here that is 30 A and 40 A.</p>

<h2>Step 2: Work out the current per cell and per weld</h2>

<p>With even sharing across a parallel group, each cell carries the pack current divided by the number of cells in parallel: 30 &divide; 4 = 7.5 A per cell, and 40 &divide; 4 = 10 A at peak. Check those against the cell's datasheet before going further, because no strip can fix an overloaded cell. With two weld spots per cell tab, each spot carries about 3.75 A continuous (two spots per cell is an assumption; set yours from your own welding trials).</p>

<h2>Step 3: Find the narrowest cross-section on the path</h2>

<p>Resistance is set by the smallest cross-section the current has to pass through, not the full width of the strip. Holes, cut-outs and fuse necks all reduce it. To keep the arithmetic traceable we use the full 44 mm width here, so treat the results as a best case: real strip, with its cut-outs, will be worse. Cross-section is thickness times width:</p>

<ul>
<li>0.15 mm &times; 44 mm = 6.6 mm&sup2;</li>
<li>0.20 mm &times; 44 mm = 8.8 mm&sup2;</li>
</ul>

<h2>Step 4: Calculate resistance and heat per link</h2>

<p>For the current path between adjacent groups, R = &rho; &times; L &divide; A, with &rho; about 9.5 x 10^-8 ohm-metres and L = 19 mm. Heat is P = I&sup2; &times; R, and the voltage drop is V = I &times; R. The same pack, in two thicknesses:</p>

<table>
<thead>
<tr><th>Strip</th><th>Cross-section</th><th>Resistance per link</th><th>Heat at 30 A</th><th>Heat at 40 A</th><th>Voltage drop at 30 A</th></tr>
</thead>
<tbody>
<tr><td>0.15 mm x 44 mm</td><td>6.6 mm&sup2;</td><td>0.273 milliohm</td><td>0.246 W</td><td>0.438 W</td><td>8.2 mV</td></tr>
<tr><td>0.20 mm x 44 mm</td><td>8.8 mm&sup2;</td><td>0.205 milliohm</td><td>0.185 W</td><td>0.328 W</td><td>6.2 mV</td></tr>
</tbody>
</table>

<figure>
<img src="https://www.nickelbusbar.com/img/blog/current-carrying-capacity/nickel-strip-resistance-worked-example-18650-zig-zag.svg" alt="Worked example for a 0.20 mm by 44 mm nickel strip with a 19 mm current path: resistance about 0.205 milliohms and heat of 0.021, 0.082 and 0.185 watts at 10, 20 and 30 amps" width="800" height="580" loading="lazy" decoding="async" />
<figcaption>The 0.20 mm row of the table, drawn out. The figures cover the strip body only.</figcaption>
</figure>

<p>This pack has 12 series links, so at 30 A the strip bodies dissipate about 3.0 W in total with 0.15 mm strip and about 2.2 W with 0.20 mm, against roughly 1,400 W of pack power (47 V x 30 A). That is around 0.2%. The lesson is not that efficiency is a problem. It is that the loss is small overall and concentrated in a few places, which is why you size against a local hot spot rather than the total.</p>

<h2>Step 5: Add what the formula leaves out: the welds</h2>

<p>The calculation covers only the strip body. Every weld adds contact resistance that no formula predicts, so measure it: record the voltage drop across a welded joint at a known current in your own welding trials, and divide by the current to get its resistance. If a joint's resistance is comparable to the strip's, the welds rather than the strip set your temperature. Our <a href="/blog/battery-spot-welding-tips-nickel-strip">spot welding guide</a> covers what drives weld quality, and <a href="/blog/nickel-strip-overheating-melting-causes">why nickel strip overheats</a> shows how to tell a weld problem from a sizing problem.</p>

<h2>Step 6: Check the peak and the duty cycle</h2>

<p>Heat rises with the square of current, so the 40 A peak produces (40 &divide; 30)&sup2; = 1.78 times the heat of 30 A: 0.438 W against 0.246 W on the 0.15 mm strip. Whether that matters depends on how long and how often the peak lasts. A short pulse followed by a long rest lets the heat escape; the same peak held longer, or repeated sooner, does not. Size for the peak and the duty cycle together.</p>

<h2>Step 7: Choose the pattern and thickness, then validate</h2>

<p>Thickness is a trade-off: thicker strip lowers resistance but needs more weld energy and is harder to weld cleanly, so most packs stay within a thickness band their welding process already handles well. The pattern then follows the layout and the protection scheme:</p>

<table>
<thead>
<tr><th>Your situation</th><th>Strip pattern</th></tr>
</thead>
<tbody>
<tr><td>Standard 4P group-to-group links</td><td>H-type, for example the <a href="/product/ni-18650-4p-h-type">18650 4P H-type strip</a></td></tr>
<tr><td>Irregular cell spacing, or a layout that needs flexibility</td><td>Zig-zag, for example the <a href="/product/ni-18650-2p-zig-zag-no-fuse-type">18650 2P zig-zag strip</a> (see <a href="/blog/zig-zag-vs-h-type-nickel-strip">zig-zag vs H-type</a>)</td></tr>
<tr><td>No cell-level protection, and you want a fault contained at the tab</td><td>Fuse-type (see <a href="/blog/fuse-type-vs-plain-nickel-strip">fuse-type vs plain strip</a>)</td></tr>
<tr><td>A layout no standard pattern fits</td><td>A <a href="/product/ni-customizable">custom pattern</a> cut to your pitch</td></tr>
</tbody>
</table>

<p>Then validate before you commit. Run the pack at its worst-case load and duty cycle with a thermocouple at a weld, mid-strip and on a neighbouring cell. Pull-test welds from the same batch. Only then freeze the design.</p>

<p>Order a sample first. Ramani Steel House supplies from a 5 kg minimum order, typically despatched within 7 days, with a material test certificate on request. <a href="/products">Browse the catalogue</a>, use the <a href="/calculator">calculator</a> to check weights and dimensions, or <a href="/contact">send your pack layout and current</a> for a quotation.</p>$c2$,
  'https://www.nickelbusbar.com/img/products/ni-18650-4p-h-type-nickel-strip.webp',
  'Ni 18650 4P H-type nickel strip, the 4P interconnect used in the 13S4P sizing example - Ramani Steel House, nickel strip manufacturer in Mumbai, India',
  'published',
  'How to Size Nickel Strip for a Battery Pack (13S4P Example)',
  'Seven steps to size nickel strip for a battery pack: currents, per-weld load, resistance, heat, peak duty and validation, worked through for a 13S4P pack.',
  now(),
  $j2$[
    {"question": "How many amps can nickel strip carry?",
     "answer": "There is no single figure. It depends on the strip's narrowest cross-section, the path length between welds, the welds themselves, how well heat escapes and the duty cycle. Calculate resistance and heat for your geometry, then confirm with a thermal test on a real assembly."},
    {"question": "Should I size nickel strip for continuous or peak current?",
     "answer": "Both. Continuous current sets the steady temperature and peak current sets the worst case. Heat rises with the square of current, so a peak 33% above continuous produces about 78% more heat while it lasts."},
    {"question": "Is a thicker nickel strip always better?",
     "answer": "No. Thickness lowers resistance, but it adds less cooling surface than width, and thick strip is harder to weld consistently. Widening the strip, or running strips in parallel at a thickness you can weld reliably, is often the lower-risk route."},
    {"question": "Can I use the same strip for 18650 and 21700 cells?",
     "answer": "Not usually. The pattern is cut to the cell pitch, which differs between formats, so a strip made for one rarely lands correctly on the other. See our 18650 vs 21700 guide for what changes."},
    {"question": "Why does the distance between cells matter for strip sizing?",
     "answer": "Resistance rises in proportion to the length of the current path. For the same strip, a wider cell pitch means a longer path between welds and therefore more resistance and more heat."}
  ]$j2$::jsonb
where not exists (select 1 from public.blog_posts where slug = 'how-to-size-nickel-strip-for-battery-pack');

-- 4. Post: what is nickel strip -------------------------------------------------------------
insert into public.blog_posts
  (title, slug, excerpt, content, cover_image_url, cover_image_alt, status, meta_title, meta_description, published_at, faq_items)
select
  'What Is Nickel Strip? A Plain-English Guide for Battery Builders and Buyers',
  'what-is-nickel-strip',
  'Nickel strip is thin pure nickel used to weld lithium-ion cells together. What it is made of, the main types, how it is specified and how it is sold, in plain English.',
  $c3$<p><strong>Nickel strip is thin, flat nickel, usually Nickel 200 or Nickel 201, supplied as coil or cut patterns and used to connect cells inside lithium-ion battery packs by spot welding.</strong> It is the interconnect between cells in packs for EVs, power tools and energy storage, and it is bought by weight to a specified grade, thickness, width and pattern.</p>

<h2>Nickel strip at a glance</h2>

<table>
<thead>
<tr><th>Property</th><th>Typical specification</th></tr>
</thead>
<tbody>
<tr><td>Material</td><td>Commercially pure nickel: Nickel 200 or Nickel 201</td></tr>
<tr><td>Standard</td><td>ASTM B162</td></tr>
<tr><td>UNS numbers</td><td>N02200 (Nickel 200) and N02201 (Nickel 201)</td></tr>
<tr><td>Nickel content</td><td>99.0% minimum (plus cobalt) by the grade specification; Ramani Steel House supplies 99.2% pure nickel</td></tr>
<tr><td>Thickness</td><td>0.1 mm to 1.0 mm for plain strip; 0.15 mm and 0.20 mm for the stamped patterns we make</td></tr>
<tr><td>Forms</td><td>Plain strip, slit coil, and stamped H-type, zig-zag, honeycomb and fuse-type patterns</td></tr>
<tr><td>Joined by</td><td>Resistance spot welding</td></tr>
<tr><td>Sold by</td><td>The kilogram (minimum order 5 kg from Ramani Steel House)</td></tr>
</tbody>
</table>

<h2>What is nickel strip made of?</h2>

<p>Nickel 200 (UNS N02200) and Nickel 201 (UNS N02201) are commercially pure wrought nickel. Nickel 201 is the low-carbon variant and is preferred for repeated spot welding, so our stamped H-type, zig-zag and fuse-type strip is supplied in Nickel 201, while plain strip is supplied in Nickel 200. <a href="/blog/nickel-200-vs-nickel-201-battery-strip">Nickel 200 vs Nickel 201</a> explains the difference in detail.</p>

<p>Nickel strip is solid nickel all the way through. That separates it from nickel-plated steel strip, which is a steel core with a thin nickel layer. The plated product costs less but has higher resistance; our <a href="/blog/pure-nickel-strip-vs-nickel-plated-steel-strip">pure nickel vs nickel-plated steel</a> comparison covers when each is appropriate.</p>

<h2>What is nickel strip used for?</h2>

<p>Almost all of it goes into lithium-ion battery packs, where it connects cells to each other. Cells wired in parallel form a group (the P in 2P, 3P or 4P), groups wired in series add voltage (the S), and nickel strip is welded across the cell terminals to make both connections. The main uses are:</p>

<ul>
<li>EV battery packs and modules</li>
<li>Power tool and other portable battery packs</li>
<li>Energy storage systems</li>
<li>Cell formats from 18650 and 21700 to 32650 and 32700</li>
</ul>

<p>How the strip is patterned depends on the layout: see <a href="/blog/2p-vs-3p-vs-4p-nickel-strip-interconnect-design">2P vs 3P vs 4P interconnect design</a> and <a href="/blog/18650-vs-21700-nickel-strip-cell-format">18650 vs 21700 nickel strip</a>.</p>

<h2>Why nickel, and not copper or steel?</h2>

<ul>
<li><strong>It spot-welds cleanly.</strong> Nickel's higher resistivity and low thermal conductivity (roughly 70 W/m&middot;K for Nickel 200) keep heat at the weld. Copper's very low resistivity and high thermal conductivity (roughly 390&ndash;400 W/m&middot;K) carry heat away, which is why copper is bolted or laser-welded rather than resistance spot welded.</li>
<li><strong>It resists corrosion.</strong> Nickel forms a stable oxide film, so strip is normally left unplated.</li>
<li><strong>It is not the best conductor, and does not need to be.</strong> Nickel 200 is roughly five and a half times more resistive than annealed copper, so copper busbar carries the bulk current between modules while nickel strip makes the weldable cell-level connections. See <a href="/blog/nickel-strip-vs-copper-busbar-battery-interconnects">nickel strip vs copper busbar</a>.</li>
</ul>

<h2>The main types of nickel strip</h2>

<table>
<thead>
<tr><th>Type</th><th>What it is</th><th>Typical use</th></tr>
</thead>
<tbody>
<tr><td><a href="/product/Plain-Nickel-Strips">Plain strip</a></td><td>Unpatterned strip slit to width from coil, 0.1 mm to 1.0 mm</td><td>General tabs and interconnects, and custom sizes</td></tr>
<tr><td><a href="/product/ni-18650-2p-h-type">H-type</a></td><td>Stamped strip with H-shaped cut-outs between cell contacts, made for 2P, 3P and 4P groups</td><td>The standard multi-cell interconnect</td></tr>
<tr><td><a href="/product/ni-18650-2p-zig-zag-no-fuse-type">Zig-zag and honeycomb</a></td><td>A zig-zag pattern that flexes to absorb cell movement</td><td>Irregular cell spacing and flexible layouts; see <a href="/blog/zig-zag-vs-h-type-nickel-strip">zig-zag vs H-type</a></td></tr>
<tr><td><a href="/product/ni-fuse-type-18650-2p-h-type-honeycomb">Fuse-type</a></td><td>A narrowed neck that acts as a fusible link and opens under fault current</td><td>Packs that want a fault contained at the cell tab; see <a href="/blog/fuse-type-vs-plain-nickel-strip">fuse-type vs plain strip</a></td></tr>
<tr><td><a href="/product/ni-customizable">Custom</a></td><td>Cut to your pitch, width and hole pattern</td><td>Layouts no standard pattern fits</td></tr>
</tbody>
</table>

<h2>How nickel strip is specified</h2>

<p>When you ask for a quotation, these are the details that define the part, and the ones that must match if you are comparing suppliers:</p>

<ol>
<li><strong>Grade and UNS number:</strong> Nickel 200 (N02200) or Nickel 201 (N02201), supplied to ASTM B162</li>
<li><strong>Thickness:</strong> see the <a href="/blog/nickel-strip-thickness-guide">thickness guide</a> and the <a href="/blog/nickel-strip-current-carrying-capacity">current-carrying capacity guide</a> for how to choose</li>
<li><strong>Width</strong></li>
<li><strong>Pattern:</strong> plain, H-type, zig-zag, honeycomb, fuse-type or custom</li>
<li><strong>Cell format and spacing:</strong> 18650, 21700, 32650 or 32700, and the distance between cell centres (the &ldquo;CD&rdquo; on a drawing)</li>
<li><strong>Quantity</strong> in kilograms</li>
<li><strong>Documentation:</strong> whether you need a material test certificate</li>
</ol>

<h2>How nickel strip is sold</h2>

<p>Nickel strip is sold by weight but used by length. Nickel has a density of about 8.9 g/cm&sup3;, so the weight per metre of solid strip is thickness (mm) &times; width (mm) &times; 8.9 grams. A 0.15 mm &times; 27 mm strip weighs 36 g per metre, which makes 5 kg roughly 139 metres. A stamped pattern removes metal, so patterned strip gives more length per kilogram than the same size solid. Our <a href="/blog/nickel-strip-minimum-order-quantity">minimum order guide</a> works through this, the <a href="/calculator">calculator</a> does the conversion for you, and the <a href="/blog/nickel-strip-pricing-guide-battery-pack-orders">pricing guide</a> explains what drives the price per kilogram.</p>

<h2>Where to go next</h2>

<ul>
<li><a href="/blog/nickel-strip-current-carrying-capacity">How much current can nickel strip carry?</a></li>
<li><a href="/blog/how-to-size-nickel-strip-for-battery-pack">How to size nickel strip for a battery pack</a></li>
<li><a href="/blog/battery-spot-welding-tips-nickel-strip">Spot welding tips for nickel strip</a></li>
<li><a href="/blog/nickel-strip-overheating-melting-causes">Why nickel strip overheats</a></li>
<li><a href="/blog/how-to-choose-nickel-strip-manufacturer-india">How to choose a nickel strip manufacturer in India</a></li>
</ul>

<p>Ramani Steel House has manufactured nickel strip and busbar in Mumbai since 1974. <a href="/products">Browse the catalogue</a> or <a href="/contact">send your specification</a> for a quotation.</p>$c3$,
  'https://www.nickelbusbar.com/img/products/plain-nickel-strips.webp',
  'Plain nickel strip supplied by Ramani Steel House, the unpatterned form of nickel strip used for battery interconnects - nickel strip manufacturer in Mumbai, India',
  'published',
  'What Is Nickel Strip? Grades, Types and Uses Explained',
  'Nickel strip is thin pure nickel used to weld lithium-ion cells together. What it is made of, the main types, how it is specified and how it is sold.',
  now(),
  $j3$[
    {"question": "What is nickel strip made of?",
     "answer": "Commercially pure nickel, usually Nickel 200 (UNS N02200) or Nickel 201 (UNS N02201), supplied to ASTM B162. Both grades specify at least 99.0% nickel, and Ramani Steel House supplies 99.2% pure nickel."},
    {"question": "What is nickel strip used for?",
     "answer": "Connecting cells inside lithium-ion battery packs. It is spot welded across cell terminals to wire cells in parallel and in series, in EV battery packs, power tools, energy storage systems and other portable packs."},
    {"question": "Is nickel strip the same as nickel-plated steel strip?",
     "answer": "No. Nickel strip is solid nickel throughout, while nickel-plated steel is a steel core with a thin nickel layer. The plated product costs less but has higher resistance, so the two are not interchangeable where conductivity matters."},
    {"question": "What thickness is nickel strip for 18650 batteries?",
     "answer": "It depends on the current the interconnect carries, not on the cell format alone. The patterned strips we make for 18650 packs are 0.15 mm and 0.20 mm thick, and plain strip runs from 0.1 mm to 1.0 mm. Our thickness and current-carrying capacity guides explain how to choose."},
    {"question": "How is nickel strip joined to a battery cell?",
     "answer": "By resistance spot welding. Nickel's resistivity and relatively low thermal conductivity let heat build at the weld interface, which is why it welds cleanly where copper does not."},
    {"question": "How is nickel strip sold?",
     "answer": "By weight, usually in kilograms, to a specified grade, thickness, width and pattern. Ramani Steel House supplies from a 5 kg minimum order. The weight per metre of solid strip is thickness in mm times width in mm times 8.9 grams."}
  ]$j3$::jsonb
where not exists (select 1 from public.blog_posts where slug = 'what-is-nickel-strip');

-- 5. Check: three rows, all published ---------------------------------------------------------
select id, slug, status, length(content) as content_chars, jsonb_array_length(faq_items) as faqs
from public.blog_posts
where slug in ('nickel-strip-overheating-melting-causes', 'how-to-size-nickel-strip-for-battery-pack', 'what-is-nickel-strip')
order by id;
