# Original pixel art prompts

Generated with the built-in image generation tool. Prompts cover original creatures only. The shipped assets are finalized on their native grids using `scripts/prepare-pixel-assets.mjs`.

## back-atlas-containment-prompt.txt

Use case: precise-object-edit
Asset type: production BACK battle sprite atlas, transparent.
Input image1 is edit target. Its rear views are correct: KEEP all12original creature rear anatomy, palettes, orientations, poses, and exact4column×3row order.
Change only sprite SCALE and POSITION for rigorous cell containment. Reference canvas1448x1086,12equal362x362square cells. SHRINK EACH WHOLE SPRITE by20% relative to reference and CENTER it inside its own cell. Every horn, tail, chime, quill, limb, fin, and branch tip must have a clear margin from all4boundaries of its cell. Keep the entire bounding box within inner64x64of each80x80logical cell; at least8transparent logical pixels to every cell edge. No cropping. No crossing cells. Strong clear transparent air gaps.
Preserve the genuine BEHIND view: no faces or front eyes introduced, no mirroring to front. Player creatures face upper-right. Use one-logical-pixel colored dark outline,16opaque colors per creature,3or4hard cel tones per material, no fine texture flecks. Logical320x240atlas nearest-neighbor enlarged4x. Completely transparent surround, fully opaque sprite colors, NO semialpha. No labels, grid, shadow, background, dither, gradient, antialias, glow or soft shading.


## back-atlas-prompt.txt

Use case: stylized-concept
Asset type: production monster-game sprite atlas, distinct BACK battle views, transparent PNG.
Input image1 is a DESIGN AND COLOR REFERENCE for the twelve original creatures. It is NOT the view to reproduce. Create a NEW atlas with entirely NEW drawings of these same12 creatures seen from BEHIND. Preserve their shapes, key parts, and color identities across paired views. Do not mirror or copy the front sprites.

LAYOUT: Exactly FOUR columns by THREE rows, twelve equal SQUARE cells, left-to-right top-to-bottom order identical to image1. Logical canvas320x240, each cell80x80; draw directly on that grid and nearest-neighbor enlarge4x to1280x960. Equal square cells with no extra gutters. Center one complete sprite in each cell, occupying65–85% of each cell, transparent gaps around every sprite. NO text, labels, frame, grid lines, shadows, checkerboard, or extra sprites.

TRUE PIXEL ART: Chunky hard square pixel clusters, deliberate stair-step silhouettes, one-logical-pixel colored DARK outline (dark brown/plum/teal, never pure black), 16solid colors per creature, three or four hard cel tones per material, top-left light. All linework and details align to logical pixels. Remove tiny texture and smooth painted tonal variation. No gradients, antialiasing, smooth edges, glow, soft shading, dither, ground/drop shadows, or particles. Fully opaque sprite pixels on completely transparent surrounding canvas. Match the simplified original pixel-sprite craft of DS-era Generation4–5 80x80 battle sprites.

REAR VIEW CRITICAL: These are player's creatures facing AWAY from camera toward UPPER-RIGHT. Camera sees their backs, backs of heads, rear legs/rump, tails, folded wings, rear armor; no frontal faces or front-facing eyes. Fully complete bodies. Facing upper-right rather than simply facing horizontally. Back sprites must show genuinely different rear anatomy, not front illustrations reflected left/right. Creature designs retained:

Row1 col1 N01 Coalspindle: Rear of round dark wicker/soot ember sphere, charcoal spikes on back, solid orange cracks on woven rear panels, FOURjointed firewood legs visible beneath. Face is on far side and NOT visible.
Row1 col2 N02 Hearthmoth: REAR of chunky russet festival-paper moth, rear head and antennae pointing upper-right, broad russet/cream paper WING BACKS folded slightly toward viewer, ember-paper patterns. Rear view has a folded wing silhouette distinct from the spread front.
Row1 col3 N03 Ribbonrook: REAR THREE-QUARTER chunky teal/cream ribbon bird, teal back and folded road-sign ribbon WINGS, back of head, long forked KNOT TAIL aimed down-left toward camera; cream chest is on far side.
Row1 col4 N04 Chimekite: BACK SIDE of diamond weather kite, teal/cream rear panels and slim warm copper structural cross spars, copper ceramic CHIMES hanging from short ribbon tails. Its ceramic facial panel is on far side and not visible. Tilt upper-right.
Row2 col1 N05 Cairnox: REAR of squat warm STONE ox cairn, heavy stone rump, short stone tail and FOURchunky stone hooves, branch antlers above rear of head, moss clusters along stones. Point head to upper-right.
Row2 col2 N06 Rootwrit: REAR of terracotta rooted humanoid, back of clay head with sage-green leafy crest, chunky ROOT arms/feet, leaf-shaped tablets carried at sides with the BACKS of tablet surfaces visible. No face visible.
Row2 col3 N07 Rillhorn: REAR three-quarter stout deep-blue stream ungulate, hindquarters and stepping-stone rear hooves nearest camera, flowing dorsal fins across blue back, SINGLE hollow crescent horn seen beyond back of head aimed upper-right; no visible frontal face.
Row2 col4 N08 Wellwisp: REAR of walking wooden bucket-frame water spirit. Wooden rear planks, rope cross ties, round bucket hoops and rope limbs nearest viewer. Turquoise suspended water bead is visible through side openings, but its face turned away.
Row3 col1 N09 Knellbadger: REAR of squat violet/slate badger, BRASS BELL-SHAPED armored shell dominating back, small violet rump/short tail, sturdy hind paws nearest viewer and digging foreclaws on far side. No front badger mask shown.
Row3 col2 N10 Duskquill: REAR of asymmetric midnight-plum floating ink-drop body, no eyes on back, two ivory QUILL limbs asymmetrically lifted to upper-right, curling ink tail visible toward camera.
Row3 col3 N11 Bellmane: REAR cream stocky four-legged lantern guardian, square rear paws and cream rump nearest camera, rear of golden bell/ribbon MANE, curling lantern-tail seen clearly alongside rump. Solid ivory/gold highlights only, no glow.
Row3 col4 N12 Glimmerscribe: REAR walking ivory scroll bundle, rolled parchment ARMS and short scroll LEGS, rear closures/rolled ends of scroll torso, hovering angular golden lamp HEAD viewed from rear at upper-right. Solid highlights, no glow.

All12 match their front identity without showing front faces. No existing Pokémon or copied franchise designs.

RIGOROUS CONTAINMENT: Each complete back sprite INCLUDING ALL tails, horn tips, wings, chimes, quills and feet must fit inside the inner64x64logical pixels of its80x80cell. Leave8transparent logical pixels to EVERYcell boundary. NO sprite can reach or cross another cell; shrink entire anatomy to fit rather than cropping. For columns logical x bounds are8..71,88..151,168..231,248..311; rows y8..71,88..151,168..231.


## battle-background-pixel-pass-prompt.txt

Use case: style-transfer
Asset type: 320x180 true-pixel battlefield, opaque.
Input image1 is the composition reference and edit target. Retain its original sage/teal meadow setting with distant tree line and warm cairns; retain TWO moss/earth elliptical creature platforms in EXACTLY the same positions, lower-left and upper-right. Keep16:9 framing.
Redraw all artwork as actual flat-color pixel art on a320x180 logical pixel grid, nearest-neighbor enlarged4x to1280x720. Every edge should use clear4x4-square pixel steps. Replace ALL soft tonal changes, gradients, shading texture and noise with LARGE flat solid pixel clusters. Restrict ENTIRE image to exactly18 solid colors. Sky should be ONE uniform light sage-teal color, meadow planes3 flat greens, trees3 flat teals, cairns3 warm earth/gold tones. Clouds simple cream block clusters with at most2 tones. Ellipses have flat moss-green tops, hard dark-teal outlines, and2 earth-tone edge bands. Top-left cel highlights on trees/cairns.
No gradient anywhere; no dither, antialiasing, tiny textural flecks, blur, glow, haze, shadows, text, creatures, UI, or smooth rendered painting. Big quiet readable color areas for a pixel game background. Entire canvas fully opaque.


## battle-background-prompt.txt

Use case: stylized-concept
Asset type: production pixel-art monster-battle battlefield background, opaque PNG.
Create one original quiet grass battlefield in a landscape 16:9 composition. It must be genuine DS-era pixel art built on a 320x180 logical pixel grid and nearest-neighbor enlarged exactly 4x to 1280x720. Every logical pixel is a crisp uniform square. Compose restrained flat-color horizontal areas: muted pale sage/teal sky, a distant dark teal tree line, low soft-shaped hills rendered with HARD PIXEL STEPS, and open sage-green meadow in the foreground. Include a few small warm gold/brown stacked stone cairns along the distant field edge. No text, no creatures, no interface, no buildings. A calm imaginative original monster-game setting.
Important placement: TWO clearly FLAT hard-edged pixel ground ellipses are part of the foreground ground. Each platform is an outlined moss-and-earth patch with two or three solid colored bands, no drop shadow or gradient. Own-creature platform center is roughly x=25%, y=78%, with width about 32% and height about 13% of the canvas. Opponent platform center is roughly x=75%, y=60%, width about 25% and height about 10%. Keep both fully visible with space around them and open grass behind them. The own platform is visibly lower-left and the opponent platform upper-right. Ground ellipses provide solid moss-green standing surfaces, darker earth edge pixels, and crisp colored dark teal/earth outlines. No other large platforms.
Style constraints: Original crisp pixel clusters and 1-logical-pixel colored outlines; top-left solid cel highlights on trees and cairns. Muted sage, teal and warm gold palette that supports colorful monster sprites. True flat color shapes, no gradients, no dither, no blur, no antialiasing, no smooth digital painting, no glow, no atmospheric haze, no soft shadows, no photographic textures, no black outline. No checkerboard. Opaque background throughout. Native 320x180 logical art nearest-neighbor enlarged, not a high-resolution scene with a pixel effect.


## front-atlas-containment-prompt.txt

Use case: precise-object-edit
Asset type: 4x3 transparent true-pixel FRONT battle atlas.
Input image1 is the edit target. CHANGE ONLY THE SPRITE SCALE/PLACEMENT needed for rigorous equal-square-cell containment, plus simplify the tiny eyes/texture. KEEP the twelve original designs, colors, FRONT poses, art style, and exact left-to-right top-to-bottom order unchanged.
The canvas has exactly4columns by3rows of equal SQUARE cells. The current reference is1448x1086physical pixels, cells362x362physical pixels. This corresponds to320x240logical pixels, cells80x80. KEEP4:3 overall aspect and12cells. For EVERY one of the12creatures, shrink the WHOLE creature by roughly20% relative to reference, preserving proportions, then center it in its original cell. Each creature's ENTIRE bounding box INCLUDING ALL TAIL TIPS, ANTENNAE, HORNS, CHIMES, QUILL TIPS, FEET, AND FINS must fit within the inner64x64logical-pixel area of its80x80cell. Leave at least8transparent logical pixels between every sprite and ALL FOURcell boundaries. Thus column3's teal Ribbonrook and its forked tail must be wholly contained in COLUMN3; its tail must never touch or enter column4.
Inner logical rectangles, exact cell containment: row1 y8..71; row2 y88..151; row3 y168..231. Column1 x8..71; column2 x88..151; column3 x168..231; column4 x248..311. No creature pixels outside its specified inner rectangle. Do not crop anything: reduce and reposition the entire creature so it all fits.
Make main iris/pupil details only1–3logical pixels and remove tiny decorative texture lines while preserving expressions. Crisp hard colored outline one logical pixel,16solid colors per creature, hard cel clusters3tones per material, top-left light. Draw directly on the80px logical cell grid and nearest-neighbor enlarge; every logical pixel is a sharp uniform square.
No gradients, blur, antialias, glow, semi-alpha, texture noise, dither, shadow, text, labels, visible grid, frame, background, or extra sprites. Fully OPAQUE sprite pixels surrounded by fully TRANSPARENT canvas. Keep all12complete original creatures.


## front-atlas-pixel-pass-prompt.txt

Use case: style-transfer
Asset type: production 80x80 true-pixel monster FRONT sprite atlas.
Input image 1 is the design reference and edit target. Retain exactly its twelve original creatures, their palette identities, their anatomy, their FRONT poses, and their left-to-right top-to-bottom order in the same FOUR columns by THREE rows. Keep the transparent canvas and square cells. Completely redraw the pixel construction at much lower logical resolution: the intended canvas is exactly 320x240 logical pixels, each cell80x80. Render this as a nearest-neighbor enlarged1280x960 atlas. ALL marks must align to chunky uniform logical square pixels. Each step of a one-logical-pixel contour should be visibly4x4 physical pixels. Individual tiny texture flecks and smooth illustrated color variation must be removed.
TARGET: classic hand-placed DS-era 80x80 battle sprites. A sprite should look like carefully arranged chunky colored squares with deliberate staircase edges. Flat solid color clusters only. A thick visually clear 1-logical-pixel dark colored outer outline, not black. Restrict EACH individual creature to16 solid opaque colors, with just3 cel colors per material, lit from top-left. No gradients or highlights with soft transitions, NO antialias, NO texture noise, NO tiny subpixel linework, NO dither, NO glow, NO soft shading, NO smooth illustrations. The golden lamp and lantern forms use hard ivory highlight clusters only.
Retain all twelve recognizable concepts: wicker ember sphere with four firewood legs; festival-paper moth; cream/teal folded ribbon bird with forked knot tail; diamond ceramic weather kite with copper chimes; warm stone cairn ox with branch antlers and moss; terracotta rooted tablet carrier with green crest; stout blue stream ungulate with single hollow crescent horn and dorsal fins; wooden bucket frame holding turquoise water-bead face with rope limbs; violet badger under brass bell armor; midnight ink drop with two ivory quill limbs and asymmetric tail; stocky cream four-legged golden bell-maned lantern-tail guardian; walking ivory scroll bundle with golden angular hovering lamp head.
Keep each whole creature centered in its own square cell with transparent gaps, about65–85% cell occupancy. No text, labels, shadows, grid lines, ground, borders, extra characters, or checkerboard. Only fully OPAQUE sprite colors on fully TRANSPARENT surrounding canvas.


## front-atlas-prompt.txt

Use case: stylized-concept
Asset type: production monster-game sprite atlas, FRONT battle view, transparent PNG.

Create exactly ONE landscape transparent atlas containing exactly twelve completely ORIGINAL creature sprites, in exactly four equal-width columns and three equal-height rows. There are no existing Pokémon or copied franchise characters. The art language is the crisp 80x80 battle-sprite craft of DS-era Generation 4–5: actual carefully placed logical pixels, readable compact silhouettes, expressive anatomy, controlled colored outlines, and solid cel clusters. This is true pixel art, never a smooth illustration with a pixel filter.

CANVAS AND PIXEL GRID:
The atlas logical canvas is exactly 320 pixels wide by 240 pixels high, split into twelve equal square 80x80 cells in a 4-column by 3-row grid. Draw every sprite directly on the 80x80 logical grid. Return the atlas nearest-neighbor enlarged by exactly four to a 1280x960 PNG: each one logical pixel is one uniform sharp 4x4 block, never a smaller decorative dot or antialiasing. Cell boundaries are x=0,320,640,960,1280 and y=0,320,640,960 in the enlarged image. Center one creature within each cell, occupying 60–90% of both appropriate silhouette dimensions; leave generous genuinely transparent air all around each sprite so nothing crosses its cell. Every cell is exactly square; no gutters outside cells, no legends, no labels, no numbers, no frames or visible grid. Exactly twelve creatures and no extra thumbnails or alternate views.

PIXEL CRAFT:
Use a one-logical-pixel thick colored dark outline, such as dark plum, dark teal, or warm dark brown rather than pure black. Construct contours from deliberate hard pixel steps and shapes. Every material uses three or four solid cel tones, lit from top-left, with opaque hard-edged highlights. Limit each creature to about 12–20 visible colors. Clean readable 1x pixel details rather than isolated noise. No gradients, no glow, no soft shading, no antialiasing, no smooth edges, no dithering, no drop shadows, no ground shadows, no sparkles outside the creature, no background color, no checkerboard drawn into the image, no semi-transparent pixels. Only fully opaque painted pixels and fully transparent surrounding canvas.

FRONT VIEW:
Each creature is shown completely, battle-ready in a lively three-quarter pose facing the viewer and slightly toward the viewer's LEFT, so anatomy and face read clearly. Keep each silhouette distinct. Cute, determined, imaginative monster-game personality; compact sturdy shapes and expressive eyes. These are original monster designs, not Pokémon likenesses.

CELL ORDER, left-to-right, top-to-bottom, MUST remain exactly this:
Row 1, column 1: N01 Coalspindle, Fire. A soot-and-wicker ROUND ember creature on FOUR visibly jointed firewood legs, small charcoal spikes, a dark woven round body, orange ember CRACKS as opaque pixel shapes, cute determined eyes. No open flames or glow.
Row 1, column 2: N02 Hearthmoth, Fire. A folded festival-PAPER moth with ember-patterned BROAD RUSSET and CREAM wings that suggest wish papers, two expressive antennae and a chunky russet body; paper folds in hard warm cel clusters.
Row 1, column 3: N03 Ribbonrook, Air. An original CHUNKY RIBBON BIRD, cream chest, teal ROAD-SIGN RIBBON wings with angular fold shapes, and a long FORKED KNOT tail. A bird formed from substantial folded ribbons; distinct original anatomy.
Row 1, column 4: N04 Chimekite, Air. A living DIAMOND weather KITE with an expressive CERAMIC face, teal and cream kite panels, a few hanging copper CERAMIC CHIMES on short ribbon tails; compact floating diamond silhouette.
Row 2, column 1: N05 Cairnox, Earth. An OX-shaped moving cairn made of chunky warm STONES, two BRANCH antlers, small moss patches, FOUR chunky stone hooves; squat broad shoulders and a clear ox snout.
Row 2, column 2: N06 Rootwrit, Earth. A ROOT-BOUND TERRACOTTA clay humanoid carrying two LEAF-SHAPED TABLETS, chunky root arms and feet, a sage-green leafy crest; warm clay mask face and readable tablet silhouette.
Row 2, column 3: N07 Rillhorn, Water. An original STOUT stream UNGULATE with a deep-blue body, exactly ONE sweeping hollow CRESCENT HORN, stepping-stone HOOVES, and flowing dorsal fins. Blue stream beast, never a unicorn clone; horn is clearly a single thick crescent.
Row 2, column 4: N08 Wellwisp, Water. A WALKING WOODEN ROPE BUCKET FRAME with a large SUSPENDED TURQUOISE WATER BEAD face INSIDE, bucket hoops and rope limbs. Wooden side beams and visible turquoise bead, short rope legs, not a generic ghost.
Row 3, column 1: N09 Knellbadger, Dark. A SQUAT dark-violet/slate BURROWING BADGER with a silent BRASS BELL-SHAPED armored CARAPACE over its back, sturdy DIGGING foreclaws, and a distinct BADGER facial mask. Animal face beneath chunky bell armor.
Row 3, column 2: N10 Duskquill, Dark. A FLOATING MIDNIGHT-PLUM INK-DROP body with TWO large IVORY QUILL LIMBS, one held higher than the other, and an INK TAIL. Expressive tiny eyes; deliberate asymmetry. Clearly ink drop and quills, not a bird or bat.
Row 3, column 3: N11 Bellmane, Light. A STOCKY FOUR-LEGGED original LANTERN GUARDIAN with a golden BELL/RIBBON MANE, cream body, SQUARE PAWS, and a LANTERN TAIL. Warm gold solid highlights, no literal glow, no fire, no existing lion-monster likeness.
Row 3, column 4: N12 Glimmerscribe, Light. A WALKING BUNDLE of IVORY SCROLLS with short SCROLL LEGS, ROLLED PARCHMENT ARMS, and a HOVERING ANGULAR GOLDEN LAMP HEAD. Hard opaque highlight shapes convey magical glass; no glow or translucent alpha.

No text or labels anywhere. All twelve fully visible. Consistent pixel size and drawing craft across all cells.


## icon-atlas-miniature-prompt.txt

Use case: stylized-concept
Asset type: TINY 32x32 sprite menu icons, transparent atlas.
Input image1 gives12original creature DESIGNS AND COLORS ONLY. Do NOT reproduce its large battle drawings. Completely REDRAW all12 as NEW LOW-DETAIL miniature pixel icons, with tiny compact bodies, enlarged essential silhouette features and only enough pixels for identification. The icons should resemble32x32 hand-drawn DS-era party-menu sprites: chunky square pixel shapes, miniature chibi proportions, huge readable key features, simple eyes. A whole creature is only24–26colored squares across, built directly on32x32logical grid. This is not detailed front battle artwork shrunk down.
EXACT layout4columns×3rows,12equal SQUARE cells. Logical total128x96, each32x32. Export8xnearest-neighbor enlarged1024x768. Each logical pixel clearly one BIG8x8uniform square; edges deliberate staircase. Max26x26logical bounding box for all tails/horns/wings/feet.3pxtransparent margins at all4cell edges. Center each icon with generous gaps. Return ONLY the12tiny full-body icons, no battle sprites, extra thumbnails, text, labels, grid, border, shadows or checkerboard.
Each icon:12solid opaque colors only. Colored dark one-pixel outline (no black).2–3solid cel tones per material, top-left light. Iris/pupil1pixel, eye2px. NO gradients, texture lines, noise, glow, antialiasing, smooth edges, dither, soft shading, translucent colors, or ground shadow. ALL SPRITE COLORS FULLY OPAQUE, ALL SURROUND TRANSPARENT.
Roster left-to-right/top-to-bottom:
1: round charcoal/wicker ember orb, orange cracks, four little jointed firewood legs, short charcoal spikes, angry-cute orange eyes.
2: tiny chunky russet paper moth, oversized cream/russet patterned folded wings, two antennae.
3: chunky teal ribbon bird with cream chest, big angular ribbon wing and forked knotted ribbon tail.
4: teal/cream diamond ceramic-face kite, three stubby gold/copper chime tails.
5: squat warm stone ox cairn, chunky branch antlers, green moss and four stone feet.
6: small terracotta humanoid with green leafy crest, stout root feet, two large leaf-shaped tablets.
7: small stout blue ungulate, one OVERSIZED single sweeping pale hollow crescent horn, stone hooves, dorsal fin.
8: tiny wooden bucket frame with giant turquoise water-bead face inside, rope limbs.
9: tiny squat violet badger with ivory mask, chunky brass bell armored shell, two big digging claws.
10: tiny floating midnight-plum ink-drop with two oversized ivory quill limbs, tiny eyes, ink tail.
11: tiny stocky cream lantern guardian, four square paws, large golden bell/ribbon mane and short lantern tail.
12: tiny ivory scroll bundle with short roll legs/arms and oversized hovering angular golden lamp head, solid highlights only.
Keep exact order and design identity from reference; ORIGINAL designs only, never existing Pokémon.


## icon-atlas-prompt.txt

Use case: stylized-concept
Asset type: production monster-game 32x32 menu-icon atlas, transparent PNG.
Input image1 is the DESIGN AND COLOR REFERENCE for the twelve ORIGINAL creatures. Draw12 NEW simplified menu icons of those same creatures, not shrunken detailed battle sprites. Preserve their distinctive silhouettes, colors and key anatomy. Use cute compact full-body miniature poses with clearly readable defining features.

LAYOUT: Exactly FOURcolumns by THREErows;12 equal SQUARE cells; exact left-to-right top-to-bottom order of image1. Logical canvas128x96pixels split into32x32 cells. Draw directly on32x32 logical pixels, then nearest-neighbor enlarge exactly8x to1024x768. Each logical pixel must be a crisp uniform8x8block; no tiny finer dots. Each icon occupies roughly24–28logical pixels, centered with2–4px transparent space at each edge. No visible grid, gutters, frame, labels, text, numbers, shadows, background color, checkerboard, or extra creatures.

STYLE: TRUE DS-era monster-game pixel menu icons: chunky low-detail pixel clusters, clear stepped edges, one-logical-pixel dark COLORED outline, never pure black. Limited12–16solid colors per icon; three flat cel tones per material, top-left light. Strong readable features over ornamental detail. No gradients, antialiasing, smooth edges, soft shading, glow, semi-transparent pixels, dither, tiny noise or ground shadows. Fully opaque painted pixels on fully transparent canvas.

ORDER:
Row1 col1 N01 Coalspindle: small ROUND dark wicker ember body with cute eyes, charcoal spikes, orange cracks, FOURjointed firewood legs.
Row1 col2 N02 Hearthmoth: chunky russet PAPER MOTH with broad cream/russet folded wish-paper wings, orange ember-pattern clusters and antennae.
Row1 col3 N03 Ribbonrook: chunky cream/TEAL ribbon bird, angular folded RIBBON WINGS and unmistakable FORKED KNOT TAIL.
Row1 col4 N04 Chimekite: expressive cream-faced TEAL DIAMOND weather kite with3little copper ceramic CHIMES on short tails.
Row2 col1 N05 Cairnox: warm STONE ox with TWO BRANCH ANTLERS, moss, FOURchunky stone hooves.
Row2 col2 N06 Rootwrit: terracotta ROOT HUMANOID with sage LEAF CREST, root feet and arms,2leaf-shaped clay TABLETS.
Row2 col3 N07 Rillhorn: stout deep-BLUE stream ungulate with exactly ONE sweeping pale hollow CRESCENT HORN, stone hooves, blue dorsal fins.
Row2 col4 N08 Wellwisp: wooden ROPE BUCKET FRAME with large TURQUOISE WATER-BEAD face inside, bucket hoops and rope limbs.
Row3 col1 N09 Knellbadger: squat VIOLET/slate badger, ivory facial mask and big digging claws under a BRASS BELL armored carapace.
Row3 col2 N10 Duskquill: asymmetric floating MIDNIGHT-PLUM INK DROP with tiny ivory eyes, TWOlarge IVORY QUILL arms and curling ink tail.
Row3 col3 N11 Bellmane: stocky CREAM FOUR-LEGGED guardian with GOLDEN BELL/RIBBON MANE, square paws and lantern-tail; no glow.
Row3 col4 N12 Glimmerscribe: IVORY walking SCROLL BUNDLE with rolled parchment arms, scroll legs and angular GOLDEN LAMP HEAD; no glow.

Ensure ALL12 icons with equal square cells and a uniform pixel grid. Original creatures only, no existing Pokémon.

RIGOROUS CONTAINMENT: Whole icons including all tail tips and antennae must remain within their own32x32cells, with at least3transparent logical pixels at each of all4cell boundaries. Simplify iris/pupil details to1–2logical pixels. Never overflow a cell.

