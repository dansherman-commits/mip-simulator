# Architecture Map

## Key files

- `app/index.html`: Vite entry HTML.
- `app/src/main.tsx`: React entry point.
- `app/src/App.tsx`: Main game UI with all screens (intro, selection, gameplay, end).
- `app/src/styles.css`: 8-bit arcade theme, CRT effects, viewport management.
- `app/src/data/loadData.ts`: CSV loading + validation.
- `app/src/engine/gameState.ts`: Game state management (reducer, actions, helpers).
- `data/config.csv`: Global tunables.
- `data/projects.csv`: 26 game projects with dev costs, time to market, ROAS values.

## Data flow

- CSVs in `data/` are loaded at runtime via `loadData.ts` (Vite `publicDir` points to `../data`). See DATA.md for CSV schemas.
- Game state lives in React state (context/reducer pattern when complexity warrants it).

## Where to change things

- **Game screens** (intro, selection, gameplay, end): `app/src/App.tsx`
- **Game rules and state logic**: `app/src/engine/gameState.ts`
- **Visual theme** (colors, CRT effects, fonts): `app/src/styles.css`
- **Project data** (costs, time to market, ROAS): `data/projects.csv`
- **Budget values, win threshold**: Edit constants in `app/src/engine/gameState.ts` (`initialState`)
- **Month duration**: Change timeout value in `GameplayScreen` (currently 60000ms = 1 minute)
- **New CSVs**: Add to `data/`, create loader in `loadData.ts`, document in DATA.md
