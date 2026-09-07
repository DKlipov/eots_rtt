// 回合级状态机 AI 核心 — erasmus-v2.0-zh.7
// Turn-level state machine AI core — erasmus-v2.0-zh.7
//
// 移植自 erasmus_complete_ai_execution_engine.py（同源参考引擎）: 把完整 py 决策
// 树 + 有序目标链 + 事件战略搬到 RTT 真实引擎状态上。选轴时机 = 回合级首卡
// （每方每游戏回合第一张“Select card to play.”窗口求值一次、钉住该回合战略，
// 下回合首卡重评）。仅完整全图剧本（菲律宾/DEI/日本齐全，排除 South Pacific 与
// Burma 子图）启用；gate 关时本模块必须零行为（由 erasmus.js 短路保证）。
// Ported from erasmus_complete_ai_execution_engine.py (the same-origin reference engine):
// move the full py decision tree + ordered goal chain + event strategy onto the RTT real
// engine state. Axis selection timing = the turn-level first card (the first
// "Select card to play." window of each side's game turn is evaluated once and pins that
// turn's strategy; re-evaluated at the next turn's first card). Only full-map scenarios
// (Philippines/DEI/Japan all present, excluding the South Pacific and Burma submaps) are
// enabled; when the gate is off this module must have zero behavior (guaranteed by the
// erasmus.js short-circuit).
//
// 分层:
//   esm_* 状态机      —— gate / 阶段门槛 / 逐(seed,sid,role) 缓存 / 首卡检测
//   esm_build_ctx()   —— 引擎真实状态 -> py 同名字段(布尔 ctx)，供决策树消费
//   esm_jp_* esm_al_* —— 决策树求值（分支/阈值逐字照抄 py L583-743）
//   ESM_JP_LIB/AL     —— py 策略表(L169-513) -> JS（名称/说明逐字；token=可解析目标）
//   esm_pin_strategy()—— 供 erasmus.js 在每个窗口调用；首卡窗才求值，其余沿用缓存
//
// 确定性: 不进引擎 RNG(绝不碰 G.seed)。随机分支(d10) 用 erasmus_hash 派生。
// Layering:
//   esm_* state machine —— gate / phase threshold / per-(seed,sid,role) cache / first-card detection
//   esm_build_ctx()     —— engine real state -> py same-named fields (boolean ctx), consumed by the decision tree
//   esm_jp_* esm_al_*   —— decision tree evaluation (branches/thresholds copied verbatim from py L583-743)
//   ESM_JP_LIB/AL       —— py strategy table (L169-513) -> JS (names/descriptions verbatim; token = parseable target)
//   esm_pin_strategy()  —— called by erasmus.js on every window; only the first-card window evaluates, the rest reuse the cache
//
// Determinism: never touch engine RNG (never G.seed). Random branches (d10) derive from erasmus_hash.

// ---- 策略 kind(策略级: 驱动选牌窗/微执行) --------------------------------
// CONQUEST: 有序夺控/作战目标链(喂 eop 焦点层); EVENT: 事件战略(选事件牌);
// PASS: 本回合跳; GARRISON: 只向日本仍控制但缺指定兵种的国防圈格调动;
// DEFEND: 围绕本州盟军地面部队集结、支援并反击，禁止回落到南方资源轴;
// ABSTRACT: 抽象目标(B29/原子弹)。D4 起不再按 EVENT 空打事件 —— 用 OC 打攻势把
// 抽象目标落成可执行链(推进B29=前推轰炸基地链/使 B29 可达; 原子弹胜利=资源夺回链),
// 选牌窗意图 = OPS(原子弹胜利持苏联牌时优先事件)。
// ---- strategy kind (strategy-level: drives the card-selection window / micro-execution) ----
// CONQUEST: ordered capture/operations goal chain (feeds the eop focus layer); EVENT: event strategy (play event cards);
// PASS: skip this turn; GARRISON: only move to defense-perimeter hexes still controlled by Japan but lacking the specified unit class;
// DEFEND: concentrate, support and counterattack around Allied ground units on Honshu, forbidden from falling back to the Southern Resource axis;
// ABSTRACT: abstract goals (B29/atomic bomb). From D4 on, no longer play events as empty EVENT — use OC to play offensives and turn
// abstract goals into executable chains (push B29 = push forward the bombing-base chain / make B29 reachable; atomic victory = resource-recapture chain),
// card-window intent = OPS (atomic-bomb victory prefers event when holding the Soviet card).
//
// ---- 目标级 kind(每行 parse_goals, 忠实 py L801-943) ----------------------
// CONQUEST 夺取/投降名单; SUPPRESS 压制AZOI(不夺控); GARRISON 驻军(需己控);
// PORTS 加强港口; INVADE_JAPAN 登陆日本本土(预案 marker 或带城市名单);
// B29/NAVAL/ADMIN 行政/舰队/事件 —— 无 hex 或交事件窗。
// chain(喂 eop 焦点层) = parse_goals 全部 hex 去重保序(py execute 的 target_chain)。
// ---- goal-level kind (each parse_goals line, faithful to py L801-943) ----
// CONQUEST capture/surrender list; SUPPRESS suppress AZOI (no capture); GARRISON garrison (requires own control);
// PORTS fortify ports; INVADE_JAPAN invade the Japanese homeland (plan marker or a city list);
// B29/NAVAL/ADMIN administrative/fleet/event — no hex or hands off to the event window.
// chain (feeds the eop focus layer) = all parse_goals hexes deduplicated in order (py execute's target_chain).

var ESM_GATE_CACHE = {}
var ESM_LOCKED = {}          // key `${seed}|${sid}` -> { turn, role: {Japan:{...},Allies:{...}}, seenOrd, bombFail, lastTurn }
var ESM_PREP = {}            // key sid -> 预计算地理清单(一次性) / precomputed geography list (one-time)
// 本回合已算定的日军后勤值(Logistic Value)——决策轴少数应在回合内缓存的值：
// 手牌随打牌变化会让逐牌重算的后勤值来回抖动、令早期/中期策略在同一回合内翻转，
// 故首次计算后缓存到回合末(回合推进自然失效)。
// This turn's already-computed Japanese logistics value (Logistic Value) — one of the few
// decision-axis values that should be cached within a turn: the hand changes as cards are
// played, making a per-card recompute jitter back and forth and flip early/mid strategies
// within the same turn, so cache it after the first compute until turn end (naturally
// invalidated when the turn advances).
var ESM_JP_LOGISTICS_CACHE = { sid: null, turn: -1, value: 0 }

// ===========================================================================
// Gate / 剧本门槛
// Gate / scenario gate
// ===========================================================================
function esm_gate_on() {
    if (typeof G === "undefined" || !G) return false
    const sid = G.sid
    if (sid in ESM_GATE_CACHE) return ESM_GATE_CACHE[sid]
    let on = true
    if (sid === SOUTH_PACIFIC_SCENARIO || sid === BURMA_SCENARIO) on = false
    if (on && typeof get_map_data === "function") {
        // 内容级自检: 主图应含 菲律宾 / 东印度 / 日本 区域(即完整全图剧本)。
        // Content-level self-check: the main map should contain the Philippines / East Indies / Japan regions (i.e. a full-map scenario).
        let has = { Philippines: false, DEI: false, Japan: false }
        for (let i = 0; i <= LAST_BOARD_HEX && !(has.Philippines && has.DEI && has.Japan); i++) {
            const md = get_map_data(i)
            if (!md || !md.region) continue
            if (md.region === "Philippines") has.Philippines = true
            else if (md.region === "DEI" || md.region === "Java" || md.region === "Sumatra" || md.region === "Borneo" || md.region === "Celebes") has.DEI = true
            else if (md.region === "Japan") has.Japan = true
        }
        if (!(has.Philippines && has.DEI && has.Japan)) on = false
    }
    ESM_GATE_CACHE[sid] = on
    return on
}

// 阶段门槛（图表页脚原文；非纯回合, 由真实地图状态触发）。
// Phase threshold (verbatim chart footer; not purely by turn, triggered by real map state).
function esm_region(hex) {
    try { const md = get_map_data(hex); return md ? md.region : null } catch (e) { return null }
}
function esm_jp_port_within_8_tokyo_ap_controlled() {
    const list = esm_geo().portsWithin8Tokyo
    for (const h of list) if (is_space_controlled(h, AP)) return true
    return false
}
function esm_phase(role) {
    const turn = G.turn
    const s = n => (G.surrender && G.surrender[n] ? true : false)
    if (role === "Japan") {
        if (esm_jp_port_within_8_tokyo_ap_controlled()) return "late"
        const malPhilDei = (typeof nations !== "undefined") &&
            s(nations.MALAYA.id) && s(nations.DEI.id) && s(nations.PHILIPPINES.id)
        if (malPhilDei || turn >= 4) return "mid"
        return "early"
    }
    // Allies
    const saipanAP = is_space_controlled(esm_idx("Saipan"), AP)
    if (saipanAP || turn >= 9) return "late"
    if (turn >= 4) return "mid"
    return "early"
}

// ---- 地理/索引一次性预计算 -------------------------------------------------
// ---- geography/index one-time precompute ------------------------------------
function esm_idx(token) {
    if (typeof eop_resolve_token === "function") return eop_resolve_token(token)
    const matches = esm_name_hexes(token)
    return matches.length ? matches[0] : null
}
function esm_geo() {
    const sid = G.sid
    if (ESM_PREP[sid]) return ESM_PREP[sid]
    const g = { portsWithin8Tokyo: [], controlledHexesWithin8Tokyo: [], airfieldsWithin8Tokyo: [], airfieldsWithin5: [], deiPorts: [], ngPorts: [], resourceHexes: [], allNamed: {} }
    const isDEI = r => r === "DEI" || r === "Java" || r === "Sumatra" || r === "Borneo" || r === "Celebes"
    for (let i = 0; i <= LAST_BOARD_HEX; i++) {
        const md = get_map_data(i)
        if (!md) continue
        if (md.resource) g.resourceHexes.push(i)
        if (is_controllable_hex(i) && md.region !== "China" && get_distance(i, TOKYO) <= 8) g.controlledHexesWithin8Tokyo.push(i)
        if (md.port) {
            if (md.region === "Philippines") { /* no op */ }
            if (isDEI(md.region)) g.deiPorts.push(i)
            if (md.region === "Guinea") g.ngPorts.push(i)
            if (md.region !== "China" && get_distance(i, TOKYO) <= 8) g.portsWithin8Tokyo.push(i)
        }
        if (md.airfield && md.region !== "China" && get_distance(i, TOKYO) <= 8) g.airfieldsWithin8Tokyo.push(i)
        if (md.airfield && !md.port && md.region !== "China" && get_distance(i, TOKYO) <= 5) g.airfieldsWithin5.push(i)
        if (md.name) g.allNamed[String(md.name).toLowerCase()] = i
    }
    ESM_PREP[sid] = g
    return g
}

// ===========================================================================
// 状态机缓存
// State machine cache
// ===========================================================================
function esm_key(seed) { return `${seed}|${G.sid}` }
// D1: 新对局出现时, 把 erasmus_ops 的外部链覆盖(EOP_OVERRIDE)一并清掉。
// gate 开路径的 erasmus.js 只在 gate 关/异常时清链, 多局同进程下第 2 局起会沿用
// 上一局末的链(实测: 同种子单局=T10、批内第2局=T12) —— 这里在新局边界统一清。
// D1: when a new game appears, clear the external-chain override (EOP_OVERRIDE) from erasmus_ops too.
// On the gate-on path, erasmus.js only clears the chain when the gate is off / on error; in a
// multi-game single process the 2nd game onward would reuse the previous game's final chain
// (measured: same-seed single game = T10, batch 2nd game = T12) — clear it uniformly at the new-game boundary here.
function esm_clear_cross_game() {
    if (typeof eop_clear_all_chains === "function") { try { eop_clear_all_chains() } catch (e) { /* ignore */ } }
}
function esm_new_lock(seed, ord) {
    const e = { turn: G.turn, role: { Japan: null, Allies: null }, seenOrd: ord || 0, lastOrdTurn: 0 }
    esm_clear_cross_game()
    return e
}
function esm_lock(seed) {
    const k = esm_key(seed)
    let e = ESM_LOCKED[k]
    if (!e) { e = esm_new_lock(seed, arguments[1]); ESM_LOCKED[k] = e }
    // 新对局检测: 回合回退 或 actionOrdinal 回退(多局同进程防串台)。
    // New-game detection: turn rollback or actionOrdinal rollback (prevent cross-talk across multiple games in one process).
    if ((G.turn < e.turn && e.turn > 0) || (arguments[1] !== undefined && arguments[1] < e.seenOrd && e.seenOrd > 0)) {
        delete ESM_LOCKED[k]
        e = esm_new_lock(seed, arguments[1])
        ESM_LOCKED[k] = e
        ESM_PREP = {} // 清一次地理缓存（保险, 通常同 sid 不变）
        // clear the geography cache once (insurance; usually unchanged for the same sid)
    }
    e.turn = G.turn
    return e
}
function esm_is_card_window(view) {
    const a = view && view.actions || {}
    return (typeof a.card !== "undefined" || (Array.isArray(a.card))) && /select card to play/i.test(String(view.prompt || ""))
}
function esm_is_card_action_window(view) {
    const a = view && view.actions || {}
    return /select action/i.test(String(view.prompt || "")) && ["ops", "event", "discard", "future_offensive", "inter_service"].some(x => a[x] !== undefined)
}
function esm_role_faction(role) { return role === "Japan" ? JP : AP }

// ===========================================================================
// 日志字段(手牌 LV 合计 —— 用户选定口径) 与 通用谓词
// Log field (hand LV total — user-chosen metric) and common predicates
// ===========================================================================
function esm_jp_logistics() {
    if (ESM_JP_LOGISTICS_CACHE.sid === G.sid && ESM_JP_LOGISTICS_CACHE.turn === G.turn) return ESM_JP_LOGISTICS_CACHE.value
    let sum = 0
    for (const c of (G.hand && G.hand[JP]) || []) {
        const lv = cards[c] && cards[c].logistic
        if (typeof lv === "number") sum += lv
    }
    ESM_JP_LOGISTICS_CACHE = { sid: G.sid, turn: G.turn, value: sum }
    return sum
}
function esm_count_carriers(faction) {
    let n = 0
    for (let u = 1; u < pieces.length; u++) {
        if (pieces[u].class !== "naval" || pieces[u].faction !== faction || !pieces[u].br) continue
        const loc = G.location[u]
        if (loc >= 0 && loc <= LAST_BOARD_HEX) n++
    }
    return n
}
function esm_count_ground(faction, regionPred) {
    let n = 0
    for (let u = 1; u < pieces.length; u++) {
        const p = pieces[u]
        if (p.faction !== faction || p.class !== "ground") continue
        const loc = G.location[u]
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        if (regionPred(esm_region(loc))) n++
    }
    return n
}
// AP HQ 是否存在某区域且断补
// Whether an AP HQ exists in some region and is out of supply
function esm_ap_hq_oos_in(regionPred) {
    const hqs = [HQ_SOUTH_WEST, HQ_MALAYA, HQ_ABDA, HQ_SEAC, HQ_ANZAC, HQ_CENTRAL_PACIFIC]
    for (const u of hqs) {
        const loc = G.location[u]
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        if (regionPred(esm_region(loc)) && (G.oos ? set_has(G.oos, u) : false)) return true
    }
    return false
}
function esm_ap_hq_supplied_at(regionPred) {
    const hqs = [HQ_SOUTH_WEST, HQ_MALAYA, HQ_ABDA]
    for (const u of hqs) {
        const loc = G.location[u]
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        if (regionPred(esm_region(loc)) && !(G.oos ? set_has(G.oos, u) : false)) return true
    }
    return false
}
function esm_card_removed(card) {
    return (G.removed && G.removed[AP]) ? set_has(G.removed[AP], card) : false
}
function esm_soviet_occurred() {
    return (G.removed && G.removed[AP]) ? set_has(G.removed[AP], SOVIET_INVADE) : false
}
function esm_soviet_playable() {
    if (!(G.hand && G.hand[AP]) || !set_has(G.hand[AP], SOVIET_INVADE)) return false
    try { return !!cards[SOVIET_INVADE].can_play() } catch (e) { return false }
}

// ===========================================================================
// 决策树自检用纯 ctx 版: 与 py 分支逐字一致(boolean 输入 -> 策略名)
// 供保真自测: 同 ctx 应得同策略名。
// Pure ctx version for decision-tree self-check: matches py branches verbatim (boolean input -> strategy name)
// for fidelity self-test: the same ctx should yield the same strategy name.
// ===========================================================================
function esm_d10_of(seedText) { return erasmus_hash(seedText) % 10 }

// JP 早期 (页1) —— 逐字: py evaluate_early
// JP early (page 1) — verbatim: py evaluate_early
function esm_trace_pred(ctx, node, predicate, value) {
    if (!ctx._nodePath) ctx._nodePath = []
    if (!ctx._conditions) ctx._conditions = []
    ctx._nodePath.push(node)
    ctx._conditions.push({ nodeId: node, predicate, result: !!value })
    return !!value
}
function esm_has_class_at(hex, faction, cls) {
    if (!(hex >= 0 && hex <= LAST_BOARD_HEX)) return false
    for (let u = 1; u < pieces.length; ++u)
        if (pieces[u].faction === faction && pieces[u].class === cls && G.location[u] === hex) return true
    return false
}

// 第3页脚注[2]：驻军全称量词只覆盖“日本仍控制”的格。盟军已经占领的港口/机场
// 不属于最终国防圈的驻军对象；把它们纳入 every() 会让 BC 永久为假，进而永远无法
// 进入 E“盟军地面单位在本州？”与最终防御战略。
// Page 3 footnote [2]: the garrison universal quantifier only covers hexes "still controlled by Japan".
// Ports/airfields already captured by the Allies are not garrison targets of the final defense
// perimeter; including them in every() would make BC permanently false and thus never reach
// E "Allied ground unit on Honshu?" and the final defense strategy.
function esm_jp_final_perimeter_status() {
    const ports = esm_geo().portsWithin8Tokyo.filter(h => is_space_controlled(h, JP))
    const airfields = esm_geo().airfieldsWithin5.filter(h => is_space_controlled(h, JP))
    return {
        portsGarrisoned: ports.every(h => esm_has_class_at(h, JP, "ground")),
        airfieldsGarrisoned: airfields.every(h => esm_has_class_at(h, JP, "air")),
        consideredPorts: ports,
        consideredAirfields: airfields,
    }
}
function esm_large_ground_steps(faction, regionPred) {
    let steps = 0
    for (let u = 1; u < pieces.length; ++u) {
        const p = pieces[u], loc = G.location[u]
        if (!p || p.faction !== faction || p.class !== "ground" || Number(p.lf || 0) < 12) continue
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX) || !regionPred(esm_region(loc))) continue
        steps += G.reduced && set_has(G.reduced, u) ? 1 : 2
    }
    return steps
}
function esm_cbi_defense_complete() {
    const requirements = [
        ["army_ap_1_ind", "Rangoon"], ["army_ap_b_ind", "Akyab"],
        ["army_ap_66_cn", "Lashio"], ["army_ap_6_cn", "Mandalay"],
        ["army_ap_5_cn", "Myitkyina"], ["army_ap_1_bu", "Imphal"],
    ]
    return requirements.every(([id, place]) => {
        const u = find_piece(id), loc = G.location[u]
        if (loc === ELIMINATED_BOX || loc === PERM_ELIMINATED) return true
        const target = esm_idx(place)
        return target !== null && loc === target
    })
}
function esm_trace_action(ctx, node, strategy) {
    if (!ctx._nodePath) ctx._nodePath = []
    ctx._nodePath.push(node)
    ctx._strategyNode = node
    return strategy
}
function esm_trace_d10(ctx, node, d10, salt) {
    const roll = typeof d10 === "number" ? d10 : esm_d10_of(ctx._seed + salt)
    if (!ctx._nodePath) ctx._nodePath = []
    if (!ctx._dice) ctx._dice = []
    ctx._nodePath.push(node)
    ctx._dice.push({ nodeId: node, sides: 10, result: roll, range: "0-9" })
    return roll
}

// 第1页实际箭头。组合框保持为单一节点，证据仍逐项写入 conditions。
// Page 1 actual arrows. The combination box stays a single node; evidence is still written per-item into conditions.
function esm_jp_eval_early(ctx, d10) {
    ctx._nodePath = ["JP01-START"]; ctx._conditions = []; ctx._dice = []
    const A = esm_trace_pred(ctx, "JP01-A", "AP_HQ_OOS_PHI_DEI_MALAYA", ctx.jp_A)
    if (!A) {
        const cd = esm_trace_pred(ctx, "JP01-CD", "JP_HAND_GE_3_AND_RES_LT_13", ctx.cards_in_hand >= 3 && ctx.jp_D_res_lt_13)
        if (!cd) return esm_trace_action(ctx, "JP01-S-CONSERVATIVE-AIR", "保守的空优战略")
        const f = esm_trace_pred(ctx, "JP01-F", "JP_LOGISTICS_GTE_20", ctx.jp_F_logistics_ge_20)
        return esm_trace_action(ctx, f ? "JP01-S-AGGRESSIVE-AIR" : "JP01-S-CONSERVATIVE-AIR", f ? "激进的空优战略" : "保守的空优战略")
    }
    const B = esm_trace_pred(ctx, "JP01-B", "DEI_SURRENDER_HEXES_ALL_OCCUPIED", ctx.jp_B_dei_surrender_hexes_occupied)
    if (!B) {
        const g = esm_trace_pred(ctx, "JP01-G", "TURN_GE_3", ctx.current_turn >= 3)
        if (g) return esm_trace_action(ctx, "JP01-S-AGGRESSIVE-RESOURCE", "激进的南方资源战略")
        const acd = esm_trace_pred(ctx, "JP01-ACD", "A_AND_HAND_GE_3_AND_RES_LT_13", ctx.cards_in_hand >= 3 && ctx.jp_D_res_lt_13)
        return esm_trace_action(ctx, acd ? "JP01-S-AGGRESSIVE-RESOURCE" : "JP01-S-EVENT", acd ? "激进的南方资源战略" : "事件战略")
    }
    const cehi = esm_trace_pred(ctx, "JP01-CEHI", "HAND_GE_3_AND_RES_GE_13_OR_LOGISTICS_LE_19_AND_DEI_AZOI", ctx.cards_in_hand >= 3 && (!ctx.jp_D_res_lt_13 || (ctx.jp_H_logistics_le_19 && ctx.jp_I_azoi_covers_dei_ports)))
    if (cehi) return esm_trace_action(ctx, "JP01-S-PERIMETER", "外围防御战略")
    const cjebik = esm_trace_pred(ctx, "JP01-CJEBIK", "HAND_GE_3_AND_RABAUL_GUADALCANAL_AND_RES_GE_13_AND_DEI_OR_NG", ctx.cards_in_hand >= 3 && ctx.jp_J_controls_rabaul_guadalcanal && !ctx.jp_D_res_lt_13 && (ctx.jp_B_dei_surrender_hexes_occupied || ctx.jp_I_azoi_covers_dei_ports || ctx.jp_K_controls_4_to_6_ng_ports))
    if (!cjebik) {
        const cl = esm_trace_pred(ctx, "JP01-CL", "HAND_GE_3_AND_MAL_PHI_DEI_INCOMPLETE", ctx.cards_in_hand >= 3 && ctx.jp_L_mal_phil_dei_not_conquered)
        if (cl) return esm_trace_action(ctx, "JP01-S-AGGRESSIVE-RESOURCE", "激进的南方资源战略")
        const m = esm_trace_pred(ctx, "JP01-M", "PERIMETER_TARGET_1_COMPLETE", ctx.jp_M_perimeter_target_1_complete)
        if (!m) return esm_trace_action(ctx, "JP01-S-PERIMETER", "外围防御战略")
    }
    const roll = esm_trace_d10(ctx, "JP01-D10", d10, ":jp-early")
    if (roll <= 2) return esm_trace_action(ctx, "JP01-S-EVENT", "事件战略")
    if (roll <= 6) return esm_trace_action(ctx, "JP01-S-AGGRESSIVE-RESOURCE", "激进的南方资源战略")
    return esm_trace_action(ctx, "JP01-S-CENTRAL-PACIFIC", "中太平洋战略")
}
// 保留 py 分支全量字段——以别名封装, 保持与 py 逐字可读
// Keep the py branch's full set of fields — wrapped as an alias, kept readable against py verbatim
function esm_jp_eval_early_py(ctx, d10) {
    // 别名映射 只用真字段, 实现见上 esm_jp_eval_early
    // Alias mapping only uses the real fields; see esm_jp_eval_early above
    return esm_jp_eval_early(ctx, d10)
}

// JP 中期 (页2) —— py evaluate_mid
// JP mid (page 2) — py evaluate_mid
function esm_jp_eval_mid(ctx, d10) {
    ctx._nodePath = ["JP02-START"]; ctx._conditions = []; ctx._dice = []
    if (!esm_trace_pred(ctx, "JP02-A", "JP_HAND_GE_3", ctx.cards_in_hand >= 3)) {
        if (esm_trace_pred(ctx, "JP02-B", "JP_CAN_PASS", ctx.can_pass)) return esm_trace_action(ctx, "JP02-S-PASS", "PASS")
        return esm_trace_action(ctx, "JP02-S-EVENT", "事件战略")
    }
    if (esm_trace_pred(ctx, "JP02-C", "JP_RESOURCE_COUNT_LT_13", ctx.jp_D_res_lt_13)) return esm_trace_action(ctx, "JP02-S-RESOURCE", "资源战略")
    const hi = esm_trace_pred(ctx, "JP02-D", "JP_LOGISTICS_GTE_20", ctx.jp_F_logistics_ge_20)
    if (hi && esm_trace_pred(ctx, "JP02-E", "US_POLITICAL_WILL_LT_4", ctx.jp_E_us_will_lt_4)) return esm_trace_action(ctx, "JP02-S-CENTRAL-PACIFIC", "中太平洋战略")
    if (!hi && !esm_trace_pred(ctx, "JP02-G", "JP_LOGISTICS_GTE_15", ctx.jp_G_logistics_ge_15)) return esm_trace_action(ctx, "JP02-S-PERIMETER", "外围防御战略")
    if (!esm_trace_pred(ctx, "JP02-F", "BURMA_SURRENDERED", ctx.jp_F_burma_surrendered)) return esm_trace_action(ctx, "JP02-S-CBI", "中缅印战略")
    const hij = esm_trace_pred(ctx, "JP02-HIJ", "GANDHI_OR_MORE_LARGE_STEPS_AND_LOGISTICS_GTE_18", (ctx.jp_H_has_gandhi || ctx.jp_I_more_steps_in_burma) && ctx.jp_J_logistics_ge_18)
    return esm_trace_action(ctx, hij ? "JP02-S-INDIA" : "JP02-S-PERIMETER", hij ? "印度战略" : "外围防御战略")
}

// JP 晚期 (页3) —— py evaluate_late
// JP late (page 3) — py evaluate_late
function esm_jp_eval_late(ctx, d10) {
    ctx._nodePath = ["JP03-START"]; ctx._conditions = []; ctx._dice = []
    if (!esm_trace_pred(ctx, "JP03-A", "JP_HAND_GE_3", ctx.cards_in_hand >= 3)) return esm_trace_action(ctx, "JP03-S-EVENT", "事件战略")
    const bc = esm_trace_pred(ctx, "JP03-BC", "TOKYO_8_PORTS_AND_TOKYO_5_AIRFIELDS_GARRISONED", ctx.jp_L_B_garrisons_within_8 && ctx.jp_L_C_airfields_within_5)
    if (!bc) return esm_trace_action(ctx, "JP03-S-FINAL-PERIMETER", "最终国防圈战略")
    if (esm_trace_pred(ctx, "JP03-D", "JP_CAN_PASS", ctx.can_pass)) return esm_trace_action(ctx, "JP03-S-PASS", "PASS")
    if (esm_trace_pred(ctx, "JP03-E", "ALLIED_GROUND_ON_HONSHU", ctx.jp_L_E_allied_on_honshu)) return esm_trace_action(ctx, "JP03-S-FINAL-DEFENSE", "最终防御战略")
    return esm_trace_action(ctx, "JP03-S-EVENT", "事件战略")
}

// AL 早期 (页7) —— py evaluate_early
// AL early (page 7) — py evaluate_early
function esm_al_eval_early(ctx, d10) {
    ctx._nodePath = ["AP07-START"]; ctx._conditions = []; ctx._dice = []
    if (!esm_trace_pred(ctx, "AP07-A", "AP_HAND_GE_3", ctx.cards_in_hand >= 3)) return esm_trace_action(ctx, "AP07-S-EVENT", "事件战略")
    if (esm_trace_pred(ctx, "AP07-B", "SUPPLIED_HQ_IN_PHILIPPINES", ctx.al_B_hq_supplied_phil)) return esm_trace_action(ctx, "AP07-S-EVAC-PHILIPPINES", "撤离菲律宾")
    if (esm_trace_pred(ctx, "AP07-C", "SUPPLIED_HQ_IN_MALAYA", ctx.al_C_hq_supplied_malaya)) return esm_trace_action(ctx, "AP07-S-EVAC-MALAYA", "撤离马来亚")
    if (!esm_trace_pred(ctx, "AP07-D", "ARCADIA_PLAYED", ctx.al_D_arcadia_played)) return esm_trace_action(ctx, "AP07-S-ABDA", "建立ABDA")
    if (!esm_trace_pred(ctx, "AP07-E", "CBI_DEFENSE_COMPLETE", ctx.al_E_cbi_def_established)) return esm_trace_action(ctx, "AP07-S-CBI", "增强CBI防御")
    if (esm_trace_pred(ctx, "AP07-FG", "HAS_PASS_AND_ONE_CARD_LEFT", ctx.al_F_has_passes && ctx.al_G_only_1_card_left)) return esm_trace_action(ctx, "AP07-S-PASS", "PASS")
    const orange = esm_trace_pred(ctx, "AP07-JKLMN", "ORANGE_PLAN_CRITERIA", ctx.al_J_phil_not_surrendered && ctx.al_K_service_agreement && ctx.al_L_has_2_carriers && ctx.al_M_us_corps_near_carrier && ctx.al_N_aus_no_jp_ground)
    if (orange) return esm_trace_action(ctx, "AP07-S-ORANGE", "橙色计划")
    const dei = esm_trace_pred(ctx, "AP07-OP", "DEI_NOT_SURRENDERED_AND_ABDA_SUPPLIED", ctx.al_O_dei_not_surrendered && ctx.al_P_abda_hq_supplied)
    return esm_trace_action(ctx, dei ? "AP07-S-DEI" : "AP07-S-OFFENSIVE", dei ? "DEI防御" : "攻势进攻")
}

// AL 中期 (页8) —— py evaluate_mid
// AL mid (page 8) — py evaluate_mid
function esm_al_eval_mid(ctx, d10) {
    ctx._nodePath = ["AP08-START"]; ctx._conditions = []; ctx._dice = []
    if (esm_trace_pred(ctx, "AP08-A", "AP_CAN_PASS", ctx.can_pass)) return esm_trace_action(ctx, "AP08-S-PASS", "PASS")
    const pow = esm_trace_pred(ctx, "AP08-B", "AP_NEEDS_PROGRESS_OF_WAR", ctx.al_M_B_needs_war_progress)
    if (pow) {
        const combined = ctx.cards_in_hand >= 3 && ctx.al_M_D_jp_controls_counterattack_target
        if (esm_trace_pred(ctx,"AP08-D","AP_HAND_GE_3_AND_JP_CONTROLS_COUNTERATTACK_TARGET",combined))
            return esm_trace_action(ctx,"AP08-S-COUNTEROFFENSIVE","反攻战略")
        ctx._offensiveCardGrouping = true
        ctx._nodePath.push("AP08-CARD-GROUP")
    } else if (!esm_trace_pred(ctx,"AP08-C","AP_HAND_GE_3",ctx.cards_in_hand>=3))
        return esm_trace_action(ctx,"AP08-S-EVENT","事件战略")
    const roll = esm_trace_d10(ctx, "AP08-D10", d10, ":al-mid")
    if (roll <= 4) return esm_trace_action(ctx, "AP08-S-SOUTH-PACIFIC", "南太平洋战略")
    if (roll <= 7) return esm_trace_action(ctx, "AP08-S-CENTRAL-PACIFIC", "中太平洋战略")
    if (roll === 8) return esm_trace_action(ctx, "AP08-S-DEI", "DEI战略")
    return esm_trace_action(ctx, "AP08-S-CBI", "CBI战略")
}

// AL 晚期 (页9) —— py evaluate_late
// AL late (page 9) — py evaluate_late
function esm_al_eval_late(ctx, d10) {
    ctx._nodePath = ["AP09-START"]; ctx._conditions = []; ctx._dice = []
    if (esm_trace_pred(ctx, "AP09-A", "AP_CAN_PASS", ctx.can_pass)) return esm_trace_action(ctx, "AP09-S-PASS", "PASS")
    const finalTurn = esm_trace_pred(ctx, "AP09-B", "TURN_12", ctx.al_L_B_is_turn_12)
    // 图表第9页：B=YES 直接进入 F。最后一回合跳过手牌数、基地和 B29 就位检查，
    // 也与脚注[1]“第12回合永远不要把卡牌作为 FO”一致。
    // Chart page 9: B=YES goes straight to F. The final turn skips the hand-size, base and
    // B29-ready checks, consistent with footnote [1] "on turn 12 never play a card as FO".
    if (!finalTurn) {
        if (!esm_trace_pred(ctx, "AP09-C", "AP_HAND_GE_3", ctx.cards_in_hand >= 3)) return esm_trace_action(ctx, "AP09-S-EVENT", "事件战略")
        if (!esm_trace_pred(ctx, "AP09-D", "AP_HAS_STRATEGIC_BOMBING_BASE", ctx.al_L_D_has_strategic_bombing_base)) return esm_trace_action(ctx, "AP09-S-CAPTURE-BOMBING-BASE", "占领轰炸基地")
        if (!esm_trace_pred(ctx, "AP09-E", "ALL_MAP_B29_ON_BASE", ctx.al_L_E_all_b29_on_base)) return esm_trace_action(ctx, "AP09-S-PUSH-B29", "推进B29")
    }
    if (!esm_trace_pred(ctx, "AP09-F", "AP_CONTROLS_HEX_WITHIN_TOKYO_8", ctx.al_L_F_controls_hex_within_8_tokyo)) {
        const roll = esm_trace_d10(ctx, "AP09-D10", d10, ":al-late")
        if (roll <= 2) return esm_trace_action(ctx, "AP09-S-RETURN-PHILIPPINES", "重返菲律宾")
        if (roll <= 5) return esm_trace_action(ctx, "AP09-S-ISLAND-HOPPING", "跳岛作战")
        return esm_trace_action(ctx, "AP09-S-ALTERNATE", "轮流战略")
    }
    if (esm_trace_pred(ctx, "AP09-G", "AP_MEETS_ATOMIC_BOMB_STRATEGY_CRITERIA", ctx.al_L_G_meets_atomic_bomb_criteria)) return esm_trace_action(ctx, "AP09-S-ATOMIC", "原子弹胜利")
    return esm_trace_action(ctx, "AP09-S-INVADE-JAPAN", "登陆日本")
}

// ===========================================================================
// 引擎真实状态 -> ctx 布尔
// Engine real state -> ctx booleans
// ===========================================================================
// D3: 引擎口径的 PoW 银行 —— G.capture 中当前仍由 AP 控制的格数(= cycle.js
// check_progress_of_war 的 pow_count)。政治阶段据此判是否 -1 PW, 盟军在首卡窗应据此
// 知道"本回合是否必须靠夺格把银行补回 ≥G.pow"。
// D3: engine-caliber PoW bank — the number of hexes in G.capture still controlled by AP now
// (= pow_count in cycle.js check_progress_of_war). The political phase decides whether to
// -1 PW from this, so at the first-card window the Allies should know from it "whether this
// turn must recapture hexes to bring the bank back to >= G.pow".
function esm_pow_bank() {
    try {
        let n = 0
        for (const h of (G.capture || [])) {
            if (h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, AP)) n++
        }
        return n
    } catch (e) { return 0 }
}
// D5: 引擎 victory_1945 的日本控制资源格(get_jp_resources() 同源计数, 剧本 RESOURCE_HEX)。
// D5: engine victory_1945's Japan-controlled resource hexes (same-origin count as get_jp_resources(), scenario RESOURCE_HEX).
function esm_jp_resource_hexes() {
    try {
        if (typeof RESOURCE_HEX === "undefined" || typeof G === "undefined") return []
        return RESOURCE_HEX.filter(h => h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, JP))
    } catch (e) { return [] }
}
function esm_hex_trace(h, role) {
    try {
        const md = get_map_data(h) || {}
        return {
            hex: h,
            id: md.id,
            name: md.name || null,
            region: md.region || null,
            resource: !!md.resource,
            controlledBy: is_space_controlled(h, AP) ? "Allies" : "Japan",
            achieved: is_space_controlled(h, esm_role_faction(role)),
            distanceToTokyo: get_distance(h, TOKYO),
        }
    } catch (e) { return { hex: h } }
}
function esm_advance_metrics() {
    try {
        let unit = null, controlled = null, b29 = null
        for (let u = 1; u < pieces.length; ++u) {
            const p = pieces[u], h = G.location[u]
            if (!p || p.faction !== AP || !(h >= 0 && h <= LAST_BOARD_HEX)) continue
            const d = get_distance(h, TOKYO)
            if (!unit || d < unit.distance || d === unit.distance && h < unit.hex) unit = { unit: u, hex: h, distance: d }
            if (p.b29 !== undefined && (!b29 || d < b29.distance)) b29 = { unit: u, hex: h, distance: d }
        }
        for (let h = 0; h <= LAST_BOARD_HEX; ++h) {
            if (!is_controllable_hex(h) || !is_space_controlled(h, AP)) continue
            const d = get_distance(h, TOKYO)
            if (!controlled || d < controlled.distance || d === controlled.distance && h < controlled.hex)
                controlled = { hex: h, distance: d, name: (get_map_data(h) || {}).name || null }
        }
        return { closestAlliedUnit: unit, closestAlliedControlledHex: controlled, closestB29: b29 }
    } catch (e) { return {} }
}
function esm_strategy_targets(strategy) {
    const chain = strategy && Array.isArray(strategy.chain) ? strategy.chain : []
    const targetMeta = strategy && Array.isArray(strategy.targetMeta) ? strategy.targetMeta : []
    const byHex = new Map(targetMeta.map(target => [target.hex, target]))
    return chain.slice(0, 12).map((h, index) => {
        const meta = byHex.get(h) || {}
        const target = Object.assign({ priority: index + 1 }, esm_hex_trace(h, strategy.role), meta)
        if (meta.kind === "SUPPRESS" || meta.kind === "SUPPRESS_HQ") {
            const mine = esm_role_faction(strategy.role)
            try { target.achieved = !has_zoi(h, 1 - mine) } catch (e) { target.achieved = false }
        } else if (meta.kind === "GARRISON") {
            const mine = esm_role_faction(strategy.role)
            try {
                const controlled = is_space_controlled(h, mine)
                target.ignored = !controlled
                target.achieved = !controlled || esm_has_class_at(h, mine, meta.garrisonClass || "ground")
            } catch (e) { target.achieved = false }
        }
        return target
    })
}

// 第5/11页编队器需要知道一个地图目标究竟是“压制”还是“夺占”。此前仅动态 HQ
// 带元数据，普通目标全部退化为无类型 hex，导致敌控岛屿也可能被一架飞机视为完成。
// The page 5/11 formation builder needs to know whether a map target is "suppress" or
// "capture". Previously only dynamic HQs carried metadata, so ordinary targets all degraded
// to typeless hexes, letting an enemy-held island be counted done by a single aircraft.
function esm_goal_target_meta(goals) {
    const out = [], seen = new Set()
    for (const goal of goals || []) {
        for (const hex of goal.hexes || []) {
            if (seen.has(hex)) continue
            seen.add(hex)
            const suppress = goal.kind === "SUPPRESS"
            const garrisonClass = goal.kind === "GARRISON" ? (/机场/.test(goal.text) ? "air" : "ground") : null
            out.push({ ...goal.meta, hex, kind: goal.kind, objective: goal.text, garrisonClass: goal.meta && goal.meta.garrisonClass || garrisonClass,
                damageLevel: suppress ? 0.5 : 1,
                requiresOccupation: goal.kind === "CONQUEST" || goal.kind === "INVADE_JAPAN" })
        }
    }
    return out
}

// Typed chart instructions. IDs are the engine's counter identities, never display-name guesses.
const ESM_REDEPLOY = {
    "撤离菲律宾": [["army_ap_p", "Biak"], ["army_ap_r", "Kendari"], ["army_ap_sl", "Manila"], ["air_ap_feaf", "Manila"], ["air_ap_19_lrb", "Timor"]],
    "撤离马来亚": [["army_ap_8_au", "Kendari"], ["air_ap_ma", "Palembang"]],
    "增强CBI防御": [["army_ap_1_ind", "Rangoon"], ["army_ap_b_ind", "Akyab"], ["army_ap_66_cn", "Lashio"], ["army_ap_6_cn", "Mandalay"], ["army_ap_5_cn", "Myitkyina"], ["army_ap_1_bu", "Imphal"]],
}
const ESM_FORTIFY = ["Truk", "Rabaul", "Saipan", "Davao", "Saigon", "Eniwetok", "Kwajalein", "Palau", "Timor", "Kendari", "Soerabaja", "Balikpapan", "Tarakan", "Rangoon", "Mandalay", "Lashio"]
function esm_on_map(u) { const h = G.location[u]; return Number.isInteger(h) && h >= 0 && h <= LAST_BOARD_HEX }
function esm_redeploy_targets(name) {
    const targets = []
    for (const [id, place] of ESM_REDEPLOY[name] || []) {
        const u = find_piece(id), hex = esm_idx(place)
        if (!(u > 0) || !esm_on_map(u) || !Number.isInteger(hex)) continue
        let target = targets.find(t => t.hex === hex)
        if (!target) targets.push(target = { hex, kind: "REDEPLOY", requiredUnits: [], requiresFriendlyControl: true,
            requiresOccupation: false, movementModes: ["SR"], objective: name + ":" + place })
        target.requiredUnits.push(u)
    }
    return targets
}
function esm_redeploy_complete(name) {
    return esm_redeploy_targets(name).every(t => t.requiredUnits.every(u => G.location[u] === t.hex))
}
function esm_hq_reachable_hexes(hq) {
    if (!(hq > 0) || !esm_on_map(hq) || G.oos && set_has(G.oos, hq)) return []
    // Use the engine's command path algorithm, including hostile AZOI and land barriers.
    if (typeof mark_activation_zone === "function" && typeof HEX_TEMP_FLAG3 !== "undefined" && Array.isArray(G.supply_cache)) {
        const saved = G.supply_cache.slice()
        try { mark_activation_zone(hq); return G.supply_cache.flatMap((flags, h) => h <= LAST_BOARD_HEX && flags & HEX_TEMP_FLAG3 ? [h] : []) }
        finally { G.supply_cache = saved }
    }
    return [] // No geometric approximation when a real command path is unavailable.
}
function esm_attack_targets(role, classes, extraOnly) {
    const mine = esm_role_faction(role), enemy = 1 - mine, found = new Map()
    for (let u = 1; u < pieces.length; ++u) {
        const p = pieces[u]
        if (!p || p.faction !== enemy || !esm_on_map(u)) continue
        if (!classes.includes(p.class) && !(classes.includes("carrier") && p.class === "naval" && p.br)) continue
        if (role === "Japan" && p.service !== "navy") continue
        const hex = G.location[u]
        if (!found.has(hex)) found.set(hex, { hex, kind: "NAVAL", damageLevel: 1, requiresOccupation: false,
            targetClasses: classes, extraActivationOnly: !!extraOnly, objective: extraOnly ? "剩余激活点攻击敌军航空/航母" : "攻击最弱敌军海空堆叠",
            preserveLastCarrier: role === "Allies" })
    }
    const strength = t => pieces.reduce((sum, p, u) => sum + (p && p.faction === enemy && G.location[u] === t.hex ? Number(G.reduced && set_has(G.reduced, u) ? p.rcf : p.cf) || 0 : 0), 0)
    const typePriority = t => {
        const stack = pieces.filter((p, u) => p && p.faction === enemy && G.location[u] === t.hex)
        return stack.some(p => p.class === "air") ? (stack.some(p => p.class === "naval") ? 1 : 0) : 2
    }
    return [...found.values()].sort((a,b) => typePriority(a)-typePriority(b) || strength(a)-strength(b) || a.hex-b.hex)
}
function esm_orange_targets() {
    const leyte = esm_idx("Leyte"), hex = is_space_controlled(leyte, JP) ? esm_idx("Manila") : leyte
    const md = get_map_data(hex)
    if (!md || md.region !== "Philippines" || !md.port || !is_space_controlled(hex, AP)) return []
    const escortPairs = []
    for (let g = 1; g < pieces.length; ++g) {
        const p = pieces[g]
        if (!p || p.faction !== AP || p.class !== "ground" || p.service !== "army" || p.size !== 3 || !esm_on_map(g)) continue
        if (get_distance(G.location[g], hex) > 15 || G.location[g] === hex) continue
        for (let c = 1; c < pieces.length; ++c) {
            const q = pieces[c]
            if (q && q.faction === AP && q.class === "naval" && q.br && q.service === "navy" && G.location[c] === G.location[g])
                escortPairs.push({ ground:g, carrier:c, origin:G.location[g] })
        }
    }
    return escortPairs.length ? [{hex,kind:"REDEPLOY",escortRequired:true,escortPairs,maxDistance:15,
        requiresFriendlyControl:true,requiresOccupation:false,movementModes:["SR"],objective:"橙色计划：同格美国陆军军与航母共同战略移动"}] : []
}
function esm_semantic_targets(role, phase, name, metadata) {
    let out = metadata.map(t => ({...t}))
    if (role === "Allies" && ESM_REDEPLOY[name]) return esm_redeploy_targets(name)
    if (role === "Allies" && name === "DEI防御") {
        const hex = G.location[HQ_ABDA], md = get_map_data(hex)
        return esm_on_map(HQ_ABDA) && md && md.port && is_space_controlled(hex,AP) ? [{hex,kind:"GARRISON",
            garrisonClass:"ground",unitFilter:"COMMONWEALTH_OR_US_ARMY",garrisonRequirement:{groundSteps:1},
            requiresFriendlyControl:true,objective:"派一个英联邦或美国陆军军至ABDA当前港口"}] : []
    }
    if (role === "Allies" && name === "橙色计划") return esm_orange_targets()
    if (role === "Allies" && name === "攻势进攻") return esm_attack_targets(role,["air","naval"],false)
    if (role === "Japan" && phase === "mid" && name === "中太平洋战略") out.push(...esm_attack_targets(role,["naval"],false))
    if (role === "Allies" && name === "重返菲律宾") {
        const leyte = esm_idx("Leyte"), reachable = new Set(esm_hq_reachable_hexes(HQ_SOUTH_WEST))
        const bases = []
        for (const hex of reachable) {
            const md = get_map_data(hex)
            if (hex !== leyte && md && (md.port || md.airfield) && get_distance(hex,leyte) <= 4)
                bases.push({hex,kind:"CONQUEST",requiresOccupation:true,damageLevel:1,targetGroup:0,
                    objective:"连接SW Pacific HQ并在Leyte四格内的基地",dynamicBase:true,requiredHQ:HQ_SOUTH_WEST})
        }
        bases.sort((a,b) => Number(is_space_controlled(b.hex,AP))-Number(is_space_controlled(a.hex,AP)) || esm_front_distance(a.hex,AP)-esm_front_distance(b.hex,AP) || a.hex-b.hex)
        // A single qualifying base satisfies this instruction; never substitute Leyte itself.
        out = bases.slice(0,1).concat(out.filter(t => !/连接/.test(t.objective)))
    }
    if (role === "Allies" && name === "跳岛作战") out = out.map((t,i) => ({...t,strictSequential:true,targetGroup:i+1}))
    if (role === "Allies" && (name === "反攻战略" || name === "推进B29")) {
        if (name === "反攻战略") out = out.map(t => ({...t,advanceBaseIfUnreachable:true}))
        out.push(...esm_attack_targets(role,name === "推进B29" ? ["air","carrier"] : ["air"],true))
    }
    if (role === "Allies" && phase === "mid") out = out.filter(t => {
        if (name === "南太平洋战略" && [esm_idx("Gasmata"),esm_idx("Rabaul")].includes(t.hex)) {
            return pieces.filter((p,u)=>p&&p.faction===JP&&p.class==="ground"&&p.size>=3&&G.location[u]===t.hex).length < 2
        }
        if (name === "反攻战略" && t.hex === esm_idx("Attu/Kiska")) {
            const groundNear = pieces.some((p,u)=>p&&p.faction===AP&&p.class==="ground"&&esm_on_map(u)&&get_distance(G.location[u],t.hex)<=10)
            const carrierNear = pieces.some((p,u)=>p&&p.faction===AP&&p.class==="naval"&&p.br&&esm_on_map(u)&&get_distance(G.location[u],t.hex)<=15)
            return groundNear && (!(G.inter_service && G.inter_service[AP]===1) || carrierNear)
        }
        return true
    })
    return out
}

// 第3页最终防御[4]-[8]：实际作战焦点是本州上的盟军地面单位，而不是资源轴。
// 目标位置按距东京、hex 稳定排序；操作层随后只从日本区域选集结/支援单位。
// Page 3 final defense [4]-[8]: the actual operations focus is Allied ground units on Honshu,
// not the resource axis. Target positions are stably sorted by distance to Tokyo then hex;
// the operations layer then picks rally/support units only from the Japan region.
function esm_jp_final_defense_targets() {
    const found = new Map()
    for (let u = 1; u < pieces.length; ++u) {
        const p = pieces[u], h = G.location[u]
        if (!p || p.faction !== AP || p.class !== "ground" || !(h >= 0 && h <= LAST_BOARD_HEX)) continue
        const md = get_map_data(h)
        if (!md || md.region !== "Japan") continue
        if (!found.has(h)) found.set(h, {
            hex: h, kind: "DEFEND_HONSHU", objective: "最终防御：集结、海空支援、板载冲锋",
            damageLevel: 1, requiresOccupation: true, homeDefense: true,
        })
    }
    return [...found.values()].sort((a, b) => get_distance(a.hex, TOKYO) - get_distance(b.hex, TOKYO) || a.hex - b.hex)
}

// 图表第1页的“压制盟军HQ”不是固定地图地名，而是三个会移动的 HQ 当前所在格。
// 仅仍在地图且有补给的 HQ 是待压制目标；已经断补或离图即视为该项完成。
// Page 1's "suppress Allied HQ" is not a fixed map name but the current hexes of the three
// mobile HQs. Only HQs still on map and in supply are suppression targets; one that is
// already out of supply or off-map counts as done.
function esm_jp_hq_suppression_targets() {
    const specs = [
        // 开局菲律宾 HQ 位于马尼拉。图表脚注允许通过占领基地来切断/覆盖 HQ；
        // 若只把它当作一次空袭，地面军会在同一攻势里改去次要目标，菲律宾守军
        // 随后反复获得反应机会。第2回合因此把马尼拉标为“压制且优先夺占”。
        // At start the Philippines HQ is in Manila. The chart footnote allows cutting/covering
        // the HQ by capturing the base; if treated only as an air strike, the ground army would
        // switch to secondary targets in the same offensive and the Philippine garrison would
        // keep getting reaction opportunities. Turn 2 therefore marks Manila "suppress and capture first".
        { unit: HQ_SOUTH_WEST, objective: "压制菲律宾HQ（开局优先夺占马尼拉）", damageLevel: 0.25, openingCapture: true },
        { unit: HQ_MALAYA, objective: "压制新加坡HQ", damageLevel: 0.5 },
        { unit: HQ_ABDA, objective: "压制ABDA HQ", damageLevel: 0.5 },
    ]
    const targets = []
    for (const spec of specs) {
        const h = G.location[spec.unit]
        if (!(h >= 0 && h <= LAST_BOARD_HEX)) continue
        if (G.oos && set_has(G.oos, spec.unit)) continue
        targets.push({ hex: h, unit: spec.unit, objective: spec.objective, damageLevel: spec.damageLevel,
            kind: "SUPPRESS_HQ", rangedSupport: true,
            requiresOccupation: !!(spec.openingCapture && G.turn === 2) })
    }
    return targets
}

// 第1页“激进的南方资源战略”中的东印度投降目标不是“压制东印度”目标表。
// 两者过去都被扁平化成一串 hex，日志很难证明层级，而且 Batavia 的脚注[6]
// 没有执行。这里保存图表的四级顺序，并把条件证据写入目标元数据。
// The East Indies surrender target in page 1's "aggressive Southern Resource strategy" is not
// the "suppress East Indies" target table. Both were previously flattened into a single hex
// list, making the hierarchy hard to prove in logs, and Batavia's footnote [6] was not
// implemented. Here we keep the chart's four-group order and write conditional evidence into target metadata.
function esm_jp_dei_surrender_targets() {
    const groupNames = [
        ["Balikpapan", "Tarakan"],
        ["Batavia"],
        ["Tjilatjap", "Soerabaja"],
        ["Bangka", "Palembang", "Medan"],
    ]
    const batavia = esm_idx("Batavia")
    let otherJapaneseGroundOnJava = false
    for (let u = 1; u < pieces.length; ++u) {
        const h = G.location[u], p = pieces[u]
        if (!p || p.faction !== JP || p.class !== "ground" || h === batavia || !(h >= 0 && h <= LAST_BOARD_HEX)) continue
        const md = get_map_data(h)
        if (md && md.region === "Java") { otherJapaneseGroundOnJava = true; break }
    }
    const out = []
    for (let group = 0; group < groupNames.length; ++group) {
        for (const name of groupNames[group]) {
            const hex = esm_idx(name)
            if (!Number.isInteger(hex) || !(hex >= 0 && hex <= LAST_BOARD_HEX)) continue
            const conditional = name === "Batavia"
            if (conditional && otherJapaneseGroundOnJava) continue
            out.push({ hex, kind: conditional ? "GARRISON" : "CONQUEST", requiresOccupation: !conditional, damageLevel: 1,
                ...(conditional ? {requiresFriendlyControl:true,ignoreIfEnemy:true,garrisonRequirement:{groundSteps:3},garrisonClass:"ground"} : {}),
                objective: `${group + 1}. 东印度投降：${groupNames[group].join(", ")}`,
                targetGroup: group + 1, targetInGroup: groupNames[group].indexOf(name) + 1,
                condition: conditional ? "NO_OTHER_JP_GROUND_ON_JAVA" : null,
                conditionResult: conditional ? !otherJapaneseGroundOnJava : true,
                ruleNote: conditional ? "[6] 爪哇岛没有其他日本地面部队时才占领 Batavia" : null })
        }
    }
    return out
}

function esm_front_distance(hex, faction) {
    let best = 99
    for (let u = 1; u < pieces.length; ++u) {
        const p = pieces[u], loc = G.location[u]
        if (!p || p.faction !== faction || p.class !== "ground" || !(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        best = Math.min(best, get_distance(loc, hex))
    }
    return best
}

// 日本本土连续三个国势阶段无法向资源格追溯路径时，盟军按基础规则封锁获胜。
// 这是第9页 G=NO 后的规则胜利约束，不伪装成图表节点。海路追溯由 supply.js 的
// check_japan_resource_trace() 判定；夺港后仍需航空驻军产生未被中和的盟军 AZOI。
// When Japan's home islands cannot trace a path to resource hexes for three consecutive
// political phases, the Allies win by blockade under the basic rules. This is the rule-victory
// constraint after page 9 G=NO, not disguised as a chart node. Sea trace is decided by
// supply.js check_japan_resource_trace(); after capturing ports, air garrison is still needed
// to produce an un-neutralized Allied AZOI.
function esm_ap_blockade_targets() {
    const specs = [
        ["Shanghai", "北方资源线：占领上海并建立航空封锁"],
        ["Tsingtao", "北方资源线：占领青岛并建立航空封锁"],
        ["Port Arthur", "北方资源线：占领旅顺并建立航空封锁"],
        ["Pusan", "朝鲜海峡资源线：夺取釜山并建立AZOI切断满洲/朝鲜资源追溯"],
        ["Seoul", "朝鲜海峡资源线：夺取汉城并建立AZOI切断满洲/朝鲜资源追溯"],
        ["Tainan", "南方资源线：夺取台南机场并建立AZOI"],
        ["Taihoku", "南方资源线：夺取台北机场并建立AZOI"],
        ["Okinawa", "南方资源线：夺取冲绳并建立AZOI"],
        ["Iwo Jima", "南方资源线：夺取硫磺岛并建立AZOI"],
        ["Saipan", "南方资源线：夺取塞班并建立AZOI"],
        ["Guam", "南方资源线：夺取关岛并建立AZOI"],
    ]
    const targets = []
    for (const [name, objective] of specs) {
        const hex = esm_idx(name)
        if (!(hex >= 0 && hex <= LAST_BOARD_HEX)) continue
        if (is_space_controlled(hex, JP)) {
            targets.push({ hex, kind: "CONQUEST", objective, damageLevel: 1,
                requiresOccupation: true, victoryConstraint: "JAPAN_RESOURCE_BLOCKADE" })
        } else if (is_space_controlled(hex, AP) && get_map_data(hex).airfield && !esm_has_class_at(hex, AP, "air")) {
            targets.push({ hex, kind: "GARRISON", garrisonClass: "air",
                objective: `${objective}：部署盟军航空兵`,
                victoryConstraint: "JAPAN_RESOURCE_BLOCKADE_AZOI" })
        }
    }
    return targets
}

// 规则 16.47 是盟军每回合必须满足的生存条件。图表决定战区，本函数只把该战区
// 内能计入 G.capture 的未占目标提到前面；不足时再补入最近、守军较弱的合法计分格。
// 它不改变控制权或战力，只防止 AI 有可夺目标却把整手牌耗在不计 PoW 的移动上。
// Rule 16.47 is the survival condition the Allies must satisfy every turn. The chart decides
// the theater; this function only promotes unheld targets in that theater that count into
// G.capture, and if insufficient adds the nearest, weakly-defended legal scoring hexes. It
// does not change control or combat strength — it only stops the AI from wasting the whole
// hand on moves that don't count toward PoW when a capturable target exists.
function esm_ap_progress_targets(existingChain, existingMeta) {
    const deficit = Math.max(0, Number(G.pow || 0) - esm_pow_bank())
    if (G.turn < 4 || deficit <= 0) return []
    const byHex = new Map((existingMeta || []).map(x => [x.hex, x]))
    const eligible = h => {
        const md = get_map_data(h)
        return h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, JP) && is_controllable_hex(h) &&
            !!(md && (md.name || md.resource || md.port || md.airfield))
    }
    const candidates = []
    for (const h of existingChain || []) if (eligible(h) && !candidates.includes(h)) candidates.push(h)
    const defense = h => {
        let n = 0
        for (let u = 1; u < pieces.length; ++u) if (pieces[u] && pieces[u].faction === JP && G.location[u] === h)
            n += Number((G.reduced && set_has(G.reduced, u) ? pieces[u].rcf : pieces[u].cf) || 0)
        return n
    }
    const chainSet = new Set(existingChain || [])
    candidates.sort((a, b) =>
        Number(esm_front_distance(a, AP) > 6) - Number(esm_front_distance(b, AP) > 6)
        || (G.turn >= 9 ? Number(!get_map_data(a).resource) - Number(!get_map_data(b).resource) : 0)
        || Number(!chainSet.has(a)) - Number(!chainSet.has(b))
        || defense(a) - defense(b)
        || esm_front_distance(a, AP) - esm_front_distance(b, AP) || a - b)
    return candidates.slice(0, Math.max(deficit + 2, 4)).map((hex, i) => ({
        ...(byHex.get(hex) || {}), hex, kind: "CONQUEST", requiresOccupation: true,
        damageLevel: (byHex.get(hex) || {}).damageLevel || 1,
        objective: (byHex.get(hex) || {}).objective || `战争进程计分目标 ${i + 1}`,
        victoryConstraint: "PROGRESS_OF_WAR",
    }))
}
function esm_build_ctx(role, lock, seedText) {
    const ctx = {
        cards_in_hand: (G.hand && G.hand[esm_role_faction(role)]) ? G.hand[esm_role_faction(role)].length : 5,
        can_pass: !!(G.passes && G.passes[esm_role_faction(role)] > 0),
        current_turn: G.turn,
        _seed: seedText || "",
        notes: [],
    }
    const jpRes = (typeof get_jp_resources === "function") ? get_jp_resources() : 13
    if (role === "Japan") {
        const surr = n => (G.surrender && G.surrender[n] ? true : false)
        const ngIn = r => r === "Guinea"
        const deiR = r => r === "DEI" || r === "Java" || r === "Sumatra" || r === "Borneo" || r === "Celebes"
        const philIn = r => r === "Philippines"
        ctx.jp_A = esm_ap_hq_oos_in(r => philIn(r) || deiR(r) || r === "Malaya")
        ctx.jp_B_dei_surrender_hexes_occupied = (typeof nations !== "undefined") ? nations.DEI.keys.every(k => is_space_controlled(hex_to_int(k), JP)) : false
        ctx.jp_D_res_lt_13 = jpRes < 13
        const logistics = esm_jp_logistics()
        ctx.jp_F_logistics_ge_20 = logistics >= 20
        ctx.jp_H_logistics_le_19 = logistics <= 19
        ctx.jp_I_azoi_covers_dei_ports = (() => {
            try { return esm_geo().deiPorts.every(h => has_zoi(h, JP)) } catch (e) { return false }
        })()
        ctx.jp_J_controls_rabaul_guadalcanal = is_space_controlled(esm_idx("Rabaul"), JP) && is_space_controlled(esm_idx("Guadalcanal"), JP)
        ctx.jp_K_controls_4_to_6_ng_ports = (() => {
            const n = esm_geo().ngPorts.filter(h => is_space_controlled(h, JP)).length
            return n >= 4 && n <= 6
        })()
        ctx.jp_L_mal_phil_dei_not_conquered = !(surr(nations.MALAYA.id) && surr(nations.DEI.id) && surr(nations.PHILIPPINES.id))
        // M 外围防御目标1完成: 早期南方/外围首步 Sarong/Vogelkop/Biak/Guadalcanal/PortMoresby 均由 JP 控制(近似, trace 标注)
        // M perimeter target 1 complete: early southern/perimeter first step Sarong/Vogelkop/Biak/Guadalcanal/Port Moresby all controlled by JP (approximation, noted in trace)
        ctx.jp_M_perimeter_target_1_complete = (() => {
            try {
                const h = ["Sarong", "Vogelkop", "Biak", "Guadalcanal", "Port Moresby"].map(t => esm_idx(t)).filter(x => x != null)
                return h.length > 0 && h.every(x => is_space_controlled(x, JP))
            } catch (e) { return false }
        })()
        // 中期
        // mid
        // JP02-E 原文是“美国政治意志<4”，不是欧洲战事状态。
        // JP02-E original is "US political will < 4", not the European-war status.
        ctx.jp_E_us_will_lt_4 = Number(G.political_will) < 4
        ctx.jp_F_burma_surrendered = (typeof nations !== "undefined") ? surr(nations.BURMA.id) : false
        ctx.jp_G_logistics_ge_15 = logistics >= 15
        ctx.jp_H_has_gandhi = (() => {
            try { return set_has(G.hand[JP], find_card(JP, 15)) || set_has(G.hand[JP], find_card(JP, 21)) } catch (e) { return false }
        })()
        ctx.jp_I_more_steps_in_burma = esm_large_ground_steps(JP, r => r === "Burma") > esm_large_ground_steps(AP, r => r === "Burma")
        ctx.jp_J_logistics_ge_18 = logistics >= 18
        // 晚期
        // late
        const perimeter = esm_jp_final_perimeter_status()
        ctx.jp_L_B_garrisons_within_8 = perimeter.portsGarrisoned
        ctx.jp_L_C_airfields_within_5 = perimeter.airfieldsGarrisoned
        ctx.jp_L_E_allied_on_honshu = esm_count_ground(AP, r => r === "Japan") > 0
    } else {
        const surr = n => (G.surrender && G.surrender[n] ? true : false)
        const philIn = r => r === "Philippines"
        const malIn = r => r === "Malaya"
        const deiR = r => r === "DEI" || r === "Java" || r === "Sumatra" || r === "Borneo" || r === "Celebes"
        ctx.al_B_hq_supplied_phil = esm_ap_hq_supplied_at(philIn) && !esm_redeploy_complete("撤离菲律宾")
        ctx.al_C_hq_supplied_malaya = esm_ap_hq_supplied_at(malIn) && !esm_redeploy_complete("撤离马来亚")
        ctx.al_D_arcadia_played = (() => {
            try { return esm_card_removed(find_card(AP, 4)) || G.location[HQ_ABDA] >= 0 && G.location[HQ_ABDA] <= LAST_BOARD_HEX } catch (e) { return false }
        })()
        ctx.al_E_cbi_def_established = (() => { try { return esm_cbi_defense_complete() } catch (e) { return false } })()
        ctx.al_F_has_passes = ctx.can_pass
        ctx.al_G_only_1_card_left = ctx.cards_in_hand <= 1
        ctx.al_J_phil_not_surrendered = (typeof nations !== "undefined") ? !surr(nations.PHILIPPINES.id) : true
        ctx.al_K_service_agreement = !(G.inter_service && G.inter_service[AP] === 1)
        ctx.al_L_has_2_carriers = esm_count_carriers(AP) >= 2
        ctx.al_M_us_corps_near_carrier = (() => {
            // 橙色计划：美陆军军与航母同格；该格距一个盟军控制的菲律宾港口不超过15格。
            // Orange plan: US army corps in the same hex as a carrier; that hex is within 15 hexes of an Allied-controlled Philippine port.
            try {
                const philPorts = []
                for (let h = 0; h <= LAST_BOARD_HEX; ++h) {
                    const md = get_map_data(h)
                    if (md && md.region === "Philippines" && md.port && is_space_controlled(h, AP)) philPorts.push(h)
                }
                for (let u = 1; u < pieces.length; ++u) {
                    const p = pieces[u], loc = G.location[u]
                    if (!p || p.faction !== AP || p.class !== "naval" || !p.br || !(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
                    let usCorps = false
                    for (let g = 1; g < pieces.length; ++g) {
                        const q = pieces[g]
                        if (q && q.faction === AP && q.class === "ground" && q.service === "army" && q.size === 3 && G.location[g] === loc) { usCorps = true; break }
                    }
                    if (usCorps && philPorts.some(h => get_distance(loc, h) <= 15)) return true
                }
                return false
            } catch (e) { return false }
        })()
        ctx.al_N_aus_no_jp_ground = esm_count_ground(JP, r => r === "Australia") === 0 && !pieces.some((p,u) => p && p.faction === JP && p.class === "ground" && G.location[u] === esm_idx("Port Moresby"))
        ctx.al_O_dei_not_surrendered = (typeof nations !== "undefined") ? !surr(nations.DEI.id) : true
        ctx.al_P_abda_hq_supplied = (() => { const loc = G.location[HQ_ABDA]; return (loc >= 0 && loc <= LAST_BOARD_HEX) && !(G.oos && set_has(G.oos, HQ_ABDA)) })()
        // 中期
        // mid
        ctx.al_M_B_needs_war_progress = (() => {
            // D3: 真实"战争进程亏空" —— 引擎口径 pow_count(=G.capture 中当前 AP 仍控的 named 格)
            // < G.pow。原 !!G.pow 只在 t≥4 后恒真, 无法表达"银行已达标/未达标", 更不会在
            // 银行耗尽时催动夺格 —— 而 PoW 亏空正是条约败主因(每次政治阶段 pow_count<pow 即 -1 PW)。
            // D3: real "war-progress deficit" — engine-caliber pow_count (= named hexes in
            // G.capture still AP-controlled now) < G.pow. The old !!G.pow is constant true from
            // t>=4 on, can't express "bank met/not met", and won't drive captures when the bank
            // is exhausted — yet the PoW deficit is the main cause of treaty defeat (every
            // political phase pow_count<pow means -1 PW).
            if (!(G.pow > 0)) return false
            try { return esm_pow_bank() < G.pow } catch (e) { return false }
        })()
        ctx.al_M_D_jp_controls_counterattack_target = (() => {
            // D3: 反攻战略门槛 = py 中期树 "D 日本控制≥1反攻目标"(页8 原文), 目标集与反攻
            // D3: counteroffensive threshold = py mid-tree "D Japan controls ≥1 counteroffensive target" (page 8 original); the target set and the
            // 执行链同源 = 图表 16 行清单(中途岛→努美阿)解析出的同一份 hex 链。此前的
            // counteroffensive execution chain share the same source = the same hex chain parsed from the chart's 16-row list (Midway→Noumea). The previous
            // front-scan(任何 JP 控 named 格距 AP ≤3)把谓词与执行链解耦: 1942 马来亚前线使
            // front-scan (any JP-controlled named hex within ≤3 of AP) decoupled the predicate from the execution chain: the 1942 Malaya front made
            // D 恒真 → 反攻连钉, 但 16 个清单目标几乎全在盟军手中, eop 焦点 null、攻势空转。
            // D constantly true → counteroffensive pinned repeatedly, but almost all 16 list targets were in Allied hands, so eop focus was null and the offensive idled.
            // 忠实语义: D 为真 恰等价于 链上存在日本实际控制的清单目标 → 钉反攻必有真实焦点。
            // Faithful semantics: D is true exactly when a listed target actually controlled by Japan exists on the chain → pinning counteroffensive always has a real focus.
            try {
                const entry = esm_strategy_entry("Allies", "mid", "反攻战略")
                if (!entry) return false
                const chain = esm_chain_of(esm_parse_entry(entry, "Allies", "mid"))
                for (const h of chain) {
                    if (h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, JP)) return true
                }
                return false
            } catch (e) { return false }
        })()
        // 晚期
        // late
        ctx.al_L_B_is_turn_12 = G.turn === 12
        ctx.al_L_D_has_strategic_bombing_base = (() => {
            try { return esm_geo().airfieldsWithin8Tokyo.some(h => is_space_controlled(h, AP)) } catch (e) { return false }
        })()
        ctx.al_L_E_all_b29_on_base = (() => {
            try {
                const onMap = [B_29_1, B_29_2].filter(u => G.location[u] >= 0 && G.location[u] <= LAST_BOARD_HEX)
                const onBase = u => { const loc = G.location[u]; return is_space_controlled(loc, AP) && get_map_data(loc).airfield && get_distance(loc, TOKYO) <= 8 }
                // 图表原文是“地图上所有的 B29”：尚未增援/已进补员轨的 B29 不参与全称判断；
                // The chart's original text is "all B29s on the map": B29s not yet reinforced / already on the replacement track do not join the universal quantification;
                // 中国空军盒虽可执行规则 12.3 轰炸，但不是图表定义的“东京 8 格内盟军机场”。
                // the China air box can perform rule 12.3 bombing but is not a chart-defined "Allied airfield within 8 hexes of Tokyo".
                return onMap.length > 0 && onMap.every(onBase)
            } catch (e) { return false }
        })()
        ctx.al_L_F_controls_hex_within_8_tokyo = (() => {
            try { return esm_geo().controlledHexesWithin8Tokyo.some(h => is_space_controlled(h, AP)) } catch (e) { return false }
        })()
        // 原子弹路线硬前提是苏联牌(AP#79)就绪。该牌作事件需 TOJO 事件先激活(JP 打出卡43)，
        // The atomic-bomb route's hard prerequisite is the Soviet card (AP#79) being ready. Playing that card as an event requires the TOJO event to fire first (JP plays card 43),
        // 但 #79 多在 T3-T7 过早抽到、在 TOJO 激活(T8+)前就被当 OC 打掉，即便晚抽也多被
        // but #79 is usually drawn too early in T3-T7 and gets played as OC before TOJO activates (T8+); even a late draw is usually
        // "PoW 紧急攻势"抢先当 OC 打出 -> sovietReady 恒假 -> 原子弹路线不可达。
        // grabbed by "PoW emergency offensive" and played as OC first -> sovietReady constantly false -> the atomic-bomb route is unreachable.
        // 此时页9 的"占领轰炸基地/推进B29"只是为不可达的原子弹铺路，会空耗 T9-T11，把
        // At this point page 9's "capture bombing base / push B29" only paves the way for an unreachable atomic bomb, wasting T9-T11 and pushing
        // 封锁胜利(基础规则 16.47：连续三个国势阶段日本本土无法追溯资源格)压到第 12 回合
        // the blockade victory (basic rule 16.47: Japan's home islands cannot trace resource hexes for three consecutive political phases) all the way to turn 12
        // 才启动，无从累计 3 回合断线。故当苏联牌未就绪时，把这两个原子弹专属前置视为已
        // before it starts, leaving no way to accumulate 3 turns of disconnection. So when the Soviet card is not ready, treat these two atomic-bomb-specific prerequisites as already
        // 满足，让纯树直接进入 F(距东京 8)分支 -> 重返菲律宾/跳岛/登陆日本，即封锁所需的
        // satisfied, letting the pure tree go straight into the F (within 8 of Tokyo) branch -> return to Philippines / island hopping / invade Japan, i.e. the blockade's
        // 夺港 + 部署 AZOI 路线。纯树(esm_al_eval_late)本身不改，保真测试不受影响。
        // port-capture + AZOI-deployment route. The pure tree (esm_al_eval_late) itself is unchanged, so fidelity tests are unaffected.
        if (!esm_soviet_occurred() && !esm_soviet_playable()) {
            ctx.al_L_D_has_strategic_bombing_base = true
            ctx.al_L_E_all_b29_on_base = true
        }
        ctx.al_L_G_meets_atomic_bomb_criteria = esm_atomic_met()
    }
    // D5 诊断(仅 trace 用, 不进决策): 钉选时刻的引擎权威账本 —— PoW 银行/G.pow/JP 资源/
    // D5 diagnostic (trace only, not entering decisions): the engine's authoritative ledger at pin time — PoW bank / G.pow / JP resources /
    // 轰炸战役标记/JP 手里的资源格 —— 供审计"为何条约败/离胜利线多远"。
    // bombing-campaign marker / resource hexes in JP's hands — for auditing "why treaty defeat / how far from the victory line".
    try {
        ctx._diag = {
            turn: G.turn, pow: G.pow, bank: esm_pow_bank(),
            jpRes: (typeof get_jp_resources === "function") ? get_jp_resources() : -1,
            marker: (G.events && events && events.STRAT_BOMBING_CAMPAIGN) ? (G.events[events.STRAT_BOMBING_CAMPAIGN.id] || 0) : -1,
            resHexes: (typeof RESOURCE_HEX !== "undefined") ? RESOURCE_HEX.filter(h => h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, JP)) : [],
            advance: esm_advance_metrics(),
            atomic: (typeof atomic_bomb_strategy_status === "function") ? atomic_bomb_strategy_status() : null,
            openingSurrender: (typeof nations !== "undefined") ? {
                philippines: !!G.surrender[nations.PHILIPPINES.id],
                dei: !!G.surrender[nations.DEI.id],
                philippinesKeysHeld: nations.PHILIPPINES.keys.filter(k => is_space_controlled(hex_to_int(k), JP)).length,
                philippinesKeysRequired: nations.PHILIPPINES.keys.length,
                deiKeysHeld: nations.DEI.keys.filter(k => is_space_controlled(hex_to_int(k), JP)).length,
                deiKeysRequired: nations.DEI.keys.length,
            } : undefined,
        }
    } catch (e) { /* 无 G 时不设 / not set when no G */ }
    return ctx
}

// 原子弹判据(口径=图表 09 + 脚注[7] + 规则 16): 逐字三条件。
// Atomic-bomb criterion (caliber = chart 09 + footnote [7] + rule 16): three verbatim conditions.
function esm_atomic_met() {
    try {
        return atomic_bomb_strategy_status().met
    } catch (e) { return false }
}

// ===========================================================================
// parse_goals 移植(py L101-116/L801-943): 把“有序分步目标”每行解析成 Goal
// parse_goals port (py L101-116/L801-943): parse each "ordered step-by-step goal" line into a Goal
// (kind + 有序 hex + region + 抽象项), 供计划审计与 chain(喂 eop) 使用。
// (kind + ordered hex + region + abstract item), for plan audit and chain (feeds eop) use.
// 逐字复刻 py: 分类关键字/指针(见X)/区域资源展开/落底 region 命名格 全保留。
// Verbatim py replication: classification keywords / pointers (see X) / region-resource expansion / fallback region named-hex are all kept.
// 地图注册表 = engine get_map_data(与 py 一次性导出 data/erasmus/map_names.json
// The map registry = engine get_map_data (same origin as py's one-time export data/erasmus/map_names.json;
// 同源); 解析只在 gate 开时运行(短路的引擎函数取不到也不炸)。
// parsing runs only when the gate is on (the short-circuited engine functions are simply not fetched and won't crash).
// ===========================================================================
var ESM_PARSE_REG = null            // 单次 parse 期间的注册表(指针递归共用) / registry during a single parse (shared across pointer recursion)

function esm_reg_from_entries(land, namedMap) {
    // land: Map<idx,{region}>; namedMap: Map<idx,{name,region,resource}> —— py HEXES/LAND
    const named = [], namedIdx = new Set(), regionNamed = new Map(), regionResource = new Map()
    const push = (m, region, idx) => { if (!m.has(region)) m.set(region, []); m.get(region).push(idx) }
    const idxs = Array.from(new Set([...land.keys(), ...namedMap.keys()])).sort((a, b) => a - b)
    for (const idx of idxs) {
        const lr = land.get(idx), ne = namedMap.get(idx)
        const region = ne ? ne.region : (lr ? lr.region : null)
        if (region) push(regionNamed, region, idx)
        if (ne) {
            named.push({ idx, name: ne.name, region: ne.region, resource: !!ne.resource })
            namedIdx.add(idx)
            if (ne.resource && ne.region) push(regionResource, ne.region, idx)
        }
    }
    return { named, namedIdx, regionNamed, regionResource }
}

function esm_reg_build() {
    if (ESM_PARSE_REG) return ESM_PARSE_REG
    if (typeof get_map_data !== "function" || typeof LAST_BOARD_HEX === "undefined") return null
    const sid = (typeof G !== "undefined" && G) ? G.sid : "?"
    if (ESM_PREP._reg && ESM_PREP._reg.sid === sid) return ESM_PREP._reg
    const land = new Map(), namedMap = new Map()
    for (let i = 0; i <= LAST_BOARD_HEX; i++) {
        let md = null
        try { md = get_map_data(i) } catch (e) { md = null }
        if (!md) continue
        if (md.region) land.set(i, { region: md.region })
        if (md.name) namedMap.set(i, { name: String(md.name), region: md.region, resource: !!md.resource })
    }
    ESM_PREP._reg = esm_reg_from_entries(land, namedMap)
    ESM_PREP._reg.sid = sid
    return ESM_PREP._reg
}

// ---- 目标词 -> hex(逐字 py L63-116) ---------------------------------------
// ---- target word -> hex (verbatim py L63-116) --------------------------------
const ESM_NAME_ALIASES = { "uluthi": "Ulithi", "uluth": "Ulithi", "timor": "Koepang",
    "gili-gili": "Gili Gili", "marcus island": "Marcus", "marshalls": "Kwajalein",
    "saipan/tinian": "Saipan", "dutch harbor": "Dutch Harbor", "attukiska": "Attu/Kiska",
    "sasebo": "Kynshu" }
function esm_norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "") }
function esm_name_hexes(token) {
    const reg = esm_reg_build()
    let t = esm_norm(token)
    if (Object.prototype.hasOwnProperty.call(ESM_NAME_ALIASES, t)) t = esm_norm(ESM_NAME_ALIASES[t])
    if (!t || t.length < 3 || !reg) return []
    // Exact normalized names must win before fuzzy abbreviation matching. Without
    // this guard, "Balikpapan" also matched the shorter map name "Bali" and put
    // a non-chart target at the head of the DEI surrender objective.
    const exact = []
    for (const e of reg.named) if (esm_norm(e.name) === t) exact.push(e.idx)
    if (exact.length) return exact
    // 斜线表示两个备选地点时两者都保留（Gasmata/Rabaul）；地图本身确有同名组合格
    // A slash denoting two alternative locations keeps both (Gasmata/Rabaul); the map's own genuinely combined hexes
    // （Attu/Kiska、Saipan/Tinian）已在上面的 exact 分支命中，不会被拆开。
    // (Attu/Kiska, Saipan/Tinian) already hit the exact branch above and won't be split apart.
    if(String(token).includes("/")){
        const split=[]
        for(const part of String(token).split("/"))for(const idx of esm_name_hexes(part))if(!split.includes(idx))split.push(idx)
        if(split.length)return split
    }
    const fuzzy = []
    for (const e of reg.named) {
        const n = esm_norm(e.name)
        if (t.includes(n) || n.includes(t)) fuzzy.push({ idx: e.idx, delta: Math.abs(n.length - t.length) })
    }
    if (!fuzzy.length) return []
    const best = Math.min(...fuzzy.map(e => e.delta))
    return fuzzy.filter(e => e.delta === best).map(e => e.idx)
}
function esm_line_hexes(text) {
    const hexes = []
    let m
    const idRe = /\d{4}/g
    while ((m = idRe.exec(text))) {                     // 4-digit hex id 先取(py 顺序) / 4-digit hex ids taken first (py order)
        const id = +m[0], idx = (Math.floor(id / 100) - 10) * 29 + (id % 100)
        if (hexes.indexOf(idx) < 0) hexes.push(idx)
    }
    const runRe = /[A-Za-z][A-Za-z\-/\. ]{1,30}[A-Za-z]/g   // 英文名按出现序(py 同) / English names in occurrence order (same as py)
    while ((m = runRe.exec(text))) {
        for (const idx of esm_name_hexes(m[0])) if (hexes.indexOf(idx) < 0) hexes.push(idx)
    }
    return hexes
}

// ---- 行分类(逐字 py _classify L874-897) ------------------------------------
// ---- line classification (verbatim py _classify L874-897) ---------------------
const ESM_ADMIN_KW = ["Roll", "1d10", "切换", "放牌", "跳过", "PASS", "FOQ", "按顺序",
    "整理手牌", "同早期", "事件战略", "其他放牌", "如果已控制则加固", "欧战为正打欧战牌"]
function esm_classify(text) {
    if (ESM_ADMIN_KW.some(k => text.includes(k))) return "ADMIN"
    if (text.includes("压制")) return "SUPPRESS"
    if (text.includes("登陆日本") || text.includes("板载冲锋")) return "INVADE_JAPAN"
    if (text.includes("攻击美国舰队") || text.includes("脱离") || text.includes("护航") ||
        (text.includes("航母") && text.includes("攻击"))) return "NAVAL"
    if (text.includes("B29") || text.includes("轰炸")) return "B29"
    if (text.includes("驻军") || text.includes("加固")) return "GARRISON"
    if (text.includes("加强港口")) return "PORTS"
    if (["投降", "占领", "夺", "攻占", "推进", "登陆", "进军", "解放"].some(k => text.includes(k))) return "CONQUEST"
    return esm_line_hexes(text).length ? "CONQUEST" : "ADMIN"
}

const ESM_CN_REGION = { "东印度": "DEI", "菲律宾": "Philippines", "马来亚": "Malaya", "缅甸": "Burma",
    "中国": "China", "印度": "India", "新几内亚": "Guinea", "日本": "Japan", "中太平洋": "Marshall",
    "澳洲": "Australia", "塞班": null, "硫磺岛": null, "冲绳": null, "台湾": null }
function esm_region_of(text) {
    for (const cn of Object.keys(ESM_CN_REGION)) {
        const reg = ESM_CN_REGION[cn]
        if (reg && text.includes(cn) && !text.includes(reg)) return reg
    }
    return null
}

// ---- 指针 / 区域资源 / 落底(py _resolve_pointer/_resource_hexes) -----------
// ---- pointer / region resources / fallback (py _resolve_pointer/_resource_hexes) ----
function esm_pointer_hexes(token, visiting) {
    // 按 py _resolve_pointer(L857-871): 检索顺序 JP_MID,JP_EARLY,JP_LATE,AL_MID,
    // Per py _resolve_pointer (L857-871): search order JP_MID, JP_EARLY, JP_LATE, AL_MID,
    // AL_LATE,AL_EARLY; 每命中库键(或名)含 token 即把被指向战略的目标链
    // AL_LATE, AL_EARLY; each hit on a library key (or name) containing the token flattens the pointed-to strategy's goal chain
    // 扁平化(跨 Goal 不去重, 与 py `[h for g in parse_goals(s) for h in g.hexes]`
    // (no dedup across Goals, matching py `[h for g in parse_goals(s) for h in g.hexes]`),
    // 一致), 取链长最长者返回。e.g. "见外围防御": JP_MID 外围(7格) vs JP_EARLY
    // and returns the longest chain. e.g. "见外围防御": JP_MID perimeter (7 hexes) vs JP_EARLY
    // 外围(13格,含瓜岛) → 取 EARLY 13 格链(与 py 金标一致)。
    // perimeter (13 hexes, incl. Guadalcanal) → take the EARLY 13-hex chain (matches the py golden standard).
    const order = [["Japan", "mid"], ["Japan", "early"], ["Japan", "late"],
                   ["Allies", "mid"], ["Allies", "late"], ["Allies", "early"]]
    let best = []
    for (const [role, phase] of order) {
        const lib = esm_lib(role)[phase] || {}
        for (const key of Object.keys(lib)) {
            const e = lib[key]
            if (!(key.includes(token) || token.includes(key) || (e.name || "").includes(token))) continue
            const cand = esm_goal_hexes_of(role, phase, key, visiting)
            if (cand.length > best.length) best = cand
        }
    }
    return best
}
function esm_goal_hexes_of(role, phase, key, visiting) {
    const entry = esm_strategy_entry(role, phase, key)
    if (!entry) return []
    const tag = role + "|" + phase + "|" + key
    if (visiting.has(tag)) return []
    visiting.add(tag)
    const goals = esm_parse_goals_inner(entry, role, phase, visiting)
    visiting.delete(tag)
    // 跨 Goal 扁平化不去重(py _resolve_pointer 口径); 去重仅属执行链 esm_chain_of。
    // Flatten across Goals without dedup (py _resolve_pointer caliber); dedup belongs only to the execution chain esm_chain_of.
    const chain = []
    for (const g of goals) for (const h of g.hexes) chain.push(h)
    return chain
}

// ---- 主解析(py parse_goals L907-943) ----------------------------------------
// ---- main parse (py parse_goals L907-943) ------------------------------------
function esm_parse_goals_inner(entry, role, phase, visiting) {
    const reg = esm_reg_build()
    const goals = []
    const targets = (entry && entry.targets) || []
    for (let i = 0; i < targets.length; i++) {
        const text = String(targets[i]).trim()
        if (!text) continue
        let kind = esm_classify(text)
        let meta = {}
        let hexes = esm_line_hexes(text)
        const region = esm_region_of(text)
        if (kind === "CONQUEST" && !hexes.length) {
            const pm = text.match(/见\s*([一-鿿]+)/)          // “见外围防御”跨战略指针 / "见外围防御" cross-strategy pointer
            if (pm) hexes = esm_pointer_hexes(pm[1], visiting)
            if (!hexes.length && region) {
                const rm = text.match(/所有[一-鿿]{0,8}资源/)   // “所有X资源”区域资源格 / "所有X资源" region-resource hexes
                if (rm && reg && reg.regionResource.has(region)) {
                    hexes = reg.regionResource.get(region).slice().sort((a, b) => a - b)
                }
            }
            if (!hexes.length && region && reg) {            // 落底: region 命名格 / fallback: region named-hex
                const list = reg.regionNamed.get(region) || []
                hexes = list.filter(h => reg.namedIdx.has(h)).sort((a, b) => a - b)
            }
        }
        if (/加强港口/.test(text)) {
            kind = "GARRISON"
            hexes = ESM_FORTIFY.map(esm_idx).filter(Number.isInteger)
            meta = { requiresFriendlyControl:true,ignoreIfEnemy:true,garrisonRequirement:{groundSteps:3,airSteps:1,operator:"OR"},preferredClass:"air" }
        }
        if (/仅地面推进/.test(text)) meta.movementModes = ["GROUND"]
        else if (/通过AA/.test(text)) meta.movementModes = ["AA"]
        else if (/优先AA/.test(text)) meta.movementModes = ["AA","GROUND"]
        else if (/优先地面/.test(text)) meta.movementModes = ["GROUND","AA"]
        if (meta.movementModes) {
            kind = "CONQUEST"
            if (!hexes.length && reg) for (const named of reg.named) {
                if (text.includes(named.name) && !hexes.includes(named.idx)) hexes.push(named.idx)
            }
        }
        if (/所有东印度资源/.test(text) && reg) for (const regionName of ["DEI","Java","Sumatra","Borneo","Celebes"])
            for (const hex of reg.regionResource.get(regionName) || []) if (!hexes.includes(hex)) hexes.push(hex)
        if (/连接.*HQ/.test(text)) { kind = "DYNAMIC_BASE"; hexes = [] }
        if (/Roll.*1d10/.test(text)) { kind = "STRATEGY_ROLL"; hexes = [] }
        if (/中国攻势/.test(text)) meta.followupActions = ["china_offensive","china_event"]
        if (/澳洲港口|澳洲机场/.test(text) && typeof LAST_BOARD_HEX !== "undefined" && typeof get_map_data === "function") {
            hexes = []
            for (let h=0;h<=LAST_BOARD_HEX;h++) { const md=get_map_data(h); if(md&&md.region==="Australia"&&(/港口/.test(text)?md.port:md.airfield))hexes.push(h) }
        }
        goals.push({ priority: i + 1, kind, text, hexes, region, meta })
    }
    return goals
}
function esm_parse_entry(entry, role, phase, reg) {
    const visiting = new Set()
    const prev = ESM_PARSE_REG
    ESM_PARSE_REG = reg || esm_reg_build()
    try { return esm_parse_goals_inner(entry, role, phase, visiting) }
    finally { ESM_PARSE_REG = prev }
}
function esm_chain_of(goals) {
    const chain = []
    for (const g of goals || []) for (const h of g.hexes) if (chain.indexOf(h) < 0) chain.push(h)
    return chain
}

// ===========================================================================
// 策略表(转录 py L169-513 原文): 键 = 决策树返回名; 每项 = {name(全称), kind
// Strategy table (transcribed py L169-513 original): key = decision-tree returned name; each entry = {name (full name), kind
// (策略级驱动), targets(逐字 py 目标行), notes}. targets 经 parse_goals 解析成
// (strategy-level driver), targets (verbatim py goal lines), notes}. targets are parsed by parse_goals into
// 有序 Goal(逐字分类/顺序/指针/资源展开) —— 与 py 同源可对拍。
// ordered Goals (verbatim classification/order/pointer/resource expansion) — same-origin with py for cross-checking.
// ===========================================================================
const ESM_JP_LIB = {
    early: {
        "激进的空优战略": { name: "激进的空优战略", kind: "CONQUEST", targets: ["1. 压制东印度: Jolo [4], Makassar [4], Teloekbetoeng [4], Bandjermasin [4]"], notes: ["[4].如有可能,战后移动一个空中单位到目标格,不然移动一个航母过去。", "[7].以足够的力量,按伤害等级消灭覆盖目标的敌方AZOI单位的力量进行空中/海上攻击..."] },
        "保守的空优战略": { name: "保守的空优战略", kind: "CONQUEST", targets: ["1. 压制盟军HQ: 菲律宾(0.25x), 新加坡(0.5x), ABDA(0.5x)", "2. 压制东印度: Jolo, Makassar, Teloekbetoeng, Bandjermasin"], notes: ["[1].激活必须使盟军HQ断补。"] },
        "激进的南方资源战略": { name: "激进的南方资源战略", kind: "CONQUEST", targets: ["1. 压制盟军HQ: 菲律宾(0.25x), 新加坡(0.5x), ABDA(0.5x)", "2. 东印度投降: Balikpapan, Tarakan, Batavia(若无日军则占领), Tjilatjap, Soerabaja, Bangka, Palembang, Medan", "3. 马来亚投降: Kuantan关丹, Singapore新加坡", "4. 菲律宾投降: Manila马尼拉, Davao达沃", "5. Roll 1d10 分配"], notes: ["[1].激活必须使盟军HQ断补。"] },
        "保守的南方资源战略": { name: "保守的南方资源战略", kind: "CONQUEST", targets: ["1. 压制东印度: Jolo, Makassar, Teloekbetoeng, Bandjermasin", "2. 马来亚投降: Kuantan, Singapore", "3. 菲律宾投降: Manila, Davao", "4. Roll 1d10 分配"], notes: [] },
        "中缅印战略": { name: "中缅印战略 (CBI)", kind: "CONQUEST", targets: ["1. 缅甸投降: Rangoon仰光, Mandalay曼德勒, Lashio腊戍, Myitkyina密支那", "2. 中国投降: Lashio腊戍, 中国攻势, 中国事件"], notes: [] },
        "中太平洋战略": { name: "中太平洋战略", kind: "CONQUEST", targets: ["1. 西北新几内亚: Sarong, Vogelkop, Biak", "2. 阿图/吉斯卡 Attu/Kiska [2]", "3. 马绍尔防御: Wake威克岛, Tarawa塔拉瓦", "4. 中途岛 Midway [2]"], notes: [] },
        "马绍尔防御": { name: "马绍尔防御", kind: "CONQUEST", targets: ["1. Wake威克岛", "2. Tarawa塔拉瓦"], notes: [] },
        "外围防御战略": { name: "外围防御战略", kind: "CONQUEST", targets: ["1. 澳洲委任统治地: 西北新几内亚(Sarong, Vogelkop, Biak), Guadalcanal瓜岛, Port Moresby莫尔茨比", "2. 新几内亚: Hollandia, Lae, Buna, Biak, Vogelkop, Wewak, Gili-Gili, Port Moresby"], notes: [] },
        "事件战略": { name: "事件战略", kind: "EVENT", targets: ["1. 欧战为正打欧战牌,否则FOQ", "2. 结束日本ISR", "3. 造成美国ISR", "4. 东京玫瑰", "5. 补员牌", "6. 天气牌", "7. 东条作为1OC", "8. 其他放牌"], notes: ["[3].如果卡牌条件允许,按照策略指示使用卡牌。", "[5].如果欧洲战事为正数,则打出可用的欧战牌,否则按指示投骰。"] },
    },
    mid: {
        "资源战略": { name: "资源战略", kind: "CONQUEST", targets: ["1. 占领资源: Seoul首尔, Manila马尼拉, Kuantan关丹, 所有东印度资源, Vogelkop, Rangoon", "2. 新几内亚投降: Biak, Vogelkop, Hollandia, Lae, Buna, Wewak, Gili-Gili, Port Moresby", "3. 缅甸投降: Rangoon, Mandalay, Lashio, Myitkyina", "4. 中国投降: Lashio, 中国攻势, 中国事件", "5. 加强港口: Truk, Rabaul, Saipan, Davao, Saigon, Eniwetok, Kwajalein, Palau"], notes: ["[3].占领尽可能多的资源格,直到日本控制至少13个(优先无敌军、弱敌军)。", "[5].在指定位置放置至少3step地面或1step空中单位，优先空中。"] },
        "中太平洋战略": { name: "中太平洋战略", kind: "CONQUEST", targets: ["1. Attu/Kiska阿图", "2. Wake威克岛", "3. Midway中途岛", "4. 攻击美国舰队"], notes: [] },
        "中缅印战略": { name: "中缅印战略 (CBI)", kind: "CONQUEST", targets: ["1. 缅甸投降: Rangoon, Mandalay, Lashio, Myitkyina", "2. 中国投降: Lashio, 中国攻势, 中国事件", "3. 加强港口", "4. 印度投降: Akyab, Imphal, Dimasur, Jarhat, Ledo, Dacca", "5. 事件战略"], notes: ["[1].如果卡牌条件允许,按照策略指示使用卡牌。"] },
        "印度战略": { name: "印度战略", kind: "CONQUEST", targets: ["1. 印度投降: Akyab, Imphal, Dimasur, Jarhat, Ledo, Dacca", "2. 中国投降: Lashio, 中国攻势, 中国事件", "3. 加强港口"], notes: [] },
        "外围防御战略": { name: "外围防御战略", kind: "CONQUEST", targets: ["1. 压制南太平洋侧翼: Hollandia, Lae, Buna, Biak, Wewak, Buin", "2. 中国投降: Lashio, 中国攻势, 中国事件", "3. 加强港口", "4. 缅甸投降: Rangoon, Mandalay, Lashio, Myitkyina"], notes: ["[4].如果可能的话,用AZOI覆盖这些目标,否则转移到下一个目标。", "[5].在指定位置放置至少3step地面或1step空中单位，优先空中。"] },
        "事件战略": { name: "事件战略", kind: "EVENT", targets: ["同早期阶段事件战略"], notes: ["[1].如果卡牌条件允许,按照策略指示使用卡牌。"] },
        "PASS": { name: "PASS", kind: "PASS", targets: ["跳过本回合行动"], notes: [] },
    },
    late: {
        "最终国防圈战略": { name: "最终国防圈战略", kind: "GARRISON", targets: ["1. 港口驻军: Okinawa冲绳, Seoul首尔, Pusan釜山, Tainan台南, Saipan/Tinian塞班", "2. 机场驻军: Iwo Jima硫磺岛, Kyoto京都", "3. 日本港口驻军: Sasebo佐世保, Kure吴, Tokyo东京, Osaka大阪, Nagoya名古屋, Ominato大凑, Hakodate函馆"], notes: ["[3].将任意空中/海上补员用于本州岛，维持到资源格的AZOI。"] },
        "最终防御战略": { name: "最终防御战略", kind: "DEFEND", targets: ["1. 集结部队", "2. 海空支援", "3. 板载冲锋"], notes: ["[4].移动地面单位填满盟军占据格的相邻格。", "[5].尽可能在本州岛每个六角格放置空中/海上单位。", "[6].如果相邻格被占据满，用最大战力进攻盟军。", "[7].所有本州岛战斗派空中/海上单位支援。", "[8].战斗到最后一step地面单位。"] },
        "事件战略": { name: "事件战略", kind: "EVENT", targets: ["同早期阶段事件战略"], notes: ["[1].如果满足条件按顺序执行。第12回合绝不把牌作为FOQ。"] },
        "PASS": { name: "PASS", kind: "PASS", targets: ["跳过本回合行动"], notes: [] },
    },
}

const ESM_AL_LIB = {
    early: {
        "撤离菲律宾": { name: "撤离菲律宾", kind: "EVENT", targets: ["1. P旅到Biak", "2. R军到Kendari", "3. [SL]军到Manila", "4. [FEAF]到Manila", "5. [19 LRB]到Timor"], notes: ["如果单位已就位则视为完成"] },
        "撤离马来亚": { name: "撤离马来亚", kind: "EVENT", targets: ["1. 8 Aus到Kendari", "2. MA Air到Palembang"], notes: [] },
        "建立ABDA": { name: "建立 ABDA 指挥部", kind: "EVENT", targets: ["放置ABDA HQ到: 1. Tjilatjap, 2. Kendari, 3. Balikpapan, 4. Soerabaja, 5. Tarakan"], notes: [] },
        "增强CBI防御": { name: "增强 CBI 防御", kind: "EVENT", targets: ["1. 1 Ind到Rangoon", "2. B Ind师到Akyab", "3. 66集团军到Lashio", "4. 6集团军到Mandalay", "5. 5集团军到Myitkyina", "6. 1 Burma到Imphal"], notes: ["所有单位就位视作建立完成"] },
        "DEI防御": { name: "DEI 防御", kind: "EVENT", targets: ["派英联邦或美军前往ABDA HQ港口 (Tjilatjap, Kendari, Balikpapan, Soerabaja, Tarakan)"], notes: [] },
        "橙色计划": { name: "橙色计划 (Plan Orange)", kind: "CONQUEST", targets: ["1. 美国军护航派往莱特岛(Leyte)", "2. 若莱特被控，派往马尼拉(Manila)"], notes: [] },
        "攻势进攻": { name: "攻势进攻", kind: "EVENT", targets: ["1. 对最弱日本单位发起1x海空攻击", "2. 脱离最后一支航母避免被灭"], notes: [] },
        "事件战略": { name: "事件战略", kind: "EVENT", targets: ["1. 欧战事件", "2. 结束ISR或FOQ", "3. 造成日本ISR", "4. 杜立特空袭", "5. 巴丹行军", "6. FOQ"], notes: [] },
    },
    mid: {
        "反攻战略": { name: "反攻战略", kind: "CONQUEST", targets: ["1. Midway中途岛", "2. Dutch Harbor荷兰港", "3. Dacca达卡(仅地面推进)", "4. Dimasur迪马布尔", "5. Jarhat乔尔哈特", "6. Ledo雷多", "7. Imphal/Kohima英帕尔", "8. 澳洲港口(优先地面,其次AA)", "9. 澳洲机场(优先地面,其次AA)", "10. Guadalcanal瓜岛", "11. Attu/Kiska阿图岛", "12. Port Moresby莫尔茨比(仅地面推进)", "13. Gili-Gili吉里吉里(仅地面推进)", "14. New Hebrides新赫布里底(通过AA)", "15. Noumea努美阿(优先AA,其次地面)", "16. Roll 1d10 切换其他战略"], notes: ["按顺序占领, 无法攻击则向前移动基地", "多余激活点攻击日军航空兵"] },
        "南太平洋战略": { name: "南太平洋战略", kind: "CONQUEST", targets: ["1. Guadalcanal", "2. Gili-Gili", "3. Port Moresby", "4. Buna", "5. Lae", "6. New Georgia", "7. Bougainville", "8. Gasmata/Rabaul", "9. Madang", "10. Wewak", "11. Aitape", "12. Admiralty Islands", "13. Hollandia", "14. Biak", "15. Sarong", "16. Vogelkop"], notes: ["优先ANZAC或SW Pac HQ"] },
        "中太平洋战略": { name: "中太平洋战略", kind: "CONQUEST", targets: ["1. Wake威克岛", "2. Tarawa塔拉瓦", "3. Kwajalein夸贾林", "4. Eniwetok恩尼威托克", "5. Palau帕劳", "6. Uluthi乌利西", "7. Saipan塞班"], notes: ["优先Cen Pac HQ，其次SW Pac HQ"] },
        "CBI战略": { name: "CBI 战略", kind: "CONQUEST", targets: ["1. Dacca", "2. Akyab", "3. Dimasur", "4. Jarhat", "5. Imphal/Kohima", "6. Ledo", "7. Myitkyina", "8. Lashio", "9. Mandalay", "10. Rangoon"], notes: ["优先SEAC HQ或联合HQ"] },
        "DEI战略": { name: "DEI 战略", kind: "CONQUEST", targets: ["1. Timor", "2. Kendari", "3. Soerabaja", "4. Balikpapan", "5. Tarakan"], notes: ["优先ANZAC或SW Pac HQ"] },
    },
    late: {
        "占领轰炸基地": { name: "占领战略轰炸基地", kind: "CONQUEST", targets: ["1. Saipan塞班", "2. Guam关岛", "3. Marcus Island南鸟岛", "4. Iwo Jima硫磺岛", "5. Okinawa冲绳", "6. Tainan台南", "7. Taihoku台北"], notes: ["使用最大攻势卡占领"] },
        "推进B29": { name: "推进 B29", kind: "ABSTRACT", targets: ["使用OC移动B29到战略基地", "剩余激活点攻击指挥范围内日军航母/空军"], notes: [] },
        "重返菲律宾": { name: "重返菲律宾", kind: "CONQUEST", targets: ["1. 占领连接SW Pac HQ距莱特4格基地", "2. Leyte莱特", "3. Davao达沃", "4. 2912六角格(与马尼拉相邻)", "5. Manila马尼拉", "6. 解放 DEI", "7. 解放马来亚"], notes: ["优先SW Pacific HQ"] },
        "跳岛作战": { name: "跳岛作战", kind: "CONQUEST", targets: ["1. Kwajalein夸贾林", "2. Eniwetok恩尼威托克", "3. Saipan塞班", "4. Iwo Jima硫磺岛", "5. Okinawa冲绳", "6. 登陆日本"], notes: ["优先Cen Pacific HQ", "在最高优先级目标达成前，不要执行下一个目标"] },
        "原子弹胜利": { name: "原子弹胜利", kind: "ABSTRACT", targets: ["1. 打出苏联入侵满洲", "2. 占领剩下的日本资源格"], notes: ["需无战略轰炸失败且日本资源<=3 (未打出苏联入侵时<=5)"] },
        "登陆日本": { name: "登陆日本", kind: "CONQUEST", targets: ["1. Sasebo佐世保", "2. Tokyo东京", "3. Ominato大凑", "4. 3606格", "5. Nagoya名古屋", "6. Kyoto京都", "7. Kure吴", "8. Osaka大阪"], notes: [] },
    },
}

function esm_lib(role) { return role === "Japan" ? ESM_JP_LIB : ESM_AL_LIB }
function esm_strategy_entry(role, phase, name) {
    return (esm_lib(role)[phase] || {})[name] || null
}
// C: 决策树输出名 -> 本次钉住应绑定的库条目。
// C: decision-tree output name -> the library entry this pin should bind to.
//   • 事件战略: 任何阶段都绑定【早期】条目 —— py 中/晚期 JP 表目标 = “同早期阶段事件战略”,
//   • Event strategy: any phase binds the [early] entry — py mid/late JP table target = "same as early-phase event strategy",
//     AL mid/late 决策树直接 return AL_EARLY_STRATEGIES["事件战略"], 早期条目即完整清单。
//     AL mid/late decision tree directly returns AL_EARLY_STRATEGIES["事件战略"], the early entry is the complete list.
//   • PASS: 库中无条目, 给字面条目。
//   • PASS: no entry in the library, give a literal entry.
//   • 其余: 本阶段精确命中; 无则跨阶段回找(防御, 避免静默空钉)。
//   • Otherwise: exact hit in this phase; if none, fall back across phases (defensive, avoids silently pinning nothing).
function esm_bind_strategy_entry(role, phase, name) {
    const earlyEvt = name === "事件战略" ? esm_strategy_entry(role, "early", name) : null
    if (earlyEvt) return earlyEvt
    if (name === "PASS") return { name: "PASS", kind: "PASS", targets: ["跳过本回合行动"], notes: [] }
    const hit = esm_strategy_entry(role, phase, name)
    if (hit) return hit
    for (const p of ["early", "mid", "late"]) {
        if (p === phase) continue
        const h = esm_strategy_entry(role, p, name)
        if (h) return h
    }
    return null
}
// "轮流战略": 上次重返->跳岛; 上次跳岛->重返。
// "Alternate strategy": last return-to-Philippines -> island hopping; last island hopping -> return-to-Philippines.
function esm_resolve_alternate(lock, role) {
    const last = lock && lock.role && lock.role[role] && lock.role[role].strategyName
    return last === "重返菲律宾" ? "跳岛作战" : "重返菲律宾"
}
function esm_eval(role, phase, ctx, lock) {
    let name
    if (role === "Japan") {
        if (phase === "early") name = esm_jp_eval_early(ctx)
        else if (phase === "mid") name = esm_jp_eval_mid(ctx)
        else name = esm_jp_eval_late(ctx)
    } else {
        if (phase === "early") name = esm_al_eval_early(ctx)
        else if (phase === "mid") name = esm_al_eval_mid(ctx)
        else name = esm_al_eval_late(ctx)
    }
    if (name === "轮流战略") name = esm_resolve_alternate(lock, role)
    return name
}

// ===========================================================================
// D2: 跨回合同轴延续(pin 层驱动, 不改 esm_eval 纯树/保真测试)。
// D2: cross-turn same-axis continuation (driven by the pin layer, does not change the esm_eval pure tree / fidelity tests).
// py 参考 demo 的语义是“一条战略执行到目标达成或阶段切换”; zh.7 逐回合首卡独立
// The py reference demo's semantics is "one strategy runs until its goals are met or the phase switches"; zh.7 re-rolls independently
// 重掷, 使中太平洋/CBI 这类 d10 轮换轴每回合对翻、链首格(如 Kwajalein)始终夺不下。
// at each turn's first card, making d10 rotation axes like Central Pacific / CBI flip every turn and the chain head hex (e.g. Kwajalein) never capturable.
// 规则: 仅当“旧轴与新掷都是同阶段 d10 轮换轴”时, 若旧轴仍具未夺目标且尚未停滞,
// Rule: only when "the old axis and the new roll are both same-phase d10 rotation axes", if the old axis still has uncaptured targets and is not yet stalled,
// 则延续旧轴(override 本次重掷); 旧轴连钉 ≥2 回合仍无链上推进则放行换轴(停滞出口,
// continue the old axis (override this re-roll); if the old axis has been pinned ≥2 turns with no chain progress, allow switching (stall exit,
// 避免死守无产出轴)。树的确定性优先分支(can_pass/事件/反攻/占领轰炸基地/推进B29/
// avoiding sticking to a non-producing axis). The tree's deterministic-priority branches (can_pass/event/counteroffensive/capture bombing base/push B29/
// 原子弹/登陆日本 等)不是轮换轴, 照常打断延续。
// atomic bomb/invade Japan, etc.) are not rotation axes and interrupt the continuation as usual.
// ===========================================================================
const ESM_ROLL_AXES = {
    mid: { "南太平洋战略": 1, "中太平洋战略": 1, "DEI战略": 1, "CBI战略": 1 },
    late: { "重返菲律宾": 1, "跳岛作战": 1 },
}
function esm_is_roll_axis(phase, name) {
    return !!(phase === "mid" || phase === "late") && (ESM_ROLL_AXES[phase] || {})[name]
}
function esm_chain_focus(chain, faction) {
    for (const h of chain || []) {
        if (!(h >= 0 && h <= LAST_BOARD_HEX)) continue
        if (!is_space_controlled(h, faction)) return h
    }
    return null
}
function esm_chain_held_count(chain, faction) {
    let n = 0
    for (const h of chain || []) {
        if (h >= 0 && h <= LAST_BOARD_HEX && is_space_controlled(h, faction)) n++
    }
    return n
}
function esm_pin_axis_continuity(lock, role, phase, freshName) {
    const c = lock.role[role]
    if (!c || !c.strategy) return freshName
    if (c.phase !== phase) return freshName
    const prevName = c.strategyName
    if (!esm_is_roll_axis(phase, prevName) || !esm_is_roll_axis(phase, freshName)) return freshName
    if (freshName === prevName) return freshName
    const chain = c.strategy.chain
    if (!Array.isArray(chain) || !chain.length) return freshName
    const faction = esm_role_faction(role)
    if (esm_chain_focus(chain, faction) === null) return freshName            // 链目标全达成 -> 允许重掷 / all chain goals met -> allow re-roll
    const elapsed = G.turn - (c.runStart || G.turn)
    if (elapsed >= 2 && esm_chain_held_count(chain, faction) <= (c.runHeld === undefined ? 0 : c.runHeld)) return freshName // 停滞 -> 放行 / stalled -> allow
    return prevName
}

// ===========================================================================
// 主入口: 每窗口调用；每次选牌都重新走决策轴，随后只缓存到该牌的动作/执行窗口。
// Main entry: called on every window; each card selection re-walks the decision axis, then caches only to that card's action/execution window.
// 返回 null 表示 gate 关(调方走原路径)。strategy: {name,kind,tokens,notes,phase,role,chain,axisTrace}
// Returning null means the gate is off (the caller takes the original path). strategy: {name,kind,tokens,notes,phase,role,chain,axisTrace}
// ===========================================================================
function esm_pin_strategy(view, context) {
    if (!esm_gate_on()) return null
    const role = context.role
    if (role !== "Japan" && role !== "Allies") return null
    const ord = context.actionOrdinal || 0
    const lock = esm_lock(context.seed, ord)
    if (typeof context.seed !== "undefined" && context.seed !== null) lock.seenOrd = ord

    const faction = esm_role_faction(role)
    const cached = lock.role[role]
    const thisIsCardDecision = esm_is_card_window(view)
    if (!thisIsCardDecision) {
        // 非选牌窗只沿用最近一次选牌形成的战略，以保证该张牌的后续窗口一致。
        // Non-card-selection windows just reuse the strategy formed by the most recent card selection, to keep that card's subsequent windows consistent.
        return (cached && cached.turn === G.turn) ? cached.strategy : null
    }

    const phase = esm_phase(role)
    const seedText = `${context.seed}:${ord}:${role}:${phase}:${G.turn}`
    const ctx = esm_build_ctx(role, lock, seedText)
    let name = esm_eval(role, phase, ctx, lock)
    if ((role === "Japan" && phase === "early" && /南方资源战略/.test(name)) || (role === "Allies" && name === "反攻战略")) {
        const original = esm_strategy_entry(role,phase,name)
        const beforeRoll = esm_goal_target_meta(esm_parse_entry(original,role,phase))
        const complete = beforeRoll.every(t => t.kind === "SUPPRESS" ? !has_zoi(t.hex,1-faction) : is_space_controlled(t.hex,faction))
        if (complete) {
            const roll = esm_trace_d10(ctx, role === "Japan" ? "JP01-RESOURCE-D10" : "AP08-COMPLETE-D10", undefined, ":allocation:"+ord)
            ctx._allocationFrom = name
            if (role === "Japan") name = roll <= 2 ? "事件战略" : roll <= 6 ? "中缅印战略" : "中太平洋战略"
            else name = roll <= 4 ? "南太平洋战略" : roll <= 7 ? "中太平洋战略" : roll === 8 ? "DEI战略" : "CBI战略"
        }
    }
    // D2 接线: 同阶段 d10 轮换轴(盟军 mid 南太平洋/中太平洋/DEI/CBI、late 重返/跳岛)
    // D2 wiring: same-phase d10 rotation axes (Allied mid South Pacific / Central Pacific / DEI / CBI, late return / island hopping)
    // 在旧轴仍有未夺目标且尚未停滞时延续旧轴, 阻止逐卡重掷导致每回合内反复换轴、
    // continue the old axis while it still has uncaptured targets and is not yet stalled, preventing per-card re-rolls from switching axes repeatedly
    // 链首格(如 Kwajalein/Guadalcanal)永远夺不下。确定性分支(can_pass/事件/反攻/
    // within a turn and leaving the chain head hex (e.g. Kwajalein/Guadalcanal) forever uncapturable. Deterministic branches (can_pass/event/counteroffensive/
    // 占领轰炸基地/推进B29/原子弹/登陆日本)不是轮换轴, 照常打断延续。
    // capture bombing base/push B29/atomic bomb/invade Japan) are not rotation axes and interrupt the continuation as usual.
    name = esm_pin_axis_continuity(lock, role, phase, name)
    // 用户反馈(重大bug)：决策轴每张牌重新判，但空优战略的压制目标按「无敌方 AZOI」
    // User feedback (major bug): the decision axis re-judges every card, but the air-superiority strategy's suppression targets, once judged
    // (esm_strategy_targets / eop_target_pending 口径)判定完成后，仍被反复选中、链空无
    // complete by the "no enemy AZOI" caliber (esm_strategy_targets / eop_target_pending), keep getting re-selected with an empty chain
    // 目标，且图表箭头「A=盟军HQ断补」在实践中永不满足(实测 oosSize 全程为 0)。故：当
    // and no targets, and the chart arrow "A = Allied HQ out of supply" is never satisfied in practice (measured oosSize is 0 the whole time). So: when
    // 空优战略的压制目标已按同一口径全部达成(盟军HQ格与东印度压制目标均无盟军 AZOI)
    // the air-superiority strategy's suppression targets are all met by that same caliber (Allied HQ hexes and East Indies suppression targets all have no Allied AZOI),
    // 时，再做一次战略判断，转入南方资源战略实际夺占(菲律宾/马来亚/东印度投降)。
    // do another strategy judgment and switch to the Southern Resource strategy for actual capture (Philippines/Malaya/East Indies surrender).
    if (role === "Japan" && phase === "early" && (name === "保守的空优战略" || name === "激进的空优战略")) {
        // 空优战略的完成口径：图表脚注[1]「激活必须使盟军HQ断补」——即所有压制HQ目标
        // Air-superiority strategy completion caliber: chart footnote [1] "activation must put the Allied HQ out of supply" — i.e. all suppressed-HQ targets
        // 都已离场/断补/被灭(esm_jp_hq_suppression_targets 已跳过 OOS 的 HQ，故 length===0
        // have left the map / gone OOS / been destroyed (esm_jp_hq_suppression_targets already skips OOS HQs, so length===0
        // 等价于「HQ 全断补」)。原用 !has_zoi(敌 AZOI 消失) 会随敌航空转场而反复闪烁，
        // is equivalent to "all HQs out of supply"). The old !has_zoi (enemy AZOI gone) flickers as enemy air transfers,
        // 导致日军长期滞留空优、空袭无法消灭地面军、又不去夺取实质推进目标。
        // causing Japan to linger in air superiority, air strikes unable to destroy ground units, and never capturing substantive advance targets.
        const hqDone = (name === "激进的空优战略") || esm_jp_hq_suppression_targets().length === 0
        let deiDone = true
        for (const h of ["Jolo", "Makassar", "Teloekbetoeng", "Bandjermasin"]) {
            const idx = esm_idx(h)
            if (!Number.isInteger(idx) || has_zoi(idx, AP)) { deiDone = false; break }
        }
        // 第3回合起无论压制是否“完美达成”都转南方资源战略实际夺占(菲律宾/马来亚/东印度
        // From turn 3 on, regardless of whether suppression is "perfectly achieved", switch to the Southern Resource strategy for actual capture (Philippines/Malaya/East Indies
        // 投降)，避免空优战略因目标永远无法按 !has_zoi 口径完成而卡死整局。
        // surrender), to avoid the air-superiority strategy dead-locking the whole game because its goals can never be met by the !has_zoi caliber.
        if ((hqDone && deiDone) || G.turn >= 3) name = "激进的南方资源战略"
    }
    // 事件战略: 钉住内容统一展开到【早期】事件清单(py 三处口径殊途同归):
    // Event strategy: the pinned content is uniformly expanded to the [early] event list (py's three calibers all converge):
    //   (a) JP 表中/晚期目标 = "同早期阶段事件战略"(指针);
    //   (a) JP table mid/late target = "same as early-phase event strategy" (pointer);
    //   (b) AL mid/late 决策树直接 return AL_EARLY_STRATEGIES["事件战略"](py 共用早期条目,
    //   (b) AL mid/late decision tree directly returns AL_EARLY_STRATEGIES["事件战略"] (py shares the early entry,
    //       且 JS AL mid/late 库无此键 —— 原实现静默落空 EVENT);
    //       and the JS AL mid/late libraries lack this key — the original implementation silently pinned nothing for EVENT);
    //   (c) 早期条目自身即完整 8/6 行清单。
    //   (c) the early entry itself is the complete 8/6-row list.
    // 故无论哪阶段选中事件战略, 都按【早期】清单整回合执行(C: 事件战略顺序化)。
    // So no matter which phase selects the event strategy, execute the whole turn by the [early] list (C: event-strategy ordering).
    // 事件战略 -> 早期条目(见 esm_bind_strategy_entry 注释)。
    // Event strategy -> early entry (see the esm_bind_strategy_entry comment).
    const isEventStrat = name === "事件战略"
    const entry = esm_bind_strategy_entry(role, phase, name)
    const contentPhase = isEventStrat ? "early" : phase
    let goals = [], chain = [], dynamicTargets = [], targetMeta = []
    if (entry) {
        // 忠实 parse_goals: 有序 Goal(kind+hex+region) + 指针/资源/落底展开。
        // Faithful parse_goals: ordered Goal (kind+hex+region) + pointer/resource/fallback expansion.
        try { goals = esm_parse_entry(entry, role, contentPhase) } catch (e) { goals = [] }
        chain = esm_chain_of(goals)
        targetMeta = esm_goal_target_meta(goals)
    }
    if (role === "Japan" && (name === "保守的空优战略" || name === "激进的南方资源战略")) {
        // 静态链里已有同格的夺占目标(投降/CONQUEST, requiresOccupation)时，不要再用
        // When the static chain already has a capture target on the same hex (surrender/CONQUEST, requiresOccupation), don't let
        // SUPPRESS_HQ 把整份静态 meta 顶替掉：压制HQ(去敌方 AZOI) ≠ 占领城市(马来亚/
        // SUPPRESS_HQ replace the whole static meta: suppressing an HQ (removing enemy AZOI) ≠ capturing a city (Malaya/
        // 菲律宾投降)。占领该格本身会消灭其上的盟军 HQ、同时达成压制，故这类 HQ 格应
        // Philippines surrender). Capturing that hex itself destroys the Allied HQ on it and achieves suppression at once, so such HQ hexes should
        // 保留静态夺占目标，只对「不落在任何投降格上」的 HQ(如 ABDA 若设于 Kendari)保留
        // keep the static capture target, and only HQs "not falling on any surrender hex" (e.g. ABDA if placed at Kendari) keep a
        // 独立 SUPPRESS_HQ 前置。否则马尼拉/新加坡在 T2 之后退回纯压制、永不占领。
        // standalone SUPPRESS_HQ prerequisite. Otherwise Manila/Singapore revert to pure suppression after T2 and are never captured.
        const conquered = new Set(targetMeta.filter(t => t.requiresOccupation).map(t => t.hex))
        dynamicTargets = esm_jp_hq_suppression_targets().filter(t => !conquered.has(t.hex))
        chain = dynamicTargets.map(target => target.hex).concat(chain.filter(h => !dynamicTargets.some(target => target.hex === h)))
        const dynamicHexes = new Set(dynamicTargets.map(target => target.hex))
        targetMeta = dynamicTargets.concat(targetMeta.filter(target => !dynamicHexes.has(target.hex)))
    }
    if (role === "Japan" && name === "激进的南方资源战略") {
        const allDeiNames = ["Balikpapan", "Tarakan", "Batavia", "Tjilatjap", "Soerabaja", "Bangka", "Palembang", "Medan"]
        const allDei = new Set(allDeiNames.map(esm_idx).filter(Number.isInteger))
        const exactDei = esm_jp_dei_surrender_targets()
        const first = chain.findIndex(h => allDei.has(h))
        const withoutDei = chain.filter(h => !allDei.has(h))
        const at = first < 0 ? withoutDei.length : Math.min(first, withoutDei.length)
        chain = withoutDei.slice(0, at).concat(exactDei.map(x => x.hex), withoutDei.slice(at))
        targetMeta = targetMeta.filter(x => !allDei.has(x.hex)).concat(exactDei)
        const order = new Map(chain.map((h, i) => [h, i]))
        targetMeta.sort((a, b) => (order.get(a.hex) ?? 9999) - (order.get(b.hex) ?? 9999))
    }
    // 投降完成度只做审计，不覆盖第1页实际选出的空优、资源或事件战略。
    // Surrender completion is only for audit and does not override the air-superiority, resource, or event strategy actually selected on page 1.
    const openingSurrenderPlan = role === "Japan" && G.turn <= 4 ? {
        philippinesComplete: !!G.surrender[nations.PHILIPPINES.id],
        deiComplete: !!G.surrender[nations.DEI.id], diagnosticOnly: true,
    } : null
    if (role === "Japan" && name === "最终防御战略") {
        dynamicTargets = esm_jp_final_defense_targets()
        chain = dynamicTargets.map(target => target.hex)
        targetMeta = dynamicTargets.slice()
    }
    // D4: ABSTRACT 自身无 hex 链(纯文本目标), 落到可执行回退链, 让 eop 焦点层在"推进B29/
    // D4: ABSTRACT itself has no hex chain (pure-text goals); fall back to an executable chain so the eop focus layer still has a
    // 原子弹胜利"钉住期间仍有可打的主攻方向:
    // playable main axis of attack while "push B29 / atomic-bomb victory" is pinned:
    //   推进B29   -> 占领轰炸基地(把基地前推到距东京 ≤8, B29 才谈得上就位/轰炸);
    //   push B29   -> capture bombing base (push the base to within ≤8 of Tokyo, only then can B29 position/bomb);
    //   原子弹胜利 -> 精确选择两个仍由日本控制的资源格。
    //   atomic-bomb victory -> precisely select two resource hexes still controlled by Japan.
    if (entry && entry.kind === "ABSTRACT" && !chain.length) {
        const fbName = name === "推进B29" ? "占领轰炸基地" : null
        if (fbName) {
            const fb = esm_strategy_entry(role, "late", fbName)
            if (fb) {
                try {
                    const fbGoals = esm_parse_entry(fb, role, "late")
                    goals = fbGoals
                    chain = esm_chain_of(fbGoals)
                    targetMeta = esm_goal_target_meta(fbGoals)
                } catch (e) { /* 保持空链 / keep empty chain */ }
            }
        }
        if (name === "原子弹胜利" && typeof atomic_bomb_strategy_status === "function") {
            const atomic = atomic_bomb_strategy_status()
            const resourceTargets = atomic.jpResourceHexes.map(hex => ({ hex, kind: "CONQUEST",
                objective: "原子弹胜利：占领两个剩余日本资源格", damageLevel: 1,
                requiresOccupation: true, victoryConstraint: "ATOMIC_CAPTURE_TWO_RESOURCES" }))
                .sort((a, b) => esm_front_distance(a.hex, AP) - esm_front_distance(b.hex, AP) || a.hex - b.hex)
                .slice(0, 2)
            chain = resourceTargets.map(x => x.hex)
            targetMeta = resourceTargets
            dynamicTargets = resourceTargets
        }
    }
    // B29 在第9回合进入；若到第9回合才开始找基地，战略轰炸链必然滞后。中期后半段
    // B29 enters on turn 9; if we only start looking for a base on turn 9, the strategic-bombing chain necessarily lags. The second half of mid
    // 仍保留决策轴选出的战区/战略名称，但以明确的规则胜利前视把图表已有“占领战略
    // keeps the theater/strategy name chosen by the decision axis, but uses an explicit rule-victory lookahead to put the chart's existing "capture
    // 轰炸基地”链放到执行队首。PoW 亏空会在下一段再次前插，故政治意志生存仍优先。
    // strategic bombing base" chain at the head of execution. The PoW deficit will be re-inserted first in the next section, so political-will survival still takes priority.
    let victoryApproach = null
    if (false && role === "Allies" && phase === "mid" && G.turn >= 6) {
        const bombingEntry = esm_strategy_entry("Allies", "late", "占领轰炸基地")
        if (bombingEntry) {
            let approach = []
            try { approach = esm_goal_target_meta(esm_parse_entry(bombingEntry, "Allies", "late")) } catch (e) { approach = [] }
            approach = approach.filter(x => x.hex >= 0 && x.hex <= LAST_BOARD_HEX && !is_space_controlled(x.hex, AP))
                .map(x => ({ ...x, kind: "CONQUEST", requiresOccupation: true,
                    objective: `B29前置夺岛：${get_map_data(x.hex).name || x.hex}`,
                    victoryConstraint: "B29_BASE_APPROACH" }))
            if (approach.length) {
                const hs = new Set(approach.map(x => x.hex))
                chain = approach.map(x => x.hex).concat(chain.filter(h => !hs.has(h)))
                targetMeta = approach.concat(targetMeta.filter(x => !hs.has(x.hex)))
                dynamicTargets = approach.concat(dynamicTargets.filter(x => !hs.has(x.hex)))
                victoryApproach = { type: "B29_BASE_APPROACH", source: "RULE_VICTORY_OVERLAY",
                    turn: G.turn, remaining: approach.map(x => x.hex) }
            }
        }
    }
    let progressPlan = null
    if (role === "Allies" && name !== "跳岛作战" && name !== "重返菲律宾" && name !== "反攻战略") {
        const progress = esm_ap_progress_targets(chain, targetMeta)
        if (progress.length) {
            const progressHexes = new Set(progress.map(x => x.hex))
            chain = progress.map(x => x.hex).concat(chain.filter(h => !progressHexes.has(h)))
            targetMeta = progress.concat(targetMeta.filter(x => !progressHexes.has(x.hex)))
            dynamicTargets = progress.concat(dynamicTargets.filter(x => !progressHexes.has(x.hex)))
            progressPlan = { required: Number(G.pow || 0), bank: esm_pow_bank(), remaining: progress.map(x => x.hex) }
        }
    }
    let victoryPreparation = victoryApproach
    if (role === "Allies" && phase === "late" && name === "登陆日本" && typeof atomic_bomb_strategy_status === "function") {
        const atomic = atomic_bomb_strategy_status()
        // 原子弹胜利 = 轰炸未失败 AND 苏联牌就绪 AND 资源达标。苏联牌(AP#79)作事件需
        // Atomic-bomb victory = no bombing failure AND Soviet card ready AND resources satisfied. The Soviet card (AP#79) as an event requires
        // TOJO 事件先激活(JP 打出卡43)，但 #79 多在 T3-T7 过早抽到、在 TOJO 激活前被当
        // the TOJO event to fire first (JP plays card 43), but #79 is usually drawn too early in T3-T7 and played as
        // OC 打掉，sovietReady 恒假 -> 原子弹路线不可达。此时若只按"资源超标"就去夺资源，
        // OC before TOJO activates, sovietReady constantly false -> atomic-bomb route unreachable. If we capture resources just because "resources exceed the limit",
        // 是把资源当成了独立硬条件而忽视苏联牌这一并行前提，纯属为不可达的原子弹铺路；
        // we treat resources as an independent hard condition while ignoring the Soviet card's parallel prerequisite, merely paving the way for an unreachable atomic bomb;
        // 应走封锁胜利路线(else 分支: 夺港 + AZOI 切断日本本土→资源格海路)。故资源夺回
        // we should take the blockade-victory route (else branch: capture ports + AZOI cutting Japan's home islands → resource hex sea route). So resource recapture
        // 仅当苏联牌就绪时才有意义。
        // only makes sense when the Soviet card is ready.
        if (atomic.noStrategicBombingFailure && atomic.sovietReady && !atomic.resourcesSatisfied) {
            const resourceTargets = atomic.jpResourceHexes.map(hex => ({ hex, kind: "CONQUEST",
                objective: "原子弹战略准备：夺取剩余日本资源格", damageLevel: 1,
                requiresOccupation: true, victoryConstraint: "ATOMIC_RESOURCE_LIMIT" }))
                .sort((a, b) => esm_front_distance(a.hex, AP) - esm_front_distance(b.hex, AP) || a.hex - b.hex)
            const resourceHexes = new Set(resourceTargets.map(x => x.hex))
            chain = resourceTargets.map(x => x.hex).concat(chain.filter(h => !resourceHexes.has(h)))
            targetMeta = resourceTargets.concat(targetMeta.filter(x => !resourceHexes.has(x.hex)))
            dynamicTargets = resourceTargets.concat(dynamicTargets.filter(x => !resourceHexes.has(x.hex)))
            victoryPreparation = { type: "ATOMIC_RESOURCE_LIMIT", current: atomic.jpResources,
                limit: atomic.resourceLimit, remaining: resourceTargets.map(x => x.hex) }
        } else {
            const blockadeTargets = esm_ap_blockade_targets()
            const blockadeHexes = new Set(blockadeTargets.map(x => x.hex))
            chain = blockadeTargets.map(x => x.hex).concat(chain.filter(h => !blockadeHexes.has(h)))
            targetMeta = blockadeTargets.concat(targetMeta.filter(x => !blockadeHexes.has(x.hex)))
            dynamicTargets = blockadeTargets.concat(dynamicTargets.filter(x => !blockadeHexes.has(x.hex)))
            let connected = null
            try { connected = !!check_japan_resource_trace() } catch (e) { /* 仅诊断 / diagnostic only */ }
            victoryPreparation = { type: "JAPAN_RESOURCE_BLOCKADE", source: "RULE_VICTORY_OVERLAY",
                connected, timerStart: is_event_active(events.JAPAN_TRACE_RESOURCES) || 0,
                remaining: blockadeTargets.map(x => x.hex),
                note: "夺取北方港口与南方岛链机场，部署航空AZOI并清除日军航空，维持连续三个国势阶段断线" }
        }
    }
    targetMeta = esm_semantic_targets(role, phase, name, targetMeta)
    chain = [...new Set(targetMeta.map(t=>t.hex))]
    dynamicTargets = targetMeta.filter(t=>t.requiredUnits || t.escortPairs || t.dynamicBase || t.extraActivationOnly)
    const strategy = entry ? {
        name, nameFull: entry.name, kind: entry.kind, notes: entry.notes, targets: entry.targets,
        phase, role, seed: seedText, ord, pinnedNow: true, goals, chain, dynamicTargets, targetMeta, ctx,
        nodePath: (ctx._nodePath || []).slice(), conditions: (ctx._conditions || []).slice(), d10Rolls: (ctx._dice || []).slice(),
        eventPhase: isEventStrat ? "early" : undefined,
        openingSurrenderPlan, progressPlan, victoryPreparation,
    } : {
        name, nameFull: name, kind: "EVENT", notes: [], targets: [], phase, role, ord,
        pinnedNow: true, goals: [], chain: [], targetMeta: [], ctx,
        nodePath: (ctx._nodePath || []).slice(), conditions: (ctx._conditions || []).slice(), d10Rolls: (ctx._dice || []).slice(),
    }
    // D2: 记录本轴连续运行起点的回合与链上控格数(供下一回合的延续/停滞判定)。
    // D2: record the turn and held-hex count at the start of this axis's continuous run (for next turn's continuation/stall judgment).
    const prevCache = lock.role[role]
    const sameRun = !!(prevCache && prevCache.strategyName === name)
    const runStart = (sameRun && prevCache.runStart) ? prevCache.runStart : G.turn
    const runHeld = (sameRun && prevCache.runHeld !== undefined) ? prevCache.runHeld : esm_chain_held_count(chain, faction)
    lock.role[role] = { turn: G.turn, phase, strategyName: name, strategy, runStart, runHeld }
    esm_log_strategy(strategy)
    return strategy
}

/** import server/erasmus_card.js*/
/** import server/erasmus_placement.js*/
