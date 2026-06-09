# Shooter Transpose Agent Instructions

## Goal

Create shooter sprites from the images in:

`assets/images/shooters/webp/to-go/`

Use this exact template image for pose, canvas, proportions, body scale, stick length, blade anchor, and shooting geometry:

`assets/images/shooters/webp/template/b47af213-b35b-4df2-bd88-1c8cb285acf3.transparent.png`

Final transparent WebP outputs must be written to:

`assets/images/shooters/webp/with-number/`

Use the `$imagegen` skill/tool for the image generation step:

`C:\Users\ryand\.codex\skills\.system\imagegen\SKILL.md`

Follow that skill's workflow for generation. Use the built-in image generation path by default, with the template image and one selected `to-go` image supplied as image references for each generation.

## Critical Requirement

Process one image at a time from `to-go`.

For each input image, use the prompt language to TRANSPOSE the character from that input image onto the template shooter image. Do not merely use the input image as style inspiration. The output must have the same canvas, pose, bear body proportions, stick length, stick shaft angle, blade anchor point, body scale, and shooting silhouette as the template image.

The generated image must be rendered on a flat fuchsia chroma-key background, then converted to a transparent WebP. Every generated jersey must have a unique, readable number and the team name on the upper back, matching the template jersey layout.

## Source Images

- Template pose/proportions image:
  `assets/images/shooters/webp/template/b47af213-b35b-4df2-bd88-1c8cb285acf3.transparent.png`
- Character/team input images:
  `assets/images/shooters/webp/to-go/`
- Final outputs:
  `assets/images/shooters/webp/with-number/`

## Jersey Numbers

Every generated shooter must have a large, readable jersey number on the upper back. The number must be unique across this generated batch and must not be reused for another `to-go` team image.

Use these numbers:

- `halifax-narwhals`: `37`
- `las-vegas-raccoons`: `88`
- `minnesota-pines`: `19`
- `montreal-beavers`: `42`
- `portland-stormwings`: `71`

The number should match the jersey style and colors, but it must remain clearly legible from the rear-view shooting pose.

## Jersey Team Names

Every generated shooter must also include the team name on the upper back of the jersey, above or integrated with the number in the same way the template image includes jersey text.

Use these exact team-name strings:

- `halifax-narwhals`: `NARWHALS`
- `las-vegas-raccoons`: `RACCOONS`
- `minnesota-pines`: `PINES`
- `montreal-beavers`: `BEAVERS`
- `portland-stormwings`: `STORMWINGS`

The team name must be readable and must not replace the number.

## Template Proportion Lock

The template bear and its hockey stick are the strict geometry target. The generated character may use a different mascot identity, jersey, colors, logo, fur/feather details, and equipment styling, but the final sprite must copy the bear template's overall silhouette and shooting geometry:

- same body height and body mass on the canvas
- same shoulder, torso, hip, leg, skate, and glove placement
- same full-body rear-view stance
- same hockey stick length and shaft angle
- same stick hand contact point
- same blade endpoint and blade orientation
- same amount of canvas padding around the character and stick

Do not enlarge the character body compared with the bear. Do not shorten, detach, bend, or re-anchor the stick. Do not let mascot features change the template scale or stick geometry.

## Per-Image Workflow

1. Pick exactly one source image from `assets/images/shooters/webp/to-go/`.
2. Use the template image as the pose/proportion target.
3. Use the `$imagegen` skill/tool to generate a new shooter image with:
   - 1254x1254 square canvas
   - the same rear shooting pose as the template
   - the same stick angle, hand contact point, blade anchor, and blade endpoint as the template bear
   - the same bear-template body scale and full-width stick composition
   - the character/team identity from the selected `to-go` image
   - the unique jersey number assigned to that team in the Jersey Numbers section
   - the exact team-name string assigned to that team in the Jersey Team Names section
   - no puck
   - no shadow
   - no floor
   - no extra text beyond any requested jersey number/details
   - perfectly flat fuchsia chroma background: `#ff00ff`
4. Save the generated chroma image as an intermediate source if useful.
5. Remove the fuchsia chroma background and preserve alpha.
6. Export the final transparent WebP into `assets/images/shooters/webp/with-number/`.
7. Validate that the output matches the template proportions before moving to the next image.

## Prompt Template

Use this structure for every image. Replace bracketed values.

```text
Use the first image as the exact shooter template for pose, canvas, bear body proportions, body scale, stick length, stick shaft angle, stick hand contact point, stick blade anchor, stick blade endpoint, and shooting geometry.

Use the second image as the character/team identity reference.

TRANSPOSE the character from the second image onto the shooter template from the first image.

Create a 1254x1254 square fantasy hockey shooter sprite on a perfectly flat solid #ff00ff fuchsia chroma-key background.

The output must match the template bear image's composition precisely:
- rear-view shooting pose from behind
- full body visible
- skates near the bottom
- player body scaled exactly like the bear template, not larger or smaller
- shoulders, torso, hips, legs, skates, gloves, and head placed like the bear template
- hockey stick shaft extending diagonally across the image at the same angle as the bear template
- stick hand contact point matching the bear template
- stick blade reaching and anchoring in the same lower-right area as the bear template
- player plus full stick fills the image width like the bear template

Use the mascot, jersey colors, logo style, and team identity from the character/team reference image.
Add the assigned unique jersey number for this team on the upper back of the jersey. The number must be large, readable, and integrated into the jersey design: [ASSIGNED_NUMBER].
Add the assigned team name on the upper back of the jersey in the same layout style as the template image: [ASSIGNED_TEAM_NAME].

No puck anywhere.
No cropping.
No cast shadow.
No contact shadow.
No floor plane.
No watermark.
No extra text except the assigned jersey number and assigned team name.

The background must be one uniform #ff00ff color with no gradients, texture, lighting variation, or edge glow.
Do not use #ff00ff anywhere in the character, jersey, equipment, outlines, highlights, or reflections.
```

## Chroma Removal With ImageMagick

Use fuchsia as the key:

`#ff00ff`

Recommended command:

```powershell
magick input-green-screen.png `
  -alpha set `
  -fuzz 24% `
  -transparent "#ff00ff" `
  -channel A -morphology Open Disk:1 +channel `
  output.transparent.png
```

Then convert to WebP while preserving the 1254x1254 canvas and alpha:

```powershell
magick output.transparent.png `
  -alpha set `
  -strip `
  -depth 8 `
  -define webp:lossless=false `
  -define webp:method=6 `
  -define webp:alpha-quality=90 `
  -quality 82 `
  assets/images/shooters/webp/with-number/[team-slug]-shooter.transparent.webp
```

## Validation Checklist

Before accepting each output, verify:

- Output is `1254x1254`.
- Output has alpha: `srgba`.
- Canvas corners are transparent alpha zero.
- No fuchsia pixels remain around the character or stick blade.
- No puck exists anywhere in the image.
- The assigned jersey number is present, readable, and unique within the batch.
- The assigned team name is present and readable on the jersey.
- Stick blade reaches the same lower-right region as the bear template.
- Character and stick fill the image width like the bear template.
- Body is not zoomed larger than the bear template.
- Body is not scaled so small that the stick looks detached or undersized.
- Stick length, shaft angle, hand contact point, blade anchor, and blade endpoint match the bear template.
- The source team/character identity from the `to-go` image is recognizable.

Useful checks:

```powershell
magick identify -format "%f %wx%h %[channels] %[size]\n" assets/images/shooters/webp/with-number/[team-slug]-shooter.transparent.webp
magick assets/images/shooters/webp/with-number/[team-slug]-shooter.transparent.webp -format "corner %[pixel:p{0,0}]\n" info:
```

Expected corner result:

```text
corner srgba(0,0,0,0)
```

## Output Naming

Use the input team slug and this suffix:

`[team-slug]-shooter.transparent.webp`

Write every final WebP to:

`assets/images/shooters/webp/with-number/`

Examples:

- `halifax-narwhals-shooter.transparent.webp`
- `las-vegas-raccoons-shooter.transparent.webp`
- `minnesota-pines-shooter.transparent.webp`

Do not overwrite unrelated existing shooter files unless the corresponding input image is for that same team.

## Important Failure Conditions

Reject and regenerate if:

- the output is a front-view player instead of rear-view
- the stick is short or the blade does not reach the lower-right area
- the player does not fill the width with the stick like the bear template
- a puck appears
- the assigned jersey number is missing, unreadable, wrong, or duplicated from another generated team
- the assigned team name is missing, unreadable, wrong, or replaced by generic text
- the body scale is visibly different from the bear template
- the stick length, shaft angle, hand contact point, blade anchor, or blade endpoint differs from the bear template
- the chroma background has gradients or shadows
- the transparent conversion leaves fuchsia artifacts around edges
