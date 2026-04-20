import { Dispatch } from "react";

// ── Types ────────────────────────────────────────────────

export interface Project {
  name: string;
  dev_cost_per_month: number;
  time_to_market: number;
  roas: number;
  icon: string;
}

export interface LaneProject {
  project: Project;
  monthsInDevelopment: number;
  launched: boolean;
  monthlyAdSpend: number;
}

export type GamePhase = "intro" | "selection" | "playing" | "ended";
export type EndReason = "dev_budget_depleted" | "ad_budget_depleted" | "december_ended" | null;

export interface GameState {
  // Master data
  allProjects: Project[];

  // Game phase
  phase: GamePhase;
  endReason: EndReason;

  // Lanes (8 design lanes, null = empty)
  lanes: (LaneProject | null)[];

  // Time
  currentMonth: number; // 1-12

  // Budgets (in millions)
  devBudgetTotal: number;
  devBudgetUsed: number;
  adBudgetTotal: number;
  adBudgetUsed: number;

  // Revenue (in millions)
  totalRevenue: number;
}

export const initialState: GameState = {
  allProjects: [],
  phase: "intro",
  endReason: null,
  lanes: [null, null, null, null, null, null, null, null],
  currentMonth: 1,
  devBudgetTotal: 100,
  devBudgetUsed: 0,
  adBudgetTotal: 60,
  adBudgetUsed: 0,
  totalRevenue: 0,
};

// ── Actions ──────────────────────────────────────────────

export type GameAction =
  | { type: "LOAD_PROJECTS"; projects: Project[] }
  | { type: "START_SELECTION" }
  | { type: "SELECT_PROJECT"; laneIndex: number; projectName: string }
  | { type: "REMOVE_PROJECT"; laneIndex: number }
  | { type: "START_GAMEPLAY" }
  | { type: "ADVANCE_MONTH" }
  | { type: "SET_AD_SPEND"; laneIndex: number; monthlyAmount: number }
  | { type: "END_GAME"; reason: EndReason };

// ── Reducer ──────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_PROJECTS":
      return { ...state, allProjects: action.projects };

    case "START_SELECTION":
      return { ...state, phase: "selection" };

    case "SELECT_PROJECT": {
      const { laneIndex, projectName } = action;
      const project = state.allProjects.find((p) => p.name === projectName);
      if (!project) return state;

      const newLanes = [...state.lanes];
      newLanes[laneIndex] = {
        project,
        monthsInDevelopment: 0,
        launched: false,
        monthlyAdSpend: 0,
      };

      return { ...state, lanes: newLanes };
    }

    case "REMOVE_PROJECT": {
      const newLanes = [...state.lanes];
      newLanes[action.laneIndex] = null;
      return { ...state, lanes: newLanes };
    }

    case "START_GAMEPLAY":
      return { ...state, phase: "playing", currentMonth: 1 };

    case "ADVANCE_MONTH": {
      if (state.phase !== "playing") return state;

      let newState = { ...state };
      const newLanes = [...state.lanes];

      // 1. Advance each project's months in development
      // 2. Check if any reach time_to_market (launch them)
      for (let i = 0; i < newLanes.length; i++) {
        const lane = newLanes[i];
        if (lane) {
          const updatedLane = { ...lane, monthsInDevelopment: lane.monthsInDevelopment + 1 };

          // Check if launched
          if (!updatedLane.launched && updatedLane.monthsInDevelopment >= updatedLane.project.time_to_market) {
            updatedLane.launched = true;
          }

          newLanes[i] = updatedLane;
        }
      }

      newState.lanes = newLanes;

      // 3. Deplete dev budget (all active projects cost per month)
      let monthlyDevCost = 0;
      for (const lane of newLanes) {
        if (lane) {
          monthlyDevCost += lane.project.dev_cost_per_month;
        }
      }
      newState.devBudgetUsed += monthlyDevCost;

      // 4. Generate revenue from launched games with ad spend
      let monthlyAdCost = 0;
      let monthlyRevenue = 0;
      for (const lane of newLanes) {
        if (lane && lane.launched && lane.monthlyAdSpend > 0) {
          monthlyAdCost += lane.monthlyAdSpend;
          monthlyRevenue += lane.monthlyAdSpend * lane.project.roas;
        }
      }
      newState.adBudgetUsed += monthlyAdCost;
      newState.totalRevenue += monthlyRevenue;

      // 5. Advance month
      newState.currentMonth += 1;

      // 6. Check end conditions - only end after December
      if (newState.currentMonth > 12) {
        newState.phase = "ended";
        newState.endReason = "december_ended";
      }

      return newState;
    }

    case "SET_AD_SPEND": {
      const { laneIndex, monthlyAmount } = action;
      const newLanes = [...state.lanes];
      const lane = newLanes[laneIndex];

      if (lane && lane.launched) {
        newLanes[laneIndex] = { ...lane, monthlyAdSpend: monthlyAmount };
      }

      return { ...state, lanes: newLanes };
    }

    case "END_GAME":
      return { ...state, phase: "ended", endReason: action.reason };

    default:
      return state;
  }
}

// ── Helper functions ─────────────────────────────────────

export function getDevBudgetRemaining(state: GameState): number {
  return state.devBudgetTotal - state.devBudgetUsed;
}

export function getAdBudgetRemaining(state: GameState): number {
  return state.adBudgetTotal - state.adBudgetUsed;
}

export function hasWon(state: GameState): boolean {
  return state.totalRevenue >= 20;
}

export function getMonthName(month: number): string {
  const names = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return names[month - 1] || "";
}

export function getNextMonthDevCost(state: GameState): number {
  let totalDevCost = 0;
  for (const lane of state.lanes) {
    if (lane) {
      totalDevCost += lane.project.dev_cost_per_month;
    }
  }
  return totalDevCost;
}

export function getNextMonthAdCost(state: GameState): number {
  let totalAdCost = 0;
  for (const lane of state.lanes) {
    if (lane && lane.launched && lane.monthlyAdSpend > 0) {
      totalAdCost += lane.monthlyAdSpend;
    }
  }
  return totalAdCost;
}

export function canAffordNextMonth(state: GameState): { canAfford: boolean; reason: string | null } {
  const nextDevCost = getNextMonthDevCost(state);
  const nextAdCost = getNextMonthAdCost(state);

  const devBudgetRemaining = getDevBudgetRemaining(state);
  const adBudgetRemaining = getAdBudgetRemaining(state);

  if (nextDevCost > devBudgetRemaining) {
    return {
      canAfford: false,
      reason: `Next month's dev costs ($${nextDevCost.toFixed(1)}M) exceed remaining budget ($${devBudgetRemaining.toFixed(1)}M). Cancel some projects!`
    };
  }

  if (nextAdCost > adBudgetRemaining) {
    return {
      canAfford: false,
      reason: `Next month's ad spend ($${nextAdCost.toFixed(1)}M) exceeds remaining budget ($${adBudgetRemaining.toFixed(1)}M). Reduce ad spending!`
    };
  }

  return { canAfford: true, reason: null };
}
