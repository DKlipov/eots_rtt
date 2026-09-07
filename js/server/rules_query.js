// ============================================================================
// rules_query.js — RTT 规则查询层（只读）
// rules_query.js — RTT rules query layer (read-only)
//
// 原则（整改清单 #1）：Erasmus 负责“选什么”，RTT 规则引擎负责“什么是合法的”。
// Principle (rectification list #1): Erasmus decides "what to pick", the RTT rules engine decides "what is legal".
// 本文件把引擎已有的合法性/移动/反应/战斗逻辑封装成只读查询，供 Erasmus 在
// This file wraps the engine's existing legality/movement/reaction/combat logic into read-only queries, so that Erasmus can
// decide() 期间询问“什么是合法”，从而不再在 AI 层复制第二套移动/反应/补给/战斗规则。
// ask "what is legal" during decide(), thus no longer duplicating a second set of movement/reaction/supply/combat rules in the AI layer.
//
// 两级接口：
// Two-tier interface:
//   Tier 1 纯读叶子 —— 直接包装引擎纯函数，要求调用时 G.supply_cache 已对当前
//   Tier 1 pure-read leaf — directly wraps engine pure functions, requiring G.supply_cache to be valid for the current
//                        单位位置有效（decide() 内通常成立，因为 state 是上一次
//                        unit positions at call time (normally holds inside decide(), since state is the consistent state saved by the previous
//                        action() 保存的一致状态）。
//                        action()).
//   Tier 2 快照事务 —— 引擎合法性生成器（get_ground_move / get_activatable_units /
//   Tier 2 snapshot transaction — engine legality generators (get_ground_move / get_activatable_units /
//                        get_reaction_able_units / update_move_hex ...）会就地改写
//                        get_reaction_able_units / update_move_hex ...) mutate in place
//                        G.supply_cache 的临时位、G.offensive.* 或 L.*，因此必须在一
//                        temporary bits of G.supply_cache, G.offensive.* or L.*, so they must be run inside a
//                        个 save/restore 快照里执行并在 finally 里恢复，绝不污染全局 G。
//                        save/restore snapshot and restored in finally, never polluting global G.
//
// 这些函数都是同一内联作用域里的全局函数，bot 直接调用即可；测试经
// These functions are global functions in the same inline scope, callable directly by the bot; tests drive them via
//   rules.query(state, role, { name:"rules_query", fn:"queryXxx", args:[...] })
// 在框架 _load/_save 周期内驱动。
// within the framework's _load/_save cycle.
// ============================================================================

// 引擎移动/激活/反应生成器会写入这些 L 键，快照事务在 finally 里恢复它们。
// Engine movement/activation/reaction generators write these L keys; the snapshot transaction restores them in finally.
const RULES_QUERY_L_KEYS = [
    "move_data", "move_type", "allowed_hexes", "possible_hexes", "possible_units",
    "reaction_able_units", "asp_ground_units", "cv_reaction_hex_map", "air_reaction_hex_map",
    "overstack", "allowed_units", "ground_units", "hex_to_retreat", "supply",
    "hq_bonus", "kwai", "card", "movable_units", "is_naval_present", "is_ground_present",
]

// 快照事务：在 fn() 执行前后保存/恢复全局可变状态。
// Snapshot transaction: save/restore global mutable state before/after fn() runs.
// 注意不重赋值 G（避免破坏 exports.* 中 G=state 的原地引用约定），只就地恢复字段。
// Note it does not reassign G (avoiding breaking the in-place reference convention G=state in exports.*); it only restores fields in place.
// 引擎移动/反应生成器要求 G.active 为数值阵营；而 decide() 期间 G.active 被框架
// The engine movement/reaction generators require G.active to be a numeric faction; but during decide() G.active is restored to the
// _save 还原成 "Allies"/"Japan" 字符串。故事务内把 G.active 临时规整为数值（默认取
// "Allies"/"Japan" string by the framework _save. So inside the transaction G.active is temporarily normalized to numeric (default
// 数值 R，或显式 activeOverride），finally 里还原，绝不外泄。
// numeric R, or an explicit activeOverride), restored in finally, never leaking out.
function rules_query_snapshot(fn, activeOverride) {
    const rSaved = R
    const activeSaved = G.active
    const seed = G.seed
    const supplyCache = Array.isArray(G.supply_cache) ? G.supply_cache.slice() : G.supply_cache
    const logLen = Array.isArray(G.log) ? G.log.length : 0
    const oos = G.oos ? G.oos.slice() : G.oos
    const burmaRoad = G.burma_road
    const activeStack = G.active_stack ? G.active_stack.slice() : G.active_stack
    const location = G.location ? G.location.slice() : G.location
    const reduced = G.reduced ? G.reduced.slice() : G.reduced
    const offensive = G.offensive ? object_copy(G.offensive) : G.offensive
    const control = G.control ? object_copy(G.control) : G.control
    const nonControl = G.non_control ? object_copy(G.non_control) : G.non_control
    const lSaved = {}
    for (const k of RULES_QUERY_L_KEYS) lSaved[k] = { had: Object.prototype.hasOwnProperty.call(L, k), value: L[k] }
    let result
    try {
        if (activeOverride !== undefined) G.active = activeOverride
        else if (typeof G.active !== "number" && typeof R === "number") G.active = R
        result = fn()
    } finally {
        R = rSaved
        G.active = activeSaved
        G.seed = seed
        G.supply_cache = supplyCache
        if (Array.isArray(G.log)) G.log.length = logLen
        if (oos !== undefined) G.oos = oos
        if (burmaRoad !== undefined) G.burma_road = burmaRoad
        if (activeStack !== undefined) G.active_stack = activeStack
        if (location !== undefined) G.location = location
        if (reduced !== undefined) G.reduced = reduced
        if (offensive !== undefined) G.offensive = offensive
        if (control !== undefined) G.control = control
        if (nonControl !== undefined) G.non_control = nonControl
        for (const k of RULES_QUERY_L_KEYS) {
            if (lSaved[k].had) L[k] = lSaved[k].value
            else delete L[k]
        }
    }
    return result
}

// ============================================================================
// Tier 1 — 纯读叶子
// Tier 1 — pure-read leaf
// ============================================================================

// 该格是否存在 faction 的（非中立）ZOI。
// Whether this hex has the faction's (non-neutral) ZOI.
function queryZoi(hex, faction) {
    return !!has_zoi(hex, faction)
}

// 非中立 ZOI（区别于“经过中立 ZOI 不会被挡”）。
// Non-neutral ZOI (as opposed to "passing through neutral ZOI is not blocked").
function queryNonNeutralZoi(hex, faction) {
    return !!has_non_n_zoi(hex, faction)
}

// 地面移动一步的 MP 成本（无地面边返回 100）。
// MP cost of one ground move step (returns 100 if no ground edge).
function queryGroundMoveCost(from, to, faction) {
    return get_ground_move_cost(from, to, faction)
}

// 某单位是否在补给状态下（HQ 恒真、已激活恒真、否则看补给位）。
// Whether a unit is in supply (HQ always true, activated always true, otherwise check the supply bit).
function querySupplyStatus(unit) {
    return !!check_unit_supply(G.location[unit], unit, pieces[unit])
}

// 一组单位对某会战格的潜在战斗力合计（复用引擎 sum_combat_factor）。
// Total potential combat strength of a group of units against a battle hex (reuses engine sum_combat_factor).
function queryPotentialCombatStrength(units, battleHex) {
    return sum_combat_factor(units, battleHex)
}

// 战果表（naval / ground）roll → 命中乘数。
// Battle result table (naval / ground) roll → hit multiplier.
function queryBattleTable(kind, roll) {
    return kind === "ground" ? ground_battle_table(roll) : naval_battle_table(roll)
}

// 某格是否被 faction 控制（稳态下纯读；G.control 挂起时引擎会就地刷新 control 位）。
// Whether a hex is controlled by faction (pure read in steady state; the engine refreshes the control bit in place when G.control is pending).
function querySpaceControlled(hex, faction) {
    return is_space_controlled(hex, faction)
}

// 某格是否存在 faction 的单位（海陆空任意）。
// Whether a hex has any faction unit (naval/air/ground).
function queryFactionUnits(hex, faction) {
    return !!is_faction_units(hex, faction)
}

// 单位增援的合法部署格（友控港口/机场、有补给、无敌方非中立 ZOI、不超叠）。
// Legal deployment hexes for unit reinforcement (friendly-controlled port/airfield, in supply, no enemy non-neutral ZOI, no overstack).
function queryLegalReinforcementHexes(unit) {
    return get_unit_reinforcement_hexes(unit)
}

// 单位应急撤退的合法目的地（友控港口/机场，范围内）。
// Legal destinations for a unit's emergency retreat (friendly-controlled port/airfield, within range).
function queryEmergencyRetreatHexes(unit) {
    return get_emergency_retreat_hexes(unit)
}

// 某 HQ 可激活的单位（复用引擎精确激活区逻辑的现成快照包装）。
// Units a given HQ can activate (reuses the engine's precise activation-zone logic via a ready snapshot wrapper).
// erasmus_preview_activatable_units 自身会恢复大部分字段，但会留下 active_hq 数组
// erasmus_preview_activatable_units itself restores most fields, but leaves the active_hq array
// 被“写长”的痕迹；再包一层快照事务彻底还原 G.offensive。
// "written longer" as a trace; wrap in one more snapshot transaction to fully restore G.offensive.
function queryActivationCandidates(hq) {
    return rules_query_snapshot(() => erasmus_preview_activatable_units(hq))
}

// ============================================================================
// Tier 2 — 快照事务
// Tier 2 — snapshot transaction
// ============================================================================

// 地面单位可达格（复用引擎 get_ground_move 的 BFS）。
// Reachable hexes for a ground unit (reuses the engine get_ground_move BFS).
// 返回 { reachableHexes, costByHex, predecessor }；ctx 可给 { move_type, avoid_zoi }。
// Returns { reachableHexes, costByHex, predecessor }; ctx may provide { move_type, avoid_zoi }.
function queryGroundReachability(unit, ctx) {
    return rules_query_snapshot(() => {
        const loc = G.location[unit]
        // 地面可达性只在有实际攻势（激活卡牌）的上下文里才有意义；否则返回空。
        // Ground reachability only makes sense in a context with an actual offensive (activated card); otherwise return empty.
        if (!G.offensive || !Array.isArray(G.offensive.active_cards) || !G.offensive.active_cards[0]) {
            return { reachableHexes: [], costByHex: {}, predecessor: {} }
        }
        G.active_stack = [unit]
        L.move_type = (ctx && ctx.move_type) || ANY_MOVE
        L.move_data = get_move_data()
        const dm = get_ground_move(!!(ctx && ctx.avoid_zoi))
        const reachableHexes = []
        const costByHex = {}
        const predecessor = {}
        // get_ground_move 返回平铺 map [hex0, path0, hex1, path1, ...]；path = [cost, ...hexes, dest]
        // get_ground_move returns a flattened map [hex0, path0, hex1, path1, ...]; path = [cost, ...hexes, dest]
        for (let i = 0; i < dm.length; i += 2) {
            const hex = dm[i]
            const path = dm[i + 1]
            costByHex[hex] = path[0]
            if (path.length >= 3) predecessor[hex] = path[path.length - 2]
            if (hex !== loc) reachableHexes.push(hex)
        }
        return { reachableHexes, costByHex, predecessor }
    })
}

// 海军单位可达格（复用引擎 get_naval_move 的 BFS）。与 queryGroundReachability 同构：
// Reachable hexes for a naval unit (reuses the engine get_naval_move BFS). Same structure as queryGroundReachability:
// 快照内设 active_stack/move_type，跑 get_move_data + mark_participate_attack_hex +
// inside the snapshot set active_stack/move_type, run get_move_data + mark_participate_attack_hex +
// get_naval_move，收割可达格。返回 { reachableHexes, costByHex, predecessor }。
// get_naval_move, harvest reachable hexes. Returns { reachableHexes, costByHex, predecessor }.
function queryNavalReachability(unit, ctx) {
    return rules_query_snapshot(() => {
        const loc = G.location[unit]
        if (!G.offensive || !Array.isArray(G.offensive.active_cards) || !G.offensive.active_cards[0]) {
            return { reachableHexes: [], costByHex: {}, predecessor: {} }
        }
        G.active_stack = [unit]
        L.move_type = (ctx && ctx.move_type) || NAVAL_MOVE
        L.move_data = get_move_data()
        if (L.move_data.move_type & NAVAL_MOVE) mark_participate_attack_hex()
        const dm = get_naval_move(0)
        const reachableHexes = []
        const costByHex = {}
        const predecessor = {}
        for (let i = 0; i < dm.length; i += 2) {
            const hex = dm[i]
            const path = dm[i + 1]
            costByHex[hex] = path[0]
            if (path.length >= 3) predecessor[hex] = path[path.length - 2]
            if (hex !== loc) reachableHexes.push(hex)
        }
        return { reachableHexes, costByHex, predecessor }
    })
}

// 合法参与判定：单位能否合法参与 target 会战（只读，无副作用）。
// Legal participation check: whether a unit can legally participate in the target battle (read-only, no side effects).
//   ground: 引擎地面 BFS 可达 target，或已在 target。
//   ground: engine ground BFS can reach target, or already at target.
//   air:    战斗航程 in_range_on_map 可达（br 或延伸 ebr）。
//   air:    combat range in_range_on_map can reach (br or extended ebr).
//   naval:  引擎海军 BFS 可达 target，或已在 target。
//   naval:  engine naval BFS can reach target, or already at target.
// 返回 { legal, moveMode, path, usesExtendedRange, effectiveAttack }。
// Returns { legal, moveMode, path, usesExtendedRange, effectiveAttack }.
function queryCombatParticipation(unit, target, ctx) {
    const base = { legal: false, moveMode: null, path: null, usesExtendedRange: false, effectiveAttack: 0 }
    if (!Number.isInteger(target) || target < 0 || target > LAST_BOARD_HEX) return base
    const piece = pieces[unit]
    const loc = G.location[unit]
    if (!piece || !Number.isInteger(loc)) return base
    const cf = piece.reduced ? (Number(piece.rcf) || Math.ceil((Number(piece.cf) || 0) / 2)) : (Number(piece.cf) || 0)
    const faction = piece.faction
    if (piece.class === "ground") {
        if (loc === target) return { legal: true, moveMode: "already", path: [loc], usesExtendedRange: false, effectiveAttack: cf }
        const reach = queryGroundReachability(unit, ctx)
        const legal = reach.reachableHexes.indexOf(target) >= 0
        return { legal, moveMode: "ground", path: legal ? [loc, target] : null, usesExtendedRange: false, effectiveAttack: cf }
    }
    if (piece.class === "air") {
        const c = queryAirCombatParticipation(unit, target, ctx)
        return { legal: c.legal, moveMode: c.legal ? (c.usesExtendedRange ? "air-extended" : "air") : null,
            path: null, usesExtendedRange: c.usesExtendedRange, effectiveAttack: c.effectiveAttack }
    }
    if (piece.class === "naval") {
        if (loc === target) return { legal: true, moveMode: "already", path: [loc], usesExtendedRange: false, effectiveAttack: cf }
        const reach = queryNavalReachability(unit, ctx)
        const legal = reach.reachableHexes.indexOf(target) >= 0
        return { legal, moveMode: "naval", path: legal ? [loc, target] : null, usesExtendedRange: false, effectiveAttack: cf }
    }
    return base
}

// 航空「立即参战」判定（与转场分离，文档 §3）：只接受当前战斗航程 br/ebr 覆盖的会战格，
// Air "immediate participation" check (separated from transfer, doc §3): only accept battle hexes covered by the current combat range br/ebr,
// 不把「可转场到达」误判成「可参战」。ctx.usedExtendedRange=true 时（本攻势已用延伸航程
// not misjudging "can transfer there" as "can participate". When ctx.usedExtendedRange=true (this offensive already used extended range for
// 转场）返回 legal=false——延伸航程既用于转场，就不能再用于本攻势的攻击。
// a transfer) return legal=false — extended range used for transfer cannot be reused for this offensive's attack.
function queryAirCombatParticipation(unit, battleHex, ctx) {
    const base = { legal: false, usesExtendedRange: false, effectiveAttack: 0 }
    if (!Number.isInteger(battleHex) || battleHex < 0 || battleHex > LAST_BOARD_HEX) return base
    const piece = pieces[unit]
    const loc = G.location[unit]
    if (!piece || piece.class !== "air" || !Number.isInteger(loc)) return base
    const cf = piece.reduced ? (Number(piece.rcf) || Math.ceil((Number(piece.cf) || 0) / 2)) : (Number(piece.cf) || 0)
    const faction = piece.faction
    const br = Math.max(1, Number(piece.br) || 0)
    const ebr = Math.max(1, Number(piece.ebr) || Number(piece.br) || 0)
    const normal = in_range_on_map(loc, br, [battleHex], faction).length > 0
    const extended = ebr > br && in_range_on_map(loc, ebr, [battleHex], faction).length > 0
    if (ctx && ctx.usedExtendedRange) return { legal: false, usesExtendedRange: true, effectiveAttack: 0 }
    return { legal: normal || extended, usesExtendedRange: !normal && extended, effectiveAttack: cf }
}

// 航空转场可达性（文档 §3）：复用引擎 compute_air_move_hexes 的多段 leg BFS（A→B→C 沿机场链），
// Air transfer reachability (doc §3): reuses the engine compute_air_move_hexes multi-leg BFS (A→B→C along the airfield chain),
// 与「立即参战」分离。返回 { reachableHexes, costByHex, predecessor }，reachableHexes 为本攻势
// separated from "immediate participation". Returns { reachableHexes, costByHex, predecessor }; reachableHexes is the set within the current offensive
// 内该航空单位可转场到达的友控机场格集合。默认 STRAT_MOVE（多段 + 允许延伸航程 + 2×leg）。
// of friendly-controlled airfield hexes this air unit can transfer to. Default STRAT_MOVE (multi-leg + extended range allowed + 2×leg).
function queryAirTransferReachability(unit, ctx) {
    const piece = pieces[unit]
    const loc = G.location[unit]
    if (!piece || piece.class !== "air" || !Number.isInteger(loc)) {
        return { reachableHexes: [], costByHex: {}, predecessor: {} }
    }
    return rules_query_snapshot(() => {
        if (!G.offensive || !Array.isArray(G.offensive.active_cards) || !G.offensive.active_cards[0]) {
            return { reachableHexes: [], costByHex: {}, predecessor: {} }
        }
        R = piece.faction
        G.active_stack = [unit]
        L.move_type = (ctx && ctx.move_type) || STRAT_MOVE
        L.move_data = get_move_data()
        if (!Array.isArray(G.offensive.battle_hexes)) G.offensive.battle_hexes = []
        compute_air_move_hexes()
        const reachableHexes = []
        const costByHex = {}
        const predecessor = {}
        for (let i = 0; i < L.allowed_hexes.length; i += 2) {
            const hex = L.allowed_hexes[i]
            const path = L.allowed_hexes[i + 1]
            reachableHexes.push(hex)
            if (path && path.length >= 3) predecessor[hex] = path[path.length - 2]
        }
        return { reachableHexes, costByHex, predecessor }
    }, piece.faction)
}

// 反应候选：反应方 reactFaction 对当前（或注入的 targetHex）会战格能合法反应的部队，
// Reaction candidates: units of the reacting side reactFaction that can legally react to the current (or injected targetHex) battle hex,
// 按兵种分类成 { air, carrier, naval, ground, hq, specialReaction }。
// classified by arm into { air, carrier, naval, ground, hq, specialReaction }.
function queryReactionCandidates(opts) {
    const reactionFaction = opts && opts.reactionFaction !== undefined ? opts.reactionFaction : (1 - R)
    const targetHex = opts && opts.targetHex
    return rules_query_snapshot(() => {
        if (!G.offensive || !Array.isArray(G.offensive.battle_hexes)) {
            return { air: [], carrier: [], naval: [], ground: [], hq: [], specialReaction: [] }
        }
        const prevR = R
        R = reactionFaction
        if (targetHex !== undefined && targetHex !== null) {
            // 把假设目标临时并入会战格集合，供反应格标记使用（快照会恢复）。
            // Temporarily merge the hypothetical target into the battle-hex set for reaction-hex marking (the snapshot restores it).
            if (!set_has(G.offensive.battle_hexes, targetHex)) set_add(G.offensive.battle_hexes, targetHex)
        }
        L.reaction_able_units = []
        L.asp_ground_units = []
        L.cv_reaction_hex_map = []
        L.air_reaction_hex_map = []
        get_reaction_able_units()
        const air = []
        const carrier = []
        const naval = []
        const ground = []
        for_each_unit_on_map((u, piece) => {
            if (piece.faction !== reactionFaction) return
            const reactionAble = set_has(L.reaction_able_units, u) || set_has(L.asp_ground_units, u)
            if (piece.class === "air") {
                if (is_air_reaction_able(u)) air.push(u)
            } else if (is_cv_unit(piece)) {
                if (reactionAble || is_cv_reaction_able(u)) carrier.push(u)
            } else if (piece.class === "naval") {
                if (reactionAble) naval.push(u)
            } else if (piece.class === "ground") {
                if (reactionAble) ground.push(u)
            }
        })
        R = prevR
        return { air, carrier, naval, ground, hq: [], specialReaction: [] }
    }, reactionFaction)
}

// 反应候选强度合计（空海 + 地面），供 potentialReactionStrength 使用。
// Total reaction candidate strength (air/naval + ground), used by potentialReactionStrength.
function queryReactionStrength(opts) {
    const c = queryReactionCandidates(opts)
    const battleHex = opts && opts.battleHex
    const all = c.air.concat(c.carrier, c.naval, c.ground)
    return sum_combat_factor(all, battleHex)
}

// 特殊反应资格：目标是否为反应方可掷“特殊反应”骰的潜在 SR 格。
// Special reaction eligibility: whether the target is a potential SR hex where the reacting side can roll the "special reaction" die.
// 忠实复用 P.special_reaction._begin 的逐格资格判定：命名格 + 反应方 ZOI +
// Faithfully reuses P.special_reaction._begin's per-hex eligibility check: named hex + reacting-side ZOI +
// 反应方某 HQ 指挥范围内。返回 { eligible, reason, respondingHq, legalUnits }。
// within command range of some reacting-side HQ. Returns { eligible, reason, respondingHq, legalUnits }.
function querySpecialReaction(opts) {
    const reactingFaction = (opts && opts.reactingFaction !== undefined)
        ? opts.reactingFaction : (1 - (G.offensive ? G.offensive.attacker : R))
    const target = opts && opts.target
    return rules_query_snapshot(() => {
        if (target === null || target === undefined || !Number.isInteger(target)) {
            return { eligible: false, reason: "no-target", respondingHq: null, legalUnits: [] }
        }
        const md = get_map_data(target)
        if (!md || !md.named) return { eligible: false, reason: "not-named", respondingHq: null, legalUnits: [] }
        if (!has_zoi(target, reactingFaction)) return { eligible: false, reason: "no-zoi", respondingHq: null, legalUnits: [] }
        let respondingHq = null
        for_each_unit_on_map((u, piece) => {
            if (respondingHq !== null) return
            if (piece.faction === reactingFaction && piece.class === "hq"
                && in_range_on_map(G.location[u], piece.cr, [target], reactingFaction).length) {
                respondingHq = u
            }
        })
        return respondingHq !== null
            ? { eligible: true, reason: null, respondingHq, legalUnits: [] }
            : { eligible: false, reason: "out-of-range", respondingHq: null, legalUnits: [] }
    })
}

// 神风攻击标准 (清单 #14)：镜像引擎 set_kamikaze_able_battles + kamikaze_attack._begin 的
// Kamikaze attack standard (list #14): mirrors the engine set_kamikaze_able_battles + kamikaze_attack._begin
// 合法资格，不靠卡牌名/单位名正则。返回 { met, legalCapitalShipTargets, eligibleAirUnits }。
// legality, not relying on card-name/unit-name regex. Returns { met, legalCapitalShipTargets, eligibleAirUnits }.
//   legalCapitalShipTargets —— 可被神风命中的盟军已承诺海军单位(BB/CV 等, 在神风战斗格内)。
//   legalCapitalShipTargets — Allied committed naval units (BB/CV etc., within a kamikaze battle hex) that can be hit by kamikaze.
//   eligibleAirUnits        —— 可承担减损、ebr 能打到神风战斗格的日军航空单位。
//   eligibleAirUnits        — Japanese air units that can absorb step losses and whose ebr can reach a kamikaze battle hex.
// battleHex 注入时只判该格；否则按引擎口径求全部神风战斗格(距东京≤11 且盟军海军已承诺)。
// When battleHex is injected, only that hex is judged; otherwise all kamikaze battle hexes are computed per the engine (distance to Tokyo ≤11 and Allied naval committed).
function queryKamikazeStandard(battleHex) {
    return rules_query_snapshot(() => {
        const empty = { met: false, legalCapitalShipTargets: [], eligibleAirUnits: [] }
        if (!G.offensive || !Array.isArray(G.offensive.battle_hexes)) return empty
        const apCommittedNaval = new Set()
        ;(Array.isArray(G.offensive.active_units?.[AP]) ? G.offensive.active_units[AP] : []).forEach(u => {
            const p = pieces[u]
            if (p && p.faction === AP && p.class === "naval" && unit_on_board(u)) {
                apCommittedNaval.add(get_unit_battle_hex(u))
            }
        })
        let battles
        if (battleHex !== undefined && battleHex !== null && Number.isInteger(battleHex)) {
            battles = [battleHex]
        } else {
            battles = G.offensive.battle_hexes.filter(h => get_distance(h, TOKYO) <= 11 && apCommittedNaval.has(h))
        }
        if (!battles.length) return empty
        const eligibleAirUnits = []
        for_each_unit_on_map((u, piece, loc) => {
            if (piece.faction === JP && piece.class === "air" && in_range_on_map(loc, piece.ebr, battles, JP).length) {
                eligibleAirUnits.push(u)
            }
        })
        const legalCapitalShipTargets = []
        ;(Array.isArray(G.offensive.active_units?.[AP]) ? G.offensive.active_units[AP] : []).forEach(u => {
            const p = pieces[u]
            if (!p || p.faction !== AP || p.class !== "naval" || !unit_on_board(u)) return
            if (battles.indexOf(get_unit_battle_hex(u)) >= 0) legalCapitalShipTargets.push(u)
        })
        return { met: legalCapitalShipTargets.length > 0 && eligibleAirUnits.length > 0, legalCapitalShipTargets, eligibleAirUnits }
    })
}

// 潜艇合法目标 (清单 #15)：RTT 给出"能合法受潜艇打击"的敌方海军单位(镜像
// Submarine legal targets (list #15): RTT returns enemy naval units "legally subject to submarine attack" (mirroring
// P.submarine_attack._begin 的 allowed_units 口径)，Erasmus 决策层再按 CV→BB→CA→DD 排序。
// P.submarine_attack._begin's allowed_units scope); the Erasmus decision layer then sorts them CV→BB→CA→DD.
// 返回 { legalTargets }，每项为 { id, type, lf, cf, name, reduced }。
// Returns { legalTargets }, each entry { id, type, lf, cf, name, reduced }.
function querySubmarineTargets(opts) {
    const attackerFaction = (opts && opts.attackerFaction !== undefined)
        ? opts.attackerFaction : (G.offensive ? G.offensive.attacker : 1 - R)
    return rules_query_snapshot(() => {
        const legalTargets = []
        if (!G.offensive || !Array.isArray(G.offensive.active_units)) return { legalTargets }
        ;(G.offensive.active_units[attackerFaction] || []).forEach(u => {
            const p = pieces[u]
            if (!p || p.class !== "naval" || !unit_on_board(u) || set_has(G.reduced, u)) return
            legalTargets.push({ id: u, type: p.type || null, lf: Number(p.lf) || 0, cf: Number(p.cf) || 0, name: p.name || p.id || String(u), reduced: false })
        })
        return { legalTargets }
    })
}

// PBM 合法落点 (清单 #16/#17/#18)：快照内设 active_stack/move_type、暂切 POST_BATTLE_STAGE，
// PBM legal destinations (list #16/#17/#18): inside the snapshot set active_stack/move_type, temporarily switch POST_BATTLE_STAGE,
// 跑引擎 update_move_hex() 后收割 L.allowed_hexes。Erasmus 只在这些合法格上做图表优先级排序。
// run the engine update_move_hex() then harvest L.allowed_hexes. Erasmus only sorts these legal hexes by chart priority.
function queryPbmDestinations(unit, ctx) {
    return rules_query_snapshot(() => {
        const piece = pieces[unit]
        const loc = G.location[unit]
        if (!piece || !Number.isInteger(loc) || !G.offensive || !Array.isArray(G.offensive.active_cards) || !G.offensive.active_cards[0]) {
            return []
        }
        G.active_stack = [unit]
        L.move_type = (ctx && ctx.move_type) || (piece.class === "air" ? AIR_MOVE : piece.class === "naval" ? NAVAL_MOVE : ANY_MOVE)
        const stageSaved = G.offensive.stage
        G.offensive.stage = POST_BATTLE_STAGE
        try {
            update_move_hex()
        } finally {
            G.offensive.stage = stageSaved
        }
        const dm = L.allowed_hexes
        const hexes = []
        for (let i = 0; i < dm.length; i += 2) hexes.push(dm[i])
        return hexes
    })
}

// ============================================================================
// 测试/工具分发
// Test/tool dispatch
// ============================================================================

const RULES_QUERY_FNS = [
    "queryZoi", "queryNonNeutralZoi", "queryGroundMoveCost", "querySupplyStatus",
    "queryPotentialCombatStrength", "queryBattleTable", "querySpaceControlled",
    "queryFactionUnits", "queryLegalReinforcementHexes", "queryEmergencyRetreatHexes",
    "queryActivationCandidates", "queryGroundReachability", "queryNavalReachability",
    "queryCombatParticipation", "queryAirCombatParticipation", "queryAirTransferReachability",
    "queryReactionCandidates",
    "queryReactionStrength", "querySpecialReaction",
    "queryKamikazeStandard", "querySubmarineTargets", "queryPbmDestinations",
]

function rules_query_dispatch(q) {
    if (!q || typeof q !== "object") return null
    const fn = q.fn || q.query
    const impl = {
        queryZoi, queryNonNeutralZoi, queryGroundMoveCost, querySupplyStatus,
        queryPotentialCombatStrength, queryBattleTable, querySpaceControlled,
        queryFactionUnits, queryLegalReinforcementHexes, queryEmergencyRetreatHexes,
        queryActivationCandidates, queryGroundReachability, queryNavalReachability,
        queryCombatParticipation, queryAirCombatParticipation, queryAirTransferReachability,
        queryReactionCandidates,
        queryReactionStrength, querySpecialReaction,
        queryKamikazeStandard, querySubmarineTargets, queryPbmDestinations,
    }
    if (typeof impl[fn] !== "function") return null
    const args = q.args || q.params
    return impl[fn].apply(null, Array.isArray(args) ? args : [])
}
