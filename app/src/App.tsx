import { useState, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { loadProjects } from "./data/loadData";
import {
  gameReducer,
  initialState,
  GameState,
  getDevBudgetRemaining,
  getAdBudgetRemaining,
  hasWon,
  getMonthName,
} from "./engine/gameState";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load projects on mount
  useEffect(() => {
    loadProjects().then((projects) => {
      dispatch({ type: "LOAD_PROJECTS", projects });
    });
  }, []);

  // ── Viewport management ──────────────────────────────────
  useLayoutEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    const update = () => {
      const vv = window.visualViewport;
      const w = vv?.width ?? window.innerWidth;
      const h = vv?.height ?? window.innerHeight;
      const maxW = parseFloat(getComputedStyle(root).getPropertyValue("--app-max-width")) || 1024;
      const maxH = parseFloat(getComputedStyle(root).getPropertyValue("--app-max-height")) || 768;
      root.style.setProperty("--app-height", `${Math.round(h)}px`);
      root.style.setProperty("--game-width", `${Math.round(Math.min(w, maxW))}px`);
      root.style.setProperty("--game-height", `${Math.min(Math.round(h), maxH)}px`);
    };
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = 0; update(); });
    };
    update();
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <div className="app-shell relative mx-auto flex w-full flex-col overflow-hidden">
      <div className="game-screen relative">
        {state.phase === "intro" && <IntroScreen onStart={() => dispatch({ type: "START_SELECTION" })} />}
        {state.phase === "selection" && (
          <SelectionScreen
            state={state}
            dispatch={dispatch}
            onStart={() => dispatch({ type: "START_GAMEPLAY" })}
          />
        )}
        {state.phase === "playing" && <GameplayScreen state={state} dispatch={dispatch} />}
        {state.phase === "ended" && <EndScreen state={state} onRestart={() => window.location.reload()} />}
      </div>
    </div>
  );
}

// ── Intro Cutscene ───────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="ui-panel max-w-3xl space-y-6 p-8">
        <h1 className="arcade-title text-3xl" style={{ color: "#ff00ff" }}>
          FORTIS STUDIOS
        </h1>

        <div className="pixel-text text-lg ink-strong space-y-4 text-left">
          <p style={{ color: "#00ffff" }}>
            ► ULTIMATE BOSS: Fordy Fortizen, you are now CEO of Fortis Studios.
          </p>

          <p style={{ color: "#ffff00" }}>
            ► I'm giving you a budget of <span style={{ color: "#00ff00" }}>$100 MILLION</span> in game development costs.
          </p>

          <p style={{ color: "#ffff00" }}>
            ► Plus <span style={{ color: "#00ff00" }}>$60 MILLION</span> for advertising.
          </p>

          <p style={{ color: "#ff0000" }}>
            ► Your mission: Generate <span style={{ color: "#00ff00" }}>$20 MILLION</span> in sales within <span style={{ color: "#00ff00" }}>TWELVE MONTHS</span>.
          </p>

          <p style={{ color: "#00ffff" }}>
            ► Choose your game projects wisely. Each has different costs and potential.
          </p>

          <p style={{ color: "#ff00ff" }}>
            ► Don't disappoint me, Fordy.
          </p>
        </div>

        <button className="ui-cta mt-8" onClick={onStart}>
          ACCEPT MISSION
        </button>
      </div>
    </div>
  );
}

// ── Project Selection Screen ────────────────────────────

function SelectionScreen({
  state,
  dispatch,
  onStart,
}: {
  state: GameState;
  dispatch: React.Dispatch<any>;
  onStart: () => void;
}) {
  const [selectedLane, setSelectedLane] = useState<number | null>(null);

  const filledLanes = state.lanes.filter((l) => l !== null).length;
  const canStart = filledLanes > 0;

  const handleSelectProject = (projectName: string) => {
    if (selectedLane !== null) {
      dispatch({ type: "SELECT_PROJECT", laneIndex: selectedLane, projectName });
      setSelectedLane(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="arcade-title text-center text-2xl mb-4" style={{ color: "#00ff00" }}>
        SELECT YOUR GAME PROJECTS
      </h1>

      {/* Current selections */}
      <div className="ui-panel mb-4 p-4">
        <div className="pixel-text text-sm ink-soft mb-2">DESIGN LANES ({filledLanes}/8 filled)</div>
        <div className="grid grid-cols-4 gap-2">
          {state.lanes.map((lane, idx) => (
            <button
              key={idx}
              className={`ui-button text-xs p-2 ${selectedLane === idx ? "ring-2 ring-yellow-400" : ""}`}
              onClick={() => setSelectedLane(idx)}
            >
              {lane ? lane.project.name : `Lane ${idx + 1}`}
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto ui-panel p-4">
        <div className="pixel-text text-xs ink-soft mb-2">
          {selectedLane !== null
            ? `Select project for Lane ${selectedLane + 1}`
            : "Click a lane above to select a project"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {state.allProjects.map((project) => {
            const alreadySelected = state.lanes.some((l) => l?.project.name === project.name);
            return (
              <button
                key={project.name}
                className="ui-button text-left p-3 text-xs"
                disabled={!selectedLane && selectedLane !== 0}
                onClick={() => handleSelectProject(project.name)}
                style={{ opacity: alreadySelected ? 0.5 : 1 }}
              >
                <div className="font-bold" style={{ color: "#00ffff" }}>
                  {project.name}
                </div>
                <div style={{ color: "#ffff00" }}>Cost: ${project.dev_cost_per_month}M/mo</div>
                <div style={{ color: "#00ff00" }}>Time: {project.time_to_market} months</div>
                <div style={{ color: "#ff00ff" }}>ROAS: ???</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="mt-4 text-center">
        <button className="ui-cta" disabled={!canStart} onClick={onStart}>
          START GAME
        </button>
      </div>
    </div>
  );
}

// ── Gameplay Screen ──────────────────────────────────────

function GameplayScreen({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<any> }) {
  const monthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [swapLane, setSwapLane] = useState<number | null>(null);

  // Background music control
  useEffect(() => {
    // Create audio element on mount
    if (!audioRef.current) {
      audioRef.current = new Audio("/gameplay-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    const audio = audioRef.current;

    // Play when gameplay starts and not paused
    if (state.phase === "playing" && !isPaused) {
      audio.play().catch(() => {
        // Browser may block autoplay - user interaction required
        console.log("Music autoplay blocked - will play on first interaction");
      });
    } else {
      audio.pause();
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
    };
  }, [state.phase, isPaused]);

  // Auto-advance months (5 seconds per month)
  useEffect(() => {
    if (isPaused || state.phase !== "playing") return;

    monthTimerRef.current = setTimeout(() => {
      dispatch({ type: "ADVANCE_MONTH" });
    }, 5000); // 5 seconds

    return () => {
      if (monthTimerRef.current) clearTimeout(monthTimerRef.current);
    };
  }, [state.currentMonth, isPaused, state.phase, dispatch]);

  const handleSwapProject = (projectName: string) => {
    if (swapLane !== null) {
      dispatch({ type: "SELECT_PROJECT", laneIndex: swapLane, projectName });
      setSwapLane(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* HUD */}
      <div className="flex justify-between items-center px-2 py-1 border-b-2" style={{ borderColor: "#00ff00" }}>
        <div className="pixel-text text-xs space-x-3 flex">
          <span style={{ color: "#00ff00" }}>MONTH: {getMonthName(state.currentMonth)}</span>
          <span style={{ color: "#ffff00" }}>DEV: ${state.devBudgetUsed.toFixed(1)}M / ${state.devBudgetTotal}M</span>
          <span style={{ color: "#ff00ff" }}>ADS: ${state.adBudgetUsed.toFixed(1)}M / ${state.adBudgetTotal}M</span>
          <span style={{ color: "#00ffff" }}>REVENUE: ${state.totalRevenue.toFixed(1)}M</span>
        </div>
        <button className="ui-button text-xs px-2 py-1" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? "RESUME" : "PAUSE"}
        </button>
      </div>

      {/* Month headers */}
      <div className="flex border-b-2 px-2 py-0.5" style={{ borderColor: "#00ff00" }}>
        <div className="w-28"></div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
          <div
            key={m}
            className="flex-1 text-center pixel-text text-xs"
            style={{ color: m === state.currentMonth ? "#ffff00" : "#00aa00" }}
          >
            {getMonthName(m)}
          </div>
        ))}
      </div>

      {/* Design lanes */}
      <div className="flex-1 overflow-y-auto">
        {state.lanes.map((lane, idx) => (
          <DesignLane
            key={idx}
            laneIndex={idx}
            lane={lane}
            currentMonth={state.currentMonth}
            dispatch={dispatch}
            onRequestSwap={() => {
              dispatch({ type: "REMOVE_PROJECT", laneIndex: idx });
              setSwapLane(idx);
            }}
          />
        ))}
      </div>

      {/* Project swap modal */}
      {swapLane !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="ui-panel max-w-4xl max-h-[80%] overflow-y-auto p-6">
            <h2 className="pixel-text text-lg mb-4" style={{ color: "#00ff00" }}>
              SELECT NEW PROJECT FOR LANE {swapLane + 1}
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {state.allProjects.map((project) => {
                const alreadySelected = state.lanes.some((l) => l?.project.name === project.name);
                return (
                  <button
                    key={project.name}
                    className="ui-button text-left p-3 text-xs"
                    onClick={() => handleSwapProject(project.name)}
                    style={{ opacity: alreadySelected ? 0.5 : 1 }}
                    disabled={alreadySelected}
                  >
                    <div className="font-bold" style={{ color: "#00ffff" }}>
                      {project.name}
                    </div>
                    <div style={{ color: "#ffff00" }}>Cost: ${project.dev_cost_per_month}M/mo</div>
                    <div style={{ color: "#00ff00" }}>Time: {project.time_to_market} months</div>
                    <div style={{ color: "#ff00ff" }}>ROAS: ???</div>
                  </button>
                );
              })}
            </div>
            <button className="ui-button" onClick={() => setSwapLane(null)}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DesignLane({
  laneIndex,
  lane,
  currentMonth,
  dispatch,
  onRequestSwap,
}: {
  laneIndex: number;
  lane: any;
  currentMonth: number;
  dispatch: React.Dispatch<any>;
  onRequestSwap: () => void;
}) {
  const [showAdSpendInput, setShowAdSpendInput] = useState(false);
  const [adSpendValue, setAdSpendValue] = useState("");

  const handleSetAdSpend = () => {
    const amount = parseFloat(adSpendValue);
    if (!isNaN(amount) && amount >= 0) {
      dispatch({ type: "SET_AD_SPEND", laneIndex, monthlyAmount: amount });
      setShowAdSpendInput(false);
    }
  };

  if (!lane) {
    return (
      <div className="border-b flex items-center px-2 py-1.5" style={{ borderColor: "#222" }}>
        <div className="w-28 pixel-text text-xs ink-soft">Lane {laneIndex + 1}</div>
        <div className="flex-1 text-center pixel-text text-xs ink-soft">(empty)</div>
      </div>
    );
  }

  const progress = (lane.monthsInDevelopment / 12) * 100;

  return (
    <div className="border-b flex items-center px-2 py-1.5 relative" style={{ borderColor: "#00ff00" }}>
      {/* Lane label */}
      <div className="w-28 space-y-0.5">
        <div className="pixel-text text-xs font-bold" style={{ color: "#00ffff" }}>
          {lane.project.name}
        </div>
        <div className="pixel-text" style={{ color: "#ffff00", fontSize: "10px" }}>
          ${lane.project.dev_cost_per_month}M/mo
        </div>
        {lane.launched && (
          <div className="pixel-text" style={{ color: "#00ff00", fontSize: "10px" }}>
            ROAS: {lane.project.roas.toFixed(1)}x
          </div>
        )}
        {lane.launched && (
          <button
            className="ui-button px-1.5 py-0.5 mt-0.5"
            style={{ fontSize: "10px" }}
            onClick={() => setShowAdSpendInput(!showAdSpendInput)}
          >
            Ad: ${lane.monthlyAdSpend.toFixed(1)}M
          </button>
        )}
        <button
          className="ui-button px-1 py-0"
          onClick={onRequestSwap}
          style={{ backgroundColor: "#ff0000", borderColor: "#ff0000", fontSize: "9px", marginTop: "2px" }}
        >
          X
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex-1 relative h-6 border-2" style={{ borderColor: "#00ff00" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${progress}%`,
            background: lane.launched ? "#00ff00" : "#ffff00",
            opacity: 0.3,
          }}
        ></div>
        {lane.launched && (
          <div className="absolute inset-0 flex items-center justify-center pixel-text font-bold" style={{ fontSize: "10px" }}>
            LAUNCHED
          </div>
        )}
      </div>

      {/* Ad spend input */}
      {showAdSpendInput && (
        <div className="absolute top-full left-28 mt-1 z-10 ui-panel p-1.5 flex gap-1.5">
          <input
            type="number"
            className="w-20 px-1.5 py-0.5 border-2 bg-black pixel-text"
            style={{ borderColor: "#00ff00", color: "#00ff00", fontSize: "10px" }}
            placeholder="0.0"
            value={adSpendValue}
            onChange={(e) => setAdSpendValue(e.target.value)}
          />
          <button className="ui-button px-1.5 py-0.5" style={{ fontSize: "10px" }} onClick={handleSetAdSpend}>
            SET
          </button>
        </div>
      )}
    </div>
  );
}

// ── End Screen ───────────────────────────────────────────

function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const won = hasWon(state);
  const endMessage =
    state.endReason === "dev_budget_depleted"
      ? "DEVELOPMENT BUDGET DEPLETED"
      : state.endReason === "ad_budget_depleted"
      ? "ADVERTISING BUDGET DEPLETED"
      : "YEAR ENDED";

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="ui-panel max-w-2xl space-y-6 p-8">
        <h1 className="arcade-title text-3xl" style={{ color: won ? "#00ff00" : "#ff0000" }}>
          {won ? "MISSION SUCCESS!" : "MISSION FAILED"}
        </h1>

        <div className="pixel-text text-lg ink-strong space-y-3">
          <p style={{ color: "#ffff00" }}>{endMessage}</p>

          <p style={{ color: "#00ffff" }}>
            FINAL REVENUE: <span style={{ color: "#00ff00" }}>${state.totalRevenue.toFixed(2)}M</span>
          </p>

          <p style={{ color: "#00ffff" }}>
            TARGET: <span style={{ color: won ? "#00ff00" : "#ff0000" }}>$20.00M</span>
          </p>

          {won ? (
            <p style={{ color: "#00ff00" }}>
              ► ULTIMATE BOSS: Excellent work, Fordy. You've exceeded expectations.
            </p>
          ) : (
            <p style={{ color: "#ff0000" }}>
              ► ULTIMATE BOSS: Disappointing, Fordy. We expected more.
            </p>
          )}
        </div>

        <button className="ui-cta mt-8" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
