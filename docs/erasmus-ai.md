# Erasmus AI

A deterministic, chart-driven AI player for *Empire of the Sun*, playable as either
faction across the full-map campaigns.

## Overview

Erasmus plays both **Japan** and the **Allies**. Its decisions are driven by a set
of per-faction *decision charts* (condition/action graphs transcribed from the
original strategy charts), with a turn-level *strategy state machine* layered on top
for the full-map scenarios.

Key properties:

- **Deterministic** — given the same seed and state, it always plays the same move.
  All randomness comes from the engine's own MLCG `random()`; the bot adds none.
- **Chart-driven** — each decision is modeled as a graph of condition nodes
  (predicates with `true`/`false` edges), action nodes, and fallback nodes. The
  authoritative per-page chart data is transcribed into `js/server/erasmus_data.js`
  as a single embedded `ERASMUS_CHARTS` object.
- **Strategy axes** — in the full-map campaigns a turn-level state machine "pins" a
  strategy axis (e.g. JP *Southwest Resource*, *Pressure India*, *Pressure HQ*,
  *Central Pacific*, *China*; AP *Southern Resource*, *Air Superiority*, *Invade
  Japan*, *Return to the Philippines*) and drives card play and operations toward
  that axis's goals.
- **Exact-predicate engine integration** — the bot can query the engine for exact
  rule predicates (reachability, task-force viability, the atomic-bomb endgame) and
  falls back to heuristic predicates when the engine patch is absent.

## Files

### AI core (pure bot, no engine behaviour changes)

| File | Role |
| --- | --- |
| `js/server/bots/erasmus.js` | Bot entry point; registers `erasmus-v2` in `EOTS_BOTS`; `decide(view, context)`; chart selection and micro-execution plus strategy-state-machine wiring |
| `js/server/erasmus_state.js` | Turn-level strategy state machine (`esm_*`): pins a strategy axis, tracks phases/goals, drives card-window decisions |
| `js/server/erasmus_ops.js` | Operational layer (`eop_*`): task-force composition, attack/redeploy scoring, exact-predicate helpers |
| `js/server/erasmus_card.js` | Card classification and play selection |
| `js/server/erasmus_placement.js` | Reinforcement placement |
| `js/server/erasmus_data.js` | Static chart data (generated `ERASMUS_CHARTS` object; transcribed from the source strategy charts) |
| `js/server/rules_query.js` | Query bridge: exposes rule-engine predicates to the AI (`rules_query_dispatch`) |

### Engine integration (guarded, degrades gracefully)

| File | Change |
| --- | --- |
| `js/server/framework.js` | `exports.bots ??= EOTS_BOTS` — exposes registered bots to the platform |
| `js/server/game.js` | Read-only `V.ai` projection (own cards, units, focus, predicates, reaction, pbm) and the headless flag |
| `js/server/offensive.js` | `headless_*` self-play helpers; `eop_*` exact-predicate calls guarded by `typeof X === "function"`; headless deadlock exits in `choose_attack_hex` and `commit_offensive_confirm` |
| `js/server/query.js` | `rules_query_dispatch(q)`; `atomic_bomb_strategy_status()` dispatch |
| `js/common/scenario.js` | `atomic_bomb_strategy_status()` — atomic-bomb endgame predicate |
| `js/server/actions.js` | `snapshot_offensive_card_action()` rollback + `oc_denied` deadlock exit (a card whose `before_commit_offensive` restriction fails can be abandoned instead of looping) |
| `js/server/events.js` | `fuel_shortage` headless deadlock exit (a deterministic bot cannot "undo" a bad selection the way a human can, so the window must be able to terminate itself) |

## How the bot is driven

The platform lists bots via `rules.bots` (exported by `framework.js`). Each bot
exposes:

- `name`, `version`, `scenarios`, `roles`
- `decide(view, context)` → `{ action, argument, ... }` plus optional trace fields
  (`publicTrace` / `privateTrace` carrying `policy`, `chart`, `node`, `nodePath`,
  `strategy`, `conditions`, `dice`, `fallback`, `inferred`, `explanation`).

`decide` runs a three-tier process:

1. If the strategy state machine is active (full-map scenarios), pin the current
   strategy axis.
2. Handle card-window decisions (play as OC / event / pass) according to the pinned
   axis.
3. Otherwise execute the selected decision chart (condition/action nodes) to produce
   the concrete action.

## Determinism and headless self-play

To exercise the bot in AI-vs-AI games, the module adds headless self-play support:

- `G.headless_moves` / `V.headless_moves` flag.
- `headless_*` helpers in `offensive.js` automate attack-advance and move windows
  that would otherwise require a human to click "advance".
- A few windows (e.g. `fuel_shortage`) gain a self-terminating deadlock exit, because
  a deterministic bot cannot "undo" a selection the way a human can.

## Design note: graceful degradation

Every engine-side `eop_*` call is wrapped in a `typeof X === "function"` guard, so:

- The engine compiles and runs unchanged with no AI present.
- The AI runs on heuristic predicates (`view.ai.predicates`) when the
  exact-predicate engine patch is absent.

## Comments and naming

Code comments are bilingual (original Chinese with an English translation).
Strategy and display names (e.g. `测试版`) are intentionally kept in Chinese.

## Version

`ERASMUS_VERSION` is defined in `js/server/bots/erasmus.js`. The bot is registered
under the key `erasmus-v2` with display name `测试版` (test version).
