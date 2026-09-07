/** import server/erasmus_ops.js*/
/** import server/erasmus_data.js*/
/** import server/erasmus_state.js*/

const ERASMUS_VERSION = "erasmus-v2.0-zh.26"
const ACTION_PRIORITY = ["event", "ops", "play_card", "card", "action_hex", "delay", "unit", "hex", "strat_move", "ground_move", "roll", "eliminate", "continue", "next", "done", "skip", "pass", "cancel"]
const FAMILY_ACTION_PRIORITY = {
    // OPS 卡/攻势战略: 在“Select action”窗口应打出 ops,而不是事件
    // OPS card/offensive strategy: in the "Select action" window play ops, not the event
    ops: ["ops", "event", "card", "play_card", "action_hex", "unit", "hex", "strat_move", "ground_move", "roll", "continue", "next", "done", "skip", "pass"],
    // 事件卡/事件战略: 先按 EC 打出
    // Event card/event strategy: play by EC first
    event: ["event", "ops", "card", "play_card", "future_offensive", "discard", "roll", "continue", "next", "done", "skip", "pass"],
    // 先发打击 FO 卡: 本身按事件打出(在顶窗口表现为选择该牌)
    // First-strike FO card: itself played as an event (appears in the top window as selecting that card)
    fo: ["card", "event", "ops", "play_card", "future_offensive", "roll", "continue", "next", "done", "skip", "pass"],
    pass: ["pass", "skip", "done", "next", "roll"],
    ground: ["action_hex", "unit", "hex", "event", "ops", "done"],
    reaction: ["roll", "event", "unit", "action_hex", "eliminate", "done"],
}

// 无头移动窗里这些“按钮”不会真正完成移动, bot 永不把它们当作最终动作:
// In the headless move window these "buttons" never truly complete a move; the bot never treats them as final actions:
//  - move: 无路径参数的残按钮(move(undefined) 直接崩溃)。
//  - move: a residual button with no path argument (move(undefined) crashes outright).
//  - avoid_zoi/amphibious/barges/extended_air/advanced_move/no_organic: 只切 L.move_type
//  - avoid_zoi/amphibious/barges/extended_air/advanced_move/no_organic: only toggle L.move_type
//    或改编成后重渲染(期望玩家再点目标格), 无头下只会重落到 move 崩溃或死窗。
//    or re-render after reframing (expecting the player to click a target hex); headless they only fall back to the move crash or a dead window.
// 真正的移动由 advance 经 self.move(path) 完成, 或由 done/turn_box/no_move/stop 收尾。
// A real move is completed by advance via self.move(path), or finished by done/turn_box/no_move/stop.
const HEADLESS_MOVE_NOOP = new Set(["move", "avoid_zoi", "amphibious", "barges", "extended_air", "advanced_move", "no_organic"])

// 在“移动窗里单位已被选中(active_stack 非空, 表现为 unselect 非空且无 advance)”时, 唯一
// When "a unit is already selected in the move window (active_stack non-empty, i.e. unselect non-empty and no advance)", the only
// 能回到可控状态的合法动作就是撤销选择(unit) —— 回空栈后 advance/done/turn_box 重新接管。
// legal action that returns to a controllable state is deselect (unit) — after the stack empties, advance/done/turn_box take over again.
// 其余按钮(avoid_zoi/strat_move/ground_move/... / move)要么切模式要么崩溃, 不可作为收尾。
// Other buttons (avoid_zoi/strat_move/ground_move/... / move) either toggle mode or crash, and cannot serve as a finish.
function move_window_should_deselect(view, legal) {
    return /move units/i.test(String(view.prompt || ""))
        && !legal.includes("advance")
        && legal.includes("unit")
        && Array.isArray(view.unselect) && view.unselect.length > 0
}

function erasmus_hash(text) {
    let value = 2166136261
    for (let i = 0; i < text.length; ++i) { value ^= text.charCodeAt(i); value = Math.imul(value, 16777619) }
    return value >>> 0
}

function legal_actions(view) {
    return Object.keys(view.actions || {}).filter(action => {
        if (["undo", "redo", "awaiting"].includes(action)) return false
        const value = view.actions[action]
        return Array.isArray(value) ? value.length > 0 : Boolean(value)
    })
}

function predicate_value(view, id, context, nodeId) {
    // 第6/12页反应 predicate 精确化 (PR4)：WEATHER_STANDARD_MET 用真实激活单位数+D10+情报
    // Page 6/12 reaction predicate refinement (PR4): WEATHER_STANDARD_MET uses the real activated-unit count + D10 + intelligence
    // 修正，不再用「敌激活数×2」代理；REACTION_FORCE_STANDARD_MET 用 D10 地面 2x 标准；
    // correction, no longer the "enemy activated ×2" proxy; REACTION_FORCE_STANDARD_MET uses the D10 ground 2x standard;
    // 神风/潜艇标准走 RTT 查询层。惰性按节点缓存，缺失(undefined)时退回 view.ai.predicates。
    // kamikaze/submarine standards go through the RTT query layer. Lazily cached per node; falls back to view.ai.predicates when missing (undefined).
    if (EOP_EXACT_REACTION_PREDICATES && EOP_EXACT_REACTION_PREDICATES.indexOf(id) >= 0) {
        if (!context.__exactReactionPreds) context.__exactReactionPreds = {}
        if (!context.__exactReactionPreds[nodeId]) context.__exactReactionPreds[nodeId] = eop_exact_reaction_predicates(view, context, nodeId)
        const exact = context.__exactReactionPreds[nodeId][id]
        if (exact !== undefined) return !!exact
    }
    // 第5/11页任务部队 predicate 精确化 (PR2)：优先读 RTT 规则查询层的精确求值，
    // Page 5/11 task-force predicate refinement (PR2): prefer the exact evaluation from the RTT rule-query layer,
    // 缺失(undefined)时退回 view.ai.predicates 的启发式兜底。惰性计算一次并挂到 context。
    // and fall back to the heuristic view.ai.predicates when missing (undefined). Computed lazily once and attached to context.
    if (EOP_EXACT_TASKFORCE_PREDICATES && EOP_EXACT_TASKFORCE_PREDICATES.indexOf(id) >= 0) {
        if (!context.__exactTaskforcePreds) context.__exactTaskforcePreds = eop_exact_taskforce_predicates(view, context)
        const exact = context.__exactTaskforcePreds[id]
        if (exact !== undefined) return !!exact
    }
    // 战略层残余启发式精确化 (PR5)：IS_LAST_TARGET / CBI_DEFENSE_COMPLETE / ORANGE_PLAN_CRITERIA /
    // Remaining strategic-layer heuristic refinement (PR5): IS_LAST_TARGET / CBI_DEFENSE_COMPLETE / ORANGE_PLAN_CRITERIA /
    // PERIMETER_TARGET_1_COMPLETE 接到 erasmus_state 同源精确求值；不可判定(undefined)时退回
    // PERIMETER_TARGET_1_COMPLETE are wired to the same-source exact evaluation in erasmus_state; when undecidable (undefined) fall back to
    // view.ai.predicates 兜底，不擅自造值。
    // view.ai.predicates, never fabricating a value.
    if (EOP_EXACT_STRATEGIC_PREDICATES && EOP_EXACT_STRATEGIC_PREDICATES.indexOf(id) >= 0) {
        if (!context.__exactStrategicPreds) context.__exactStrategicPreds = eop_exact_strategic_predicates(view, context, nodeId)
        const exact = context.__exactStrategicPreds[id]
        if (exact !== undefined) return !!exact
    }
    if (view.ai && view.ai.predicates && Object.prototype.hasOwnProperty.call(view.ai.predicates, id))
        return !!view.ai.predicates[id]
    const turn = Number(view.turn || 0)
    const prompt = String(view.prompt || "").toLowerCase()
    const has = action => Object.prototype.hasOwnProperty.call(view.actions || {}, action)
    const hand = faction => Array.isArray(view.hand?.[faction]) ? view.hand[faction].length : Number(view.hand?.[faction] || 0)
    const values = {
        JP_HAND_GE_3: hand(0) >= 3, AP_HAND_GE_3: hand(1) >= 3,
        JP_HAND_GT_2: hand(0) > 2, AP_HAND_GT_2: hand(1) > 2,
        JP_LOGISTICS_GTE_20: Number(view.logistics?.[0] || view.logistic?.[0] || 0) >= 20,
        JP_LOGISTICS_GTE_15: Number(view.logistics?.[0] || view.logistic?.[0] || 0) >= 15,
        JP_RESOURCES_LTE_13: Number(view.resources?.[0] || 99) <= 13,
        JP_RESOURCES_GE_13: Number(view.resources?.[0] || 0) >= 13,
        AP_WAR_ENTHUSIASM_LE_4: Number(view.wie || 99) <= 4,
        AP_HAS_PASS: Number(view.passes?.[1] || 0) > 0, JP_HAS_PASS: Number(view.passes?.[0] || 0) > 0,
        AP_CAN_PASS: Number(view.passes?.[1] || 0) > 0, JP_CAN_PASS: Number(view.passes?.[0] || 0) > 0,
        TURN_GE_3: turn >= 3, TURN_GE_5: turn >= 5, TURN_12: turn === 12, IS_FINAL_TURN: turn >= 10,
        JP_FO_ACTIVE: Number(view.future_offensive?.[0] || 0) > 0, AP_FO_ACTIVE: Number(view.future_offensive?.[1] || 0) > 0,
        HAS_BATTLE: prompt.includes("battle") || prompt.includes("战斗"),
        WEATHER_CARD_AVAILABLE: has("card") || has("event"), ISR_REACTION: prompt.includes("reaction") || prompt.includes("情报"),
        HAS_SUPPORT_POINTS: has("unit") || has("action_hex"),
    }
    if (Object.prototype.hasOwnProperty.call(values, id)) return values[id]
    throw new Error(`ERASMUS_UNKNOWN_PREDICATE:${id}`)
}

function select_chart(role, view) {
    const side = role === "Japan" ? "JP" : "AP"
    const turn = Number(view.turn || 0)
    const actions = Object.keys(view.actions || {})
    const windowKind = view.ai && view.ai.windowKind
    const kind = windowKind === "pbm" || windowKind === "reaction" ? "reaction"
        : windowKind === "card-selection" ? "card-selection"
        : windowKind === "task-force" ? "task-force"
        : actions.some(a => ["card", "event", "ops"].includes(a)) ? "card-selection"
            : actions.some(a => ["unit", "hex", "action_hex"].includes(a)) ? "task-force" : "decision-axis"
    const phase = kind === "decision-axis" ? (turn >= 10 ? "end" : turn >= 5 ? "middle" : "early") : "all"
    return ERASMUS_CHARTS.find(chart => chart.role === role && chart.phase === phase && chart.kind === kind)
        || ERASMUS_CHARTS.find(chart => chart.role === role && chart.kind === kind)
        || ERASMUS_CHARTS.find(chart => chart.role === role)
}

function strategy_family(tag) {
    // 先处理后缀式卡牌策略(避免 *_OPS_CARD 被 *_EVENT_CARD 分支误判)
    // Handle suffix-style card strategies first (avoid *_OPS_CARD being misjudged by the *_EVENT_CARD branch)
    if (/_OPS_CARD$/.test(tag)) return "ops"
    if (/(?:UN)?LIMITED_EVENT_CARD$/.test(tag) || /_EVENT_CARD$/.test(tag) || /_EVENT$/.test(tag)) return "event"
    if (tag.includes("FUTURE_OFFENSIVE")) return "fo"
    if (tag.includes("PASS")) return "pass"
    if (tag.includes("PBM") || tag.includes("REACTION")) return "reaction"
    if (tag.includes("GROUND") || tag.includes("LANDING") || tag.includes("STRIKE") || tag.includes("ADVANCE")) return "ground"
    return "default"
}

function action_for_strategy(strategy, legal) {
    const tag = String(strategy || "")
    const family = strategy_family(tag)
    const preferred = FAMILY_ACTION_PRIORITY[family] || ACTION_PRIORITY
    return [...preferred, ...ACTION_PRIORITY].find(action => legal.includes(action)) || null
}

// 迭代 SELECT(priority) 节点的候选策略,按优先级返回第一个当前窗口可执行的
// Iterate the candidate strategies of a SELECT(priority) node, returning the first one executable in the current window
// 策略(对应图中 candidate_found 边);全部不可执行才返回 null(→ no_candidate/fallback)。
// by priority (the candidate_found edge in the chart); returns null (→ no_candidate/fallback) only when none are executable.
function first_executable_strategy(strategies, legal, view) {
    const attempts = []
    for (const item of strategies || []) {
        const id = typeof item === "string" ? item : item?.id
        const action = action_for_strategy(id, legal)
        attempts.push({ strategy: id, action })
        if (action) return { strategy: id, action, attempts }
    }
    return { strategy: null, action: null, attempts }
}

function pick_argument(value, seedText, action, view) {
    if (!Array.isArray(value) || value.length === 0) return undefined
    let candidates = value.slice()
    if (action === "unit" && view.offensive?.active_units) {
        const selected = new Set(view.offensive.active_units.flat())
        const available = candidates.filter(item => !selected.has(item))
        if (available.length) candidates = available
    }
    candidates.sort((a, b) => String(a).localeCompare(String(b), "en", { numeric: true }))
    return candidates[erasmus_hash(seedText) % candidates.length]
}

// 目标聚焦 (操作层, 见 erasmus_ops.js): 当该方有“主轴/焦点”时, 把选目标格
// Target focus (operational layer, see erasmus_ops.js): when the side has a "main axis/focus", turn the scattered
// (action_hex) 与选进攻单位 (unit) 的散打改为沿主轴线行动——先打当前最优先
// selection of target hexes (action_hex) and offensive units (unit) into acting along the main axis — first hit the current highest-priority
// 未夺目标, 目标不可达时打离焦点最近的格/单位, 逐步向主轴推进。
// uncaptured target, and when the target is unreachable hit the hex/unit nearest the focus, gradually advancing along the axis.
function target_argument(action, value, seedText, role, view, strategy) {
    const prompt = String(view?.prompt || "")
    // advance 不是无参数的“随便走一步”：把当下图表焦点及目标类型写入回放参数，
    // advance is not a parameterless "just move anywhere": write the current chart focus and target type into the replay params,
    // 使无头移动在保存/恢复/复盘时不依赖进程内 EOP_OVERRIDE 的瞬时值。
    // so headless moves don't depend on the in-process transient EOP_OVERRIDE value during save/restore/review.
    if (action === "advance" && esm_gate_on()) {
        const focus = eop_focus(role)
        const meta = focus === null ? null : eop_target_meta(role, focus)
        const axis = eop_axis(role)
        return {
            ...(meta || {}),
            focus,
            kind: meta?.kind || null,
            requiresOccupation: !!meta?.requiresOccupation,
            axisKind: axis?.kind || null,
            strictSequential: !!axis?.strictSequential || !!meta?.strictSequential,
            chain: Array.isArray(axis?.chain) ? axis.chain.slice() : [],
            targetMeta: Array.isArray(axis?.targetMeta) ? axis.targetMeta.map(x=>({...x})) : [],
        }
    }
    // 通用: unit 候选里若混入“已选/将被撤销”的 unselect 单位(unselect_unit 塞进来的),
    // General: if the unit candidates include "already-selected/will-be-deselected" unselect units (injected by unselect_unit),
    // 选它只会 toggle 撤销当前选择 → 死循环。先在入口统一剔除, 只留“可新增/可前进”的单位;
    // selecting one only toggles/deselects the current selection → infinite loop. Filter them out uniformly at entry, keeping only "addable/advanceable" units;
    // 若剔除后为空, 交 evaluateChart 的动作级兜底跳过 unit(见 isActivateWindow 上方的通用兜底)。
    // if empty after filtering, let evaluateChart's action-level fallback skip unit (see the general fallback above isActivateWindow).
    if (action === "unit" && Array.isArray(value) && Array.isArray(view?.unselect) && view.unselect.length) {
        const unsel = new Set(view.unselect)
        const avail = value.filter(u => !unsel.has(u))
        if (avail.length) value = avail
    }
    // CDSS「增援或补员阶段」落位/补员选择 (zh.7 补全): 按优先级落位, 而非散打(随机/就近焦点)。
    // CDSS "reinforcement or replacement phase" placement/replacement selection (zh.7 completion): place by priority, not scattered (random/nearest focus).
    // 仅完整全图剧本启用(gate on), 保持 SP/Burma 子图剧本行为不变(golden 不动)。
    // Enabled only for the full-map scenarios (gate on), keeping SP/Burma sub-scenario behavior unchanged (golden untouched).
    if (esm_gate_on() && action === "action_hex" && /as a reinforcement|choose hex to place/i.test(prompt)) {
        const u = (typeof G !== "undefined" && G && G.active_stack && G.active_stack[0]) || -1
        const piece = (u >= 0 && typeof pieces !== "undefined" && pieces[u]) ? pieces[u] : null
        const picked = esm_pick_placement(value, role, u, piece)
        return picked !== undefined ? picked : pick_argument(value, seedText, action, view)
    }
    if (esm_gate_on() && action === "unit" && /choose unit to reinforce/i.test(prompt)) {
        const picked = esm_pick_replacement_unit(value, role)
        return picked !== undefined ? picked : pick_argument(value, seedText, action, view)
    }
    if ((action === "action_hex" || action === "hex") && view?.ai?.windowKind === "pbm") {
        const picked = planPostBattleMovement(view,value,action,role)
        return picked !== undefined ? picked : pick_argument(value, seedText, action, view)
    }
    if(action==="unit"&&Array.isArray(value)&&/Assign hits|Submarine attack\. Apply hits|Reduce one step|Remove overstacked units/i.test(prompt)){
        const byId=new Map((view?.ai?.units||[]).map(u=>[u.id,u])),cf=u=>u?(u.reduced?(u.rcf||Math.ceil(u.cf/2)):u.cf||0):0
        if(/Remove overstacked/i.test(prompt))return value.slice().sort((a,b)=>cf(byId.get(a))-cf(byId.get(b))||(byId.get(a)?.lf||0)-(byId.get(b)?.lf||0)||a-b)[0]
        // 第6/12页执行注释：两步损失按 CV→BB→CA→DD；同类选防御力最高者。
        // Page 6/12 execution note: two-step losses go CV→BB→CA→DD; within the same type pick the highest-defense one.
        const navalRank=u=>{const t=String(u?.type||u?.name||"").toUpperCase();return /CV/.test(t)?0:/BB/.test(t)?1:/CA/.test(t)?2:/DD/.test(t)?3:4}
        return value.slice().sort((a,b)=>navalRank(byId.get(a))-navalRank(byId.get(b))||(byId.get(b)?.lf||0)-(byId.get(a)?.lf||0)||a-b)[0]
    }
    if(action==="unit"&&Array.isArray(value)&&/Choose HQ/i.test(prompt)){
        const picked=selectOperationalHq(view,value,role)
        return picked!==undefined?picked:pick_argument(value,seedText,action,view)
    }
    if ((action === "action_hex" || action === "hex" || action === "card") && view?.ai?.windowKind === "reaction") {
        const picked=planReaction(view,value,action,role,strategy)
        return picked!==undefined?picked:pick_argument(value,seedText,action,view)
    }
    if (action === "action_hex") {
        const picked = eop_pick_action_hex(value, role)
        return picked !== undefined ? picked : pick_argument(value, seedText, action, view)
    }
    if (action === "unit" && /activate units/i.test(prompt)) {
        // 超限(hq_bonus 随激活动态变化, 可能先“5 of 6”再激活第 6 个后变“6 of 5 Too many”):
        // Over limit (hq_bonus changes dynamically with activation, possibly "5 of 6" first then "6 of 5 Too many" after activating the 6th):
        // 此时没有 done 按钮, 必须撤销已激活单位回到上限。从 view.unselect(已激活)里逐个撤销
        // there is no done button here, so must deselect activated units back to the limit. Deselect one by one from view.unselect (activated)
        // (取最大 id, 确定性), 直到 ≤ 上限后 progress 逻辑自然 done。
        // (take the largest id, deterministic), until ≤ limit, then the progress logic naturally done.
        if (/Too many units selected/i.test(prompt)) {
            const unsel = Array.isArray(view?.unselect) ? view.unselect : []
            if (unsel.length) return unsel[unsel.length - 1]
            return pick_argument(value, seedText, action, view)
        }
        // 正常激活: unit 候选同时含“待激活单位”(action_unit)与“已激活单位”(unselect_unit
        // Normal activation: unit candidates contain both "units to activate" (action_unit) and "already-activated units" (unselect_unit
        // 塞进来并记入 view.unselect)。误选已激活单位会被 toggle 撤销 → 死循环, 故先剔除已激活。
        // injected and recorded in view.unselect). Mis-selecting an activated unit gets toggle-deselected → infinite loop, so filter activated out first.
        let pickValue = value
        if (Array.isArray(view?.unselect) && view.unselect.length) {
            const unsel = new Set(view.unselect)
            const avail = value.filter(u => !unsel.has(u))
            if (avail.length) pickValue = avail
        }
        // 已激活单位(含本窗已选)传给 eop_pick_unit, 用于两栖登陆护航判定: 敌占港需 ≥1 海军护航。
        // Activated units (including those already selected in this window) are passed to eop_pick_unit for amphibious-landing escort judgment: an enemy-held port needs ≥1 naval escort.
        const activeUnits = Array.isArray(view?.offensive?.active_units) ? view.offensive.active_units.flat() : []
        // 与 evaluateChart 用同一原始候选集(仅剔已选)计算 activationFocus，保证两处
        // Compute activationFocus with the same raw candidate set (only already-selected removed) as evaluateChart, keeping the two
        // hasFeasibleTarget 一致，避免一处判「前推」另一处判「有目标」造成 toggle 死循环。
        // hasFeasibleTarget checks consistent, avoiding one judging "advance" and the other "has target" causing a toggle infinite loop.
        const activationFocus = typeof eop_activation_focus_faction === "function"
            ? eop_activation_focus_faction(role === "Japan" ? JP : AP, activeUnits.length, view, pickValue.slice()) : eop_focus(role)
        // 无立即可参战目标时退回「前推」模式（文档 §5）：战略移动/转场/推进，而非空攻势。
        // When there is no immediately engageable target, fall back to "advance" mode (doc §5): strategic move/transfer/advance, not an empty offensive.
        // 目标语义过滤(requiredUnits/escortPairs 等)只约束「特定目标编队」，不约束前推。
        // The target semantic filter (requiredUnits/escortPairs, etc.) only constrains "specific target formations", not advance.
        const hasFeasibleTarget = activationFocus !== null && activationFocus !== undefined
        const effectiveFocus = hasFeasibleTarget ? activationFocus : eop_focus(role)
        const activationMeta = eop_target_meta(role, effectiveFocus)
        if(view?.ai?.windowKind==="reaction"){
            const picked=planReaction(view,pickValue,action,role,strategy)
            return picked!==undefined?picked:pick_argument(pickValue,seedText,action,view)
        }
        // 完整战役恢复航空兵（航空打击/地面支援所必需）。South Pacific
        // Full campaign restores air units (required for air strike/ground support). South Pacific
        // 仍是兼容启发式配置，其交互移动窗没有无头路径参数，继续排除空军。
        // remains a compatible heuristic config whose interactive move window has no headless path params, so air continues to be excluded.
        if (!esm_gate_on()) pickValue = pickValue.filter(u => { try { return pieces[u] && pieces[u].class !== "air" } catch (e) { return true } })
        if (role === "Allies" && typeof eop_preserve_ready_b29 === "function")
            pickValue = pickValue.filter(u => !eop_preserve_ready_b29(u, role))
        // 指挥部只在专用 Choose HQ 窗参与决策；进攻激活 HQ 不会产生移动或战斗力。
        // HQ participates in decisions only in the dedicated Choose HQ window; activating an HQ for offense produces no movement or combat strength.
        pickValue = pickValue.filter(u => { try { return !pieces[u] || pieces[u].class !== "hq" } catch (e) { return true } })
        if (hasFeasibleTarget && typeof eop_unit_matches_target === "function")
            pickValue = pickValue.filter(u => eop_unit_matches_target(u, role, activationMeta, effectiveFocus))
        if (role === "Allies" && typeof eop_preserve_rear_air === "function") {
            const reachable = pickValue.filter(u => !eop_preserve_rear_air(u, role, effectiveFocus))
            if (reachable.length) pickValue = reachable
        }
        const planned = composeTaskForce(effectiveFocus, null, null, view, pickValue, role)
        if (planned?.strict && planned.unit == null) {
            // 无单位能立即参战：退回前推调度后方单位（战略移动/转场/推进）。
            // No unit can engage immediately: fall back to advancing/scheduling rear units (strategic move/transfer/advance).
            const fwd = eop_pick_forward_unit(pickValue, role, effectiveFocus)
            if (fwd !== undefined) return fwd
            return undefined
        }
        const picked = planned && planned.unit !== undefined && planned.unit !== null
            ? planned.unit : eop_pick_unit(pickValue, role, activeUnits, effectiveFocus)
        return picked !== undefined ? picked : pick_argument(pickValue, seedText, action, view)
    }
    if (action === "unit" && (view?.ai?.windowKind === "pbm" || /Declare battle hexes|Confirm declared battle hexes|Assign units to battle/i.test(prompt))) {
        const picked = view?.ai?.windowKind === "pbm" ? planPostBattleMovement(view,value,action,role)
            : view?.ai?.windowKind === "reaction" ? planReaction(view,value,action,role,strategy) : eop_pick_unit(value, role)
        return picked !== undefined ? picked : pick_argument(value, seedText, action, view)
    }
    return pick_argument(value, seedText, action, view)
}

function evaluateChart(chart, view, context) {
    const legal = legal_actions(view)
    if (/press delay/i.test(String(view.prompt||"")) && legal.includes("delay")) {
        const n=chart.nodes.find(x=>x.type==="start")?.id||chart.id
        const base={policy:ERASMUS_VERSION,chart:chart.id,node:n,nodePath:[n],role:context.role,conditions:[],strategy:"DELAY_UNPLACEABLE_REINFORCEMENT",action:"delay",argument:undefined,dice:null,fallback:false,inferred:false,explanation:"增援没有合法落位；按引擎明确提供的 delay 出口处理下一单位。"}
        return {action:"delay",argument:undefined,publicTrace:base,privateTrace:{...base,legalActions:legal}}
    }
    // 日本"海军飞机航程优势"(jp_cv_reassign) 是可选的战后效应: 损伤己方航母换射程,
    // Japan's "naval air range advantage" (jp_cv_reassign) is an optional post-battle effect: damage your own carriers for range,
    // 再经"修复"往返回补。无头 bot 不参与这套往返 —— 引擎在阶段1"Chosen: N 且 to_repair
    // then compensate via "repair". The headless bot does not take part in this round-trip — the engine gets stuck with only undo
    // 已空"时会只剩 undo(合法动作集为空)卡死。故在阶段0(hits=0, 有 skip)直接 skip 放弃
    // (empty legal-action set) when stage 1 reaches "Chosen: N and to_repair empty". So at stage 0 (hits=0, has skip) skip directly to give up
    // 该可选效应, 换取稳定推进; 阶段1不应再出现(因阶段0已 skip)。
    // this optional effect for stable progress; stage 1 should not appear again (because stage 0 already skipped).
    if (/range advantage/i.test(String(view.prompt || "")) && view.actions && view.actions.skip !== undefined) {
        const traceNode = chart.nodes.find(n=>n.type==="start")?.id || chart.id
        const base = { policy: ERASMUS_VERSION, chart: chart.chart_id || chart.id,
            node: traceNode, nodePath:[traceNode], role: context.role,
            conditions: [], strategy: "SKIP_RANGE_ADVANTAGE", action: "skip", argument: undefined,
            dice: null, fallback: false, inferred: false,
            explanation: "日本航程优势为可选效应, 无头跳过以避免损伤/修复往返卡死。" }
        return { action: "skip", argument: undefined, publicTrace: base, privateTrace: { ...base, legalActions: legal } }
    }
    if (!legal.length) {
        // 窗口只有 awaiting(如无头地面推进触发的 disengagement 确认窗, 引擎仅给
        // The window only has awaiting (e.g. the disengagement confirm window triggered by headless ground advance; the engine gives only
        // 这一个按钮): 无其它动作可选, 必须确认继续; 其余 undo/redo/awaiting 被过滤。
        // this one button): no other action selectable, must confirm continue; the other undo/redo/awaiting are filtered out.
        if (view.actions && view.actions.awaiting !== undefined) {
            const chartId = (chart && (chart.chart_id || chart.id)) || "NO-CHART"
            const nodeId = chart.nodes.find(n=>n.type==="start")?.id || chartId
            const base = { policy: ERASMUS_VERSION, chart: chartId, node: nodeId, nodePath:[nodeId], role: context.role,
                conditions: [], strategy: "HEADLESS_AWAIT", action: "awaiting", argument: undefined,
                dice: null, fallback: false, inferred: false,
                explanation: "窗口只提供 awaiting(确认继续), 无其它合法动作。" }
            return { action: "awaiting", argument: undefined, publicTrace: base, privateTrace: { ...base, legalActions: legal, candidates: {} } }
        }
        throw new Error("ERASMUS has no legal action")
    }
    // 第6/12页策略进入引擎后产生的多步反应窗口。它们必须继承真实图表节点，而不能因
    // Multi-step reaction windows produced after the page 6/12 strategy enters the engine. They must inherit the real chart node, not
    // 入口条件已在前一步消耗而重新求值到 terminal/fallback。
    // re-evaluate to terminal/fallback because the entry condition was already consumed in the previous step.
    const reactionPrompt=String(view.prompt||"")
    let reactionStep=null
    if(/Play reaction cards|Apply reaction cards/i.test(reactionPrompt))reactionStep={suffix:"S-INTEL-CARD",strategy:`${context.role==="Japan"?"JP":"AP"}_REACTION_CARD_PRIORITY`,preferred:["card","done"]}
    else if(/Roll for submarine warfare/i.test(reactionPrompt))reactionStep={suffix:"S-SUB",strategy:`${context.role==="Japan"?"JP":"AP"}_SUBMARINE_ATTACK`,preferred:["roll","done"]}
    else if(/Submarine attack\. Apply hits/i.test(reactionPrompt))reactionStep={suffix:"S-SUB",strategy:`${context.role==="Japan"?"JP":"AP"}_SUBMARINE_ATTACK`,preferred:["unit","done"]}
    else if(/Choose (unit|space) to retreat|Confirm retreat/i.test(reactionPrompt))reactionStep={suffix:"S-REACTION",strategy:`${context.role==="Japan"?"JP":"AP"}_REACTION_RETREAT`,preferred:["unit","action_hex","eliminate","done"]}
    else if(/roll for special reaction/i.test(reactionPrompt))reactionStep={suffix:"S-SR",strategy:`${context.role==="Japan"?"JP":"AP"}_ROLL_EACH_SR`,preferred:["action_hex","roll","pass","done"]}
    if(reactionStep){
        const side=context.role==="Japan"?"JP06":"AP12",node=`${side}-${reactionStep.suffix}`
        const action=reactionStep.preferred.find(a=>legal.includes(a))
        if(action){
            const seedText=`${context.seed}:${context.actionOrdinal}:${chart.id}:${node}:reaction-step`
            const argument=target_argument(action,view.actions[action],seedText,context.role,view,reactionStep.strategy)
            const base={policy:ERASMUS_VERSION,chart:chart.id,node,nodePath:[node],role:context.role,conditions:[],strategy:reactionStep.strategy,
                action,argument,dice:null,fallback:false,inferred:false,engineStage:view?.ai?.stage,windowKind:view?.ai?.windowKind,
                explanation:"执行第6/12页已选反应策略的后续规则窗口。"}
            return {action,argument,publicTrace:base,privateTrace:{...base,legalActions:legal}}
        }
    }
    // 这些是规则引擎在图表策略已经执行完之后产生的强制整理/确认窗，不是图表无解。
    // These are mandatory cleanup/confirmation windows produced by the rules engine after the chart strategy has already executed, not an unsolvable chart.
    // 旧代码让 terminal 节点落入 FALLBACK，导致完整局出现数百次“隐式 fallback”。
    // Old code let the terminal node fall into FALLBACK, causing hundreds of "implicit fallback" occurrences in a full game.
    // 只对明确枚举的行政窗口生效；会战损失、选牌、目标、反应等有判断意义的窗口不在此列。
    // Applies only to explicitly enumerated administrative windows; battle losses, card selection, targets, reactions and other meaningful windows are excluded.
    const adminPrompt=String(view.prompt||"")
    if(/Confirm post battle move|Remove overstacked units|Review overstacked units|move disengaging unit|Change intelligence condition|Yamato run/i.test(adminPrompt)){
        const adminAction=["next","done","unit","skip","continue"].find(a=>legal.includes(a))
        if(adminAction){
            const n=chart.nodes.find(x=>x.type==="terminal")?.id||chart.nodes.find(x=>x.type==="start")?.id||chart.id
            const seedText=`${context.seed}:${context.actionOrdinal}:${chart.id}:${n}:admin`
            const argument=target_argument(adminAction,view.actions[adminAction],seedText,context.role,view,"ENGINE_ADMIN_TRANSITION")
            const base={policy:ERASMUS_VERSION,chart:chart.id,node:n,nodePath:[n],role:context.role,conditions:[],strategy:"ENGINE_ADMIN_TRANSITION",
                action:adminAction,argument,dice:null,fallback:false,inferred:false,engineStage:view?.ai?.stage,windowKind:view?.ai?.windowKind,
                explanation:"图表策略执行后的规则引擎强制整理/确认步骤。"}
            return {action:adminAction,argument,publicTrace:base,privateTrace:{...base,legalActions:legal}}
        }
    }
    const nodes = new Map(chart.nodes.map(item => [item.id, item]))
    const prefix = chart.chart_id || chart.id
    let current = chart.nodes.find(item => item.type === "start")
    // 第5/11页跨越多个引擎窗口。后续窗口应从对应的真实图表步骤恢复，而不是每次都
    // Page 5/11 spans multiple engine windows. Subsequent windows should resume from the corresponding real chart step, rather than
    // 重走 A-H 后停在“选择目标”。
    // re-walking A-H each time and stopping at "select target".
    if(chart.kind==="task-force"){
        const state=String(view?.ai?.state||"")
        const prefix=context.role==="Japan"?"JP05":"AP11"
        const resume=/activate_units/.test(state)?`${prefix}-ACTIVATE`
            :/move_offensive_units/.test(state)?`${prefix}-I`
            :/declare_battle|choose_attack|confirm_bh/.test(state)?`${prefix}-S-MOVE`:null
        if(resume&&nodes.has(resume))current=nodes.get(resume)
    }
    const conditions = []
    const nodePath = []
    const diceRolls = []
    let guard = 0
    while (current && !["action", "priority", "fallback", "terminal"].includes(current.type)) {
        if (++guard > chart.nodes.length + 2) throw new Error(`chart cycle: ${chart.id}`)
        nodePath.push(current.id)
        if (current.type === "condition") {
            const result = predicate_value(view, current.predicate?.id, context, current.id)
            const evidence=current.predicate?.id==="WEATHER_STANDARD_MET"?(()=>{
                const enemy=(context.role==="Japan"?AP:JP)
                const activatedCount=Array.isArray(G?.offensive?.active_units)?(G.offensive.active_units[enemy]||[]).length:0
                const raw=erasmus_hash(`${context.seed}:${context.actionOrdinal}:${current.id}:WEATHER-D10`)%10
                return {raw, surpriseModifier:G?.offensive?.intelligence===SURPRISE?-2:0, activatedCount, threshold:activatedCount*2}
            })():undefined
            conditions.push({ nodeId: current.id, predicate: current.predicate?.id, result, ...(evidence?{evidence}:{}) })
            const edge = current.edges.find(item => item.when === result) || current.edges.find(item => item.when === "always")
            current = nodes.get(edge?.to)
        } else if (current.type === "dice") {
            const roll = erasmus_hash(`${context.seed}:${context.actionOrdinal}:${chart.id}:${current.id}:${current.table_id || "D10"}`) % Number(current.sides || 10)
            const range = (current.ranges || []).find(r => roll >= r.min && roll <= r.max)
            if (!range) throw new Error(`ERASMUS_DICE_GAP:${current.id}:${roll}`)
            diceRolls.push({ nodeId: current.id, tableId: current.table_id, sides: current.sides || 10, result: roll, range: `${range.min}-${range.max}` })
            const edge = (current.edges || []).find(e => e.when === range.result || e.when === roll || e.when === String(roll))
            current = nodes.get(edge?.to || range.to)
        } else current = nodes.get(current.edges?.find(item => item.when === "always")?.to)
    }
    if (current) nodePath.push(current.id)
    // 策略解析: 单出口 action 节点直接取该策略; priority(SELECT)节点按图中
    // Strategy resolution: a single-exit action node takes its strategy directly; a priority(SELECT) node iterates candidates by the chart's
    // candidate_found/no_candidate 语义迭代候选,而不是只取 strategies[0]。
    // candidate_found/no_candidate semantics, rather than only taking strategies[0].
    let strategy = null
    let action = null
    let attempted = []
    let fallback = false
    let activationPlan = null
    if (current?.type === "priority") {
        const chosen = first_executable_strategy(current.strategies, legal, view)
        attempted = chosen.attempts
        strategy = chosen.strategy
        action = chosen.action
        if (!strategy) fallback = true // no_candidate
    } else {
        strategy = current?.strategy || null
        action = strategy ? action_for_strategy(strategy, legal) : null
        if (!action) fallback = true
    }
    const progress = String(view.prompt || "").match(/(\d+)\s+of\s+(\d+)/i)
    if (progress && Number(progress[1]) >= Number(progress[2]) && legal.includes("done")) action = "done"
    const volatileBonus = String(view.prompt || "").match(/(\d+)\s+of\s+\d+\s*\((\d+)\s*\+\s*\d+\)/i)
    if (volatileBonus && Number(volatileBonus[1]) >= Number(volatileBonus[2]) && legal.includes("done")) action = "done"
    // “Activate units”窗口: 当 unit 候选里已无可新增单位(全部是已激活的 unselect 单位, 或
    // "Activate units" window: when no more addable units remain among the unit candidates (all are activated unselect units, or
    // 只剩空中单位)时, 继续选 unit 只会 toggle 撤销或触发无头移动死窗; 此时必须 done 收尾。
    // only air units remain), continuing to select unit only toggles-deselects or triggers a headless-move dead window; must done to finish.
    if (/activate units/i.test(String(view.prompt || "")) && legal.includes("done") && legal.includes("unit")) {
        const unsel = new Set(Array.isArray(view?.unselect) ? view.unselect : [])
        const selectedCount = view.offensive?.active_units?.flat?.().length || 0
        const activationFocus = typeof eop_activation_focus_faction === "function"
            ? eop_activation_focus_faction(context.role === "Japan" ? JP : AP, selectedCount, view,
                Array.isArray(view.actions.unit) ? view.actions.unit.filter(u=>!unsel.has(u)) : []) : view?.ai?.focus
        // 无立即可参战目标时退回「前推」模式，与 target_argument 保持同一有效焦点（文档 §5）。
        // When no immediately engageable target, fall back to "advance" mode, keeping the same effective focus as target_argument (doc §5).
        const hasFeasibleTarget = activationFocus !== null && activationFocus !== undefined
        const effectiveFocus = hasFeasibleTarget ? activationFocus : eop_focus(context.role)
        const activationMeta = eop_target_meta(context.role, effectiveFocus)
        // 先算出与 target_argument 完全一致的“可新增单位”集(剔 unselect/HQ/B29/后方空优/
        // First compute the "addable units" set exactly consistent with target_argument (filter out unselect/HQ/B29/rear air-superiority/
        // 匹配目标), 再交给 composeTaskForce 与 done 判定, 避免 forcePlan 看到 HQ/B29 而
        // matching target), then hand it to composeTaskForce and the done judgment, avoiding forcePlan seeing HQ/B29 that
        // target_argument 已剔除它 → 返回 undefined 撤销已选单位, 形成 toggle 死循环。
        // target_argument already filtered out → returning undefined and deselecting already-selected units, forming a toggle infinite loop.
        // 目标语义过滤(requiredUnits/escortPairs)只约束「特定目标编队」，前推模式不套用。
        // The target semantic filter (requiredUnits/escortPairs) only constrains "specific target formations"; advance mode does not apply it.
        const addable = (Array.isArray(view.actions.unit) ? view.actions.unit : [])
            .filter(u => !unsel.has(u))
            .filter(u => { try { return !pieces[u] || pieces[u].class !== "hq" } catch (e) { return true } })
            .filter(u => { try { return esm_gate_on() || !pieces[u] || pieces[u].class !== "air" } catch (e) { return true } })
            .filter(u => { try { return typeof eop_preserve_ready_b29 !== "function" || !eop_preserve_ready_b29(u, context.role) } catch (e) { return true } })
            // 后方航空的「折返跑」保护只在会战编队(composeTaskForce 内部)生效，不在此处
            // Rear-air "shuttle" protection only applies in battle formations (inside composeTaskForce), not batch-filtered
            // 从 addable 里整批剔除：否则 eop_pick_forward_unit 看不到这些后方航空，无法
            // out of addable here: otherwise eop_pick_forward_unit can't see these rear air units and can't
            // 在无立即可参战目标时把它们故意前推(转场/SR 到前线机场)，重新退化回「不调航空」。
            // deliberately advance them (transfer/SR to forward airfields) when no immediately engageable target, regressing back to "no air moved".
            .filter(u => !hasFeasibleTarget || typeof eop_unit_matches_target !== "function" || eop_unit_matches_target(u, context.role, activationMeta, effectiveFocus))
        const forcePlan = composeTaskForce(effectiveFocus, null, null, view, addable, context.role)
        const selected = progress ? Number(progress[1]) : (view.offensive?.active_units?.flat?.().length || 0)
        // HQ 加成可因新激活单位的军种/区域而下降。提示“2 of 3 (2 + 1)”中的括号前值
        // The HQ bonus can drop due to the service/region of newly activated units. The pre-parenthesis value in "2 of 3 (2 + 1)"
        // 才是不会随下一次选择反噬的稳定上限；达到它就结束，避免 2/3→3/2→撤销 的循环。
        // is the stable limit that won't bite back on the next selection; finish once reached, avoiding the 2/3→3/2→deselect cycle.
        const limit = volatileBonus ? Number(volatileBonus[2]) : progress ? Number(progress[2]) : selected + addable.length
        activationPlan = Object.assign({}, forcePlan || {}, { selected, limit, remaining: Math.max(0, limit - selected),
            mode: forcePlan?.complete ? "后续目标/前线调动" : "补足当前目标编队" })
        // 用户确认的运用原则：EC 当前目标达到最低标准后，不立即浪费剩余激活量；继续按
        // User-confirmed operating principle: after the EC's current target meets the minimum standard, don't immediately waste remaining activation;
        // 战略链选择后续目标兵力，再把仍可激活的后方部队向前线调动。只有达到上限或
        // keep selecting forces for subsequent targets along the strategy chain, then move still-activatable rear units to the front. End only when the
        // 没有新增合法候选时才结束。本规则不改变引擎给出的合法单位集合。
        // limit is reached or no new legal candidates remain. This rule does not change the engine's legal unit set.
        if (selected < limit && addable.length > 0) action = "unit"
        else action = "done"
        if (forcePlan?.strict && forcePlan.unit == null) {
            // 无单位能立即参战时，若仍有可前推的后方单位（战略移动/转场/推进到有效焦点），
            // When no unit can engage immediately, if there are still advanceable rear units (strategic move/transfer/advance to the effective focus),
            // 不空攻势直接 done；只有确实无可调度单位才 done（文档 §5）。
            // don't do an empty offensive directly done; only done when there truly are no dispatchable units (doc §5).
            const fwd = typeof eop_pick_forward_unit === "function" ? eop_pick_forward_unit(addable, context.role, effectiveFocus) : undefined
            if (fwd === undefined) action = "done"
        }
        // 两栖登陆无护航可用: 在本窗尚未激活任何单位时提前 done(空攻势), 避免把两栖地面
        // Amphibious landing with no escort available: done early (empty offensive) when no units have been activated in this window, to avoid
        // 送去敌占/敌控港口硬登陆吃 "Amphibious Assault failed"。已有已激活单位时不再阻断
        // sending amphibious ground to an enemy-held/enemy-controlled port for a hard landing eating "Amphibious Assault failed". No longer block once
        // (那些单位已注定走无头推进, 由 eop_pick_unit 的护航逻辑尽量补海军)。
        // there are activated units (those units are already destined for headless advance, and eop_pick_unit's escort logic supplements navy as much as possible).
        if (typeof eop_landing_no_escort === "function"
            && !(view.offensive?.active_units?.flat?.().length > 0)
            && eop_landing_no_escort(context.role, view)) action = "done"
        // #3：占领目标但地面兵力不足且无可补充地面时，在尚未激活任何单位前提前 done 空攻势，
        // #3: when the target is to capture but ground strength is insufficient and no ground can be supplemented, done early as an empty offensive
        // 避免白耗激活点去硬攻登不下来的敌占格。
        // before activating any unit, avoiding wasting activation points on a hard attack against an enemy-held hex that can't be taken.
        if (forcePlan?.insufficient
            && !(view.offensive?.active_units?.flat?.().length > 0)) action = "done"
    }
    // “Declare battle hexes.”窗口的 unit 是选择可打击的已激活空中单位(随后用
    // In the "Declare battle hexes." window, unit selects strikeable activated air units (then
    // action_hex 指向目标格并 create_battle_hex), 并非追加激活单位, 因此该窗口
    // action_hex points to the target hex and create_battle_hex); it is not additional unit activation, so this window
    // 不能强制按 done 跳过——否则攻势永远零会战(有射程内敌格也不会申报)。
    // cannot be forced to skip via done — otherwise the offensive would always have zero battles (no declaration even with in-range enemy hexes).
    // 激活/移动窗口仍由上一行逻辑收尾(done), 行为不变。
    // The activate/move window is still finished (done) by the preceding logic, behavior unchanged.
    // “Activate units: X of Y”窗口的 unit 是逐个激活进攻单位(done 才收尾), 若在已激活
    // In the "Activate units: X of Y" window, unit activates offensive units one by one (done finishes); if forced to done after activating
    // 1 个单位后就强制 done, 则每个攻势只激活 1 个单位 → 会战几乎为零 → 无法夺格/PoW。
    // just 1 unit, each offensive would only activate 1 unit → near-zero battles → cannot capture hexes/PoW.
    // 该窗口必须豁免“强制 done”, 让 bot 反复 unit 直到 hit 上限, 由上一行 progress 逻辑收尾。
    // This window must be exempt from "forced done", letting the bot repeatedly unit until hitting the limit, finished by the preceding progress logic.
    const isDeclareHexesWindow = /declare battle hexes|confirm declared battle hexes/i.test(String(view.prompt || ""))
    const isActivateWindow = /activate units/i.test(String(view.prompt || ""))
    if (!isDeclareHexesWindow && !isActivateWindow && legal.includes("done") && legal.includes("unit") && view.offensive?.active_units?.flat?.().length > 0) action = "done"
    if (fallback) {
        const fallbackNode = chart.nodes.find(item => item.type === "fallback")
        // 保护出口绝不能选中“切换 move_type/无路径 move”这类无头残按钮(会崩溃/死窗)。
        // The protection exit must never select "toggle move_type/no-path move" headless residual buttons (they crash/dead-window).
        const safeLegal = legal.filter(a => !HEADLESS_MOVE_NOOP.has(a))
        action = (fallbackNode?.allowed_actions || []).find(item => legal.includes(item) && !HEADLESS_MOVE_NOOP.has(item))
            || safeLegal.slice().sort()[0]
    }
    // 无头自对打: advance 只在 headless_moves 攻击方 ATTACK_STAGE 空栈移动窗出现(引擎端
    // Headless self-play: advance appears only in the headless_moves attacker ATTACK_STAGE empty-stack move window (the engine-side
    // 唯一来源), 表示该窗应把一组地面/海军沿合法格推进向敌而不是直接 done。它必须覆盖
    // sole source), meaning this window should advance a group of ground/naval along legal hexes toward the enemy rather than done directly. It must override
    // 上面 “强制 done” 与 fallback, 否则移动窗被整窗吞掉, 地面/海军永远无法接敌。
    // the "forced done" and fallback above, otherwise the move window is swallowed whole and ground/naval can never reach the enemy.
    if (legal.includes("advance")) {
        action = "advance"
        fallback = false
        strategy = "HEADLESS_ADVANCE"
    }
    // “Move units”窗口 + 已选中空中单位(纯空/无地面海军的攻势, 无 advance)：
    // "Move units" window + selected air units (pure-air/no-ground-or-naval offensive, no advance):
    // 完整战役必须 no_move 留在基地。随后 declare_battle_hexes 会按 br/ebr 把它承诺到
    // the full campaign must no_move to stay at base. Then declare_battle_hexes commits it by br/ebr to a
    // 战斗格外的会战；旧代码直接 turn_box，等于激活后立刻撤走，造成航空支援恒为 0。
    // battle beyond the combat hex; old code went straight to turn_box, i.e. withdraw immediately after activation, making air support always 0.
    // 子图兼容模式若没有 no_move 才保留 turn_box 安全出口。
    // The sub-graph compat mode keeps the turn_box safe exit only when there is no no_move.
    if (/move units/i.test(String(view.prompt || "")) && legal.includes("turn_box") && !legal.includes("advance")) {
        action = esm_gate_on() && legal.includes("no_move") ? "no_move" : "turn_box"
    }
    // 通用防 toggle 死循环: 引擎里 unselect_unit 会把“已选/将被撤销”的单位也塞进 unit 候选
    // General anti-toggle-infinite-loop: the engine's unselect_unit also stuffs "already-selected/will-be-deselected" units into the unit candidates
    // (记入 view.unselect)。若此刻 unit 的每个候选都是 unselect, 选 unit 只会撤销当前选择 →
    // (recorded in view.unselect). If every unit candidate right now is an unselect, selecting unit only deselects the current selection →
    // 在“Move units (0/1)↔(1/1)”这类窗口原地打转。此时跳过 unit, 改取下一个可执行动作
    // spinning in place in "Move units (0/1)↔(1/1)" windows. So skip unit and take the next executable action
    // (move/no_move/done 等), 让移动/收尾真正发生。
    // (move/no_move/done, etc.), letting the move/finish actually happen.
    if (action === "unit" && Array.isArray(view.actions.unit) && view.actions.unit.length > 0) {
        const unsel = new Set(Array.isArray(view?.unselect) ? view.unselect : [])
        const addable = view.actions.unit.filter(u => !unsel.has(u))
        if (addable.length === 0) {
            if (move_window_should_deselect(view, legal)) {
                // 移动窗 + 已选中单位(如撤退/会战把单位重选回来 spec_move=1): 选 unit 是
                // Move window + already-selected units (e.g. retreat/battle reselects units back, spec_move=1): selecting unit is
                // 撤销选择回空栈, 让 advance/done/turn_box 重新接管并推进, 不是 toggle 死循环。
                // deselect to empty the stack, letting advance/done/turn_box take over again and progress, not a toggle infinite loop.
                action = "unit"
            } else {
                // 激活/申报窗: unit 候选只剩已激活单位, 选它=撤销激活回退, 才是死循环; 跳过。
                // Activation/declaration window: unit candidates are only activated units; selecting one = deselect/rollback, which is the infinite loop; skip.
                action = ACTION_PRIORITY.find(a => a !== "unit" && legal.includes(a) && !HEADLESS_MOVE_NOOP.has(a))
                    || legal.find(a => a !== "unit" && !HEADLESS_MOVE_NOOP.has(a))
                    || "unit"
            }
        }
    }
    // "Move units"窗口 + 已有选中组(unselect 非空) + 无 advance(无头推进不可用) + 有
    // "Move units" window + already-selected group (unselect non-empty) + no advance (headless advance unavailable) + has
    // no_move/advanced_move 可收尾: 继续选 unit 会在 (1/N)↔(2/N) 间 toggle 死循环。
    // no_move/advanced_move to finish: continuing to select unit toggles in a (1/N)↔(2/N) infinite loop.
    // 就地待命(no_move)收尾该组, 让窗口前进。(spec_move 撤退窗无 no_move, 仍走 unit 撤销。)
    // Hold in place (no_move) finishes the group, letting the window advance. (spec_move retreat window has no no_move, still goes through unit deselect.)
    if (/move units/i.test(String(view.prompt || "")) && !legal.includes("advance")
        && Array.isArray(view?.unselect) && view.unselect.length > 0 && action === "unit"
        && (legal.includes("no_move") || legal.includes("advanced_move"))) {
        action = legal.includes("no_move") ? "no_move" : "advanced_move"
    }
    // 最终安全网: 无头下绝不把“切 move_type/无路径 move”当最终动作 —— 它们只会崩溃或重落到
    // Final safety net: headless never takes "toggle move_type/no-path move" as the final action — they only crash or fall back into a
    // 死窗。真到这一步(上面各分支已规避, 属兜底), 退回可控收尾/撤销动作, 让窗口推进而非卡死。
    // dead window. If it truly reaches this point (already avoided above, this is a fallback), fall back to a controllable finish/deselect action, letting the window advance rather than hang.
    if (HEADLESS_MOVE_NOOP.has(action)) {
        action = ["advance", "done", "turn_box", "unit", "no_move", "stop", "cancel", "skip", "pass", "continue", "next"]
            .find(a => legal.includes(a))
            || legal.filter(a => !HEADLESS_MOVE_NOOP.has(a)).slice().sort()[0]
    }
    const fallbackId = chart.nodes.find(item => item.type === "fallback")?.id || `${prefix}-FALLBACK`
    const nodeId = fallback ? fallbackId : (current?.id || fallbackId)
    const seedText = `${context.seed}:${context.actionOrdinal}:${chart.id}:${nodeId}`
    const dice = diceRolls.length ? diceRolls : null
    let argument = target_argument(action, view.actions[action], `${seedText}:${action}`, context.role, view, strategy)
    // 无头对打健壮性: action=unit 却无可选单位(argument 未定)时, 不要返回 unit+undefined 让引擎
    // Headless robustness: when action=unit but no unit could be picked (argument undefined), do not return unit+undefined and crash the engine;
    // 去 set_add(undefined) 并崩溃。回退到可安全收尾的无参动作(done/skip/pass), 让窗口推进而非卡死。
    // fall back to a safe parameterless finish (done/skip/pass) to advance the window instead of deadlocking.
    if (action === "unit" && argument === undefined) {
        const safe = ["done", "skip", "pass", "continue", "next"].find(a => legal.includes(a))
        if (safe) {
            action = safe
            argument = undefined
            fallback = true
        }
    }
    const selectedUnit = action === "unit" && view.ai && Array.isArray(view.ai.units) ? view.ai.units.find(u=>u.id===argument) : null
    const forceSummary = selectedUnit ? { unit:selectedUnit.id, class:selectedUnit.class, type:selectedUnit.type,
        combat:selectedUnit.reduced ? (selectedUnit.rcf || Math.ceil(selectedUnit.cf/2)) : selectedUnit.cf, defense:selectedUnit.lf,
        formation: selectedUnit.class === "air" ? "air-support-or-strike" : selectedUnit.class === "naval" ? "naval-support" : "ground-or-amphibious" } : null
    const focusInfo = eop_trace(context.role)
    const publicTrace = {
        policy: ERASMUS_VERSION, chart: chart.id, node: nodeId, nodePath, role: context.role, conditions,
        attempted: attempted.length ? attempted : undefined, forceSummary, activationPlan,
        strategy, action, argument: action === "card" ? "[出牌后公开]" : argument, dice, fallback,
        axis: focusInfo.axis, focus: focusInfo.focus,
        inferred: chart.qa?.inferred_nodes?.includes(nodeId) || false,
        explanation: fallback ? "图表优先策略在本窗口均不可执行(no_candidate)，执行图表声明的保护出口。"
            : activationPlan ? `当前目标编队${activationPlan.complete ? "已达标；继续利用剩余激活量执行后续目标或前推。" : "尚未达标；继续补足兵力。"}`
            : "沿图表条件分支和策略优先级迭代候选(candidate_found)后选择。",
    }
    return { action, argument, publicTrace, privateTrace: { ...publicTrace, argument, legalActions: legal, candidates: view.actions[action] } }
}

// 状态机 trace 分页: 决策轴首卡窗记对应轴图页(JP-01/02/03, AP-07/08/09);
// State-machine trace paging: the decision-axis first-card window records the corresponding axis chart page (JP-01/02/03, AP-07/08/09);
// 其余同回合选牌窗记选牌图页(JP-04/AP-10)。
// other same-turn card-selection windows record the card-selection chart page (JP-04/AP-10).
function erasmus_sm_page(strategy, isPin) {
    const rolePage = strategy.role === "Japan" ? "JP" : "AP"
    const axis = rolePage === "JP" ? { early:1, mid:2, late:3 } : { early:7, mid:8, late:9 }
    return `ERASMUS-${rolePage}-0${axis[strategy.phase] || (rolePage === "JP" ? 1 : 7)}`
}

// 钉住/沿用战略时, 构造 decision trace(字段与 evaluateChart 兼容)。
// When pinning/reusing a strategy, construct a decision trace (fields compatible with evaluateChart).
function erasmus_sm_decision(strategy, pick, view, context) {
    const isPin = Number(strategy.ord) === Number(context.actionOrdinal || 0)
    const cardTree = !!strategy.cardTreeNode
    const page = cardTree ? (strategy.role === "Japan" ? "ERASMUS-JP-04" : "ERASMUS-AP-10") : erasmus_sm_page(strategy, isPin)
    const nodePath = cardTree ? [strategy.role === "Japan" ? "JP04-START" : "AP10-START", strategy.cardTreeNode]
        : Array.isArray(strategy.nodePath) && strategy.nodePath.length ? strategy.nodePath : [`${page}-START`]
    const node = cardTree ? strategy.cardTreeNode : nodePath[nodePath.length - 1]
    const arg = pick.action === "card" ? "[出牌后公开]" : pick.argument
    // 决策 trace 附加 isPin: 本窗是否即“钉选”事件(每方每回合首卡), 沿用窗为 false。
    // Decision trace adds isPin: whether this window is the "pin" event (first card of each side each turn); reuse windows are false.
    const runtime = view && view.ai ? { engineStage: view.ai.stage, windowKind: view.ai.windowKind } : {}
    const sm = Object.assign(esm_trace_of(strategy, false) || {}, runtime, { pinnedNow: isPin })
    const smPrivate = Object.assign(esm_trace_of(strategy, true) || {}, runtime, { pinnedNow: isPin })
    const base = {
        policy: ERASMUS_VERSION, chart: page, node, role: context.role,
        nodePath, conditions: strategy.conditions || [], strategy: strategy.name, sm,
        engineStage: runtime.engineStage, windowKind: runtime.windowKind, action: pick.action, argument: arg,
        dice: strategy.d10Rolls && strategy.d10Rolls.length ? strategy.d10Rolls : null, fallback: false, inferred: false,
        ...(pick.via ? { via: pick.via } : {}),
        explanation: `状态机(zh.13): ${strategy.phase}阶段逐牌评估「${strategy.name}」。${(strategy.notes || []).join(" ")}`,
    }
    return { action: pick.action, argument: pick.argument, publicTrace: base,
        privateTrace: { ...base, sm: smPrivate, argument: pick.argument, legalActions: Object.keys(view.actions || {}) } }
}

var EOTS_BOTS = {
    "erasmus-v2": {
        name: "测试版", version: ERASMUS_VERSION,
        scenarios: ["South Pacific", "1942-1945 (The Shortened Campaign)", "1943-1945 (The Even Shorter Campaign)"], roles: ["Japan", "Allies"],
        decide(view, context) {
            // 完整全图剧本(1942-45 等): 回合级状态机选轴; 其余剧本(=gate 关)保持 zh.6。
            // Full-map scenarios (1942-45 etc.): turn-level state machine selects the axis; other scenarios (=gate off) keep zh.6.
            let sm = null
            try {
                if (esm_gate_on()) {
                    sm = esm_pin_strategy(view, context)
                    // 忠实目标链: chain = parse_goals 有序 idx; goals = 每行 Goal(kind/text)
                    // Faithful target chain: chain = parse_goals ordered idx; goals = each row's Goal(kind/text)
                    if (sm) eop_set_strategy_chain(context.role, { name: sm.name, kind: sm.kind, note: (sm.notes || []).join("; "), goals: sm.goals, chain: sm.chain, targetMeta: sm.targetMeta })
                } else {
                    eop_clear_all_chains()   // 防同进程跨剧本串台
                    // prevent cross-scenario bleed-over within the same process
                }
            } catch (e) {
                if (typeof eop_clear_all_chains === "function") eop_clear_all_chains()
                throw new Error(`ERASMUS_STATE_MACHINE_PAUSED:${e && e.message ? e.message : e}`)
            }
            if (sm) {
                // 选牌窗 / “Select action.” 窗: 按钉住战略的 kind 决定 PASS/OC/事件。
                // Card window / "Select action." window: decide PASS/OC/event by the pinned strategy's kind.
                if (esm_is_card_window(view)) {
                    const pick = esm_card_window_action(sm, view, context)
                    if (pick) return erasmus_sm_decision(sm, pick, view, context)
                } else if (esm_is_card_action_window(view)) {
                    const pick = esm_card_action_window_action(sm, view, context)
                    if (pick) return erasmus_sm_decision(sm, pick, view, context)
                }
                // 其余窗口走原图表微执行(焦点已由外部链覆盖转向钉住战略)。
                // Other windows go through the original chart micro-execution (focus already redirected to the pinned strategy by the external chain).
            }
            const chart = select_chart(context.role, view)
            if (!chart) throw new Error(`No Erasmus chart for ${context.role}`)
            const res = evaluateChart(chart, view, context)
            if (sm && res && res.publicTrace) {
                const t = esm_trace_of(sm, false)
                const tPrivate = esm_trace_of(sm, true)
                if (view && view.ai) {
                    t.engineStage = view.ai.stage
                    t.windowKind = view.ai.windowKind
                    tPrivate.engineStage = view.ai.stage
                    tPrivate.windowKind = view.ai.windowKind
                    res.publicTrace.engineStage = view.ai.stage
                    res.publicTrace.windowKind = view.ai.windowKind
                    if (res.privateTrace) {
                        res.privateTrace.engineStage = view.ai.stage
                        res.privateTrace.windowKind = view.ai.windowKind
                    }
                }
                res.publicTrace.sm = t
                if (res.privateTrace) res.privateTrace.sm = tPrivate
                if (!res.publicTrace.axis) res.publicTrace.axis = t ? t.axis : null
            }
            return res
        },
    },
}
