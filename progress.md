Original prompt: продолжи создание игры

- Initialized project with `index.html`, `styles.css`, and `game.js`.
- Added a playable canvas game loop with menu, gameplay, and game-over states.
- Implemented controls: movement (WASD/arrows), shooting (Space), start (Enter), restart (R), fullscreen toggle (F/Esc).
- Added enemies, collisions, score progression, hull HP, and escalating difficulty.
- Added `window.render_game_to_text` and deterministic `window.advanceTime(ms)` hooks for Playwright automation.

Verification log:
- Installed local `playwright` dependency and Chromium runtime required by automation.
- Ran skill client:
  - `node "$WEB_GAME_CLIENT" --url http://127.0.0.1:4173 --actions-file test_actions.json --iterations 3 --pause-ms 250 --screenshot-dir output/web-game`
  - Output: `shot-0..2.png`, `state-0..2.json`, no error files.
  - Confirmed visually: gameplay renders correctly, score increases after enemy kill, entities visible.
- Ran game-over scenario:
  - `node "$WEB_GAME_CLIENT" --url http://127.0.0.1:4173 --actions-file test_actions_gameover.json --iterations 1 --pause-ms 150 --screenshot-dir output/web-game-gameover`
  - Output: `shot-0.png`, `state-0.json`, no error files.
  - Confirmed visually: `Mission Lost` overlay appears, reason text and final score visible.

TODO / next agent suggestions:
- Add extra weapons or temporary powerups to deepen combat loop.
- Add a start button/DOM menu option for mouse-only launch (automation currently uses keyboard `Enter`).
- Extend automated action payloads to explicitly test restart loop and fullscreen toggle.

- Rebuilt project into modular ES structure under `src/` with deterministic systems and content configs.
- Added design and implementation docs: `docs/vision.md`, `docs/lore_bible.md`, `docs/game_design.md`, `docs/tech_design.md`.
- Implemented open-space gameplay loop:
  - Free movement in four directions with inertia.
  - Procedural chunk generation with resources, hazards, and enemies.
  - Resource salvage (`E`) + cargo deposit at outpost.
  - Outpost energy decay and fuel-to-energy conversion (`Q`).
  - Difficulty profiles with gameplay multipliers and menu selection (`1..4`).
- Updated rendering/HUD/menu/game-over screens to match new loop.
- Exposed deterministic hooks in new `src/main.js`:
  - `window.render_game_to_text`
  - `window.advanceTime(ms)`
- Updated root project files: `index.html`, `styles.css`, `README.md`, `package.json`, `.gitignore`, action payloads.

Pending verification:
- Run Playwright loop against updated build and review latest state/screenshot artifacts.

Verification log (new architecture):
- Ran Playwright loop with local server:
  - `python3 -m http.server 4173` + `web_game_playwright_client.js --actions-file test_actions.json --iterations 3`
- Artifacts produced in `output/web-game`:
  - `shot-0.png`, `shot-1.png`, `shot-2.png`
  - `state-0.json`, `state-1.json`, `state-2.json`
- No Playwright error artifact files were generated.
- State snapshots confirm new schema (difficulty, outpost energy, resources/hazards/enemies, cargo).

TODO / next agent suggestions:
- Add upgrades tree and spend paths for `data` and `entropyCore`.
- Add contextual salvage indicator for nearest node in HUD.
- Add deterministic seed selection on menu and expose it in text state.
- Expand action payloads to test salvage + deposit loop explicitly.

- Removed legacy root runtime file `game.js`; the project now runs only through `src/main.js`.
- Added upgrade system config in `src/config/upgrades.js`.
- Implemented outpost upgrades in simulation (`Z` reactor, `X` hull, `C` cargo) with stockpile costs and level caps.
- Added dynamic player caps from upgrades (`maxHull`, `maxEnergy`, `cargoCapacity`) and applied effects in energy/outpost loops.
- Extended HUD with upgrade levels, next costs, and near-outpost controls hint.
- Extended `render_game_to_text` payload with upgrade state, dynamic caps, and status message.
- Updated docs: controls in `README.md` and `docs/game_design.md`.

Verification update:
- Standard Playwright scenario rerun succeeded; fresh artifacts in `output/web-game`.
- Upgrade-specific Playwright action scenario executed successfully with elevated permissions, but did not trigger a visible upgrade purchase in state snapshot; likely action-key mapping constraint in the test client.

- Localized gameplay UI to Russian (menu, HUD, checklist, game-over, status messages, upgrade labels).
- Reduced default difficulty and made start easier:
  - Default preset switched to `pilgrim`.
  - `pilgrim` and `drifter` multipliers reduced (less damage/drain/spawn pressure, more loot).
  - Increased initial outpost energy/stockpile for gentler early game.

- Fixed menu UX issues:
  - Added return-to-menu while playing via `M` or `Esc` (outside fullscreen-exit behavior).
  - Menu now renders as a separate scene (no gameplay/HUD layering under menu).
  - Added explicit hint: `M`/`Esc` returns to menu during gameplay.

- Added a safe zone around Outpost Ember (`OUTPOST.radius + 70`).
- Inside safe zone:
  - hazard effects are disabled (no black-hole pull, no hazard damage),
  - enemy contact damage is disabled.
- Added `player.inSafeZone` to state and `render_game_to_text` payload.
- HUD now shows a green safe-zone indicator message when protection is active.

- Added 360-degree aiming via mouse and crosshair rendering.
- Shooting now supports mouse left click and hold-space autofire with cooldown.
- Added ship booster on Shift (higher thrust/speed, increased energy drain).
- Added defensive pulse ability on V (or right-click): radial enemy wipe, energy cost, cooldown, visual ring.
- Added pulse/boost indicators to HUD and updated control hints in menu and in-game panels.

QA visual pass (Playwright screenshots):
- Captured and reviewed: menu, gameplay (hints on), gameplay sample, and game-over screens.
- Found overlap issue in right HUD region (`status` text over upgrade panel).
- Fixed HUD layout by moving right-side upgrade/checklist panels down and tightening spacing.
- Re-captured post-fix gameplay screenshot and verified no text overlap.

- Added compact HUD mode (default on): smaller left status panel + minimal right info strip.
- Added HUD mode toggle on `J` during gameplay.
- Full HUD remains available and keeps hints/upgrades/checklist layout.
- Updated menu controls hint to include `J`.

- Enemy AI updated around outpost safe zone:
  - enemies now disengage and accelerate away while player is inside safe zone,
  - hard exclusion barrier prevents enemies from entering safe zone radius,
  - barrier reflects inward enemy velocity to avoid edge camping/blocking exits.

- Applied pseudo-3D rendering pass (visual-only):
  - perspective projection with depth-based scaling,
  - horizon/depth lane lines in background,
  - depth-scaled hazards/resources/enemies/bullets/outpost/player,
  - object contact shadows for better depth perception.
