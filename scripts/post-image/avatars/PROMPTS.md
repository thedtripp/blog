# Avatar generation prompts (Gemini)

How to use:
1. Attach an existing avatar as the reference image (use `smug.jpg`) with **every** prompt, so the face stays consistent.
2. Paste the shared block, then the expression block.
3. Save the result, resize to 480x480 JPEG, name it `<expression>.jpg` in this folder.
4. Add the expression to the `imageExpression` enum in `src/content.config.ts` and to the skill's expression guidance.

Style: 480x480 square, head and shoulders, light blue dress shirt, navy tie with white stars, plain light-grey backdrop, soft studio light.

## Shared block (paste first, every time)

```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers.
```

## Batch 1

### 1. thumbs-up (file: `thumbs_up.jpg`) — "this worked", "ship it"
```
Expression and pose: a warm, confident smile, relaxed and genuine, eyes looking straight into the camera, chin slightly raised. One hand raised near his shoulder in a clear thumbs-up, thumb pointing straight up, other fingers curled, hand in focus and not covering his face. Posture upright and self-assured.
```

### 2. relieved (file: `relieved.jpg`) — "the migration went fine"
```
Expression and pose: eyes gently closed, head tilted slightly back, lips pursed in a slow exhale of relief, shoulders dropped and relaxed, a faint soft smile at the corners of the mouth. The look of "that went fine, thank goodness". No hands visible.
```

### 3. proud (file: `proud.jpg`) — benchmark wins
```
Expression and pose: a calm, satisfied closed-mouth smile with a slow approving nod, one eyebrow slightly lifted, looking at the camera. Arms crossed confidently over his chest, forearms and shirt sleeves visible at the bottom of the frame. Pulled back a little so the crossed arms are in frame. Quietly proud, not arrogant.
```

### 4. mind_blown (file: `mind_blown.jpg`) — a surprising number
```
Expression and pose: eyes wide open, eyebrows raised high, mouth slightly open in amazement. Both hands pressed to the sides of his head, fingers spread near the temples, as if his mind is exploding. Pulled back a little so both hands are fully in frame. Looking straight at the camera. Astonished and delighted, not frightened.
```

### 5. fist_pump (file: `fist_pump.jpg`) — a small private win
```
Expression and pose: a big, joyful grin with teeth showing, eyes bright and squint slightly, a quiet "yes!" moment. One fist pulled in close to his chest or shoulder in a small, controlled fist pump, elbow bent. Head tilted slightly, energy contained and private, not a shout.
```

### 6. eyebrow (file: `eyebrow.jpg`) — vendor claims, "really?"
```
Expression and pose: one eyebrow raised high and the other relaxed, lips pressed in a flat, slightly skeptical line, eyes looking straight at the camera with a "really?" look. Head tilted a few degrees to one side. No hands visible.
```

### 7. side_eye (file: `side_eye.jpg`) — "as reported by the vendor"
```
Expression and pose: head turned slightly away, eyes cut sideways toward the edge of the frame, giving a suspicious, doubtful look. Eyebrows slightly lowered, lips pressed together, one corner of the mouth pulled slightly. No hands visible.
```

### 8. squint (file: `squint.jpg`) — reading logs or fine print
```
Expression and pose: leaning in toward the camera, eyes narrowed in a squint, brow furrowed in concentration, lips slightly parted, as if reading tiny text on a screen. Head a little closer to the lens than usual but still fully in frame. A touch of cool screen-glow on the face is optional. No hands visible.
```

Not yet generated: `relieved` (2) and `proud` (3).
