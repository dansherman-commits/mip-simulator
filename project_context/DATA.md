# Data Reference

All CSVs live in `data/` and are loaded at runtime. Values are read as strings and parsed to numbers where expected.

## data/config.csv

- Schema: `key,value`
- Meaning: global tunables.
- Example rows:
  - `app_name,Dan Sherman's MIP Simulator`

## data/projects.csv

- Schema: `name,dev_cost_per_month,time_to_market,roas,icon`
- Meaning: 24 game projects (NATO phonetic alphabet names) available for selection.
- Columns:
  - `name` (string): Project name (Alfa, Bravo, Charlie, etc.)
  - `dev_cost_per_month` (number): Monthly development cost in millions of dollars
  - `time_to_market` (number): Months until game launches (1-12)
  - `roas` (number): Return on Ad Spend multiplier (hidden from player until launch)
  - `icon` (string): Single emoji/unicode character OR path to image file (e.g., "sprites/mike.png")
- Constraints:
  - Exactly 24 rows (Alfa through Xray)
  - `dev_cost_per_month` > 0
  - `time_to_market` between 1 and 12
  - `roas` > 0
  - `icon` can be either:
    - A single emoji character (e.g., 👾, 🚀, 🎮)
    - An image path starting with "sprites/" (e.g., "sprites/mike.png")

## Audio files

### data/gameplay-music.mp3

- Optional background music file that plays during gameplay
- Format: MP3 audio
- Should loop seamlessly (set to loop automatically in code)
- Recommended: 30-60 second retro/chiptune track
- If missing: game plays silently (no error, just a 404 in console)
- See `data/AUDIO_README.md` for sources and instructions

## Validation rules

- When adding a new CSV, document its schema and constraints in this file.
- Use fail-fast validation in `loadData.ts` — missing required columns should throw on load, not fail silently at runtime.
