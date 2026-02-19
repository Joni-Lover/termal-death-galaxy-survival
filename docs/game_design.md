# Game Design Document (MVP)

## Controls
- Move: WASD / Arrow Keys
- Thrust brake: Shift
- Fire: Space
- Salvage nearby node: E
- Convert stockpile mass to outpost energy (at base): Q
- Buy Reactor upgrade at outpost: Z
- Buy Hull upgrade at outpost: X
- Buy Cargo upgrade at outpost: C
- Toggle fullscreen: F (Esc exits)
- Start: Enter
- Restart after failure: R
- Select difficulty in menu: 1-4

## Core Systems
### Ship
- Has hull HP, energy reserve, velocity, cargo hold.
- Energy drains over time and with thrust/fire.
- Hull takes hazard and combat damage.

### Resources
- Metal, Fuel, Crystal, Data, Entropy Core.
- Nodes: asteroid, shard, wreck.
- Cargo auto-deposits when near outpost core.

### Outpost
- Stored resources and outpost energy.
- Outpost energy decays continuously.
- If outpost energy reaches zero: defeat.
- Upgrade station allows three ship upgrade tracks:
- Reactor (energy efficiency and recharge),
- Hull (max HP),
- Cargo (capacity).

### Hazards
- Sun: strong heat zone, direct damage.
- Black hole: gravitational pull + extreme inner damage zone.

### Enemies
- Reclaimer drones patrol and chase player inside radius.
- Destroying drones grants score and occasional resource drops.

## Difficulty Presets
- Pilgrim (Easy)
- Drifter (Normal)
- Relic (Hard)
- Heat Death (Brutal)

Presets tune energy economy, hazard severity, enemy aggression, loot scarcity, and death penalty.

## Win/Lose
- MVP lose states: hull <= 0 or outpost energy <= 0.
- MVP objective: maximize survival time and score while preserving outpost.
