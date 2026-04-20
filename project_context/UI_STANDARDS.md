# UI Standards

Codified visual and interaction patterns for 8-bit arcade UI. `app/src/styles.css` is the source of truth for implementation.

## Core Rule

Maintain 8-bit arcade aesthetic purity:
- No rounded corners
- Sharp, pixelated borders (2-3px solid)
- High-contrast colors from arcade palette
- Monospace/pixel fonts only
- Glow effects for emphasis

If a new pattern is genuinely needed, add it as a reusable CSS class in `styles.css` and document it here.

## Arcade Color Palette

| Variable | Color | Use |
|----------|-------|-----|
| `--text` | #00ff00 (green) | Primary text, borders |
| `--text-muted` | #00aa00 (dark green) | Secondary text |
| `--accent` | #ff00ff (magenta) | Primary actions, highlights |
| `--accent-alt` | #00ffff (cyan) | Alternate highlights |
| `--warn` | #ffff00 (yellow) | Warnings, attention |
| `--danger` | #ff0000 (red) | Errors, critical |
| `--bg` | #0a0a0a (near-black) | Background |
| `--panel` | #1a1a2e (dark blue-gray) | Panel backgrounds |

## Button Hierarchy

| Class | Use | Examples |
|-------|-----|----------|
| `ui-cta` | Primary positive actions | Insert Coin, Start, Continue |
| `ui-button` | Secondary actions and navigation | Back, Info, Options |
| `ui-disabled` | Visually disabled non-interactive state | Locked features |

Rules:

- CTAs have magenta background with green border and shadow
- Buttons transform on click (translate effect)
- All buttons are sharp rectangles (no border-radius)
- Use uppercase text with letter-spacing

## Panel Styles

| Class | Use |
|-------|-----|
| `ui-panel` | Solid themed panels, dialogs, detail cards (sharp borders) |

## Text Effects

| Class | Use |
|-------|-------|
| `arcade-title` | Large glowing titles (48px, animated glow) |
| `pixel-text` | Standard arcade text (bold, uppercase, letter-spaced) |
| `ink-strong` | Primary text color |
| `ink-soft` | Secondary / muted text color |
| `ink-inverse` | Text on bright backgrounds |

## Touch and Pointer Rules

- Click/touch targets should be at least 44px
- Decorative elements use `pointer-events-none`
- Mouse: hover effects enabled
- Touch: active states only (no hover)
- Rapid clicks must not create duplicate actions

## Drag and Drop

- Draggable elements use `cursor: grab` (grabbing when active)
- Drop zones highlight on drag-over (yellow ring)
- Visual feedback: dragged element becomes semi-transparent
- Already-selected items are non-draggable (opacity 30%, cursor not-allowed)
- Instructions shown prominently to explain drag-drop interaction

## Character Confrontation Screens

Inspired by Punch-Out and Street Fighter, used for month-end reviews:

- **Layout**: Two character portraits facing each other with "VS" between them
- **Portrait containers**: 280x280px panels with dark background (#1a1a2e)
- **Character labels**: Below portraits in contrasting colors (boss: magenta, player: cyan)
- **Dialogue box**: Large panel below portraits with character speech
- **Color coding**:
  - Ultimate Boss text: Magenta (#ff00ff)
  - Fordy text: Cyan (#00ffff)
  - Stats: Color changes based on threshold (green = good, yellow = warning, red = danger)
- **Image rendering**: `image-rendering: pixelated` for sharp pixel art
- **Fallback**: Emoji icons if portrait images missing (👔 for boss, 🎮 for player)
