# Character Portrait Images

The month-end review screen displays character portraits in an arcade confrontation style (inspired by Punch-Out and Street Fighter).

## Required Images

### Ultimate Boss Portrait
- **File**: `data/sprites/ultimate-boss.png`
- **Size**: Up to 280x280px (will be scaled to fit)
- **Style**: Pixel art or stylized portrait, facing right or forward
- **Character**: The investor/boss character who gives Fordy the mission
- **Suggested style**: Authoritative, intimidating, business executive

### Fordy Fortizen Portrait
- **File**: `data/sprites/fordy.png`
- **Size**: Up to 280x280px (will be scaled to fit)
- **Style**: Pixel art or stylized portrait, facing left or forward
- **Character**: The player character (Fortis Studios CEO)
- **Suggested style**: Determined, stressed, game developer

## Creating Character Portraits

### Option 1: AI Image Generation
Use tools like:
- **Midjourney**: "pixel art portrait of stern business executive, 8-bit style, arcade game character"
- **DALL-E**: "retro 1980s video game character portrait, pixel art style"
- **Stable Diffusion**: "arcade fighting game character portrait, 16-bit pixel art"

### Option 2: Pixel Art Tools
- **Piskel** (piskelapp.com) - Free browser-based pixel art editor
- **Aseprite** - Professional pixel art tool
- **Lospec Pixel Editor** - Free online tool

### Option 3: Style Transfer
- Take a photo and convert to pixel art using tools like:
  - Pixel It (giventofly.github.io/pixelit)
  - Pixelator apps
  - Photoshop pixel art filters

## Installation

1. Create your character portrait images
2. Save them as PNG files
3. Place in `data/sprites/` folder:
   - `ultimate-boss.png`
   - `fordy.png`
4. Refresh the game - portraits will appear on month-end review screens

## Fallback Behavior

If images aren't found, the game displays emoji placeholders:
- Ultimate Boss: 👔 (necktie)
- Fordy: 🎮 (game controller)

The game works fine without custom portraits, but they add significant arcade authenticity!

## Example Prompts for AI Generation

**Ultimate Boss:**
"pixel art portrait, stern corporate executive with grey hair, suit and tie, intimidating expression, 1980s arcade game style, high contrast colors, facing forward, 280x280 pixels"

**Fordy Fortizen:**
"pixel art portrait, young stressed game developer, casual clothes, determined expression, 1980s arcade game style, high contrast colors, facing forward, 280x280 pixels"
