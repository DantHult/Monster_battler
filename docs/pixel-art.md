# Pixel artwork — pixel-v1

All creatures are original Lantern Marches designs. The visual brief uses handheld-era battle sprites as a style reference; no existing creature designs or names are copied.

| Asset | Native grid | Files |
| --- | --- | --- |
| Front views | 80×80 | `public/sprites/N01/front.png` through `N12/front.png` |
| Distinct rear views | 80×80 | `public/sprites/N01/back.png` through `N12/back.png` |
| Menu icons | 32×32 | `public/sprites/N01/icon.png` through `N12/icon.png` |
| Front/back atlases | 320×240 | `public/sprites/front-atlas.png`, `back-atlas.png` |
| Icon atlas | 128×96 | `public/sprites/icon-atlas.png` |
| Grass battlefield with two ground ellipses | 256×144 | `public/battle/background.png` |
| Narrow battlefield | 176×144 | `public/battle/background-mobile.png` |
| Frame coordinates, file paths, palettes and pivots | JSON | `public/sprites/manifest.json` |

Each creature has one authored 15–19-color palette shared by its front, back and icon. The material ramps in `art/palettes.json` use three or four cel tones. Every silhouette boundary uses its creature's dark colored outline. Sprite pixels have alpha 0 or 255; there are no partially transparent edge pixels, pure-black outlines, gradients, smooth shading or dithering. Main silhouettes occupy 72 pixels on their longest dimension; icons occupy 28. Lighting comes from the upper left.

The player's active uses its back drawing. The opponent uses its front drawing. Offers and inspection use front drawings; team controls use the 32×32 icons. CSS uses `image-rendering: pixelated` and whole-number scales: 3× or 4× on large battle surfaces, 2× on smaller surfaces, and 1× on very compact screens. No sprite transforms, filters, drop shadows, or smooth scaling are applied. This release is static; the manifest records `animation: false`.

## Production and reproducibility

The built-in image generation tool created the creature drawings, separate rear anatomy, simplified icon drawings, and battlefield. Original design drafts are preserved in `art/source/`; full prompts are in `art/prompts.md`. These drafts are larger than the shipped grids and contain incidental partial alpha. They are source artwork, not display assets.

`prepare-pixel-assets.mjs` extracts each creature, removes neighboring-row fragments, fits it to the native grid using nearest-neighbor point samples, applies its authored palette without dithering, sets hard transparency and a one-pixel colored boundary, then writes PNGs and the manifest. It also prepares the low-resolution landscape, flattens incidental sky variations and limits that background to 24 colors. The narrow landscape uses nearest-neighbor sampling; creature proportions are unchanged.

With Node and ImageMagick installed, run from the project directory:

```sh
node scripts/prepare-pixel-assets.mjs art/source
node scripts/verify-pixel-assets.mjs
```

The validator checks all 36 individual images: dimensions, binary alpha, palette membership and limits, colored silhouette boundaries, transparent margins, silhouette size, distinct back drawings, exact atlas frames, and battlefield dimensions/colors. Visual inspection additionally checks the rear anatomy and readability of the sprites in battle.

To change creature colors, edit `art/palettes.json` and run both commands. Battlefield colors use `art/battlefield-colors.json`: the current `gray-v1` palette changes the sky, distant hills and blue conifers to dark gray while retaining the terrain and platforms pixel for pixel. To redraw a creature, edit the source front/back/icon cell while keeping the atlas order and margins, then regenerate. The manifest's pivot is the bottom-center placement anchor in native pixels. Art changes do not alter the immutable rules/content version or existing matches.

`public/downloads/lantern-marches-pixel-assets.zip` contains the individual PNGs, atlases, battlefield layers, manifest, palettes, prompts and these notes. The source drafts remain in the source repository.
