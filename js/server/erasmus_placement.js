// CDSS 增援/补员落位 —— 从 erasmus_state.js 抽离(解耦: 单文件过大)。
// CDSS reinforcement/replacement placement — extracted from erasmus_state.js (decoupling: the single file was too large).
// 函数: esm_reinf_window / esm_enemy_locs / esm_min_dist / esm_pick_nearest / esm_hq_home /
// Functions: esm_reinf_window / esm_enemy_locs / esm_min_dist / esm_pick_nearest / esm_hq_home /
//   esm_placement_score / esm_ap_forward_focus / esm_is_cbi_hex / esm_pick_placement /
//   esm_placement_score / esm_ap_forward_focus / esm_is_cbi_hex / esm_pick_placement /
//   esm_pick_replacement_unit
//   esm_pick_replacement_unit
// ===========================================================================
// CDSS「增援或补员阶段」落位 (顺序 L157-187) —— zh.7 补全
// CDSS "reinforcement or replacement phase" placement (order L157-187) — zh.7 completion
// 此前增援/补员落位走通用 action_hex/unit 散打(就近焦点或随机散打), 未实现 CDSS
// Previously reinforcement/replacement placement went through the generic action_hex/unit scatter (nearest focus or random scatter), not implementing the CDSS
// 优先级, 是盟军迟迟无法集中兵力/把 B29 摆进轰炸基地的主因之一。核心原则(L159):
// priority; a main cause of the Allies' inability to concentrate forces / place B29s into bombing bases. Core principle (L159):
// 单位"尽可能靠近敌人"; 指挥部有指定母港; B29 有专门基地规则(L187)。
// units "as close to the enemy as possible"; HQs have a designated home port; B29s have dedicated base rules (L187).
// 本区只读引擎状态(G/pieces/map), 不触碰 RNG, 纯确定性打分。
// This section only reads engine state (G/pieces/map), never touches RNG, purely deterministic scoring.
// ===========================================================================

// 增援/补员窗口识别 -> "reinf"(增援落位) | "repl_unit"(选补员单位) | "repl_place"(补员落位) | null
// Reinforcement/replacement window recognition -> "reinf"(reinforcement placement) | "repl_unit"(select replacement unit) | "repl_place"(replacement placement) | null
function esm_reinf_window(view) {
    const p = String((view && view.prompt) || "")
    if (/as a reinforcement/i.test(p)) return "reinf"
    if (/choose unit to reinforce/i.test(p)) return "repl_unit"
    if (/choose hex to place/i.test(p)) return "repl_place"
    return null
}

// 一次性收集"敌方单位落点"(地面/任意), 供就近打分; for_each_unit_on_map 不可用时回空。
// Collect "enemy unit locations" (ground/any) in one pass for proximity scoring; returns empty when for_each_unit_on_map is unavailable.
function esm_enemy_locs(faction) {
    const enemy = 1 - faction
    const ground = [], any = []
    try {
        for_each_unit_on_map((u, piece, loc) => {
            if (piece.faction === enemy) {
                any.push(loc)
                if (piece.class === "ground") ground.push(loc)
            }
        })
    } catch (e) { /* 引擎未提供该迭代器时退化为无敌方信息 / no enemy info when the engine lacks this iterator */ }
    return { ground, any }
}

function esm_min_dist(hex, locs) {
    let best = 999
    for (let i = 0; i < locs.length; i++) {
        const d = get_distance(hex, locs[i])
        if (d < best) best = d
    }
    return best
}

// 在 candidates 内取 scoreFn 最小者(并列取小 hex), 无候选回 undefined。
// In candidates, pick the one minimizing scoreFn (ties pick the smaller hex); returns undefined when no candidates.
function esm_pick_nearest(candidates, scoreFn) {
    let best = null, bestS = Infinity
    for (let i = 0; i < candidates.length; i++) {
        const h = candidates[i]
        const s = scoreFn(h)
        if (s < bestS || (s === bestS && (best === null || h < best))) { bestS = s; best = h }
    }
    return best
}

// 盟军指挥部 CDSS 母港(L179): SWPac->澳大利亚, CPac->瓦胡岛, ANZAC->莫尔兹比港/澳,
// Allied HQ CDSS home ports (L179): SWPac->Australia, CPac->Oahu, ANZAC->Port Moresby/Australia,
// SPac( Ghormley/Halsey )->新几内亚/肯达里/努美阿, SEAC->加尔各答。日军回 null(用最近东京)。
// SPac (Ghormley/Halsey)->New Guinea/Kendari/Noumea, SEAC->Calcutta. Japan returns null (use nearest Tokyo).
// 马来亚/ABDA 不在此列(notreplaceable 原地)。
// Malaya/ABDA are not listed here (non-replaceable, stay in place).
function esm_hq_home(piece) {
    const homes = {
        hq_ap_c: ["Oahu"],
        hq_ap_sw: ["Townsville", "Darwin"],            // 澳大利亚(东北澳港) / Australia (NE Australia ports)
        hq_ap_sg: ["Port Moresby", "Kendari"],         // 南太平洋(新几内亚/肯达里) / South Pacific (New Guinea/Kendari)
        hq_ap_sh: ["Port Moresby", "Kendari"],
        hq_ap_anzac: ["Port Moresby", "Townsville"],   // 莫尔兹比港/澳大利亚 / Port Moresby/Australia
        hq_ap_seac: ["Calcutta"],
    }
    const names = homes[piece.id]
    if (!names) return null
    for (let i = 0; i < names.length; i++) {
        const idx = eop_resolve_token(names[i])
        if (idx !== null) return idx
    }
    return null
}

// CDSS 落位打分: 对候选格 h 给越小越优的分值。
// CDSS placement scoring: assign each candidate hex h a score where lower is better.
function esm_placement_score(h, piece, enemy) {
    const md = get_map_data(h)
    const isPort = !!(md && md.port)
    const isAirfield = !!(md && md.airfield)
    if (piece.class === "ground") {
        // L171/184: 地面 -> 离敌人(地面)最近的港口(候选已被引擎滤成港口)。
        // L171/184: ground -> nearest port to enemy (ground); candidates are already filtered to ports by the engine.
        const d = enemy.ground.length ? esm_min_dist(h, enemy.ground) : (enemy.any.length ? esm_min_dist(h, enemy.any) : 0)
        return (isPort ? 0 : 50) * 1000 + d * 10
    }
    if (piece.class === "air") {
        // L169/183: 空中 -> 离敌 AZOI(用离敌任意单位近似)最近的港口, 后机场。
        // L169/183: air -> nearest port to enemy AZOI (approximated by nearest enemy unit), then airfield.
        const d = enemy.any.length ? esm_min_dist(h, enemy.any) : 0
        return (isPort ? 0 : isAirfield ? 1 : 50) * 1000 + d * 10
    }
    if (piece.class === "naval") {
        // L182: 海军 -> 港口, 靠近指挥部(用离敌最近近似 = 前线)。
        // L182: naval -> port, near the HQ (approximated by nearest enemy = frontline).
        const d = enemy.any.length ? esm_min_dist(h, enemy.any) : 0
        return (isPort ? 0 : 50) * 1000 + d * 10
    }
    const d = enemy.any.length ? esm_min_dist(h, enemy.any) : 0
    return d * 10
}

function esm_ap_forward_focus() {
    try {
        if (typeof eop_focus === "function") {
            const h = eop_focus("Allies")
            if (Number.isInteger(h) && h >= 0 && h <= LAST_BOARD_HEX) return h
        }
    } catch (e) { /* 无已钉住战略时沿用通常落位 / keep normal placement when no strategy is pinned */ }
    return null
}

function esm_is_cbi_hex(h) {
    const md = get_map_data(h) || {}
    return /^(India|Burma|China)$/i.test(String(md.region || ""))
}

// CDSS 增援/补员落位入口: 在 candidates(引擎已滤成合法落点)内挑 CDSS 优先级最优者。
// CDSS reinforcement/replacement placement entry: among candidates (already filtered by the engine to legal hexes), pick the best by CDSS priority.
function esm_pick_placement(candidates, role, unit, piece) {
    if (!Array.isArray(candidates) || !candidates.length) return undefined
    if (!piece) return esm_pick_nearest(candidates, h => h)   // 无单位信息: 回最小 hex(稳定) / no unit info: fall back to smallest hex (stable)
    const faction = piece.faction === JP ? JP : AP

    // B29 (盟军优先#5 / L187): 距东京<=8 港口/机场 -> 中国盒 -> 最近东京港口/机场。
    // B29 (Allied priority #5 / L187): port/airfield within 8 of Tokyo -> China Box -> nearest port/airfield to Tokyo.
    if (piece.b29) {
        return esm_pick_nearest(candidates, h => {
            if (h === CHINA_BOX) return 100
            const md = get_map_data(h)
            const base = !!(md && (md.airfield || md.port))
            const d = get_distance(h, TOKYO)
            if (base && d <= 8) return d          // 最优: 距东京<=8 基地 / best: base within 8 of Tokyo
            if (base) return 200 + d               // 次优: 最近基地 / second best: nearest base
            return 400 + d                         // 兜底: 无基地 / fallback: no base
        })
    }

    // 指挥部: 盟军 -> 指定母港; 日军 -> 最近东京(初始位置近似)。
    // HQ: Allies -> designated home port; Japan -> nearest Tokyo (approximate initial position).
    if (piece.class === "hq") {
        const home = esm_hq_home(piece)
        const ref = home !== null ? home : TOKYO
        return esm_pick_nearest(candidates, h => get_distance(h, ref))
    }

    const enemy = esm_enemy_locs(faction)
    // 美国海军补员过去按“离任意敌军最近的港口”落位。缅甸地面战线密集，导致
    // US Navy replacements used to place at "the port nearest any enemy unit". The dense Burma ground front caused
    // 航母群被吸到仰光，既不符合中/南太平洋 CDSS 主轴，也很难再参与夺岛。
    // carrier groups to be pulled to Rangoon, neither matching the Central/South Pacific CDSS axis nor able to rejoin island captures.
    // 美国海军只在当前战略确实以 CBI 为焦点时进入 CBI；其余时候优先当前图表
    // US Navy only enters CBI when the current strategy truly focuses on CBI; otherwise prefer non-CBI ports near the current chart
    // 焦点附近的非 CBI 港。英联邦舰队仍可按原规则支援印度/缅甸。
    // focus. Commonwealth fleets still support India/Burma under the original rule.
    if (faction === AP && piece.class === "naval" && piece.rptype === "us_navy") {
        const focus = esm_ap_forward_focus()
        const focusIsCbi = focus !== null && esm_is_cbi_hex(focus)
        return esm_pick_nearest(candidates, h => {
            const md = get_map_data(h) || {}
            const theaterPenalty = !focusIsCbi && esm_is_cbi_hex(h) ? 100000 : 0
            const portPenalty = md.port ? 0 : 50000
            const focusDistance = focus !== null ? get_distance(h, focus) : esm_min_dist(h, enemy.any)
            return theaterPenalty + portPenalty + focusDistance * 100 + h
        })
    }
    return esm_pick_nearest(candidates, h => esm_placement_score(h, piece, enemy))
}

// CDSS 补员选择(L161,185-186): 优先恢复被消灭部队(放回地图), 再翻正减损; 同类选最强战力。
// CDSS replacement selection (L161,185-186): prefer restoring eliminated units (back to map), then flipping reduced units upright; within a class pick the strongest.
function esm_pick_replacement_unit(candidates, role) {
    if (!Array.isArray(candidates) || !candidates.length) return undefined
    const cf = u => { try { const p = pieces[u]; return Number((p && (p.cf || p.lf || p.rcf)) || 0) } catch (e) { return 0 } }
    const isElim = u => { try { return G.location[u] === ELIMINATED_BOX } catch (e) { return false } }
    const isReduced = u => { try { return set_has(G.reduced, u) } catch (e) { return false } }
    const score = u => {
        const cat = isElim(u) ? 0 : isReduced(u) ? 1 : 2
        return cat * 100000 - cf(u) * 100 + u   // 类别优先; 同类内战力高(负号→大到小), u 作稳定 tie / category first; higher combat strength within class (minus → descending), u as stable tiebreak
    }
    return candidates.slice().sort((a, b) => score(a) - score(b))[0]
}
