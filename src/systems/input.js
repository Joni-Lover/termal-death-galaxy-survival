import { DIFFICULTY_ORDER } from "../config/difficultyProfiles.js";
import { resetRun } from "../core/state.js";

export function bindInput(state, canvas, toggleFullscreen) {
  document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    if (event.code === "KeyF") {
      toggleFullscreen(canvas);
      return;
    }

    if (event.code === "Escape" && document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    if (state.mode === "menu") {
      if (event.code === "Enter") {
        resetRun(state);
        return;
      }
      if (/Digit[1-4]/.test(event.code)) {
        state.selectedDifficulty = DIFFICULTY_ORDER[Number(event.code.slice(-1)) - 1];
      }
    }

    if (state.mode === "gameover" && event.code === "KeyR") {
      resetRun(state);
      return;
    }


    if (state.mode === "playing" && event.code === "KeyH") {
      state.showHints = !state.showHints;
      state.message = state.showHints ? "Hints on." : "Hints off.";
      return;
    }

    if (state.mode === "playing" && event.code === "KeyJ") {
      state.uiCompact = !state.uiCompact;
      state.message = state.uiCompact ? "Compact HUD." : "Full HUD.";
      return;
    }

    if (state.mode === "playing" && (event.code === "KeyM" || event.code === "Escape")) {
      state.mode = "menu";
      state.message = "Paused. Pick level, press Enter.";
      state.keys.clear();
      state.justPressed.clear();
      return;
    }

    state.keys.add(event.code);
    state.justPressed.add(event.code);
  });

  document.addEventListener("keyup", (event) => {
    state.keys.delete(event.code);
  });

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const sx = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const sy = ((event.clientY - rect.top) / rect.height) * canvas.height;
    state.mouse.screenX = sx;
    state.mouse.screenY = sy;
    state.mouse.worldX = state.player.x + (sx - canvas.width * 0.5);
    state.mouse.worldY = state.player.y + (sy - canvas.height * 0.5);
    state.mouse.active = true;
  });

  canvas.addEventListener("mouseleave", () => {
    state.mouse.active = false;
  });

  canvas.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
      state.justPressed.add("Space");
    }
    if (event.button === 2) {
      state.justPressed.add("KeyV");
    }
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

export function consumePress(state, code) {
  if (!state.justPressed.has(code)) return false;
  state.justPressed.delete(code);
  return true;
}
