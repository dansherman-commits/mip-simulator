# Dan Sherman's MIP Simulator

An 8-bit arcade game that simulates whether or not Fortis achieves its 2026 Management Incentive Plan goals.

Inspired by 1980s arcade classics like Tapper, all action takes place on a single landscape screen. Players make fast decisions using mouse or touch controls to influence business outcomes in real-time.

## Core gameplay loop

You play as Fordy Fortizen, CEO of Fortis Studios. Ultimate Boss gives you:
- **$100M** development budget
- **$60M** advertising budget  
- **12 months** to generate **$20M** in revenue

**Phase 1: Project Selection**
- Drag games from the available projects grid (24 NATO phonetic alphabet names: Alfa through Xray)
- Drop them onto any of 8 Design Lanes
- Each project shows: icon, development cost per month, time to market (in months)
- ROAS (Return on Ad Spend) is hidden until launch
- Fill at least 1 lane to start gameplay

**Phase 2: Gameplay (12 months)**
- Games progress through 8 horizontal "Design Lanes" (like Tapper's bar lanes)
- Each month (~5 seconds real-time):
  - Development budget depletes based on active projects' monthly costs
  - Games advance toward launch (time to market)
  - **Month-end review**: Game auto-pauses and shows summary
    - Displays budget usage and revenue to date
    - Player decides: make changes or continue to next month
- When a game reaches its time to market:
  - ROAS is revealed
  - Set monthly advertising spend for that game
  - Revenue = Monthly Ad Spend × ROAS
- **Strategic decisions:**
  - Cancel expensive/underperforming projects mid-development
  - Swap in new projects to fill lanes
  - Allocate ad budget to launched games based on their ROAS
  - Balance dev spending vs. revenue generation
  - Review progress each month and adjust strategy

**Budget Management:**
- **No abrupt game overs** - Game continues even if budgets are nearly depleted
- At month-end review, system checks if next month would exceed remaining budgets
- If next month's costs > remaining budget:
  - "Continue" button is disabled
  - Ultimate Boss warns about budget overage
  - Player **must** cancel projects or reduce ad spend before continuing
  - This prevents budget overruns while keeping player in control

**End conditions:**
- Game only ends after **December completes**
- Final score = total revenue generated

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
