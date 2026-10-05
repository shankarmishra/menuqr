# HERO V2 VIDEO GENERATION PROMPTS

These are the official prompts designed to be run through a photorealistic AI video generator (e.g., Runway Gen-3 Alpha, Luma Dream Machine, or Sora). 

---

### Video 01: Hero Establishing Shot (Table + Physical QR)
* **Purpose**: The background layer for the left-side of the hero and the wide shot of the restaurant.
* **Prompt**: `Photorealistic premium Indian urban restaurant interior, warm natural afternoon light, elegant wooden dining table, subtle cream linen details, small potted plant, ceramic plates, premium dark green MENUQR QR stand placed naturally on the table, realistic materials, subtle reflections, shallow depth of field, tasteful hospitality photography, cinematic commercial product film, slow controlled camera push-in from table level, realistic lens behavior, natural shadows, physically accurate lighting, sophisticated editorial food-tech advertising aesthetic, no futuristic elements, no neon, no cyberpunk, no floating graphics, no visible text, no fake interface, no distorted QR code, no surreal details, no artificial CGI look, 4K commercial photography`
* **Duration**: 4–6 seconds
* **Aspect Ratio**: 16:9
* **Output Format**: `.mp4` (convert to `.webm` for web)
* **Where Used**: `HeroScene.tsx` base layer.

---

### Video 02: Hand + Phone Scan (Close-up)
* **Purpose**: Simulating the customer interaction. The actual phone UI and QR will be overlaid using React/Framer Motion.
* **Prompt**: `Photorealistic close-up of a young Indian restaurant customer holding a modern premium smartphone above a restaurant table, scanning a physical QR menu stand, realistic human hand and fingers, natural skin texture, realistic smartphone glass reflections, warm restaurant lighting, shallow depth of field, premium hospitality commercial, camera positioned over shoulder, subtle controlled hand movement, focus transitions naturally from QR stand to smartphone camera, believable physical interaction, cinematic but realistic, no visible UI text, no generated QR code, no distorted phone display, no floating holograms, no futuristic effects, no CGI appearance`
* **Duration**: 3–5 seconds
* **Aspect Ratio**: 16:9
* **Output Format**: `.mp4`
* **Where Used**: Masked overlay or transition element in `HeroScanSequence.tsx`.

---

### Video 03: Restaurant Table Atmosphere
* **Purpose**: General subtle hero background or section transition.
* **Prompt**: `Ultra realistic premium restaurant table scene, Indian contemporary cafe aesthetic, warm wood, cream ceramic plates, dark green accents, soft sunlight entering through windows, subtle movement of people blurred in background, realistic food and tableware, cinematic shallow depth of field, gentle handheld commercial camera motion, premium hospitality advertisement, sophisticated and authentic, natural imperfections, no AI look, no text, no logos, no UI, no futuristic effects`
* **Duration**: 4–6 seconds
* **Aspect Ratio**: 16:9
* **Output Format**: `.mp4`
* **Where Used**: Background texture behind the main typography.
