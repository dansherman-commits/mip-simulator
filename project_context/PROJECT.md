# Dan Sherman's MIP Simulator

An 8-bit arcade game that simulates whether or not Fortis achieves its 2026 Management Incentive Plan goals.

Inspired by 1980s arcade classics like Tapper, all action takes place on a single landscape screen. Players make fast decisions using mouse or touch controls to influence business outcomes in real-time.

## Core gameplay loop

You play as Fordy Fortizen, CEO of Fortis Studios. Ultimate Boss gives you:
- **$100M** development budget
- **$60M** advertising budget  
- **12 months** to generate **$20M** in revenue

**Phase 1: Project Selection**
- Choose up to 8 game projects from 26 options (NATO phonetic alphabet names)
- Each project shows: development cost per month, time to market (in months)
- ROAS (Return on Ad Spend) is hidden until launch

**Phase 2: Gameplay (12 months)**
- Games progress through 8 horizontal "Design Lanes" (like Tapper's bar lanes)
- Each month (~60 seconds real-time):
  - Development budget depletes based on active projects' monthly costs
  - Games advance toward launch (time to market)
- When a game reaches its time to market:
  - ROAS is revealed
  - Set monthly advertising spend for that game
  - Revenue = Monthly Ad Spend × ROAS
- **Strategic decisions:**
  - Cancel expensive/underperforming projects mid-development
  - Swap in new projects to fill lanes
  - Allocate ad budget to launched games based on their ROAS
  - Balance dev spending vs. revenue generation

**End conditions (whichever comes first):**
- Development budget depleted → Game Over
- Advertising budget depleted → Game Over
- December ends → Final score

**Win:** Total revenue ≥ $20M

## Run locally

```bash
npm install
npm run dev
```

Open the Vite dev server URL (defaults to `http://localhost:5173`).

## Testing

- Save/Load: (describe persistence approach when implemented)
- Resetting: clear site data or use an incognito window.
