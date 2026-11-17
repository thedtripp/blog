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

## Batch 2 (self-contained: one copy and paste per image, attach smug.jpg each time)

### wince (file: `wince.jpg`) - outage and incident posts
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: a sharp wince, teeth gritted and visible, lips pulled back, eyes squeezed partly shut, head pulling slightly back and to one side as if watching something painful happen. The "ooh, that's going to hurt" face. No hands visible.
```

### lightbulb (file: `lightbulb.jpg`) - root-cause posts
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: eyes wide and bright, eyebrows raised, a sudden delighted "aha" half-smile, looking at the camera. One index finger raised straight up beside his head at about eye level, finger clearly in focus and not covering his face. Pulled back a little so the raised hand is fully in frame. The look of having just figured out the root cause. No lightbulb graphic and no drawn elements.
```

### nervous_sweat (file: `nervous_sweat.jpg`) - "it's probably fine", risky but shipped
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: a tight, forced smile with teeth slightly showing, eyes wide and looking straight into the camera, eyebrows raised and slightly knitted, a visible bead or two of sweat on his forehead and temple. Shoulders tense and slightly raised. The "it's probably fine" look. No hands visible.
```

### coffee_sip (file: `coffee_sip.jpg`) - "boring is good" posts
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: calm and relaxed, eyes looking at the camera over the rim of a plain white ceramic coffee mug held in one hand near his chin, mid-sip, eyebrows slightly raised in quiet satisfaction. Pulled back a little so the mug and hand are fully in frame. The mug has no text and no logo. Steam is optional and subtle.
```

### typing (file: `typing.jpg`) - a fix in progress
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: intensely focused, brow furrowed, eyes looking down and slightly off-camera toward a screen that is out of frame, lips pressed together, leaning slightly forward with shoulders hunched. Both hands visible at the bottom of the frame with fingers poised over a plain black laptop keyboard, mid-typing. Pulled back enough to show the hands and keyboard. The laptop screen is not visible and the laptop has no logo.
```

### pointing (file: `pointing.jpg`) - "pay attention to this"
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: serious and direct, eyes locked on the camera, eyebrows slightly lowered. One arm extended toward the camera with the index finger pointing straight at the viewer, the hand large in the foreground and in sharp focus, other fingers curled. Slight wide-angle perspective. The "pay attention to this" look. His face stays clearly visible and in focus.
```

### hand_up (file: `hand_up.jpg`) - "don't do this"
```
Use the attached photo as the reference for this person. Keep the exact same man: same face, skin tone, bald head, face shape and proportions. Same clothing: light blue dress shirt with a navy tie with small white stars. Photorealistic studio portrait, head and shoulders, centered, square 1:1 framing with the head filling about 60% of the frame, plain light grey seamless background, soft even studio lighting, sharp focus on the face, natural skin texture. No text, no logos, no watermark, no extra people. Only change the expression and pose as described below. Hands, if visible, must be anatomically correct with five fingers. Expression and pose: serious and firm, eyes on the camera, brow slightly furrowed, lips pressed together. One hand raised in front of him with the palm facing the camera and fingers together and extended, a clear "stop" gesture at about chest to shoulder height, not covering his face. Pulled back a little so the hand is fully in frame. The "don't do this" look.
```
