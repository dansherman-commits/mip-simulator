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
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<number | null>(null);

  const filledLanes = state.lanes.filter((l) => l !== null).length;
  const canStart = filledLanes > 0;

  const handleDragStart = (projectName: string) => {
    setDraggedProject(projectName);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverLane(null);
  };

  const handleDragOver = (e: React.DragEvent, laneIndex: number) => {
    e.preventDefault();
    setDragOverLane(laneIndex);
  };

  const handleDragLeave = () => {
    setDragOverLane(null);
  };

  const handleDrop = (e: React.DragEvent, laneIndex: number) => {
    e.preventDefault();
    if (draggedProject) {
      dispatch({ type: "SELECT_PROJECT", laneIndex, projectName: draggedProject });
    }
    setDraggedProject(null);
    setDragOverLane(null);
  };

  const handleRemoveLane = (laneIndex: number) => {
    dispatch({ type: "REMOVE_PROJECT", laneIndex });
  };

  return (
    <div className="flex flex-col h-full p-3">
      <h1 className="arcade-title text-center mb-2" style={{ color: "#00ff00", fontSize: "28px" }}>
        SELECT YOUR GAME PROJECTS
      </h1>

      <div className="pixel-text text-center text-xs mb-3" style={{ color: "#ffff00" }}>
        ► DRAG games from left panel and DROP onto Design Lanes ► Fill at least 1 lane to start
      </div>

      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Left: Available Projects */}
        <div className="flex-1 ui-panel p-2 overflow-y-auto">
          <div className="pixel-text text-xs mb-2 ink-soft">AVAILABLE GAMES (26)</div>
          <div className="grid grid-cols-4 gap-1.5">
            {state.allProjects.map((project) => {
              const alreadySelected = state.lanes.some((l) => l?.project.name === project.name);
              return (
                <div
                  key={project.name}
                  draggable={!alreadySelected}
                  onDragStart={() => handleDragStart(project.name)}
                  onDragEnd={handleDragEnd}
                  className={`ui-button p-1.5 text-center cursor-move ${
                    alreadySelected ? "opacity-30 cursor-not-allowed" : ""
                  } ${draggedProject === project.name ? "opacity-50" : ""}`}
                  style={{ fontSize: "9px" }}
                >
                  <div className="text-xl mb-0.5">{project.icon}</div>
                  <div className="font-bold truncate" style={{ color: "#00ffff" }}>
                    {project.name}
                  </div>
                  <div style={{ color: "#ffff00" }}>${project.dev_cost_per_month}M</div>
                  <div style={{ color: "#00ff00" }}>{project.time_to_market}mo</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Design Lanes */}
        <div className="w-80 ui-panel p-3">
          <div className="pixel-text text-xs mb-2 ink-soft">DESIGN LANES ({filledLanes}/8)</div>
          <div className="space-y-2">
            {state.lanes.map((lane, idx) => (
              <div
                key={idx}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                className={`ui-button p-2 flex items-center gap-2 justify-between transition-all ${
                  dragOverLane === idx ? "ring-2 ring-yellow-400 bg-yellow-900 bg-opacity-20" : ""
                }`}
                style={{ minHeight: "50px" }}
              >
                {lane ? (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{lane.project.icon}</span>
                      <div className="text-xs">
                        <div className="font-bold" style={{ color: "#00ffff" }}>
                          {lane.project.name}
                        </div>
                        <div style={{ color: "#ffff00", fontSize: "9px" }}>
                          ${lane.project.dev_cost_per_month}M/mo · {lane.project.time_to_market}mo
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLane(idx)}
                      className="ui-button px-2 py-1"
                      style={{ backgroundColor: "#ff0000", borderColor: "#ff0000", fontSize: "9px" }}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <div className="pixel-text text-xs ink-soft text-center w-full">
                    Drop game here - Lane {idx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="ui-cta w-full mt-4"
            disabled={!canStart}
            onClick={onStart}
            style={{ fontSize: "14px", padding: "8px" }}
          >
            START GAME
          </button>
        </div>
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
                    className="ui-button text-left p-3 text-xs flex gap-2 items-start"
                    onClick={() => handleSwapProject(project.name)}
                    style={{ opacity: alreadySelected ? 0.5 : 1 }}
                    disabled={alreadySelected}
                  >
                    <div className="text-2xl" style={{ lineHeight: "1" }}>{project.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: "#00ffff" }}>
                        {project.name}
                      </div>
                      <div style={{ color: "#ffff00" }}>Cost: ${project.dev_cost_per_month}M/mo</div>
                      <div style={{ color: "#00ff00" }}>Time: {project.time_to_market} months</div>
                      <div style={{ color: "#ff00ff" }}>ROAS: ???</div>
                    </div>
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
      <div className="w-28 space-y-0.5 flex gap-1.5">
        <div className="text-xl" style={{ lineHeight: "1" }}>{lane.project.icon}</div>
        <div className="flex-1 space-y-0.5">
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
